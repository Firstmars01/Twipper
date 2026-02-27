import { useState, type FormEvent } from "react";
import { Box, Heading, Text, Button, VStack, Checkbox } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { apiLogin, saveAuth } from "../../service/api";
import { validateLoginForm } from "../../utils/validation";
import { toaster } from "../../utils/toaster";
import FormField from "../../ui/form-field/FormField";
import "./Style.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Validation front-end
    const errors = validateLoginForm({ email, password });
    if (errors.length > 0) {
      const errMap: Record<string, string> = {};
      errors.forEach((err) => {
        errMap[err.field] = err.message;
        toaster.create({
          title: err.message,
          type: "error",
          duration: 4000,
        });
      });
      setFieldErrors(errMap);
      return;
    }

    setLoading(true);

    try {
      const data = await apiLogin(email, password);
      saveAuth(data, rememberMe);
      navigate("/");
    } catch (err: any) {
      toaster.create({
        title: "Erreur de connexion",
        description: err.message,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="login">
      <form onSubmit={handleSubmit}>
        <VStack className="login-form">
          <Heading className="login-title">Connexion</Heading>

          <FormField
            placeholder="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
          />

          <FormField
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
          />

          <Button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <Checkbox.Root className="login-checkbox" checked={rememberMe} onCheckedChange={(e) => setRememberMe(e.checked === true)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Se souvenir de moi</Checkbox.Label>
          </Checkbox.Root>

          <Text className="login-footer">
            Pas encore de compte ?{" "}
            <RouterLink to="/register">
              <Text as="span" className="login-link">S'inscrire</Text>
            </RouterLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}

export default Login;
