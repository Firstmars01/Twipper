import { Link as RouterLink } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="register">
      <div className="register-form">
        <h1>Inscription</h1>

        <input placeholder="Nom d'utilisateur" />
        <input placeholder="Email" type="email" />
        <input placeholder="Mot de passe" type="password" />

        <button>S'inscrire</button>

        <p className="register-footer">
          Déjà un compte ?{" "}
          <RouterLink to="/login">
            <span className="link">Se connecter</span>
          </RouterLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
