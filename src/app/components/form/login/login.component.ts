import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUp : boolean = false;
  authForm!:  FormGroup;

  constructor(private fb:FormBuilder,private router:Router,private authService:AuthService){
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

    const {email,password} = form.value;
    this.authService.logInUser({email,password}).subscribe({
      next:(res:any) =>{
        localStorage.setItem('token',res.token);
        console.log('welcome : ',res.message);
        this.router.navigate(['/profilePhoto']);
        this.authForm.reset();
      },
      error:(err) =>{
        console.log(err);
      }
    })
  }
  
}
