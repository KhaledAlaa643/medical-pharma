import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, CanLoad, Router, } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location
  ) { }

  canActivate(): boolean {
    this.authService.checkUserAuth();
    let user = this.authService.getUser();

    if (this.authService.isUserAuth()) {
      this.router.navigate([ 'front-page/welcome-page' ])
      return false;
    }
    return true;
  }

  //   canLoad(): boolean {
  //     this.authService.checkUserAuth();
  //     let user = this.authService.getUser();

  //     if (this.authService.isUserAuth()) {
  //       if(user.role[0] == 1){
  //         return true;
  //       }

  //       this.router.navigate(['Home']);
  //       return false;
  //     }

  //     this.router.navigate(['employee/employeeLogin']);
  //     return false;
  //   }

}
