export const validateEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const validateInteger = (value) => {
  return Number.isInteger(Number(value));
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

export const validateFutureDate = (date) => {
  return new Date(date) > new Date();
};

export const getValidationErrors = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
      } else if (rule.type === 'email' && value && !validateEmail(value)) {
        errors[field] = rule.message || 'Invalid email format';
      } else if (rule.type === 'phone' && value && !validatePhone(value)) {
        errors[field] = rule.message || 'Invalid phone number';
      } else if (rule.type === 'minLength' && value && !validateMinLength(value, rule.value)) {
        errors[field] = rule.message || `Minimum length is ${rule.value}`;
      } else if (rule.type === 'maxLength' && value && !validateMaxLength(value, rule.value)) {
        errors[field] = rule.message || `Maximum length is ${rule.value}`;
      } else if (rule.type === 'number' && value && !validateNumber(value)) {
        errors[field] = rule.message || 'Must be a valid number';
      } else if (rule.type === 'positiveNumber' && value && !validatePositiveNumber(value)) {
        errors[field] = rule.message || 'Must be a positive number';
      }
    });
  });
  
  return errors;
};