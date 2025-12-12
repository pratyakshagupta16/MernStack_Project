import { useState, useEffect } from "react";
import AddMedicineForm from "./components/AddMedicineForm";
import MedicineList from "./components/MedicineList";
import Toast from "./components/Toast";
import DashboardSummary from "./components/DashboardSummary";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [medicineData, setMedicineData] = useState([]);
  const [snoozeList, setSnoozeList] = useState([]);
  const [blink, setBlink] = useState(false);
  const [missedDoses, setMissedDoses] = useState([]);
  const [view, setView] = useState("home");

  const [weeklyStats, setWeeklyStats] = useState(
    Array(7).fill({ taken: 0, missed: 0, total: 0 })
  );

  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Proper signup event listener
  useEffect(() => {
    const openSignup = () => setShowSignup(true);
    window.addEventListener("openSignup", openSignup);

    return () => window.removeEventListener("openSignup", openSignup);
  }, []);

  const playSound = () => {
    const audio = new Audio("/alert.mp3");
    audio.play();
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toast listener
  useEffect(() => {
    const handler = (e) => showToast(e.detail.message, e.detail.type);
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  // Browser permission
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  const shouldRepeatToday = (schedule) => {
    if (!schedule.repeat) return true;

    const today = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
      new Date().getDay()
    ];

    if (schedule.repeat === "daily") return true;
    if (Array.isArray(schedule.repeat) && schedule.repeat.includes(today))
      return true;

    return false;
  };

  // Reminder engine
  useEffect(() => {
    const checkReminders = () => {
      if (!medicineData.length) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const oneHourLater = new Date(now.getTime() - 60 * 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      medicineData.forEach((med) => {
        med.schedules.forEach((sched) => {
          if (!shouldRepeatToday(sched)) return;

          const isSnoozed = snoozeList.some(
            (s) => s.medicineId === med._id && s.time === currentTime
          );

          if ((sched.time === currentTime || isSnoozed) && !sched.taken) {
            if (Notification.permission === "granted") {
              new Notification("Medicine Reminder", {
                body: `${med.name} — ${sched.time}`,
              });
            }

            playSound();
            alert(`Time to take: ${med.name} (${sched.time})`);

            setBlink(true);
            setTimeout(() => setBlink(false), 4000);

            showToast(`Time for ${med.name}`, "warning");

            // Snooze in 10 minutes
            const snoozeTime = new Date(now.getTime() + 10 * 60000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            setSnoozeList((prev) => [
              ...prev,
              { medicineId: med._id, time: snoozeTime },
            ]);
          }

          if (sched.time === oneHourLater && !sched.taken) {
            setMissedDoses((prev) => [
              ...prev,
              { med: med.name, time: sched.time },
            ]);
            showToast(`You missed a dose: ${med.name}`, "error");
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [medicineData, snoozeList]);

  // Weekly stats
  useEffect(() => {
    const today = new Date().getDay();

    const todayStats = {
      taken: medicineData.reduce(
        (sum, med) => sum + med.schedules.filter((s) => s.taken).length,
        0
      ),
      missed: missedDoses.length,
      total: medicineData.reduce((sum, med) => sum + med.schedules.length, 0),
    };

    setWeeklyStats((prev) => {
      const updated = [...prev];
      updated[today] = todayStats;
      return updated;
    });
  }, [medicineData, missedDoses]);

  // Dark mode
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <h1>ReMedi — Login</h1>

        <Login
          onSuccess={() => {
            setIsLoggedIn(true);
            showToast("Login successful!", "success");
          }}
        />

        {showSignup && (
          <Signup
            onSuccess={() => {
              setShowSignup(false);
              setIsLoggedIn(true);
              showToast("Account created!", "success");
            }}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  // MAIN APP UI
  return (
    <div className="app-container">
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          background: "red",
          color: "white",
          padding: "8px 12px",
          borderRadius: "10px",
        }}
      >
        Logout
      </button>

      <div className="header-card">
        <h2> 
          Hello, {localStorage.getItem("userName") || "User"} 👋 {blink && <span className="blink-icon">🔔</span>}
        </h2>
        <p>Welcome back! Stay on track with your medicines.</p>

        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          className="fab-button"
          onClick={() =>
            document.getElementById("add-form")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          +
        </button>

        <button
          style={{ marginLeft: "10px", padding: "10px" }}
          onClick={() => setView(view === "home" ? "weekly" : "home")}
        >
          {view === "home" ? "📅 Weekly View" : "🏠 Home"}
        </button>
      </div>

      {view === "home" ? (
        <>
          <DashboardSummary data={medicineData} />

          <AddMedicineForm
            onAdded={() => {
              window.dispatchEvent(new CustomEvent("medicineAdded"));
              showToast("Medicine added!", "success");
            }}
          />

          <MedicineList onData={setMedicineData} />
        </>
      ) : (
        <div className="weekly-view">
          <h2>📅 Weekly Summary</h2>
          {weeklyStats.map((day, i) => (
            <div className="medicine-card" key={i}>
              <h3>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</h3>
              <p>✔ Taken: {day.taken}</p>
              <p>❌ Missed: {day.missed}</p>
              <p>📌 Total Doses: {day.total}</p>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
