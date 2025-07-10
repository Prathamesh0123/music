import { Component } from '@angular/core';

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
