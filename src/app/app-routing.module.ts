import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BigPlayerComponent } from './components/big-player/big-player.component';
import { MainMusicPlayerComponent } from './components/main-music-player/main-music-player.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: MainMusicPlayerComponent,  
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
      { path: 'home', component: HomeComponent },
      { path: 'musicPlayer', component: BigPlayerComponent }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
