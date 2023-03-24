import { JSON_MEDIA_TYPE } from '../constants/quarkus-constants';

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
            const verbObjects = this.getVerbObjectsByPathName(pathName);
            verbObjects.map(verbObject => {
                this.searchRequestDefinitions(verbObject);
                this.searchResponseDefinitions(verbObject);
            })
        });
    }

    /** Extrae las definiciones usadas en el request de las operaciones */
    private searchRequestDefinitions(verbObject) {
        if (this.containsRequestBodyRefDefinition(verbObject)) {
            this.searchRefDefinition(verbObject.requestBody);
        }
    }

    /** Extrae las definiciones usadas en el response de las operaciones */
    private searchResponseDefinitions(verbObject) {
        const codeObjects = this.getCodeObjectsByVerbObject(verbObject);
        codeObjects.map(codeObject => {
            if (codeObject.content && codeObject.content[JSON_MEDIA_TYPE]) {
                this.searchRefDefinition(codeObject);
            }
        });
    }

    /** Extrae la definición de request y response y la almacena en el arreglo de definiciones de entrada */
    private searchRefDefinition(object) {
        this.saveDefinition(object.content[JSON_MEDIA_TYPE].schema.$ref);
    }

    private getSecondaryDefinitiosnByDefinitionName(definitionName: string) {
        const propertyObjects = this.getParamObjectsByDefinitionName(definitionName);
        for (const property of propertyObjects) {
            let ref = '';
            if (property.type == 'array') {
                ref = property.items.$ref;
            } else if (property.$ref) {
                ref = property.$ref;
            }
            this.saveDefinition(ref);
        }
    }

    private saveDefinition(definitionName: string) {
        if (definitionName && definitionName != '') {
            definitionName = definitionName.split('/').pop();
            if (!this.definitionNames.includes(definitionName)) {
                this.definitionNames.push(definitionName);
                this.getSecondaryDefinitiosnByDefinitionName(definitionName); // busca referencias a definiciones secundarias
            }
        }
    }

    private containsRequestBodyRefDefinition(verbObject) {
        return (verbObject.requestBody && verbObject.requestBody.content
            && verbObject.requestBody.content[JSON_MEDIA_TYPE] && verbObject.requestBody.content[JSON_MEDIA_TYPE].schema
            && verbObject.requestBody.content[JSON_MEDIA_TYPE].schema.$ref);
    }

    /** Busca en el swagger la definición y entrega el objeto con toda la información asociada */
    private getObjectDefinitionByName(definitionName: string) {
        return this.swagger.components.schemas[definitionName];
    }

    public getParamObjectsByDefinitionName(definitionName) {
        const definition = this.getObjectDefinitionByName(definitionName);
        const propertyNames: string[] = Object.keys(definition.properties);
        return propertyNames.map(name => {
            const propertyObject = definition.properties[name];
            propertyObject['name'] = name;
            return propertyObject;
        });
    }

    private getVerbNamesByPath(pathName: string): string[] {
        return Object.keys(this.swagger.paths[pathName]);
    }

    public getVerbObjectsByPathName(pathName: string) {
        return this.getVerbNamesByPath(pathName).map(verbName => {
            const verbObject = this.getVerbObject(pathName, verbName);
            verbObject['name'] = verbName;
            return verbObject;
        });
    }

    public getCodeObjectsByVerbObject(verbObject) {
        if (verbObject.responses) {
            return Object.keys(verbObject.responses).map(code => {
                verbObject.responses[code]['statusCode'] = code;
                return verbObject.responses[code]
            });
        }
        return [];
    }

    private getVerbObject(pathName: string, verbName: string) {
        return this.swagger.paths[pathName][verbName];
    }

    public getPathNames(): string[] {
        return Object.keys(this.swagger.paths);
    }

    public getTitle(): string {
        return this.swagger.info.title;
    }

    public getTitleLowerCase(): string {
        return this.getTitle().toLowerCase();
    }

    public getVersion(): string {
        return this.swagger.info.version;
    }

    public getMajorVersion(): string {
        return this.getVersion().split('.')[0];
    }

    public getSchemas() {
        return this.swagger.components.schemas;
    }

    public getDefinitionNames(): string[] {
        return this.definitionNames;
    }

    public getRequestDefinitionName(verbObject) {
        if (this.containsRequestBodyRefDefinition(verbObject))
            return verbObject.requestBody.content[JSON_MEDIA_TYPE].schema.$ref.split('/').pop();
        return null;
    }
    public getDefinitionNameByCodeObject(codeObject) {
        if (codeObject.content && codeObject.content[JSON_MEDIA_TYPE] && codeObject.content[JSON_MEDIA_TYPE].schema.$ref) {
            return codeObject.content[JSON_MEDIA_TYPE].schema.$ref.split('/').pop();
        }
        return null;
    }

    public getParametersByVerbObject(verbObject) {
        return verbObject.parameters ? verbObject.parameters : [];
    }

    public getRequiredParamsByDefinitionName(definitionName: string) {
        return this.getSchemas()[definitionName].required;
    }
}