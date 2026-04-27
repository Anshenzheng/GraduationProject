import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-statistics',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>统计分析</h2>
        <p>查看系统整体统计数据</p>
      </div>

      <div class="card-container" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">系统概览</h3>
          <button nz-button nzType="primary" (click)="exportSelections()">
            <i nz-icon nzType="download" nzTheme="outline" style="margin-right: 4px;"></i>
            导出选题名单
          </button>
        </div>
        <div class="stats-cards" style="margin-bottom: 0;">
          <nz-card>
            <nz-statistic [nzValue]="overview?.totalTopics || 0" [nzTitle]="'总题目数'" [nzPrefix]="'📚'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overview?.activeTopics || 0" [nzTitle]="'上架题目数'" [nzPrefix]="'📖'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overview?.totalSelections || 0" [nzTitle]="'总选题数'" [nzPrefix]="'📋'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overview?.approvedSelections || 0" [nzTitle]="'已通过选题'" [nzPrefix]="'✅'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overview?.pendingSelections || 0" [nzTitle]="'待审核选题'" [nzPrefix]="'⏳'"></nz-statistic>
          </nz-card>
          <nz-card>
            <nz-statistic [nzValue]="overview?.totalTheses || 0" [nzTitle]="'总论文数'" [nzPrefix]="'📄'"></nz-statistic>
          </nz-card>
        </div>
      </div>

      <div nz-row [nzGutter]="[24, 24]">
        <nz-col [nzSpan]="12">
          <div class="card-container">
            <h3 style="margin-bottom: 16px;">题目类型分布</h3>
            <div *ngIf="typeStatistics">
              <h4 style="margin-bottom: 12px; color: #595959;">题目数量分布</h4>
              <div *ngFor="let item of typeCountItems" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>{{ item.name }}</span>
                  <span style="font-weight: 600;">{{ item.value }} 个</span>
                </div>
                <nz-progress [nzPercent]="getPercentage(item.value, typeCountTotal)" [nzShowInfo]="false"></nz-progress>
              </div>
              
              <h4 style="margin: 24px 0 12px; color: #595959;">已选学生分布</h4>
              <div *ngFor="let item of typeSelectedItems" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>{{ item.name }}</span>
                  <span style="font-weight: 600;">{{ item.value }} 人</span>
                </div>
                <nz-progress [nzPercent]="getPercentage(item.value, typeSelectedTotal)" [nzShowInfo]="false"></nz-progress>
              </div>
            </div>
          </div>
        </nz-col>

        <nz-col [nzSpan]="12">
          <div class="card-container">
            <h3 style="margin-bottom: 16px;">教师统计</h3>
            <div *ngIf="teacherStatistics">
              <h4 style="margin-bottom: 12px; color: #595959;">发布题目数</h4>
              <div *ngFor="let item of teacherTopicItems" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>{{ item.name }}</span>
                  <span style="font-weight: 600;">{{ item.value }} 个</span>
                </div>
                <nz-progress [nzPercent]="getPercentage(item.value, teacherTopicTotal)" [nzShowInfo]="false"></nz-progress>
              </div>
              
              <h4 style="margin: 24px 0 12px; color: #595959;">指导学生数</h4>
              <div *ngFor="let item of teacherStudentItems" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>{{ item.name }}</span>
                  <span style="font-weight: 600;">{{ item.value }} 人</span>
                </div>
                <nz-progress [nzPercent]="getPercentage(item.value, teacherStudentTotal)" [nzShowInfo]="false"></nz-progress>
              </div>
            </div>
          </div>
        </nz-col>
      </div>
    </div>
  `,
  styles: []
})
export class StatisticsComponent implements OnInit {
  overview: { [key: string]: number } | null = null;
  typeStatistics: { typeCount: { [key: string]: number }; typeSelected: { [key: string]: number } } | null = null;
  teacherStatistics: { teacherTopicCount: { [key: string]: number }; teacherStudentCount: { [key: string]: number } } | null = null;

  typeCountItems: { name: string; value: number }[] = [];
  typeSelectedItems: { name: string; value: number }[] = [];
  teacherTopicItems: { name: string; value: number }[] = [];
  teacherStudentItems: { name: string; value: number }[] = [];

  typeCountTotal = 0;
  typeSelectedTotal = 0;
  teacherTopicTotal = 0;
  teacherStudentTotal = 0;

  constructor(
    private apiService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadOverview();
    this.loadTypeStatistics();
    this.loadTeacherStatistics();
  }

  loadOverview(): void {
    this.apiService.getOverviewStatistics().subscribe(res => {
      this.overview = res.data;
    });
  }

  loadTypeStatistics(): void {
    this.apiService.getTopicTypeStatistics().subscribe(res => {
      this.typeStatistics = res.data;
      
      if (this.typeStatistics?.typeCount) {
        this.typeCountItems = Object.entries(this.typeStatistics.typeCount).map(([name, value]) => ({ name, value }));
        this.typeCountTotal = this.typeCountItems.reduce((sum, item) => sum + item.value, 0);
      }
      
      if (this.typeStatistics?.typeSelected) {
        this.typeSelectedItems = Object.entries(this.typeStatistics.typeSelected).map(([name, value]) => ({ name, value }));
        this.typeSelectedTotal = this.typeSelectedItems.reduce((sum, item) => sum + item.value, 0);
      }
    });
  }

  loadTeacherStatistics(): void {
    this.apiService.getTeacherStatistics().subscribe(res => {
      this.teacherStatistics = res.data;
      
      if (this.teacherStatistics?.teacherTopicCount) {
        this.teacherTopicItems = Object.entries(this.teacherStatistics.teacherTopicCount).map(([name, value]) => ({ name, value }));
        this.teacherTopicTotal = this.teacherTopicItems.reduce((sum, item) => sum + item.value, 0);
      }
      
      if (this.teacherStatistics?.teacherStudentCount) {
        this.teacherStudentItems = Object.entries(this.teacherStatistics.teacherStudentCount).map(([name, value]) => ({ name, value }));
        this.teacherStudentTotal = this.teacherStudentItems.reduce((sum, item) => sum + item.value, 0);
      }
    });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  exportSelections(): void {
    this.apiService.exportSelections().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `选题名单_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.message.success('导出成功');
      },
      error: () => {
        this.message.error('导出失败');
      }
    });
  }
}
