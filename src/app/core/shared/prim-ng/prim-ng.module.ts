import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { GalleriaModule } from 'primeng/galleria'
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { AccordionModule } from 'primeng/accordion';
import{ StepsModule} from  'primeng/steps'
import { PickListModule } from 'primeng/picklist';
import { PaginatorModule } from 'primeng/paginator';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports:[
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ProgressBarModule,
    TabViewModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    CheckboxModule,
    MultiSelectModule,
    MenuModule,
    GalleriaModule,
    DialogModule,
    RatingModule,
    AccordionModule,
    CommonModule,
    StepsModule,
    PickListModule,
    // BrowserAnimationsModule,
    DragDropModule,
    PaginatorModule
    // BrowserModule
  ],
  exports: [
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ProgressBarModule,
    TabViewModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    CheckboxModule,
    MultiSelectModule,
    MenuModule,
    GalleriaModule,
    DialogModule,
    RatingModule,
    AccordionModule,
    StepsModule,
    PickListModule,
    PaginatorModule,
    
    DragDropModule,
    // BrowserModule
  ],
})
export class PrimNgModule { }
