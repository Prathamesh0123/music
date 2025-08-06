import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { concatMap } from 'rxjs/operators'; // <-- Import operator
import { fadeIn } from 'src/app/animations/animations';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations:[fadeIn],
})
export class ProfileComponent implements OnInit {
  userData:any;
  isImgSelected:boolean = false;
  isNameChange:boolean = false;
  isEmailChange:boolean = false;
  userName:string = '';
  userEmail:string = '';
  selectedFile:File | null = null; 


  
  constructor(private authService:AuthService,private supabaseService:SupabaseService,private songService:MusicFetchApiService){
    this.loadData();
  }
  ngOnInit(): void {
    // this.loadData();// initial load data
    this.authService.profileChanged$.subscribe(() =>{
      this.loadData();//on chnage somthin load 
    })
  }

  
  imgPreview: string | ArrayBuffer | null = null;
  loadData(){
      this.authService.getUserData().subscribe({
        next:(res:any)=>{
          this.userData = res.data;
          this.userName = this.userData.name;
          this.userEmail = this.userData.email;
        }
      })
  }
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

   uploadImage(){
      if(!this.selectedFile){
        console.log('error no file selcted');
        return;
      }
      this.imgPreview = null;
      const userId = this.authService.getUid();
      const filePath = `profile-picture/${userId}`;
      console.log(filePath);
      
      //wait for deletion then upload 
      this.supabaseService.updateImage(filePath,this.selectedFile).pipe(
        concatMap((res)=>{
            console.log(res.data);
            return this.supabaseService.uploadImage(this.selectedFile!,filePath);
        }),
        //upload image
        concatMap(uploadResponse=>{
          if(!uploadResponse.data.path){
            throw new Error('Error upload in supabase');
          }
          const imgUrl = this.supabaseService.getPublicUrl(filePath);
          const finalUrl = `${imgUrl}?t=${new Date().getTime()}`;//crutal part catche busting 
          return this.supabaseService.setImageUrl(finalUrl);
        })
      ).subscribe({
        // handled all the final res return by setImagUrl
        next:(backEndResponse:any)=>{
          console.log('back end stored image..',backEndResponse.message);
          this.isImgSelected = false;
          this.imgPreview = null;
          this.authService.notifyProfileChnage();//for main component to fetch data
          
          // this.ngOnInit();
        },
        error:(err)=>{
          console.log('error storing in backend ',err.message);
          this.isImgSelected = false;
          this.imgPreview = null;
        }
      })

  }

  changeName(){
    this.isNameChange = true;
  }



  chnageEmail(){
    this.isEmailChange = true;
  }

  updateName(){
    if(!this.userName){
      alert('Provide name');
      return;
    }
    this.authService.updateName(this.userName)?.subscribe({
      next:(res:any)=>{
        this.isNameChange = false;
        console.log(res.message);
      },
      error:(err)=>{
        console.log(err.message);
      }
    })
  }

  updateEmail(){
    if(!this.userEmail){
      alert('provide email id')
      return;
    }
    console.log(this.userEmail);
    
    this.authService.updateEmail(this.userEmail)?.subscribe({
      next:(res:any)=>{
        console.log(res.message);
        this.isEmailChange = false;
      }
    })
  }

  logOut(){
    this.songService.logOut();
  }
}


