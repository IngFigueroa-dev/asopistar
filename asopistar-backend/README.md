<p align="center">
  <img src="./assets/logo.jpg" alt="Logo ASOPISTAR" width="160" />
</p>

<h1 align="center">ASOPISTAR — Sistema de Gestión Piscícola</h1>

<p align="center">
  <i>Asociación de Piscicultores del Tarra · Catatumbo, Colombia</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen?logo=springboot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/IA-Gemini%202.5%20Flash-4285F4?logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel" />
  <img src="https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway" />
  <img src="https://img.shields.io/badge/Licencia-Por%20definir-lightgrey" />
</p>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Demo en Vivo](#-demo-en-vivo)
- [Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Módulos y Funcionalidades](#-módulos-y-funcionalidades)
- [Asistente Inteligente (Chatbot con Gemini)](#-asistente-inteligente-chatbot-con-gemini)
- [Instalación y Configuración Local](#️-instalación-y-configuración-local)
- [Seguridad](#-seguridad)
- [Flujo Operativo Principal](#-flujo-operativo-principal)
- [Roadmap](#️-roadmap)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

---

## 🐟 Acerca del Proyecto

**ASOPISTAR** es un sistema web de gestión integral para la **Asociación de Piscicultores del Tarra**, una organización de campesinos productores de pescado (principalmente cachama) en la región del Catatumbo, Colombia.

El sistema digitaliza y centraliza todo el ciclo productivo: desde el registro de siembras y el seguimiento del biólogo, hasta la recepción del pescado, su paso por cuarto frío, la logística de envíos, los pagos a productores y los ingresos de la asociación — reemplazando cuadernos y hojas de cálculo dispersas por un flujo trazable de extremo a extremo.

---

## 🚀 Demo en Vivo

| Componente | URL |
|---|---|
| 🖥️ Frontend (Vercel) | [asopistar-raqg.vercel.app](https://asopistar-raqg.vercel.app/) |
| ⚙️ Backend API (Railway) | `https://asopistar-production.up.railway.app/api` |

> ⚠️ **Nota de seguridad:** el backend del demo está conectado a una base de datos real (Supabase/PostgreSQL). Las credenciales de administrador **no se publican en este README** porque otorgan acceso total (`ROLE_ADMIN`) sobre datos reales de la asociación. Si necesitas probar el sistema, solicita un usuario de demo de solo lectura al equipo, o crea uno con un rol limitado (`ROLE_BIOLOGO`, `ROLE_CONTADORA`, etc.) vía `POST /usuarios`.

---

## 🏗️ Arquitectura del Sistema

Arquitectura cliente-servidor de tres capas, con un módulo adicional de IA conversacional que se apoya en los mismos repositorios de datos del backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (React + Vite)                       │
│              Desplegado en Vercel                                │
│  Login │ Dashboard │ Productores │ Producción │ Calendario       │
│  Recepciones │ Almacenamiento │ Logística │ Pagos │ Reportes     │
│  ChatWidget.jsx (asistente flotante, solo con sesión activa)     │
└──────────────────────────┬───────────────────────────────────────┘
                            │ HTTP/REST (Axios + JWT Bearer Token)
┌──────────────────────────▼───────────────────────────────────────┐
│                  BACKEND (Spring Boot)                            │
│              Desplegado en Railway · Context Path: /api           │
│                                                                    │
│  Controller → Service → Repository → Entity                       │
│  Spring Security (JWT Filter Chain)                                │
│                                                                    │
│  ChatbotController → ChatbotService → GeminiClient ──┐            │
│         │                                             │            │
│         └─ lee Siembra / LoteCuartoFrio /              │           │
│            PagoProductor / TurnoPesca en vivo           ▼           │
│            para construir el "contexto operativo"   Gemini API     │
│            que se envía junto a la pregunta del usuario            │
└──────────────────────────┬───────────────────────────────────────┘
                            │ JDBC / Hibernate ORM · Schema: negocio
┌──────────────────────────▼───────────────────────────────────────┐
│                BASE DE DATOS (PostgreSQL)                         │
│              Alojada en Supabase                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite | React 18 |
| Estilos | Tailwind CSS | v4 |
| HTTP Client | Axios | Latest |
| Gráficas | Recharts | Latest |
| Iconos | Lucide React | Latest |
| Backend | Spring Boot | 3.4.5 |
| Lenguaje | Java | 21 |
| ORM | Spring Data JPA / Hibernate | 6.x |
| Seguridad | Spring Security + JWT | JJWT 0.12.6 |
| Base de datos | PostgreSQL (alojada en Supabase) | — |
| IA Conversacional | Google Gemini API | `gemini-2.5-flash` |
| Build tool | Maven | 3.x |
| Hosting Frontend | Vercel | — |
| Hosting Backend | Railway | — |

---

## 📂 Estructura del Repositorio

Monorepo con backend y frontend en carpetas separadas:

```
asopistar/
├── asopistar-backend/        # API REST — Spring Boot + Java 21
├── asopistar_frontend/       # SPA — React + Vite + Tailwind
├── asopistar.sql             # Script de base de datos (schema "negocio")
└── .gitignore
```

> 📦 Repositorio: [github.com/IngFigueroa-dev/asopistar](https://github.com/IngFigueroa-dev/asopistar)

<details>
<summary>📁 Ver estructura interna del backend</summary>

```
asopistar-backend/
└── src/main/java/com/config/spring/asopistar/asopistar_backend/
    ├── config/          # CORS, JWT, Security
    ├── controller/      # Controladores REST (incluye ChatbotController)
    ├── dto/              # request/ y response/
    ├── entity/           # Entidades JPA
    ├── exception/        # Manejo global de errores
    ├── repository/       # Interfaces JpaRepository
    ├── security/         # JwtAuthenticationFilter, JwtTokenProvider
    └── service/
        ├── (interfaces)
        └── impl/         # Incluye ChatbotServiceImpl + GeminiClient
```

</details>

<details>
<summary>📁 Ver estructura interna del frontend</summary>

```
asopistar_frontend/
└── src/
    ├── components/
    │   ├── layout/Layout.jsx     # Sidebar + Header + ChatWidget montado aquí
    │   ├── ui/
    │   └── ChatWidget.jsx        # Asistente flotante (Gemini)
    ├── hooks/useSessionTimeout.js
    ├── pages/
    │   ├── auth/ · dashboard/ · productores/ · produccion/
    │   ├── calendario/ · recepciones/ · almacenamiento/
    │   ├── logistica/ · pagos/ · reportes/ · configuracion/
    ├── services/api.js           # Axios + interceptors JWT
    └── App.jsx
```

</details>

---

## ✨ Módulos y Funcionalidades

| Módulo | Estado | Descripción |
|---|---|---|
| Autenticación (JWT) | ✅ | Login, expiración de token (24h), timeout por inactividad (30 min) |
| Productores | ✅ | CRUD completo con búsqueda |
| Producción | ✅ | Siembras + seguimientos del biólogo, aprobación de cosecha |
| Calendario / Turnos de pesca | ✅ | Priorización automática (emergencias primero) |
| Recepciones | ✅ | Registro de entrada de pescado, crea lote automáticamente |
| Almacenamiento (Cuarto Frío) | ✅ | Vista de lotes; ahora con seguimiento de **capacidad** del cuarto frío |
| Procesamiento | 🟡 En progreso | Conexión con Almacenamiento ya integrada; flujo tipo pipeline pendiente de UI |
| Logística | ✅ | Envíos con cambio de estado |
| Pagos a Productores | ✅ | Registro y marcado de pagos |
| Ingresos | ✅ | Registro de ingresos asociados a ventas |
| Reportes | ✅ | Gráficas con Recharts |
| Configuración / Accesibilidad | ✅ | Texto grande, alto contraste, tipografía alternativa |
| **Asistente IA (Chatbot)** | ✅ **Nuevo** | Soporte de uso + consultas en tiempo real sobre datos operativos (ver sección dedicada) |
| Insumos (venta de alevinos/concentrado) | ⬜ Pendiente | — |
| Clientes (CRM) | ⬜ Pendiente | — |
| Puntos de Venta | ⬜ Pendiente | — |
| Control de acceso por rol en frontend | ⬜ Pendiente | Menús/vistas según rol del usuario |
| Notificaciones en tiempo real | ⬜ Pendiente | Alertas de stock bajo, turnos próximos |
| Exportación de reportes a PDF/Excel | ⬜ Pendiente | — |
| Despliegue en producción | ✅ | Frontend en Vercel, backend en Railway, BD en Supabase |

---

## 🤖 Asistente Inteligente (Chatbot con Gemini)

El módulo más reciente del sistema: un asistente conversacional integrado como **widget flotante** en el frontend (`ChatWidget.jsx`, montado en `Layout.jsx`), visible solo cuando hay sesión iniciada.

### ¿Qué hace?

1. **Soporte y guía de uso** — responde preguntas como *"¿cómo registro una recepción?"* o da recomendaciones ante situaciones como *"tengo mortalidad alta en un estanque"*, sin tocar la base de datos.
2. **Consultas en tiempo real sobre datos operativos** — preguntas como *"¿cuántas siembras activas hay?"* o *"analiza la producción actual"* sí leen datos reales: antes de llamar a la IA, el backend construye un bloque de **contexto operativo** consultando en vivo `SiembraRepository`, `LoteCuartoFrioRepository`, `PagoProductorRepository` y `TurnoPescaRepository`, y lo inyecta junto con la pregunta del usuario.

El asistente también es **consciente del rol**: el backend extrae el email y el rol directamente del JWT (no del frontend), por lo que puede ajustar su respuesta según quién pregunta.

### Arquitectura del módulo

```
ChatWidget.jsx (React)
        │  axios + JWT (mismo patrón que el resto del frontend)
        ▼
POST /api/chatbot/mensaje
        │
ChatbotController → ChatbotService(Impl) → GeminiClient → Gemini API
                          │
                          └─ lee Siembra / LoteCuartoFrio /
                             PagoProductor / TurnoPesca
                             para construir el contexto operativo
```

### Tecnología y seguridad

- Motor: **Google Gemini API** (`gemini-2.5-flash`, nivel gratuito de Google AI Studio) — no es reglas fijas tipo FAQ ni un modelo entrenado internamente.
- La llamada es **backend → Gemini** vía `RestTemplate` (REST); la API key vive únicamente en `application.properties` del servidor y **nunca llega al navegador**.
- No es un microservicio aparte: vive dentro del mismo monolito Spring Boot, como un módulo más (controller/service/cliente).

### Pendiente (Nivel 3)

La predicción de disponibilidad futura de pescado (proyectar cosechas/stock a futuro) fue identificada como el siguiente paso natural del asistente, pero todavía no está implementada — ver [Roadmap](#️-roadmap).

---

## ⚙️ Instalación y Configuración Local

### Requisitos previos

| Software | Versión | Para qué |
|---|---|---|
| Java JDK | 21+ | Ejecutar el backend Spring Boot |
| Maven | 3.x | Build del backend (incluido en `mvnw`) |
| Node.js | 18+ | Ejecutar el frontend React |
| PostgreSQL | 14+ (o cuenta en Supabase) | Base de datos |
| API Key de Gemini | — | Generar en [Google AI Studio](https://aistudio.google.com/) |

### 1. Clonar el repositorio

```bash
git clone https://github.com/IngFigueroa-dev/asopistar.git
cd asopistar
```

### 2. Backend

```bash
cd asopistar-backend
```

Configura `src/main/resources/application.properties` (o, mejor, usa variables de entorno y no subas credenciales reales al repo):

```properties
spring.datasource.url=jdbc:postgresql://<HOST>:<PUERTO>/<BASE_DE_DATOS>
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.default_schema=negocio

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

gemini.api.key=${GEMINI_API_KEY}

server.port=8080
server.servlet.context-path=/api
```

```bash
./mvnw spring-boot:run
```

Confirmación de inicio exitoso: `Started AsopistarBackendApplication...` / `Tomcat started on port 8080`.

### 3. Frontend

```bash
cd ../asopistar_frontend
npm install
npm run dev
```

Confirmación de inicio exitoso: `VITE ready` → `Local: http://localhost:5173/`.

### 4. Base de datos

Ejecuta `asopistar.sql` contra tu instancia de PostgreSQL (local o Supabase) para crear el schema `negocio` y sus tablas.

---

## 🔐 Seguridad

- Autenticación con **JWT** (token expira en 24h); único endpoint público: `POST /auth/login`.
- Rutas protegidas por rol vía `hasAuthority()`:

| Rol | Acceso |
|---|---|
| `ROLE_ADMIN` | Todos los endpoints sin restricción |
| `ROLE_GERENTE_PLANTA` | `/recepciones/**`, `/turnos-pesca/**`, `/lotes-cuarto-frio/**` |
| `ROLE_BIOLOGO` | `POST /seguimientos/**`, `GET /siembras/**` |
| `ROLE_GERENTE_COMERCIAL` | `/envios/**`, `/clientes/**`, `/puntos-venta/**` |
| `ROLE_CONTADORA` | `/pagos-productor/**`, `/ingresos/**` |
| `ROLE_ENCARGADO_INSUMOS` | `/insumos/**`, `/ventas-insumo/**` |

- La API key de Gemini, las credenciales de base de datos y el `jwt.secret` deben manejarse como **variables de entorno** — nunca como texto plano en el repositorio.
- Sesión en el frontend expira por inactividad (30 minutos).

---

## 🔄 Flujo Operativo Principal

```
1. SIEMBRA            → Gerente registra siembra en estanque ACTIVO
2. SEGUIMIENTO         → Biólogo evalúa y decide apto_cosecha (Y/N)
3. TURNO DE PESCA      → Orden automático: emergencia > menor cantidad > fecha más antigua
4. RECEPCIÓN           → Ingreso de pescado; crea lote de cuarto frío automáticamente
5. ALMACENAMIENTO      → Lote disponible hasta ser despachado
6. ENVÍO (Logística)   → PREPARADO → EN_CAMINO → ENTREGADO
7. PAGO AL PRODUCTOR   → monto = kilosPagados × precioKg
8. INGRESO             → Registro del ingreso por venta
```

---

## 🗺️ Roadmap

- [ ] Módulo de Insumos (venta de alevinos y concentrado)
- [ ] Completar UI de Procesamiento (pipeline visual de etapas del cuarto frío)
- [ ] Módulo de Clientes (CRM)
- [ ] Módulo de Puntos de Venta
- [ ] Control de acceso por rol en el frontend (menús/vistas dinámicas)
- [ ] Notificaciones en tiempo real (stock bajo, turnos próximos)
- [ ] Exportación de reportes a PDF/Excel
- [ ] Chatbot — Nivel 3: predicción de disponibilidad futura de pescado

---

## 👥 Equipo

Desarrollado por el **Equipo ASOPISTAR**.

---

## 📄 Licencia

Licencia aún **por definir**. Mientras tanto, todos los derechos quedan reservados al Equipo ASOPISTAR y a la Asociación de Piscicultores del Tarra. Si se decide abrir el código bajo una licencia (MIT, Apache 2.0, etc.), añade un archivo `LICENSE` en la raíz del repositorio y actualiza esta sección.

---

<p align="center"><i>ASOPISTAR — en el corazón del Catatumbo 🐟</i></p>
