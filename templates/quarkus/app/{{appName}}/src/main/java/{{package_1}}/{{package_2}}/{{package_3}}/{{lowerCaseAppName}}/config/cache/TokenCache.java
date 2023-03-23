package ${package}.config.cache;

import java.util.Base64;

import javax.enterprise.context.ApplicationScoped;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheResult;
import pa.com.globalbank.belcp.commons.BackendAuthConfig;
import pa.com.globalbank.belcp.ctsrestapi.CTSProxy;

@ApplicationScoped
public class TokenCache {
    @ConfigProperty(name = "azure.apim.key")
    private String API_SUBSCRIPTION_KEY;

    @ConfigProperty(name = "azure.apim.url")
    private String API_URL_BASE;

    @ConfigProperty(name = "azure.apim.trace")
    private String API_APIM_TRACE;

    @ConfigProperty(name = "gb.backend.auth")
    private String GB_BACKEND_AUTH;

    private void setAPIMRequestConfiguration(CTSProxy proxy) {
        proxy.setApimSuscriptionKey(API_SUBSCRIPTION_KEY);
        proxy.setApimTrace(Boolean.parseBoolean(API_APIM_TRACE));
        proxy.setApimCTSContextUrl(API_URL_BASE + "cts-apirest/");
    }

    private void setCTSAuthConfiguration(CTSProxy proxy) throws JsonProcessingException {
        byte[] decodedBytes = Base64.getDecoder().decode(GB_BACKEND_AUTH);
        String decodedCredentials = new String(decodedBytes);

        ObjectMapper mapper = new ObjectMapper();
        BackendAuthConfig backendAuthConfig = mapper.readValue(decodedCredentials, BackendAuthConfig.class);
        proxy.setLogin(backendAuthConfig.getCts_username());
        proxy.setPassword(backendAuthConfig.getCts_password());
        proxy.setOffice(backendAuthConfig.getCts_office());
        proxy.setRole(backendAuthConfig.getCts_role());
        proxy.setServer(backendAuthConfig.getCts_server());
        proxy.setTerminal(backendAuthConfig.getCts_terminal());
    }

    public CTSProxy getProxy() throws Exception {
        CTSProxy proxy = getLoginCts();
        if (!proxy.validateToken()) {
            proxy.doLogout();
            clearCache();
            proxy = getLoginCts();
        }
        return proxy;
    }

    @CacheResult(cacheName = "ctsproxy-cache")
    public CTSProxy getLoginCts() throws Exception {
        CTSProxy proxy = new CTSProxy();
        setAPIMRequestConfiguration(proxy);
        setCTSAuthConfiguration(proxy);
        proxy.doLogin();
        return proxy;
    }

    @CacheInvalidate(cacheName = "ctsproxy-cache")
    public void clearCache() {
    }
}
