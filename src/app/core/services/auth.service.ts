
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authBool: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  Auth$: Observable<boolean> = this.authBool.asObservable();

  updateAuthBool(updatedAuth:boolean) {
      this.authBool.next(updatedAuth);
  }
  getAuthBool(){
    return this.authBool.value;
  }

  private authUser: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  UserObsrv$: Observable<boolean> = this.authUser.asObservable();

  updateAuthUser(user:any) {
        this.authUser.next(user);
  }
  getUser(){
    return this.authUser.value;
  }

  isAuth: boolean = false;
  isAdmin: boolean = false;
  baseUrl = environment.baseUrl;

  user:any;
  constructor(
    private router: Router) { 

      if(localStorage.getItem('UserObj')){
        this.updateAuthUser( this.getUserObj());
      }

      if(localStorage.getItem('UserToken')){
        this.updateAuthBool(true);
      }else{
        this.updateAuthBool(false);
      }
    }

  setUserToken(token: any) {
    localStorage.setItem('UserToken', token);
    this.isAuth = true;

    this.updateAuthBool(true);
    this.checkUserAuth();
  }

  setEnums(data:any){
    localStorage.setItem('enums',JSON.stringify(data))
  }
  getEnums(){
    if (localStorage.getItem('enums')) {
      return JSON.parse(localStorage.getItem('enums') || '')
    }
    return {};
  }

  
  setUserObj(userObj: any) {
    this.user = userObj;
    this.updateAuthUser(userObj);
    localStorage.setItem('UserObj', JSON.stringify(userObj));
    userObj?.role == 'admin' ? this.isAdmin = true : this.isAdmin =  false;
  }
  getUserPermissions(){
   let user= JSON.parse(localStorage.getItem('UserObj') || '')
   let permissions:any=[]
     user.permissions.forEach((permission:any) => {
      permissions.push(permission.name)
   });
   return permissions
  }
  checkUserAuth() {
    if (this.getUserToken()) {
      this.isAuth = true;

      this.updateAuthBool(true);
      const userObj: any = this.getUserObj();
      userObj?.role == 'admin' ? this.isAdmin = true : this.isAdmin =  false;
    }
  }

  signOut() {
    localStorage.removeItem('UserToken');
    localStorage.removeItem('UserObj');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('token_expiration');
    localStorage.clear()
    
    this.updateAuthUser([]);
    this.isAuth = false;
    this.updateAuthBool(false);
    
    this.router.navigate(['/auth/login']).then(() => {
    });;
  }

  getUserToken() {
    return localStorage.getItem('UserToken');
  }
  getUserObj() {
    if (localStorage.getItem('UserObj')) {
      return JSON.parse(localStorage.getItem('UserObj') || '')
    }
    return {};
  }

  isUserAuth() {
    return this.getAuthBool();
  }
}
