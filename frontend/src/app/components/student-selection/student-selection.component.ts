import { Component, OnInit } from '@angular/core';
import { ApiService, Selection, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-student-selection',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>我的选题</h2>
        <p>查看您的选题申请记录和状态</p>
      </div>

      <div class="card-container">
        <nz-table [nzData]="selections" [nzLoading]="loading" nzBordered>
          <thead>
            <tr>
              <th>题目名称</th>
              <th>指导教师</th>
              <th>申请时间</th>
              <th>审核状态</th>
              <th>拒绝原因</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let selection of selections">
              <td>{{ selection.topic?.title }}</td>
              <td>{{ selection.teacher?.user?.name }}</td>
              <td>{{ selection.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <span [ngClass]="getStatusClass(selection.status)">
                  {{ getStatusText(selection.status) }}
                </span>
              </td>
              <td>{{ selection.reason || '-' }}</td>
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
          暂无选题记录
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StudentSelectionComponent implements OnInit {
  selections: Selection[] = [];
  loading = false;
  page = 1;
  size = 10;
  total = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadSelections();
  }

  loadSelections(): void {
    this.loading = true;
    this.apiService.getStudentSelections(this.page, this.size).subscribe({
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

  onPageChange(page: number): void {
    this.page = page;
    this.loadSelections();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadSelections();
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
