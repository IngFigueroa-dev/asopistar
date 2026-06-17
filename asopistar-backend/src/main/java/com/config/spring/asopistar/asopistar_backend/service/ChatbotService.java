package com.config.spring.asopistar.asopistar_backend.service;

import com.config.spring.asopistar.asopistar_backend.dto.request.ChatMensajeRequestDTO;
import com.config.spring.asopistar.asopistar_backend.dto.response.ChatMensajeResponseDTO;
import org.springframework.security.core.Authentication;

public interface ChatbotService {
    ChatMensajeResponseDTO procesarMensaje(ChatMensajeRequestDTO dto, Authentication authentication);
}
