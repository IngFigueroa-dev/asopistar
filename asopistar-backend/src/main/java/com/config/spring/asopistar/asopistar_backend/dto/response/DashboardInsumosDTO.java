package com.config.spring.asopistar.asopistar_backend.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardInsumosDTO {
    private Long       totalInsumos;
    private Long       insumosActivos;
    private Long       insumosBajoStock;       // stock_actual <= stock_minimo
    private Long       ventasMes;              // cantidad de ventas este mes
    private BigDecimal valorVentasMes;         // valor total vendido este mes
    private Long       ventasTotal;            // total histórico de ventas
}
