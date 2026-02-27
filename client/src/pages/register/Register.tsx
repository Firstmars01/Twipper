import { useState, type FormEvent } from "react";
import { Box, Heading, Text, Input, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { apiRegister, saveAuth } from "../../service/api";
import { validateRegisterForm } from "../../utils/validation";
import { toaster } from "../../utils/toaster";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Validation front-end
    const errors = validateRegisterForm({ username, email, password, confirmPassword });
    if (errors.length > 0) {
      const errMap: Record<string, string> = {};
      errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setFieldErrors(errMap);
      return;
    }

    setLoading(true);

    try {
      const data = await apiRegister(email, username, password);
      saveAuth(data);
      toaster.create({
        title: "Inscription réussie !",
        description: `Bienvenue @${data.user.username}`,
        type: "success",
        duration: 3000,
      });
      navigate("/");
    } catch (err: any) {
      toaster.create({
        title: "Erreur d'inscription",
        description: err.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="register">
      <form onSubmit={handleSubmit}>
        <VStack className="register-form">
          <Heading className="register-title">Inscription</Heading>

          <Box width="100%">
            <Input
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              borderColor={fieldErrors.username ? "red.500" : undefined}
            />
            {fieldErrors.username && (
              <Text color="red.500" fontSize="xs" mt={1}>{fieldErrors.username}</Text>
            )}
          </Box>

          <Box width="100%">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              borderColor={fieldErrors.email ? "red.500" : undefined}
            />
            {fieldErrors.email && (
              <Text color="red.500" fontSize="xs" mt={1}>{fieldErrors.email}</Text>
            )}
          </Box>

          <Box width="100%">
            <Input
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderColor={fieldErrors.password ? "red.500" : undefined}
            />
            {fieldErrors.password && (
              <Text color="red.500" fontSize="xs" mt={1}>{fieldErrors.password}</Text>
            )}
          </Box>

          <Box width="100%">
            <Input
              placeholder="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              borderColor={fieldErrors.confirmPassword ? "red.500" : undefined}
            />
            {fieldErrors.confirmPassword && (
              <Text color="red.500" fontSize="xs" mt={1}>{fieldErrors.confirmPassword}</Text>
            )}
          </Box>

          <Button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>

          <Text className="register-footer">
            Déjà un compte ?{" "}
            <RouterLink to="/login">
              <Text as="span" className="register-link">Se connecter</Text>
            </RouterLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}

export default Register;
