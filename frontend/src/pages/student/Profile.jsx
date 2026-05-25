import { useEffect, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");

  async function loadProfile() {
    try {
      const response = await api.get("/academic/students/");
      const data = response.data[0];

      setProfile(data);
      setPhone(data?.phone || "");
      setAddress(data?.address || "");
      setGuardianName(data?.guardian_name || "");
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await api.patch(`/academic/students/${profile.id}/`, {
        phone,
        address,
        guardian_name: guardianName,
      });

      setAlertType("success");
      setFeedback("Perfil atualizado com sucesso.");
      loadProfile();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setAlertType("error");
      setFeedback("Erro ao atualizar perfil.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Dados acadêmicos"
        title="Perfil do Aluno"
        description="Consulte seus dados institucionais e edite informações permitidas."
      />

      {loading ? (
        <Loading text="Carregando perfil..." />
      ) : !profile ? (
        <p className="empty-text">Perfil não encontrado.</p>
      ) : (
        <section className="split-grid">
          <article className="base-card">
            <h2>Dados institucionais</h2>

            <p><strong>Nome:</strong> {profile.full_name}</p>
            <p><strong>Usuário:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email || "Não informado"}</p>
            <p><strong>Matrícula:</strong> {profile.registration}</p>
            <p><strong>Curso:</strong> {profile.course}</p>
            <p><strong>Semestre:</strong> {profile.semester}</p>
            <p><strong>CPF:</strong> {profile.cpf || "Não informado"}</p>
            <p><strong>Mãe:</strong> {profile.mother_name || "Não informado"}</p>
            <p><strong>Pai:</strong> {profile.father_name || "Não informado"}</p>
          </article>

          <article className="base-card">
            <h2>Edição limitada</h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <TextInput
                label="Telefone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />

              <TextInput
                label="Endereço"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />

              <TextInput
                label="Responsável"
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
              />

              <Alert type={alertType} message={feedback} />

              <Button type="submit">Salvar alterações</Button>
            </form>
          </article>
        </section>
      )}
    </MainLayout>
  );
}

export default Profile;