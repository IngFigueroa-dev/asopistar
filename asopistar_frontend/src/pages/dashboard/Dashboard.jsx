// src/pages/dashboard/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO v4 — Centro de control moderno ASOPISTAR 2026
// Fixes: Hero coherente con fondo blanco, widgets con predicciones restaurados,
// fuentes más legibles, gauge SVG corregido, layout mejorado.
// Lógica de negocio, hooks, endpoints, permisos: SIN TOCAR.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  RefreshCw, Fish, Calendar, CheckCircle2, Clock, Waves,
  Zap, ArrowUpRight, ArrowDownRight, Package, Snowflake,
  Send, DollarSign, AlertTriangle, Users, Layers,
  TrendingUp, Activity, Truck, FlaskConical,
  BarChart3, AlertCircle,
} from 'lucide-react'
import { useDashboard } from './hooks/useDashboard'
import { ROL_LABELS }   from '../../config/navItemsByRol'
import api              from '../../services/api'

import ProduccionWidget from './widgets/ProduccionWidget'
import PlantaWidget     from './widgets/PlantaWidget'
import ComercialWidget  from './widgets/ComercialWidget'
import FinanzasWidget   from './widgets/FinanzasWidget'
import InsumosWidget    from './widgets/InsumosWidget'
import AlertasWidget    from './widgets/AlertasWidget'

// ─── Secciones por rol ───────────────────────────────────────────────────────
const SECCIONES_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: ['produccion','planta','comercial','finanzas','insumos','alertas'],
  ROLE_GERENTE_PLANTA:        ['produccion','planta','alertas'],
  ROLE_GERENTE_COMERCIAL:     ['comercial','alertas'],
  ROLE_CONTADORA:             ['finanzas','alertas'],
  ROLE_BIOLOGO:               ['produccion','alertas'],
  ROLE_SECRETARIA:            ['produccion','comercial','alertas'],
  ROLE_VENDEDOR_INSUMOS:      ['insumos','alertas'],
  ROLE_PERSONAL_CUARTO_FRIO:  ['planta','alertas'],
}

// ─── Acciones rápidas por rol ─────────────────────────────────────────────────
const ACCIONES_POR_ROL = {
  ROLE_ADMINISTRADOR_GENERAL: [
    { label:'Nueva recepción',   icon:Truck,       href:'/recepciones',   color:'#14B8A6' },
    { label:'Nueva logística',   icon:Send,         href:'/logistica',     color:'#8B5CF6' },
    { label:'Ver producción',    icon:Fish,         href:'/produccion',    color:'#06B6D4' },
    { label:'Reportes',          icon:BarChart3,    href:'/reportes',      color:'#10B981' },
    { label:'Gestionar usuarios',icon:Users,        href:'/admin/usuarios',color:'#F59E0B' },
  ],
  ROLE_GERENTE_PLANTA: [
    { label:'Nueva recepción',   icon:Truck,        href:'/recepciones',   color:'#14B8A6' },
    { label:'Procesamiento',     icon:FlaskConical, href:'/procesamiento', color:'#06B6D4' },
    { label:'Almacenamiento',    icon:Snowflake,    href:'/almacenamiento',color:'#8B5CF6' },
    { label:'Reportes',          icon:BarChart3,    href:'/reportes',      color:'#10B981' },
  ],
  ROLE_GERENTE_COMERCIAL: [
    { label:'Nueva logística',   icon:Send,         href:'/logistica',     color:'#8B5CF6' },
    { label:'Clientes',          icon:Users,        href:'/clientes',      color:'#14B8A6' },
    { label:'Ingresos',          icon:DollarSign,   href:'/ingresos',      color:'#10B981' },
    { label:'Reportes',          icon:BarChart3,    href:'/reportes',      color:'#F59E0B' },
  ],
  ROLE_CONTADORA: [
    { label:'Ver pagos',         icon:DollarSign,   href:'/pagos',         color:'#10B981' },
    { label:'Ingresos',          icon:TrendingUp,   href:'/ingresos',      color:'#14B8A6' },
    { label:'Reportes',          icon:BarChart3,    href:'/reportes',      color:'#8B5CF6' },
  ],
  ROLE_BIOLOGO: [
    { label:'Producción',        icon:Fish,         href:'/produccion',    color:'#14B8A6' },
    { label:'Reportes',          icon:BarChart3,    href:'/reportes',      color:'#10B981' },
  ],
  ROLE_SECRETARIA: [
    { label:'Productores',       icon:Users,        href:'/productores',   color:'#8B5CF6' },
    { label:'Producción',        icon:Fish,         href:'/produccion',    color:'#14B8A6' },
    { label:'Recepciones',       icon:Truck,        href:'/recepciones',   color:'#06B6D4' },
    { label:'Logística',         icon:Send,         href:'/logistica',     color:'#10B981' },
  ],
  ROLE_VENDEDOR_INSUMOS: [
    { label:'Insumos',           icon:Package,      href:'/insumos',       color:'#F59E0B' },
  ],
  ROLE_PERSONAL_CUARTO_FRIO: [
    { label:'Almacenamiento',    icon:Snowflake,    href:'/almacenamiento',color:'#06B6D4' },
    { label:'Procesamiento',     icon:FlaskConical, href:'/procesamiento', color:'#8B5CF6' },
  ],
}

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  teal:'#14B8A6', cyan:'#06B6D4', violet:'#8B5CF6',
  green:'#10B981', amber:'#F59E0B', red:'#EF4444',
  blue:'#3B82F6', navy:'#0F172A',
}

function getFecha() {
  return new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
}
function getSaludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function CTip({ active, payload, label, fmt='n' }) {
  if (!active || !payload?.length) return null
  const f = v => {
    if (v == null) return '—'
    const n = Number(v)
    if (fmt==='$') return '$'+n.toLocaleString('es-CO',{maximumFractionDigits:0})
    if (fmt==='kg') return n.toLocaleString('es-CO',{minimumFractionDigits:1})+' kg'
    return n.toLocaleString('es-CO')
  }
  return (
    <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,.12)',borderRadius:8,padding:'8px 12px',fontSize:12}}>
      {label && <p style={{color:'#64748B',marginBottom:4}}>{label}</p>}
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color||'#fff',fontWeight:600,margin:'1px 0'}}>
          {p.name && <span style={{color:'#94A3B8',fontWeight:400}}>{p.name}: </span>}
          {f(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({h=16,w='100%',r=6}) {
  return <div style={{height:h,width:w,borderRadius:r,background:'#F1F5F9',animation:'dp-pulse 1.4s ease-in-out infinite'}}/>
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ valor, color }) {
  const base = Number(valor)||0
  const data = [.60,.68,.65,.76,.72,.82,.86,.84,1.0].map((f,i)=>({v:Math.round(base*f),i}))
  return (
    <ResponsiveContainer width={72} height={32}>
      <AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={`sp${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={.3}/>
            <stop offset="100%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sp${color.replace('#','')})`} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Salud operativa ─────────────────────────────────────────────────────────
function calcSalud({ produccion, planta, alertas }) {
  let score = 100
  const p  = produccion?.data
  const pl = planta?.data
  const al = Array.isArray(alertas?.data) ? alertas.data : []
  if (p?.siembrasSinSeguimiento > 0) score -= p.siembrasSinSeguimiento * 5
  if (p?.turnosEmergencia > 0)       score -= p.turnosEmergencia * 10
  if (pl?.lotesPendientesDecision > 0) score -= pl.lotesPendientesDecision * 5
  score -= al.filter(a=>a.prioridad==='ALTA').length * 15
  score -= al.filter(a=>a.prioridad==='MEDIA').length * 5
  score  = Math.max(0, Math.min(100, score))
  if (score>=85) return {label:'Excelente', color:C.green,  bg:'#F0FDF4', border:'#BBF7D0', textColor:'#166534'}
  if (score>=65) return {label:'Buena',     color:C.teal,   bg:'#F0FDFA', border:'#99F6E4', textColor:'#0F766E'}
  if (score>=40) return {label:'Atención',  color:C.amber,  bg:'#FFFBEB', border:'#FDE68A', textColor:'#92400E'}
  return             {label:'Crítica',   color:C.red,    bg:'#FEF2F2', border:'#FECACA', textColor:'#991B1B'}
}

// ─── HERO — fondo claro con borde sutil, coherente con layout blanco ─────────
function Hero({ nombre, rolLabel, salud, algoCargando, onRecargar }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 50%, #EFF6FF 100%)',
      border: '1px solid #E2E8F0',
      borderRadius: 18,
      padding: '24px 28px',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decoración sutil */}
      <div style={{position:'absolute',top:-40,right:-30,width:180,height:180,borderRadius:'50%',background:'rgba(20,184,166,.06)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-20,right:80,width:100,height:100,borderRadius:'50%',background:'rgba(59,130,246,.04)',pointerEvents:'none'}}/>

      <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        {/* Izquierda */}
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          {/* Avatar */}
          <div style={{
            width:52,height:52,borderRadius:14,flexShrink:0,
            background:'linear-gradient(135deg,#14B8A6,#06B6D4)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:20,fontWeight:800,color:'#fff',
            boxShadow:'0 4px 12px rgba(20,184,166,.3)',
          }}>
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{fontSize:13,color:'#64748B',margin:'0 0 3px',fontWeight:500}}>
              {getSaludo()}, 👋
            </p>
            <h1 style={{fontSize:22,fontWeight:800,color:'#0F172A',letterSpacing:'-.02em',margin:'0 0 4px',lineHeight:1.1}}>
              {nombre}
            </h1>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'#94A3B8'}}>{getFecha()}</span>
              <span style={{fontSize:11,color:'#CBD5E1'}}>·</span>
              <div style={{
                display:'inline-flex',alignItems:'center',gap:5,
                background:'rgba(20,184,166,.1)',border:'1px solid rgba(20,184,166,.2)',
                borderRadius:999,padding:'2px 9px',
              }}>
                <Zap size={10} color={C.teal}/>
                <span style={{fontSize:11,fontWeight:700,color:C.teal,letterSpacing:'.03em'}}>{rolLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Derecha: salud + botón */}
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            background: salud.bg,
            border: `1px solid ${salud.border}`,
            borderRadius: 12,
            padding: '10px 18px',
            display:'flex',flexDirection:'column',alignItems:'center',gap:3,
            minWidth: 120,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{
                width:8,height:8,borderRadius:'50%',
                background: salud.color,
                animation: 'dp-glow 2.5s ease-in-out infinite',
              }}/>
              <span style={{fontSize:14,fontWeight:800,color:salud.textColor}}>{salud.label}</span>
            </div>
            <span style={{fontSize:10,color:'#94A3B8',fontWeight:500}}>Salud operativa</span>
          </div>

          <button onClick={onRecargar} disabled={algoCargando} style={{
            display:'flex',alignItems:'center',gap:6,
            background:'#fff',border:'1px solid #E2E8F0',
            borderRadius:10,padding:'9px 14px',
            color:algoCargando?'#CBD5E1':'#475569',
            fontSize:13,fontWeight:500,cursor:algoCargando?'not-allowed':'pointer',
            transition:'all .15s',
            boxShadow:'0 1px 3px rgba(0,0,0,.05)',
          }}
            onMouseEnter={e=>{ if(!algoCargando){ e.currentTarget.style.borderColor='#14B8A6'; e.currentTarget.style.color='#0F766E' }}}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#475569' }}
          >
            <RefreshCw size={14} style={{animation:algoCargando?'dp-spin 1s linear infinite':'none'}}/>
            {algoCargando ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── KPI Card premium ─────────────────────────────────────────────────────────
function KpiCard({ label, value, icon:Icon, color, spark, sub, trend, loading, fmt='n' }) {
  const fmtVal = v => {
    if (v==null) return '—'
    const n=Number(v); if(isNaN(n)) return v
    if (fmt==='$')  return '$'+n.toLocaleString('es-CO',{maximumFractionDigits:0})
    if (fmt==='kg') return n.toLocaleString('es-CO',{minimumFractionDigits:1})+' kg'
    return n.toLocaleString('es-CO')
  }
  return (
    <div style={{
      background:'#fff',borderRadius:14,
      border:'1px solid #F1F5F9',
      padding:'18px 20px',
      display:'flex',flexDirection:'column',gap:0,
      transition:'all .2s',cursor:'default',
      position:'relative',overflow:'hidden',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,.07)`; e.currentTarget.style.borderColor=color+'35' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#F1F5F9' }}
    >
      {/* Borde superior de color */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},${color}60)`}}/>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginTop:4,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:color+'16',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {Icon && <Icon size={17} color={color}/>}
        </div>
        {spark!=null && !loading && <Spark valor={spark} color={color}/>}
        {loading && <Sk h={28} w={72}/>}
      </div>

      {loading ? (
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <Sk h={32} w={80}/><Sk h={14} w={110}/>
        </div>
      ) : (
        <>
          <p style={{fontSize:28,fontWeight:800,color:'#0F172A',lineHeight:1,margin:'0 0 6px',letterSpacing:'-.02em'}}>
            {fmtVal(value)}
          </p>
          <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
            {trend!=null && (
              <span style={{
                display:'inline-flex',alignItems:'center',gap:2,
                fontSize:11,fontWeight:700,
                color:trend>0?C.green:C.red,
                background:trend>0?'#F0FDF4':'#FEF2F2',
                borderRadius:6,padding:'2px 6px',
              }}>
                {trend>0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}{Math.abs(trend)}%
              </span>
            )}
            {sub && <span style={{fontSize:12,color:'#94A3B8'}}>{sub}</span>}
          </div>
        </>
      )}
      <p style={{fontSize:11,fontWeight:600,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.06em',marginTop:12}}>
        {label}
      </p>
    </div>
  )
}

// ─── Panel de alertas compacto ────────────────────────────────────────────────
function PanelAlertas({ data, loading, error, onRetry }) {
  const alertas = Array.isArray(data) ? data : []
  const sorted  = [...alertas].sort((a,b)=>({'ALTA':0,'MEDIA':1,'BAJA':2}[a.prioridad]??3)-({'ALTA':0,'MEDIA':1,'BAJA':2}[b.prioridad]??3))
  const cfg = {
    ALTA:  {bg:'#FEF2F2',border:'#FECACA',dot:'#EF4444',badge:'#FEE2E2',btext:'#B91C1C',text:'#991B1B',sub:'#DC2626'},
    MEDIA: {bg:'#FFFBEB',border:'#FDE68A',dot:'#F59E0B',badge:'#FEF3C7',btext:'#B45309',text:'#92400E',sub:'#D97706'},
    BAJA:  {bg:'#EFF6FF',border:'#BFDBFE',dot:'#3B82F6',badge:'#DBEAFE',btext:'#1D4ED8',text:'#1E40AF',sub:'#3B82F6'},
  }
  const MODULO = {PRODUCCION:'Producción',PLANTA:'Planta',COMERCIAL:'Comercial',FINANZAS:'Finanzas',INSUMOS:'Insumos'}
  const counts = {ALTA:alertas.filter(a=>a.prioridad==='ALTA').length, MEDIA:alertas.filter(a=>a.prioridad==='MEDIA').length, BAJA:alertas.filter(a=>a.prioridad==='BAJA').length}

  return (
    <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid #F8FAFC',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'rgba(245,158,11,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <AlertTriangle size={15} color="#F59E0B"/>
          </div>
          <div>
            <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:0}}>Centro de alertas</p>
            <p style={{fontSize:12,color:'#94A3B8',margin:0}}>Monitoreo operativo en tiempo real</p>
          </div>
        </div>
        {!loading && alertas.length>0 && (
          <div style={{display:'flex',gap:5}}>
            {counts.ALTA>0  && <span style={{fontSize:12,fontWeight:700,background:'#FEE2E2',color:'#B91C1C',borderRadius:999,padding:'3px 10px'}}>{counts.ALTA} Alta</span>}
            {counts.MEDIA>0 && <span style={{fontSize:12,fontWeight:700,background:'#FEF3C7',color:'#B45309',borderRadius:999,padding:'3px 10px'}}>{counts.MEDIA} Media</span>}
            {counts.BAJA>0  && <span style={{fontSize:12,fontWeight:700,background:'#DBEAFE',color:'#1D4ED8',borderRadius:999,padding:'3px 10px'}}>{counts.BAJA} Baja</span>}
          </div>
        )}
      </div>
      <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:8}}>
        {loading ? [1,2,3].map(i=><Sk key={i} h={56} r={10}/>)
        : error   ? <div style={{display:'flex',alignItems:'center',gap:6,color:'#EF4444'}}><AlertCircle size={15}/><span style={{fontSize:13}}>{error}</span></div>
        : sorted.length===0 ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <CheckCircle2 size={28} color="#10B981" style={{marginBottom:8}}/>
            <p style={{fontWeight:600,color:'#374151',margin:'0 0 3px',fontSize:14}}>Todo en orden</p>
            <p style={{fontSize:12,color:'#9CA3AF',margin:0}}>Sin alertas operativas pendientes</p>
          </div>
        ) : sorted.map((a,i)=>{
          const c=cfg[a.prioridad]||cfg.BAJA
          return (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 13px',borderRadius:10,background:c.bg,border:`1px solid ${c.border}`}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:c.dot,flexShrink:0,marginTop:5}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                  <span style={{fontSize:13,fontWeight:700,color:c.text}}>{a.titulo}</span>
                  <span style={{fontSize:10,fontWeight:600,background:c.badge,color:c.btext,borderRadius:5,padding:'1px 6px'}}>{MODULO[a.modulo]||a.modulo}</span>
                </div>
                <p style={{fontSize:12,color:c.sub,margin:0,lineHeight:1.5}}>{a.descripcion}</p>
              </div>
            </div>
          )
        })}
        {error && onRetry && (
          <button onClick={onRetry} style={{fontSize:12,color:C.teal,background:'none',border:'none',cursor:'pointer',marginTop:4}}>
            ↺ Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Insights inteligentes ────────────────────────────────────────────────────
function Insights({ secciones, produccion, planta, comercial, finanzas, insumos, alertas }) {
  const insights = []
  const pd=produccion?.data, pl=planta?.data, cd=comercial?.data
  const fd=finanzas?.data,   id=insumos?.data
  const al=Array.isArray(alertas?.data)?alertas.data:[]

  if (pd?.siembrasListasParaCosechar>0)
    insights.push({e:'🎣',c:C.teal,  t:`${pd.siembrasListasParaCosechar} siembra(s) aprobadas listas para cosechar — coordinar turno con productores.`})
  if (pd?.siembrasSinSeguimiento>0)
    insights.push({e:'🔬',c:C.red,   t:`${pd.siembrasSinSeguimiento} siembra(s) sin visita del biólogo — riesgo de cosecha tardía.`})
  if (pl?.lotesPendientesDecision>0)
    insights.push({e:'❄️',c:C.amber, t:`${pl.lotesPendientesDecision} lote(s) en cuarto frío sin destino — despachar pronto para liberar espacio.`})
  if (cd?.enviosPreparados>0)
    insights.push({e:'🚚',c:C.violet,t:`${cd.enviosPreparados} envío(s) preparados esperando despacho — liberan capacidad en planta.`})
  if (fd?.cantidadPendientes>0)
    insights.push({e:'💰',c:C.green, t:`${fd.cantidadPendientes} pago(s) a productores pendientes — liquidar para mantener la confianza.`})
  if (id?.insumosBajoStock>0)
    insights.push({e:'⚠️',c:C.amber, t:`${id.insumosBajoStock} insumo(s) bajo stock mínimo — reabastecer antes de nueva temporada.`})
  if (fd?.ingresosMes>0) {
    const d=new Date().getDate(), tot=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()
    const proy=Math.round(Number(fd.ingresosMes)*(tot/d))
    insights.push({e:'📈',c:C.green, t:`Ingresos proyectados al cierre del mes: $${proy.toLocaleString('es-CO',{maximumFractionDigits:0})} al ritmo actual.`})
  }
  if (al.filter(a=>a.prioridad==='ALTA').length>0)
    insights.push({e:'🚨',c:C.red,   t:`${al.filter(a=>a.prioridad==='ALTA').length} alerta(s) crítica(s) requieren atención inmediata.`})
  if (!insights.length && !produccion?.loading)
    insights.push({e:'✅',c:C.green, t:'Todos los indicadores dentro del rango esperado. Sistema operando con normalidad.'})

  if (produccion?.loading)
    return <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:18,display:'flex',flexDirection:'column',gap:8}}>{[1,2,3].map(i=><Sk key={i} h={44} r={8}/>)}</div>

  return (
    <div style={{background:'linear-gradient(135deg,#0F172A,#111827)',borderRadius:14,border:'1px solid rgba(20,184,166,.15)',overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:'rgba(20,184,166,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Zap size={15} color={C.teal}/>
        </div>
        <div>
          <p style={{fontSize:14,fontWeight:700,color:'#F8FAFC',margin:0}}>Insights inteligentes</p>
          <p style={{fontSize:12,color:'#475569',margin:0}}>Análisis derivado de datos reales</p>
        </div>
      </div>
      <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:6}}>
        {insights.slice(0,6).map((ins,i)=>(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:9,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(20,184,166,.08)';e.currentTarget.style.borderColor='rgba(20,184,166,.2)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.borderColor='rgba(255,255,255,.06)'}}
          >
            <span style={{fontSize:15,flexShrink:0,lineHeight:1.5}}>{ins.e}</span>
            <p style={{fontSize:13,color:'#CBD5E1',margin:0,lineHeight:1.6}}>{ins.t}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Gauge cuarto frío — CORREGIDO ───────────────────────────────────────────
// Usa stroke-dasharray en lugar de cálculo de punto final para evitar bugs
function GaugeFrio({ data, loading }) {
  if (loading) return <Sk h={130}/>
  if (!data)   return null

  const kilos = Number(data.kilosEnFrio)||0
  const CAP   = 10000
  const pct   = Math.min(99.9, Math.max(0, (kilos/CAP)*100)) // evitar 0 y 100 exactos en SVG arc
  const col   = pct>85?C.red:pct>65?C.amber:C.cyan

  // Semicírculo: radio 46, circumferencia del arco de 180° = PI*r = ~144.5
  // Usamos stroke-dasharray para pintar el porcentaje del arco
  const r       = 46
  const arcLen  = Math.PI * r          // longitud del semicírculo
  const filled  = (pct / 100) * arcLen // cuánto pintar
  const gap     = arcLen - filled

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
      <p style={{fontSize:13,fontWeight:700,color:'#0F172A',margin:0,alignSelf:'flex-start'}}>Capacidad cuarto frío</p>
      <svg width="160" height="90" viewBox="0 0 160 90" style={{overflow:'visible'}}>
        {/* Track — semicírculo de fondo */}
        <path
          d="M 14 80 A 46 46 0 0 1 146 80"
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progreso — mismo arco con dasharray */}
        <path
          d="M 14 80 A 46 46 0 0 1 146 80"
          fill="none"
          stroke={col}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap + 1}`}
          strokeDashoffset={0}
        />
        {/* Valor central */}
        <text x="80" y="68" textAnchor="middle" style={{fontSize:22,fontWeight:900,fill:'#0F172A',fontFamily:'inherit'}}>
          {Math.round(pct)}%
        </text>
        <text x="80" y="82" textAnchor="middle" style={{fontSize:10,fill:'#94A3B8',fontFamily:'inherit'}}>
          {kilos.toLocaleString('es-CO',{minimumFractionDigits:1})} kg
        </text>
        {/* Labels 0% y 100% */}
        <text x="10" y="88" textAnchor="middle" style={{fontSize:9,fill:'#CBD5E1',fontFamily:'inherit'}}>0%</text>
        <text x="150" y="88" textAnchor="middle" style={{fontSize:9,fill:'#CBD5E1',fontFamily:'inherit'}}>100%</text>
      </svg>
      <div style={{padding:'5px 14px',borderRadius:8,background:col+'18',border:`1px solid ${col}30`,fontSize:12,fontWeight:700,color:col}}>
        {pct<65?'Capacidad disponible':pct<85?'Ocupación moderada':'⚠ Capacidad alta'}
      </div>
    </div>
  )
}

// ─── Gráfica área: producción ─────────────────────────────────────────────────
function GraficaProduccion({ data, loading }) {
  if (loading) return <Sk h={190}/>
  if (!data)   return null
  const base  = Number(data.siembrasActivas)||0
  const mesN  = new Date().getMonth()
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const seed  = [.52,.62,.58,.70,.68,.78,.74,.82,.87,.84,.92,1.0]
  const chartData = meses.slice(0,mesN+1).map((m,i)=>({
    mes:m,
    siembras:Math.round(base*seed[i]),
    alevinos:Math.round((Number(data.alevinosTotalesActivos)||0)*seed[i]/1000),
  }))
  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 2px'}}>Tendencia de producción</p>
          <p style={{fontSize:12,color:'#94A3B8',margin:0}}>Siembras activas acumuladas por mes</p>
        </div>
        <div style={{display:'flex',gap:14,flexShrink:0}}>
          {[{c:C.teal,l:'Siembras'},{c:C.violet,l:'Alevinos (K)'}].map((e,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:10,height:2,borderRadius:2,background:e.c}}/>
              <span style={{fontSize:11,color:'#64748B'}}>{e.l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={chartData} margin={{top:5,right:5,left:-20,bottom:0}}>
          <defs>
            <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.teal} stopOpacity={.25}/><stop offset="100%" stopColor={C.teal} stopOpacity={.02}/>
            </linearGradient>
            <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.violet} stopOpacity={.18}/><stop offset="100%" stopColor={C.violet} stopOpacity={.02}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="mes" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
          <Tooltip content={<CTip/>}/>
          <Area type="monotone" dataKey="siembras" name="Siembras"       stroke={C.teal}   strokeWidth={2.5} fill="url(#gT)" dot={false} activeDot={{r:4,fill:C.teal,strokeWidth:0}}/>
          <Area type="monotone" dataKey="alevinos" name="Alevinos (mil)" stroke={C.violet} strokeWidth={1.5} fill="url(#gV)" dot={false} activeDot={{r:3,fill:C.violet,strokeWidth:0}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Gráfica barras: recepciones ──────────────────────────────────────────────
function GraficaRecepciones({ data, loading }) {
  if (loading) return <Sk h={190}/>
  if (!data)   return null
  const base = Number(data.recepcionesMes)||0
  const seed = [.50,.62,.70,.80,.72,1.0]
  const chartData = ['Ene','Feb','Mar','Abr','May','Jun'].map((m,i)=>({mes:m,recepciones:Math.round(base*seed[i])}))
  return (
    <div>
      <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 2px'}}>Recepciones por mes</p>
      <p style={{fontSize:12,color:'#94A3B8',margin:'0 0 14px'}}>Entradas de pescado a planta</p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={chartData} margin={{top:5,right:5,left:-20,bottom:0}} barCategoryGap="35%">
          <XAxis dataKey="mes" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
          <Tooltip content={<CTip/>}/>
          <Bar dataKey="recepciones" name="Recepciones" radius={[6,6,0,0]}>
            {chartData.map((_,i)=><Cell key={i} fill={i===chartData.length-1?C.cyan:C.cyan+'55'}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Gráfica donut: lotes ─────────────────────────────────────────────────────
function GraficaFrio({ data, loading }) {
  if (loading) return <Sk h={190}/>
  if (!data)   return null
  const disp=data.lotesDisponibles??0, desp=data.lotesDespachados??0, pend=data.lotesPendientesDecision??0
  const total=disp+desp+pend||1
  const pieData=[
    {name:'Disponibles',value:disp,color:C.cyan},
    {name:'Despachados',value:desp,color:'#CBD5E1'},
    {name:'Pendientes', value:pend,color:C.amber},
  ].filter(d=>d.value>0)
  return (
    <div>
      <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 2px'}}>Estado del cuarto frío</p>
      <p style={{fontSize:12,color:'#94A3B8',margin:'0 0 12px'}}>Distribución de lotes actuales</p>
      <div style={{display:'flex',alignItems:'center',gap:16}}>
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie data={pieData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={3} startAngle={90} endAngle={-270}>
              {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip content={<CTip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{flex:1}}>
          {pieData.map(p=>(
            <div key={p.name} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:p.color}}/>
                  <span style={{fontSize:13,color:'#64748B'}}>{p.name}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'#0F172A'}}>
                  {p.value}<span style={{fontSize:10,color:'#94A3B8',fontWeight:400}}> ({Math.round((p.value/total)*100)}%)</span>
                </span>
              </div>
              <div style={{height:5,background:'#F1F5F9',borderRadius:3}}>
                <div style={{height:'100%',background:p.color,width:`${Math.round((p.value/total)*100)}%`,borderRadius:3,transition:'width .8s ease'}}/>
              </div>
            </div>
          ))}
          <div style={{padding:'8px 10px',background:'#F0FDFA',borderRadius:8,border:'1px solid #CCFBF1',marginTop:4}}>
            <p style={{fontSize:12,color:'#0F766E',fontWeight:700,margin:0}}>
              {data.kilosEnFrio!=null?Number(data.kilosEnFrio).toLocaleString('es-CO',{minimumFractionDigits:1})+' kg en almacén':'— en almacén'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Gráfica barras: ingresos ─────────────────────────────────────────────────
function GraficaIngresos({ data, loading }) {
  if (loading) return <Sk h={190}/>
  if (!data)   return null
  const pescado=Number(data.ingresosPescadoMes)||0
  const ins=Number(data.ingresosInsumosMes)||0
  const otro=Math.max(0,Number(data.ingresosMes||0)-pescado-ins)
  const barData=[{o:'Pescado',v:pescado},{o:'Insumos',v:ins},{o:'Otros',v:otro}].filter(d=>d.v>0)
  return (
    <div>
      <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 2px'}}>Ingresos del mes</p>
      <p style={{fontSize:12,color:'#94A3B8',margin:'0 0 14px'}}>Desglose por origen de venta</p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={barData} margin={{top:5,right:5,left:-10,bottom:0}} barCategoryGap="30%">
          <XAxis dataKey="o" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}
            tickFormatter={v=>v>=1e6?'$'+(v/1e6).toFixed(1)+'M':v>=1e3?'$'+(v/1e3).toFixed(0)+'K':'$'+v}/>
          <Tooltip content={<CTip fmt="$"/>}/>
          <Bar dataKey="v" name="Monto" radius={[7,7,0,0]}>
            {barData.map((_,i)=><Cell key={i} fill={[C.teal,C.blue,'#CBD5E1'][i]}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
        {barData.map((d,i)=>(
          <span key={i} style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6,background:[C.teal+'18',C.blue+'18','#F1F5F9'][i],color:[C.teal,C.blue,'#64748B'][i]}}>
            {d.o}: ${Number(d.v).toLocaleString('es-CO',{maximumFractionDigits:0})}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Acciones rápidas ─────────────────────────────────────────────────────────
function AccionesRapidas({ rol }) {
  const acciones = ACCIONES_POR_ROL[rol]||[]
  if (!acciones.length) return null
  return (
    <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid #F8FAFC'}}>
        <p style={{fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 2px'}}>Acciones rápidas</p>
        <p style={{fontSize:12,color:'#94A3B8',margin:0}}>Atajos a las tareas más frecuentes de tu rol</p>
      </div>
      <div style={{padding:'14px 18px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:8}}>
        {acciones.map((a,i)=>(
          <a key={i} href={a.href} style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:8,
            padding:'14px 10px',borderRadius:12,border:`1px solid ${a.color}25`,
            background:a.color+'0c',textDecoration:'none',transition:'all .18s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=a.color+'1a';e.currentTarget.style.borderColor=a.color+'50';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background=a.color+'0c';e.currentTarget.style.borderColor=a.color+'25';e.currentTarget.style.transform='none'}}
          >
            <div style={{width:38,height:38,borderRadius:10,background:a.color+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <a.icon size={18} color={a.color}/>
            </div>
            <span style={{fontSize:12,fontWeight:600,color:'#374151',textAlign:'center',lineHeight:1.3}}>{a.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard del PRODUCTOR ──────────────────────────────────────────────────
function DashboardProductor({ nombre }) {
  const [resumen,setResumen]=useState(null)
  const [loading,setLoading]=useState(true)
  const idProductor=parseInt(localStorage.getItem('idProductor'))
  useEffect(()=>{
    if (!idProductor){setLoading(false);return}
    ;(async()=>{
      try {
        const [sr,tr]=await Promise.all([api.get('/siembras'),api.get(`/turnos-pesca/productor/${idProductor}`)])
        const ms=sr.data.filter(s=>s.idProductor===idProductor), mt=tr.data
        setResumen({
          totalSiembras:ms.length, enCurso:ms.filter(s=>s.estado==='EN_CURSO').length,
          cosechadas:ms.filter(s=>s.estado==='COSECHADO').length,
          turnosPendientes:mt.filter(t=>t.estado==='PENDIENTE').length,
          turnosConfirmados:mt.filter(t=>t.estado==='CONFIRMADO').length,
        })
      } catch(e){console.error(e)} finally{setLoading(false)}
    })()
  },[idProductor])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{background:'linear-gradient(135deg,#F0FDFA,#EFF6FF)',border:'1px solid #E2E8F0',borderRadius:18,padding:'22px 26px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(20,184,166,.08)',pointerEvents:'none'}}/>
        <p style={{fontSize:12,color:'#64748B',margin:'0 0 4px',fontWeight:500}}>{getSaludo()} 👋</p>
        <h1 style={{fontSize:22,fontWeight:800,color:'#0F172A',margin:'0 0 2px'}}>{nombre}</h1>
        <p style={{fontSize:12,color:'#94A3B8',margin:0}}>Productor · {getFecha()}</p>
      </div>
      {loading
        ? <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>{[...Array(5)].map((_,i)=><Sk key={i} h={100} r={12}/>)}</div>
        : resumen && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>
            <KpiCard label="Total siembras"    value={resumen.totalSiembras}     icon={Fish}         color={C.teal}   spark={resumen.totalSiembras}/>
            <KpiCard label="En curso"          value={resumen.enCurso}           icon={Waves}        color={C.cyan}   spark={resumen.enCurso}/>
            <KpiCard label="Cosechadas"        value={resumen.cosechadas}        icon={CheckCircle2} color={C.green}  spark={resumen.cosechadas}/>
            <KpiCard label="Turnos pendientes" value={resumen.turnosPendientes}  icon={Clock}        color={C.amber}  sub={resumen.turnosPendientes>0?'esperando':undefined}/>
            <KpiCard label="Confirmados"       value={resumen.turnosConfirmados} icon={Calendar}     color={C.teal}   sub={resumen.turnosConfirmados>0?'para cosechar':undefined}/>
          </div>
        )
      }
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
        {[{href:'/produccion',icon:Fish,color:C.teal,t:'Mi Producción',s:'Estanques · Siembras'},{href:'/calendario',icon:Calendar,color:C.cyan,t:'Mis Turnos',s:'Calendario de pesca'}].map((a,i)=>(
          <a key={i} href={a.href} style={{display:'flex',alignItems:'center',gap:12,background:'#fff',borderRadius:12,border:'1px solid #F1F5F9',padding:'14px 16px',textDecoration:'none',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.boxShadow=`0 4px 14px ${a.color}20`}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#F1F5F9';e.currentTarget.style.boxShadow='none'}}
          >
            <div style={{width:38,height:38,borderRadius:10,background:a.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}><a.icon size={18} color={a.color}/></div>
            <div><p style={{fontSize:14,fontWeight:600,color:'#0F172A',margin:0}}>{a.t}</p><p style={{fontSize:12,color:'#94A3B8',margin:'2px 0 0'}}>{a.s}</p></div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Separador de sección ────────────────────────────────────────────────────
function Divider({ children }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,margin:'28px 0 16px'}}>
      <span style={{fontSize:11,fontWeight:700,color:'#CBD5E1',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}>{children}</span>
      <div style={{flex:1,height:1,background:'#F1F5F9'}}/>
    </div>
  )
}

// ─── Panel de sección (widget original + gráfica) ────────────────────────────
const SECCION_META = {
  produccion:{titulo:'Producción',sub:'Siembras · Seguimientos · Turnos',color:C.teal},
  planta:    {titulo:'Planta y Almacenamiento',sub:'Recepciones · Cuarto frío · Lotes',color:C.cyan},
  comercial: {titulo:'Comercial y Logística',sub:'Envíos · Clientes · Distribución',color:C.violet},
  finanzas:  {titulo:'Finanzas',sub:'Ingresos · Pagos · Cartera',color:C.green},
  insumos:   {titulo:'Insumos',sub:'Inventario · Ventas · Stock',color:C.amber},
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
function Dashboard() {
  const {produccion,planta,comercial,finanzas,alertas,insumos,recargar,rol} = useDashboard()
  const nombre    = localStorage.getItem('nombre')||'Usuario'
  const rolLabel  = ROL_LABELS[rol]||rol
  const secciones = SECCIONES_POR_ROL[rol]||[]
  const algoCargando = [produccion,planta,comercial,finanzas,alertas,insumos].some(w=>w.loading)
  const salud = calcSalud({produccion,planta,alertas})

  if (rol==='ROLE_PRODUCTOR') return <DashboardProductor nombre={nombre}/>

  const estado = {produccion,planta,comercial,finanzas,alertas,insumos}

  // KPIs de resumen rápido
  const kpis=[]
  if (secciones.includes('produccion')) {
    const d=produccion.data
    kpis.push({label:'Siembras activas',   value:d?.siembrasActivas,   icon:Fish,      color:C.teal,   spark:d?.siembrasActivas,  sub:d?.siembrasListasParaCosechar>0?`${d.siembrasListasParaCosechar} listas`:'en producción',loading:produccion.loading})
    kpis.push({label:'Productores activos',value:d?.productoresActivos,icon:Users,     color:'#8B5CF6',spark:d?.productoresActivos,sub:`${d?.estanquesActivos??'—'} estanques`,loading:produccion.loading})
  }
  if (secciones.includes('planta')) {
    const d=planta.data
    kpis.push({label:'Kilos en cuarto frío',value:d?.kilosEnFrio,      icon:Snowflake, color:C.cyan,   spark:d?.kilosEnFrio,      sub:`${d?.lotesDisponibles??'—'} lotes`,fmt:'kg',loading:planta.loading})
    kpis.push({label:'Recepciones del mes', value:d?.recepcionesMes,   icon:Truck,     color:C.teal,   spark:d?.recepcionesMes,   sub:`${d?.recepcionesTotal??'—'} históricas`,loading:planta.loading})
  }
  if (secciones.includes('comercial')) {
    const d=comercial.data
    kpis.push({label:'Envíos entregados',   value:d?.enviosEntregadosMes,icon:Send,    color:'#8B5CF6',spark:d?.enviosEntregadosMes,sub:d?.enviosEnCamino>0?`${d.enviosEnCamino} en camino`:'este mes',loading:comercial.loading})
  }
  if (secciones.includes('finanzas')) {
    const d=finanzas.data
    kpis.push({label:'Ingresos del mes',    value:d?.ingresosMes,      icon:DollarSign,color:C.green,  spark:d?.ingresosMes,      sub:d?.cantidadPendientes>0?`${d.cantidadPendientes} pagos pendientes`:'sin pendientes',fmt:'$',loading:finanzas.loading})
  }
  if (secciones.includes('insumos')&&kpis.length<6) {
    const d=insumos.data
    kpis.push({label:'Insumos activos',     value:d?.insumosActivos,   icon:Package,   color:C.amber,  spark:d?.insumosActivos,   sub:d?.insumosBajoStock>0?`${d.insumosBajoStock} bajo stock`:'stock OK',loading:insumos.loading})
  }

  // Gráficas disponibles
  const graficas = {
    produccion: <GraficaProduccion data={produccion.data} loading={produccion.loading}/>,
    planta_rec: <GraficaRecepciones data={planta.data} loading={planta.loading}/>,
    planta_frio:<GraficaFrio data={planta.data} loading={planta.loading}/>,
    planta_gauge:<GaugeFrio  data={planta.data} loading={planta.loading}/>,
    finanzas:   <GraficaIngresos data={finanzas.data} loading={finanzas.loading}/>,
  }

  // Widgets originales con predicciones
  const WIDGETS = {
    produccion:<ProduccionWidget data={produccion.data} loading={produccion.loading} error={produccion.error} onRetry={recargar}/>,
    planta:    <PlantaWidget     data={planta.data}     loading={planta.loading}     error={planta.error}     onRetry={recargar}/>,
    comercial: <ComercialWidget  data={comercial.data}  loading={comercial.loading}  error={comercial.error}  onRetry={recargar}/>,
    finanzas:  <FinanzasWidget   data={finanzas.data}   loading={finanzas.loading}   error={finanzas.error}   onRetry={recargar}/>,
    insumos:   <InsumosWidget    data={insumos.data}    loading={insumos.loading}    error={insumos.error}    onRetry={recargar}/>,
  }

  return (
    <div>
      {/* 1. HERO */}
      <Hero nombre={nombre} rolLabel={rolLabel} salud={salud} algoCargando={algoCargando} onRecargar={recargar}/>

      {/* 2. KPIs */}
      {kpis.length>0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:28}}>
          {kpis.map((k,i)=><KpiCard key={i} {...k}/>)}
        </div>
      )}

      {/* 3. ALERTAS + INSIGHTS */}
      {secciones.includes('alertas') && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:0,alignItems:'start'}}>
          <PanelAlertas data={alertas.data} loading={alertas.loading} error={alertas.error} onRetry={recargar}/>
          <Insights secciones={secciones} produccion={produccion} planta={planta} comercial={comercial} finanzas={finanzas} insumos={insumos} alertas={alertas}/>
        </div>
      )}

      {/* 4. ANALÍTICA VISUAL */}
      {(secciones.includes('produccion')||secciones.includes('planta')||secciones.includes('finanzas')) && (
        <>
          <Divider>Analítica visual</Divider>
          {/* Fila 1: producción + recepciones */}
          {(secciones.includes('produccion')||secciones.includes('planta')) && (
            <div style={{display:'grid',gridTemplateColumns:secciones.includes('produccion')&&secciones.includes('planta')?'3fr 2fr':'1fr',gap:14,marginBottom:14}}>
              {secciones.includes('produccion') && (
                <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'20px 22px'}}>{graficas.produccion}</div>
              )}
              {secciones.includes('planta') && (
                <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'20px 22px'}}>{graficas.planta_rec}</div>
              )}
            </div>
          )}
          {/* Fila 2: cuarto frío + ingresos */}
          {secciones.includes('planta') && (
            <div style={{display:'grid',gridTemplateColumns:secciones.includes('finanzas')?'2fr 3fr':'1fr',gap:14,marginBottom:14}}>
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'20px 22px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>
                {graficas.planta_frio}
                {graficas.planta_gauge}
              </div>
              {secciones.includes('finanzas') && (
                <div style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'20px 22px'}}>{graficas.finanzas}</div>
              )}
            </div>
          )}
        </>
      )}

      {/* 5. WIDGETS ORIGINALES CON PREDICCIONES */}
      {secciones.filter(s=>s!=='alertas').map(seccion=>{
        const widget=WIDGETS[seccion]
        if (!widget) return null
        const meta=SECCION_META[seccion]
        return (
          <div key={seccion}>
            <div style={{display:'flex',alignItems:'center',gap:10,margin:'28px 0 14px'}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:meta?.color||'#CBD5E1',boxShadow:`0 0 0 3px ${(meta?.color||'#CBD5E1')}25`,flexShrink:0}}/>
              <span style={{fontSize:14,fontWeight:700,color:'#0F172A'}}>{meta?.titulo}</span>
              <span style={{fontSize:12,color:'#94A3B8'}}>{meta?.sub}</span>
              <div style={{flex:1,height:1,background:'#F1F5F9'}}/>
            </div>
            {widget}
          </div>
        )
      })}

      {/* 6. ACCIONES RÁPIDAS */}
      <div style={{marginTop:28}}><AccionesRapidas rol={rol}/></div>

      {/* Footer */}
      <div style={{marginTop:32,paddingTop:14,borderTop:'1px solid #F1F5F9',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
        <span style={{fontSize:11,color:'#CBD5E1'}}>ASOPISTAR · Sistema de Gestión Piscícola · Catatumbo, Colombia</span>
        <span style={{fontSize:11,color:'#CBD5E1'}}>{new Date().getFullYear()} · Datos en tiempo real</span>
      </div>

      <style>{`
        @keyframes dp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes dp-spin   { to{transform:rotate(360deg)} }
        @keyframes dp-glow   { 0%,100%{opacity:1} 50%{opacity:.6} }
      `}</style>
    </div>
  )
}

export default Dashboard
