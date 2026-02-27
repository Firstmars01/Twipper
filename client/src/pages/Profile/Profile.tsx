import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

function Profile() {
  const { username } = useParams();

  return (
    <Box>
      <Heading size="xl">@{username}</Heading>
      <Text mt={2} color="gray.500">
        Page de profil (à compléter)
      </Text>
    </Box>
  );
}

export default Profile;
