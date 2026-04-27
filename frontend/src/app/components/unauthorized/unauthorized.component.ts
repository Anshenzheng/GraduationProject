import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="login-container" style="background: #f0f2f5;">
      <div style="text-align: center; padding: 80px 24px;">
        <div style="font-size: 120px; font-weight: bold; color: #1890ff; margin-bottom: 16px;">403</div>
        <h2 style="margin-bottom: 8px; color: #262626;">无权限访问</h2>
        <p style="color: #8c8c8c; margin-bottom: 24px;">您没有权限访问该页面，请联系管理员</p>
        <button nz-button nzType="primary" (click)="goHome()">
          <i nz-icon nzType="home" nzTheme="outline" style="margin-right: 4px;"></i>
          返回首页
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
