import { Box, Heading, Text, Input, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <Box className="login">
      <VStack className="login-form">
        <Heading className="login-title">Connexion</Heading>

        <Input placeholder="Email" type="email" />
        <Input placeholder="Mot de passe" type="password" />

        <Button className="login-btn">Se connecter</Button>

        <Text className="login-footer">
          Pas encore de compte ?{" "}
          <RouterLink to="/register">
            <Text as="span" className="login-link">S'inscrire</Text>
          </RouterLink>
        </Text>
      </VStack>
    </Box>
  );
}

export default Login;
