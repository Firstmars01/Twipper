import { Box, Flex, Heading, Button, HStack } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { isAuthenticated, getStoredUser, logout } from "../../service/api";
import "./TopBar.css";

function TopBar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getStoredUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Box as="nav" className="topbar">
      <Flex className="topbar-inner">
        <RouterLink to="/">
          <Heading className="topbar-title">
            🐦 Twipper
          </Heading>
        </RouterLink>

        <HStack className="topbar-actions">
          {authenticated && user ? (
            <>
              <Button className="topbar-btn-user" onClick={() => navigate(`/profile/${user.username}`)}>
                @{user.username}
              </Button>
              <Button className="topbar-btn-logout" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login">
                <Button className="topbar-btn-login">Connexion</Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button className="topbar-btn-register">Inscription</Button>
              </RouterLink>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

export default TopBar;
