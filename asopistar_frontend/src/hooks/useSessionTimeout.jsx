import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TIEMPO_INACTIVIDAD = 30 * 60 * 1000 // 30 minutos en milisegundos

function useSessionTimeout() {
  const navigate = useNavigate()

  const cerrarSesion = useCallback(() => {
    localStorage.clear()
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    let timer = setTimeout(cerrarSesion, TIEMPO_INACTIVIDAD)

    // Reinicia el timer con cada interacción del usuario
    const reiniciarTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(cerrarSesion, TIEMPO_INACTIVIDAD)
    }

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    eventos.forEach(e => window.addEventListener(e, reiniciarTimer))

    return () => {
      clearTimeout(timer)
      eventos.forEach(e => window.removeEventListener(e, reiniciarTimer))
    }
  }, [cerrarSesion])
}

export default useSessionTimeout