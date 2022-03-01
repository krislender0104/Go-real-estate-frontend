import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-toolbar1',
  templateUrl: './toolbar1.component.html'
})
export class Toolbar1Component implements OnInit {
  @Output() onMenuIconClick: EventEmitter<any> = new EventEmitter<any>();
  constructor(public appService:AppService) { }

  ngOnInit() { }

  public link() {
    const currentUser = this.appService.currentUserValue;
    if (currentUser) {
        return "/account/favorites";
    }
    return "/favorites";

  }

  public favoritesLength()
  {
    const currentUser = this.appService.currentUserValue;
    if (currentUser) {
        return this.appService.Data.favorites.length;
    }
    var value = localStorage.getItem("favorites");
    var ids = JSON.parse(value);
    return ids.length();
  }

  public sidenavToggle(){
    this.onMenuIconClick.emit();
  }
}