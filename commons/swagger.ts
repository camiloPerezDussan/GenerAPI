export class Swagger {
    private swagger; // swagger en json
    private definitionNames: string[]; // arreglo con nombres de las definiciones

    constructor(swagger) {
        this.swagger = swagger;
        this.definitionNames = [];
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
            this.extractRefDefinition(verbObject.requestBody);
        }
    }

    /** Extrae las definiciones usadas en el response de las operaciones */
    private searchResponseDefinitions(verbObject) {
        if (verbObject.responses) {
            const statusCodes: string[] = Object.keys(verbObject.responses);
            statusCodes.map(code => {
                const codeObj = verbObject.responses[code];
                if (codeObj.content && codeObj.content['application/json']) {
                    this.extractRefDefinition(codeObj);
                }
            });
        }
    }

    /** Extrae la definición de request y response y la almacena en el arreglo de definiciones de entrada */
    private extractRefDefinition(object) {
        let definitionName: string = object.content['application/json'].schema.$ref;
        if (definitionName) {
            const splitName = definitionName.split('/');
            definitionName = splitName[splitName.length - 1];
            if (!this.definitionNames.includes(definitionName)) {
                this.definitionNames.push(definitionName);
                this.getSecondaryDefinitiosnByDefinitionName(definitionName); // busca referencias a definiciones secundarias
            }
        }
    }

    private getSecondaryDefinitiosnByDefinitionName(definitionName: string) {
        const definition = this.getObjectDefinitionByName(definitionName);
        const propertyNames: string[] = this.getPropertiesByDefinition(definition);
        for (const name of propertyNames) {
            const property = definition.properties[name];
            let ref = '';
            if (property.type == 'array') {
                ref = property.items.$ref;
            } else if (property.$ref) {
                ref = property.$ref;
            }
            if (ref && ref != '') {
                ref = (ref.split('/')).pop();
                this.addToSecondaryDefinitions(ref);
                this.getSecondaryDefinitiosnByDefinitionName(ref);
            }
        }
    }

    private addToSecondaryDefinitions(definitionName) {
        if (definitionName && !this.definitionNames.includes(definitionName)) {
            this.definitionNames.push(definitionName);
        }
    }

    private getPropertiesByDefinition(definition): string[] {
        return Object.keys(definition.properties);
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

    public getDefinitionNames(): string[] {
        return this.definitionNames;
    }
}