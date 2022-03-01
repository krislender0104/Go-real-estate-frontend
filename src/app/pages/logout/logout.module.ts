import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LogoutComponent } from './logout.component';

export const routes = [
  { path: '', component: LogoutComponent, pathMatch: 'full'  }
];

@NgModule({
  declarations: [LogoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class LogoutModule { }
