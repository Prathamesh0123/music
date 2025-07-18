import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUp : boolean = false;
  authForm!:  FormGroup;

  constructor(private fb:FormBuilder,private router:Router){
    this.authForm = this.fb.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
    }
  );
  }


  GotosignUp() {
    this.isSignUp = false;
    this.router.navigate(['/signup']);
    this.authForm.reset();
    
  }

  logIn(form: FormGroup) {
    console.log(form.value);
    this.authForm.reset();
  }
  
}
