package ${package}.config.filters;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.ext.Provider;

import org.eclipse.microprofile.config.Config;

import io.micrometer.core.instrument.util.IOUtils;
import ${package}.commons.Constants;

@Provider
public class CustomRequestHeadersFilter implements ContainerRequestFilter {

    @Inject
    Config config;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        final long requestStartTime = System.currentTimeMillis();
        final String body = IOUtils.toString(requestContext.getEntityStream(), StandardCharsets.UTF_8);
        requestContext.setProperty("requestStartTime", requestStartTime);
        requestContext.setProperty("requestBody", body);

        String messageId = requestContext.getHeaderString(Constants.MESSAGE_ID);
        if (messageId == null || messageId.isEmpty()) {
            messageId = UUID.randomUUID().toString();
            requestContext.getHeaders().add(Constants.MESSAGE_ID, messageId);
        }

        String language = requestContext.getHeaderString(Constants.ACCEPT_LANGUAGE);
        if (language == null || language.isEmpty()
                || (!language.toUpperCase().equals(Constants.ES) && !language.toUpperCase().equals(Constants.EN))) {
            requestContext.getHeaders().putSingle(Constants.ACCEPT_LANGUAGE, Constants.ES);
        } else {
            requestContext.getHeaders().putSingle(Constants.ACCEPT_LANGUAGE, language.toUpperCase());
        }
        requestContext.setEntityStream(new ByteArrayInputStream(body.getBytes()));
    }
}
