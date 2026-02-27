import { Box, Heading, Text, Input, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <Box className="register">
      <VStack className="register-form">
        <Heading className="register-title">Inscription</Heading>

        <Input placeholder="Nom d'utilisateur" />
        <Input placeholder="Email" type="email" />
        <Input placeholder="Mot de passe" type="password" />

        <Button className="register-btn">S'inscrire</Button>

        <Text className="register-footer">
          Déjà un compte ?{" "}
          <RouterLink to="/login">
            <Text as="span" className="register-link">Se connecter</Text>
          </RouterLink>
        </Text>
      </VStack>
    </Box>
  );
}

export default Register;
