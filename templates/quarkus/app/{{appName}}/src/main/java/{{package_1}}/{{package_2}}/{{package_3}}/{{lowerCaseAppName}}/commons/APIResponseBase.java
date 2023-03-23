package ${package}.commons;

import lombok.Getter;
import lombok.Setter;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
public class APIResponseBase {

    @JsonIgnore(value = true)
    @Schema(description = "Indicates if it was executed correctly")
    private boolean success;

    @Schema(description = "Errors list if occur")
    private List<APIResponseMessage> errors;

    public APIResponseBase() {
        this.success = true;
        this.errors = new ArrayList<>();
    }

    public void addError(int code, String message) {
        this.success = false;
        this.errors.add(new APIResponseMessage(code, message));
    }

    public void addError(int code, String message, String detail) {
        this.success = false;
        this.errors.add(new APIResponseMessage(code, message, detail));
    }

}
