import { HttpInterceptor , HttpRequest , HttpHandler , HttpEvent ,HttpResponse ,HttpErrorResponse} from '@angular/common/http'
import { Observable , tap , catchError ,  throwError } from 'rxjs'
export class AuthIntercepter implements HttpInterceptor{

    intercept(req : HttpRequest<any>,next : HttpHandler):Observable<HttpEvent<any>>{

        const authToken = localStorage.getItem('token');
        //we have to clone the upcoming response coz the httpReq is unmutable we can't directly chnage  
        //so we use clone() method to add extra thing in paramter it can be token it can be body or prameter
        //anythin... but Note and important point if any request have paramter and u update that same parameter 
        //that old one get overwrite by new one always keep in mind...
        const modiFiedReq = req.clone({
            headers : req.headers.set('Authorization',`Bearer ${authToken}`)
        });

        console.log('adding headers',req.headers);
        console.log('added headers ',modiFiedReq);
        return next.handle(modiFiedReq).pipe(
            tap(event =>{
                if(event instanceof HttpResponse){
                    console.log('Request succsesd!!!',event.url);
                }
            }),
            catchError(err =>{
                //those error are handled globally for any 
                //request coz in appliaction any req made from 
                //front end will go from this interceptor as well 
                //response too...
                if(err instanceof HttpErrorResponse){
                    if(err.status == 400){
                        console.log(err.message);
                    }
                    if(err.status == 401){
                        console.log(err.message);
                    }
                    if(err.status == 500){
                        console.log(err);
                    }
                }
                return throwError(() => err);
            }),
        );
    }
}