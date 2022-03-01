import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { InputFileModule } from 'ngx-input-file';
import { AgmCoreModule } from '@agm/core';  
import { FavoritesComponent } from './favorites.component';

export const routes = [
  {  path: '', component: FavoritesComponent
  }
];

@NgModule({
  declarations: [
    FavoritesComponent, 
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    InputFileModule,
    AgmCoreModule
  ]
})
export class FavoritesModule { }
