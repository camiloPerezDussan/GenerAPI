package ${package}.commons;

import java.util.ArrayList;
import java.util.List;
import javax.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import pa.com.globalbank.belcp.ctsrestapi.CTSMessage;
import pa.com.globalbank.belcp.ctsrestapi.CTSResponse;
import pa.com.globalbank.belcp.utils.errors.ErrorUtil;
import pa.com.globalbank.belcp.utils.errors.MessageLocalizationException;

@ApplicationScoped
public class Util {
    @ConfigProperty(name = "datasource.url")
    private String MESSAGES_DS_URL;

    @ConfigProperty(name = "datasource.name")
    private String MESSAGES_DS_NAME;

    @ConfigProperty(name = "datasource.user")
    private String MESSAGES_DS_USER;

    @ConfigProperty(name = "datasource.pass")
    private String MESSAGES_DS_PASSWORD;

    public List<APIResponseMessage> makeError(Object ctsResponse, String language) {
        List<APIResponseMessage> response = new ArrayList<APIResponseMessage>();
        ErrorUtil errorUtil = null;
        try {
            errorUtil = new ErrorUtil(MESSAGES_DS_URL, MESSAGES_DS_USER, MESSAGES_DS_PASSWORD, MESSAGES_DS_NAME,
                    language == null || language.isEmpty() ? Constants.ES : language.trim().toLowerCase());
            if (ctsResponse instanceof CTSResponse) {
                List<CTSMessage> messages = ((CTSResponse) ctsResponse).getMessages().stream().toList();
                for (CTSMessage msg : messages) {
                    errorUtil.searchForLocalizedError(Constants.INFI, msg.getCode());
                    response.add(new APIResponseMessage(errorUtil.getErrorCode(), errorUtil.getErrorDescription(), msg.getMessage()));
                }
            } else if (ctsResponse instanceof CTSResponseBase) {
                List<CobisMessageDto> messages = ((CTSResponseBase) ctsResponse).getMessages();
                for (CobisMessageDto msg : messages) {
                    errorUtil.searchForLocalizedError(Constants.INFI, msg.getCode());
                    response.add(new APIResponseMessage(errorUtil.getErrorCode(), errorUtil.getErrorDescription(), msg.getMessage()));
                }
            }
        } catch (MessageLocalizationException e) {
            response.add(new APIResponseMessage(500, e.getMessage(), e.getLocalizedMessage()));
        } finally {
            try {
                if (errorUtil != null) {
                    errorUtil.disconnect();
                }
            } catch (MessageLocalizationException e) {
                response.add(new APIResponseMessage(500, e.getMessage(), e.getLocalizedMessage()));
            }
        }
        return response;
    }
}
