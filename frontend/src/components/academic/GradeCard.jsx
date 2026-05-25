import Badge from "../ui/Badge";
import BaseCard from "../ui/BaseCard";

function GradeCard({ grade }) {
  const progress = Math.min((grade.grade || 0) * 10, 100);

  return (
    <BaseCard className="grade-card">
      <div className="card-between">
        <h2>{grade.subject_name}</h2>

        <Badge type={grade.status}>
          {grade.status_display}
        </Badge>
      </div>

      <div className="grade-value">
        {grade.grade ?? "-"}
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill progress-${grade.status}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p>
        <strong>Faltas:</strong> {grade.absence}
      </p>
    </BaseCard>
  );
}

export default GradeCard;