import { Box, Text, Spinner } from "@chakra-ui/react";
import {
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader,
  DialogBody, DialogCloseTrigger, DialogTitle, DialogPositioner,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import "./FollowListDialog.css";

export type FollowUser = { id: string; username: string; bio?: string; avatar?: string };

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  users: FollowUser[];
  loading: boolean;
}

function FollowListDialog({ open, onOpenChange, title, users, loading }: FollowListDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)} placement="center">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent className="follow-dialog">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            {loading ? (
              <Box style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                <Spinner />
              </Box>
            ) : users.length === 0 ? (
              <Text style={{ textAlign: "center", padding: "1rem", color: "#718096" }}>
                Aucun utilisateur
              </Text>
            ) : (
              <Box className="follow-list">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.username}`}
                    className="follow-list-item"
                    onClick={() => onOpenChange(false)}
                  >
                    <Text fontWeight="bold">@{u.username}</Text>
                    {u.bio && <Text fontSize="sm" color="gray.500">{u.bio}</Text>}
                  </Link>
                ))}
              </Box>
            )}
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

export default FollowListDialog;
