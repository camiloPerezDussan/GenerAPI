package ${package}.commons;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Getter
@Setter
@AllArgsConstructor
public class APIResponseMessage {

    @Schema(description = "Error code")
    private int code;

    @Schema(description = "Error description")
    private String message;

    @Schema(description = "Error detail")
    private String detail;

    public APIResponseMessage(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
