import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, CanLoad, Router, } from '@angular/router';
import { AuthService } from '@services/auth.service';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location
  ) { }

  canActivate(): boolean {
    this.authService.checkUserAuth();
    let user = this.authService.getUser();

    if (!this.authService.isUserAuth()) {
        this.router.navigate(['auth/login'])
        return false;
    }

    return true;
  }

}
