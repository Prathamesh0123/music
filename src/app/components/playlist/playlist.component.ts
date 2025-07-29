import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { fadeIn } from 'src/app/animations/animations';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
  animations:[fadeIn]
})
export class PlaylistComponent implements OnInit{
  songData:any[] = [];
  showLoader:boolean = false;
  constructor(private songService:MusicFetchApiService,private router:Router){}
  ngOnInit(): void {
      this.showLoader = true;
      this.songService.getSongFromPlaylist()?.subscribe((res:any)=>{
        this.songData = res.data;
        this.showLoader = false;
        // console.log(this.songData);
      })
  }

  playSong(playlist:any){
    sessionStorage.setItem('playlistName',playlist.title);
    if(playlist.songs){
      console.log(playlist.songs);
      this.songService.playFromPlayList(playlist.songs);
      this.router.navigate(['/musicPlayer']);
    }
  }

  gotoHome(){
    this.router.navigate(['/home']);
  }
}
