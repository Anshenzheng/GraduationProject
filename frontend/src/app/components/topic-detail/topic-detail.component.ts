import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { ApiService, Topic } from '../../services/api.service';

@Component({
  selector: 'app-topic-detail',
  template: `
    <div class="page-container">
      <div class="page-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <button nz-button (click)="goBack()" style="margin-right: 16px;">
            <i nz-icon nzType="left" nzTheme="outline"></i> 返回
          </button>
          <h2 style="display: inline;">题目详情</h2>
        </div>
        <div *ngIf="authService.isStudent() && topic">
          <button 
            nz-button nzType="primary" 
            [nzLoading]="selecting"
            [disabled]="topic.currentStudents >= topic.maxStudents"
            (click)="selectTopic()"
          >
            <i nz-icon nzType="select" nzTheme="outline" style="margin-right: 4px;"></i>
            选择此题
          </button>
        </div>
      </div>

      <div class="card-container" *ngIf="topic">
        <div class="detail-item">
          <span class="detail-label">题目名称：</span>
          <span class="detail-value" style="font-size: 20px; font-weight: 600;">{{ topic.title }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">题目类型：</span>
          <span class="detail-value">
            <span *ngIf="topic.type" class="status-tag active">{{ topic.type.name }}</span>
            <span *ngIf="!topic.type">未分类</span>
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">指导教师：</span>
          <span class="detail-value">
            {{ topic.teacher?.user?.name }}
            <span *ngIf="topic.teacher?.title" style="color: #8c8c8c; margin-left: 8px;">
              ({{ topic.teacher.title }})
            </span>
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">教师院系：</span>
          <span class="detail-value">{{ topic.teacher.department || '暂无' }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">研究方向：</span>
          <span class="detail-value">{{ topic.teacher?.researchDirection || '暂无' }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">选题状态：</span>
          <span class="detail-value">
            <span 
              [ngClass]="topic.currentStudents >= topic.maxStudents ? 'status-tag rejected' : 'status-tag approved'"
            >
              {{ topic.currentStudents }}/{{ topic.maxStudents }} 
              ({{ topic.currentStudents >= topic.maxStudents ? '已满' : '可选' }})
            </span>
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">题目描述：</span>
          <span class="detail-value" style="line-height: 1.8; white-space: pre-wrap;">
            {{ topic.description || '暂无描述' }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">发布时间：</span>
          <span class="detail-value">{{ topic.createdAt | date: 'yyyy-MM-dd HH:mm' }}</span>
        </div>
      </div>

      <div class="card-container" *ngIf="!loading && !topic">
        <div style="text-align: center; padding: 40px; color: #8c8c8c;">
          题目不存在或已被删除
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TopicDetailComponent implements OnInit {
  topic: Topic | null = null;
  loading = false;
  selecting = false;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadTopic(+id);
    }
  }

  loadTopic(id: number): void {
    this.loading = true;
    this.apiService.getPublicTopic(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.topic = res.data;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/topics']);
  }

  selectTopic(): void {
    if (!this.topic) return;

    this.selecting = true;
    this.apiService.selectTopic(this.topic.id).subscribe({
      next: (res) => {
        this.selecting = false;
        this.message.success('选题申请已提交，请等待教师审核');
        this.loadTopic(this.topic!.id);
      },
      error: (err) => {
        this.selecting = false;
      }
    });
  }
}
