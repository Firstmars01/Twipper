import { Box, Flex, Heading, Button, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function TopBar() {
  return (
    <Box
      as="nav"
      bg="blue.600"
      color="white"
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
      shadow="md"
    >
      <Flex maxW="1200px" mx="auto" align="center" justify="space-between">
        <RouterLink to="/">
          <Heading size="lg" fontWeight="bold" letterSpacing="tight">
            🐦 Twipper
          </Heading>
        </RouterLink>

        <HStack gap={3}>
          <RouterLink to="/login">
            <Button variant="ghost" color="white" _hover={{ bg: "blue.500" }}>
              Connexion
            </Button>
          </RouterLink>
          <RouterLink to="/register">
            <Button bg="white" color="blue.600" _hover={{ bg: "gray.100" }}>
              Inscription
            </Button>
          </RouterLink>
        </HStack>
      </Flex>
    </Box>
  );
}

export default TopBar;
