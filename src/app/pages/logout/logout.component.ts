import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 

import { AppService } from '../../app.service';

@Component({
    template: ''
  })
  
  export class LogoutComponent implements OnInit {
  
    constructor(private appService: AppService, private router: Router) {}
  
    ngOnInit() {
      this.appService.logout();
      this.router.navigate(['login']);
    }
  
  }