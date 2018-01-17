import {Tree, VirtualTree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import * as path from 'path';
//import {createAppModule, getFileContent} from '@angular-devkit/schematics/utility/test';
//import {Schema as ComponentOptions} from './schema';


const collectionPath = path.join(__dirname, '../collection.json');

let appTree: Tree;

beforeEach(() => {
    appTree = new VirtualTree();
    appTree = createAppModule(appTree);
    appTree = createMain(appTree);
});

describe('keycloak-schematic', () => {
    const runner = new SchematicTestRunner('@ssilvert/keycloak-schematic', collectionPath);

    it('backs up main.ts', () => {
        const startMain: string = getFileContent(appTree, '/src/main.ts');
        const tree = runner.runSchematic('keycloak', {'clientId': 'ngApp'}, appTree);
        const newMain: string = getFileContent(tree, '/src/main.ts');
        const backedUpMain: string = getFileContent(tree, '/src/main.ts.no-keycloak')

        expect(newMain).not.toEqual(startMain);
        expect(startMain).toEqual(backedUpMain);
    });

    it('copies keycloak-service files and main.ts', () => {
        const tree = runner.runSchematic('keycloak', {'clientId': 'ngApp'}, appTree);
        const files: string[] = tree.files;

        expect(files.indexOf('/src/main.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/src/app/keycloak-service/keycloak.d.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/src/app/keycloak-service/keycloak.http.ts')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/src/app/keycloak-service/keycloak.js')).toBeGreaterThanOrEqual(0);
        expect(files.indexOf('/src/app/keycloak-service/keycloak.service.ts')).toBeGreaterThanOrEqual(0);
    });

    it('adds KeycloakService provider to app.module.ts ', () => {
        const tree = runner.runSchematic('keycloak', {'clientId': 'ngApp'}, appTree);
        const moduleContent = getFileContent(tree, '/src/app/app.module.ts');
        expect(moduleContent).toMatch(/import.*KeycloakService.*from '.\/keycloak-service\/keycloak.service'/);
        expect(moduleContent).toMatch(/providers:\s*\[KeycloakService\]/m);
    });
});

function createAppModule(tree: Tree, path?: string): Tree {
    tree.create(path || '/src/app/app.module.ts', `
    import { BrowserModule } from '@angular/platform-browser';
    import { NgModule } from '@angular/core';
    import { AppComponent } from './app.component';

    @NgModule({
    declarations: [
      AppComponent
    ],
    imports: [
      BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
    })
    export class AppModule { }
  `);

    return tree;
}

function createMain(tree: Tree, path?: string): Tree {
    tree.create(path || '/src/main.ts', `
    import { enableProdMode } from '@angular/core';
    import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

    import { AppModule } from './app/app.module';
    import { environment } from './environments/environment';

    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.log(err));
    `);

    return tree;
}

export function getFileContent(tree: Tree, path: string): string {
    const fileEntry = tree.get(path);

    if (!fileEntry) {
        throw new Error(`The file (${path}) does not exist.`);
    }

    return fileEntry.content.toString();
}