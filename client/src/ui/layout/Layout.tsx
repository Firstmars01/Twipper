import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Toaster, ToastTitle, ToastDescription, ToastRoot, ToastCloseTrigger, ToastIndicator } from "@chakra-ui/react";
import TopBar from "../topbar/TopBar";
import { toaster } from "../../utils/toaster";
import "./Layout.css";

function getTypeClass(type: string | undefined) {
  if (type === "error") return "error";
  if (type === "success") return "success";
  return "default";
}

function Layout() {
  return (
    <Box className="layout">
      <TopBar />
      <Box as="main" className="layout-main">
        <Outlet />
      </Box>
      <Toaster toaster={toaster}>
        {(toast) => (
          <ToastRoot className={`toast-root toast-root--${getTypeClass(toast.type)}`}>
            <ToastIndicator className={`toast-indicator toast-indicator--${getTypeClass(toast.type)}`} />
            <Box flex="1">
              <ToastTitle className="toast-title">{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription className="toast-description">
                  {toast.description}
                </ToastDescription>
              )}
            </Box>
            <ToastCloseTrigger className="toast-close">
              ✕
            </ToastCloseTrigger>
          </ToastRoot>
        )}
      </Toaster>
    </Box>
  );
}

export default Layout;
