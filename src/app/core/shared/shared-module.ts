import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormattedTimePipe } from './pipe/time-formater-ar.pipe';
import { FormErrorsComponent } from './Form-errors/Form-errors.component';
import { DisableButtonDirective } from '../directives/singleClick.directive';
import { PrimNgModule } from './prim-ng/prim-ng.module';
import { OnlyIntegerNumbersDirective } from '../directives/only-integer-numbers.directive';
import { NoSpecialCharsDirective } from '../directives/special-chars.directive';
@NgModule({
  declarations: [
    FormattedTimePipe,
    FormErrorsComponent,
    DisableButtonDirective,
    OnlyIntegerNumbersDirective,
    NoSpecialCharsDirective,
  ],
  exports: [
    FormattedTimePipe,
    FormErrorsComponent,
    DisableButtonDirective,
    OnlyIntegerNumbersDirective,
    NoSpecialCharsDirective,

    PrimNgModule,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimNgModule],
  providers: [FormattedTimePipe],
})
export class CustomSharedModule {}
