interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role: string;
  additionalInfo?: any;
}

export function validateRegistration(data: RegistrationData): string | null {
  const { email, password, name, role } = data;

  if (!email || !password || !name || !role) {
    return "All fields are required";
  }

  if (!isValidEmail(email)) {
    return "Invalid email format";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!["teacher", "parent", "student"].includes(role)) {
    return "Invalid role selected";
  }

  // Role-specific validation
  const roleValidation = validateRoleSpecificData(role, data.additionalInfo);
  if (roleValidation) {
    return roleValidation;
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRoleSpecificData(role: string, additionalInfo: any = {}): string | null {
  switch (role) {
    case 'teacher':
      if (!additionalInfo?.subjects?.length) {
        return "Please select at least one subject to teach";
      }
      break;
    case 'student':
      if (!additionalInfo?.grade) {
        return "Please specify your grade level";
      }
      break;
    // Add more role-specific validation as needed
  }
  return null;
}
