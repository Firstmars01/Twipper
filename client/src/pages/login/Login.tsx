import { Box, Heading, Text, Input, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function Login() {
  return (
    <Box maxW="400px" mx="auto" mt={16}>
      <VStack gap={4} align="stretch">
        <Heading size="xl" textAlign="center">
          Connexion
        </Heading>

        <Input placeholder="Email" type="email" />
        <Input placeholder="Mot de passe" type="password" />

        <Button bg="blue.600" color="white" _hover={{ bg: "blue.500" }}>
          Se connecter
        </Button>

        <Text textAlign="center" fontSize="sm" color="gray.500">
          Pas encore de compte ?{" "}
          <RouterLink to="/register">
            <Text as="span" color="blue.600" fontWeight="bold">
              S'inscrire
            </Text>
          </RouterLink>
        </Text>
      </VStack>
    </Box>
  );
}

export default Login;
