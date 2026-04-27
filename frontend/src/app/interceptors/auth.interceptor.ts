import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private message: NzMessageService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
          this.message.error('登录已过期，请重新登录');
        } else if (error.status === 403) {
          this.message.error('没有权限访问该资源');
        } else if (error.status === 500) {
          const errorMessage = error.error?.message || '服务器内部错误';
          this.message.error(errorMessage);
        } else if (error.status === 400) {
          const errorMessage = error.error?.message || '请求参数错误';
          this.message.error(errorMessage);
        }
        return throwError(() => error);
      })
    );
  }
}
