import { useState } from "react";
import { Box, Button, Input, Textarea, VStack, HStack, Text } from "@chakra-ui/react";
import { apiUpdateProfile, saveAuth, getToken, getRefreshToken } from "../../service/api";
import { validateUsername } from "../../utils/validation";

const BANNER_COLORS = [
  { label: "Bleu", value: "linear-gradient(135deg, #1da1f2, #0d8ecf)" },
  { label: "Violet", value: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
  { label: "Rose", value: "linear-gradient(135deg, #ec4899, #db2777)" },
  { label: "Vert", value: "linear-gradient(135deg, #10b981, #059669)" },
  { label: "Orange", value: "linear-gradient(135deg, #f97316, #ea580c)" },
  { label: "Rouge", value: "linear-gradient(135deg, #ef4444, #dc2626)" },
  { label: "Sombre", value: "linear-gradient(135deg, #1a202c, #2d3748)" },
  { label: "Cyan", value: "linear-gradient(135deg, #06b6d4, #0891b2)" },
];

interface ProfileEditFormProps {
  currentUsername: string;
  currentBio: string;
  currentFlag?: string;
  onSaved: (updated: { username: string; bio?: string; flag?: string }) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({ currentUsername, currentBio, currentFlag, onSaved, onCancel }: ProfileEditFormProps) {
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [flag, setFlag] = useState(currentFlag || BANNER_COLORS[0].value);
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
      const updated = await apiUpdateProfile({ username: username.trim(), bio: bio.trim(), flag });

      // Mettre à jour le user stocké en localStorage/sessionStorage
      const token = getToken();
      const refreshToken = getRefreshToken();
      if (token && refreshToken) {
        saveAuth({ user: updated, token, refreshToken });
      }

      onSaved({ username: updated.username, bio: updated.bio, flag: updated.flag });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const hasChanges = username !== currentUsername || bio !== currentBio || flag !== (currentFlag || BANNER_COLORS[0].value);

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

          <Box>
            <Text className="profile-edit-label">Couleur de bannière</Text>
            <HStack gap={2} flexWrap="wrap" mt={1}>
              {BANNER_COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => setFlag(color.value)}
                  title={color.label}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: color.value,
                    cursor: "pointer",
                    border: flag === color.value ? "3px solid #1a202c" : "3px solid transparent",
                    transition: "border 0.15s ease",
                  }}
                />
              ))}
            </HStack>
            <Box
              mt={2}
              style={{
                height: 40,
                borderRadius: 8,
                background: flag,
              }}
            />
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
