import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainMusicPlayerComponent } from './components/main-music-player/main-music-player.component';
import { ArrowDownToLine, ChevronDown, ChevronUp ,ChevronLeft, Heart, ListMusic, LucideAngularModule, UserRoundPen ,LogOut, Play, StepForward, StepBack, Pause, Volume1, VolumeX, House, Menu, Search, Pencil, Save, BadgePlus, CircleSmall, EllipsisVertical} from 'lucide-angular';
import { BigPlayerComponent } from './components/big-player/big-player.component';
import {HttpClientModule , HTTP_INTERCEPTORS} from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopUpPlayerComponent } from './components/pop-up-player/pop-up-player.component';
import { SingUpComponent } from './components/form/sing-up/sing-up.component';
import { LoginComponent } from './components/form/login/login.component';
import { ProfilePictureComponent } from './components/form/profile-picture/profile-picture.component';
import { ProfileComponent } from './components/profile/profile.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AddToPlayListComponent } from './components/add-to-play-list/add-to-play-list.component';
import { PlaylistComponent } from './components/playlist/playlist.component'
import {MatProgressBarModule } from '@angular/material/progress-bar'
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { AuthIntercepter } from './Interceptor/auth.interceptor';


@NgModule({
  declarations: [
    AppComponent,
    MainMusicPlayerComponent,
    BigPlayerComponent,
    HomeComponent,
    PopUpPlayerComponent,
    SingUpComponent,
    LoginComponent,
    ProfilePictureComponent,
    ProfileComponent,
    AddToPlayListComponent,
    PlaylistComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LucideAngularModule.pick({
      ChevronDown,
      ChevronUp,
      Heart,
      ListMusic,
      ArrowDownToLine,
      UserRoundPen,
      LogOut,
      Play,
      StepForward,
      StepBack,
      Pause,
      Volume1,
      VolumeX,
      House,
      ChevronLeft,
      Menu,
      Search,
      Pencil,
      Save,
      BadgePlus,
      CircleSmall,
      EllipsisVertical,
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule ,
    MatSnackBarModule,

  ],
  
  providers: [{
    provide:HTTP_INTERCEPTORS,
    useClass:AuthIntercepter,
    multi:true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
