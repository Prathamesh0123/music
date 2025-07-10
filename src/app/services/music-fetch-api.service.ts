import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicFetchApiService {
  songUrl!:string;
  artistName!:string;
  songTitle!:string;
  thumbnail!:string;

  audio:HTMLAudioElement  = new Audio();
  currentTime!:number;
  duration!:number;
  constructor(private http:HttpClient) { 
    this.audio.addEventListener('loadedmetadata',()=>{
      this.duration = this.audio.duration;
    })

    this.audio.addEventListener('timeupdate',()=>{
      this.currentTime = this.audio.currentTime;
    })
  }

  getSong(searchQuery:string):Observable <any>{
    const url = `https://match-swim-requires-split.trycloudflare.com/api/download?search=${searchQuery}`;
    return this.http.get<any>(url);
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

  getSongDuration():number{
    return this.duration;
  }

  getSongCurrentTime():number{
    return this.currentTime;
  }


  getSongMetadata(){
    const songData = {
      thumbnail:this.thumbnail,
      title:this.songTitle,
      artist:this.artistName 
    }
    return songData;
  }

  setSeekTime(seekTime:number):number{
   return this.audio.currentTime = seekTime
  }
  getSongUrl(){
    return this.songUrl;
  }

}
