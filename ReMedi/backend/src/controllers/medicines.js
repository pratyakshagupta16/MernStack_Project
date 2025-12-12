const Medicine = require('../models/Medicine');

// Get all medicines (user-specific)

exports.getAll = async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(meds);
  } catch (error) {
    console.error("getAll error:", error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};

// Create new medicine

exports.create = async (req, res) => {
  try {
    const { name, dose, notes, schedules } = req.body;

    if (!name || !schedules || schedules.length === 0) {
      return res.status(400).json({ error: "Name and at least one schedule required" });
    }

    const med = new Medicine({
      userId: req.userId,   
      name,
      dose,
      notes,
      schedules
    });

    await med.save();
    res.status(201).json(med);
  } catch (error) {
    console.error("create error:", error);
    res.status(400).json({ error: 'Failed to add medicine' });
  }
};

// Update medicine

exports.update = async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, 
      req.body,
      { new: true }
    );

    if (!med) return res.status(404).json({ error: "Medicine not found" });

    res.json(med);
  } catch (error) {
    console.error("update error:", error);
    res.status(400).json({ error: 'Failed to update medicine' });
  }
};

// Delete medicine

exports.remove = async (req, res) => {
  try {
    const deleted = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId  
    });

    if (!deleted) return res.status(404).json({ error: "Medicine not found" });

    res.status(204).send();
  } catch (error) {
    console.error("remove error:", error);
    res.status(400).json({ error: 'Failed to delete medicine' });
  }
};

// Mark dose as taken

exports.markTaken = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    const med = await Medicine.findOne({
      _id: req.params.id,
      userId: req.userId  
    });

    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const schedule = med.schedules.id(scheduleId);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    schedule.taken = true;
    schedule.takenAt = new Date();

    await med.save();
    res.json(med);
  } catch (error) {
    console.error("markTaken error:", error);
    res.status(400).json({ error: 'Failed to mark as taken' });
  }
};
