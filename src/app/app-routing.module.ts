import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BigPlayerComponent } from './components/big-player/big-player.component';
import { MainMusicPlayerComponent } from './components/main-music-player/main-music-player.component';
import { HomeComponent } from './components/home/home.component';
import { SingUpComponent } from './components/form/sing-up/sing-up.component';
import { LoginComponent } from './components/form/login/login.component';
import { ProfilePictureComponent } from './components/form/profile-picture/profile-picture.component';
import { authGuard } from './auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { AddToPlayListComponent } from './components/add-to-play-list/add-to-play-list.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
const routes: Routes = [
  {
    path: '',
    component: LoginComponent, // default route is sign up 
    pathMatch:'full'
  },
  {
    path: '',
    component: MainMusicPlayerComponent,
    children: [
      { path: 'home', component: HomeComponent ,canActivate:[authGuard]},
      { path: 'musicPlayer', component: BigPlayerComponent ,canActivate:[authGuard]},
      { path: 'profile', component:ProfileComponent,canActivate:[authGuard]},
      { path: 'addtoPlayList',component:AddToPlayListComponent,canActivate:[authGuard]},
      { path: 'playList',component:PlaylistComponent,canActivate:[authGuard]}
    ]
  },
  {
    path:'signup',
    component:SingUpComponent
  },
  {
    path:'profilePhoto',
    component:ProfilePictureComponent,
    canActivate:[authGuard]
  }  
// Optional: wildcard for 404
  // { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
