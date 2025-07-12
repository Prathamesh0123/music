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

  songData:any;
  constructor(private songService:MusicFetchApiService){}
  ngOnInit():void{
    // this.play();

    this.songService.emitCurrentVolume();
    this.songService.isPlayingBehaviourSub.asObservable().subscribe(val =>{
      this.isPlaying = val;
    })
    this.songService.getVolume().subscribe(volume =>{
      this.currentVlolume = volume * 100;
    })
    this.songService.getSongMetadata().subscribe( songMetadata => {
      this.songData = songMetadata;
      // this.songService.playSong(this.songData.url);
    });

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
    this.songService.playSong(this.songData.url);
  }

  pause(){
    this.songService.pauseSong();
    // this.isPlaying = false;
  }

  volumeControl(event:Event){
    const newVolume = Number((event.target as HTMLInputElement).value);
    
    this.currentVlolume = newVolume;                    // ✅ update variable
    const normalizedVolume = newVolume / 100;          // convert 0–100 to 0.0–1.0

    this.songService.setVolume(normalizedVolume);
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
  
}
