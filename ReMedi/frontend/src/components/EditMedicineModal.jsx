import { useState } from "react";
import { updateMedicine } from "../api/medicineService";

export default function EditMedicineModal({ medicine, onClose, onUpdated }) {
  const [name, setName] = useState(medicine.name || "");
  const [dose, setDose] = useState(medicine.dose || "");
  const [time, setTime] = useState(
    medicine.schedules?.[0]?.time || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedMed = {
      name,
      dose,
      schedules: [
        {
          ...medicine.schedules[0],
          time,
        }
      ]
    };

    try {
      await updateMedicine(medicine._id, updatedMed);
      onUpdated("edited");
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update medicine.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Medicine</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Medicine name"
            required
          />

          <input
            type="text"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Dose"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <div style={{ display: "flex", gap: "10px", marginTop: 12 }}>
            <button type="submit">Save Changes</button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
