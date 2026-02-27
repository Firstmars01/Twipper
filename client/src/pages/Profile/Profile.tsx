import { useParams } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { username } = useParams();

  return (
    <div className="profile">
      <h1>@{username}</h1>
      <p>Page de profil (à compléter)</p>
    </div>
  );
}

export default Profile;
