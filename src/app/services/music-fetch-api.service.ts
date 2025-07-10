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
  constructor(private http:HttpClient) { 
    // yaha nahi chahiye listners
  }

  getSong(searchQuery:string):Observable <any>{
    const url = `http://localhost:3000/api/download?search=${searchQuery}`;
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
