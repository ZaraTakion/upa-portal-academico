import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Alert from "../feedback/Alert";
import { useAuth } from "../../context/AuthContext";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessionError } = useAuth();
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const change = () => { setNarrow(media.matches); setSidebarOpen(false); };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || !narrow) return;
    const previousFocus = document.activeElement;
    const sidebar = document.getElementById("primary-navigation");
    const focusable = () => [...sidebar.querySelectorAll("a[href], button:not([disabled])")].filter((element) => element.getClientRects().length);
    focusable()[0]?.focus();
    function keydown(event) {
      if (event.key === "Escape") { event.preventDefault(); setSidebarOpen(false); }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", keydown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [sidebarOpen, narrow]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <Sidebar
        hidden={narrow && !sidebarOpen}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      {sidebarOpen && (
        <button type="button" className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação" />
      )}
      <div className="app-content" inert={narrow && sidebarOpen}>
        <Navbar sidebarOpen={sidebarOpen} onOpenMenu={() => setSidebarOpen(true)} />
        <main id="main-content" className="main-content" tabIndex="-1">{sessionError && <Alert type="error" message={sessionError} />}{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
