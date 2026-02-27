import { Box, Heading, Text, Input, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function Register() {
  return (
    <Box maxW="400px" mx="auto" mt={16}>
      <VStack gap={4} align="stretch">
        <Heading size="xl" textAlign="center">
          Inscription
        </Heading>

        <Input placeholder="Nom d'utilisateur" />
        <Input placeholder="Email" type="email" />
        <Input placeholder="Mot de passe" type="password" />

        <Button bg="blue.600" color="white" _hover={{ bg: "blue.500" }}>
          S'inscrire
        </Button>

        <Text textAlign="center" fontSize="sm" color="gray.500">
          Déjà un compte ?{" "}
          <RouterLink to="/login">
            <Text as="span" color="blue.600" fontWeight="bold">
              Se connecter
            </Text>
          </RouterLink>
        </Text>
      </VStack>
    </Box>
  );
}

export default Register;
