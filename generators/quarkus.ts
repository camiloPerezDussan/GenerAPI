import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';

export class Quarkus {
    private swagger: Swagger;
    private manager: FolderManager;
    private importPackage: string;
    private appPackage: string[];
    private simpleFormatToJavaType: Map<string, string> = new Map<string, string>([
        ["float", "float"],
        ["double", "double"],
        ["int32", "int"],
        ["int64", "long"]
    ]);
    private complexFormatToJavaType: Map<string, string> = new Map<string, string>([
        ["date", "LocalDate"],
        ["date-time", "LocalDateTime"],
        ["array", "List"]
    ]);
    private defaultFormatValues: Map<string, string> = new Map<string, string>([
        ["string", "String"],
        ["number", "BigDecimal"],
        ["integer", "int"],
        ["boolean", "boolean"]
    ]);
    private importComplexTypes: Map<string, string> = new Map<string, string>([
        ["LocalDate", "import java.time.LocalDate"],
        ["List", "import java.util.List"],
        ["BigDecimal", "import java.math.BigDecimal"],
        ["LocalDateTime", "import java.time.LocalDateTime"]
    ]);

    constructor(swagger: Swagger, appPackage: string, manager: FolderManager) {
        this.swagger = swagger;
        this.importPackage = appPackage;
        this.appPackage = appPackage.split(".");
        this.manager = manager;
    }

    /** para los modelos instanciar varias veces el scaffold sobre el modelo plantilla */
    public async make() {
        await this.createStructure();
        await this.createRequestModels();
        await this.createResponseModels();
        await this.createResource();
        await this.createService();
        return;
        //fs.mkdirSync(`${this.mainPath}/java/${this.appPackage}/${this.appName.toLowerCase()}/application/${this.version}`, { recursive: true })
        //fs.mkdirSync(`${this.mainPath}/resources`, { recursive: true })        
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

    private async createRequestModels() {
        for (const name of this.swagger.getRequestDefinitions()) {
            const complexDataTypes: string[] = [];
            const definitionObj = this.swagger.getObjectDefinitionByName(name);
            const template: string = this.createParameters(definitionObj, complexDataTypes); // debe crear un string con los paráemtros a reemplazar en el archivo .java
            await this.createModel(`${name}Request`, this.createModeImports(complexDataTypes), template, './templates/quarkus/modelRequest');
        }
        return;
    }

    private async createResponseModels() {
        for (const name of this.swagger.getResponseDefinitions()) {
            const complexDataTypes: string[] = [];
            /** Busca en el swagger la información de la definición, para extraer la información necesaria en los modelos */
            const definitionObj = this.swagger.getObjectDefinitionByName(name);
            const template: string = this.createParameters(definitionObj, complexDataTypes); // debe crear un string con los paráemtros a reemplazar en el archivo .java
            await this.createModel(`${name}Response`, this.createModeImports(complexDataTypes), template, './templates/quarkus/modelRequest');
        }
        return;
    }

    private createModeImports(complexDataTypes: string[]): string {
        console.log("en imports:")
        console.log(complexDataTypes);
        let template = '';
        complexDataTypes.map(dataType => {
            template += `
${this.importComplexTypes.get(dataType)};`;
        });
        return template;
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

    /** Crear template de parámetros y retorna el template y una lista de tipos de datos complejos */
    private createParameters(definitionObj, complexDataTypes: string[]) {
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
        let javaType: string = this.simpleFormatToJavaType.get(paramObj.format);
        if (javaType) {
            return javaType;
        }

        javaType = this.complexFormatToJavaType.get(paramObj.format);
        if (javaType) {
            this.addComplexFormatType(javaType, complexDataTypes);
            return javaType;
        }

        javaType = this.defaultFormatValues.get(typeParam);
        if (javaType) {
            return javaType;
        }

        if (typeParam == 'array') {
            this.addComplexFormatType(this.complexFormatToJavaType.get(typeParam), complexDataTypes);
            return `${this.complexFormatToJavaType.get(typeParam)} <${this.searchDataType(paramObj.items.type, paramObj.items, complexDataTypes)}>`;
        }

        if (paramObj.$ref) {
            const ref: string = (paramObj.$ref.split('/')).pop();
            return ref;
        }
        return javaType;
    }

    private addComplexFormatType(complexDataType: string, complexDataTypes: string[]) {
        if (complexDataType && !complexDataTypes.includes(complexDataType)) {
            complexDataTypes.push(complexDataType);
        }
    }
    private async createResource() {
        return;
    }

    private async createService() {
        return;
    }
}