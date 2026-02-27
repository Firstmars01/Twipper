import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import "./Page404.css";

function Page404() {
  return (
    <Box className="page404">
      <Heading className="page404-title">404</Heading>
      <Text className="page404-text">
        Cette page n'existe pas.
      </Text>
      <RouterLink to="/">
        <Button className="page404-btn">
          Retour à l'accueil
        </Button>
      </RouterLink>
    </Box>
  );
}

export default Page404;
