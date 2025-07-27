import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, retry, throwError } from 'rxjs';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const AuthToken = localStorage.getItem('UserToken');

    let headers = req.headers;
    // Add authorization token to headers
    headers = headers.append('Authorization', 'Bearer ' + AuthToken);
    // Add lang to headers
    let lang = localStorage.getItem('currentLang');
    lang = lang?.toLocaleLowerCase() || 'ar'
    headers = headers.set('Accept-Language', lang);

    const authRequest = req.clone({ headers });
    return next.handle(authRequest)
  }
}