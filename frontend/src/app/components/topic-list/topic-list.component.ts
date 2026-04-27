import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { ApiService, Topic, TopicType, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-topic-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>题目列表</h2>
        <p>浏览所有可选择的毕业设计题目</p>
      </div>

      <div class="search-container">
        <div nz-row [nzGutter]="[16, 16]">
          <nz-col [nzSpan]="8">
            <div class="search-item">
              <label>题目类型：</label>
              <nz-select [(ngModel)]="searchType" (ngModelChange)="onSearch()" nzAllowClear nzPlaceHolder="全部类型" style="width: 100%;">
                <nz-option *ngFor="let type of topicTypes" [nzValue]="type.id" [nzLabel]="type.name"></nz-option>
              </nz-select>
            </div>
          </nz-col>
          <nz-col [nzSpan]="8">
            <div class="search-item">
              <label>关键词：</label>
              <input nz-input [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()" placeholder="请输入题目关键词" />
            </div>
          </nz-col>
          <nz-col [nzSpan]="8">
            <div class="search-actions">
              <button nz-button nzType="primary" (click)="onSearch()">
                <i nz-icon nzType="search" nzTheme="outline"></i> 搜索
              </button>
              <button nz-button (click)="onReset()">
                <i nz-icon nzType="reload" nzTheme="outline"></i> 重置
              </button>
            </div>
          </nz-col>
        </div>
      </div>

      <div class="card-container">
        <div *ngIf="loading" class="loading-container" style="text-align: center; padding: 40px;">
          <i nz-icon nzType="loading" nzSpin nzSize="large"></i>
        </div>

        <div *ngIf="!loading && topics.length === 0" class="empty-container" style="text-align: center; padding: 40px; color: #8c8c8c;">
          暂无题目数据
        </div>

        <div *ngIf="!loading && topics.length > 0">
          <div *ngFor="let topic of topics" class="topic-card" style="border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #262626;">{{ topic.title }}</h3>
              <span *ngIf="topic.type" class="status-tag active">{{ topic.type.name }}</span>
            </div>
            <p style="color: #595959; margin-bottom: 12px; line-height: 1.6;">{{ topic.description || '暂无描述' }}</p>
            <div style="display: flex; gap: 24px; margin-bottom: 16px;">
              <span style="color: #8c8c8c;">
                <i nz-icon nzType="user" nzTheme="outline" style="margin-right: 4px;"></i>
                指导教师：{{ topic.teacher?.user?.name }}
              </span>
              <span style="color: #8c8c8c;">
                <i nz-icon nzType="team" nzTheme="outline" style="margin-right: 4px;"></i>
                已选：{{ topic.currentStudents }}/{{ topic.maxStudents }}
              </span>
              <span [style.color]="topic.currentStudents >= topic.maxStudents ? '#ff4d4f' : '#52c41a'">
                {{ topic.currentStudents >= topic.maxStudents ? '已满' : '可选' }}
              </span>
            </div>
            <div style="display: flex; gap: 12px;">
              <button nz-button nzType="primary" (click)="viewDetail(topic)">
                <i nz-icon nzType="eye" nzTheme="outline" style="margin-right: 4px;"></i>
                查看详情
              </button>
              <button 
                nz-button 
                *ngIf="authService.isStudent()"
                [nzLoading]="selecting === topic.id"
                [disabled]="topic.currentStudents >= topic.maxStudents"
                (click)="selectTopic(topic)"
              >
                <i nz-icon nzType="select" nzTheme="outline" style="margin-right: 4px;"></i>
                选择此题
              </button>
            </div>
          </div>

          <div class="pagination-container" *ngIf="total > 0">
            <nz-pagination
              [nzPageIndex]="page"
              [nzPageSize]="size"
              [nzTotal]="total"
              (nzPageIndexChange)="onPageChange($event)"
              nzShowSizeChanger
              [nzPageSizeOptions]="[10, 20, 50]"
              (nzPageSizeChange)="onSizeChange($event)"
            ></nz-pagination>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TopicListComponent implements OnInit {
  topics: Topic[] = [];
  topicTypes: TopicType[] = [];
  loading = false;
  selecting: number | null = null;
  page = 1;
  size = 10;
  total = 0;
  searchType: number | null = null;
  searchKeyword = '';

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadTopicTypes();
    this.loadTopics();
  }

  loadTopicTypes(): void {
    this.apiService.getTopicTypes().subscribe(res => {
      this.topicTypes = res.data || [];
    });
  }

  loadTopics(): void {
    this.loading = true;
    this.apiService.getPublicTopics(this.page, this.size).subscribe({
      next: (res) => {
        this.loading = false;
        this.topics = res.data?.records || [];
        this.total = res.data?.total || 0;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadTopics();
  }

  onReset(): void {
    this.searchType = null;
    this.searchKeyword = '';
    this.page = 1;
    this.loadTopics();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadTopics();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadTopics();
  }

  viewDetail(topic: Topic): void {
    this.router.navigate(['/topics', topic.id]);
  }

  selectTopic(topic: Topic): void {
    this.selecting = topic.id;
    this.apiService.selectTopic(topic.id).subscribe({
      next: (res) => {
        this.selecting = null;
        this.message.success('选题申请已提交，请等待教师审核');
        this.loadTopics();
      },
      error: (err) => {
        this.selecting = null;
      }
    });
  }
}
