import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Alert from "../../components/feedback/Alert";
import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/ui/PageHeader";
import SelectInput from "../../components/ui/SelectInput";
import { getRequestedClassGroupId } from "../../utils/initialClassGroup";

function TeacherStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialClassGroupId = useRef(searchParams.get("class_group"));
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/academic/class-groups/")
      .then((response) => {
        setGroups(response.data);
        setSelectedGroup(
          getRequestedClassGroupId(response.data, initialClassGroupId.current),
        );
      })
      .catch(() => {
        setLoadError("Não foi possível carregar os alunos e turmas.");
      })
      .finally(() => setGroupsLoaded(true));
  }, []);

  useEffect(() => {
    if (!groupsLoaded) return undefined;

    let active = true;
    setLoading(true);
    const query = selectedGroup
      ? `?class_group=${encodeURIComponent(selectedGroup)}`
      : "";

    api.get(`/academic/class-enrollments/${query}`)
      .then((response) => {
        if (active) setStudents(response.data);
      })
      .catch(() => {
        if (active) {
          setLoadError("Não foi possível carregar os alunos e turmas.");
          setStudents([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupsLoaded, selectedGroup]);

  function handleGroupChange(event) {
    const nextGroup = event.target.value;
    setSelectedGroup(nextGroup);
    setSearchParams(nextGroup ? { class_group: nextGroup } : {});
  }

  const groupOptions = [
    { value: "", label: "Todas as turmas" },
    ...groups.map((group) => ({
      value: String(group.id),
      label: `${group.subject_name} — ${group.name}`,
    })),
  ];

  return (
    <MainLayout>
      {loadError && <Alert type="error" message={loadError} onRetry={() => window.location.reload()} />}
      <PageHeader
        eyebrow="Professor"
        title="Alunos por Turma"
        description="Filtre os alunos de uma turma ou consulte todas as suas turmas."
      />

      <section className="base-card form-card teacher-student-filter">
        <SelectInput
          label="Turma"
          value={selectedGroup}
          onChange={handleGroupChange}
          options={groupOptions}
        />
      </section>

      {loading ? (
        <Loading text="Carregando alunos..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="Nenhum aluno"
          message={selectedGroup
            ? "Não há alunos nesta turma."
            : "Nenhum aluno encontrado nas suas turmas."}
        />
      ) : (
        <div className="table-wrapper" tabIndex={0} role="region" aria-label="Alunos matriculados">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Matrícula</th>
                <th>Turma</th>
                <th>Disciplina</th>
              </tr>
            </thead>

            <tbody>
              {students.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name}</td>
                  <td>{item.student_registration}</td>
                  <td>{item.class_group_name}</td>
                  <td>{item.subject_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default TeacherStudents;
