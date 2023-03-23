import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';
import { simpleFormatToJavaType, complexFormatToJavaType, defaultFormatValues, importComplexTypes } from '../constants/quarkus-constants';

export class Quarkus {
    private swagger: Swagger;
    private manager: FolderManager;
    private importPackage: string;
    private appPackage: string[];

    constructor(swagger: Swagger, appPackage: string, manager: FolderManager) {
        this.swagger = swagger;
        this.importPackage = appPackage;
        this.appPackage = appPackage.split(".");
        this.manager = manager;
    }

    /** para los modelos instanciar varias veces el scaffold sobre el modelo plantilla */
    public async make() {
        await this.createStructure();
        await this.createModels();
        await this.createResource();
        await this.createService();
        return;
    }

    /** crea estructura de carpetas y reemplaza valores estandar en nombres y contenido de carpetas y archivos de la aplicación quarkus */
    private async createStructure() {
        await this.manager.replaceData(
            {
                appName: this.swagger.getTitle(),
                lowerCaseAppName: this.swagger.getTitleLowerCase(),
                version: `v${this.swagger.getMajorVersion()}`,
                importPackage: this.importPackage,
                package_1: this.appPackage[0],
                package_2: this.appPackage[1],
                package_3: this.appPackage[2]
            }, './templates/quarkus/app', './outputs'
        );
        return;
    }

    private async createModels() {
        for (const name of this.swagger.getDefinitionNames()) {
            const complexDataTypes: string[] = [];
            const definitionObj = this.swagger.getObjectDefinitionByName(name);
            const template: string = this.createParameters(definitionObj, complexDataTypes); // debe crear un string con los paráemtros a reemplazar en el archivo .java
            await this.createModel(`${name}`, this.createModelImports(complexDataTypes), template, './templates/quarkus/model');
        }
        return;
    }

    /** Crear template de parámetros y retorna el template y una lista de tipos de datos complejos */
    private createParameters(definitionObj, complexDataTypes: string[]): string {
        let template = '';
        const params: string[] = Object.keys(definitionObj.properties);
        for (const param of params) {
            const parameter = definitionObj.properties[param];
            const dataType = this.searchDataType(parameter.type, parameter, complexDataTypes);

            template += `
    @NotBlank
    @Schema(required = ${definitionObj.required ? definitionObj.required.includes(param) : false}, description = "${parameter.description}", example = "${parameter.example}")
    private ${dataType} ${param};
    `;
        }
        return template;
    }

    private searchDataType(typeParam: string, paramObj, complexDataTypes: string[]): string {
        let javaType: string = simpleFormatToJavaType.get(paramObj.format);
        if (javaType) {
            return javaType;
        }

        javaType = complexFormatToJavaType.get(paramObj.format);
        if (javaType) {
            this.addComplexFormatType(javaType, complexDataTypes);
            return javaType;
        }

        javaType = defaultFormatValues.get(typeParam);
        if (javaType) {
            return javaType;
        }

        if (typeParam == 'array') {
            this.addComplexFormatType(complexFormatToJavaType.get(typeParam), complexDataTypes);
            return `${complexFormatToJavaType.get(typeParam)} <${this.searchDataType(paramObj.items.type, paramObj.items, complexDataTypes)}>`;
        }

        if (paramObj.$ref) {
            const ref: string = (paramObj.$ref.split('/')).pop();
            return ref;
        }
        return javaType;
    }

    private createModelImports(complexDataTypes: string[]): string {
        let template = '';
        complexDataTypes.map(dataType => {
            template += `${importComplexTypes.get(dataType)};
            `;
        });
        return template;
    }

    private addComplexFormatType(complexDataType: string, complexDataTypes: string[]) {
        if (complexDataType && !complexDataTypes.includes(complexDataType)) {
            complexDataTypes.push(complexDataType);
        }
    }

    /** identifica las definiciones de request y response y crea los archivos correspondientes */
    private async createModel(name: string, imports: string, parameters: string, origintemplate: string) {
        await this.manager.replaceData(
            {
                modelName: `${name}`,
                importPackage: this.importPackage,
                imports,
                lowerCaseAppName: this.swagger.getTitleLowerCase(),
                version: `v${this.swagger.getMajorVersion()}`,
                parameters: `${parameters}`
            },
            origintemplate,
            `./outputs/${this.swagger.getTitle()}/src/main/java/${this.appPackage[0]}/${this.appPackage[1]}/${this.appPackage[2]}/${this.swagger.getTitleLowerCase()}/application/v${this.swagger.getMajorVersion()}`
        );
        return;
    }

    private async createResource() {
        return;
    }

    private async createService() {
        return;
    }
}