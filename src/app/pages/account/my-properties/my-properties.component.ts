import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-my-properties',
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.scss']
})
export class MyPropertiesComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Property>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public appService: AppService) { }

  ngOnInit() {
    const agent = this.appService.currentUserValue;
    let observable: any;

    if (agent.user_type === 'Admin') {
      observable = this.appService.getProperties(this.paginator.page, 10);
      this.displayedColumns = ['id', 'thumbnail', 'title', 'published', 'views', 'actions' ];
    } else {
      observable = this.appService.getPurchasedProperties();
      this.displayedColumns = ['id', 'thumbnail', 'title', 'sold', 'start_date', 'next_payment_date', 'actions' ];
    }
    observable.subscribe(res => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  public applicationType(value) {
    return value === 1 ? 'BUY' : 'RENT';
  }
  public applicationStauts(value) {
    if(value == 0) {
      return "Pending";
    } else if(value == 1) {
      return "Accepted";
    } else {
      return "Rejected";
    }
  }

  public paymentDate(property) {
    if (property.application.status === 1) {
      return property.next_payment_date;
    } else {
      return '';
    }
  }

  public remove(property:Property) {
    const index: number = this.dataSource.data.indexOf(property);    
    if (index !== -1) {
      
      this.appService.removeProperty(property.id).subscribe(data => {
        this.dataSource.data.splice(index,1);
        this.dataSource = new MatTableDataSource<Property>(this.dataSource.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

    } 
  }

  public manualPay(property: Property) {
    this.appService.manualPay(property).subscribe(() => {
      location.reload();
    });
  }

  public cancelRent(property: Property) {
    this.appService.cancelRent(property).subscribe(() => {
      this.dataSource = new MatTableDataSource(this.dataSource.data.filter(p => p.id !== property.id))
    });
  }

  public timeToPay(date: string) {
    return moment(date).diff(moment(), 'days') <= 5;
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}