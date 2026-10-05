import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

function NotFound() {
  return (
    <MainLayout>
      <section className="empty-state not-found" aria-labelledby="not-found-title">
        <p>Erro 404</p>
        <h1 id="not-found-title">Página não encontrada</h1>
        <p>O endereço pode ter mudado ou não está disponível.</p>
        <Link className="btn btn-primary" to="/dashboard">Voltar ao início</Link>
      </section>
    </MainLayout>
  );
}

export default NotFound;
