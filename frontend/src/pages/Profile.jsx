import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Profile() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const meResponse = await api.get("/accounts/me/");
      setMe(meResponse.data);

      if (meResponse.data.groups.includes("Professor")) {
        const response = await api.get("/academic/teachers/");
        setProfile(response.data[0]);
      } else {
        const response = await api.get("/academic/students/");
        setProfile(response.data[0]);
      }
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
      <h1>Perfil</h1>

      {loading ? (
        <Loading text="Carregando perfil..." />
      ) : !profile ? (
        <p>Perfil não encontrado.</p>
      ) : me.groups.includes("Professor") ? (
        <section>
          <h2>Perfil do Professor</h2>
          <p>Nome: {profile.full_name}</p>
          <p>Usuário: {profile.username}</p>
          <p>Email: {profile.email || "Não informado"}</p>
          <p>Código: {profile.employee_code}</p>
          <p>Departamento: {profile.department}</p>
          <p>Título: {profile.title}</p>
        </section>
      ) : (
        <section>
          <h2>Perfil do Aluno</h2>
          <p>Nome: {profile.full_name}</p>
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