
package ${package}.application.v1.wsproxytemplate.back;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import pa.com.globalbank.belcp.commons.BackendAuthConfig;

import ${package}.application.v1.wsproxytemplate.restclient.ExternalServiceClient;
import ${package}.commons.Util;
import ${package}.config.exceptions.CustomBusinessException;
import ${package}.application.v1.front.ModelRequest;
import ${package}.application.v1.front.ModelResponse;

@ApplicationScoped
public class ApimService {

    @ConfigProperty(name = "gb.backend.auth")
    private String GB_BACKEND_AUTH;

    @Inject
    private Util util;

    @Inject
    @RestClient
    ExternalServiceClient externalServiceClient;

    private BackendAuthConfig setCTSAuthConfiguration() throws JsonProcessingException {
        byte[] decodedBytes = Base64.getDecoder().decode(GB_BACKEND_AUTH);
        String decodedCredentials = new String(decodedBytes);

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(decodedCredentials, BackendAuthConfig.class);
    }

    public ModelResponse operationService(ModelRequest request, String language) throws Exception {
        ModelResponse response = new ModelResponse();
        BackendAuthConfig authParams = setCTSAuthConfiguration();
        ExternalServiceRequest apimRequest = new ExternalServiceRequest();

        apimRequest.setUser(authParams.getCts_username());
        apimRequest.setPassword(authParams.getCts_password());
        apimRequest.setOffice(authParams.getCts_office());
        apimRequest.setRole(authParams.getCts_role());
        apimRequest.setServer(authParams.getCts_server());
        apimRequest.setTerminal(authParams.getCts_terminal());

        ExternalServiceResponse apimResponse = externalServiceClient.svcOperation(apimRequest);

        if (apimResponse.isSuccess()) {
            response.setScheduled(apimResponse.isProgramada());
            response.setTransactionId(apimResponse.getIdtransaccion());
            response.setTransactionStatus(apimResponse.getEstadoTransaction());
            response.setTransactionDate(dateReturn(new SimpleDateFormat("yyyy-MM-dd").parse(apimResponse.getFecha())));
            response.setAmount(apimResponse.getMonto());
        } else {
            throw new CustomBusinessException(util.makeError(apimResponse, language));
        }
        return response;
    }

    private LocalDate dateReturn(Date dateValue) {
        if (dateValue != null) {
            return dateValue.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        } else {
            return null;
        }
    }

}
