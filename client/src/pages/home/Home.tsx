import { Box, Heading, Text, Button } from "@chakra-ui/react";
import "./Home.css";

function Home() {
  return (
    <Box className="home">
      <Heading>Twipper</Heading>
      <Text>Bienvenue sur Twipper !</Text>
      <Button className="home-btn">Se connecter</Button>
    </Box>
  );
}

export default Home;