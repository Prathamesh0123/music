import { Component } from '@angular/core';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private musicApi:MusicFetchApiService,private router:Router){}
  songName:string = '';
  
  fetchSong(){
    if(this.songName){
      this.musicApi.getSong(this.songName).subscribe({
        next:(response:any)=>{
          this.musicApi.songUrl = response.url;
          this.musicApi.setSongData({
              thumbnail:response.thumbnail,
              artist:response.artist,
              title:response.title,
              url:response.url
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
