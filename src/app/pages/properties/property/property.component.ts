import { Component, ElementRef, OnInit, ViewChild, HostListener, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Property } from 'src/app/app.models';
import { environment } from 'src/environments/environment';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppSettings, Settings } from 'src/app/app.settings';
import { CompareOverviewComponent } from 'src/app/shared/compare-overview/compare-overview.component';
import { EmbedVideoService } from 'ngx-embed-video';
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { SlideInOutAnimation } from 'src/app/animations';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss'],
  animations: [SlideInOutAnimation],
  encapsulation: ViewEncapsulation.None
})
export class PropertyComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  @ViewChild('onetimePaymentScript', { static: false }) onetimePaymentScript: ElementRef;
  @ViewChild('rentAutoPaymentScript', { static: false }) rentAutoPaymentScript: ElementRef;
  @ViewChild('rentManualPaymentScript', { static: false }) rentManualPaymentScript: ElementRef;
  @ViewChildren(SwiperDirective) swipers: QueryList<SwiperDirective>;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation:true
  };
  public sidenavOpen:boolean = true;
  public config: SwiperConfigInterface = {}; 
  public config2: SwiperConfigInterface = {}; 
  private sub: any;
  public property:Property; 
  public settings: Settings;  
  public embedVideo: any;
  public relatedProperties: Property[];
  public featuredProperties: Property[];
  public agent:any;
  public mortgageForm: FormGroup;
  public monthlyPayment:any;
  public contactForm: FormGroup;
  public paymentForm: FormGroup;

  protected paymentSubmitUrl = environment.host + '/charge';
  public soldLabel: string;
  protected canSell: boolean;
  protected canRent: boolean;

  public animationState = 'in';
  public sendingApplication = false;

  private defaultCenter = {lat: 55.5815245, lng: 36.8251383};
  public currentCenter;

  constructor(public appSettings:AppSettings, 
              public appService:AppService, 
              private activatedRoute: ActivatedRoute, 
              private embedService: EmbedVideoService,
              public fb: FormBuilder) {
    this.settings = this.appSettings.settings; 
    this.currentCenter = Object.assign({}, this.defaultCenter);
  }

  ngOnInit() {
    let id;
    this.sub = this.activatedRoute.params.subscribe(params => {   
      id = params['id'];
      this.getPropertyById(params['id']); 
    });
    this.getRelatedProperties(id);
    this.getFeaturedProperties();
    if(window.innerWidth < 960){
      this.sidenavOpen = false;
      this.sidenav.close();
    };
    this.paymentForm = this.fb.group({});
    this.mortgageForm = this.fb.group({
      principalAmount: ['', Validators.required],
      downPayment: ['', Validators.required], 
      interestRate: ['', Validators.required],
      period: ['', Validators.required]
    });
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      rent_or_buy: ['', Validators.required],
      how_long_live: ['', Validators.required],
      job: ['', Validators.required],
      job_city: ['', Validators.required],
      job_state: ['', Validators.required],
      how_long_work: ['', Validators.required],
      monthly_income: ['', Validators.required],
      pet: ['', Validators.required],
      pet_count: [''],
      period: [''],
      sign: ['', Validators.required],
      phone: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }  

  @HostListener('window:resize')
  public onWindowResize():void {
    (window.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true; 
  }

  protected placeStripeForm(elem, email, desc, price, name, buttonTitle) {
    const script = document.createElement('script');
    const parent = elem.parentElement;
    script.type = 'text/javascript';
    script.setAttribute('class', 'stripe-button');
    script.setAttribute('data-key', environment.stripeKey);
    script.setAttribute('data-amount', (price * 100).toString());
    script.setAttribute('data-name', name);
    script.setAttribute('data-email', email);
    script.setAttribute('data-description', desc);
    script.setAttribute('data-image', 'https://stripe.com/img/documentation/checkout/marketplace.png');
    script.setAttribute('data-locale', 'auto');
    script.setAttribute('data-currency', 'usd');
    script.setAttribute('data-label', buttonTitle);
    script.src = 'https://checkout.stripe.com/checkout.js';
    parent.parentElement.replaceChild(script, parent);
  }

  public getPropertyById(id){
    this.appService.getPropertyById(id).subscribe(data=>{
      this.property = data;  
      this.soldLabel = this.appService.soldLabel(this.property);

      if (this.property.status.indexOf('Sold') >= 0) {
        this.animationState = "out";
      }

      if (this.property.videos.length > 1) {
        this.embedVideo = this.embedService.embed(this.property.videos[1].link);
      }
      
      setTimeout(() => { 
        this.config.observer = true;
        this.config2.observer = true; 
        this.swipers.forEach(swiper => { 
          if(swiper){
            swiper.setIndex(0);
          } 
        }); 
      });

      if (!this.soldLabel) {
        if (this.appService.currentUserValue) {
          this.canSell = this.property.status.includes('For Sale');
          this.canRent = this.property.status.includes('For Rent');

          if (this.property) {
            if (this.canSell) {
              this.placeStripeForm(
                this.onetimePaymentScript.nativeElement,
                this.appService.currentUserValue.email,
                'Buy ' + this.property.title + ' with\r\n' + this.property.details.price_dollar_sale,
                this.property.details.price_dollar_sale,
                'Purchase with Stripe',
                'Buy'
              );
            }

            if (this.canRent) {
              // this.placeStripeForm(
              //   this.rentAutoPaymentScript.nativeElement,
              //   this.appService.currentUserValue.email,
              //   'Rent ' + this.property.title + ' with\r\n' + this.property.details.price_dollar_rent + ' / mo',
              //   this.property.details.price_dollar_rent,
              //   'Subscribe to auto payment for rent with Stripe',
              //   'Rent (Auto pay monthly)'
              // );

              // this.placeStripeForm(
              //   this.rentManualPaymentScript.nativeElement,
              //   this.appService.currentUserValue.email,
              //   'Rent ' + this.property.title + ' with\r\n' + this.property.details.price_dollar_rent + ' / mo',
              //   this.property.details.price_dollar_rent,
              //   'Subscribe to manual payment for rent with Stripe',
              //   'Rent (Manual pay monthly)'
              // );
            }
          }
        }
      }

      this.agent = data.agent;
      this.currentCenter = {lat: parseFloat(data.details.lat.toString()), lng: parseFloat(data.details.lng.toString())};
      console.log(this.currentCenter);
    });
  }

  ngAfterViewInit(){
    this.config = {
      observer: false,
      slidesPerView: 1,
      spaceBetween: 0,       
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,        
      loop: false,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      }
    };

    this.config2 = {
      observer: false,
      slidesPerView: 4,
      spaceBetween: 16,      
      keyboard: true,
      navigation: false,
      pagination: false, 
      grabCursor: true,       
      loop: false, 
      preloadImages: false,
      lazy: true,  
      breakpoints: {
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3,
        }
      }
    }
  }

  public onOpenedChange() { 
    this.swipers.forEach(swiper => { 
      if(swiper){
        swiper.update();
      } 
    });     
  }

  public selectImage(index:number){ 
    this.swipers.forEach(swiper => {
      if(swiper['elementRef'].nativeElement.id == 'main-carousel'){
        swiper.setIndex(index);
      }      
    }); 
  }

  public onIndexChange(index: number) {  
    this.swipers.forEach(swiper => { 
      let elem = swiper['elementRef'].nativeElement;
      if(elem.id == 'small-carousel'){
        swiper.setIndex(index);  
        for (let i = 0; i < elem.children[0].children.length; i++) {
          const element = elem.children[0].children[i]; 
          if(element.classList.contains('thumb-'+index)){
            element.classList.add('active-thumb'); 
          }
          else{
            element.classList.remove('active-thumb'); 
          }
        }
      } 
    });     
  }

  public addToCompare(){
    this.appService.addToCompare(this.property, CompareOverviewComponent, (this.settings.rtl) ? 'rtl':'ltr'); 
  }

  public onCompare(){
    return this.appService.Data.compareList.filter(item=>item.id == this.property.id)[0];
  }

  public addToFavorites(){
    this.appService.addToFavorites(this.property, (this.settings.rtl) ? 'rtl':'ltr', 1);
  }

  public onFavorites(){
    return this.appService.Data.favorites.filter(item=>item.id == this.property.id)[0];
  }

  public getRelatedProperties(id){
    this.appService.getRelatedProperties(id).subscribe(properties=>{
      this.relatedProperties = properties;
    })
  }

  public getFeaturedProperties(){
    this.appService.getFeaturedProperties().subscribe(properties=>{
      this.featuredProperties = properties.slice(0,3); 
    })
  } 

  // public getAgent(agentId:number = 1){
  //   this.agent = this.property.agent
  //   // var ids = [1,2,3,4,5]; //agent ids 
  //   // agentId = ids[Math.floor(Math.random()*ids.length)]; //random agent id
  //   // this.appService.getAgents().subscribe( data => {
  //   //   this.agent = data.filter(agent=> agent.id == agentId)[0]; 
  //   // });
  // }

  public onContactFormSubmit(values:Object){
    if (this.contactForm.valid) { 
      values['property_id'] = this.property.id;
      this.sendingApplication = true;
      this.appService.submitApplication(values).then((res:any) => {
        if (res.success) {
          this.animationState = 'out';
        }
      });
    } else {
      this.sendingApplication = false;
      console.log(this.contactForm.errors);
    }
  }

  public onMortgageFormSubmit(values:Object){ 
    if (this.mortgageForm.valid) { 
      var principalAmount = values['principalAmount']
      var down = values['downPayment']
      var interest = values['interestRate']
      var term = values['period']
      this.monthlyPayment = this.calculateMortgage(principalAmount, down, interest / 100 / 12, term * 12).toFixed(2);
    }     
  }
  public calculateMortgage(principalAmount:any, downPayment:any, interestRate:any, period:any){    
    return ((principalAmount-downPayment) * interestRate) / (1 - Math.pow(1 + interestRate, -period));
  } 

}