import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {KeycloakService} from './keycloak.service';

@Injectable()
export class KeycloakGuard implements CanActivate {
    constructor(private keycloakService: KeycloakService) {}
    
    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): boolean {
        if (this.keycloakService.authenticated()) {
            return true;
        }
        
        this.keycloakService.login({redirectUri: state.url});
        return false;
    }
}
