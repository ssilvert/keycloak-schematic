import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import {KeycloakService} from './app/keycloak-service/keycloak.service';

if (environment.production) {
    enableProdMode();
}

const configOptions = {
    url: '<%= url %>',
    realm: '<%= realm %>',
    clientId: '<%= clientId %>'
};

// You can also use a keycloak.json file gerated from the Keycloak admin console
//const configOptions:string = 'http://localhost:4200/assets/keycloak.json';


KeycloakService.init(configOptions, {onLoad: 'login-required'})
    .then(() => {

        platformBrowserDynamic().bootstrapModule(AppModule)
            .catch(err => console.log(err));

    })
    .catch((e: any) => {
        console.log('Error in bootstrap: ' + JSON.stringify(e));
    });