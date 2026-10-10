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
  const [loadError, setLoadError] = useState("");
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
    } catch {
      setLoadError("Não foi possível carregar seu perfil.");
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
    } catch {
      setAlertType("error");
      setFeedback("Erro ao atualizar perfil.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <MainLayout>
      {loadError && (
        <Alert
          type="error"
          message={loadError}
          onRetry={() => window.location.reload()}
        />
      )}
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

            <dl className="profile-record">
              {[
                ["Nome", profile.full_name],
                ["Usuário", profile.username],
                ["Email", profile.email],
                ["Matrícula", profile.registration],
                ["Curso", profile.course],
                ["Semestre", profile.semester],
                ["CPF", profile.cpf],
                ["Mãe", profile.mother_name],
                ["Pai", profile.father_name],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "Não informado"}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="base-card">
            <span className="mini-eyebrow">Dados de contato</span>
            <h2>Suas informações</h2>
            <p>Atualize os campos autorizados do seu cadastro.</p>

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
