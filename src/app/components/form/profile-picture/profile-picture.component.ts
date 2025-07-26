import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { concatMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css']
})
export class ProfilePictureComponent implements OnInit {

  imagePreview:string | ArrayBuffer | null = null;
  selectedFile:File | null = null;

  constructor(private supabaseService:SupabaseService,private router:Router,private authService:AuthService){}
  ngOnInit(): void {
    const user = this.authService.getUserData()?.subscribe({
        next:(res:any)=>{
          if(!res.data.userProfileUrl){            
                this.router.navigate(['/profilePhoto']);
          }else{
                this.router.navigate(['/home']);              
          }
      }
    })
  }
  onFileSelected(event:Event){
    console.log(event);
    const file = (event.target as HTMLInputElement).files?.[0];
    console.log(file);
    if(file){
      this.selectedFile = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);//convert file into Base64

      reader.onload = () =>{ //this is event invoked when the reader converted into Base64
        this.imagePreview = reader.result;
      };

    }
  }

  async uploadImage() {
    if (this.selectedFile) {
        const userId = this.authService.getUid();
        if(!userId){
            console.log('UID not found in token');
            return;
        }
        const filePath = `profile-picture/${userId}_${Date.now()}`;
        
        this.supabaseService.uploadImage(this.selectedFile,filePath).pipe(
          concatMap((uploadSupabase)=>{
            if(!uploadSupabase.data.path){
                throw new Error('Error upload in supabase');
              }
              const imgUrl = this.supabaseService.getPublicUrl(filePath);
              return this.supabaseService.setImageUrl(imgUrl);
          })
        ).subscribe({
          next:(backEndRes)=>{
            console.log(backEndRes.message);
            this.router.navigate(['/home']);
          },
          error:(err)=>{
            console.log(err.message);
          }
        })
    }else{
        this.router.navigate(['/home']);
    }
  }

}
