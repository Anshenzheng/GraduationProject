import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  template: `
    <nz-layout>
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" nzWidth="200">
        <div class="logo">
          <span *ngIf="!isCollapsed">毕设管理系统</span>
          <span *ngIf="isCollapsed">毕设</span>
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline" [nzInlineCollapsed]="isCollapsed">
          <li nz-menu-item routerLink="/dashboard" nzMatchRouter>
            <i nz-icon nzType="dashboard"></i>
            <span>首页</span>
          </li>
          <li nz-submenu *ngIf="authService.isStudent() || authService.isAdmin()" nzTitle="题目浏览" nzIcon="unordered-list">
            <ul>
              <li nz-menu-item routerLink="/topics" nzMatchRouter>题目列表</li>
            </ul>
          </li>
          <li nz-submenu *ngIf="authService.isTeacher()" nzTitle="题目管理" nzIcon="unordered-list">
            <ul>
              <li nz-menu-item routerLink="/teacher/topics" nzMatchRouter>我的题目</li>
              <li nz-menu-item routerLink="/teacher/selections" nzMatchRouter>选题审核</li>
            </ul>
          </li>
          <li nz-submenu *ngIf="authService.isStudent()" nzTitle="我的选题" nzIcon="select">
            <ul>
              <li nz-menu-item routerLink="/student/selections" nzMatchRouter>选题记录</li>
              <li nz-menu-item routerLink="/theses" nzMatchRouter>论文提交</li>
            </ul>
          </li>
          <li nz-submenu *ngIf="authService.isTeacher()" nzTitle="论文管理" nzIcon="file-text">
            <ul>
              <li nz-menu-item routerLink="/teacher/theses/review" nzMatchRouter>论文审核</li>
            </ul>
          </li>
          <li nz-submenu *ngIf="authService.isAdmin()" nzTitle="系统管理" nzIcon="setting">
            <ul>
              <li nz-menu-item routerLink="/statistics" nzMatchRouter>统计分析</li>
            </ul>
          </li>
        </ul>
      </nz-sider>
      <nz-layout>
        <nz-header>
          <div class="header-left">
            <span class="header-title">毕业设计选题管理系统</span>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="user-avatar">{{ currentUser?.name?.charAt(0) || 'U' }}</div>
              <span class="user-name">{{ currentUser?.name }}</span>
            </div>
            <a (click)="logout()" style="color: #1890ff; cursor: pointer;">退出登录</a>
          </div>
        </nz-header>
        <nz-content style="margin: 24px;">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: []
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.message.success('已退出登录');
    this.router.navigate(['/login']);
  }
}
