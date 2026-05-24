import { Link } from "react-router-dom";

function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <aside>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">
              {role === "Professor"
                ? "Painel do Professor"
                : role === "Administrador"
                ? "Painel Administrativo"
                : "Mural do Aluno"}
            </Link>
          </li>

          <li><Link to="/profile">Perfil</Link></li>
          <li><Link to="/subjects">Disciplinas</Link></li>
          <li><Link to="/grades">Notas</Link></li>
          <li><Link to="/calendar">Calendário</Link></li>
          <li><Link to="/notifications">Notificações</Link></li>
          <li><Link to="/contact">Contato</Link></li>
          <li><Link to="/files">Arquivos</Link></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;