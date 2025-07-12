import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';

@Component({
  selector: 'app-pop-up-player',
  templateUrl: './pop-up-player.component.html',
  styleUrls: ['./pop-up-player.component.css']
})
export class PopUpPlayerComponent {
  showPlayer:boolean = true;
  isPlaying:boolean = false;
  songData = {
    thumbnail:'',
    title:'',
    artist:'',
    url:''
  }
  currentTime:number = 0;
  duration:number = 0;
  constructor(private router:Router,private songService:MusicFetchApiService){}


  ngOnInit(): void {
      this.songService.getSongMetadata().subscribe(val =>{
        this.songData = val;
      })

      this.songService.getSongCurrentTime().subscribe(val =>{
        this.currentTime = val;
      })

      this.songService.getSongDuration().subscribe(val =>{
        this.duration = val;
      })

      this.songService.isPlayingBehaviourSub.asObservable().subscribe(val =>{
        this.isPlaying = val;
      })


      this.songService.isBackPrssed.asObservable().subscribe(val =>{
        this.showPlayer = val;
      });

      
  }

  showBigPlayer(){
    this.showPlayer = false;
    this.songService.backPress(this.showPlayer);
    this.router.navigate(['/musicPlayer']);
  }

  play(){
    this.songService.playSong();
  }

  pause(){
    this.songService.pauseSong();
  }

  seekTo(event:Event){
    const newTime = Number((event.target as HTMLInputElement).value);
    this.songService.setSeekTime(newTime);
  }
}
