import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from 'lucide-angular';
import { from, Observable } from 'rxjs';
const supabaseUrl = 'https://xhezcmpbrypussaxqsht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZXpjbXBicnlwdXNzYXhxc2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAwNzM2MiwiZXhwIjoyMDY4NTgzMzYyfQ._j15hwzgo3Xispr_JnuDe26lxm_9F1E2J0H3DTw_Qmw'
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!:SupabaseClient

  constructor(private http:HttpClient) {
    this.supabase = createClient(supabaseUrl,supabaseKey);  
   }

    uploadImage(file: File, path: string): Observable<any> {
      const userImage = this.supabase.storage.from('user-profile-images').upload(path, file,{
        cacheControl:'0',
        upsert:true
      });
      return from(userImage);
    }

   setImageUrl(path:string){
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    const imageUrl =  this.supabase.storage.from('user-profile-images').getPublicUrl(path).data.publicUrl;
    this.http.post('http://localhost:3000/api/auth/uploadImage',{imageUrl},{headers}).subscribe({
      next:(res:any) =>{
        console.log(res.message);
      },
      error:(err)=>{
        console.log('err',err.message);
        
      }
    })
   }

  deleteImage(path: string) {
    return this.supabase.storage.from('user-profile-images').remove([path]);
  }

}
