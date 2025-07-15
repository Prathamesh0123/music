import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-main-music-player',
  templateUrl: './main-music-player.component.html',
  styleUrls: ['./main-music-player.component.css']
})
export class MainMusicPlayerComponent {
  showControl:boolean = false;
  isSidebarOpen:boolean = false;
  screenWidth = window.innerWidth;

  constructor(private router:Router){}

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth >= 768) {
        this.isSidebarOpen = false; // reset on desktop
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showControls() {
    this.showControl = !this.showControl;
  }

  gotoSearchBar(){
    this.router.navigate(['/']);
  }


}
