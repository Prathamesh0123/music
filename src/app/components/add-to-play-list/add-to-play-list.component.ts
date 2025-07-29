import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
import { fadeIn } from 'src/app/animations/animations';
import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-add-to-play-list',
  templateUrl: './add-to-play-list.component.html',
  styleUrls: ['./add-to-play-list.component.css'],
  animations:[fadeIn]
})
export class AddToPlayListComponent implements OnInit,OnDestroy{
  addToPlaylist:boolean = false;
  playListName:string = '';
  songData:any[] = [];
  constructor(private songService:MusicFetchApiService,private router:Router,private snackBar:NotificationService){}
  currentSong:any;
  ngOnInit(): void {
      //remove pop up
      this.songService.getSongFromPlaylist()?.subscribe((data:any)=>{
        this.songData = data.data;
        console.log(this.songData);
      });
      this.songService.currentSongInPlaylistBehavuiorSub.asObservable().subscribe((data)=>{
        this.currentSong = data;
        console.log(this.currentSong);
      });
      this.songService.backPress(false);

  }

  ngOnDestroy(): void {
    //show pop up
      this.songService.backPress(true);
  }

  setPlaylist(){
    console.log('button clicked');
    this.addToPlaylist = true;
  }

  cancel(){
    this.addToPlaylist = false;
  }

goBacktoPlayer(){
  this.router.navigate(['/musicPlayer']);
}

//add songs to existing playlist
addToExistingPlayList(currentPlayListData:any){
  const playListTitle = currentPlayListData.title;
  this.playListName = playListTitle;
  this.addNewPlayList();
}

addNewPlayList(){
  console.log(this.playListName);
  if(this.playListName){
    this.songService.addSongToPlayList(this.playListName,this.currentSong)?.subscribe({
      next:(res:any)=>{
        console.log(res.message);
        this.snackBar.showSuccess('song added in Playlist ✅');
        this.goBacktoPlayer();
      },
      error:(err)=>{
        this.snackBar.showError('Song already in the playlist ⚠️')
        console.log('error',err.message);
      }
    });
  }else{
    this.snackBar.showError('Provide name for playlist ⚠️');
  }
  this.playListName = '';
}
  
}
