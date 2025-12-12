export default function DashboardSummary({ data }) {
  const total = data.length;

  const taken = data.reduce((count, med) => {
    return count + med.schedules.filter((s) => s.taken).length;
  }, 0);

  const pending = data.reduce((count, med) => {
    return count + med.schedules.filter((s) => !s.taken).length;
  }, 0);

  const percent = total
    ? Math.round((taken / (taken + pending)) * 100)
    : 0;

  return (
    <div className="dashboard-card">
      <h3>📊 Today’s Summary</h3>

      <p><strong>Total Medicines:</strong> {total}</p>
      <p><strong>Taken:</strong> {taken}</p>
      <p><strong>Pending:</strong> {pending}</p>

      <div className="progress-bar">
        <div className="fill" style={{ width: `${percent}%` }}></div>
      </div>

      <p className="percent-label">{percent}% Completed</p>
    </div>
  );
}
