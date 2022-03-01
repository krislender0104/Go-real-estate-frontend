import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Agent } from '../../app.models';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit {
  public agents: Agent[];
  constructor(public appService:AppService) { }

  ngOnInit() {
    this.appService.getAgents().subscribe(data => {
    	this.agents = data;
    });
  }

}
