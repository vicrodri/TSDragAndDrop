//Validator Decorator
export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export const validateInput = (validatableInput: Validatable) => {
  let isValid = true;
  isValid =
    isValid && validatableInput.required
      ? isValid && validatableInput.value.toString().length > 0
      : isValid;
  isValid =
    isValid && validatableInput.minLength && typeof validatableInput.value === "string"
      ? isValid && validatableInput.value.length > validatableInput.minLength
      : isValid;
  isValid =
    isValid && validatableInput.maxLength && typeof validatableInput.value === "string"
      ? isValid && validatableInput.value.length < validatableInput.maxLength
      : isValid;
  isValid =
    isValid && validatableInput.min && typeof validatableInput.value === "number"
      ? isValid && validatableInput.value > validatableInput.min
      : isValid;
  isValid =
    isValid && validatableInput.max && typeof validatableInput.value === "number"
      ? isValid && validatableInput.value < validatableInput.max
      : isValid;

  return isValid;
};
