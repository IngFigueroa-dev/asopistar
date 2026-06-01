package com.config.spring.asopistar.asopistar_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Servicio de correo electrónico para ASOPISTAR.
 * Usa Gmail vía Spring Mail (SMTP con App Password).
 * Todos los métodos son @Async para no bloquear el hilo HTTP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    @Value("${app.url.frontend}")
    private String urlFrontend;

    // ── Correo de verificación de email ─────────────────────────────────────
    @Async
    public void enviarVerificacionEmail(String destinatario, String nombre, String token) {
        String enlace = urlFrontend + "/verificar-email?token=" + token;
        String asunto = "ASOPISTAR — Verifica tu correo electrónico";
        String cuerpo = construirPlantilla(
            "Hola, " + nombre + ".",
            "Gracias por registrarte en ASOPISTAR. Para activar tu solicitud de acceso, " +
            "haz clic en el botón de abajo para verificar tu correo electrónico.",
            "Verificar correo",
            enlace,
            "Este enlace expira en <strong>24 horas</strong>. Si no te registraste en ASOPISTAR, " +
            "ignora este mensaje."
        );
        enviar(destinatario, asunto, cuerpo);
    }

    // ── Correo de aprobación ─────────────────────────────────────────────────
    @Async
    public void enviarAprobacion(String destinatario, String nombre, String rolAsignado) {
        String asunto = "ASOPISTAR — Tu solicitud de acceso fue aprobada";
        String cuerpo = construirPlantilla(
            "¡Bienvenido/a, " + nombre + "!",
            "Tu solicitud de acceso ha sido <strong>aprobada</strong>. " +
            "Tu rol en el sistema es: <strong>" + formatearRol(rolAsignado) + "</strong>. " +
            "Ya puedes iniciar sesión con tu correo electrónico y la contraseña que registraste.",
            "Iniciar sesión",
            urlFrontend + "/login",
            "Si tienes algún inconveniente, comunícate con el administrador del sistema."
        );
        enviar(destinatario, asunto, cuerpo);
    }

    // ── Correo de rechazo ────────────────────────────────────────────────────
    @Async
    public void enviarRechazo(String destinatario, String nombre, String motivo) {
        String asunto = "ASOPISTAR — Tu solicitud de acceso no fue aprobada";
        String motivoHtml = (motivo != null && !motivo.isBlank())
            ? "<br><br><strong>Motivo:</strong> " + motivo
            : "";
        String cuerpo = construirPlantilla(
            "Hola, " + nombre + ".",
            "Lamentamos informarte que tu solicitud de acceso a ASOPISTAR " +
            "<strong>no fue aprobada</strong> en este momento." + motivoHtml,
            "Contactar administrador",
            "mailto:" + remitente,
            "Si crees que esto es un error, comunícate con el administrador del sistema."
        );
        enviar(destinatario, asunto, cuerpo);
    }

    // ── Correo de reenvío de verificación ────────────────────────────────────
    @Async
    public void reenviarVerificacion(String destinatario, String nombre, String token) {
        enviarVerificacionEmail(destinatario, nombre, token);
    }

    // ── Correo de restablecimiento de contraseña (por admin) ─────────────────
    @Async
    public void enviarContrasenaRestablecida(String destinatario, String nombre) {
        String asunto = "ASOPISTAR — Tu contraseña fue restablecida";
        String cuerpo = construirPlantilla(
            "Hola, " + nombre + ".",
            "El administrador del sistema ha restablecido tu contraseña. " +
            "Inicia sesión con tu nueva contraseña temporal y cámbiala lo antes posible.",
            "Iniciar sesión",
            urlFrontend + "/login",
            "Si no solicitaste este cambio, comunícate inmediatamente con el administrador."
        );
        enviar(destinatario, asunto, cuerpo);
    }

    // ── Envío genérico ────────────────────────────────────────────────────────
    private void enviar(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, "ASOPISTAR — Gestión Piscícola");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML
            mailSender.send(mensaje);
            log.info("Correo enviado a: {} — Asunto: {}", destinatario, asunto);
        } catch (MessagingException e) {
            log.error("Error enviando correo a {}: {}", destinatario, e.getMessage());
        } catch (Exception e) {
            log.error("Error inesperado en servicio de correo: {}", e.getMessage());
        }
    }

    // ── Plantilla HTML reutilizable ───────────────────────────────────────────
    private String construirPlantilla(String titulo, String mensaje,
                                      String textoBoton, String urlBoton,
                                      String pieTexto) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:12px;overflow:hidden;
                                  box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                      <!-- Cabecera -->
                      <tr>
                        <td style="background:#1a2332;padding:28px 40px;text-align:center;">
                          <p style="margin:0;font-size:28px;">🐟</p>
                          <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:800;
                                     letter-spacing:1px;">ASOPISTAR</h1>
                          <p style="margin:4px 0 0;color:#5eead4;font-size:13px;">
                            Gestión Piscícola
                          </p>
                        </td>
                      </tr>
                      <!-- Cuerpo -->
                      <tr>
                        <td style="padding:40px;">
                          <h2 style="margin:0 0 16px;color:#1a2332;font-size:18px;">
                            %s
                          </h2>
                          <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
                            %s
                          </p>
                          <div style="text-align:center;margin-bottom:32px;">
                            <a href="%s"
                               style="display:inline-block;background:#0d9488;color:#ffffff;
                                      text-decoration:none;padding:14px 32px;border-radius:8px;
                                      font-size:15px;font-weight:700;">
                              %s
                            </a>
                          </div>
                          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">
                            %s
                          </p>
                        </td>
                      </tr>
                      <!-- Pie -->
                      <tr>
                        <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;
                                   text-align:center;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">
                            Asociación de Piscicultores del Tarra — Catatumbo, Colombia
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(titulo, mensaje, urlBoton, textoBoton, pieTexto);
    }

    // Convierte "ROLE_GERENTE_PLANTA" → "Gerente de Planta"
    private String formatearRol(String rol) {
        return switch (rol.replace("ROLE_", "")) {
            case "ADMINISTRADOR_GENERAL" -> "Administrador General";
            case "PRODUCTOR"             -> "Productor";
            case "BIOLOGO"               -> "Biólogo";
            case "GERENTE_PLANTA"        -> "Gerente de Planta";
            case "PERSONAL_CUARTO_FRIO"  -> "Personal de Cuarto Frío";
            case "CONTADORA"             -> "Contadora";
            case "SECRETARIA"            -> "Secretaria";
            case "GERENTE_COMERCIAL"     -> "Gerente Comercial";
            case "VENDEDOR_INSUMOS"      -> "Vendedor de Insumos";
            default                      -> rol;
        };
    }
}
