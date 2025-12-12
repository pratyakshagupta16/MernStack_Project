import { useState } from "react";
import { markTaken, deleteMedicine } from "../api/medicineService";
import EditMedicineModal from "./EditMedicineModal"; 

export default function MedicineItem({ medicine, onUpdated }) {
  const [showEdit, setShowEdit] = useState(false);

  // MARK TAKEN
  const handleMarkTaken = async (scheduleId) => {
    await markTaken(medicine._id, scheduleId);
    onUpdated("taken");
  };

  // DELETE MEDICINE
 
  const handleDelete = async () => {
    if (!confirm("Delete this medicine?")) return;

    await deleteMedicine(medicine._id); 
    onUpdated("deleted");
  };

  // REPEAT FORMATTER
  const formatRepeat = (repeat) => {
    if (!repeat) return "Daily";
    if (repeat === "daily") return "Daily";
    if (repeat === "none") return "One-Time";
    if (Array.isArray(repeat)) return repeat.join(", ").toUpperCase();
    return "Daily";
  };

  return (
    <div className="medicine-card">
      <h3>
        <span className="material-icons" style={{ verticalAlign: "middle" }}>
          medication
        </span>
        &nbsp; {medicine.name}
      </h3>

      {/* EDIT & DELETE BUTTONS */}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        {/* EDIT BUTTON */}
        <span
          className="material-icons"
          style={{ cursor: "pointer", color: "#4a90e2" }}
          onClick={() => setShowEdit(true)}
        >
          edit
        </span>

        {/* DELETE BUTTON */}
        <span
          className="material-icons"
          style={{ cursor: "pointer", color: "red" }}
          onClick={handleDelete}
        >
          delete
        </span>
      </div>

      <p>
        <span className="material-icons" style={{ verticalAlign: "middle" }}>
          inventory_2
        </span>
        &nbsp; Dose: {medicine.dose || "Not specified"}
      </p>

      <h4 style={{ marginTop: "12px" }}>
        <span className="material-icons" style={{ verticalAlign: "middle" }}>
          schedule
        </span>
        &nbsp; Schedules:
      </h4>

      {/* SCHEDULE LIST */}
      {medicine.schedules.map((sched) => (
        <div
          key={sched._id}
          style={{ display: "flex", gap: "10px", marginTop: "6px" }}
        >
          <span>
            🕒 {sched.time} ({formatRepeat(sched.repeat)}) &nbsp;
            {sched.taken ? (
              <span style={{ color: "green" }}>✔ Taken</span>
            ) : (
              <span style={{ color: "orange" }}>❗ Pending</span>
            )}
          </span>

          {!sched.taken && (
            <button
              className="small-button"
              onClick={() => handleMarkTaken(sched._id)}
            >
              Mark Taken
            </button>
          )}
        </div>
      ))}

      {/* EDIT MODAL*/}
      {showEdit && (
        <EditMedicineModal
          medicine={medicine}
          onClose={() => setShowEdit(false)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}
