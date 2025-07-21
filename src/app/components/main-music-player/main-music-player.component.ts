import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-main-music-player',
  templateUrl: './main-music-player.component.html',
  styleUrls: ['./main-music-player.component.css']
})
export class MainMusicPlayerComponent implements OnInit{
  showControl:boolean = false;
  isSidebarOpen:boolean = false;
  screenWidth = window.innerWidth;
  userData:any;
  constructor(private router:Router,private authService:AuthService){}

  ngOnInit() {
    this.authService.getUserData().subscribe({
      next: (res: any) => {
        console.log(res.message);
        console.log(res.data.userProfileUrl);
        
        this.userData = res.data;
        console.log('Fetched user:', this.userData);
      },
      error: (err) => {
      console.error('Error fetching user:', err);
      alert('ERROR: ' + JSON.stringify(err));
    }

    });
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
    this.router.navigate(['/home']);
  }

  goToProfle(){
    this.router.navigate(['/profile']);
  }

}
