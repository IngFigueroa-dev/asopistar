// src/hooks/useAccessibility.js
import { useState, useEffect, useCallback } from 'react'

const CONTRASTE_NIVELES = [
  { nivel: 0, clase: null,               label: 'Contraste' },
  { nivel: 1, clase: 'contraste-inv',    label: 'Invertido' },
  { nivel: 2, clase: 'contraste-oscuro', label: 'Oscuro'    },
  { nivel: 3, clase: 'contraste-luz',    label: 'Luz'       },
]

const TEXTO_NIVELES = [
  { nivel: 0, clase: null,        label: 'Texto'   },
  { nivel: 1, clase: 'texto-md',  label: 'Mediano' },
  { nivel: 2, clase: 'texto-lg',  label: 'Grande'  },
  { nivel: 3, clase: 'texto-xl',  label: 'Extra'   },
  { nivel: 4, clase: 'texto-2xl', label: 'Máximo'  },
]

// Nivel 1: cursor grande | Nivel 2: cursor grande + máscara de lectura
const CURSOR_NIVELES = [
  { nivel: 0, clase: null,           label: 'Cursor'  },
  { nivel: 1, clase: 'cursor-grande', label: 'Grande' },
  { nivel: 2, clase: 'cursor-grande', label: 'Máscara'},
]

const STORAGE_KEY = 'asopistar_accesibilidad'

const estadoInicial = () => {
  try {
    const g = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { contraste: g.contraste ?? 0, texto: g.texto ?? 0, cursor: g.cursor ?? 0 }
  } catch { return { contraste: 0, texto: 0, cursor: 0 } }
}

const CLASES_CONTRASTE = CONTRASTE_NIVELES.map(n => n.clase).filter(Boolean)
const CLASES_TEXTO     = TEXTO_NIVELES.map(n => n.clase).filter(Boolean)
const CLASES_CURSOR    = ['cursor-grande']

const aplicarClases = ([claseContraste, claseTexto, claseCursor]) => {
  document.body.classList.remove(...CLASES_CONTRASTE, ...CLASES_TEXTO, ...CLASES_CURSOR)
  if (claseContraste) document.body.classList.add(claseContraste)
  if (claseTexto)     document.body.classList.add(claseTexto)
  if (claseCursor)    document.body.classList.add(claseCursor)
}

const aplicarHtmlFontSize = (nivelTexto) => {
  const sizes = { 0: '', 1: '18px', 2: '22px', 3: '26px', 4: '30px' }
  document.documentElement.style.fontSize = sizes[nivelTexto] || ''
}

export function useAccessibility() {
  const [estado, setEstado] = useState(estadoInicial)

  useEffect(() => {
    const e = estadoInicial()
    aplicarClases([
      CONTRASTE_NIVELES[e.contraste]?.clase,
      TEXTO_NIVELES[e.texto]?.clase,
      CURSOR_NIVELES[e.cursor]?.clase,
    ])
    aplicarHtmlFontSize(e.texto)
  }, [])

  const guardarYAplicar = useCallback((nuevoEstado) => {
    setEstado(nuevoEstado)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoEstado))
    aplicarClases([
      CONTRASTE_NIVELES[nuevoEstado.contraste]?.clase,
      TEXTO_NIVELES[nuevoEstado.texto]?.clase,
      CURSOR_NIVELES[nuevoEstado.cursor]?.clase,
    ])
    aplicarHtmlFontSize(nuevoEstado.texto)
  }, [])

  const ciclarContraste = useCallback(() => {
    guardarYAplicar({ ...estado, contraste: (estado.contraste + 1) % CONTRASTE_NIVELES.length })
  }, [estado, guardarYAplicar])

  const ciclarTexto = useCallback(() => {
    guardarYAplicar({ ...estado, texto: (estado.texto + 1) % TEXTO_NIVELES.length })
  }, [estado, guardarYAplicar])

  const ciclarCursor = useCallback(() => {
    guardarYAplicar({ ...estado, cursor: (estado.cursor + 1) % CURSOR_NIVELES.length })
  }, [estado, guardarYAplicar])

  const resetear = useCallback(() => {
    guardarYAplicar({ contraste: 0, texto: 0, cursor: 0 })
  }, [guardarYAplicar])

  return {
    estado,
    contraste: CONTRASTE_NIVELES[estado.contraste],
    texto:     TEXTO_NIVELES[estado.texto],
    cursor:    CURSOR_NIVELES[estado.cursor],
    ciclarContraste,
    ciclarTexto,
    ciclarCursor,
    resetear,
    hayAlgoActivo: estado.contraste > 0 || estado.texto > 0 || estado.cursor > 0,
    mascaraActiva: estado.cursor === 2,
  }
}
