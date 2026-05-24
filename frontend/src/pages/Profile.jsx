import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const response = await api.get("/academic/students/");
      setProfile(response.data[0]);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <MainLayout>
      <h1>Perfil do Aluno</h1>

      {loading ? (
        <Loading text="Carregando perfil..." />
      ) : !profile ? (
        <p>Perfil não encontrado.</p>
      ) : (
        <section>
          <p>Usuário: {profile.username}</p>
          <p>Email: {profile.email || "Não informado"}</p>
          <p>Matrícula: {profile.registration}</p>
          <p>Curso: {profile.course}</p>
          <p>Semestre: {profile.semester}</p>
        </section>
      )}
    </MainLayout>
  );
}

export default Profile;