import { useEffect, useState } from "react";
import { getMedicines } from "../api/medicineService";
import MedicineItem from "./MedicineItem";

export default function MedicineList({ onData }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getMedicines();
      const meds = response.data || [];
      setMedicines(meds);
      if (onData) onData(meds);
    } catch (err) {
      console.error("Fetch failed:", err);
      setMedicines([]);
      if (onData) onData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for medicine add event
  useEffect(() => {
    const listener = () => fetchData();
    window.addEventListener("medicineAdded", listener);
    return () => window.removeEventListener("medicineAdded", listener);
  }, []);

  // Refresh after edit/delete/markTaken
  const handleRefresh = (action) => {
    fetchData();

    // Toast messages
    const messageMap = {
      deleted: { message: "Medicine deleted", type: "error" },
      edited: { message: "Updated successfully!", type: "success" },
      taken: { message: "Marked as taken!", type: "success" },
    };

    if (messageMap[action]) {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: messageMap[action] })
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Medicine List</h2>

      {medicines.length === 0 ? (
        <p>No medicines added yet.</p>
      ) : (
        medicines.map((med) => (
          <MedicineItem
            key={med._id}
            medicine={med}
            onUpdated={handleRefresh}
          />
        ))
      )}
    </div>
  );
}
