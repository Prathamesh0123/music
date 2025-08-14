import { Component , OnInit } from '@angular/core';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { Router } from '@angular/router';
import { fadeIn } from 'src/app/animations/animations';
import { NotificationService } from 'src/app/services/notification.service';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap , of} from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations:[fadeIn],
})
export class HomeComponent implements OnInit {
  constructor(private musicApi:MusicFetchApiService,private router:Router,private snackBar:NotificationService,private authService:AuthService){}
  songName:string = '';
  songs$!:Observable<any>;
  private searchTerm = new Subject<string>();
  showLoader:boolean = false;

  ngOnInit():void{
    this.songs$ = this.searchTerm.pipe(
      //1 wait for 300ms for slience 
      debounceTime(300),

      //2 dont make request if text same as last 
      distinctUntilChanged(),
      //3 call the api using switch map cancle previous pendding request 
      switchMap((term:string) => {
        // If the search term is empty, return an observable of an empty array.
        // This will effectively clear the suggestions list in the template.
        if (!term.trim()) {
          return of([]);
        }
        // Otherwise, proceed with the API call to fetch suggestions.
        return this.musicApi.fecthSong(term);
      })

    )
    this.authService.notifyProfileChnage();//put this in home component ngAfterdestroy 
    
  }

  fetchSong(){
    this.searchTerm.next('');
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
            },'general');
          this.showLoader = false;
          this.router.navigate(['/musicPlayer']);
        },
        error:(err)=>{
            console.log('Error status:', err.status);
            console.log('Error message:', err.error?.message || err.message);
            console.log('Error details:', err.error?.details || err.error);
        }
      })
    }else{
      // alert("Provide song name!!!");
      this.snackBar.showError('Provide song name🎵🎵🎵');
    }

  }

  //run on every search binded with (input)
  //and used tamplate refrence variable to
  //extract value pass tamplateVarName.value as parameter
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
    this.musicApi.setSongData(fomatedData,'general');
    this.snackBar.showSuccess('✅ Song added in Queue');
    this.router.navigate(['/musicPlayer']); 
  }
}
