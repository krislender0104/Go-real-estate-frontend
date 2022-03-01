import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Pagination } from 'src/app/app.models'; 
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
    this.appService.getFavorites(this.pagination.page, this.count).subscribe(result => {
      this.dataSource = new MatTableDataSource(result['data'].data);
      this.pagination = result['pagination'];
     // this.dataSource.sort = this.sort;
    });
  }

  public remove(property:Property) {
    const index: number = this.dataSource.data.indexOf(property);    
    if (index !== -1) {
      this.appService.removeFromFavorite(property).subscribe(result => {
        this.dataSource = new MatTableDataSource<Property>(result.favorites);
        this.pagination = result['pagination'];
        this.dataSource.sort = this.sort;
      })
    } 

  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  public onPageChange(e){ 
    
    this.count = e.pageSize;
    console.log(this.count);
    this.pagination.page = e.pageIndex + 1;
    this.appService.getFavorites(this.pagination.page, this.count, null).subscribe(result => {
      this.dataSource = new MatTableDataSource(result['data'].data);
      this.pagination = result['pagination'];
     // this.dataSource.sort = this.sort;
    });
    window.scrollTo(0,0);  
  }
}
