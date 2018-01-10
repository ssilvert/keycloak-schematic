import { Path, normalize } from '@angular-devkit/core';
import {
    MergeStrategy,
    Rule,
    SchematicContext,
    Tree,
    apply,
    chain,
    mergeWith,
    move,
    template,
    schematic,
    url,
} from '@angular-devkit/schematics';

function servicePath(options: any): Path {
    return normalize('/' + options.appRoot + '/keycloak-service');
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function keycloakSchematic(options: any): Rule {

    const mainFromPath = normalize('/' + options.sourceDir + '/main.ts');
    const mainToPath = normalize('/' + options.sourceDir + '/main.ts.no-keycloak');
    
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
        
        (_tree: Tree) => {
            const bytes: Buffer = <Buffer>_tree.read(mainFromPath);
            _tree.create(mainToPath, bytes);
            _tree.delete(mainFromPath);
        },
        
        schematic('service', serviceOps),
        
        mergeWith(apply(url('./files'), [
            template({
                //  INDEX: options.index,
                appRoot: options.appRoot,
                realm: options.realm,
                clientId: options.clientId,
                url: options.url,
            }),
            
            move(options.sourceDir),
        ]), MergeStrategy.Overwrite),
        
    ]);
}
