import { Component, Input, OnInit } from '@angular/core';
import { ValidationService } from '@services/validation.service';

@Component({
  selector: 'app-Form-errors',
  templateUrl: './Form-errors.component.html',
  styleUrls: ['./Form-errors.component.scss'],
  standalone:false
})
export class FormErrorsComponent implements OnInit {
  @Input() control: any;
  constructor(private validation: ValidationService) {}
  emailRegex = this.validation.emailPattern;
  alphaRegex = this.validation.alphaPattern;
  numericalRegex = this.validation.numerical;
  passwordRegex = this.validation.passwordPattern;
  preventSpaceRegex = this.validation.preventSpaces;
  skuPattern = this.validation.skuPattern;
  liscencePattern = this.validation.liscencePattern;
  taxIdPattern = this.validation.taxIdPattern;
  phoneRegex = this.validation.phonePattern;
  paymentRegx = this.validation.paymentConfirm;
  decimalValuRegex = this.validation.decimalPattern;
  passwordGeneralRegex = this.validation.passwordGeneral;
  EgyptphoneRegex = this.validation.EgyptphonePattern;
  webSiteRegex = this.validation.webSiteValidation;
  expirationDateRegex = this.validation.expirationDatePattern;
  positiveNumberRegex = this.validation.positiveNumber;
  ngOnInit(): void {}
}
