package ${package}.config.exceptions;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import ${package}.commons.APIResponseMessage;

@Getter
@Setter
public class CustomBusinessException extends Exception {

    private List<APIResponseMessage> errors;

    public CustomBusinessException(List<APIResponseMessage> errors) {
        this.errors = errors;
    }
}
