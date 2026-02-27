import { createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
  overlap: false,
  gap: 5,
  offsets: { top: "16px", right: "16px", bottom: "16px", left: "16px" },
});
