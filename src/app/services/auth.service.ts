import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private profilePhotoChang = new BehaviorSubject<boolean>(false);
  profileChanged$ = this.profilePhotoChang.asObservable();


  checkSession(token:string){

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`http://localhost:3000/api/auth/checkSession`,{},{headers});
  }

  notifyProfileChnage(){
    this.profilePhotoChang.next(true);
  }

  signUpUser(data:any):Observable<any>{
    return this.http.post('http://localhost:3000/api/auth/register',data);
  }

  logInUser(data:{email:string,password:string}){
    return this.http.post('http://localhost:3000/api/auth/login',data);
  }


  // for now just 
  getUserData(){
    const token = localStorage.getItem('token');
      if(!token){
        console.log('No token found...');
        return;
      }
      const headers = new  HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      return this.http.get('http://localhost:3000/api/auth/userData',{headers});
  }

  updateName(name:string){
    const token = localStorage.getItem('token');
      if(!token){
        console.log('no token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization:`Bearer ${token}`
      });
      return this.http.put(`http://localhost:3000/api/auth/updatename`,{name},{headers});
  }

  updateEmail(email:string){
    const token = localStorage.getItem('token');
    if(!token){
      console.log('token missing');
      return;
    }
    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
    return this.http.put(`http://localhost:3000/api/auth/updatemail`,{email},{headers});
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
