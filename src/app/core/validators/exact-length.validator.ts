import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function exactLengthValidator(length: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!Array.isArray(value)) {
      const actualLength = value ? 1 : 0;
      return actualLength === length
        ? null
        : { exactLength: { requiredLength: length, actualLength } };
    }

    const actualLength = value.length;

    return actualLength === length
      ? null
      : { exactLength: { requiredLength: length, actualLength } };
  };
}
