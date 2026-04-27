import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1>毕业设计选题管理系统</h1>
          <p>请登录您的账号</p>
        </div>
        <form nz-form [formGroup]="loginForm" (ngSubmit)="submitForm()" class="login-form">
          <nz-form-item>
            <nz-form-control nzErrorTip="请输入用户名">
              <nz-input-group nzPrefixIcon="user">
                <input type="text" nz-input formControlName="username" placeholder="请输入用户名" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control nzErrorTip="请输入密码">
              <nz-input-group nzPrefixIcon="lock">
                <input type="password" nz-input formControlName="password" placeholder="请输入密码" (keyup.enter)="submitForm()" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-control>
              <button nz-button nzType="primary" nzSize="large" nzBlock [nzLoading]="loading">
                登录
              </button>
            </nz-form-control>
          </nz-form-item>
        </form>
        <div class="login-footer">
          还没有账号？<a routerLink="/register">立即注册</a>
        </div>
        <div class="login-footer" style="margin-top: 16px; font-size: 12px; color: #bfbfbf;">
          默认账号：admin / teacher1 / student1，密码：admin123
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.loading = false;
          this.message.success('登录成功');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: (err) => {
          this.loading = false;
          this.message.error(err.error?.message || '登录失败');
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
