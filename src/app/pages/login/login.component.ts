import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { first } from 'rxjs/operators';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public hide = true;
  loading = false;
  returnUrl: string;
  error = '';

  constructor(public fb: FormBuilder, 
    public router:Router,
    private route: ActivatedRoute,
    private appService: AppService) { 
      if (this.appService.currentUserValue) { 
        this.router.navigate(['/']);
      }
    }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(1)])],
      rememberMe: false
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  public onLoginFormSubmit(values:Object):void {
    if (this.loginForm.valid) {
      this.loading = true;
        this.appService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }
  }

}
