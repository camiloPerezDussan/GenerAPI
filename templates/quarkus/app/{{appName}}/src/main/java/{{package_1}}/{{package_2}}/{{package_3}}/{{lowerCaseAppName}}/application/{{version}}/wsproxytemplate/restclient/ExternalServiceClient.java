package ${package}.application.v1.wsproxytemplate.restclient;

import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import ${package}.application.v1.wsproxytemplate.back.externalback1.ExternalServiceRequest;
import ${package}.application.v1.wsproxytemplate.back.externalback1.ExternalServiceResponse;
import ${package}.config.httpclient.RequestHeaderFactory;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;

@RegisterRestClient(configKey="apim-service")
@RegisterClientHeaders(RequestHeaderFactory.class)
public interface ExternalServiceClient {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/TransferenciasPropias")
    ExternalServiceResponse svcOperation(ExternalServiceRequest request);

}
