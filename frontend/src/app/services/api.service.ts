import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TopicType {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  type?: TopicType;
  teacher: Teacher;
  maxStudents: number;
  currentStudents: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: number;
  user: {
    id: number;
    name: string;
  };
  teacherNo: string;
  department: string;
  title: string;
  researchDirection: string;
  maxStudents: number;
}

export interface Student {
  id: number;
  user: {
    id: number;
    name: string;
  };
  studentNo: string;
  department: string;
  major: string;
  className: string;
  grade: string;
}

export interface Selection {
  id: number;
  student: Student;
  topic: Topic;
  teacher: Teacher;
  status: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thesis {
  id: number;
  student: Student;
  topic: Topic;
  title: string;
  abstractText: string;
  keywords: string;
  filePath: string;
  fileName: string;
  version: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThesisReview {
  id: number;
  thesis: Thesis;
  teacher: Teacher;
  status: number;
  comments: string;
  suggestion: string;
  createdAt: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTopicTypes(): Observable<Result<TopicType[]>> {
    return this.http.get<Result<TopicType[]>>(`${this.apiUrl}/topics/types`);
  }

  getPublicTopics(page: number = 1, size: number = 10): Observable<Result<PageResult<Topic>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<Topic>>>(`${this.apiUrl}/topics/public/list`, { params });
  }

  getPublicTopic(id: number): Observable<Result<Topic>> {
    return this.http.get<Result<Topic>>(`${this.apiUrl}/topics/public/${id}`);
  }

  getTeacherTopics(page: number = 1, size: number = 10): Observable<Result<PageResult<Topic>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<Topic>>>(`${this.apiUrl}/topics/teacher/list`, { params });
  }

  createTopic(topic: { title: string; description: string; typeId?: number; maxStudents: number }): Observable<Result<Topic>> {
    return this.http.post<Result<Topic>>(`${this.apiUrl}/topics/teacher/create`, topic);
  }

  updateTopic(id: number, topic: { title: string; description: string; typeId?: number; maxStudents: number }): Observable<Result<Topic>> {
    return this.http.put<Result<Topic>>(`${this.apiUrl}/topics/teacher/${id}`, topic);
  }

  deleteTopic(id: number): Observable<Result<void>> {
    return this.http.delete<Result<void>>(`${this.apiUrl}/topics/teacher/${id}`);
  }

  toggleTopicStatus(id: number): Observable<Result<Topic>> {
    return this.http.put<Result<Topic>>(`${this.apiUrl}/topics/teacher/${id}/toggle`, {});
  }

  selectTopic(topicId: number): Observable<Result<Selection>> {
    return this.http.post<Result<Selection>>(`${this.apiUrl}/selections/student/select`, { topicId });
  }

  getStudentSelections(page: number = 1, size: number = 10): Observable<Result<PageResult<Selection>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<Selection>>>(`${this.apiUrl}/selections/student/list`, { params });
  }

  getTeacherSelections(page: number = 1, size: number = 10, status?: number): Observable<Result<PageResult<Selection>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Selection>>>(`${this.apiUrl}/selections/teacher/list`, { params });
  }

  reviewSelection(selectionId: number, status: number, reason?: string): Observable<Result<Selection>> {
    return this.http.post<Result<Selection>>(`${this.apiUrl}/selections/teacher/review`, {
      selectionId,
      status,
      reason
    });
  }

  getAllSelections(page: number = 1, size: number = 10, status?: number): Observable<Result<PageResult<Selection>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Selection>>>(`${this.apiUrl}/selections/admin/list`, { params });
  }

  submitThesis(data: FormData): Observable<Result<Thesis>> {
    return this.http.post<Result<Thesis>>(`${this.apiUrl}/theses/student/submit`, data);
  }

  getStudentTheses(page: number = 1, size: number = 10): Observable<Result<PageResult<Thesis>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<Thesis>>>(`${this.apiUrl}/theses/student/list`, { params });
  }

  getThesis(id: number): Observable<Result<Thesis>> {
    return this.http.get<Result<Thesis>>(`${this.apiUrl}/theses/${id}`);
  }

  reviewThesis(thesisId: number, status: number, comments: string, suggestion?: string): Observable<Result<ThesisReview>> {
    return this.http.post<Result<ThesisReview>>(`${this.apiUrl}/theses/teacher/review`, {
      thesisId,
      status,
      comments,
      suggestion
    });
  }

  getThesisReviews(id: number, page: number = 1, size: number = 10): Observable<Result<PageResult<ThesisReview>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Result<PageResult<ThesisReview>>>(`${this.apiUrl}/theses/${id}/reviews`, { params });
  }

  getAllTheses(page: number = 1, size: number = 10, status?: number): Observable<Result<PageResult<Thesis>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    return this.http.get<Result<PageResult<Thesis>>>(`${this.apiUrl}/theses/admin/list`, { params });
  }

  getOverviewStatistics(): Observable<Result<{ [key: string]: number }>> {
    return this.http.get<Result<{ [key: string]: number }>>(`${this.apiUrl}/statistics/overview`);
  }

  getTopicTypeStatistics(): Observable<Result<{ typeCount: { [key: string]: number }; typeSelected: { [key: string]: number } }>> {
    return this.http.get<Result<{ typeCount: { [key: string]: number }; typeSelected: { [key: string]: number } }>>(`${this.apiUrl}/statistics/topic-types`);
  }

  getTeacherStatistics(): Observable<Result<{ teacherTopicCount: { [key: string]: number }; teacherStudentCount: { [key: string]: number } }>> {
    return this.http.get<Result<{ teacherTopicCount: { [key: string]: number }; teacherStudentCount: { [key: string]: number } }>>(`${this.apiUrl}/statistics/teachers`);
  }

  exportSelections(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/statistics/export/selections`, {
      responseType: 'blob'
    });
  }
}
