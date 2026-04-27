import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TopicListComponent } from './components/topic-list/topic-list.component';
import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { TeacherTopicComponent } from './components/teacher-topic/teacher-topic.component';
import { StudentSelectionComponent } from './components/student-selection/student-selection.component';
import { TeacherSelectionComponent } from './components/teacher-selection/teacher-selection.component';
import { ThesisComponent } from './components/thesis/thesis.component';
import { ThesisReviewComponent } from './components/thesis-review/thesis-review.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'topics', component: TopicListComponent },
      { path: 'topics/:id', component: TopicDetailComponent },
      {
        path: 'teacher/topics',
        component: TeacherTopicComponent,
        data: { roles: ['TEACHER'] }
      },
      {
        path: 'student/selections',
        component: StudentSelectionComponent,
        data: { roles: ['STUDENT'] }
      },
      {
        path: 'teacher/selections',
        component: TeacherSelectionComponent,
        data: { roles: ['TEACHER'] }
      },
      {
        path: 'theses',
        component: ThesisComponent,
        data: { roles: ['STUDENT', 'TEACHER', 'ADMIN'] }
      },
      {
        path: 'teacher/theses/review',
        component: ThesisReviewComponent,
        data: { roles: ['TEACHER'] }
      },
      {
        path: 'statistics',
        component: StatisticsComponent,
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
