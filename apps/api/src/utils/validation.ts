export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate password strength requirements
 */
const validatePasswordStrength = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character (!@#$%^&* etc)',
    });
  }

  return errors;
};

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
  } else {
    const passwordErrors = validatePasswordStrength(password);
    errors.push(...passwordErrors);
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
 * Validate goal creation input
 */
export const validateCreateGoalInput = (
  title: string,
  targetAmount: number,
  deadline: string,
  category: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!title || typeof title !== 'string') {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }

  if (!targetAmount || typeof targetAmount !== 'number') {
    errors.push({ field: 'targetAmount', message: 'Target amount is required and must be a number' });
  } else if (targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be greater than 0' });
  } else if (targetAmount > 10000000) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be less than $10,000,000' });
  }

  if (!deadline || typeof deadline !== 'string') {
    errors.push({ field: 'deadline', message: 'Deadline is required' });
  } else {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.push({ field: 'deadline', message: 'Invalid deadline date format' });
    } else if (deadlineDate <= new Date()) {
      errors.push({ field: 'deadline', message: 'Deadline must be in the future' });
    }
  }

  if (!category || typeof category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required' });
  } else {
    const validCategories = ['savings', 'education', 'home', 'investment', 'vacation', 'other'];
    if (!validCategories.includes(category.toLowerCase())) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }
  }

  return errors;
};

/**
 * Validate transaction input
 */
export const validateTransactionInput = (
  amount: number,
  description?: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!amount || typeof amount !== 'number') {
    errors.push({ field: 'amount', message: 'Amount is required and must be a number' });
  } else if (amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  } else if (amount > 1000000) {
    errors.push({ field: 'amount', message: 'Amount must be less than $1,000,000' });
  }

  if (description && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  } else if (description && description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
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
