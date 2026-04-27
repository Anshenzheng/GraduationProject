import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';
import { ApiService, Thesis, Selection, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-thesis',
  template: `
    <div class="page-container">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>论文管理</h2>
          <p>{{ authService.isStudent() ? '提交和管理您的毕业论文' : '查看所有论文信息' }}</p>
        </div>
        <button 
          *ngIf="authService.isStudent() && hasApprovedSelection" 
          nz-button nzType="primary" 
          (click)="openSubmitModal()"
        >
          <i nz-icon nzType="plus" nzTheme="outline"></i> 提交论文
        </button>
      </div>

      <div *ngIf="authService.isStudent() && !hasApprovedSelection" class="card-container">
        <div style="text-align: center; padding: 40px; color: #8c8c8c;">
          <i nz-icon nzType="info-circle" nzTheme="outline" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>您还没有通过审核的选题，无法提交论文</p>
          <p style="margin-top: 8px;">请先完成选题并等待教师审核通过</p>
        </div>
      </div>

      <div class="card-container" *ngIf="!authService.isStudent() || hasApprovedSelection">
        <nz-table [nzData]="theses" [nzLoading]="loading" nzBordered>
          <thead>
            <tr>
              <th>论文标题</th>
              <th *ngIf="!authService.isStudent()">学生姓名</th>
              <th>版本</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let thesis of theses">
              <td>{{ thesis.title }}</td>
              <td *ngIf="!authService.isStudent()">{{ thesis.student?.user?.name }}</td>
              <td>v{{ thesis.version }}</td>
              <td>
                <span [ngClass]="getStatusClass(thesis.status)">
                  {{ getStatusText(thesis.status) }}
                </span>
              </td>
              <td>{{ thesis.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <a (click)="viewDetail(thesis)" style="margin-right: 8px;">查看</a>
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
          暂无论文记录
        </div>
      </div>
    </div>

    <nz-modal
      [(nzVisible)]="isSubmitModalVisible"
      nzTitle="提交论文"
      [nzOkLoading]="submitting"
      nzOkText="提交"
      nzCancelText="取消"
      (nzOnOk)="submitThesis()"
      (nzOnCancel)="handleSubmitCancel()"
      nzWidth="600px"
    >
      <form nz-form [formGroup]="thesisForm">
        <nz-form-item>
          <nz-form-label nzRequired>论文标题</nz-form-label>
          <nz-form-control nzErrorTip="请输入论文标题">
            <input type="text" nz-input formControlName="title" placeholder="请输入论文标题" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>关键词</nz-form-label>
          <nz-form-control>
            <input type="text" nz-input formControlName="keywords" placeholder="多个关键词用逗号分隔" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>摘要</nz-form-label>
          <nz-form-control>
            <textarea 
              nz-input 
              formControlName="abstractText" 
              placeholder="请输入论文摘要" 
              rows="4"
            ></textarea>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>上传论文文件</nz-form-label>
          <nz-form-control>
            <nz-upload
              nzType="drag"
              [nzMultiple]="false"
              [nzFileList]="fileList"
              [nzBeforeUpload]="beforeUpload"
            >
              <ng-template #nzIcon><i nz-icon nzType="inbox" class="upload-icon"></i></ng-template>
              <div class="ant-upload-text">点击或将文件拖拽到这里上传</div>
              <div class="ant-upload-hint">支持 doc、docx、pdf 格式，大小不超过 50MB</div>
            </nz-upload>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-modal>

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
          <span class="detail-value">{{ selectedThesis.student?.user?.name }}</span>
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
  `,
  styles: []
})
export class ThesisComponent implements OnInit {
  theses: Thesis[] = [];
  loading = false;
  submitting = false;
  page = 1;
  size = 10;
  total = 0;
  hasApprovedSelection = false;

  isSubmitModalVisible = false;
  isDetailModalVisible = false;
  thesisForm!: FormGroup;
  fileList: any[] = [];
  selectedThesis: Thesis | null = null;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.thesisForm = this.fb.group({
      title: [null, [Validators.required]],
      keywords: [null],
      abstractText: [null]
    });

    this.checkApprovedSelection();
    this.loadTheses();
  }

  checkApprovedSelection(): void {
    if (this.authService.isStudent()) {
      this.apiService.getStudentSelections(1, 100).subscribe(res => {
        const selections = res.data?.records || [];
        this.hasApprovedSelection = selections.some(s => s.status === 1);
      });
    }
  }

  loadTheses(): void {
    this.loading = true;
    
    let observable;
    if (this.authService.isStudent()) {
      observable = this.apiService.getStudentTheses(this.page, this.size);
    } else {
      observable = this.apiService.getAllTheses(this.page, this.size);
    }

    observable.subscribe({
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

  onPageChange(page: number): void {
    this.page = page;
    this.loadTheses();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadTheses();
  }

  openSubmitModal(): void {
    this.thesisForm.reset();
    this.fileList = [];
    this.isSubmitModalVisible = true;
  }

  handleSubmitCancel(): void {
    this.isSubmitModalVisible = false;
  }

  beforeUpload = (file: any): boolean => {
    this.fileList = [file];
    return false;
  };

  submitThesis(): void {
    if (this.thesisForm.invalid) {
      Object.values(this.thesisForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formData = new FormData();
    
    const thesisData = {
      title: this.thesisForm.value.title,
      keywords: this.thesisForm.value.keywords,
      abstractText: this.thesisForm.value.abstractText
    };
    
    formData.append('thesis', new Blob([JSON.stringify(thesisData)], { type: 'application/json' }));
    
    if (this.fileList.length > 0) {
      formData.append('file', this.fileList[0]);
    }

    this.submitting = true;
    this.apiService.submitThesis(formData).subscribe({
      next: (res) => {
        this.submitting = false;
        this.isSubmitModalVisible = false;
        this.message.success('论文提交成功');
        this.loadTheses();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  viewDetail(thesis: Thesis): void {
    this.selectedThesis = thesis;
    this.isDetailModalVisible = true;
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
