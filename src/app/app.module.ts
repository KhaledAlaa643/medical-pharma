import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { InterceptorsProvider } from './core/interceptor';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

import { CalendarModule } from 'primeng/calendar';

import { SharedModuleModule } from '@modules/shared-module.module';
import { FrontPageModule } from '@modules/front-page.module';
import { FocusNextDirective } from './core/directives/focusNext.directive';

// AoT requires an exported function for factories
export const createTranslateLoader = (http: HttpClient) => {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};
// const config: SocketIoConfig = {
// 	url: environment.socketUrl, // socket server url;
// 	options: {
// 		transports: ['websocket']
// 	}
// }

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    // SocketIoModule.forRoot(config),
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    RouterModule,
    FormsModule,
    CalendarModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SharedModuleModule,
    FrontPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      easing: 'ease-in',
      timeOut: 4000,
      progressBar: true,
    }),
  ],
  providers: [InterceptorsProvider],
  exports: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
