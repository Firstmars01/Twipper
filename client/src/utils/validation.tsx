// Validation helpers pour les formulaires

export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "L'email est requis";
  if (!EMAIL_REGEX.test(email)) return "Format d'email invalide";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Le mot de passe est requis";
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
  if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir au moins une majuscule";
  if (!/[a-z]/.test(password)) return "Le mot de passe doit contenir au moins une minuscule";
  if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir au moins un chiffre";
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return "Le nom d'utilisateur est requis";
  if (username.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères";
  if (username.length > 20) return "Le nom d'utilisateur ne doit pas dépasser 20 caractères";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "La confirmation du mot de passe est requise";
  if (password !== confirm) return "Les mots de passe ne correspondent pas";
  return null;
}

export function validateRegisterForm(fields: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const usernameErr = validateUsername(fields.username);
  if (usernameErr) errors.push({ field: "username", message: usernameErr });

  const emailErr = validateEmail(fields.email);
  if (emailErr) errors.push({ field: "email", message: emailErr });

  const passwordErr = validatePassword(fields.password);
  if (passwordErr) errors.push({ field: "password", message: passwordErr });

  const confirmErr = validateConfirmPassword(fields.password, fields.confirmPassword);
  if (confirmErr) errors.push({ field: "confirmPassword", message: confirmErr });

  return errors;
}

export function validateLoginForm(fields: {
  email: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailErr = validateEmail(fields.email);
  if (emailErr) errors.push({ field: "email", message: emailErr });

  if (!fields.password) errors.push({ field: "password", message: "Le mot de passe est requis" });

  return errors;
}
