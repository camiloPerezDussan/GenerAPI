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
public class ModelResponse {

    @NotBlank
    @Schema(required = true, description = "Transaction ID", example = "145")
    private int transactionId;

    @NotBlank
    @Schema(required = true, description = "Scheduled transaction status:  \nA - ACTIVE  \nC - CANCELLED  \nF - FINISHED  \nCA - CANCELLED  \nEI - INFRASTRUCTURE ERROR  \nEJ - EXECUTED  \nER - ERROR  \nPN - PENDING", example = "A")
    private String transactionStatus;

    @NotBlank
    @Schema(required = true, description = "Scheduled transaction amount", example = "20.0")
    private double amount;

    @NotBlank
    @Schema(required = true, description = "Transaction date", example = "2021-08-13")
    private LocalDate transactionDate;

    @NotBlank
    @Schema(required = true, description = "It's scheduled:  \nfalse - NO SCHEDULED  \ntrue - SCHEDULED", example = "true")
    private boolean scheduled;
}
