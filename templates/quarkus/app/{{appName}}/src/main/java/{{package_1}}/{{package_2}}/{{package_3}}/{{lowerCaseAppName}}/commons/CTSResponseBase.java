package ${package}.commons;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CTSResponseBase {

    private boolean success;
    private List<CobisMessageDto> messages;

}
