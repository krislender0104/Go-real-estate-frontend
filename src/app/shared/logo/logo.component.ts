import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings, Settings } from 'src/app/app.settings';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html'
})
export class LogoComponent { 
  public settings: Settings;
  constructor(public appSettings:AppSettings, public router:Router) {
    this.settings = this.appSettings.settings;  
  }
}
