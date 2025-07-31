import { AfterViewInit, Component,OnDestroy,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicData } from 'src/app/models/music-data';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { slideUpDownFade } from 'src/app/animations/animations';
import { initFlowbite } from 'flowbite';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-big-player',
  templateUrl: './big-player.component.html',
  styleUrls: ['./big-player.component.css'],
  animations:[slideUpDownFade]
})
export class BigPlayerComponent implements OnInit,OnDestroy,AfterViewInit{
  showControl:boolean = false;
  currentSongSource: 'general' | 'playlist' = 'general';
  isPlaying:boolean = false;
  private destroy$ = new Subject<void>();

  currentVlolume:number = 0;
  duration:number = 0;
  maxVolume:number = 100;
  currentTime:number = 0;
  url!:string;

  loadPopUp:boolean = false;
  songData:any;
  currentSongIndex!:number;
  songArray:MusicData [] = [];
  playlistName:string | null = '';
  constructor(private songService:MusicFetchApiService,private router:Router){}
  ngAfterViewInit(): void {
      initFlowbite();
  }
  ngOnInit():void{
    // initFlowbite();
    this.songService.musicDataBehaviorSub.subscribe(data =>{
      this.songArray = data;
      
    });
    this.songService.playlistNameObs$.subscribe(data =>{
      this.playlistName = data;
      console.log(this.playlistName);
    })
    this.songService.curretSourceBehavoirSub.pipe(
      takeUntil(this.destroy$)
    ).subscribe(source =>{
      this.currentSongSource = source;
      console.log(this.currentSongSource);
    })
    this.songService.currentIndexBehaviorSub.asObservable().subscribe(val =>{
      this.currentSongIndex = val;
    })


 
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
  //show music pop up
  ngOnDestroy(): void {
    this.songService.backPress(true);
    this.destroy$.next();
    this.destroy$.complete();
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

gotoAddplayList(currentSong:any){
  this.songService.currentSongInPlaylistBehavuiorSub.next(currentSong);
  this.router.navigate(['/addtoPlayList']);
}

deleteSong(currentSong:any){
  const playlistName = sessionStorage.getItem('playlistName');
  console.log(playlistName);
  console.log(currentSong.songId);
}
}
