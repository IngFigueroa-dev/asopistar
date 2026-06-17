package com.config.spring.asopistar.asopistar_backend.controller;

import com.config.spring.asopistar.asopistar_backend.dto.request.ChatMensajeRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ChatMensajeResponseDTO;
import com.config.spring.asopistar.asopistar_backend.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    // No se necesita ninguna regla nueva en SecurityConfig: el catch-all
    // ".anyRequest().authenticated()" ya cubre /chatbot/** para cualquier
    // usuario logueado, sin importar su rol.
    @PostMapping("/mensaje")
    public ResponseEntity<ChatMensajeResponseDTO> enviarMensaje(
            @Valid @RequestBody ChatMensajeRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(chatbotService.procesarMensaje(dto, authentication));
    }
}
