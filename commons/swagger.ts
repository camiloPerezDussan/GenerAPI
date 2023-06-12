import { JSON_MEDIA_TYPE } from '../constants/quarkus-constants';

export class Swagger {
    private title: string;
    private description: string;
    private version: string;
    private paths;
    private components;
    private definitionNames: string[]; // arreglo con nombres de las definiciones

    constructor(swagger) {
        this.definitionNames = [];
        this.title = (swagger.info.title).trim().replace(' ', '').toLowerCase();
        this.description = swagger.info.description;
        this.version = swagger.info.version;
        this.paths = swagger.paths
        this.components = swagger.components
        this.searchDefinitions();
    }

    private searchDefinitions() {
        this.getPathNames().map(pathName => {
            const verbObjects = this.getVerbObjectsByPathName(pathName);
            verbObjects.map(verbObject => {
                this.searchRequestDefinitions(verbObject);
                this.searchResponseDefinitions(verbObject);
            })
        });
    }

    /** Extrae las definiciones usadas en el request de las operaciones */
    private searchRequestDefinitions(verbObject) {
        let contentType: string = this.getRequestContentType(verbObject);
        if (contentType) {
            verbObject.consumeContentType = contentType;
            this.searchRefDefinition(verbObject.requestBody, contentType);
        }
    }

    /** Extrae las definiciones usadas en el response de las operaciones */
    private searchResponseDefinitions(verbObject) {
        const codeObjects = this.getCodeObjectsByVerbObject(verbObject);
        codeObjects.map(codeObject => {
            let contentType: string = this.getResponseContentType(codeObject);
            if (contentType) {
                verbObject.produceContentType = contentType;
                this.searchRefDefinition(codeObject, contentType);
            }
        });
    }

    /** Extrae el content-type asociado que contenga una definición */
    private getRequestContentType(object) {
        if (object.requestBody) {
            let contentTypes: string[] = Object.keys(object.requestBody.content)
            let i = 0;
            while (i < contentTypes.length) {
                if (contentTypes[i].includes('application/vnd.gbm') && this.containsRequestBodyRefDefinition(object, contentTypes[i])) {
                    return contentTypes[i]
                }
                i++;
            }
            if (contentTypes.includes(JSON_MEDIA_TYPE) && this.containsRequestBodyRefDefinition(object)) {
                return JSON_MEDIA_TYPE
            }
        }
        return null
    }

    /** Extrae el content-type asociado que contenga una definición */
    private getResponseContentType(object) {
        if (object.content) {
            let contentTypes: string[] = Object.keys(object.content)
            let i = 0;
            while (i < contentTypes.length) {
                if (contentTypes[i].includes('application/vnd.gbm') && object.content[contentTypes[i]].schema) {
                    return contentTypes[i]
                }
                i++;
            }
            if (contentTypes.includes(JSON_MEDIA_TYPE) && object.content[JSON_MEDIA_TYPE].schema) {
                return JSON_MEDIA_TYPE
            }
        }
        return null
    }

    /** Extrae la definición de request y response y la almacena en el arreglo de definiciones de entrada */
    private searchRefDefinition(object, contentType) {
        this.saveDefinition(object.content[contentType].schema.$ref);
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

    private containsRequestBodyRefDefinition(verbObject, contentType: string = JSON_MEDIA_TYPE) {
        return (verbObject.requestBody && verbObject.requestBody.content
            && verbObject.requestBody.content[contentType] && verbObject.requestBody.content[contentType].schema
            && verbObject.requestBody.content[contentType].schema.$ref);
    }

    /** Busca en el swagger la definición y entrega el objeto con toda la información asociada */
    private getObjectDefinitionByName(definitionName: string) {
        return this.components.schemas[definitionName];
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
        return Object.keys(this.paths[pathName]);
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

    public getRequestDefinitionName(verbObject) {
        if (verbObject.consumeContentType) {
            return verbObject.requestBody.content[verbObject.consumeContentType].schema.$ref.split('/').pop();
        }
        return null
    }

    public getDefinitionNameByCodeObject(codeObject, contentType) {
        if (contentType && codeObject.content && codeObject.content[contentType]
            && codeObject.content[contentType].schema && codeObject.content[contentType].schema.$ref) {
            return codeObject.content[contentType].schema.$ref.split('/').pop();
        }
        return null;
    }

    public getParametersByVerbObject(verbObject) {
        return verbObject.parameters ? verbObject.parameters : [];
    }

    public getRequiredParamsByDefinitionName(definitionName: string) {
        return this.getSchemas()[definitionName].required;
    }

    private getVerbObject(pathName: string, verbName: string) {
        return this.paths[pathName][verbName];
    }

    public getPathNames(): string[] {
        return Object.keys(this.paths);
    }


    public getMajorVersion(): string {
        return this.version.split('.')[0];
    }

    public getSchemas() {
        return this.components.schemas;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getVersion(): string {
        return this.version;
    }

    public getDefinitionNames(): string[] {
        return this.definitionNames;
    }
}