import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("rodrigo");
  const [password, setPassword] = useState("aluno123");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/token/", {
        username,
        password,
      });

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      const meResponse = await api.get("/accounts/me/");
      const user = meResponse.data;

      const role =
        user.groups.includes("Professor")
          ? "Professor"
          : user.groups.includes("Administrador") || user.is_staff
          ? "Administrador"
          : "Aluno";

      localStorage.setItem("role", role);
      localStorage.setItem("username", user.username);
      localStorage.setItem("fullName", `${user.first_name} ${user.last_name}`);

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      setErrorMessage("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>UPA</h1>
      <p>Upgrade Portal Aluno</p>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Alert message={errorMessage} />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>Aluno: rodrigo / aluno123</p>
      <p>Professor: leandro / prof123</p>
      <p>Admin: admin / admin123</p>

      <Link to="/forgot-password">Esqueci minha senha</Link>
    </main>
  );
}

export default Login;