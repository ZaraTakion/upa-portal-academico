import Badge from "../ui/Badge";
import BaseCard from "../ui/BaseCard";

function SubjectCard({ subject }) {
  return (
    <BaseCard className="subject-card">
      <Badge type={subject.status}>
        {subject.status_display}
      </Badge>

      <h2>{subject.name}</h2>

      <p>
        <strong>Código:</strong> {subject.code}
      </p>

      <p>
        <strong>Professor:</strong> {subject.professor}
      </p>

      <p>
        <strong>Período:</strong> {subject.period}
      </p>

      <p>
        <strong>Carga Horária:</strong> {subject.workload}h
      </p>
    </BaseCard>
  );
}

export default SubjectCard;