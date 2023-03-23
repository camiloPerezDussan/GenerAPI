package ${package}.application.v1.wsproxytemplate.back;

import lombok.Getter;
import lombok.Setter;
import ${package}.commons.CTSResponseBase;

@Getter
@Setter
public class ExternalServiceResponse extends CTSResponseBase {

    private int idtransaccion;
    private String estadoTransaction;
    private double monto;
    private boolean programada;
    private String fecha;

}
