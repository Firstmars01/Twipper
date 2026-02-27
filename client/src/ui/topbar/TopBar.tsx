import { Box, Flex, Heading, Button, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import "./TopBar.css";

function TopBar() {
  return (
    <Box as="nav" className="topbar">
      <Flex className="topbar-inner">
        <RouterLink to="/">
          <Heading className="topbar-title">
            🐦 Twipper
          </Heading>
        </RouterLink>

        <HStack className="topbar-actions">
          <RouterLink to="/login">
            <Button className="topbar-btn-login">Connexion</Button>
          </RouterLink>
          <RouterLink to="/register">
            <Button className="topbar-btn-register">Inscription</Button>
          </RouterLink>
        </HStack>
      </Flex>
    </Box>
  );
}

export default TopBar;
