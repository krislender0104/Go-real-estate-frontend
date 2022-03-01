import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  public authUser: any;

  constructor(public appService:AppService) {
    this.authUser = appService.authUser;
    console.log(appService.currentUserValue);
  }

  ngOnInit() {
  }

}
