import { createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
  overlap: false,
  gap: 1,
  offsets: { top: "16px", right: "16px", bottom: "16px", left: "16px" },
});
