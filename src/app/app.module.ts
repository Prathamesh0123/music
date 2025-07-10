import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainMusicPlayerComponent } from './components/main-music-player/main-music-player.component';
import { ArrowDownToLine, ChevronDown, ChevronUp, Heart, ListMusic, LucideAngularModule, UserRoundPen ,LogOut, Play, StepForward, StepBack, Pause, Volume1, VolumeX, House} from 'lucide-angular';
import { BigPlayerComponent } from './components/big-player/big-player.component';
import {HttpClientModule} from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    MainMusicPlayerComponent,
    BigPlayerComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
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
    }),
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
