// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'
import api from '../services/api'

// Sugerencias rápidas que aparecen cuando la conversación está vacía.
// Cubren los tres niveles que describimos: consulta simple, análisis y predicción.
const SUGERENCIAS = [
  '¿Cuántas siembras activas hay?',
  'Analiza la producción actual',
  '¿Cómo registro una recepción?',
]

function PuntoEscribiendo({ delay }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full bg-teal-500"
      style={{ animation: `asopiTypingDot 1.2s ${delay}s infinite ease-in-out` }}
    />
  )
}

function Mensaje({ rol, contenido, esError }) {
  const esUsuario = rol === 'user'
  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${esUsuario
            ? 'bg-teal-600 text-white rounded-br-md'
            : esError
              ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-md'
              : 'bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-md'}
        `}
      >
        {contenido}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const panelRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const nombre = (localStorage.getItem('nombre') || 'Usuario').split(' ')[0]

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, cargando])

  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])

  const enviarMensaje = async (texto) => {
    const mensajeLimpio = texto.trim()
    if (!mensajeLimpio || cargando) return

    const historial = mensajes.slice(-10).map(m => ({ rol: m.rol, contenido: m.contenido }))
    const nuevosMensajes = [...mensajes, { rol: 'user', contenido: mensajeLimpio }]
    setMensajes(nuevosMensajes)
    setInput('')
    setCargando(true)

    try {
      const { data } = await api.post('/chatbot/mensaje', {
        mensaje: mensajeLimpio,
        historial,
      })
      setMensajes(actuales => [...actuales, { rol: 'model', contenido: data.respuesta }])
    } catch (error) {
      const detalle = error?.response?.data?.message
      setMensajes(actuales => [...actuales, {
        rol: 'model',
        esError: true,
        contenido: detalle || 'No pude conectarme con el asistente en este momento. Intenta de nuevo en unos segundos.',
      }])
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    enviarMensaje(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje(input)
    }
  }

  return (
    <div
      ref={panelRef}
      id="asopi-chat-widget"
      className="fixed bottom-24 right-4 z-[9997] flex flex-col items-end gap-2"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {abierto && (
        <div
          id="asopi-chat-panel"
          className="w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ animation: 'asopiPanelIn 0.18s ease-out' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.25)' }}
              >
                <Bot size={17} color="#14B8A6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">ASOPI AI</p>
                <p className="text-[11px] mt-0.5 leading-none" style={{ color: '#14B8A6' }}>
                  Asistente piscícola
                </p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
            {mensajes.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="bg-gray-100 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-700 max-w-[85%]">
                  Hola{nombre !== 'Usuario' ? `, ${nombre}` : ''} 👋 Soy ASOPI AI. Puedo ayudarte con siembras,
                  estanques, turnos de pesca, cuarto frío, pagos y el uso del sistema. ¿En qué te ayudo?
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {SUGERENCIAS.map(s => (
                    <button
                      key={s}
                      onClick={() => enviarMensaje(s)}
                      className="text-left text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 hover:bg-teal-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mensajes.map((m, i) => (
              <Mensaje key={i} rol={m.rol} contenido={m.contenido} esError={m.esError} />
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <PuntoEscribiendo delay={0} />
                  <PuntoEscribiendo delay={0.15} />
                  <PuntoEscribiendo delay={0.3} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-100 p-3 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                rows={1}
                className="flex-1 resize-none text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent max-h-24"
              />
              <button
                type="submit"
                disabled={!input.trim() || cargando}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-teal-600 text-white hover:bg-teal-700"
                title="Enviar"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              ASOPI AI puede cometer errores. Verifica los datos importantes.
            </p>
          </form>
        </div>
      )}

      <button
        onClick={() => setAbierto(a => !a)}
        title="ASOPI AI — Asistente inteligente"
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-200
          ${abierto
            ? 'bg-teal-600 text-white ring-2 ring-teal-300'
            : 'bg-[#0F172A] text-white hover:bg-teal-600'}
        `}
      >
        {abierto ? <X size={22} /> : <Bot size={24} />}
      </button>
    </div>
  )
}
