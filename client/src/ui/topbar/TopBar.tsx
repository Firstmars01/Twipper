import { Link as RouterLink } from "react-router-dom";
import "./TopBar.css";

function TopBar() {
  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <RouterLink to="/">
          <span className="topbar-title">🐦 Twipper</span>
        </RouterLink>

        <div className="topbar-actions">
          <RouterLink to="/login">
            <button className="topbar-btn-login">Connexion</button>
          </RouterLink>
          <RouterLink to="/register">
            <button className="topbar-btn-register">Sing up</button>
          </RouterLink>
        </div>
      </div>
    </nav>
  );
}

export default TopBar;
