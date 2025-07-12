import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicFetchApiService } from 'src/app/services/music-fetch-api.service';
@Component({
  selector: 'app-main-music-player',
  templateUrl: './main-music-player.component.html',
  styleUrls: ['./main-music-player.component.css']
})
export class MainMusicPlayerComponent {
  showControl:boolean = false;
  
  showControls():void{
    this.showControl = !this.showControl;
    console.log(this.showControl);
    
  }



}
