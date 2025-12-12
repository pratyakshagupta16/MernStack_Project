import { useState } from "react";
import { addMedicine } from "../api/medicineService";

export default function AddMedicineForm({ onAdded }) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("");

  // Repeat settings
  const [repeatType, setRepeatType] = useState("daily");
  const [repeatDays, setRepeatDays] = useState([]);

  const showToast = (message, type = "error") =>
    window.dispatchEvent(new CustomEvent("toast", { detail: { message, type } }));

  const toggleDay = (day) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // local validation
    if (!name || !time) {
      showToast("Name and time are required", "error");
      return;
    }

    // ensure token present
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to add medicines", "error");
      return;
    }

    let repeatValue = "daily";
    if (repeatType === "none") repeatValue = "none";
    if (repeatType === "specific") repeatValue = repeatDays;

    const newMedicine = {
      name,
      dose,
      schedules: [{ time, repeat: repeatValue }],
    };

    try {
      const res = await addMedicine(newMedicine);
      // axios returns response.data
      showToast("Medicine added", "success");

      setName("");
      setDose("");
      setTime("");
      setRepeatType("daily");
      setRepeatDays([]);

      if (onAdded) onAdded();
    } catch (err) {
      console.error("Add med error:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.msg || "Failed to add medicine";
      showToast(msg, "error");
    }
  };

  return (
    <form id="add-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Medicine name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Dose (e.g. 1 pill)" value={dose} onChange={(e) => setDose(e.target.value)} />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

      <label style={{ marginTop: "10px", fontWeight: "600" }}>Repeat Schedule:</label>
      <select value={repeatType} onChange={(e) => setRepeatType(e.target.value)} style={{ padding: "10px", borderRadius: "10px" }}>
        <option value="daily">Daily</option>
        <option value="specific">Specific Days</option>
        <option value="none">One-Time Only</option>
      </select>

      {repeatType === "specific" && (
        <div style={{ marginTop: "10px" }}>
          {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
            <button key={day} type="button" onClick={() => toggleDay(day)} style={{
              margin: "3px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc",
              background: repeatDays.includes(day) ? "#31c96e" : "#eee", color: repeatDays.includes(day) ? "white" : "#333", cursor: "pointer"
            }}>{day.toUpperCase()}</button>
          ))}
        </div>
      )}

      <button type="submit" style={{ marginTop: "15px" }}>Add Medicine</button>
    </form>
  );
}
