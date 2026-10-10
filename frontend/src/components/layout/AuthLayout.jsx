import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Brand from "../brand/Brand";

export default function AuthLayout({ eyebrow, title, description, children }) {
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    document.title = `${title} · Takion Campus`;
  }, [title]);
  return (
    <main className="auth-page">
      <aside className="auth-visual" aria-label="Identidade Takion Campus">
        <Brand />
        <svg
          className="auth-art"
          viewBox="0 0 480 440"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M56 394h368M76 388V198C76 97 147 38 240 38s164 59 164 160v190"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M96 388V200c0-91 64-142 144-142s144 51 144 142v188M118 388V204c0-78 53-122 122-122s122 44 122 122v184"
            stroke="currentColor"
            strokeWidth="1"
            opacity=".35"
          />
          <path
            d="M240 82v306M118 202h244M96 326h288"
            stroke="currentColor"
            opacity=".25"
          />
          <path
            d="M162 310V184l78-39 78 39v126l-78 39-78-39Z"
            fill="var(--surface)"
            stroke="currentColor"
          />
          <path
            d="m162 184 78 40 78-40M240 224v125M183 215v86l38 19M298 215v86l-38 19"
            stroke="currentColor"
          />
          <path
            d="M223 116h34M240 99v34M63 226h26M391 226h26"
            stroke="var(--accent)"
          />
          <path d="M240 370l6 6-6 6-6-6 6-6Z" fill="var(--accent)" />
          <path d="M40 410h400" stroke="currentColor" opacity=".35" />
        </svg>
        <div className="auth-visual-caption">
          <p>
            Conhecimento,
            <br />
            em seu lugar.
          </p>
          <span>
            Organização
            <br />
            Vida acadêmica
            <br />
            Conexão
          </span>
        </div>
      </aside>
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-tools">
          <Brand />
          <span>Ambiente acadêmico independente</span>
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"
            }
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <div className="auth-form-area">
          <div className="auth-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
        <footer className="auth-footer">
          Takion Campus · Projeto independente de portfólio e demonstração.
        </footer>
      </section>
    </main>
  );
}
