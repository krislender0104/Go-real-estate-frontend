/// <reference types="@types/googlemaps" />
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MatStepper, MatCheckbox, MatSlideToggle } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { MapsAPILoader } from '@agm/core';
import { Plan } from 'src/app/app.models';

@Component({
  selector: 'app-submit-property',
  templateUrl: './submit-property.component.html',
  styleUrls: ['./submit-property.component.scss']
})
export class SubmitPropertyComponent implements OnInit {
  @ViewChild('horizontalStepper', { static: true }) horizontalStepper: MatStepper; 
  @ViewChild('addressAutocomplete', {static: false}) addressAutocomplete: ElementRef;
  public submitForm:FormGroup; 
  public features = [];
  public propertyTypes = [];
  public propertyStatuses = [];
  public cities = [];
  public neighborhoods = [];
  public streets = [];
  public lat: number = 40.678178;
  public lng: number = -73.944158;
  public zoom: number = 12;  
  public gallery = [];

  constructor(public appService:AppService, 
              private fb: FormBuilder, 
              private mapsAPILoader: MapsAPILoader, 
              private ngZone: NgZone) { }

  ngOnInit() {
    this.features = this.appService.getFeatures();  
    this.cities = this.appService.getCities();
    this.neighborhoods = this.appService.getNeighborhoods();
    this.streets = this.appService.getStreets();  

    this.appService.getPropertyTypes().subscribe(types => {
      this.propertyTypes = types;
    });
        
    this.appService.getPropertyStatuses().subscribe(status => {
      this.propertyStatuses = status;
    });
    
    this.submitForm = this.fb.group({
      basic: this.fb.group({
        title: [null, Validators.required],
        desc: null,
        priceDollarSale: null,
        priceDollarRent: null,
        propertyType: [null, Validators.required],
        propertyStatus: null, 
        gallery: null
      }),
      address: this.fb.group({
        location: ['', Validators.required],
        city: ['', Validators.required],
        zipCode: '',
        neighborhood: '',
        street: ''
      }),
      additional: this.fb.group({
        bedrooms: '',
        bathrooms: '',
        garages: '',
        area: '',
        yearBuilt: '',
        features: this.buildFeatures()
      }),
      media: this.fb.group({
        videos: this.fb.array([ this.createVideo() ]),
        plans: this.fb.array([ this.createPlan() ]), 
        additionalFeatures: this.fb.array([ this.createFeature() ]),
        featured: false
      })
    }); 

    this.setCurrentPosition();
    this.placesAutocomplete();
  }



  public onSelectionChange(e:any){ 
    if(e.selectedIndex == 4){   
      this.horizontalStepper._steps.forEach(step => step.editable = false);
      console.log(this.submitForm.value);      
    }
    console.log(this.submitForm.value);      
  }
  public reset(){
    this.horizontalStepper.reset(); 

    const videos = <FormArray>this.submitForm.controls.media.get('videos');
    while (videos.length > 1) {
      videos.removeAt(0)
    }
    const plans = <FormArray>this.submitForm.controls.media.get('plans');
    while (plans.length > 1) {
      plans.removeAt(0)
    }
    const additionalFeatures = <FormArray>this.submitForm.controls.media.get('additionalFeatures');
    while (additionalFeatures.length > 1) {
      additionalFeatures.removeAt(0)
    }
    
    this.submitForm.reset({
      additional: {
        features: this.features
      },
      media:{ 
        featured: false
      }
    });   
     
  }

  

  // -------------------- Address ---------------------------  
  public onSelectCity(){
    this.submitForm.controls.address.get('neighborhood').setValue(null, {emitEvent: false});
    this.submitForm.controls.address.get('street').setValue(null, {emitEvent: false});
  }
  public onSelectNeighborhood(){
    this.submitForm.controls.address.get('street').setValue(null, {emitEvent: false}); 
  }

  private setCurrentPosition() {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => { 
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude; 
      });
    }
  }
  private placesAutocomplete(){ 
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.addressAutocomplete.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => { 
          let place: google.maps.places.PlaceResult = autocomplete.getPlace(); 
          if (place.geometry === undefined || place.geometry === null) {
            return;
          };
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng(); 
          this.getAddress();
        });
      });
    });
  } 
  
  // public getAddress(){    
  //   this.mapsAPILoader.load().then(() => {
  //     let geocoder = new google.maps.Geocoder();
  //     let latlng = new google.maps.LatLng(this.lat, this.lng); 
  //     geocoder.geocode({'location': latlng}, (results, status) => {
  //       if(status === google.maps.GeocoderStatus.OK) {
  //         console.log(results); 
  //         //this.addresstext.nativeElement.focus();  
  //         let address = results[0].formatted_address; 
  //         this.addressForm.controls.location.setValue(address); 
  //         this.setAddresses(results[0]);          
  //       }
  //     });
  //   });
  // }
  public getAddress(){    
    this.appService.getAddress(this.lat, this.lng).subscribe(response => { 
      let address = response['results'][0].formatted_address; 
      this.submitForm.controls.address.get('location').setValue(address); 
      this.setAddresses(response['results'][0]); 
    })
  }
  public onMapClick(e:any){
    this.lat = e.coords.lat;
    this.lng = e.coords.lng; 
    this.getAddress();
  }
  public onMarkerClick(e:any){
    console.log(e);
  }
  
  public setAddresses(result){
    this.submitForm.controls.address.get('city').setValue(null);
    this.submitForm.controls.address.get('zipCode').setValue(null);
    this.submitForm.controls.address.get('street').setValue(null); 

    var newCity, newStreet, newNeighborhood;
    
    result.address_components.forEach(item =>{
      if(item.types.indexOf('locality') > -1){  
        if(this.cities.filter(city => city.name == item.long_name)[0]){
          newCity = this.cities.filter(city => city.name == item.long_name)[0];
        }
        else{
          newCity = { id: this.cities.length+1, name: item.long_name };
          this.cities.push(newCity); 
        }
        this.submitForm.controls.address.get('city').setValue(newCity);    
      }
      if(item.types.indexOf('postal_code') > -1){ 
        this.submitForm.controls.address.get('zipCode').setValue(item.long_name);
      }
    });

    if(!newCity){
      result.address_components.forEach(item =>{
        if(item.types.indexOf('administrative_area_level_1') > -1){  
          if(this.cities.filter(city => city.name == item.long_name)[0]){
            newCity = this.cities.filter(city => city.name == item.long_name)[0];
          }
          else{
            newCity = { 
              id: this.cities.length+1, 
              name: item.long_name 
            };
            this.cities.push(newCity); 
          }
          this.submitForm.controls.address.get('city').setValue(newCity);    
        } 
      });
    }

    if(newCity){
      result.address_components.forEach(item =>{ 
        if(item.types.indexOf('neighborhood') > -1){ 
          let neighborhood = this.neighborhoods.filter(n => n.name == item.long_name && n.cityId == newCity.id)[0];
          if(neighborhood){
            newNeighborhood = neighborhood;
          }
          else{
            newNeighborhood = { 
              id: this.neighborhoods.length+1, 
              name: item.long_name, 
              cityId: newCity.id 
            };
            this.neighborhoods.push(newNeighborhood);
          }
          this.neighborhoods = [...this.neighborhoods];
          this.submitForm.controls.address.get('neighborhood').setValue([newNeighborhood]); 
        }  
      })
    }

    if(newCity){
      result.address_components.forEach(item =>{            
        if(item.types.indexOf('route') > -1){ 
          if(this.streets.filter(street => street.name == item.long_name && street.cityId == newCity.id)[0]){
            newStreet = this.streets.filter(street => street.name == item.long_name && street.cityId == newCity.id)[0];
          }
          else{
            newStreet = { 
              id: this.streets.length+1, 
              name: item.long_name, 
              cityId: newCity.id, 
              neighborhoodId: (newNeighborhood) ? newNeighborhood.id : null 
            };
            this.streets.push(newStreet);
          }          
          this.streets = [...this.streets];
          this.submitForm.controls.address.get('street').setValue([newStreet]); 
        }
      })
    }

  }



   
  // -------------------- Additional ---------------------------  
  public buildFeatures() {
    const arr = this.features.map(feature => { 
      return this.fb.group({
        id: feature.id,
        name: feature.name,
        selected: feature.selected
      });
    })   
    return this.fb.array(arr);
  }
  

  
  // -------------------- Media --------------------------- 
  public createVideo(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      link: null 
    });
  }
  public addVideo(): void {
    const videos = this.submitForm.controls.media.get('videos') as FormArray;
    videos.push(this.createVideo());
  }
  public deleteVideo(index) {
    const videos = this.submitForm.controls.media.get('videos') as FormArray;
    videos.removeAt(index);
  }
  
  public createPlan(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      desc: null,
      area: null,
      rooms: null,
      baths: null,
      image: null
    });
  }
  public addPlan(): void {
    const plans = this.submitForm.controls.media.get('plans') as FormArray;
    plans.push(this.createPlan());
  }
  public deletePlan(index) {
    const plans = this.submitForm.controls.media.get('plans') as FormArray;
    plans.removeAt(index);
  } 


  public createFeature(): FormGroup {
    return this.fb.group({
      id: null,
      name: null, 
      value: null 
    });
  }
  public addFeature(): void {
    const features = this.submitForm.controls.media.get('additionalFeatures') as FormArray;
    features.push(this.createFeature());
  }
  public deleteFeature(index) {
    const features = this.submitForm.controls.media.get('additionalFeatures') as FormArray;
    features.removeAt(index);
  } 


  public submitProperty(): void {
    const general = this.submitForm.controls.basic;
    const address = this.submitForm.controls.address;
    const additional = this.submitForm.controls.additional;
    const media = this.submitForm.controls.media;
    const property: any = {
      title: general.get('title').value,
      description: general.get('desc').value,
      user: this.appService.currentUserValue.id,
      property_type: general.get('propertyType').value.id,
      details: {
        price_dollar_sale: general.get('priceDollarSale').value,
        price_dollar_rent: general.get('priceDollarRent').value,
        city: address.get('city').value.name,
        zipcode: address.get('zipCode').value,
        // neighborhood: address.get('neighborhood').value,
        // street: address.get('street').value,
        lat: this.lat,
        lng: this.lng,
        address: address.get('location').value,
        area: additional.get('area').value,
        garages: additional.get('garages').value,
        bedrooms: additional.get('bedrooms').value,
        bathrooms: additional.get('bathrooms').value
      },
      additional_features: [],
      features: [],
      status: []

    }


    this.submitForm.value.basic.propertyStatus.forEach(element => {
      property.status.push(element.id);
    });
    
    this.submitForm.get('additional')['controls'].features.controls.forEach(element => {
      console.log(element);
      if (element.value.selected)
        property.features.push(element.value.id);
    });

    const features = media.get('additionalFeatures') as FormArray;
    features.controls.forEach(element => {
      property.additional_features.push({
        name: element.value['name'],
        value: element.value['value']
      });
    });

    // this.features.forEach(element => {
    //   if (element.selected) 
    //     property.features.push(element.id);
    // });
    // const featured: MatSlideToggle = media.get('featured') as unknown as MatSlideToggle;
    property.featured = this.submitForm.controls.media.get('featured').value;

    this.appService.submitProperty(property).subscribe(response => {

      // Gallery Image Submission

      Promise.all(this.submitForm.value.basic.gallery.map(
        e => this.appService.submitAttachment(e)
      )).then(
        attachResults => Promise.all(attachResults.map(
          (e: any) => this.appService.submitGallery(
            response.id, 
            {
              type: 'Image',
              attachment_id: e.id
            }
          )
        )
      ));


      // Plan Info Submission

      const planPromises = [];
      this.submitForm.value.media.plans.forEach(e => {
        const plan = {
          name: e.name,
          desc: e.desc,
          area: e.area,
          rooms: e.rooms,
          baths: e.baths,
          property_id: response.id
        } as any;
        if (e.image.length > 0) {
          this.appService.submitAttachment(e.image[0]).then(attachResult => {
            plan.attachment_id = attachResult.id;
            planPromises.push(this.appService.submitPlan(plan));
          })
        } else {
          planPromises.push(this.appService.submitPlan(plan));
        }
      });
      Promise.all(planPromises);


      // Video Info Submission

      const videoPromises = [];
      this.submitForm.value.media.videos.forEach(e => {
        const video = {
          link: e.link,
          name: e.name,
          type: 'Video'
        } as any;
        if (e.link.trim() != '') {
          this.appService.submitAttachment(video).then(attachResult => {
            video.attachment_id = attachResult.id;
            videoPromises.push(this.appService.submitGallery(response.id, video));
          })
        } else {
          videoPromises.push(this.appService.submitGallery(response.id, video));
        }
      });
      Promise.all(videoPromises);
    });
  }

}