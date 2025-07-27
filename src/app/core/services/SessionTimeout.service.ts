import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  constructor(private router: Router,private auth:AuthService,private toastr:ToastrService) {}

  checkSessionTimeout(): Observable<boolean> {
    return interval(1000).pipe(
      map(() => {
        const loginTime = parseInt(localStorage.getItem('loginTime') || '0', 10);
        const timeoutDuration = parseInt(localStorage.getItem('token_expiration') || '0', 10);
        const currentTime = new Date().getTime();
        return currentTime - loginTime > timeoutDuration;
      }),
      filter(isTimeout => isTimeout)
    );
  }

  logout(): void {
   this.auth.signOut()
  }
}
