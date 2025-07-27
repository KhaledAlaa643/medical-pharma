import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralService } from '@services/general.service';

@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
   styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
   activateLoader = false
   loginForm!: FormGroup;
   errorMessage = '';
   showPassword!: boolean;
   showPasswordOnPress!: boolean;
   private subscription=new Subscription()

   constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private http: HttpService,
      private router: Router,
      private generalService:GeneralService
   ) { }

   ngOnInit() {

      this.loginForm = this.fb.group({
         email: [ '', [ Validators.compose([ Validators.required, Validators.email ]) ] ],
         password: [ '', [ Validators.compose([ Validators.required ]) ] ]
      });
   }
   logInFormData!: any
   isButtonDisabled: boolean = false
   login(event:Event) {
      event.preventDefault

      if (this?.loginForm.touched && this?.loginForm.dirty && this.loginForm.valid) {
         this.isButtonDisabled = true
         this.activateLoader = true
         this.subscription.add(
            this.http.postReq('auth/login', this?.loginForm.value).subscribe({
               next: (res) => {
                  this.isButtonDisabled = true
                  this.authService.setUserToken(res.data.token)
                  this.authService.setUserObj(res.data.user)
                  const loginTime = new Date().getTime();
                  const token_expiration = res.data.token_expiration * 60 * 1000; //to get it in millisecound
                  localStorage.setItem('loginTime', loginTime.toString());
                  localStorage.setItem('token_expiration', token_expiration.toString());
                  this.router.navigate([ '/front-page/welcome-page' ])
   
               }, complete: () => {
                  this.activateLoader = false
                  this.checkWarehouseSettings()
                  this.getEnumsData()
               },
               error: (error) => {
                  this.activateLoader = false
                  this.isButtonDisabled = false
               }
            })
         )
      } else {
         this.activateLoader = false
         this.isButtonDisabled = false
         this.loginForm.markAsTouched
      }
   }
   enumsData:any
   getEnumsData(){
      this.subscription.add(
        this.generalService.getSettingsEnum().subscribe({
          next:res=>{
          this.enumsData=res.data
          },complete:()=>{
            this.authService.setEnums(this.enumsData)
          }
        })
      )
    }

   checkWarehouseSettings(){
      //multiple_corridors_enabled value
      //0 for نظام المخزن الواحد
      //1 for نظام المحطات
      this.subscription.add(
         this.http.getReq('settings/warehouses/system').subscribe({
            next:res=>{
             if(localStorage.getItem('multiple_corridors_enabled')){
               localStorage.removeItem('multiple_corridors_enabled')
             }
             else{
               localStorage.setItem('multiple_corridors_enabled',res.data?.multiple_corridors_enabled)
             }
            }
         })
      )
   }
}
