import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { ApiService, Topic, Selection, Thesis } from '../../services/api.service';

export interface OverviewData {
  totalTopics: number;
  activeTopics: number;
  totalSelections: number;
  approvedSelections: number;
  pendingSelections: number;
  totalTheses: number;
  approvedTheses: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>欢迎回来，{{ currentUserName }}</h2>
        <p>今天是 {{ today | date: 'yyyy年MM月dd日' }}</p>
      </div>

      <div class="stats-cards" *ngIf="!authService.isAdmin()">
        <nz-card *ngIf="authService.isStudent()">
          <nz-statistic [nzValue]="studentSelectionStatusDisplay" [nzTitle]="'选题状态'" [nzSuffix]="''">
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
            <nz-statistic [nzValue]="overviewData?.totalTopics || 0" [nzTitle]="'总题目数'" [nzPrefix]="'📚'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewData?.activeTopics || 0" [nzTitle]="'上架题目数'" [nzPrefix]="'📖'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewData?.totalSelections || 0" [nzTitle]="'总选题数'" [nzPrefix]="'📋'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewData?.approvedSelections || 0" [nzTitle]="'已通过选题数'" [nzPrefix]="'✅'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewData?.pendingSelections || 0" [nzTitle]="'待审核选题数'" [nzPrefix]="'⏳'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overviewData?.totalTheses || 0" [nzTitle]="'总论文数'" [nzPrefix]="'📄'"></nz-statistic>
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
  overviewData: OverviewData | null = null;
  currentUserName = '';

  get studentSelectionStatusDisplay(): string {
    if (this.studentSelectionStatus === null) return '未选题';
    switch (this.studentSelectionStatus) {
      case 0: return '待审核';
      case 1: return '已通过';
      case 2: return '已拒绝';
      default: return '未知';
    }
  }

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.name || '';
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
        if (res.data) {
          const data = res.data as any;
          this.overviewData = {
            totalTopics: data['totalTopics'] || 0,
            activeTopics: data['activeTopics'] || 0,
            totalSelections: data['totalSelections'] || 0,
            approvedSelections: data['approvedSelections'] || 0,
            pendingSelections: data['pendingSelections'] || 0,
            totalTheses: data['totalTheses'] || 0,
            approvedTheses: data['approvedTheses'] || 0
          };
        }
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
