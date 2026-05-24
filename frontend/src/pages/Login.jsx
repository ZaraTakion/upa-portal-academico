import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>UPA</h1>
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

      <Link to="/forgot-password">Esqueci minha senha</Link>
    </main>
  );
}

export default Login;