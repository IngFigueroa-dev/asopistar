package com.config.spring.asopistar.asopistar_backend.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Integración con la API de Gemini (Google AI Studio).
 * Toda la lógica de negocio existente queda intacta: esta clase es nueva
 * y nadie más del proyecto la usa ni la referencia.
 *
 * Endpoint y modelo verificados contra la documentación oficial vigente
 * (v1beta, header x-goog-api-key, modelo "gemini-2.5-flash" — gratuito).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiClient {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelo;

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    /**
     * @param systemInstruction la "personalidad" + reglas de ASOPI AI + contexto operativo
     * @param contents          el historial de la conversación en formato Gemini
     *                          (lista de { "role": "user"|"model", "parts": [{ "text": "..." }] })
     */
    public String generarRespuesta(String systemInstruction, List<Map<String, Object>> contents) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("PEGA_AQUI_TU_API_KEY")) {
            log.warn("gemini.api.key no está configurada en application.properties");
            return "ASOPI AI no está configurado todavía: falta la API key de Gemini en el servidor.";
        }

        String url = BASE_URL + modelo + ":generateContent";

        Map<String, Object> body = new HashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        body.put("contents", contents);
        // Temperatura baja: respuestas más consistentes y menos "creativas",
        // adecuado para un asistente operativo que no debe inventar datos.
        body.put("generationConfig", Map.of("temperature", 0.4, "maxOutputTokens", 800));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return extraerTexto(response.getBody());
        } catch (RestClientException ex) {
            log.error("Error llamando a la API de Gemini: {}", ex.getMessage());
            return "No pude conectarme con el asistente de IA en este momento. Intenta de nuevo en unos segundos.";
        }
    }

    @SuppressWarnings("unchecked")
    private String extraerTexto(Map<String, Object> respuesta) {
        try {
            List<Map<String, Object>> candidatos = (List<Map<String, Object>>) respuesta.get("candidates");
            Map<String, Object> contenido = (Map<String, Object>) candidatos.get(0).get("content");
            List<Map<String, Object>> partes = (List<Map<String, Object>>) contenido.get("parts");
            String texto = (String) partes.get(0).get("text");
            return texto != null ? texto.trim() : "No recibí una respuesta del asistente. Intenta de nuevo.";
        } catch (Exception e) {
            log.error("Respuesta inesperada de Gemini: {}", respuesta);
            return "Recibí una respuesta inesperada del asistente de IA. Intenta reformular tu pregunta.";
        }
    }
}
