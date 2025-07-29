import { Component } from '@angular/core';
import { FormGroup,FormBuilder,Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { slideUpDownFade } from 'src/app/animations/animations';
@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.component.html',
  styleUrls: ['./sing-up.component.css'],
  animations:[slideUpDownFade]
})
export class SingUpComponent{
  isSignUp : boolean = false;
  authForm!:  FormGroup;
  passwordMissMatch: boolean = false;

  constructor(private fb:FormBuilder,private router:Router,private userAuth:AuthService){
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

    const {name,email,password} = form.value;
    console.log(name);
    console.log(email);
    console.log(password);
    this.userAuth.signUpUser({name,email,password}).subscribe({
      next:(res)=>{
        alert(res.message);
          this.authForm.reset();
          this.router.navigate(['/']);
      },
      error:(err)=>{
        alert(err.message);
      }
    })
  }
}
