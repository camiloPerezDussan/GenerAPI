package ${package}.application.v1.wsproxytemplate.back;

import lombok.Getter;
import lombok.Setter;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Getter
@Setter
public class ExternalServiceRequest {

    @Schema(required = true, description = "User")
    private String user;

    @Schema(required = true, description = "Password")
    private String password;

    @Schema(required = true, description = "Office")
    private String office;

    @Schema(required = true, description = "Role")
    private String role;

    @Schema(required = true, description = "Server")
    private String server;

    @Schema(required = true, description = "Terminal")
    private String terminal;

}
