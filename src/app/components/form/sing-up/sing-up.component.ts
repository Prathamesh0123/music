import { Component } from '@angular/core';
import { FormGroup,FormBuilder,Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.component.html',
  styleUrls: ['./sing-up.component.css']
})
export class SingUpComponent{
  isSignUp : boolean = false;
  authForm!:  FormGroup;
  passwordMissMatch: boolean = false;

  constructor(private fb:FormBuilder,private router:Router){
    this.authForm = this.fb.group({
      name:['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
      confirmPassword:['',Validators.required],
    },
    {
      validators : this.passwordValidator,
    }
  );
  }

  passwordValidator(form:AbstractControl){
    return form.get('password')?.value == form.get('confirmPassword')?.value ? null : {'missMatch':true};
  }

  GotologIn() {
    this.isSignUp = true;
    this.router.navigate(['/']);
    this.authForm.reset();
  }

  signUp(form: FormGroup) {
    console.log(form.value);
    this.authForm.reset();
  }

}
