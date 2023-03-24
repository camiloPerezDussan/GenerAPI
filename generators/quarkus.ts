import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';
import {
    simpleFormatToJavaType,
    complexFormatToJavaType,
    defaultFormatValues,
    importComplexTypes,
    JSON_MEDIA_TYPE
} from '../constants/quarkus-constants';

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

    public async make() {
        const res = this.createResource();
        await this.createStructure(res.resourceTemplate, res.resourceImports);
        await this.createModels();
        await this.createService();
        return;
    }

    private async createStructure(resourceTemplate: string, resourceImports: string) {
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
                resourceImports
            }, './templates/quarkus/app', './outputs'
        );
        return;
    }

    private async createModels() {
        for (const definitionName of this.swagger.getDefinitionNames()) {
            const complexDataTypes: string[] = [];
            const template: string = this.createParameters(definitionName, complexDataTypes); // debe crear un string con los paráemtros a reemplazar en el archivo .java
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
        }).join();
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
        return complexDataTypes.map(dataType => `${importComplexTypes.get(dataType)};
            `).join('');
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
        const res = this.createResourceMethods();
        return {
            resourceTemplate: res.resourceTemplate,
            resourceImports: 'ACÁ VAN LOS IMPORTS'
        }
    }

    private createResourceMethods() {
        let template = '';
        const modelImports: string[] = [];

        for (const path of this.swagger.getPathNames()) {
            const verbObjects = this.swagger.getVerbObjectsByPathName(path);
            for (const verbObject of verbObjects) {

                /** crear el nombre del método en el resource*/
                const partPathsName: string[] = path.split('/')
                partPathsName.push(verbObject.name);
                const methodName: string = partPathsName.map((part: string, index: number) => {
                    if (part.includes('{') && part.includes('}')) part = part.split('{').pop().split('}')[0];
                    return index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1);
                }).join('');

                /** crear las respuestas al método del resource */
                const responses: string = this.swagger.getCodeObjectsByVerbObject(verbObject).map(codeObject => {
                    let definition: string = this.swagger.getDefinitionNameByCodeObject(codeObject);
                    definition = definition ? `, content = @Content(schema = @Schema(type = SchemaType.OBJECT, implementation = ${definition}.class))` : '';
                    return `@APIResponse(responseCode = "${codeObject.statusCode}", description = "${codeObject.description}"${definition})`
                }).join(`,
        `);

                /** identificar queryParams, headers, pathParams y requestBody */
                const parameters: string[] = this.swagger.getParametersByVerbObject(verbObject).map(parameterObject => {
                    const parameterType = parameterObject.in;
                    const dataType = this.dataTypeToJavaType(parameterObject.schema);
                    if (parameterType == 'query') return `@RestQuery ${dataType} ${parameterObject.name}`;
                    if (parameterType == 'path') return `@RestPath ${dataType} ${parameterObject.name}`;
                    if (parameterType == 'header') return `@HeaderParam('${parameterObject.name}') ${dataType} ${parameterObject.name}`;
                });
                const requestDefinition: string = this.swagger.getRequestDefinitionName(verbObject);
                if (requestDefinition) {
                    modelImports.push(requestDefinition);
                    parameters.unshift(`@Valid @RequestBody ${requestDefinition} request`);
                }

                template += `
    @${verbObject.name}
    @Path("${path}")
    @Produces("${JSON_MEDIA_TYPE}")
    @Consumes("${JSON_MEDIA_TYPE}")
    @Counted(name = "${verbObject.description} V${this.swagger.getMajorVersion()} Count")
    @Timed(name = "${verbObject.description} V${this.swagger.getMajorVersion()} Time")
    @APIResponses(value = {
        ${responses}
    })
    @Operation(summary = "${verbObject.summary}", description = "${verbObject.description}")
    public Response ${methodName}(${parameters.join(`,
        `)}) throws Exception {
        return Response.ok().entity(apim.${methodName}(request, language, messageId)).build();
    }
    `;
            }
        }
        return {
            resourceTemplate: template,
            modelImports: modelImports
        };
    }

    private async createService() {
        return;
    }
}