package ${package}.config.httpclient;

import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.rest.client.ext.ClientHeadersFactory;
import org.jboss.resteasy.specimpl.MultivaluedMapImpl;

import ${package}.commons.Constants;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.MultivaluedMap;

@ApplicationScoped
public class RequestHeaderFactory implements ClientHeadersFactory {

    @Inject
    Config config;

    @Override
    public MultivaluedMap<String, String> update(MultivaluedMap<String, String> incomingHeaders,
            MultivaluedMap<String, String> clientOutgoingHeaders) {
        MultivaluedMap<String, String> headers = new MultivaluedMapImpl<>();
        String azureTrace = config.getValue("azure.apim.trace", Boolean.class) ? "true" : "false";
        String azureSuscriptionKey = config.getValue("azure.apim.key", String.class);
        headers.add(Constants.OCP_APIM_SUBSCRIPTION_KEY, azureSuscriptionKey);
        headers.add(Constants.OCP_APIM_TRACE, azureTrace);
        return headers;
    }
}
