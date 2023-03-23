export class Swagger {
    private swagger; // swagger en json
    private requestDefinitions: string[]; // arreglo con nombres de las definiciones de request
    private responseDefinitions: string[]; // arreglo con nombres de las definiciones de response

    constructor(swagger) {
        this.swagger = swagger;
        this.requestDefinitions = [];
        this.responseDefinitions = [];
        this.searchDefinitions();
    }

    private searchDefinitions() {
        const pathNames: string[] = this.getPathNames();
        pathNames.map(pathName => {
            const verbNames: string[] = this.getVerbNamesByPath(pathName);
            verbNames.map(verbName => {
                const verbObject = this.swagger.paths[pathName][verbName];
                this.searchRequestDefinitions(verbObject);
                this.searchResponseDefinitions(verbObject);
            })
        });
    }

    /** Extrae las definiciones usadas en el request de las operaciones */
    private searchRequestDefinitions(verbObject) {
        if (verbObject.requestBody && verbObject.requestBody.content && verbObject.requestBody.content['application/json']) {
            this.extractRefDefinition(verbObject.requestBody, this.requestDefinitions);
        }
    }

    /** Extrae las definiciones usadas en el response de las operaciones */
    private searchResponseDefinitions(verbObject) {
        if (verbObject.responses) {
            const statusCodes: string[] = Object.keys(verbObject.responses);
            statusCodes.map(code => {
                const codeObj = verbObject.responses[code];
                if (codeObj.content && codeObj.content['application/json']) {
                    this.extractRefDefinition(codeObj, this.responseDefinitions);
                }
            });
        }
    }

    /** Extrae la definición de request y response y la almacena en el arreglo de definiciones de entrada */
    private extractRefDefinition(object, definitions: string[]) {
        let definitionName: string = object.content['application/json'].schema.$ref;
        if (definitionName) {
            const splitName = definitionName.split('/');
            definitionName = splitName[splitName.length - 1];
            if (!definitions.includes(definitionName)) {
                definitions.push(definitionName);
            }
        }
    }

    /** Busca en el swagger la definición y entrega el objeto con toda la información asociada */
    public getObjectDefinitionByName(definitionName: string) {
        return this.swagger.components.schemas[definitionName];
    }

    private getPathNames(): string[] {
        return Object.keys(this.swagger.paths);
    }

    private getVerbNamesByPath(pathName: string): string[] {
        return Object.keys(this.swagger.paths[pathName]);
    }

    public getTitle(): string {
        return this.swagger.info.title;
    }

    public getTitleLowerCase(): string {
        return (this.swagger.info.title).toLowerCase();
    }

    public getVersion(): string {
        return this.swagger.info.version;
    }

    public getMajorVersion(): string {
        return (this.swagger.info.version).split('.')[0];
    }

    public getSchemas() {
        return this.swagger.components.schemas;
    }

    public getRequestDefinitions(): string[] {
        return this.requestDefinitions;
    }

    public getResponseDefinitions(): string[] {
        return this.responseDefinitions;
    }
}