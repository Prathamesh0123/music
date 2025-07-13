import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicData } from 'src/app/models/music-data';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
@Component({
  selector: 'app-big-player',
  templateUrl: './big-player.component.html',
  styleUrls: ['./big-player.component.css']
})
export class BigPlayerComponent implements OnInit{
  showControl:boolean = false;

  isPlaying:boolean = false;

  currentVlolume:number = 0;
  duration:number = 0;
  maxVolume:number = 100;
  currentTime:number = 0;
  url!:string;

  loadPopUp:boolean = false;
  songData:any;
  currentSongIndex!:number;
  songArray:MusicData [] = [];
  constructor(private songService:MusicFetchApiService,private router:Router){}
  ngOnInit():void{

    this.songService.currentIndexBehaviorSub.asObservable().subscribe(val =>{
      this.currentSongIndex = val;
    })

    this.songArray = this.songService.getSongArray();
    this.songService.getSongMetadata().subscribe( songMetadata => {
      this.songData = songMetadata;
      // this.songService.playSong(this.songData.url);
    });
 
    this.songService.backPress(false);
    this.songService.emitCurrentVolume();
    this.songService.isPlayingBehaviourSub.asObservable().subscribe(val =>{
    this.isPlaying = val;
    })
    this.songService.getVolume().subscribe(volume =>{
      this.currentVlolume = volume * 100;
    })

    this.songService.getSongCurrentTime().subscribe( time => {
      this.currentTime = time;
    });

    this.songService.getSongDuration().subscribe( duration =>{
      this.duration = duration;
    });
    
  }
  
  showControls():void{
    this.showControl = !this.showControl;

  }

  play():void{
    this.songService.playSong();
  }

  playFromQue(index:number){
    this.songService.playSongFromQueue(index);
  }
  pause(){
    this.songService.pauseSong();
    // this.isPlaying = false;
  }

  next() {
    if (this.currentSongIndex + 1 < this.songArray.length) {
      this.songService.playSongFromQueue(this.currentSongIndex + 1);
    } else {
      this.songService.playSongFromQueue(0); // loop back
    }
  }

  prev() {
    if (this.currentSongIndex > 0) {
      this.songService.playSongFromQueue(this.currentSongIndex - 1);
    } else {
      this.songService.playSongFromQueue(this.songArray.length - 1); // go to last
    }
  }


  volumeControl(event:Event){
    const newVolume = Number((event.target as HTMLInputElement).value);
    
    this.currentVlolume = newVolume;                    // ✅ update variable
    const normalizedVolume = newVolume / 100;          // convert 0–100 to 0.0–1.0

    this.songService.setVolume(normalizedVolume);
  }


seekTo(event: Event) {
  const newTime = Number((event.target as HTMLInputElement).value);
  this.songService.setSeekTime(newTime);
}


  formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  // Format like 01:09 instead of 1:9
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
  
  return `${formattedMinutes}:${formattedSeconds}`;
}
  
backPressed(){
  this.loadPopUp = true;
  this.router.navigate(['/home']);
  this.songService.backPress(this.loadPopUp);
}
}
