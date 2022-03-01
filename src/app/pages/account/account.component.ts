import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation:true
  };
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen:boolean = true;
  public links = [ ]; 
  constructor(public router:Router,
    public appService: AppService) {
      this.links = [{ name: 'Profile', href: 'profile', icon: 'person', visible: true },  
        { name: 'My Properties', href: 'my-properties', icon: 'view_list',},
        { name: 'Favorites', href: 'favorites', icon: 'favorite' }, 
        // { name: 'Submit Property', href: '/submit-property', icon: 'add_circle', visible: this.appService.currentUserCanSubmit },  
        { name: 'Logout', href: '/logout', icon: 'power_settings_new' },];
     }

  ngOnInit() {
    if(window.innerWidth < 960){
      this.sidenavOpen = false;
    };
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (window.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {  
        if(window.innerWidth < 960){
          this.sidenav.close(); 
        }
      }                
    });
  } 


}
