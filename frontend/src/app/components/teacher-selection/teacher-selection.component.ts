import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService, Selection, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-teacher-selection',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>选题审核</h2>
        <p>审核学生的选题申请</p>
      </div>

      <div class="search-container">
        <div nz-row [nzGutter]="[16, 16]">
          <nz-col [nzSpan]="8">
            <div class="search-item">
              <label>审核状态：</label>
              <nz-select [(ngModel)]="searchStatus" (ngModelChange)="onSearch()" nzAllowClear nzPlaceHolder="全部状态" style="width: 100%;">
                <nz-option nzValue="0" nzLabel="待审核"></nz-option>
                <nz-option nzValue="1" nzLabel="已通过"></nz-option>
                <nz-option nzValue="2" nzLabel="已拒绝"></nz-option>
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
        <nz-table [nzData]="selections" [nzLoading]="loading" nzBordered>
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>学号</th>
              <th>题目名称</th>
              <th>申请时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let selection of selections">
              <td>{{ selection.student?.user?.name }}</td>
              <td>{{ selection.student?.studentNo }}</td>
              <td>{{ selection.topic?.title }}</td>
              <td>{{ selection.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <span [ngClass]="getStatusClass(selection.status)">
                  {{ getStatusText(selection.status) }}
                </span>
              </td>
              <td>
                <ng-container *ngIf="selection.status === 0">
                  <a (click)="reviewSelection(selection, 1)" style="margin-right: 8px; color: #52c41a;">通过</a>
                  <a (click)="openRejectModal(selection)" style="color: #ff4d4f;">拒绝</a>
                </ng-container>
                <span *ngIf="selection.status !== 0" style="color: #8c8c8c;">已处理</span>
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

        <div *ngIf="!loading && selections.length === 0" class="empty-container" style="text-align: center; padding: 40px; color: #8c8c8c;">
          暂无选题申请
        </div>
      </div>
    </div>

    <nz-modal
      [(nzVisible)]="isRejectModalVisible"
      nzTitle="拒绝选题"
      [nzOkLoading]="submitting"
      nzOkText="确认拒绝"
      nzCancelText="取消"
      [nzOkDanger]="true"
      (nzOnOk)="submitReject()"
      (nzOnCancel)="handleRejectCancel()"
    >
      <form nz-form [formGroup]="rejectForm">
        <nz-form-item>
          <nz-form-label nzRequired>拒绝原因</nz-form-label>
          <nz-form-control nzErrorTip="请输入拒绝原因">
            <textarea 
              nz-input 
              formControlName="reason" 
              placeholder="请输入拒绝原因" 
              rows="4"
            ></textarea>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-modal>
  `,
  styles: []
})
export class TeacherSelectionComponent implements OnInit {
  selections: Selection[] = [];
  loading = false;
  submitting = false;
  page = 1;
  size = 10;
  total = 0;
  searchStatus: number | null = null;

  isRejectModalVisible = false;
  rejectForm!: FormGroup;
  currentSelection: Selection | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.rejectForm = this.fb.group({
      reason: [null, [Validators.required]]
    });

    this.loadSelections();
  }

  loadSelections(): void {
    this.loading = true;
    const status = this.searchStatus !== null ? this.searchStatus : undefined;
    this.apiService.getTeacherSelections(this.page, this.size, status).subscribe({
      next: (res) => {
        this.loading = false;
        this.selections = res.data?.records || [];
        this.total = res.data?.total || 0;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadSelections();
  }

  onReset(): void {
    this.searchStatus = null;
    this.page = 1;
    this.loadSelections();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadSelections();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadSelections();
  }

  reviewSelection(selection: Selection, status: number): void {
    this.submitting = true;
    this.apiService.reviewSelection(selection.id, status).subscribe({
      next: (res) => {
        this.submitting = false;
        this.message.success('审核成功');
        this.loadSelections();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  openRejectModal(selection: Selection): void {
    this.currentSelection = selection;
    this.rejectForm.reset();
    this.isRejectModalVisible = true;
  }

  handleRejectCancel(): void {
    this.isRejectModalVisible = false;
    this.currentSelection = null;
  }

  submitReject(): void {
    if (this.rejectForm.invalid || !this.currentSelection) {
      Object.values(this.rejectForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    this.apiService.reviewSelection(
      this.currentSelection.id, 
      2, 
      this.rejectForm.value.reason
    ).subscribe({
      next: (res) => {
        this.submitting = false;
        this.isRejectModalVisible = false;
        this.currentSelection = null;
        this.message.success('已拒绝该选题申请');
        this.loadSelections();
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
        return '已拒绝';
      default:
        return '未知';
    }
  }
}
