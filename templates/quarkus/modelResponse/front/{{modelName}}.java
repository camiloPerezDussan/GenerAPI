package {{importPackage}}.{{lowerCaseAppName}}.application.{{version}}.front;

import javax.validation.constraints.NotBlank;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
{{imports}}
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class {{modelName}} {
    {{{parameters}}}
}
