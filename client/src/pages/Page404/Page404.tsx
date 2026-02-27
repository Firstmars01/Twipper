import { Link as RouterLink } from "react-router-dom";
import "./Page404.css";

function Page404() {
  return (
    <div className="page404">
      <h1>404</h1>
      <p>Cette page n'existe pas.</p>
      <RouterLink to="/">
        <button>Retour à l'accueil</button>
      </RouterLink>
    </div>
  );
}

export default Page404;
