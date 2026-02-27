import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import TopBar from "../ui/TopBar";

function Layout() {
  return (
    <Box minH="100vh" bg="gray.50">
      <TopBar />
      <Box as="main" maxW="1200px" mx="auto" px={4} py={6}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
