import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
    HttpErrorResponse,
    HttpInterceptor,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { KeycloakService } from './keycloak.service';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/map';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {

    constructor(private _keycloakService: KeycloakService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this._keycloakService.authenticated()) { return next.handle(request); }

        const tokenPromise: Promise<string> = this._keycloakService.getToken();
        const tokenObservable: Observable<string> = Observable.fromPromise(tokenPromise);

        return tokenObservable.map((token) => {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return request;
        }).concatMap((newRequest) => {
            return next.handle(newRequest);
        });

    }
}

export const KEYCLOAK_HTTP_INTERCEPTOR = {
    provide: HTTP_INTERCEPTORS,
    useClass: KeycloakInterceptor,
    multi: true
};