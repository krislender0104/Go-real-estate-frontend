import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { emailValidator, matchingPasswords } from 'src/app/theme/utils/app-validators';
import { MatSnackBar } from '@angular/material';

import { AppService } from 'src/app/app.service';
import { InputFile } from 'ngx-input-file';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public infoForm:FormGroup;
  public passwordForm:FormGroup;
  public profileImage: InputFile;
  constructor(public appService:AppService, public formBuilder: FormBuilder, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.infoForm = this.formBuilder.group({
      first_name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      last_name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      image: null,      
      organization: null,
      facebook: null,
      twitter: null,
      linkedin: null,
      instagram: null,
      website: null
    });
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    },{validator: matchingPasswords('newPassword', 'confirmNewPassword')});

    this.getProfile();
  }

  public getProfile(): void {
    this.appService.getUserProfile(this.appService.currentUserValue.id).subscribe(data => {
      this.infoForm.get('first_name').setValue(data.first_name);
      this.infoForm.get('last_name').setValue(data.last_name);
      this.infoForm.get('email').setValue(data.email);
      this.infoForm.get('phone').setValue(data.phone);
      this.infoForm.get('organization').setValue(data.organization);
      this.infoForm.get('facebook').setValue(data.facebook);
      this.infoForm.get('twitter').setValue(data.twitter);
      this.infoForm.get('linkedin').setValue(data.linkedin);
      this.infoForm.get('instagram').setValue(data.instagram);
      this.infoForm.get('website').setValue(data.website);

      const images: any[] = [];
      let image = {
          link: data.image,
          preview: data.image
      }
      images.push(image);

      this.infoForm.get('image').setValue(images);

    });
  }

  public onProfileImageAccepted(event) {
    this.profileImage = event;
    console.log('accepted');
  }

  public onProfileImageDeleted(event) {
    this.profileImage = null;
    console.log('deleted');
  }

  public onInfoFormSubmit(values:any):void {
    if (this.infoForm.valid) {
      const formData = new FormData();
      if (this.profileImage != null && this.profileImage != undefined) {
        formData.append('image', this.profileImage.file, this.profileImage.file.name);
      }

      formData.append('id', '' + this.appService.currentUserValue.id);
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('organization', values.organization);
      formData.append('facebook', values.facebook);
      formData.append('twitter', values.twitter);
      formData.append('linkedin', values.linkedin);
      formData.append('instagram', values.instagram);
      formData.append('website', values.website);

      this.appService.updateUserProfile(formData).subscribe(data => {
        this.snackBar.open('Your account information updated successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      });
    }
  }

  public onPasswordFormSubmit(values:Object):void {
    if (this.passwordForm.valid) {
      this.appService.changePassword(this.passwordForm.value.currentPassword, this.passwordForm.value.newPassword).subscribe(data => {
        this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      });
    }
  }

}
