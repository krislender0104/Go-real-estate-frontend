import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router'; 
import { MatSnackBar } from '@angular/material';
import { first } from 'rxjs/operators';
import { matchingPasswords, emailValidator } from 'src/app/theme/utils/app-validators';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public hide = true;
  public userTypes = [
    { id: 1, name: 'Rentor' },
    { id: 2, name: 'Buyer' }
  ];
  loading = false;
  constructor(public fb: FormBuilder, public router:Router, public snackBar: MatSnackBar, public appService:AppService) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      last_name: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      newsletter: false
    },{validator: matchingPasswords('password', 'password_confirmation')});
  }

  public onRegisterFormSubmit(values:Object):void {
    if (this.registerForm.valid) {
      this.loading = true;
      console.log(values);
      // return;
      this.appService.signup(values).subscribe(response => {
        this.snackBar.open('You registered successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.appService.login(this.registerForm.value.email, this.registerForm.value.password)
        .pipe(first())
        .subscribe(
            data => {
              this.router.navigate(['/']);
            },
            error => {
              this.loading = false;
            });
      }, error => {
        this.loading = false;
      })
    }
  }
}
