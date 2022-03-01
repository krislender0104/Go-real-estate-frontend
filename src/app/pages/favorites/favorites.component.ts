import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material'; 
import { Pagination } from '../../app.models'; 
@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'image', 'title', 'actions' ];
  dataSource: MatTableDataSource<Property>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  public count: number = 5;
  public pagination:Pagination = new Pagination(1, this.count, null, 2, 0, 0); 
  constructor(public appService:AppService) { }

  ngOnInit() {
    
    var value = localStorage.getItem("favorites");
    var ids = JSON.parse(value).join(',');

    this.appService.getFavorites(this.pagination.page, this.count, ids).subscribe(result => {
      this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }

  public remove(id) {
    var value = localStorage.getItem("favorites");
    var ids = JSON.parse(value);
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } 
    localStorage.setItem("favorites", JSON.stringify(ids));
    
    this.appService.getFavorites(this.pagination.page, this.count, ids.join(',')).subscribe(result => {
      this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
