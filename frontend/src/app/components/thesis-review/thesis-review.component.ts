import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService, Thesis, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-thesis-review',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>论文审核</h2>
        <p>审核学生提交的毕业论文</p>
      </div>

      <div class="search-container">
        <div nz-row [nzGutter]="[16, 16]">
          <nz-col [nzSpan]="8">
            <div class="search-item">
              <label>审核状态：</label>
              <nz-select [(ngModel)]="searchStatus" (ngModelChange)="onSearch()" nzAllowClear nzPlaceHolder="全部状态" style="width: 100%;">
                <nz-option nzValue="0" nzLabel="待审核"></nz-option>
                <nz-option nzValue="1" nzLabel="已通过"></nz-option>
                <nz-option nzValue="2" nzLabel="需修改"></nz-option>
              </nz-select>
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
        <nz-table [nzData]="theses" [nzLoading]="loading" nzBordered>
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>论文标题</th>
              <th>版本</th>
              <th>提交时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let thesis of theses">
              <td>{{ thesis.student.user.name }}</td>
              <td>{{ thesis.title }}</td>
              <td>v{{ thesis.version }}</td>
              <td>{{ thesis.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <span [ngClass]="getStatusClass(thesis.status)">
                  {{ getStatusText(thesis.status) }}
                </span>
              </td>
              <td>
                <a (click)="viewDetail(thesis)" style="margin-right: 8px;">查看</a>
                <ng-container *ngIf="thesis.status === 0">
                  <a (click)="passThesis(thesis)" style="margin-right: 8px; color: #52c41a;">通过</a>
                  <a (click)="openRejectModal(thesis)" style="color: #fa8c16;">需修改</a>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </nz-table>

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

        <div *ngIf="!loading && theses.length === 0" class="empty-container" style="text-align: center; padding: 40px; color: #8c8c8c;">
          暂无待审核的论文
        </div>
      </div>
    </div>

    <nz-modal
      [(nzVisible)]="isDetailModalVisible"
      nzTitle="论文详情"
      [nzFooter]="null"
      nzWidth="700px"
    >
      <div *ngIf="selectedThesis">
        <div class="detail-item">
          <span class="detail-label">论文标题：</span>
          <span class="detail-value">{{ selectedThesis.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">学生姓名：</span>
          <span class="detail-value">{{ selectedThesis.student.user.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">学号：</span>
          <span class="detail-value">{{ selectedThesis.student.studentNo }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">版本：</span>
          <span class="detail-value">v{{ selectedThesis.version }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <span class="detail-value">
            <span [ngClass]="getStatusClass(selectedThesis.status)">
              {{ getStatusText(selectedThesis.status) }}
            </span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">关键词：</span>
          <span class="detail-value">{{ selectedThesis.keywords || '-' }}</span>
        </div>
        <div class="detail-item" *ngIf="selectedThesis.abstractText">
          <span class="detail-label">摘要：</span>
          <span class="detail-value" style="line-height: 1.8;">{{ selectedThesis.abstractText }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">提交时间：</span>
          <span class="detail-value">{{ selectedThesis.createdAt | date: 'yyyy-MM-dd HH:mm' }}</span>
        </div>
        <div class="detail-item" *ngIf="selectedThesis.fileName">
          <span class="detail-label">附件：</span>
          <span class="detail-value">
            <i nz-icon nzType="file" nzTheme="outline" style="margin-right: 4px;"></i>
            {{ selectedThesis.fileName }}
          </span>
        </div>
      </div>
    </nz-modal>

    <nz-modal
      [(nzVisible)]="isRejectModalVisible"
      nzTitle="审核意见"
      [nzOkLoading]="submitting"
      nzOkText="提交"
      nzCancelText="取消"
      (nzOnOk)="submitReview()"
      (nzOnCancel)="handleRejectCancel()"
    >
      <form nz-form [formGroup]="reviewForm">
        <nz-form-item>
          <nz-form-label nzRequired>审核意见</nz-form-label>
          <nz-form-control nzErrorTip="请输入审核意见">
            <textarea 
              nz-input 
              formControlName="comments" 
              placeholder="请输入审核意见" 
              rows="4"
            ></textarea>
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>修改建议</nz-form-label>
          <nz-form-control>
            <textarea 
              nz-input 
              formControlName="suggestion" 
              placeholder="请输入修改建议（选填）" 
              rows="3"
            ></textarea>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-modal>
  `,
  styles: []
})
export class ThesisReviewComponent implements OnInit {
  theses: Thesis[] = [];
  loading = false;
  submitting = false;
  page = 1;
  size = 10;
  total = 0;
  searchStatus: number | null = null;

  isDetailModalVisible = false;
  isRejectModalVisible = false;
  selectedThesis: Thesis | null = null;
  reviewForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      comments: [null, [Validators.required]],
      suggestion: [null]
    });

    this.loadTheses();
  }

  loadTheses(): void {
    this.loading = true;
    const status = this.searchStatus !== null ? this.searchStatus : undefined;
    this.apiService.getAllTheses(this.page, this.size, status).subscribe({
      next: (res) => {
        this.loading = false;
        this.theses = res.data?.records || [];
        this.total = res.data?.total || 0;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadTheses();
  }

  onReset(): void {
    this.searchStatus = null;
    this.page = 1;
    this.loadTheses();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadTheses();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadTheses();
  }

  viewDetail(thesis: Thesis): void {
    this.selectedThesis = thesis;
    this.isDetailModalVisible = true;
  }

  passThesis(thesis: Thesis): void {
    this.selectedThesis = thesis;
    this.reviewForm.reset({
      comments: '论文符合要求，审核通过。',
      suggestion: null
    });
    this.submitting = true;
    
    this.apiService.reviewThesis(thesis.id, 1, '论文符合要求，审核通过。').subscribe({
      next: (res) => {
        this.submitting = false;
        this.message.success('审核成功');
        this.loadTheses();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  openRejectModal(thesis: Thesis): void {
    this.selectedThesis = thesis;
    this.reviewForm.reset();
    this.isRejectModalVisible = true;
  }

  handleRejectCancel(): void {
    this.isRejectModalVisible = false;
    this.selectedThesis = null;
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.selectedThesis) {
      Object.values(this.reviewForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    this.apiService.reviewThesis(
      this.selectedThesis.id, 
      2, 
      this.reviewForm.value.comments,
      this.reviewForm.value.suggestion
    ).subscribe({
      next: (res) => {
        this.submitting = false;
        this.isRejectModalVisible = false;
        this.selectedThesis = null;
        this.message.success('审核意见已提交');
        this.loadTheses();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-tag pending';
      case 1:
        return 'status-tag approved';
      case 2:
        return 'status-tag rejected';
      default:
        return 'status-tag';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return '待审核';
      case 1:
        return '已通过';
      case 2:
        return '需修改';
      default:
        return '未知';
    }
  }
}
