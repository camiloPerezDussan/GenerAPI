const simpleFormatToJavaType: Map<string, string> = new Map<string, string>([
    ["float", "float"],
    ["double", "double"],
    ["int32", "int"],
    ["int64", "long"]
]);
const complexFormatToJavaType: Map<string, string> = new Map<string, string>([
    ["date", "LocalDate"],
    ["date-time", "LocalDateTime"],
    ["array", "List"]
]);
const defaultFormatValues: Map<string, string> = new Map<string, string>([
    ["string", "String"],
    ["number", "BigDecimal"],
    ["integer", "int"],
    ["boolean", "boolean"]
]);
const importComplexTypes: Map<string, string> = new Map<string, string>([
    ["LocalDate", "import java.time.LocalDate;"],
    ["List", "import java.util.List;"],
    ["BigDecimal", "import java.math.BigDecimal;"],
    ["LocalDateTime", "import java.time.LocalDateTime;"]
]);

const genericResourceImports: Map<string, string> = new Map<string, string>([
    ["Content", "import org.eclipse.microprofile.openapi.annotations.media.Content;"],
    ["Schema", "import org.eclipse.microprofile.openapi.annotations.media.Schema;"],
    ["SchemaType", "import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;"],
    ["APIResponse", "import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;"],
    ["RequestBody", "import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;"],
    ["Counted", "import org.eclipse.microprofile.metrics.annotation.Counted;"],
    ["Timed", "import org.eclipse.microprofile.metrics.annotation.Timed;"],
    ["APIResponses", "import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;"],
    ["Operation", "import org.eclipse.microprofile.openapi.annotations.Operation;"],
    ["RestQuery", "import javax.ws.rs.RestQuery;"], // consultar import 
    ["RestPath", "import javax.ws.rs.RestPath;"], // consultar import
    ["HeaderParam", "import javax.ws.rs.HeaderParam;"],
    ["Path", "import javax.ws.rs.Path;"],
    ["Produces", "import javax.ws.rs.Produces;"],
    ["Consumes", "import javax.ws.rs.Consumes;"],
    ["MediaType", "import javax.ws.rs.core.MediaType;"],
    ["GET", "import javax.ws.rs.GET;"],
    ["POST", "import javax.ws.rs.POST;"],
    ["PUT", "import javax.ws.rs.PUT;"],
    ["PATH", "import javax.ws.rs.PATH;"],
    ["DELETE", "import javax.ws.rs.DELETE;"],
    ["Valid", "import javax.validation.Valid;"],
    ["Inject", "import javax.inject.Inject;"]
]);

const JSON_MEDIA_TYPE = 'application/json';
export {
    simpleFormatToJavaType,
    complexFormatToJavaType,
    defaultFormatValues,
    importComplexTypes,
    genericResourceImports,
    JSON_MEDIA_TYPE
}