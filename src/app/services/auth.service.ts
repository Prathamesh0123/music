import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }


  signUpUser(data:any):Observable<any>{
    return this.http.post('http://localhost:3000/api/auth/register',data);
  }

  logInUser(data:{email:string,password:string}){
    return this.http.post('http://localhost:3000/api/auth/login',data);
  }


  // for now just 
  getUserData(){
    const token = localStorage.getItem('token');
    const headers = new  HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get('http://localhost:3000/api/auth/userData',{headers});
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
