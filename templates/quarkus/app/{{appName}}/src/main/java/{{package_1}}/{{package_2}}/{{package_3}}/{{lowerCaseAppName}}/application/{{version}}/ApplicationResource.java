package ${package}.application.v1;

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

import ${package}.application.v1.ctsproxytemplate.back.SpService;
import ${package}.application.v1.wsproxytemplate.back.externalback1.ApimService;
import ${package}.application.v1.front.ModelRequest;
import ${package}.application.v1.front.ModelResponse;
import ${package}.commons.Constants;

import ${package}.commons.APIResponseBase;

@Path("/sevice-name/v1")
public class ApplicationResource {

    @Inject
    ApimService apim;

    @Inject
    SpService sp;

    @POST
    @Path("/operation-name")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Counted(name = "Functional Description V1 Count")
    @Timed(name = "Functional Description V1 Time")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Success", content = @Content(schema = @Schema(type = SchemaType.OBJECT, implementation = ModelResponse.class))),
            @APIResponse(responseCode = "500", description = "Error", content = @Content(schema = @Schema(type = SchemaType.OBJECT, implementation = APIResponseBase.class)))
    })
    @Operation(summary = "Functional Summary", description = "Full description of the operation")
    public Response operationName(
            @Valid @RequestBody ModelRequest request,
            @HeaderParam(Constants.ACCEPT_LANGUAGE) String language,
            @HeaderParam(Constants.MESSAGE_ID) String messageId) throws Exception {

        return Response.ok().entity(sp.operationService(request, language, messageId)).build();
    }
}
