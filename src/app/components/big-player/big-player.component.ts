import { Component,OnInit } from '@angular/core';
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
  seekValue: number = 0;

  songData:any;
  constructor(private songService:MusicFetchApiService){}
  ngOnInit():void{
    this.play();
    this.songData = this.songService.getSongMetadata();

    this.songService.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.songService.audio.duration;
    });
    this.songService.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.songService.audio.currentTime;
      if (!this.isDragging) {
        this.seekValue = this.currentTime;
      }
    });
    // Removed setInterval polling
  }
  
  showControls():void{
    this.showControl = !this.showControl;

  }

  play():void{
    this.songService.playSong(this.songService.getSongUrl());
    this.isPlaying = true;
  }

  pause(){
    this.songService.pauseSong();
    this.isPlaying = false;
  }

  // audioSetUp(){
  //   this.songService.audio.addEventListener('loadedmetadata',()=>{
  //     this.duration = this.songService.getSongDuration();
  //   })
  //   this.songService.audio.addEventListener('timeupdate',()=>{
  //     this.currentTime = this.songService.getSongCurrentTime();
  //   })
  // }

  // playPause(){
  //   if(this.isPlaying){
  //     this.audio.pause();
  //   }else{
  //     this.audio.play();
  //   }
  //   this.isPlaying = !this.isPlaying;
  // }

  loadLocalSong(event:Event){
    // const file = (event.target as HTMLInputElement).files?.[0];

    // if(file){
    //    this.url = URL.createObjectURL(file);
    // }else{
    //   console.log('No file selected!!!');
    // }
    // this.audio.src = this.url;
    // this.audio.load();
    
    // this.audio.addEventListener('loadedmetadata',()=>{
    //   this.duration = this.audio.duration;
    //   // console.log(this.duration);
    // })

    // this.audio.addEventListener('timeupdate',()=>{
    //   this.currentTime = this.audio.currentTime;      
    // })
    
    // this.audio.play();
    // this.isPlaying = true;

  }

  // pause():void{
  //   this.isPlaying = false;
  // }


  // only register the change when dragging is stopped
  isDragging: boolean = false;

  onSeekInput(event: Event) {
    this.isDragging = true;
    this.seekValue = Number((event.target as HTMLInputElement).value);
  }

  onSeekChange(event: Event) {
    this.isDragging = false;
    const newTime = Number((event.target as HTMLInputElement).value);
    this.seekTo(newTime);
  }

  seekTo(newTime: number) {
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
  
}
