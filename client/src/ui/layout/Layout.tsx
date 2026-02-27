import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import TopBar from "../topbar/TopBar";
import "./Layout.css";

function Layout() {
  return (
    <Box className="layout">
      <TopBar />
      <Box as="main" className="layout-main">
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
