package com.config.spring.asopistar.asopistar_backend.service.impl;

import com.config.spring.asopistar.asopistar_backend.dto.request.ChatMensajeRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.request.ChatTurnoDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ChatMensajeResponseDTO;
import com.config.spring.asopistar.asopistar_backend.integration.GeminiClient;
import com.config.spring.asopistar.asopistar_backend.repository.LoteCuartoFrioRepository;
import com.config.spring.asopistar.asopistar_backend.repository.PagoProductorRepository;
import com.config.spring.asopistar.asopistar_backend.repository.SiembraRepository;
import com.config.spring.asopistar.asopistar_backend.repository.TurnoPescaRepository;
import com.config.spring.asopistar.asopistar_backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final GeminiClient geminiClient;

    // ──────────────────────────────────────────────────────────────────────
    // ⚠️ SUPUESTO A VERIFICAR: estos 4 repositorios solo se usan para construir
    // el "contexto operativo" (Nivel 2 — datos reales). Se asume que las
    // entidades siguen el mismo patrón camelCase que Especie/EspecieServiceImpl
    // (ej. siembra.getEstado(), loteCuartoFrio.getKilos()). Si el proyecto no
    // compila después de pegar este archivo, el error señalará exactamente la
    // línea con el getter que no coincide con el nombre real del campo —
    // bastará con ajustar ese nombre. Si prefieres no arriesgar nada hasta
    // verificarlo, comenta el contenido de construirContextoOperativo() y
    // deja el "return" vacío: ASOPI AI seguirá funcionando como asistente
    // conversacional (Nivel 1), solo sin los números en vivo.
    // ──────────────────────────────────────────────────────────────────────
    private final SiembraRepository siembraRepository;
    private final LoteCuartoFrioRepository loteCuartoFrioRepository;
    private final PagoProductorRepository pagoProductorRepository;
    private final TurnoPescaRepository turnoPescaRepository;

    private static final String PERSONA = """
        Eres ASOPI AI, el asistente inteligente oficial de ASOPISTAR.
        ASOPISTAR es una asociación piscícola ubicada en el Catatumbo, Colombia,
        dedicada a la producción, procesamiento y comercialización de pescado (principalmente cachama).

        Tu función es ayudar a los usuarios del sistema ASOPISTAR a resolver dudas relacionadas con:
        producción piscícola, siembras, alevinos, estanques, alimentación de peces,
        seguimientos biológicos, turnos de pesca, cosechas, recepción de pescado,
        procesamiento, cuarto frío, logística y despachos, comercialización,
        pagos a productores, inventario de insumos y uso del software ASOPISTAR.

        Roles que pueden interactuar contigo: Administrador General, Secretaria, Biólogo,
        Productor, Gerente de Planta, Gerente Comercial, Contadora, Vendedor de Insumos.

        Debes responder de forma clara, profesional, amigable, breve y orientada a la acción.

        Cuando un usuario pregunte por procesos del sistema, explica paso a paso cómo realizar la tarea.
        Cuando un usuario pregunte sobre producción piscícola, responde con buenas prácticas técnicas.
        Si no tienes suficiente información para responder, solicita los datos necesarios antes de continuar.

        REGLA CRÍTICA: nunca inventes información. Nunca generes datos de producción, pagos
        o inventarios si no fueron proporcionados en el "contexto operativo" de este mensaje
        o por el propio usuario. Si la pregunta requiere datos que no aparecen en ese contexto,
        dilo explícitamente y sugiere en qué módulo del sistema puede consultarlos.

        Ejemplos de estilo:
        Usuario: "¿Cuántas siembras activas tengo?"
        Respuesta esperada (si hay contexto operativo): responde con el número exacto del contexto.
        Usuario: "Tengo mortalidad alta en un estanque"
        Respuesta: "Las causas más comunes son problemas de oxígeno, calidad del agua, alimentación
        o enfermedades. Indícame el porcentaje de mortalidad y la edad de los peces para ayudarte mejor."
        Usuario: "¿Cómo registro una recepción?"
        Respuesta: "Dirígete al módulo Recepciones → Nueva Recepción → selecciona el productor →
        registra los kilos recibidos → guarda la información."
        """;

    @Override
    public ChatMensajeResponseDTO procesarMensaje(ChatMensajeRequestDTO dto, Authentication authentication) {
        String rol = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse("DESCONOCIDO");
        String email = authentication.getName();

        String systemInstruction = PERSONA
            + "\n\nUsuario actual: " + email + " — Rol: " + rol
            + "\n\n" + construirContextoOperativo();

        List<Map<String, Object>> contents = new ArrayList<>();
        if (dto.getHistorial() != null) {
            for (ChatTurnoDTO turno : dto.getHistorial()) {
                contents.add(Map.of(
                    "role", turno.getRol(),
                    "parts", List.of(Map.of("text", turno.getContenido()))
                ));
            }
        }
        contents.add(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", dto.getMensaje()))
        ));

        String respuesta = geminiClient.generarRespuesta(systemInstruction, contents);

        return ChatMensajeResponseDTO.builder()
            .respuesta(respuesta)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Construye un resumen de datos reales del sistema para que ASOPI AI
     * pueda responder preguntas de Nivel 2 ("¿cuántas siembras activas hay?",
     * "analiza la producción actual") sin inventar números.
     *
     * Cada bloque está aislado en su propio try/catch: si una consulta falla
     * en tiempo de ejecución (por ejemplo la tabla está vacía o hay un dato
     * nulo), el resto del contexto se sigue construyendo igual.
     */
    private String construirContextoOperativo() {
        StringBuilder sb = new StringBuilder(
            "Contexto operativo actual del sistema (úsalo solo si la pregunta lo requiere, " +
            "nunca lo menciones si no aplica a la pregunta):\n"
        );

        try {
            long siembrasActivas = siembraRepository.findAll().stream()
                .filter(s -> "EN_CURSO".equalsIgnoreCase(s.getEstado()))
                .count();
            sb.append("- Siembras activas (EN_CURSO): ").append(siembrasActivas).append("\n");
        } catch (Exception e) {
            log.warn("No se pudo calcular siembras activas para el contexto del chatbot", e);
        }

        try {
            var lotes = loteCuartoFrioRepository.findAll();
            long lotesDisponibles = lotes.stream()
                .filter(l -> Boolean.TRUE.equals(l.getEstado()))
                .count();
            double kilosDisponibles = lotes.stream()
                .filter(l -> Boolean.TRUE.equals(l.getEstado()))
                .mapToDouble(l -> l.getKilos() != null ? l.getKilos().doubleValue() : 0)
                .sum();
            sb.append("- Lotes disponibles en cuarto frío: ").append(lotesDisponibles)
              .append(" (").append(kilosDisponibles).append(" kg)\n");
        } catch (Exception e) {
            log.warn("No se pudo calcular el estado del cuarto frío para el contexto del chatbot", e);
        }

        try {
            long pagosPendientes = pagoProductorRepository.findAll().stream()
                .filter(p -> "PENDIENTE".equalsIgnoreCase(p.getEstado()))
                .count();
            sb.append("- Pagos a productor pendientes: ").append(pagosPendientes).append("\n");
        } catch (Exception e) {
            log.warn("No se pudo calcular pagos pendientes para el contexto del chatbot", e);
        }

        try {
            var turnos = turnoPescaRepository.findAll();
            long turnosPendientes = turnos.stream()
                .filter(t -> "PENDIENTE".equalsIgnoreCase(t.getEstado()))
                .count();
            long emergencias = turnos.stream()
                .filter(t -> "EMERGENCIA".equalsIgnoreCase(t.getTipoPrioridad()))
                .count();
            sb.append("- Turnos de pesca pendientes: ").append(turnosPendientes)
              .append(" (").append(emergencias).append(" de emergencia)\n");
        } catch (Exception e) {
            log.warn("No se pudo calcular turnos de pesca para el contexto del chatbot", e);
        }

        return sb.toString();
    }
}
