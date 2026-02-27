import { Link as RouterLink } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="login">
      <div className="login-form">
        <h1>Connexion</h1>

        <input placeholder="Email" type="email" />
        <input placeholder="Mot de passe" type="password" />

        <button>Se connecter</button>

        <p className="login-footer">
          Pas encore de compte ?{" "}
          <RouterLink to="/register">
            <span className="link">S'inscrire</span>
          </RouterLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
