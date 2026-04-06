export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate registration input
 */
export const validateRegisterInput = (
  email: string,
  password: string,
  name: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  }

  if (!name || typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }

  return errors;
};

/**
 * Validate login input
 */
export const validateLoginInput = (
  email: string,
  password: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

/**
 * Format validation errors for API response
 */
export const formatValidationErrors = (
  errors: ValidationError[]
): Record<string, string> => {
  const formatted: Record<string, string> = {};

  for (const error of errors) {
    if (!formatted[error.field]) {
      formatted[error.field] = error.message;
    }
  }

  return formatted;
};
