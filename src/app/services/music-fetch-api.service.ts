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

  songmetaData = {
    thumbnail:'',
    title:'',
    artist:''
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
    this.songmetaData.thumbnail = this.thumbnail;
    this.songmetaData.artist = this.artistName;
    this.songmetaData.title = this.songTitle;

    this.songMetaDataBehaviorSub.next(this.songmetaData);
  }

  getSong(searchQuery:string):Observable <any>{
    const url = `http://localhost:3000/api/download?search=${searchQuery}`;
    return this.http.get<any>(url);
  }

  setSongData(meta:{title:string,thumbnail:string,artist:string}){
    this.songmetaData = meta;
    this.songMetaDataBehaviorSub.next(this.songmetaData);
  }

  setSongUrl(url:string){
    this.songUrl = url;
  }

  playSong(url: string) {
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }
    this.audio.play();
  }

  pauseSong(){
    this.audio.pause();
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

  setSeekTime(seekTime:number):number{
   return this.audio.currentTime = seekTime
  }
  getSongUrl(){
    return this.songUrl;
  }

}
