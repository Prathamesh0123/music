import { Component } from '@angular/core';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { Router } from '@angular/router';
import { fadeIn } from 'src/app/animations/animations';
import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations:[fadeIn],
})
export class HomeComponent {
  constructor(private musicApi:MusicFetchApiService,private router:Router,private snackBar:NotificationService){}
  songName:string = '';
    
showLoader:boolean = false;
  fetchSong(){
    if(this.songName){
      this.showLoader = true;
      this.musicApi.getSong(this.songName).subscribe({
        next:(response:any)=>{
          // this.musicApi.songUrl = response.url;
          this.musicApi.setSongData({
              thumbnail:response.thumbnail,
              artist:response.artist,
              title:response.title,
              url:response.audioUrl,
              songId:response.videoId
            });
          this.showLoader = false;
          this.router.navigate(['/musicPlayer']);
        },
        error:(err)=>{
          console.log(`errro ${err}`);
        }
      })
    }else{
      // alert("Provide song name!!!");
      this.snackBar.showError('Provide song name🎵🎵🎵');
    }

  }
}
