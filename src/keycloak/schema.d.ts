export interface Schema {
    /**
     * The path to create keycloak-service (usually 'app').
     */
    appRoot: string;
    /**
     * The path of the source directory (usually 'src').
     */
    sourceDir: string;
    /**
     * The the url to the Keycloak auth server.
     */
    url: string;
    /**
     * The Keycloak realm for this app.
     */
    realm: string;
    /**
     * The Keycloak client id for this app.
     */
    clientId: string;
}



