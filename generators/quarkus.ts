import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';
import {
    simpleFormatToJavaType,
    complexFormatToJavaType,
    defaultFormatValues,
    importComplexTypes,
    genericResourceImports,
    JSON_MEDIA_TYPE
} from '../constants/quarkus-constants';

export class Quarkus {
    private swagger: Swagger;
    private manager: FolderManager;
    private importPackage: string;
    private appPackage: string[];
    private resourceImports: string[];

    constructor(swagger: Swagger, appPackage: string, manager: FolderManager) {
        this.swagger = swagger;
        this.importPackage = appPackage;
        this.appPackage = appPackage.split(".");
        this.manager = manager;
        this.resourceImports = [];
    }

    public async make() {
        await this.createStructure(this.createResource());
        await this.createModels();
        await this.createService();
        return;
    }

    private async createStructure(resourceTemplate: string) {
        await this.manager.replaceData(
            {
                appName: this.swagger.getTitle(),
                lowerCaseAppName: this.swagger.getTitleLowerCase(),
                version: `v${this.swagger.getMajorVersion()}`,
                importPackage: this.importPackage,
                package_1: this.appPackage[0],
                package_2: this.appPackage[1],
                package_3: this.appPackage[2],
                resourceTemplate,
                resourceImports: this.resourceImports.join('\n')
            }, './templates/quarkus/app', './outputs'
        );
        return;
    }

    private async createModels() {
        for (const definitionName of this.swagger.getDefinitionNames()) {
            const complexDataTypes: string[] = [];
            const template: string = this.createParameters(definitionName, complexDataTypes);
            await this.createModel(`${definitionName}`, this.createModelImports(complexDataTypes), template, './templates/quarkus/model');
        }
        return;
    }

    private createParameters(definitionName: string, complexDataTypes: string[]): string {
        const requiredParams = this.swagger.getRequiredParamsByDefinitionName(definitionName);
        return this.swagger.getParamObjectsByDefinitionName(definitionName).map(paramObject => {
            const dataType = this.searchDefinitionDataType(paramObject, complexDataTypes);
            return `
    @NotBlank
    @Schema(required = ${requiredParams ? requiredParams.includes(paramObject.name) : false}, description = "${paramObject.description}", example = "${paramObject.example}")
    private ${dataType} ${paramObject.name};
    `;
        }).join('');
    }

    private searchDefinitionDataType(paramObj, complexDataTypes: string[]): string {
        const javaType = complexFormatToJavaType.get(paramObj.format);
        if (javaType) this.addComplexFormatType(javaType, complexDataTypes);
        if (paramObj.type == 'array') this.addComplexFormatType(complexFormatToJavaType.get(paramObj.type), complexDataTypes);
        return this.dataTypeToJavaType(paramObj);
    }

    private dataTypeToJavaType(paramObj) {
        let javaType: string = simpleFormatToJavaType.get(paramObj.format);
        if (javaType) return javaType;

        javaType = complexFormatToJavaType.get(paramObj.format);
        if (javaType) return javaType;

        javaType = defaultFormatValues.get(paramObj.type);
        if (javaType) return javaType;

        if (paramObj.type == 'array') return `${complexFormatToJavaType.get(paramObj.type)} <${this.dataTypeToJavaType(paramObj.items)}>`;

        if (paramObj.$ref) return paramObj.$ref.split('/').pop();
        return javaType;
    }

    private createModelImports(complexDataTypes: string[]): string {
        return complexDataTypes.map((dataType): string => importComplexTypes.get(dataType)).join('\n');
    }

    private addComplexFormatType(complexDataType: string, complexDataTypes: string[]) {
        if (complexDataType && !complexDataTypes.includes(complexDataType)) {
            complexDataTypes.push(complexDataType);
        }
    }

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

    /** METODOS PARA CONSTRUIR EL ARCHIVO RESOURCE */
    private createResource() {
        return this.swagger.getPathNames().map((path: string) => {
            const verbObjects = this.swagger.getVerbObjectsByPathName(path);
            return verbObjects.map(verbObject => this.createResourceTemplate(path,
                this.createResourceMethodName(path, verbObject.name), verbObject,
                this.createResourceApiResponses(verbObject),
                this.createResourceParameters(verbObject))).join('');
        }).join('');
    }

    private createResourceImports(): string {
        this.resourceImports.map((keyImport: string) => {
            let importItem = genericResourceImports.get(keyImport);
            if (!importItem) {
            }
        });
        return this.resourceImports.map((dataType: string) => `import ${this.importPackage}.${this.swagger.getTitleLowerCase()}.application.v${this.swagger.getMajorVersion()}.front.${dataType};
`).join('');
    }

    private createResourceMethodName(path: string, verbName: string): string {
        const partPathsName: string[] = path.split('/')
        partPathsName.push(verbName);
        return partPathsName.map((part: string, index: number) => {
            if (part.includes('{') && part.includes('}')) part = part.split('{').pop().split('}')[0];
            return index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
    }

    private addResourceImport(keyImport: string) {
        let importLine: string = '';
        importLine = !genericResourceImports.has(keyImport)
            ? `import ${this.importPackage}.${this.swagger.getTitleLowerCase()}.application.v${this.swagger.getMajorVersion()}.front.${keyImport};`
            : genericResourceImports.get(keyImport);
        if (!this.resourceImports.includes(importLine)) {
            this.resourceImports.push(importLine);
        }
    }

    private createResourceApiResponses(verbObject): string {
        return this.swagger.getCodeObjectsByVerbObject(verbObject).map(codeObject => {
            let definition: string = this.swagger.getDefinitionNameByCodeObject(codeObject);
            if (definition) {
                this.addResourceImport(definition);
                this.addResourceImport('Content');
                this.addResourceImport('Schema');
                this.addResourceImport('SchemaType');
                definition = `, content = @Content(schema = @Schema(type = SchemaType.OBJECT, implementation = ${definition}.class))`;
            } else {
                definition = '';
            }
            this.addResourceImport('APIResponse');
            return `@APIResponse(responseCode = "${codeObject.statusCode}", description = "${codeObject.description}"${definition})`
        }).join(`,
        `);
    }

    private createResourceParameters(verbObject): string {
        const parameters: string[] = this.swagger.getParametersByVerbObject(verbObject).map(parameterObject => {
            const parameterType = parameterObject.in;
            const dataType = this.dataTypeToJavaType(parameterObject.schema);
            if (parameterType == 'query') {
                this.addResourceImport('RestQuery');
                return `@RestQuery ${dataType} ${parameterObject.name}`;
            } else if (parameterType == 'path') {
                this.addResourceImport('RestPath');
                return `@RestPath ${dataType} ${parameterObject.name}`;
            } else if (parameterType == 'header') {
                this.addResourceImport('HeaderParam');
                return `@HeaderParam('${parameterObject.name}') ${dataType} ${parameterObject.name}`;
            }
        });
        const requestDefinition: string = this.swagger.getRequestDefinitionName(verbObject);
        if (requestDefinition) {
            this.addResourceImport(requestDefinition);
            this.addResourceImport('RequestBody');
            this.addResourceImport('Valid');
            parameters.unshift(`@Valid @RequestBody ${requestDefinition} request`);
        }
        return parameters.join(`,
            `);
    }

    private createResourceTemplate(path: string, methodName: string, verbObject, responses: string, parameters: string): string {
        const verb = verbObject.name.toUpperCase();
        this.addResourceImport(verb);
        this.addResourceImport('Path');
        this.addResourceImport('Produces');
        this.addResourceImport('Consumes');
        this.addResourceImport('Counted');
        this.addResourceImport('Timed');
        this.addResourceImport('APIResponses');
        this.addResourceImport('Operation');
        this.addResourceImport('Response');
        return `
    @${verb}
    @Path("${path}")
    @Produces("${JSON_MEDIA_TYPE}")
    @Consumes("${JSON_MEDIA_TYPE}")
    @Counted(name = "${verbObject.description} V${this.swagger.getMajorVersion()} Count")
    @Timed(name = "${verbObject.description} V${this.swagger.getMajorVersion()} Time")
    @APIResponses(value = {
        ${responses}
    })
    @Operation(summary = "${verbObject.summary}", description = "${verbObject.description}")
    public Response ${methodName}(${parameters}) throws Exception {
        return Response.ok().entity(apim.${methodName}(request, language, messageId)).build();
    }
    `;
    }

    private async createService() {
        return;
    }
}