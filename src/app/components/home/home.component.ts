import { Component , OnInit } from '@angular/core';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { Router } from '@angular/router';
import { fadeIn } from 'src/app/animations/animations';
import { NotificationService } from 'src/app/services/notification.service';
import { debounce, debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations:[fadeIn],
})
export class HomeComponent implements OnInit {
  constructor(private musicApi:MusicFetchApiService,private router:Router,private snackBar:NotificationService){}
  songName:string = '';
  songs$!:Observable<any>;
  private searchTerm = new Subject<string>();
showLoader:boolean = false;

  ngOnInit():void{
    this.songs$ = this.searchTerm.pipe(
      // wait for 300ms for slience 
      debounceTime(300),

      // dont make request if text same as last 
      distinctUntilChanged(),
      // call the api using switch map cancle previous pendding request 
      switchMap((term:string)=> this.musicApi.fecthSong(term))

    )
  }

  fetchSong(){
    if(this.songName){
      this.showLoader = true;
      this.musicApi.getSong(this.songName).subscribe({
        next:(response:any)=>{
          // this.musicApi.songUrl = response.url;
          this.musicApi.setSongData({
              thumbnail:response.thumbnail,
              artist:response.artist,
              title:response.title,
              url:response.audioUrl,
              songId:response.videoId
            });
          this.showLoader = false;
          this.router.navigate(['/musicPlayer']);
        },
        error:(err)=>{
          console.log(`errro ${err}`);
        }
      })
    }else{
      // alert("Provide song name!!!");
      this.snackBar.showError('Provide song name🎵🎵🎵');
    }

  }

  getSong(text:string){
      this.searchTerm.next(text);
  }

  playSong(song:any){
    const fomatedData = {
      thumbnail:song.thumbnail,
      artist:song.artist,
      title:song.title,
      url:song.audioUrl,
      songId:song.videoId
    }
    this.musicApi.setSongData(fomatedData);
    this.snackBar.showSuccess('✅ Song added in Queue')
    this.router.navigate(['/musicPlayer']); 
  }
}
