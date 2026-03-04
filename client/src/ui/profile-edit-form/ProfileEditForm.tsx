import { useState } from "react";
import { Box, Button, Input, Textarea, VStack, HStack, Text } from "@chakra-ui/react";
import { apiUpdateProfile, saveAuth, getToken, getRefreshToken } from "../../service/api";
import { validateUsername } from "../../utils/validation";

interface ProfileEditFormProps {
  currentUsername: string;
  currentBio: string;
  onSaved: (updated: { username: string; bio?: string }) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({ currentUsername, currentBio, onSaved, onCancel }: ProfileEditFormProps) {
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation côté client
    const usernameErr = validateUsername(username);
    if (usernameErr) {
      setError(usernameErr);
      return;
    }

    if (bio.length > 160) {
      setError("La bio ne doit pas dépasser 160 caractères");
      return;
    }

    setLoading(true);
    try {
      const updated = await apiUpdateProfile({ username: username.trim(), bio: bio.trim() });

      // Mettre à jour le user stocké en localStorage/sessionStorage
      const token = getToken();
      const refreshToken = getRefreshToken();
      if (token && refreshToken) {
        saveAuth({ user: updated, token, refreshToken });
      }

      onSaved({ username: updated.username, bio: updated.bio });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const hasChanges = username !== currentUsername || bio !== currentBio;

  return (
    <form onSubmit={handleSubmit}>
      <Box className="profile-edit-form">
        <VStack align="stretch" gap={3}>
          <Box>
            <Text className="profile-edit-label">Nom d'utilisateur</Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              size="sm"
              className="profile-edit-input"
            />
          </Box>
          <Box>
            <Text className="profile-edit-label">Bio</Text>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              resize="none"
              rows={3}
              size="sm"
              placeholder="Décrivez-vous en quelques mots..."
              className="profile-edit-input"
            />
            <Text className="profile-edit-counter">{bio.length}/160</Text>
          </Box>

          {error && <Text className="profile-edit-error">{error}</Text>}

          <HStack justify="flex-end" gap={2}>
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={loading}>
              Annuler
            </Button>
            <Button
              size="sm"
              type="submit"
              className="profile-edit-save-btn"
              disabled={loading || !hasChanges}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </form>
  );
}
