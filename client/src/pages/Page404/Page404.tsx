import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function Page404() {
  return (
    <Box textAlign="center" mt={20}>
      <Heading size="4xl" color="blue.600">
        404
      </Heading>
      <Text mt={4} fontSize="lg" color="gray.500">
        Cette page n'existe pas.
      </Text>
      <RouterLink to="/">
        <Button mt={6} bg="blue.600" color="white" _hover={{ bg: "blue.500" }}>
          Retour à l'accueil
        </Button>
      </RouterLink>
    </Box>
  );
}

export default Page404;
