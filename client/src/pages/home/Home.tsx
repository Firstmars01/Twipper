import { Box, Heading, Text, Button } from "@chakra-ui/react"

function Home() {
  return (
    <Box p={8}>
      <Heading>Twipper</Heading>
      <Text>Bienvenue sur Twipper !</Text>
      <Button mt={4}>Se connecter</Button>
    </Box>
  )
}

export default Home