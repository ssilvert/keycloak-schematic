import { Path, normalize } from '@angular-devkit/core';
import {
    MergeStrategy,
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    apply,
    chain,
    mergeWith,
    template,
    schematic,
    url,
} from '@angular-devkit/schematics';
import {Schema as KeycloakOptions} from './schema';

function servicePath(options: KeycloakOptions): Path {
    return normalize('/' + options.appRoot + '/keycloak-service');
}

export function keycloakSchematic(options: KeycloakOptions): Rule {

    if (!options.clientId) {
        throw new SchematicsException(`clientId option is required.`);
    }

    const mainFromPath: string = normalize('/' + options.sourceDir + '/main.ts');
    const mainToPath: string = normalize('/' + options.sourceDir + '/main.ts.no-keycloak');
    
    const serviceOps = {
        name: 'keycloak',
        path: servicePath(options),
        module: 'app.module', // where to find @NgModule (i.e. app.module.ts)
        appRoot: options.appRoot,
        spec: false
    };
    
    return chain([
        
        (_tree: Tree, context: SchematicContext) => {
            // Show the options for this Schematics.
            context.logger.info('Keycloak Schematic: ' + JSON.stringify(options));
        },
        
        // Move the developer's main.ts to a backup file.
        // Have to do it using read/create/delete because tree.move() does a 
        // 'symbolic' move that is applied at the end.  Won't work when we want
        // to replace the file with something coming from our ./files
        (_tree: Tree) => {
            const bytes: Buffer = <Buffer>_tree.read(mainFromPath);
            _tree.create(mainToPath, bytes);
            _tree.delete(mainFromPath);
        },
        
        // Use the existing service schematic to add our service to app.module.
        // The skeleton service it creates will be overwritten by ./files
        schematic('service', serviceOps),
        
        mergeWith(apply(url('./files'), [
            template({
                sourceDir: options.sourceDir,
                appRoot: options.appRoot,
                realm: options.realm,
                clientId: options.clientId,
                url: options.url,
            }),
            
        ]), MergeStrategy.Overwrite),
        
    ]);
}
