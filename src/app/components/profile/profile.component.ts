import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData:any;
  isImgSelected:boolean = false;
  isNameChange:boolean = false;
  isEmailChange:boolean = false;
  userName:string = '';
  userEmail:string = '';
  selectedFile:File | null = null; 

  constructor(private authService:AuthService,private supabaseService:SupabaseService){}
  ngOnInit(): void {
      this.authService.getUserData().subscribe({
        next:(res:any)=>{
          this.userData = res.data;
          this.userName = this.userData.name;
          this.userEmail = this.userData.email;
        }
      })
  }
  
  imgPreview: string | ArrayBuffer | null = null;
  chnageProfile(event:Event){
    const file = (event.target as HTMLInputElement).files?.[0];
    this.isImgSelected = true;
    if(file){
      this.selectedFile = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () =>{
        this.imgPreview = reader.result;
        console.log(this.imgPreview);
      }
    }
  }

  async uploadImage(){

    if(this.selectedFile){
      const userId = this.authService.getUid();
      const filePath = `profile-picture/${userId}`;
      //wait for deletion then upload 
      await this.supabaseService.deleteImage(filePath);
      this.supabaseService.uploadImage(this.selectedFile,filePath).subscribe({
        next:(res:any)=>{
          if(res.data.path){
            this.supabaseService.setImageUrl(filePath);
            this.isImgSelected = false;
            this.imgPreview = null;
            this.ngOnInit();
          }else{
            console.log('erro uploading image...');
          }
        }
      })
    }

  }

  changeName(){
    this.isNameChange = true;
  }



  chnageEmail(){
    this.isEmailChange = true;
  }



  updateName(){
    this.isNameChange = false;
    this.ngOnInit();
  }

  updateEmail(){
    this.isEmailChange = false;
  }
}
