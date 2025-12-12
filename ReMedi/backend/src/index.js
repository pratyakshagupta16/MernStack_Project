require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');

const sendEmail = require('./utils/sendEmail');
const cron = require('node-cron');
const Medicine = require('./models/Medicine');
const shouldRepeatToday = require('./utils/repeatCheck');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);


cron.schedule('* * * * *', async () => {
  try {
    console.log('⏱ Running reminder check...');
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const oneHourAgo = new Date(now.getTime() - 60 * 60000)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // only fetch docs with userId to avoid validation problems
    const meds = await Medicine.find({ userId: { $exists: true } });

    for (const med of meds) {
      let changed = false;
      for (const sched of med.schedules) {
        if (!shouldRepeatToday(sched)) continue;

        if (sched.time === currentTime && !sched.taken) {
          console.log(`🔔 Reminder: Take ${med.name} at ${sched.time}`);
          if (process.env.EMAIL_USER) {
            await sendEmail(
              process.env.EMAIL_USER,
              '⏰ Medicine Reminder',
              `It is time to take <b>${med.name}</b> scheduled at <b>${sched.time}</b>.`
            );
          }
        }

        if (sched.time === oneHourAgo && !sched.taken && !sched.missed) {
          sched.missed = true;
          sched.missedAt = new Date();
          changed = true;
          console.log(`⚠ MISSED: ${med.name} at ${sched.time}`);
        }
      }
      if (changed) {
        await med.save();
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
