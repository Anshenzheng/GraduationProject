import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="login-container">
      <div class="login-box" style="width: 480px;">
        <div class="login-header">
          <h1>毕业设计选题管理系统</h1>
          <p>注册新账号</p>
        </div>
        <form nz-form [formGroup]="registerForm" (ngSubmit)="submitForm()" class="login-form">
          <nz-form-item>
            <nz-form-control nzErrorTip="请选择角色">
              <nz-select formControlName="roleCode" (ngModelChange)="onRoleChange($event)" nzPlaceHolder="请选择角色">
                <nz-option nzValue="STUDENT" nzLabel="学生"></nz-option>
                <nz-option nzValue="TEACHER" nzLabel="教师"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control nzErrorTip="请输入用户名">
              <nz-input-group nzPrefixIcon="user">
                <input type="text" nz-input formControlName="username" placeholder="请输入用户名" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control nzErrorTip="请输入姓名">
              <nz-input-group nzPrefixIcon="user">
                <input type="text" nz-input formControlName="name" placeholder="请输入姓名" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control nzErrorTip="请输入密码">
              <nz-input-group nzPrefixIcon="lock">
                <input type="password" nz-input formControlName="password" placeholder="请输入密码" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzErrorTip]="confirmPasswordError">
              <nz-input-group nzPrefixIcon="lock">
                <input type="password" nz-input formControlName="confirmPassword" placeholder="请确认密码" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'STUDENT'">
            <nz-form-control nzErrorTip="请输入学号">
              <nz-input-group nzPrefixIcon="idcard">
                <input type="text" nz-input formControlName="studentNo" placeholder="请输入学号" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'TEACHER'">
            <nz-form-control nzErrorTip="请输入工号">
              <nz-input-group nzPrefixIcon="idcard">
                <input type="text" nz-input formControlName="teacherNo" placeholder="请输入工号" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <nz-input-group nzPrefixIcon="mail">
                <input type="email" nz-input formControlName="email" placeholder="请输入邮箱（选填）" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <nz-input-group nzPrefixIcon="phone">
                <input type="text" nz-input formControlName="phone" placeholder="请输入手机号（选填）" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'STUDENT'">
            <nz-form-control>
              <nz-input-group nzPrefixIcon="building">
                <input type="text" nz-input formControlName="department" placeholder="请输入院系（选填）" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'STUDENT'">
            <nz-form-control>
              <nz-input-group nzPrefixIcon="book">
                <input type="text" nz-input formControlName="major" placeholder="请输入专业（选填）" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'STUDENT'">
            <nz-row nzGutter="8">
              <nz-col nzSpan="12">
                <nz-form-control>
                  <input type="text" nz-input formControlName="className" placeholder="班级（选填）" />
                </nz-form-control>
              </nz-col>
              <nz-col nzSpan="12">
                <nz-form-control>
                  <input type="text" nz-input formControlName="grade" placeholder="年级（选填）" />
                </nz-form-control>
              </nz-col>
            </nz-row>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'TEACHER'">
            <nz-form-control>
              <nz-input-group nzPrefixIcon="building">
                <input type="text" nz-input formControlName="department" placeholder="请输入院系（选填）" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="currentRole === 'TEACHER'">
            <nz-row nzGutter="8">
              <nz-col nzSpan="12">
                <nz-form-control>
                  <input type="text" nz-input formControlName="title" placeholder="职称（选填）" />
                </nz-form-control>
              </nz-col>
              <nz-col nzSpan="12">
                <nz-form-control>
                  <input type="text" nz-input formControlName="researchDirection" placeholder="研究方向（选填）" />
                </nz-form-control>
              </nz-col>
            </nz-row>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <button nz-button nzType="primary" nzSize="large" nzBlock [nzLoading]="loading">
                注册
              </button>
            </nz-form-control>
          </nz-form-item>
        </form>
        <div class="login-footer">
          已有账号？<a routerLink="/login">立即登录</a>
        </div>
      </div>
    </div>

    <ng-template #confirmPasswordError>
      <span *ngIf="registerForm.get('confirmPassword')?.hasError('required')">请确认密码</span>
      <span *ngIf="registerForm.get('confirmPassword')?.hasError('confirm')">两次密码输入不一致</span>
    </ng-template>
  `,
  styles: []
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  currentRole = 'STUDENT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: [null, [Validators.required]],
      name: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required]],
      roleCode: ['STUDENT', [Validators.required]],
      email: [null],
      phone: [null],
      studentNo: [null],
      teacherNo: [null],
      department: [null],
      major: [null],
      className: [null],
      grade: [null],
      title: [null],
      researchDirection: [null]
    }, {
      validators: this.confirmPasswordValidator
    });
  }

  confirmPasswordValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ confirm: true });
      return { confirm: true };
    }
    return null;
  };

  onRoleChange(role: string): void {
    this.currentRole = role;
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      const formValue = { ...this.registerForm.value };
      delete formValue.confirmPassword;

      this.loading = true;
      this.authService.register(formValue).subscribe({
        next: (res) => {
          this.loading = false;
          this.message.success('注册成功，请登录');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.message.error(err.error?.message || '注册失败');
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
