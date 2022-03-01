import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatBottomSheet } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import {
  Property,
  Company,
  PropertyType,
  PropertyStatus,
  Location,
  Agent,
  User,
  Plan
} from './app.models';
import { environment } from '../environments/environment';
import { AppSettings } from './app.settings';
import { map } from 'rxjs/operators';
import { kStringMaxLength } from 'buffer';

export class Data {
  constructor(public properties: Property[],
              public companies: Company[],
              public compareList: Property[],
              public favorites: Property[],
              public locations: Location[]) { }
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public Data = new Data(
    [], // properties
    [], // companies
    [], // compareList
    [], // favorites
    []  // locations
  )
  // public url = "api/";
  // public url = "http://192.168.209.222:3000/api/";
  public url = environment.host + '/';
  public assetUrl = '/assets/data/'
  public apiKey = 'AIzaSyAAYi6itRZ0rPgI76O3I83BhhzZHIgMwPg';
  public apiURL = '';
  public httpOptions = {};

  public authUser: Observable<any>;
  private currentUserSubject: BehaviorSubject<any>;
  
  constructor(public http:HttpClient, 
              private bottomSheet: MatBottomSheet, 
              private snackBar: MatSnackBar,
              public appSettings:AppSettings) {
    let userObj = JSON.parse(localStorage.getItem('currentUser'));
    let token = JSON.parse(localStorage.getItem('token'));
    if (userObj) {
      userObj.token = token;
    }
    this.currentUserSubject = new BehaviorSubject<User>(userObj);
    this.authUser = this.currentUserSubject.asObservable();
    console.log(userObj);

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token ? 'Bearer ' + token : ''
      })
    };

    // this.getFavorites().subscribe(result => {
    //   this.Data.favorites = result;
    // });
    this.getCompares();
    this.http.get<any>(this.url + 'validate_token', this.httpOptions).subscribe(result => {
      if (!result.success) {
        this.logout();
      }
    }, errpr => this.logout());
  }

  public getProperties(pageNumber, pageSize, ids?, agentId?): Observable<Property[]> {
    var dataUrl;
    if(ids) {
      dataUrl = 'properties?page=' + pageNumber + '&page-size=' + pageSize + ids;
    }
    else {
      dataUrl = 'properties?page=' + pageNumber + '&page-size=' + pageSize;
    }
    if (agentId) {
      dataUrl += '&agent-id=' + agentId;
      // return this.http.get<Property[]>(this.url + 'properties?agent=' + agent, this.httpOptions);
    }
    return this.http.get<Property[]>(this.url + dataUrl , this.httpOptions);
    
  }

  public manualPay(property: Property): Observable<any> {
    return this.http.post<any>(this.url + 'charge/manual-pay', { property_id: property.id }, this.httpOptions);
  }

  public cancelRent(property: Property): Observable<any> {
    return this.http.post<any>(this.url + `properties/${property.id}/stop-rent`, {}, this.httpOptions);
  }

  public getPurchasedProperties(agent = 0): Observable<Property[]> {
    return this.http.get<Property[]>(this.url + 'purchased-properties', this.httpOptions);
  }

  public getApplications(id): Observable<any[]> {
    return this.http.get<Property[]>(this.url + `application/${id}`, this.httpOptions);
  }

  public cancelRecurring(id): Observable<any> {
    return this.http.post<any>(this.url + `application/cancel-recurring/${id}`, {}, this.httpOptions);
  }

  public getHomeCarouselSlides(){
    return this.http.get<any[]>(this.url + 'properties?agent=' + 1);
  }

  public getPropertyById(id): Observable<Property>{
    return this.http.get<Property>(this.url + 'properties/' + id, this.httpOptions);
  }

  public getFeaturedProperties(): Observable<Property[]>{
    return this.http.get<Property[]>(this.url + 'properties?featured=1');
  }

  public getRelatedProperties(id): Observable<Property[]>{
    return this.http.get<Property[]>(this.url + 'properties/' + id + '/related');
  }

  public removeProperty(id) : Observable<any> {
    return this.http.delete<any>(this.url + 'properties/' + id, this.httpOptions);
  }

  public getUserProfile(id: Number) : Observable<any> {
    return this.http.get<any>(this.url + 'users/' + id, this.httpOptions);
  }

  public changePassword(oldPass: String, newPass: String) : Observable<any> {
    return this.http.post<any>(this.url + 'users/' + this.currentUserValue.id + '/change-pwd', {
      currentPwd: oldPass,
      newPwd: newPass
    }, this.httpOptions);
  };

  public updateUserProfile(profile: any) : Observable<any> {
    return this.http.post<any>(this.url + 'agents/', profile, {
      headers: new HttpHeaders({
        'Authorization': this.currentUserValue.token
      })
    });
  }

  public getAgentById(agentId): Observable<Agent>{
    return this.http.get<Agent>(this.url + 'agents/' + agentId, this.httpOptions);
  }

  public getPropertiesByAgentId(agentId): Observable<Property[]>{
    return this.http.get<Property[]>(this.url + 'properties?agent=' + agentId, this.httpOptions);
  }

  public getAgents(): Observable<Agent[]>{
    return this.http.get<Agent[]>(this.url + 'agents');
  }

  public getCompanies() : Observable<Company[]>{
    return this.http.get<Company[]>(this.url + 'companies');
  }

  public getLocations(): Observable<Location[]>{
    return this.http.get<Location[]>(this.assetUrl + 'locations.json');
  }

  public getAddress(lat = 40.714224, lng = -73.961452){ 
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+this.apiKey);
  }

  public getLatLng(address){ 
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key='+this.apiKey+'&address='+address);
  }

  public getFullAddress(lat = 40.714224, lng = -73.961452){ 
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+this.apiKey).subscribe(data =>{ 
      return data['results'][0]['formatted_address'];
    });
  }

  public getFavorites(pageNumber, pageSize, ids?): Observable<Property[]> {
    var url ;
    if(ids)
    {
      url = `favorites?ids=${ids}`;
    }
    else
    {
      url = 'favorites?page=' + pageNumber + '&page-size=' + pageSize;
    }
    return this.http.get<Property[]>(this.url + url, this.httpOptions).pipe(map(data => {
      return data;
    }, err => {
      console.log(err);
      if (err.status == 401) {
        this.on401();
      }
    }));
  }

  
  public removeFromFavorite(property: Property): Observable<any> {
    return this.http.delete<any>(this.url + 'favorites/' + property.id, this.httpOptions).pipe(map(data => {
      this.Data.favorites = data.favorites;
      return data;
    }, err => {
      if (err.status == 401) {
        this.on401();
      }
    }));
  }
  
  public addToFavorites(property:Property, direction, flag){
    if(!this.Data.favorites.filter(item=>item.id == property.id)[0]){
      this.Data.favorites.push(property);
      this.snackBar.open('The property "' + property.title + '" has been added to favorites.', '×', {
        verticalPosition: 'top',
        duration: 3000,
        direction: direction 
      });  
    }
    if(flag == 0)
      return;
    return this.http.post<any>(`${this.url}favorites/${property.id}`, '', this.httpOptions).subscribe(response => {
      console.log(response);
    });
  }

  public getLogin() {
    let userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }

  public login(email:string, password:string) {
    return this.http.post<any>(`${this.url}auth/login`, { email: email, password: password })
            .pipe(map(result => {
                // login successful if there's a jwt token in the response
                if (result.user && result.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    localStorage.setItem('token', JSON.stringify(result.token));
                    this.currentUserSubject.next(result.user);

                    this.httpOptions = {
                      headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': result.token ? 'Bearer ' + result.token : ''
                      })
                    };
                }

                // this.getFavorites();

                return result.user;
            }));
  }

  public signup(user: any) {
    return this.http.post<any>(`${this.url}auth/register`, user);
  }

  public on401() {
    this.authUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  public logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.Data.favorites = [];
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get currentUserCanSubmit(): boolean {
    if (this.currentUserSubject.value == null) {
      return true;
    }
    else {
      let userType = this.currentUserValue.user_type;
      if (userType == 'Admin' || userType == 'CompanyAdmin' || userType == 'PropertyManager' || userType == 'Realtor')
        return true;
    }
    return false;
  }

  public getCompares() {
    let compares = localStorage.getItem('compares');
    if (compares) {
      this.Data.compareList = JSON.parse(compares);
    }
  }

  public addToCompare(property:Property, component, direction){ 
    if(!this.Data.compareList.filter(item=>item.id == property.id)[0]){
      this.Data.compareList.push(property);
      localStorage.setItem('compares', JSON.stringify(this.Data.compareList));
      this.bottomSheet.open(component, {
        direction: direction
      }).afterDismissed().subscribe(isRedirect=>{  
        if(isRedirect){
          window.scrollTo(0,0);
        }        
      }); 
    } 
  }

  public removeFromCompare(property: Property) {
    const index: number = this.Data.compareList.indexOf(property);
    if (index !== -1) {
        this.Data.compareList.splice(index, 1);
        localStorage.setItem('compares', JSON.stringify(this.Data.compareList));
    }
  }

  public getPropertyTypes(): Observable<PropertyType[]>{
    return this.http.get<PropertyType[]>(this.url + 'property-types');
  }

  public getPropertyStatuses(): Observable<PropertyStatus[]>{
    return this.http.get<PropertyType[]>(this.url + 'property-status');
  }

  public submitProperty(property: any) : Observable<any> {
    return this.http.post<any>(this.url + 'properties', property, this.httpOptions);
  }

  public submitPlan(plan: any) : Promise<any> {
    return this.http.post<any>(this.url + 'properties/' + plan.property_id + '/plans', plan, this.httpOptions).toPromise();
  }

  public submitApplication(application: any) : Promise<any> {
    return this.http.post<any>(this.url + 'applications', application, this.httpOptions).toPromise();
  }

  public submitAttachment(attachment: any) : Promise<any> {
    let userObj = JSON.parse(localStorage.getItem('currentUser'));
    const httpHeader = {
      headers: new HttpHeaders({
        'Authorization': userObj ? userObj.token : ''
      }
    )};
    if (attachment.file != undefined) {
      const formData = new FormData();
      formData.append('attachment', attachment.file, attachment.file.name);
      return this.http.post<any>(this.url + 'attachments', formData, httpHeader).toPromise();
    } else {
      return this.http.post<any>(this.url + 'attachments', attachment, this.httpOptions).toPromise();
    }
  }

  public submitGallery(propertyId: number, gallery: any) : Promise<any> {
    return this.http.post<any>(this.url + 'properties/' + propertyId + '/galleries', gallery, this.httpOptions).toPromise();
  }

  public getCities(){
    return [ 
      { id: 1, name: 'New York' },
      { id: 2, name: 'Chicago' },
      { id: 3, name: 'Los Angeles' },
      { id: 4, name: 'Seattle' } 
    ]
  }

  public getNeighborhoods(){
    return [      
      { id: 1, name: 'Astoria', cityId: 1 },
      { id: 2, name: 'Midtown', cityId: 1 },
      { id: 3, name: 'Chinatown', cityId: 1 }, 
      { id: 4, name: 'Austin', cityId: 2 },
      { id: 5, name: 'Englewood', cityId: 2 },
      { id: 6, name: 'Riverdale', cityId: 2 },      
      { id: 7, name: 'Hollywood', cityId: 3 },
      { id: 8, name: 'Sherman Oaks', cityId: 3 },
      { id: 9, name: 'Highland Park', cityId: 3 },
      { id: 10, name: 'Belltown', cityId: 4 },
      { id: 11, name: 'Queen Anne', cityId: 4 },
      { id: 12, name: 'Green Lake', cityId: 4 }      
    ]
  }

  public getStreets(){
    return [      
      { id: 1, name: 'Astoria Street #1', cityId: 1, neighborhoodId: 1},
      { id: 2, name: 'Astoria Street #2', cityId: 1, neighborhoodId: 1},
      { id: 3, name: 'Midtown Street #1', cityId: 1, neighborhoodId: 2 },
      { id: 4, name: 'Midtown Street #2', cityId: 1, neighborhoodId: 2 },
      { id: 5, name: 'Chinatown Street #1', cityId: 1, neighborhoodId: 3 }, 
      { id: 6, name: 'Chinatown Street #2', cityId: 1, neighborhoodId: 3 },
      { id: 7, name: 'Austin Street #1', cityId: 2, neighborhoodId: 4 },
      { id: 8, name: 'Austin Street #2', cityId: 2, neighborhoodId: 4 },
      { id: 9, name: 'Englewood Street #1', cityId: 2, neighborhoodId: 5 },
      { id: 10, name: 'Englewood Street #2', cityId: 2, neighborhoodId: 5 },
      { id: 11, name: 'Riverdale Street #1', cityId: 2, neighborhoodId: 6 }, 
      { id: 12, name: 'Riverdale Street #2', cityId: 2, neighborhoodId: 6 },
      { id: 13, name: 'Hollywood Street #1', cityId: 3, neighborhoodId: 7 },
      { id: 14, name: 'Hollywood Street #2', cityId: 3, neighborhoodId: 7 },
      { id: 15, name: 'Sherman Oaks Street #1', cityId: 3, neighborhoodId: 8 },
      { id: 16, name: 'Sherman Oaks Street #2', cityId: 3, neighborhoodId: 8 },
      { id: 17, name: 'Highland Park Street #1', cityId: 3, neighborhoodId: 9 },
      { id: 18, name: 'Highland Park Street #2', cityId: 3, neighborhoodId: 9 },
      { id: 19, name: 'Belltown Street #1', cityId: 4, neighborhoodId: 10 },
      { id: 20, name: 'Belltown Street #2', cityId: 4, neighborhoodId: 10 },
      { id: 21, name: 'Queen Anne Street #1', cityId: 4, neighborhoodId: 11 },
      { id: 22, name: 'Queen Anne Street #2', cityId: 4, neighborhoodId: 11 },
      { id: 23, name: 'Green Lake Street #1', cityId: 4, neighborhoodId: 12 },
      { id: 24, name: 'Green Lake Street #2', cityId: 4, neighborhoodId: 12 }      
    ]
  }

  public getFeatures(){
    return [ 
      { id: 1, name: 'Air Conditioning', selected: false },
      { id: 2, name: 'Barbeque', selected: false },
      { id: 3, name: 'Dryer', selected: false },
      { id: 4, name: 'Microwave', selected: false }, 
      { id: 5, name: 'Refrigerator', selected: false },
      { id: 6, name: 'TV Cable', selected: false },
      { id: 7, name: 'Sauna', selected: false },
      { id: 8, name: 'WiFi', selected: false },
      { id: 9, name: 'Fireplace', selected: false },
      { id: 10, name: 'Swimming Pool', selected: false },
      { id: 11, name: 'Gym', selected: false },
    ]
  }

  public soldLabel(property: any) {
    if (property.sold.type === 'none') {
      return null;
    }

    if (property.sold.mine) {
      if (property.sold.type === 'sold') {
        return 'You Bought';
      } else {
        return 'You rented';
      }
    } else {
      if (property.sold.type === 'sold') {
        return 'sold';
      } else {
        return 'rented';
      }
    }
  }
  public getTestimonials(){
    return [
        { 
            text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.', 
            author: 'Mr. Adam Sandler', 
            position: 'General Director', 
            image: 'assets/images/profile/adam.jpg' 
        },
        { 
            text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.', 
            author: 'Ashley Ahlberg', 
            position: 'Housewife', 
            image: 'assets/images/profile/ashley.jpg' 
        },
        { 
            text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.', 
            author: 'Bruno Vespa', 
            position: 'Blogger', 
            image: 'assets/images/profile/bruno.jpg' 
        },
        { 
            text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.', 
            author: 'Mrs. Julia Aniston', 
            position: 'Marketing Manager', 
            image: 'assets/images/profile/julia.jpg' 
        }
    ];
  }

  public getClients(){
    return [  
        { name: 'aloha', image: 'assets/images/clients/aloha.png' },
        { name: 'dream', image: 'assets/images/clients/dream.png' },  
        { name: 'congrats', image: 'assets/images/clients/congrats.png' },
        { name: 'best', image: 'assets/images/clients/best.png' },
        { name: 'original', image: 'assets/images/clients/original.png' },
        { name: 'retro', image: 'assets/images/clients/retro.png' },
        { name: 'king', image: 'assets/images/clients/king.png' },
        { name: 'love', image: 'assets/images/clients/love.png' },
        { name: 'the', image: 'assets/images/clients/the.png' },
        { name: 'easter', image: 'assets/images/clients/easter.png' },
        { name: 'with', image: 'assets/images/clients/with.png' },
        { name: 'special', image: 'assets/images/clients/special.png' },
        { name: 'bravo', image: 'assets/images/clients/bravo.png' }
    ];
  }


}
