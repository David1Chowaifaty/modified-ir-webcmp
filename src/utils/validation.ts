export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
};

type ValidationResult = {
  isValid: boolean;
  errors: { [key: string]: string[] };
};

export function validateForm<T>(data: T, rules: { [P in keyof T]?: ValidationRule }): ValidationResult {
  let isValid = true;
  const errors: { [key: string]: string[] } = {};

  for (const fieldName in rules) {
    const rulesForField = rules[fieldName];
    const value = data[fieldName];
    if (!rulesForField) continue;

    errors[fieldName] = [];

    // Required
    if (rulesForField.required && (value === null || value === undefined || value === '')) {
      isValid = false;
      errors[fieldName].push('This field is required.');
    }

    // String Length
    if (typeof value === 'string') {
      if (rulesForField.minLength !== undefined && value.length < rulesForField.minLength) {
        isValid = false;
        errors[fieldName].push(`Minimum length is ${rulesForField.minLength}.`);
      }
      if (rulesForField.maxLength !== undefined && value.length > rulesForField.maxLength) {
        isValid = false;
        errors[fieldName].push(`Maximum length is ${rulesForField.maxLength}.`);
      }
    }

    // Numeric Range
    if (typeof value === 'number') {
      if (rulesForField.minValue !== undefined && value < rulesForField.minValue) {
        isValid = false;
        errors[fieldName].push(`Minimum value is ${rulesForField.minValue}.`);
      }
      if (rulesForField.maxValue !== undefined && value > rulesForField.maxValue) {
        isValid = false;
        errors[fieldName].push(`Maximum value is ${rulesForField.maxValue}.`);
      }
    }

    // Regular Expression
    if (rulesForField.pattern && !rulesForField.pattern.test(String(value))) {
      isValid = false;
      errors[fieldName].push('Invalid format.');
    }

    // Custom Validation
    if (rulesForField.custom && !rulesForField.custom(value)) {
      isValid = false;
      errors[fieldName].push('Custom validation failed.');
    }
  }

  return { isValid, errors };
}
