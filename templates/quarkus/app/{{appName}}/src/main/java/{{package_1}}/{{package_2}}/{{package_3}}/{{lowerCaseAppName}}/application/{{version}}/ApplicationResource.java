package {{importPackage}}.{{lowerCaseAppName}}.application.v1;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.metrics.annotation.Counted;
import org.eclipse.microprofile.metrics.annotation.Timed;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import {{importPackage}}.{{lowerCaseAppName}}.application.v1.ctsproxytemplate.back.SpService;
import {{importPackage}}.{{lowerCaseAppName}}.application.v1.wsproxytemplate.back.externalback1.ApimService;
{{resourceImports}}
import {{importPackage}}.{{lowerCaseAppName}}.application.v1.front.ModelRequest;
import {{importPackage}}.{{lowerCaseAppName}}.commons.Constants;

public class ApplicationResource {

    @Inject
    ApimService apim;
    {{{resourceTemplate}}}
}
