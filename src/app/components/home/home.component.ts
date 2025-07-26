import { Component } from '@angular/core';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

const enterAnimation = transition(':enter',[
  style({
    opacity:0
  }),
  animate('300ms ease-in'),style({opacity:1})
])
const fadeIn = trigger('fadeIn',[enterAnimation]);
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations:[fadeIn],
})
export class HomeComponent {
  constructor(private musicApi:MusicFetchApiService,private router:Router){}
  songName:string = '';
    

  fetchSong(){
    if(this.songName){
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
          this.router.navigate(['/musicPlayer']);
        },
        error:(err)=>{
          console.log(`errro ${err}`);
        }
      })
    }else{
      alert("Provide song name!!!");
    }

  }
}
