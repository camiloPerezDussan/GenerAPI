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
    ["LocalDate", "import java.time.LocalDate"],
    ["List", "import java.util.List"],
    ["BigDecimal", "import java.math.BigDecimal"],
    ["LocalDateTime", "import java.time.LocalDateTime"]
])
export {
    simpleFormatToJavaType,
    complexFormatToJavaType,
    defaultFormatValues,
    importComplexTypes
}