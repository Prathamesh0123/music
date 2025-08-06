import { Injectable } from '@angular/core';
import { HttpClient ,HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable ,shareReplay,Subject,tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }
  private userData$ : Observable<any> | null = null;
  // This is for notifying other components (like your sidebar) of changes.
  private profileChangedSubject = new Subject<void>();
  public profileChanged$ = this.profileChangedSubject.asObservable();


  checkSession(token:string){


    return this.http.post(`http://localhost:3000/api/auth/checkSession`,{});
  }

  notifyProfileChnage(){
    this.userData$ = null;
    this.profileChangedSubject.next();
  }

  signUpUser(data:any):Observable<any>{
    return this.http.post('http://localhost:3000/api/auth/register',data);
  }

  logInUser(data:{email:string,password:string}){
    return this.http.post('http://localhost:3000/api/auth/login',data);
  }


  // for now just 
  getUserData(){
    // don't need to this this will handled by interceptor 
    // const token = localStorage.getItem('token');
    //   if(!token){
    //     console.log('No token found...');
    //     return;
    //   }
    //   const headers = new  HttpHeaders({
    //     Authorization: `Bearer ${token}`
    //   });
    //crurial part skiping api call if data alredy have 
    if(!this.userData$){
      this.userData$ =  this.http.get('http://localhost:3000/api/auth/userData').pipe(
        tap(event =>{
          if(event instanceof HttpResponse){
            console.log('request made success ')
          }
        }),
        shareReplay(1)
      );
    }
      return this.userData$;
  }

  updateName(name:string){

      return this.http.put(`http://localhost:3000/api/auth/updatename`,{name});
  }

  updateEmail(email:string){

    return this.http.put(`http://localhost:3000/api/auth/updatemail`,{email});
  }

  getUid(){
    const token = localStorage.getItem('token');
    if(!token) return null;

    try{
      const payload = JSON.parse(atob(token.split('.')[1])); //decode JWT payload
      return payload.id;
    }catch(err){
      console.log('Invalid Token ',err);
      return null;
    }
  }


}
