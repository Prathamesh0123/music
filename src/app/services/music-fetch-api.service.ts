  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { filter, Observable, of } from 'rxjs';
  import { BehaviorSubject } from 'rxjs';
  import { MusicData } from '../models/music-data';
  import { Router } from '@angular/router';
  @Injectable({
    providedIn: 'root'
  })
  export class MusicFetchApiService {
    //seek bar behaviour
    durationBehaviourSub = new BehaviorSubject<number>(0);
    currentTimeBehaviorSub = new BehaviorSubject<number>(0);
    volumeSetBehaviorSub = new BehaviorSubject<number>(0);

    //buttons behavior 
    isPlayingBehaviourSub = new BehaviorSubject<boolean>(false);
    isBackPrssed = new BehaviorSubject<boolean>(true);
    loadAuidoBehaviorSub = new BehaviorSubject<string>('');

    //which song is to play behavior
    currentIndexBehaviorSub = new BehaviorSubject<number>(0);

    // songmetaData = {
    //   thumbnail:'',
    //   title:'',
    //   artist:'',
    //   url:'',
    // }
    //this observable disides which song mode is giong
    //either playlist or general based on that on refresh i fecth
    //that data and stored in my musicData dynamically 
    curretSourceBehavoirSub = new BehaviorSubject<'general'|'playlist'>('general');
    songId:string[] = [];

    musicData :MusicData[] = [];
    musicDataBehaviorSub = new BehaviorSubject<MusicData[]>([]);

    songMetaDataBehaviorSub = new BehaviorSubject<any>(0);

    audio:HTMLAudioElement  = new Audio();
    currentSongInPlaylistBehavuiorSub = new BehaviorSubject<any>('');
    constructor(private http:HttpClient,private router:Router) { 
      this.loadSongsOnRefresh();
      this.audio.addEventListener('loadedmetadata',()=>{
        // this.duration = this.audio.duration;
        this.durationBehaviourSub.next(this.audio.duration);

      })

      this.audio.addEventListener('timeupdate',()=>{
        // this.currentTime = this.audio.currentTime;
        this.currentTimeBehaviorSub.next(this.audio.currentTime);
      })

      this.audio.addEventListener('ended',()=>{
        this.playNextSong();
      })
      

      this.currentIndexBehaviorSub
        .pipe(
          filter(index => !!this.musicData[index])
        )
        .subscribe(index => {
          const song = this.musicData[index];
          this.audio.src = song.url;
          this.audio.load();
          this.audio.play();
          this.isPlayingBehaviourSub.next(true);
      });

    }

    playNextSong(){
      const currentIndex = this.currentIndexBehaviorSub.value;
      const nextIndex = currentIndex + 1;

      if(nextIndex < this.musicData.length){
        this.currentIndexBehaviorSub.next(nextIndex);//auto play next song
      }else{
        this.isPlayingBehaviourSub.next(false);//end of queue
      }

    }

    playSongFromQueue(index:number){
      const selectedSong = this.musicData[index];
      this.audio.src = selectedSong.url;
      this.audio.load();
      this.audio.play();
      this.isPlayingBehaviourSub.next(true);
      this.currentIndexBehaviorSub.next(index);
    }

    getSong(searchQuery:string):Observable <any>{
      const url = `http://localhost:3000/api/song/upload?search=${searchQuery}`;
      return this.http.post<any>(url,{});
    }

    loadSongsOnRefresh() {
    const source = sessionStorage.getItem('songSource');
    if (source === 'general') {
      const savedIds = JSON.parse(sessionStorage.getItem('songIds') || '[]');

      if (Array.isArray(savedIds) && savedIds.length > 0) {
        this.http.post<any>('http://localhost:3000/api/song/getGeneralSong', { ids: savedIds }).subscribe({
          next: (data) => {
            this.musicData = data.map((song: any) => ({
              title: song.title,
              thumbnail: song.thumbnail,
              artist: song.artist,
              url: song.audioUrl,
              songId: song.videoId,
            }));

            this.musicDataBehaviorSub.next(this.musicData);
            this.currentIndexBehaviorSub.next(0);
            
            this.songId = savedIds;
          },
          error: () => {
            console.log('Error fetching general songs on refresh');
          }
        });
      }
    }
    if(source == 'playlist'){
      const token = localStorage.getItem('token');
      const playListName = sessionStorage.getItem('playlistName');
      console.log(playListName);
      const headers = new HttpHeaders({
        Authorization:`Bearer ${token}`
      });
      console.log('api stared');
      this.http.post(`http://localhost:3000/api/song/getSinglePlayList`,{playListName},{headers}).subscribe({
         next: (res:any) => {
            this.musicData = res.data;

            this.musicDataBehaviorSub.next(this.musicData);
            this.currentIndexBehaviorSub.next(0);            
          },
          error:(err)=>{
            console.log(err.message);
          }
      });
    }
  }

  playFromPlayList(playListToPlay?:any){
    this.musicData = playListToPlay;
    console.log(playListToPlay.title);
    this.musicDataBehaviorSub.next(this.musicData);
    this.currentIndexBehaviorSub.next(0);
    this.curretSourceBehavoirSub.next('playlist');
    sessionStorage.setItem('songSource',this.curretSourceBehavoirSub.value.toString());  
    // console.log(this.musicData);
  }

  addSongToPlayList(playListName:string,newSong:any){
    const token = localStorage.getItem('token');
    if(!token){
      console.log('Invalid user!!');
      return; 
    }
    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
    return this.http.post(`http://localhost:3000/api/song/addToPlaylist`,{playListName,newSong},{headers});
  }

  getSongFromPlaylist(){
    const token = localStorage.getItem('token');
    if(!token){
      console.log('Invalid user!!');
      return; 
    }
    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

    return this.http.get(`http://localhost:3000/api/song/getPlayListData`,{headers});
  }
    // those parameters mater lot litrally lot 
    //specially url and songId when i get Data from current song
    //that add to be in playlist the User model inside backend have 
    //diffrent fileds so that not adding coz of that so i have to match this
    //parameters inside User model--Songs[] array the url and songId
    setSongData(meta:{title:string,thumbnail:string,artist:string,url:string,songId:string}){
      // this.songmetaData = meta;
      const isDuplicate = this.musicData.some(song => song.url == meta.url);
      if(!isDuplicate){
        this.musicData.push(meta);
        this.musicDataBehaviorSub.next(this.musicData);
        this.songId.push(meta.songId);//adding general song id's in the songId to fetch that song on refresh!!!
        sessionStorage.setItem('songIds', JSON.stringify(this.songId)); 
        this.curretSourceBehavoirSub.next('general');//chnage behaviour to general 
        sessionStorage.setItem('songSource',this.curretSourceBehavoirSub.value.toString());//store current state in session storage    
        if(this.musicData.length == 1){
          this.currentIndexBehaviorSub.next(0);//play song when new playlist add from start
        }
      }else{
        const existingIndex = this.musicData.findIndex(song => song.url == meta.url);
        if(existingIndex != -1){
          this.router.navigate(['/musicPlayer']);
          this.currentIndexBehaviorSub.next(existingIndex);//auto play
          console.log('song Alredy in Queue');
        }
      }
    }
    

    playSong() {

      this.audio.play();
      this.isPlayingBehaviourSub.next(true);
    }

    pauseSong(){
      this.audio.pause();
      this.isPlayingBehaviourSub.next(false);
    }

    getSongDuration():Observable<number>{
      return this.durationBehaviourSub.asObservable();
    }

    getSongCurrentTime():Observable<number>{
      return this.currentTimeBehaviorSub.asObservable();
    }


    getSongMetadata():Observable<any>{
      return this.songMetaDataBehaviorSub.asObservable(); 
    }

    setVolume(newVolume:number){
      this.audio.volume = newVolume;
      this.volumeSetBehaviorSub.next(this.audio.volume);
    }
    //on every route changes we update our behavour sub
    emitCurrentVolume() {
      this.volumeSetBehaviorSub.next(this.audio.volume);
    }
    //emit back chnaged audio
    getVolume():Observable<number>{
      return this.volumeSetBehaviorSub.asObservable();
    }

    setSeekTime(seekTime:number):number{
    return this.audio.currentTime = seekTime
    }

    backPress(val:boolean){
      this.isBackPrssed.next(val);
    }


    getSongArray(){
      return this.musicData;
    }

  }
