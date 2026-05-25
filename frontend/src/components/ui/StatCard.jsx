import BaseCard from "./BaseCard";

function StatCard({ icon, label, value, helper }) {
  return (
    <BaseCard className="stat-card">
      {icon && <div className="stat-icon">{icon}</div>}

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </BaseCard>
  );
}

export default StatCard;