import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar:MatSnackBar) { }


  showSuccess(message:string){
    this.snackBar.open(message,'Ok',{
      horizontalPosition: 'right',
      panelClass:['bg-green-500','text-white','rounded-lg'],
      verticalPosition: 'top',
      duration:3000
    })
  }

  showError(message:string){
    this.snackBar.open(message,'Close',{
      horizontalPosition:'right',
      verticalPosition:'top',
      duration:3000,
      panelClass:['bg-red-500','text-white','rounded-lg']
    })
  }

}
