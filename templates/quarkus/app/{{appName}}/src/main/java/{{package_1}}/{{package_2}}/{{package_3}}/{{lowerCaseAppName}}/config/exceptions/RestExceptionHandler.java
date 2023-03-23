package ${package}.config.exceptions;

import javax.inject.Inject;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.jboss.logging.Logger;
import ${package}.commons.APIResponseBase;
import pa.com.globalbank.belcp.utils.errors.MessageLocalizationException;

@Provider
public class RestExceptionHandler implements ExceptionMapper<Exception> {

    @Inject
    Logger log;

    private Response buildResponse(Exception e) {
        log.error(e);
        APIResponseBase response = new APIResponseBase();

        if (e instanceof CustomBusinessException) { // Business
            CustomBusinessException ex = (CustomBusinessException) e;
            response.setErrors(ex.getErrors());
        } else if (e instanceof MessageLocalizationException) { // system - base de datos de errores - connection error
            response.addError(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), e.getMessage(),
                    e.getLocalizedMessage());
        } else { // system de api y back - network error - connection error
            response.addError(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                    Response.Status.INTERNAL_SERVER_ERROR.getReasonPhrase(), e.getMessage());
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(response).build();
    }

    @Override
    public Response toResponse(Exception exception) {
        exception.printStackTrace();
        return buildResponse(exception);
    }
}
