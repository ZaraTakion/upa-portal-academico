import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
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