package ${package}.application.v1.front;

import java.time.LocalDate;

import javax.validation.constraints.NotBlank;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModelRequest {
    @NotBlank
    @Schema(required = true, description = "It's scheduled:  \nfalse - NO SCHEDULED  \ntrue - SCHEDULED", example = "true")
    private boolean scheduled;

    @NotBlank
    @Schema(required = true, description = "Unique code that relates the customer", example = "13991165581")
    private int coreCustomerId;

    @NotBlank
    @Schema(required = false, description = "Operator identifier", example = "Prueba")
    private String customerId;

    @NotBlank
    @Schema(required = false, description = "Recurrence End date", example = "2021-01-01")
    private LocalDate recurrenceEndDate;

    @NotBlank
    @Schema(required = true, description = "Transaction amount", example = "4")
    private double amount;
}
