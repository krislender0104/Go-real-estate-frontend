import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute } from '@angular/router';
import { Application } from 'src/app/app.models';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplciationDetail implements OnInit {
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<Application>;
  @ViewChild('paymentScript', { static: false }) paymentScript: ElementRef;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  private sub: any;
  public application: Application;
  public paymentForm: FormGroup;
  public paymentSubmitUrl = environment.host + '/charge';
  protected cancelRecurringUrl = environment.host + '/cancelRecurring';
  
  constructor(public appService: AppService,
              private activatedRoute: ActivatedRoute,
              public fb: FormBuilder) { }

  ngOnInit() {
    const agent = this.appService.currentUserValue;
    let observable: any;
    let id;
    this.paymentForm = this.fb.group({});

    this.sub = this.activatedRoute.params.subscribe(params => {   
      id = params['id'];

      if (agent.user_type === 'Admin') {
        observable = this.appService.getProperties(this.paginator.page, 10);
        this.displayedColumns = ['id', 'thumbnail', 'title', 'published', 'views', 'actions' ];
      } else {
        observable = this.appService.getApplications(id);
        this.displayedColumns = ['id', 'paid_amount', 'created_at' ];
      }
      observable.subscribe(res => {
        this.application = res;
        this.dataSource = new MatTableDataSource(res.history_payment);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.application.status === 1) {
          this.placeStripeForm(
            this.paymentScript.nativeElement,
            this.appService.currentUserValue.email,
            'Pay',
            res.history_payment.length === 0 ? res.contract.down_payment : res.contract.monthly_payment,
            'Pay',
            'Pay'
          );
        }
      });
    });
  }

  public status(value) {
    if(value == 0)
    {
      
      return "Pending";
    }
    else if(value == 1)
      return "Accepted";
    else  
      return "Rejected";
  }

  public handleCancelSubscription() {
    this.appService.cancelRecurring(this.application.contract.id).subscribe(res => {
      this.application.contract.recurring = 0
    })
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
}