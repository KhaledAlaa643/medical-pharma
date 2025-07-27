import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{6,}$/;
  //passwordPattern = /^.(?=.*[a-z])(?=.*[0-9])(?=.*[~!@#$%^&*()_-]).{6,}$/;
  emailPattern = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/; 
  // emailPattern = (/^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*\\\$/); 
  numerical = "^[0-9]*$";
  positiveNumber = "^[1-9]*$";
  urlPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  alphaPattern = /^(?:[a-zA-Z\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,400}$/;
  preventSpaces = "^[A-Za-z][A-Za-z0-9]*$";
  webSiteValidation = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  phonePattern = /^(\([0-9]{3}\) |[0-9]{3})[0-9]{3}-[0-9]{4,5}$/;
  phone = /^(\([0]{1}\))[0-9]{10}$/;
  EgyptphonePattern =/^(?:(?:\+|00)20)?1[0125]\d{8}$/;;
  expirationDatePattern= /^(0?[1-9]|1[0-2])\/\d{4}$/;



  // ***** password validations
  passwordGeneral =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{6,}$/;
  passwordLettersPattern = /[A-Za-z]/;
  passwordCapitalLetterPatter = /[A-Z]/;
  passwordSmallLetterPatter = /[a-z]/;
  passwordNumbersPattern = /\d/;
  passwordSpecialCharPattern = /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;



 
  decimalPattern = '^[0-9]*\.[0-9]{2}$';
  skuPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  liscencePattern = /^[a-zA-Z0-9]+[a-zA-Z0-9_]+$/
  taxIdPattern = /^\d{3}-\d{2}-\d{4}/;
  paymentConfirm =/^.(?=.*[0-9]).{7,}$/;


  constructor() { }


   matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): 
    ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      return !!control.parent &&
        !!control.parent.value &&
        control.value === 
        (control.parent?.controls as any)[matchTo].value
        ? null
        : { matching: true };
    };
  }
 /*  matchingPasswords(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.get('password')?.value !== control.get('password_confirmation')?.value;
      return isNotMatched ? { unmatchedPasswords: true } : null;
    };
  } */

  confirmPasswordMismatch(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if(confirmPassword?.value){
      if (password?.value !== confirmPassword?.value) {
        return { 'confirmPasswordMismatch': true };
      }
    }

    return null;
  }
  confirmPasswordMismatchacc(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    if(confirmPassword?.value){
      if (password?.value !== confirmPassword?.value) {
        return { 'confirmPasswordMismatch': true };
      }
    }

    return null;
  }

  confirmLogin(control: AbstractControl): { [key: string]: boolean } | null {
    const phone = control.get('phone');
    const password = control.get('password');
    if(phone?.value && password?.value){
      if (!phone?.valid || !password?.valid) {
        return { 'invalidPhoneOrPassword': true };
      }
    }

    return null;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('login_password');
    const confirmPassword = formGroup.get('login_password_confirmation');
    const isNotMatched = password?.value !== confirmPassword?.value;
    return isNotMatched ? { passwordMismatch: true } : null;
  }

  matchingPasswords(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isNotMatched = control.get('login_password')?.value !== control.get('login_password_confirmation')?.value;
      return isNotMatched ? { unmatchedPasswords: true } : null;
    };
  }
  patternWithMessage = (pattern: RegExp, error: ValidationErrors): ValidatorFn => {
    return (control: AbstractControl): any | null => {
      if (!control?.value) {
        return null;
      }

      return pattern.test(control?.value) ? null : error;
    }
  }

 
  // Validations password
  patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

}