import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BigPlayerComponent } from './components/big-player/big-player.component';
import { MainMusicPlayerComponent } from './components/main-music-player/main-music-player.component';
import { HomeComponent } from './components/home/home.component';
import { SingUpComponent } from './components/form/sing-up/sing-up.component';
import { LoginComponent } from './components/form/login/login.component';

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
      { path: 'home', component: HomeComponent },
      { path: 'musicPlayer', component: BigPlayerComponent }
    ]
  },
  {
    path:'signup',
    component:SingUpComponent
  }
  // Optional: wildcard for 404
  // { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
