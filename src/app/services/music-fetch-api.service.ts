import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
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
  songmetaData = {
    thumbnail:'',
    title:'',
    artist:'',
    url:'',
  }

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

    // this.songmetaData.thumbnail = this.thumbnail;
    // this.songmetaData.artist = this.artistName;
    // this.songmetaData.title = this.songTitle;

    // this.songMetaDataBehaviorSub.next(this.songmetaData);
    this.loadAuidoBehaviorSub.subscribe(val =>{
        this.isPlayingBehaviourSub.next(false);
        this.audio.src = val;
    })
  }

  getSong(searchQuery:string):Observable <any>{
    const url = `http://localhost:3000/api/download?search=${searchQuery}`;
    return this.http.get<any>(url);
  }

  setSongData(meta:{title:string,thumbnail:string,artist:string,url:string}){
    // this.songmetaData = meta;
    this.loadAuidoBehaviorSub.next(meta.url);
    this.songMetaDataBehaviorSub.next(meta);
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

}
