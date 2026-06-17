// src/pages/configuracion/Configuracion.jsx
import { useState } from 'react'
import {
  Settings, Info, Mail, ShieldCheck, Clock, KeyRound,
  RotateCcw, Contrast, Type, MousePointer2, CheckCircle2
} from 'lucide-react'
import { useAccessibility } from '../../hooks/useAccessibility'

// ── Estilos globales de animación ────────────────────────────────
const GLOBAL_STYLES = `
@keyframes cfg-fade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

// ── Acentos visuales por tipo de ajuste (solo presentación) ──────
const ACCENTS = {
  contraste: { from: '#14B8A6', to: '#06B6D4', tint: '#F0FDFA', border: '#CCFBF1', text: '#0F766E' },
  texto:     { from: '#3B82F6', to: '#60A5FA', tint: '#EFF6FF', border: '#DBEAFE', text: '#1E40AF' },
  cursor:    { from: '#8B5CF6', to: '#A78BFA', tint: '#F5F3FF', border: '#E9D5FF', text: '#6D28D9' },
}

// ════════════════════════════════════════════════════════════════
function Configuracion() {
  const {
    estado, contraste, texto, cursor,
    ciclarContraste, ciclarTexto, ciclarCursor,
    resetear, hayAlgoActivo,
  } = useAccessibility()

  const [hovReset, setHovReset] = useState(false)

  // ── Datos de sesión (lectura directa, sin nueva lógica) ────────
  const email = localStorage.getItem('email')
  const rolDisplay = localStorage.getItem('rol')?.replace('ROLE_', '')
  const inicialAvatar = email ? email.charAt(0).toUpperCase() : '?'

  // ── Resumen de ajustes activos (derivado, solo presentación) ───
  const resumenAjustes = [
    contraste.nivel > 0 && { label: 'Contraste', valor: contraste.label, accent: ACCENTS.contraste },
    texto.nivel > 0 && { label: 'Texto', valor: texto.label, accent: ACCENTS.texto },
    cursor.nivel > 0 && { label: 'Cursor', valor: cursor.nivel === 1 ? 'Cursor grande' : 'Máscara activa', accent: ACCENTS.cursor },
  ].filter(Boolean)
  const totalActivos = resumenAjustes.length

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: 24 }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC, #EFF6FF)',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Burbujas decorativas */}
        <div style={{ position: 'absolute', top: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(20,184,166,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -15, right: 140, width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,184,166,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Settings size={24} color="#fff" aria-hidden />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Configuración
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
              Accesibilidad y preferencias de tu cuenta
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: totalActivos > 0 ? '#fff' : 'transparent',
          border: totalActivos > 0 ? '1px solid #E2E8F0' : 'none',
          borderRadius: 10, padding: totalActivos > 0 ? '9px 16px' : 0
        }}>
          {totalActivos > 0 && (
            <>
              <CheckCircle2 size={15} color="#14B8A6" aria-hidden />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                {totalActivos} ajuste{totalActivos !== 1 ? 's' : ''} de accesibilidad activo{totalActivos !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Sección: Accesibilidad ─────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14,
        padding: 24, marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Settings size={18} color="#fff" aria-hidden />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Accesibilidad</h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Personaliza cómo se ve la plataforma para ti</p>
            </div>
          </div>

          {hayAlgoActivo && (
            <button
              onClick={resetear}
              onMouseEnter={() => setHovReset(true)}
              onMouseLeave={() => setHovReset(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', border: '1.5px solid #FECACA',
                color: '#EF4444', background: hovReset ? '#FEF2F2' : '#fff',
                borderRadius: 9, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <RotateCcw size={13} aria-hidden /> Restablecer todo
            </button>
          )}
        </div>

        {/* Nota informativa */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 10,
          padding: '12px 14px', marginBottom: 20
        }}>
          <Info size={15} color="#14B8A6" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: '#0F766E', margin: 0, lineHeight: 1.5 }}>
            También puedes ajustar estas opciones desde el botón flotante visible en toda la plataforma, incluso sin iniciar sesión.
          </p>
        </div>

        {/* Resumen de ajustes activos */}
        {totalActivos > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {resumenAjustes.map(({ label, valor, accent }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: accent.tint, border: `1px solid ${accent.border}`,
                color: accent.text, borderRadius: 99, padding: '5px 12px',
                fontSize: 12, fontWeight: 700
              }}>
                {label}: {valor}
              </span>
            ))}
          </div>
        )}

        {/* Grid de tarjetas de ajuste */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <SettingCard
            idx={0}
            Icono={Contrast}
            accent={ACCENTS.contraste}
            titulo="Contraste"
            descripcion="Ajusta el contraste de colores para mayor visibilidad. 3 modos disponibles."
            nivel={contraste.nivel}
            nivelMax={3}
            labelNivel={contraste.label}
            activo={contraste.nivel > 0}
            onClick={ciclarContraste}
          />
          <SettingCard
            idx={1}
            Icono={Type}
            accent={ACCENTS.texto}
            titulo="Tamaño de texto"
            descripcion="Aumenta el tamaño de la letra progresivamente. 4 niveles disponibles."
            nivel={texto.nivel}
            nivelMax={4}
            labelNivel={texto.label}
            activo={texto.nivel > 0}
            onClick={ciclarTexto}
          />
          <SettingCard
            idx={2}
            Icono={MousePointer2}
            accent={ACCENTS.cursor}
            titulo="Cursor y lectura"
            descripcion="Nivel 1: cursor grande. Nivel 2: cursor grande con máscara de lectura."
            nivel={cursor.nivel}
            nivelMax={2}
            labelNivel={cursor.nivel === 1 ? 'Cursor grande' : 'Máscara activa'}
            activo={cursor.nivel > 0}
            onClick={ciclarCursor}
          />
        </div>
      </div>

      {/* ── Sección: Perfil y sesión ────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden'
      }}>
        {/* Header con avatar */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA, #F8FAFC)',
          borderBottom: '1px solid #F1F5F9',
          padding: '22px 24px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #CCFBF1, #A5F3FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#0F766E'
          }}>
            {inicialAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0, wordBreak: 'break-word' }}>
              {email || 'Usuario no identificado'}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
              background: '#F0FDFA', border: '1px solid #CCFBF1', color: '#0F766E',
              borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700
            }}>
              <ShieldCheck size={11} aria-hidden /> {rolDisplay || 'Sin rol asignado'}
            </span>
          </div>
        </div>

        {/* Detalle de sesión */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px'
          }}>
            Información de Sesión
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <InfoFila icon={<Mail size={14} aria-hidden />} label="Correo electrónico" valor={email || '—'} />
            <InfoFila icon={<ShieldCheck size={14} aria-hidden />} label="Rol asignado" valor={rolDisplay || '—'} />
            <InfoFila icon={<Clock size={14} aria-hidden />} label="Cierre por inactividad" valor="30 minutos" />
            <InfoFila icon={<KeyRound size={14} aria-hidden />} label="Autenticación" valor="Token JWT — 24 horas" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta de ajuste de accesibilidad ───────────────────────────
function SettingCard({ idx, Icono, accent, titulo, descripcion, nivel, nivelMax, labelNivel, activo, onClick }) {
  const [hov, setHov] = useState(false)
  const puntos = Array.from({ length: nivelMax }, (_, i) => i + 1)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'left', width: '100%', background: '#fff',
        border: `1.5px solid ${activo ? accent.border : (hov ? '#CBD5E1' : '#E2E8F0')}`,
        borderRadius: 14, padding: 0, cursor: 'pointer', overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animation: 'cfg-fade 0.22s ease both',
        animationDelay: `${idx * 0.05}s`
      }}
    >
      {/* Barra superior */}
      <div style={{ height: 3, background: activo ? `linear-gradient(90deg, ${accent.from}, ${accent.to})` : '#F1F5F9' }} />

      <div style={{ padding: '18px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: activo ? `linear-gradient(135deg, ${accent.from}, ${accent.to})` : '#F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icono size={19} color={activo ? '#fff' : '#94A3B8'} aria-hidden />
          </div>
          {activo && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: accent.text, background: accent.tint,
              border: `1px solid ${accent.border}`, borderRadius: 99, padding: '3px 9px'
            }}>
              {labelNivel}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{titulo}</h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 14px', lineHeight: 1.45 }}>{descripcion}</p>

        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {puntos.map(p => (
            <span key={p} style={{
              height: 5, flex: 1, borderRadius: 99,
              background: p <= nivel ? accent.from : '#F1F5F9',
              transition: 'background 0.2s ease'
            }} />
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
          {activo ? `Nivel ${nivel} de ${nivelMax} — clic para avanzar` : 'Inactivo — clic para activar'}
        </p>
      </div>
    </button>
  )
}

// ── Fila de información de sesión ────────────────────────────────
function InfoFila({ icon, label, valor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#FAFBFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px'
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: '#F0FDFA', color: '#14B8A6',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: '2px 0 0', wordBreak: 'break-word' }}>
          {valor}
        </p>
      </div>
    </div>
  )
}

export default Configuracion
