package ${package}.config.filters;

import java.io.IOException;

import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;

import io.vertx.core.http.HttpServerRequest;
import ${package}.commons.Constants;
import ${package}.config.logs.Log;

@Provider
public class CustomResponseHeadersFilter implements ContainerResponseFilter {

    @Inject
    Log log;

    @Context
    HttpServerRequest request;

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext)
            throws IOException {
        responseContext.getHeaders().add(Constants.CONTENT_LANGUAGE, requestContext.getHeaderString(Constants.ACCEPT_LANGUAGE));
        responseContext.getHeaders().add(Constants.MESSAGE_ID, requestContext.getHeaderString(Constants.MESSAGE_ID));
        log.info(request, requestContext, responseContext);
    }
}
