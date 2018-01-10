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

    const sourceDir = options.sourceDir;
    const mainFromPath = normalize('/' + sourceDir + '/main.ts');
    const mainToPath = normalize('/' + sourceDir + '/main.ts.no-keycloak');
    
    const serviceOps = {
        name: 'keycloak',
        path: servicePath(options),
        module: 'app.module', // where to find @NgModule (i.e. app.module.ts)
        appRoot: options.appRoot,
        spec: false
    };
    
    if (!sourceDir) {
        throw new SchematicsException(`sourceDir option is required.`);
    }
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
        
        // The mergeWith() rule merge two trees; one that's coming from a Source (a Tree with no
        // base), and the one as input to the rule. You can think of it like rebasing a Source on
        // top of your current set of changes. In this case, the Source is that apply function.
        // The apply() source takes a Source, and apply rules to it. In our case, the Source is
        // url(), which takes an URL and returns a Tree that contains all the files from that URL
        // in it. In this case, we use the relative path `./files`, and so two files are going to
        // be created (test1, and test2).
        // We then apply the template() rule, which takes a tree and apply two templates to it:
        //   path templates: this template replaces instances of __X__ in paths with the value of
        //                   X from the options passed to template(). If the value of X is a
        //                   function, the function will be called. If the X is undefined or it
        //                   returns null (not empty string), the file or path will be removed.
        //   content template: this is similar to EJS, but does so in place (there's no special
        //                     extension), does not support additional functions if you don't pass
        //                     them in, and only work on text files (we use an algorithm to detect
        //                     if a file is binary or not).
        mergeWith(apply(url('./files'), [
            template({
                //  INDEX: options.index,
                appRoot: options.appRoot,
            }),
            
            move(sourceDir),
        ]), MergeStrategy.Overwrite),
        
    ]);
}
