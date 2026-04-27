import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { ApiService, Topic, Selection, Thesis } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>欢迎回来，{{ authService.getCurrentUser()?.name }}</h2>
        <p>今天是 {{ today | date: 'yyyy年MM月dd日' }}</p>
      </div>

      <div class="stats-cards" *ngIf="!authService.isAdmin()">
        <nz-card *ngIf="authService.isStudent()">
          <nz-statistic [nzValue]="studentSelectionStatus ? (studentSelectionStatus === 1 ? '已通过' : studentSelectionStatus === 0 ? '待审核' : '已拒绝') : '未选题'" [nzTitle]="'选题状态'" [nzSuffix]="''">
          </nz-statistic>
        </nz-card>
        <nz-card *ngIf="authService.isStudent()">
          <nz-statistic [nzValue]="thesisCount" [nzTitle]="'已提交论文数'"></nz-statistic>
        </nz-card>
        <nz-card *ngIf="authService.isTeacher()">
          <nz-statistic [nzValue]="topicCount" [nzTitle]="'已发布题目数'"></nz-statistic>
        </nz-card>
        <nz-card *ngIf="authService.isTeacher()">
          <nz-statistic [nzValue]="pendingSelectionCount" [nzTitle]="'待审核选题数'"></nz-statistic>
        </nz-card>
      </div>

      <div *ngIf="authService.isAdmin()" class="card-container">
        <h3 style="margin-bottom: 16px;">系统概览</h3>
        <div class="stats-cards" style="margin-bottom: 0;">
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.totalTopics || 0" [nzTitle]="'总题目数'" [nzPrefix]="'📚'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.activeTopics || 0" [nzTitle]="'上架题目数'" [nzPrefix]="'📖'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.totalSelections || 0" [nzTitle]="'总选题数'" [nzPrefix]="'📋'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.approvedSelections || 0" [nzTitle]="'已通过选题数'" [nzPrefix]="'✅'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.pendingSelections || 0" [nzTitle]="'待审核选题数'" [nzPrefix]="'⏳'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewStatistics?.totalTheses || 0" [nzTitle]="'总论文数'" [nzPrefix]="'📄'"></nz-statistic>
          </nz-card>
        </div>
      </div>

      <div class="card-container" style="margin-top: 24px;">
        <h3 style="margin-bottom: 16px;">快捷操作</h3>
        <div nz-row [nzGutter]="[16, 16]">
          <nz-col [nzSpan]="6" *ngIf="authService.isStudent()">
            <button nz-button nzType="primary" nzBlock (click)="goToTopics()">
              <i nz-icon nzType="search" nzTheme="outline" style="margin-right: 8px;"></i>
              浏览题目
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isStudent()">
            <button nz-button nzBlock (click)="goToMySelections()">
              <i nz-icon nzType="history" nzTheme="outline" style="margin-right: 8px;"></i>
              我的选题
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isTeacher()">
            <button nz-button nzType="primary" nzBlock (click)="goToMyTopics()">
              <i nz-icon nzType="plus" nzTheme="outline" style="margin-right: 8px;"></i>
              管理题目
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isTeacher()">
            <button nz-button nzBlock (click)="goToSelections()">
              <i nz-icon nzType="audit" nzTheme="outline" style="margin-right: 8px;"></i>
              审核选题
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isStudent()">
            <button nz-button nzBlock (click)="goToTheses()">
              <i nz-icon nzType="file-text" nzTheme="outline" style="margin-right: 8px;"></i>
              提交论文
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isTeacher()">
            <button nz-button nzBlock (click)="goToThesisReview()">
              <i nz-icon nzType="file-search" nzTheme="outline" style="margin-right: 8px;"></i>
              审核论文
            </button>
          </nz-col>
          <nz-col [nzSpan]="6" *ngIf="authService.isAdmin()">
            <button nz-button nzType="primary" nzBlock (click)="goToStatistics()">
              <i nz-icon nzType="bar-chart" nzTheme="outline" style="margin-right: 8px;"></i>
              统计分析
            </button>
          </nz-col>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  today = new Date();
  studentSelectionStatus: number | null = null;
  thesisCount = 0;
  topicCount = 0;
  pendingSelectionCount = 0;
  overviewStatistics: { [key: string]: number } | null = null;

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.authService.isStudent()) {
      this.apiService.getStudentSelections(1, 10).subscribe(res => {
        const selections = res.data?.records || [];
        if (selections.length > 0) {
          this.studentSelectionStatus = selections[0].status;
        }
      });

      this.apiService.getStudentTheses(1, 1).subscribe(res => {
        this.thesisCount = res.data?.total || 0;
      });
    } else if (this.authService.isTeacher()) {
      this.apiService.getTeacherTopics(1, 1).subscribe(res => {
        this.topicCount = res.data?.total || 0;
      });

      this.apiService.getTeacherSelections(1, 1, 0).subscribe(res => {
        this.pendingSelectionCount = res.data?.total || 0;
      });
    } else if (this.authService.isAdmin()) {
      this.apiService.getOverviewStatistics().subscribe(res => {
        this.overviewStatistics = res.data;
      });
    }
  }

  goToTopics(): void {
    this.router.navigate(['/topics']);
  }

  goToMySelections(): void {
    this.router.navigate(['/student/selections']);
  }

  goToMyTopics(): void {
    this.router.navigate(['/teacher/topics']);
  }

  goToSelections(): void {
    this.router.navigate(['/teacher/selections']);
  }

  goToTheses(): void {
    this.router.navigate(['/theses']);
  }

  goToThesisReview(): void {
    this.router.navigate(['/teacher/theses/review']);
  }

  goToStatistics(): void {
    this.router.navigate(['/statistics']);
  }
}
