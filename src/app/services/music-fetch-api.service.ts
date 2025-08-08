    import { Injectable } from '@angular/core';
    import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

      //which song is to play behavior
      currentIndexBehaviorSub = new BehaviorSubject<number>(0);
      private currentPlaylistBehaviorSub = new BehaviorSubject<string | null>(null);
      playlistNameObs$ = this.currentPlaylistBehaviorSub.asObservable();//for public use to listen
      //this observable disides which song mode is giong
      //either playlist or general based on that on refresh i fecth
      //that data and stored in my musicData dynamically 
      curretSourceBehavoirSub = new BehaviorSubject<'general'|'playlist'>('general');
      songId:string[] = [];
      musicData :MusicData[] = [];
      generalQueueMusicData:MusicData[] = [];
      playlistQueueMusicData:MusicData[] = [];
      musicDataBehaviorSub = new BehaviorSubject<MusicData[]>([]);

      songMetaDataBehaviorSub = new BehaviorSubject<any>(0);

      audio:HTMLAudioElement  = new Audio();
      currentSongInPlaylistBehavuiorSub = new BehaviorSubject<any>('');
      constructor(private http:HttpClient,private router:Router) { 
        this.audio.volume = 0.5;
        this.loadSongsOnRefresh();
        sessionStorage.setItem('songSource','general');
        this.audio.addEventListener('loadedmetadata',()=>{
          // this.duration = this.audio.duration;
          this.durationBehaviourSub.next(this.audio.duration);

        });

        this.audio.addEventListener('timeupdate',()=>{
          // this.currentTime = this.audio.currentTime;
          this.currentTimeBehaviorSub.next(this.audio.currentTime);
        });

        this.audio.addEventListener('ended',()=>{
          this.playNextSong();
        });
        

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
          this.http.post<any>('https://music-azp3.onrender.com/api/song/getGeneralSong', { ids: savedIds }).subscribe({
            next: (data) => {
              const fetchedSongs = data.map((song: any) => ({
                title: song.title,
                thumbnail: song.thumbnail,
                artist: song.artist,
                url: song.audioUrl,
                songId: song.videoId,
              }));
              
              this.generalQueueMusicData = fetchedSongs;
              this.currentPlaylistBehaviorSub.next(null);
              this.musicData = this.generalQueueMusicData;
              this.musicDataBehaviorSub.next(this.musicData);
              this.currentIndexBehaviorSub.next(0);//play from satrt only on initial
              
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
        this.currentPlaylistBehaviorSub.next(playListName);
        console.log(playListName);
        const headers = new HttpHeaders({
          Authorization:`Bearer ${token}`
        });
        console.log('api stared');
        this.http.post(`https://music-azp3.onrender.com/api/song/getSinglePlayList`,{playListName},{headers}).subscribe({
          next: (res:any) => {
              this.musicData = res.data;

              this.musicDataBehaviorSub.next(this.musicData);
              this.currentIndexBehaviorSub.next(0);    
              this.curretSourceBehavoirSub.next('playlist');        
            },
            error:(err)=>{
              console.log(err.message);
            }
        });
      }
    }
    

    playFromPlayList(playListToPlay?:any){
      // Populate the dedicated playlist queue
      const playListName = sessionStorage.getItem('playlistName');
      this.playlistQueueMusicData = playListToPlay;
      this.currentPlaylistBehaviorSub.next(playListName);
      // Set the active queue to be the playlist queue
      this.musicData = this.playlistQueueMusicData;
      this.musicDataBehaviorSub.next(this.musicData);
      this.currentIndexBehaviorSub.next(0);
        // Set the mode to 'playlist' for session tracking
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
      return this.http.post(`https://music-azp3.onrender.com/api/song/addToPlaylist`,{playListName,newSong},{headers});
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

      return this.http.get(`https://music-azp3.onrender.com/api/song/getPlayListData`,{headers});
    }
      // those parameters mater lot litrally lot 
      //specially url and songId when i get Data from current song
      //that add to be in playlist the User model inside backend have 
      //diffrent fileds so that not adding coz of that so i have to match this
      //parameters inside User model--Songs[] array the url and songId
      setSongData(meta:{title:string,thumbnail:string,artist:string,url:string,songId:string},source:'general' | 'playlist'){
        // this.songmetaData = meta;
        if(this.curretSourceBehavoirSub.value != source){
          this.generalQueueMusicData = [];
          this.songId = [];
          this.currentPlaylistBehaviorSub.next(null);
          this.musicData = this.generalQueueMusicData;
          this.curretSourceBehavoirSub.next('general');
          sessionStorage.setItem('songSource', 'general');
        }
        const isDuplicate = this.musicData.some(song => song.url == meta.url);
        if(!isDuplicate){
          this.musicData.push(meta);
          this.songId.push(meta.songId);//adding general song id's in the songId to fetch that song on refresh!!!
          this.musicDataBehaviorSub.next(this.musicData);
          sessionStorage.setItem('songIds', JSON.stringify(this.songId)); 
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

      deleteSongFromPlaylist(playListName:string,songId:string){
        const token = localStorage.getItem('token');
        if(!token){
          console.log('Invalid token!!!');
          return;
        }

        const headers = new HttpHeaders({
          Authorization:`Bearer ${token}`
        });

        return this.http.post(`https://music-azp3.onrender.com/api/song/delteFromPlaylist`,{playListName,songId},{headers});

      }

      fecthSong(term:string):Observable<any>{
        const params  = new  HttpParams().set('name',term);
        return this.http.get(`https://music-azp3.onrender.com/api/song/search`,{ params });
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

      logOut() {
        // --- STEP 1: Immediately stop all audio activity ---
        this.audio.pause();
        this.audio.src = '';
        this.audio.load(); // Important to reset the audio element

        // --- STEP 2: Destroy the data arrays. This is the most important fix. ---
        // Now, any reactive code that checks this array will find it empty.
        this.musicData = [];
        this.songId = [];
        this.generalQueueMusicData = [];
        this.playlistQueueMusicData = [];

        // --- STEP 3: Reset all state-holding BehaviorSubjects ---
        // When currentIndexBehaviorSub.next(0) runs now, the filter in the
        // constructor will fail because this.musicData[0] is undefined.
        this.musicDataBehaviorSub.next([]);
        this.isPlayingBehaviourSub.next(false);
        this.durationBehaviourSub.next(0);
        this.currentTimeBehaviorSub.next(0);
        this.currentIndexBehaviorSub.next(0); // This is now safe to call
        this.volumeSetBehaviorSub.next(this.audio.volume); // or 0 if you prefer
        this.songMetaDataBehaviorSub.next(null);
        this.currentPlaylistBehaviorSub.next(null);
        this.curretSourceBehavoirSub.next('general');
        this.currentSongInPlaylistBehavuiorSub.next('');

        // --- STEP 4: Clear browser storage ---
        localStorage.clear();
        sessionStorage.clear();

        // --- STEP 5: Navigate away ---
        this.router.navigate(['']); // Or your login route
      }

    }
