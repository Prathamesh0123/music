import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { MusicData } from '../models/music-data';
@Injectable({
  providedIn: 'root'
})
export class MusicFetchApiService {

  durationBehaviourSub = new BehaviorSubject<number>(0);
  currentTimeBehaviorSub = new BehaviorSubject<number>(0);
  volumeSetBehaviorSub = new BehaviorSubject<number>(0);

  isPlayingBehaviourSub = new BehaviorSubject<boolean>(false);
  isBackPrssed = new BehaviorSubject<boolean>(false);

  loadAuidoBehaviorSub = new BehaviorSubject<string>('');

  currentIndexBehaviorSub = new BehaviorSubject<number>(0);

  songmetaData = {
    thumbnail:'',
    title:'',
    artist:'',
    url:'',
  }

  musicData :MusicData[] = [];
  
  songMetaDataBehaviorSub = new BehaviorSubject<any>(0);

  songUrl!:string;
  artistName!:string;
  songTitle!:string;
  thumbnail!:string;

  audio:HTMLAudioElement  = new Audio();
  // currentTime!:number;
  // duration!:number;
  constructor(private http:HttpClient) { 
    this.audio.addEventListener('loadedmetadata',()=>{
      // this.duration = this.audio.duration;
      this.durationBehaviourSub.next(this.audio.duration);

    })

    this.audio.addEventListener('timeupdate',()=>{
      // this.currentTime = this.audio.currentTime;
      this.currentTimeBehaviorSub.next(this.audio.currentTime);
    })

    
    //takin initial volume from the component
    this.volumeSetBehaviorSub.next(this.audio.volume);


    // this.songMetaDataBehaviorSub.next(this.songmetaData);
    // this.loadAuidoBehaviorSub.subscribe(val =>{
    //     this.isPlayingBehaviourSub.next(false);
    //     //mybe i add method here that decide which song to load from the array 
    //     this.audio.src = val;
    //     this.playSong();
    // })
    //inital hiting play when song come's in queue

      this.currentIndexBehaviorSub
        .pipe(
          filter(index => !!this.musicData[index])
        )
        .subscribe(index => {
          const song = this.musicData[index];
          this.audio.src = song.url;
          this.audio.load();
          this.audio.play();
          this.isPlayingBehaviourSub.next(true);
        });

  }

  playSongFromQueue(index:number){
    const selectedSong = this.musicData[index];
    this.audio.src = selectedSong.url;
    this.audio.load();
    this.audio.play();
    this.isPlayingBehaviourSub.next(true);
    this.currentIndexBehaviorSub.next(index);
  }

  getSong(searchQuery:string):Observable <any>{
    const url = `https://scroll-governor-wifi-this.trycloudflare.com/api/download?search=${searchQuery}`;
    return this.http.get<any>(url);
  }

  setSongData(meta:{title:string,thumbnail:string,artist:string,url:string}){
    // this.songmetaData = meta;
    this.musicData.push(meta);
    if(this.musicData.length == 1){
      this.currentIndexBehaviorSub.next(0);
    }
  }

  setSongUrl(url:string){
    this.songUrl = url;
  }

  playSong() {
    // if (this.audio.src !== url) {
    //   this.audio.src = url;
    //   this.audio.load();
    // }
    this.audio.play();
    this.isPlayingBehaviourSub.next(true);
  }

  pauseSong(){
    this.audio.pause();
    this.isPlayingBehaviourSub.next(false);
  }

  getSongDuration():Observable<number>{
    return this.durationBehaviourSub.asObservable();
  }

  getSongCurrentTime():Observable<number>{
    return this.currentTimeBehaviorSub.asObservable();
  }


  getSongMetadata():Observable<any>{
    return this.songMetaDataBehaviorSub.asObservable(); 
  }

  setVolume(newVolume:number){
    this.audio.volume = newVolume;
    this.volumeSetBehaviorSub.next(this.audio.volume);
  }
  //on every route changes we update our behavour sub
  emitCurrentVolume() {
    this.volumeSetBehaviorSub.next(this.audio.volume);
  }
  //emit back chnaged audio
  getVolume():Observable<number>{
    return this.volumeSetBehaviorSub.asObservable();
  }

  setSeekTime(seekTime:number):number{
   return this.audio.currentTime = seekTime
  }
  getSongUrl(){
    return this.songUrl;
  }

  backPress(val:boolean){
    this.isBackPrssed.next(val);
  }


  getSongArray(){
    return this.musicData;
  }

}
