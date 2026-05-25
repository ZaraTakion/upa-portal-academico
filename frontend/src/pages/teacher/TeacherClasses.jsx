import { Users } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";

function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadClasses() {
    try {
      const response = await api.get("/academic/class-groups/");
      setClasses(response.data);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Professor"
        title="Minhas Turmas"
        description="Consulte suas turmas, disciplinas e quantidade de alunos."
      />

      {loading ? (
        <Loading text="Carregando turmas..." />
      ) : classes.length === 0 ? (
        <EmptyState title="Nenhuma turma" message="Nenhuma turma vinculada ao professor." />
      ) : (
        <section className="cards-grid">
          {classes.map((item) => (
            <BaseCard className="subject-card" key={item.id}>
              <Badge type="primary">Turma</Badge>

              <h2>{item.name}</h2>

              <p><strong>Disciplina:</strong> {item.subject_name}</p>
              <p><strong>Professor:</strong> {item.teacher_name}</p>
              <p><strong>Semestre:</strong> {item.semester}</p>
              <p><strong>Ano:</strong> {item.year}</p>
              <p><strong>Alunos:</strong> {item.students_count}</p>

              <Users size={22} />
            </BaseCard>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default TeacherClasses;