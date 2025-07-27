import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,

} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Progress_barService } from '@services/progress_bar.service';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';
import { ToastrService } from 'ngx-toastr';
import { ProgressBar } from 'primeng/progressbar';
import { Subscription, throwError } from 'rxjs';

// import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, retry, tap } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
   handled401Error = false;
   handled403Error = false
   progressValue: number = 0;
   showProgressBar: boolean = false;
   private subscriptions = new Subscription();
  constructor(private toastr: ToastrService,private progressService:Progress_barService, private auth: AuthService,
private router:Router
  ) {

   }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // let interval: any;
    this.progressService.show();
    // this.progressService.updateProgress(0); // Reset progress to 0 at the start

    // interval = setInterval(() => {
    //   this.progressService.progressValue.subscribe(value => {
    //     if (value < 90) { // Increment up to 90% to reserve 100% for completion
    //       this.progressService.updateProgress(value + 1);
    //     }
    //   });
    // }, 1000);
    


    return next.handle(req).pipe(
      // retry(1),  
      finalize(() =>  
          this.progressService.hide() 
      ),
      catchError((error: HttpErrorResponse) => {
        if (error?.error && error?.error?.status_code != 401 && error?.error?.status_code != 403) {
        //   for (const key in error?.error.errors) {
        //     if (error?.error.errors.hasOwnProperty(key)) {
        //         const errorMessages = error?.error.errors[key];
        //         errorMessages.forEach((errorMessage:any) => {
        //           this.toastr.error(errorMessage)
        //         });
        //     }
        // }
          this.toastr.error(error.error.message)
          let errorMessage = `${error.error.message}`;
        }
        else if (error?.error?.status_code == 401 && this.handled401Error == false) {
          this.auth.signOut()
          this.toastr.error(error.error.message)
          this.handled401Error=true
        }
        else if(error?.error?.status_code == 403 && this.handled403Error == false){
          if(window.history.length>1){
            // window.history.back()
          }
          else{
            this.router.navigate(['/front-page/welcome-page'])
          }
          this.handled401Error=true
          this.toastr.error(error.error.message)
          console.log('error',error)
        }
        // else {
        //   this.toastr.error(error.error.message)
        //    this.auth.signOut()
        //    setTimeout(function () {
        //     window.location.reload();
        //   }, 1000);
        // }

        return throwError(() => error.error);
      })
    );







    // return next.handle(req).pipe(
    //   tap({
    //     error: (error: any) => {
    //       let errorMessage = '';
    //       if (error instanceof ErrorEvent) {
    //         errorMessage = `Error: ${error.error.message}`;
    //       } else {
    //         errorMessage = `Error Code: ${error.error.status_code}\n Message: ${error.error.message}`;
    //       }
    //       this._notification.error(errorMessage);
    //     }
    //   })
    // );


    // return next.handle(req).pipe(
    //   retry(1),
    //   finalize(() =>  {}),
    //   catchError((error:HttpErrorResponse)=>{
    //     let errorMessage = '';
    //     if(error.error instanceof ErrorEvent){
    //       errorMessage = `Error: ${error.message}`;
    //     }else{
    //       errorMessage = `Error Code: ${error.status}\n Message: ${error.message}`;
    //     }
    //     this._notification.error(errorMessage);
    //     return throwError(errorMessage);
    //   })
    // );










  }


}
