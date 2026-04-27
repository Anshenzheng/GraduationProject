import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ApiService, Topic, TopicType, PageResult } from '../../services/api.service';

@Component({
  selector: 'app-teacher-topic',
  template: `
    <div class="page-container">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>我的题目</h2>
          <p>管理您发布的毕业设计题目</p>
        </div>
        <button nz-button nzType="primary" (click)="openCreateModal()">
          <i nz-icon nzType="plus" nzTheme="outline"></i> 发布新题目
        </button>
      </div>

      <div class="card-container">
        <nz-table [nzData]="topics" [nzLoading]="loading" nzBordered>
          <thead>
            <tr>
              <th>题目名称</th>
              <th>题目类型</th>
              <th>已选/总数</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let topic of topics">
              <td>{{ topic.title }}</td>
              <td>{{ topic.type?.name || '未分类' }}</td>
              <td>
                <span [style.color]="topic.currentStudents >= topic.maxStudents ? '#ff4d4f' : '#52c41a'">
                  {{ topic.currentStudents }}/{{ topic.maxStudents }}
                </span>
              </td>
              <td>
                <span [ngClass]="topic.status === 1 ? 'status-tag approved' : 'status-tag inactive'">
                  {{ topic.status === 1 ? '上架中' : '已下架' }}
                </span>
              </td>
              <td>{{ topic.createdAt | date: 'yyyy-MM-dd' }}</td>
              <td>
                <a (click)="openEditModal(topic)" style="margin-right: 8px;">编辑</a>
                <a 
                  (click)="toggleStatus(topic)" 
                  style="margin-right: 8px;"
                  [style.color]="topic.status === 1 ? '#fa8c16' : '#1890ff'"
                >
                  {{ topic.status === 1 ? '下架' : '上架' }}
                </a>
                <a 
                  (click)="confirmDelete(topic)" 
                  [style.color]="topic.currentStudents > 0 ? '#d9d9d9' : '#ff4d4f'"
                  [style.cursor]="topic.currentStudents > 0 ? 'not-allowed' : 'pointer'"
                >
                  删除
                </a>
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
      </div>
    </div>

    <nz-modal
      [(nzVisible)]="isModalVisible"
      [nzTitle]="isEdit ? '编辑题目' : '发布新题目'"
      [nzOkLoading]="submitting"
      [nzOkText]="isEdit ? '保存' : '发布'"
      nzCancelText="取消"
      (nzOnOk)="submitForm()"
      (nzOnCancel)="handleCancel()"
    >
      <form nz-form [formGroup]="topicForm">
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>题目名称</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="请输入题目名称">
            <input type="text" nz-input formControlName="title" placeholder="请输入题目名称" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">题目类型</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <nz-select formControlName="typeId" nzAllowClear nzPlaceHolder="请选择题型类型" style="width: 100%;">
              <nz-option *ngFor="let type of topicTypes" [nzValue]="type.id" [nzLabel]="type.name"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzRequired>最大人数</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="请输入最大可选人数">
            <input type="number" nz-input formControlName="maxStudents" placeholder="请输入最大可选人数" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6">题目描述</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <textarea 
              nz-input 
              formControlName="description" 
              placeholder="请输入题目描述" 
              rows="6"
            ></textarea>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-modal>
  `,
  styles: []
})
export class TeacherTopicComponent implements OnInit {
  topics: Topic[] = [];
  topicTypes: TopicType[] = [];
  loading = false;
  submitting = false;
  page = 1;
  size = 10;
  total = 0;

  isModalVisible = false;
  isEdit = false;
  editTopic: Topic | null = null;
  topicForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private message: NzMessageService,
    private modalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.topicForm = this.fb.group({
      title: [null, [Validators.required]],
      typeId: [null],
      maxStudents: [1, [Validators.required, Validators.min(1)]],
      description: [null]
    });

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
    this.apiService.getTeacherTopics(this.page, this.size).subscribe({
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

  onPageChange(page: number): void {
    this.page = page;
    this.loadTopics();
  }

  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.loadTopics();
  }

  openCreateModal(): void {
    this.isEdit = false;
    this.editTopic = null;
    this.topicForm.reset({
      title: null,
      typeId: null,
      maxStudents: 1,
      description: null
    });
    this.isModalVisible = true;
  }

  openEditModal(topic: Topic): void {
    this.isEdit = true;
    this.editTopic = topic;
    this.topicForm.patchValue({
      title: topic.title,
      typeId: topic.type?.id || null,
      maxStudents: topic.maxStudents,
      description: topic.description
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  submitForm(): void {
    if (this.topicForm.invalid) {
      Object.values(this.topicForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const formValue = this.topicForm.value;

    if (this.isEdit && this.editTopic) {
      this.apiService.updateTopic(this.editTopic.id, formValue).subscribe({
        next: (res) => {
          this.submitting = false;
          this.isModalVisible = false;
          this.message.success('更新成功');
          this.loadTopics();
        },
        error: () => {
          this.submitting = false;
        }
      });
    } else {
      this.apiService.createTopic(formValue).subscribe({
        next: (res) => {
          this.submitting = false;
          this.isModalVisible = false;
          this.message.success('发布成功');
          this.loadTopics();
        },
        error: () => {
          this.submitting = false;
        }
      });
    }
  }

  toggleStatus(topic: Topic): void {
    this.apiService.toggleTopicStatus(topic.id).subscribe({
      next: (res) => {
        this.message.success(topic.status === 1 ? '已下架' : '已上架');
        this.loadTopics();
      },
      error: () => {}
    });
  }

  confirmDelete(topic: Topic): void {
    if (topic.currentStudents > 0) {
      this.message.warning('该题目已有学生选择，无法删除');
      return;
    }

    this.modalService.confirm({
      nzTitle: '确认删除',
      nzContent: `确定要删除题目"${topic.title}"吗？`,
      nzOkText: '删除',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: '取消',
      nzOnOk: () => {
        this.apiService.deleteTopic(topic.id).subscribe({
          next: (res) => {
            this.message.success('删除成功');
            this.loadTopics();
          },
          error: () => {}
        });
      }
    });
  }
}
