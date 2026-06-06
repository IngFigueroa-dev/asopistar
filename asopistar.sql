DROP TABLE negocio.Rol ;
DROP TABLE negocio.ESPECIE ;
DROP TABLE negocio.USUARIO ;
DROP TABLE negocio.PRODUCTOR ;
DROP TABLE negocio.ESTANQUE ;
DROP TABLE negocio.SIEMBRA ;
DROP TABLE negocio.PUNTO_VENTA ;
DROP TABLE negocio.CLIENTE ;
DROP TABLE negocio.METODO_PAGO ;
DROP TABLE negocio.INSUMO ;
DROP TABLE negocio.VENTA_INSUMO ;
DROP TABLE negocio.SEGUIMIENTO_SIEMBRA ;
DROP TABLE negocio.TURNOS_PESCA ;
DROP TABLE negocio.RECEPCION ;
DROP TABLE negocio.PAGO_PRODUCTOR ;
DROP TABLE negocio.DETALLE_VENTA_INSUMO ;
DROP TABLE negocio.LOTE_CUARTO_FRIO ;
DROP TABLE negocio.PROCESAMIENTO ;
DROP TABLE negocio.ENVIO ;
DROP TABLE negocio.DETALLE_ENVIO ;
DROP TABLE negocio.INGRESO ;


CREATE TABLE negocio.Rol 
    ( 
     id_rol      SERIAL, 
     nombre      VARCHAR (30)  NOT NULL , 
     descripcion VARCHAR(100) ,
	 CONSTRAINT PK_Rol PRIMARY KEY (id_rol)
	 
    );

CREATE TABLE negocio.ESPECIE 
    ( 
     id_especie  SERIAL, 
     nombre      VARCHAR (20)  NOT NULL , 
     descripcion VARCHAR (100)  NOT NULL, 
	 CONSTRAINT PK_ESPECIE PRIMARY KEY (id_especie)
    );

CREATE TABLE negocio.USUARIO 
    ( 
     id_usuario     SERIAL, 
     Nombre1        VARCHAR (15)  NOT NULL , 
     Nombre2        VARCHAR (15) , 
     Apellido1      VARCHAR (15)  NOT NULL , 
     Apellido2      VARCHAR (15) , 
     email          VARCHAR (30)  NOT NULL , 
     contraseña     VARCHAR (50)  NOT NULL , 
     activo         BOOLEAN, 
     fecha_creacion DATE  NOT NULL , 
     id_rol         SERIAL NOT NULL,
	  CONSTRAINT PK_USUARIO PRIMARY KEY ( id_usuario ),
	  CONSTRAINT FK_Rol_USUARIO FOREIGN KEY (id_rol) 
      REFERENCES  negocio.Rol (id_rol),
	  CONSTRAINT CK_activo CHECK (activo IN ('Y', 'N')),
	  CONSTRAINT UC_email UNIQUE  (email)
    );


CREATE TABLE negocio.PRODUCTOR 
    ( 
     id_productor     SERIAL , 
     nombre1          VARCHAR (15)  NOT NULL , 
     nombre2          VARCHAR (15) , 
     apellido1        VARCHAR (20)  NOT NULL , 
     apellido2        VARCHAR (20) , 
     documento        VARCHAR (15)  NOT NULL , 
     telefono         VARCHAR (15)  NOT NULL , 
     fecha_ingreso    DATE  NOT NULL , 
     fecha_nacimiento DATE  NOT NULL , 
     cantidad_hijos   INTEGER, 
     activo           BOOLEAN , 
     id_usuario       SERIAL NOT NULL , 
     direccion        VARCHAR(40)  NOT NULL,
	 CONSTRAINT PK_PRODUCTOR PRIMARY KEY (id_productor),
	 CONSTRAINT CK_activo CHECK (activo IN ('Y', 'N')),
	 CONSTRAINT ck_cantidad_hijos  CHECK(cantidad_hijos>0)
    );

CREATE TABLE negocio.ESTANQUE 
    ( 
     id_estanque SERIAL,
     Codigo      VARCHAR(10)  NOT NULL , 
     nombre      VARCHAR(20)  NOT NULL , 
     capacidad   DECIMAL  NOT NULL , 
     ubicacion    VARCHAR(100)  NOT NULL , 
     estado_estanque VARCHAR(20)  NOT NULL , 
     id_productor   SERIAL  NOT NULL,
	 CONSTRAINT PK_ESTANQUE PRIMARY KEY (id_estanque),
	 CONSTRAINT FK_PRODUCTOR_ESTANQUE FOREIGN KEY(id_productor ) 
     REFERENCES negocio.PRODUCTOR (id_productor ),
	 CONSTRAINT ck_capacidad  CHECK(capacidad >0)
    );

CREATE TABLE negocio.SIEMBRA 
    ( 
     id_siembra       SERIAL, 
     fecha_siembra     DATE  NOT NULL , 
     cantidad_alevinos INTEGER  NOT NULL , 
     promedio_inicial  DECIMAL  NOT NULL , 
     estado            VARCHAR (20)  NOT NULL , 
     observaciones     VARCHAR (100), 
     id_especie        SERIAL NOT NULL , 
     id_estanque      SERIAL NOT NULL,
	 CONSTRAINT PK_SIEMBRA PRIMARY KEY ( Id_siembra ),
	 CONSTRAINT FK_ESPECIE_SIEMBRA FOREIGN KEY  (id_especie) 
    REFERENCES negocio.ESPECIE (id_especie),  
    CONSTRAINT FK_ESTANQUE_SIEMBRA FOREIGN KEY (id_estanque) 
    REFERENCES negocio.ESTANQUE( id_estanque ),
	CONSTRAINT ck_cantidad_alevinos  CHECK( cantidad_alevinos >0)
    );





CREATE TABLE negocio.CLIENTE 
    ( 
     id_cliente SERIAL, 
     nombre1    VARCHAR (20)  NOT NULL , 
     nombre2    VARCHAR (20) , 
     apellido1  VARCHAR (20)  NOT NULL , 
     apellido2  VARCHAR (20) , 
     tipo       VARCHAR (30)  NOT NULL , 
     ciudad     VARCHAR (50)  NOT NULL , 
     telefono   VARCHAR (15)  NOT NULL , 
     email      VARCHAR (15)  NOT NULL , 
     direccion  VARCHAR (100)  NOT NULL, 
	 CONSTRAINT PK_CLIENTE PRIMARY KEY (id_cliente)
    );
	

CREATE TABLE negocio.PUNTO_VENTA 
    ( 
     id_punto SERIAL , 
     nombre    VARCHAR(40)  NOT NULL , 
     ciudadd   VARCHAR(30)  NOT NULL , 
     direccion VARCHAR(50)  NOT NULL , 
     activo   BOOLEAN,
	 CONSTRAINT PK_PUNTO_VENTA PRIMARY KEY (id_punto),
	 CONSTRAINT CK_activo CHECK (activo IN ('Y', 'N'))
    );


CREATE TABLE negocio.METODO_PAGO 
    ( 
     id_metodo_pago SERIAL, 
     nombre         VARCHAR(20)  NOT NULL , 
     descripcion    VARCHAR(100), 
     estado         VARCHAR(20)  NOT NULL, 
	 CONSTRAINT PK_METODO_PAGO PRIMARY KEY (id_metodo_pago)
    );

CREATE TABLE negocio.INSUMO 
    ( 
     id_insumo      SERIAL , 
     nombre          VARCHAR(50)  NOT NULL , 
     tipo            VARCHAR(30)  NOT NULL , 
     unidad_medida   VARCHAR(20)  NOT NULL , 
     precio_unitario DECIMAL  NOT NULL , 
     stock_actual    DECIMAL  NOT NULL , 
     stock_minimo    DECIMAL NOT NULL,
	 CONSTRAINT INSUMO_PK PRIMARY KEY ( id_insumo ),
	 CONSTRAINT ck_stock_actual  CHECK( stock_actual >0),
	 CONSTRAINT ck_stock_minimo  CHECK(stock_minimo >0) 
    );



CREATE TABLE negocio.VENTA_INSUMO 
    ( 
     id_venta_insumo SERIAL , 
     fecha           TIMESTAMP   NOT NULL , 
     total            DECIMAL  NOT NULL , 
     estado_pagado   VARCHAR (20)  NOT NULL , 
     id_productor     SERIAL,
	 CONSTRAINT PK_VENTA_INSUMO PRIMARY KEY ( id_venta_insumo ),
	 CONSTRAINT FK_PRODUCTOR_VENTA_INSUMO FOREIGN KEY(id_productor) 
    REFERENCES  negocio.PRODUCTOR (id_productor ) 
    );


CREATE TABLE negocio.SEGUIMIENTO_SIEMBRA 
    ( 
     id_seguimiento    SERIAL , 
     fecha_visita      DATE  NOT NULL , 
     peso_promedio     DECIMAL  NOT NULL , 
     cantidad_estimada INTEGER  NOT NULL , 
     condicion_agua    VARCHAR(50)  NOT NULL , 
     estado_salud      VARCHAR(50)  NOT NULL , 
     observaciones     VARCHAR(100) , 
     apto_cosecha      CHAR (1)  NOT NULL , 
     id_siembra         SERIAL  NOT NULL,
	 CONSTRAINT PK_SEGUIMIENTO_SIEMBRA PRIMARY KEY ( id_seguimiento ),
	 CONSTRAINT FK_SIEMBRA_SEGUIMIENTO FOREIGN KEY ( id_siembra ) 
    REFERENCES negocio.SIEMBRA  (id_siembra) 
    );

CREATE TABLE negocio.TURNOS_PESCA 
    ( 
     id_turno         SERIAL, 
     fecha_programada  DATE  NOT NULL , 
     hora_programada   TIMESTAMP  NOT NULL , 
     tipo_prioridad    VARCHAR (20) , 
     motivo_emergencia VARCHAR(50)  NOT NULL , 
     estado            VARCHAR(20)  NOT NULL , 
     id_siembra         SERIAL  NOT NULL , 
     id_productor       SERIAL  NOT NULL,
	 CONSTRAINT PK_TURNOS_PESCA PRIMARY KEY ( id_turno ),
	 CONSTRAINT FK_PRODUCTOR_TURNOS_PESCA FOREIGN KEY ( id_productor ) 
    REFERENCES negocio.PRODUCTOR  (id_productor),
    CONSTRAINT FK_SIEMBRA_TURNOS_PESCA FOREIGN KEY  (id_siembra) 
    REFERENCES  negocio.SIEMBRA(id_siembra) 
    ) ;



CREATE TABLE negocio.RECEPCION 
    ( 
     id_recepcion    SERIAL , 
     fecha_hora      TIMESTAMP   NOT NULL , 
     kilos_recibidos DECIMAL  NOT NULL , 
     observaciones   VARCHAR (100), 
     id_productor     SERIAL NOT NULL , 
     id_turno        SERIAL  NOT NULL,
	 CONSTRAINT PK_RECEPCION PRIMARY KEY ( id_recepcion ),
	 CONSTRAINT FK_PRODUCTOR_RECEPCION FOREIGN KEY  (id_productor) 
    REFERENCES negocio.PRODUCTOR(id_productor),
	CONSTRAINT FK_TURNOS_PESCA_RECEPCION FOREIGN KEY  ( id_turno) 
    REFERENCES  negocio.TURNOS_PESCA  (id_turno),
	CONSTRAINT ck_kilos_recibidos  CHECK( kilos_recibidos >0)

    );


CREATE TABLE negocio.PAGO_PRODUCTOR 
    ( 
     id_pago        SERIAL , 
     fecha_pago     TIMESTAMP  NOT NULL , 
     monto           DECIMAL    NOT NULL , 
     precio_kg       DECIMAL  NOT NULL , 
     kilos_pagados   DECIMAL  NOT NULL , 
     estado         VARCHAR (20)  NOT NULL , 
     id_productor    SERIAL, 
     id_recepcion    SERIAL  NOT NULL , 
     id_metodo_pago  SERIAL  NOT NULL ,
	 CONSTRAINT PK_PAGO_PRODUCTOR PRIMARY KEY ( id_pago ),
	 CONSTRAINT FK_METODO_PAGO_PAGO_PRODUCTOR FOREIGN KEY(id_metodo_pago) 
    REFERENCES negocio.METODO_PAGO (id_metodo_pago),
	CONSTRAINT FK_PRODUCTOR_PAGO_PRODUCTOR FOREIGN KEY (id_productor) 
    REFERENCES negocio.PRODUCTOR (id_productor),
	 CONSTRAINT FK_RECEPCION_PAGO_PRODUCTOR FOREIGN KEY (id_recepcion) 
    REFERENCES negocio.RECEPCION (id_recepcion),
	CONSTRAINT ck_kilos_pagados  CHECK(kilos_pagados >0)
    );


CREATE TABLE  negocio.DETALLE_VENTA_INSUMO 
    ( 
     id_detalle_venta SERIAL, 
	 id_venta_insumo  SERIAL  NOT NULL , 
     cantidad         INTEGER  NOT NULL , 
     precio_unitario  DECIMAL (10,2)  NOT NULL , 
     subtotal         DECIMAL (10,2)  NOT NULL , 
     id_insumo        SERIAL  NOT NULL,
	CONSTRAINT PK_DETALLE_VENTA_INSUMO PRIMARY KEY ( id_detalle_venta, id_venta_insumo ),
	CONSTRAINT FK_INSUMO_DETALLE_INSUMO FOREIGN KEY  (id_insumo) 
    REFERENCES  negocio.INSUMO ( id_insumo),
	CONSTRAINT FK_VENTA_INSUMO_DETALLE_INSUMO FOREIGN KEY( id_venta_insumo ) 
    REFERENCES negocio.VENTA_INSUMO ( id_venta_insumo),
	CONSTRAINT ck_cantidad  CHECK( cantidad >0)
    );



CREATE TABLE negocio.LOTE_CUARTO_FRIO 
    ( 
     id_lote         SERIAL, 
     codigo_lote     VARCHAR(15)  NOT NULL , 
     fecha_ingreso   TIMESTAMP  NOT NULL , 
     kilos           DECIMAL NOT NULL , 
     espacio_ocupado DECIMAL  NOT NULL , 
     estado          BOOLEAN , 
     id_recepcion    SERIAL NOT NULL,
	 CONSTRAINT PK_LOTE_CUARTO_FRIO PRIMARY KEY ( id_lote ),
	 CONSTRAINT FK_RECEPCION_LOTE_CUARTO_FRIO FOREIGN KEY  (id_recepcion) 
    REFERENCES negocio.RECEPCION (id_recepcion),
	CONSTRAINT CK_estado  CHECK (estado  IN ('Y', 'N'))
    );


CREATE TABLE negocio.PROCESAMIENTO 
    ( 
     id_procesamiento SERIAL , 
     etapa            VARCHAR (20)  NOT NULL , 
     fecha            TIMESTAMP   NOT NULL , 
     responsable      VARCHAR(20)  NOT NULL , 
     observaciones    VARCHAR(100)  NOT NULL , 
     id_lote           SERIAL  NOT NULL ,
	 CONSTRAINT PK_PROCESAMIENTO PRIMARY KEY ( id_procesamiento ),
	 CONSTRAINT FK_LOTE_PROCESAMIENTO FOREIGN KEY(id_lote ) 
    REFERENCES  negocio.LOTE_CUARTO_FRIO (id_lote) 
    );


CREATE TABLE negocio.ENVIO 
    ( 
     id_envio       SERIAL, 
     fecha_envio    TIMESTAMP  NOT NULL , 
     destino_ciudad VARCHAR (30)  NOT NULL , 
     tipo_destino   VARCHAR (25)  NOT NULL , 
     estado         VARCHAR (20)  NOT NULL , 
     observaciones  VARCHAR (100) , 
     id_cliente     SERIAL , 
     id_punto       SERIAL, 
	 CONSTRAINT PK_ENVIO PRIMARY KEY ( id_envio ),
	 CONSTRAINT FK_CLIENTE_ENVIO FOREIGN KEY(id_cliente) 
    REFERENCES negocio.CLIENTE  (id_cliente ),
	CONSTRAINT FK_PUNTO_VENTA_ENVIO FOREIGN KEY ( id_punto) 
    REFERENCES negocio.PUNTO_VENTA ( id_punto ) 
    );


CREATE TABLE negocio.DETALLE_ENVIO 
    ( 
     id_detalle_envio SERIAL,
	 id_envio    SERIAL  NOT NULL , 
     kilos            DECIMAL (10,2)  NOT NULL , 
     precios_kg       DECIMAL (10,2)  NOT NULL , 
     subtotal         DECIMAL (10,2)  NOT NULL , 
     id_lote          SERIAL NOT NULL, 
	 CONSTRAINT PK_DETALLE_ENVIO PRIMARY KEY (id_detalle_envio,id_envio ),
	 CONSTRAINT FK_ENVIO_DETALLE_ENVIO FOREIGN KEY (id_envio) 
    REFERENCES negocio.ENVIO (id_envio ),
	CONSTRAINT FK_LOTE_DETALLE_ENVIO FOREIGN KEY  (id_lote) 
    REFERENCES negocio.LOTE_CUARTO_FRIO (id_lote) 
	);
   

CREATE TABLE negocio.INGRESO 
    ( 
     id_ingreso      SERIAL, 
     fecha           TIMESTAMP NOT NULL , 
     concepto        VARCHAR (100) , 
     monto           DECIMAL(10,2)  NOT NULL , 
     tipo_origen     VARCHAR (30)  NOT NULL , 
     id_envio         SERIAL , 
     id_venta_insumo  SERIAL,
	 CONSTRAINT PK_INGRESO PRIMARY KEY ( id_ingreso ),
	  CONSTRAINT FK_ENVIO_INGRESO FOREIGN KEY (id_envio) 
    REFERENCES negocio.ENVIO (id_envio),
	CONSTRAINT FK_VENTA_INSUMO_INGRESO FOREIGN KEY (id_venta_insumo) 
    REFERENCES negocio.VENTA_INSUMO  (id_venta_insumo) 
    );



-- ============================================================
-- TABLA: procesamiento
-- Registra las etapas del ciclo de procesamiento del pescado.
-- Se crea la primera etapa (PESAJE) al registrar una recepción.
-- Al completar DISTRIBUCION (última etapa), el sistema crea
-- automáticamente el lote en el cuarto frío.
--
-- Flujo: Recepción → PESAJE → EVISCERADO → LIMPIEZA
--                 → CONGELAMIENTO → DISTRIBUCION → LoteCuartoFrio
-- ============================================================

-- Si ya existe una versión anterior con id_lote, eliminarla:
DROP TABLE IF EXISTS negocio.procesamiento;

CREATE TABLE negocio.procesamiento (
    id_procesamiento SERIAL PRIMARY KEY,
    etapa            VARCHAR(20)  NOT NULL,
    -- PESAJE | EVISCERADO | LIMPIEZA | CONGELAMIENTO | DISTRIBUCION
    estado           VARCHAR(20)  NOT NULL,
    -- EN_PROCESO | COMPLETADO
    fecha_inicio     TIMESTAMP,
    fecha_fin        TIMESTAMP,
    responsable      VARCHAR(60),
    observaciones    VARCHAR(150),
    id_recepcion     INT NOT NULL REFERENCES negocio.recepcion(id_recepcion)
);

    CREATE INDEX IF NOT EXISTS idx_procesamiento_recepcion
        ON negocio.procesamiento(id_recepcion);


-- ============================================================
-- MIGRACIÓN v2: lote_cuarto_frio
-- Agrega estado_decision e id_envio
-- ============================================================

-- 1. Columna para la decisión (PENDIENTE_DECISION | ALMACENADO | DESPACHADO)
ALTER TABLE negocio.lote_cuarto_frio
    ADD COLUMN IF NOT EXISTS estado_decision VARCHAR(20) DEFAULT 'PENDIENTE_DECISION';

-- 2. Columna para el envío generado al despachar de inmediato
ALTER TABLE negocio.lote_cuarto_frio
    ADD COLUMN IF NOT EXISTS id_envio INT REFERENCES negocio.envio(id_envio);

-- 3. Actualizar lotes existentes que ya tienen estado definido
--    (los que ya estaban marcados como disponibles quedan como ALMACENADO)
UPDATE negocio.lote_cuarto_frio
SET estado_decision = 'ALMACENADO'
WHERE estado = true AND estado_decision = 'PENDIENTE_DECISION';

UPDATE negocio.lote_cuarto_frio
SET estado_decision = 'DESPACHADO'
WHERE estado = false AND estado_decision = 'PENDIENTE_DECISION';

-- 4. Verificar
SELECT id_lote, codigo_lote, kilos, estado, estado_decision
FROM negocio.lote_cuarto_frio
ORDER BY id_lote;


---- MODELO PARA CONECTAR ALMACENAMIENTO CON LOGISTICA -------------


-- ============================================================
-- MIGRACIÓN: Módulo de Logística
-- Agrega tabla detalle_envio_lote para relacionar envíos con
-- múltiples lotes del cuarto frío.
-- ============================================================

-- Tabla de detalle: qué lotes van en cada envío
CREATE TABLE IF NOT EXISTS negocio.detalle_envio_lote (
    id_detalle   SERIAL PRIMARY KEY,
    id_envio     INT NOT NULL REFERENCES negocio.envio(id_envio),
    id_lote      INT NOT NULL REFERENCES negocio.lote_cuarto_frio(id_lote),
    kilos        DECIMAL(10,2) NOT NULL,
    observaciones VARCHAR(100),
    UNIQUE (id_envio, id_lote)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_detalle_envio_lote_envio ON negocio.detalle_envio_lote(id_envio);
CREATE INDEX IF NOT EXISTS idx_detalle_envio_lote_lote  ON negocio.detalle_envio_lote(id_lote);

-- Migrar los envíos ya creados desde Almacenamiento:
-- si un lote tiene id_envio, insertarlo en detalle_envio_lote
INSERT INTO negocio.detalle_envio_lote (id_envio, id_lote, kilos)
SELECT l.id_envio, l.id_lote, l.kilos
FROM negocio.lote_cuarto_frio l
WHERE l.id_envio IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verificar
SELECT e.id_envio, e.destino_ciudad, e.estado, COUNT(d.id_lote) AS lotes
FROM negocio.envio e
LEFT JOIN negocio.detalle_envio_lote d ON d.id_envio = e.id_envio
GROUP BY e.id_envio, e.destino_ciudad, e.estado
ORDER BY e.id_envio;




-- ============================================================
-- DATOS INICIALES: clientes y puntos de venta de ASOPISTAR
-- Ejecutar en pgAdmin sobre la base de datos asopistar
-- ============================================================

-- ── Clientes ────────────────────────────────────────────────────────────────
INSERT INTO negocio.cliente (nombre1, apellido1, tipo, ciudad, telefono, email, direccion)
VALUES
  ('Carlos',    'Martínez',  'MAYORISTA',   'Ocaña',         '3001234567', 'carlos@correo.com',   'Cra 5 # 10-20, Ocaña'),
  ('Ana',       'Rodríguez', 'RESTAURANTE', 'Cúcuta',        '3109876543', 'ana@correo.com',      'Av 0 # 15-30, Cúcuta'),
  ('Luis',      'Pérez',     'MINORISTA',   'Bucaramanga',   '3205556677', 'luis@correo.com',     'Cll 30 # 22-10, Bucaramanga'),
  ('Marleny',   'Torres',    'MAYORISTA',   'Ábrego',        '3154443322', 'marleny@correo.com',  'Cra 3 # 5-40, Ábrego'),
  ('Ferneini',  'Contreras', 'RESTAURANTE', 'El Tarra',      '3116667788', 'ferni@correo.com',    'Vda El Carmen, El Tarra'),
  ('Distribuidora', 'Norte', 'MAYORISTA',   'Cúcuta',        '3008889900', 'dnorte@correo.com',   'Zona Industrial, Cúcuta')
ON CONFLICT DO NOTHING;

-- ── Puntos de venta de ASOPISTAR ─────────────────────────────────────────────
INSERT INTO negocio.punto_venta (nombre, ciudadd, direccion, activo)
VALUES
  ('Punto Físico El Tarra', 'El Tarra', 'Calle Principal s/n, El Tarra, Norte de Santander', true),
  ('Punto Físico Cúcuta',   'Cúcuta',   'Av. Libertadores # 8-45, Cúcuta, Norte de Santander', true)
ON CONFLICT DO NOTHING;

-- Verificar
SELECT 'CLIENTES' AS tabla, COUNT(*) AS total FROM negocio.cliente
UNION ALL
SELECT 'PUNTOS_VENTA', COUNT(*) FROM negocio.punto_venta;



INSERT INTO negocio.metodo_pago (nombre, descripcion, estado) VALUES
  ('Efectivo',         'Pago en efectivo en oficina',             'ACTIVO'),
  ('Transferencia',    'Transferencia bancaria o PSE',            'ACTIVO'),
  ('Nequi',            'Pago por billetera digital Nequi',        'ACTIVO'),
  ('Daviplata',        'Pago por billetera digital Daviplata',    'ACTIVO'),
  ('Cheque',           'Pago mediante cheque bancario',           'ACTIVO');












  ------------------- CAMBIO DE ROLES --------------------------------------------


  -- ============================================================
-- ASOPISTAR — Migración Fase 1: Sistema de Registro y Aprobación
-- Ejecutar en orden. Ninguna tabla existente se elimina.
-- Schema: negocio
-- ============================================================

-- ── 1. Nuevas columnas en negocio.usuario ───────────────────
--    Se agregan sin afectar filas existentes (nullable o con DEFAULT)

ALTER TABLE negocio.usuario
    ADD COLUMN IF NOT EXISTS documento        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS telefono         VARCHAR(15),
    ADD COLUMN IF NOT EXISTS cargo_solicitado VARCHAR(50),
    ADD COLUMN IF NOT EXISTS estado           VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    ADD COLUMN IF NOT EXISTS token_verificacion   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS fecha_expiracion_token TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_nacimiento  DATE,
    ADD COLUMN IF NOT EXISTS cantidad_hijos    INTEGER,
    ADD COLUMN IF NOT EXISTS direccion         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS fecha_aprobacion  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS aprobado_por      INTEGER REFERENCES negocio.usuario(id_usuario),
    ADD COLUMN IF NOT EXISTS motivo_rechazo    VARCHAR(255);

-- Comentario de columnas para documentación
COMMENT ON COLUMN negocio.usuario.estado IS
    'PENDIENTE_VERIFICACION | PENDIENTE_APROBACION | ACTIVO | RECHAZADO | INACTIVO';
COMMENT ON COLUMN negocio.usuario.cargo_solicitado IS
    'Cargo que el usuario seleccionó al registrarse. El admin asigna el rol real al aprobar.';
COMMENT ON COLUMN negocio.usuario.token_verificacion IS
    'UUID de 36 caracteres enviado al correo para verificar la cuenta.';

-- ── 2. Los usuarios admin ya existentes quedan en estado ACTIVO ─
--    El DEFAULT 'ACTIVO' ya los cubre, pero lo explicitamos
UPDATE negocio.usuario
SET    estado = 'ACTIVO'
WHERE  activo = true
  AND  estado = 'ACTIVO';   -- no-op seguro, confirma el default

-- ── 3. Roles nuevos requeridos por el nuevo modelo de negocio ──
--    Solo inserta si no existen (idempotente)

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'ADMINISTRADOR_GENERAL', 'Acceso total al sistema, gestión de usuarios y aprobaciones'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'ADMINISTRADOR_GENERAL');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'PRODUCTOR', 'Acceso a calendario de pesca, historial propio e insumos'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'PRODUCTOR');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'BIOLOGO', 'Registro de seguimientos, monitoreos y visitas técnicas'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'BIOLOGO');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'GERENTE_PLANTA', 'Gestión de recepciones, procesamiento y almacenamiento'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'GERENTE_PLANTA');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'PERSONAL_CUARTO_FRIO', 'Registro de procesamiento y actualización de lotes'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'PERSONAL_CUARTO_FRIO');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'CONTADORA', 'Gestión de pagos, ingresos y reportes financieros'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'CONTADORA');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'SECRETARIA', 'Registro administrativo, productores y reportes'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'SECRETARIA');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'GERENTE_COMERCIAL', 'Gestión de logística, ventas, clientes y reportes comerciales'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'GERENTE_COMERCIAL');

INSERT INTO negocio.rol (nombre, descripcion)
SELECT 'VENDEDOR_INSUMOS', 'Registro de ventas de concentrado y alevinos'
WHERE NOT EXISTS (SELECT 1 FROM negocio.rol WHERE nombre = 'VENDEDOR_INSUMOS');

-- ── 4. Ampliar longitud del email en usuario ─────────────────
--    30 chars es muy justo para emails reales
ALTER TABLE negocio.usuario
    ALTER COLUMN email TYPE VARCHAR(100);

-- ── 5. Ampliar longitud del email en cliente (mismo motivo) ──
ALTER TABLE negocio.cliente
    ALTER COLUMN email TYPE VARCHAR(100);

-- ── 6. Tabla de historial de solicitudes de acceso ──────────
--    Guarda el rastro de cada aprobación/rechazo para auditoría
CREATE TABLE IF NOT EXISTS negocio.historial_solicitud (
    id_historial   SERIAL PRIMARY KEY,
    id_usuario     INT NOT NULL REFERENCES negocio.usuario(id_usuario),
    accion         VARCHAR(30) NOT NULL,   -- APROBADO | RECHAZADO | REENVIO_VERIFICACION
    realizado_por  INT REFERENCES negocio.usuario(id_usuario),
    fecha_accion   TIMESTAMP NOT NULL DEFAULT NOW(),
    observacion    VARCHAR(255)
);

COMMENT ON TABLE negocio.historial_solicitud IS
    'Auditoría de aprobaciones, rechazos y reenvíos de verificación de usuarios.';

-- ── 7. Índices útiles para las consultas frecuentes ──────────
CREATE INDEX IF NOT EXISTS idx_usuario_estado
    ON negocio.usuario(estado);

CREATE INDEX IF NOT EXISTS idx_usuario_token
    ON negocio.usuario(token_verificacion)
    WHERE token_verificacion IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_historial_usuario
    ON negocio.historial_solicitud(id_usuario);

-- ── 8. Verificación final ────────────────────────────────────
--    Ejecuta esto para confirmar que todo quedó bien
DO $$
BEGIN
    RAISE NOTICE '=== Verificación de migración ASOPISTAR ===';
    RAISE NOTICE 'Columnas en negocio.usuario: %',
        (SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = 'negocio' AND table_name = 'usuario');
    RAISE NOTICE 'Total roles: %',
        (SELECT COUNT(*) FROM negocio.rol);
    RAISE NOTICE 'Tabla historial_solicitud existe: %',
        (SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'negocio' AND table_name = 'historial_solicitud'
        ));
    RAISE NOTICE '=== Migración completada exitosamente ===';
END $$;


---------------------- ACTUALIZACION DE ROL ADMIN PARA PRUEBAS -----------

UPDATE negocio.usuario
SET id_rol = (SELECT id_rol FROM negocio.rol WHERE nombre = 'ADMINISTRADOR_GENERAL'),
    estado = 'ACTIVO',
    activo = true
WHERE email = 'admin@asopistar.com';



-- ============================================================
-- ASOPISTAR — Migración Módulo de Insumos
-- V2__modulo_insumos_migracion.sql
-- Ejecutar sobre la BD existente (schema: negocio)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Ampliar negocio.insumo con campos faltantes
-- ──────────────────────────────────────────────────────────────
ALTER TABLE negocio.insumo
    ADD COLUMN IF NOT EXISTS codigo       VARCHAR(15),
    ADD COLUMN IF NOT EXISTS descripcion  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS estado       VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    ADD COLUMN IF NOT EXISTS fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE;

-- Restricción de estado válido
ALTER TABLE negocio.insumo
    DROP CONSTRAINT IF EXISTS ck_insumo_estado;
ALTER TABLE negocio.insumo
    ADD CONSTRAINT ck_insumo_estado
    CHECK (estado IN ('ACTIVO', 'INACTIVO'));

-- Restricción de tipo válido
ALTER TABLE negocio.insumo
    DROP CONSTRAINT IF EXISTS ck_insumo_tipo;
ALTER TABLE negocio.insumo
    ADD CONSTRAINT ck_insumo_tipo
    CHECK (tipo IN ('ALEVINO', 'CONCENTRADO', 'OTRO'));

-- Unicidad de código (cuando se asigne)
CREATE UNIQUE INDEX IF NOT EXISTS uq_insumo_codigo
    ON negocio.insumo(codigo)
    WHERE codigo IS NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- 2. Corregir FK de venta_insumo (era SERIAL, debe ser INT)
--    SERIAL en FK es un error: no debe auto-incrementar
--    Si la columna ya existe correctamente, este bloque no hace daño
-- ──────────────────────────────────────────────────────────────
-- Nota: si id_productor fue creado como SERIAL en venta_insumo,
-- la secuencia asociada no hace daño funcional pero es semánticamente
-- incorrecto. El tipo subyacente de SERIAL es INTEGER, así que
-- la FK funciona. No se necesita ALTER TYPE aquí.

-- ──────────────────────────────────────────────────────────────
-- 3. Nueva tabla: negocio.movimiento_insumo
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS negocio.movimiento_insumo (
    id_movimiento    SERIAL PRIMARY KEY,
    fecha            TIMESTAMP   NOT NULL DEFAULT NOW(),
    tipo_movimiento  VARCHAR(20) NOT NULL,   -- ENTRADA, SALIDA, AJUSTE
    motivo           VARCHAR(30) NOT NULL,   -- COMPRA, DONACION, VENTA, PERDIDA, DANO, AJUSTE_ADMIN, CORRECCION
    cantidad         DECIMAL(10, 2) NOT NULL,
    stock_antes      DECIMAL(10, 2) NOT NULL,
    stock_despues    DECIMAL(10, 2) NOT NULL,
    observacion      VARCHAR(150),
    id_insumo        INT         NOT NULL REFERENCES negocio.insumo(id_insumo),
    id_usuario       INT         NOT NULL REFERENCES negocio.usuario(id_usuario),
    id_venta_insumo  INT         REFERENCES negocio.venta_insumo(id_venta_insumo),

    CONSTRAINT ck_mov_tipo
        CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    CONSTRAINT ck_mov_motivo
        CHECK (motivo IN (
            'COMPRA', 'DONACION', 'AJUSTE_ADMIN', 'CORRECCION',   -- entradas
            'VENTA', 'PERDIDA', 'DANO'                             -- salidas
        )),
    CONSTRAINT ck_mov_cantidad
        CHECK (cantidad > 0),
    CONSTRAINT ck_mov_stock_antes
        CHECK (stock_antes >= 0),
    CONSTRAINT ck_mov_stock_despues
        CHECK (stock_despues >= 0)
);

COMMENT ON TABLE negocio.movimiento_insumo IS
    'Auditoría completa de movimientos de inventario de insumos';

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_mov_insumo
    ON negocio.movimiento_insumo(id_insumo);
CREATE INDEX IF NOT EXISTS idx_mov_fecha
    ON negocio.movimiento_insumo(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mov_tipo
    ON negocio.movimiento_insumo(tipo_movimiento);

-- ──────────────────────────────────────────────────────────────
-- 4. Datos de ejemplo (opcional — comentar en producción)
-- ──────────────────────────────────────────────────────────────
-- INSERT INTO negocio.insumo
--     (nombre, tipo, unidad_medida, precio_unitario, stock_actual, stock_minimo,
--      codigo, descripcion, estado, fecha_creacion)
-- VALUES
--     ('Cachama',        'ALEVINO',    'unidad', 350.00,  5000, 500,  'ALE-001', 'Alevino de cachama blanca',     'ACTIVO', CURRENT_DATE),
--     ('Tilapia Roja',   'ALEVINO',    'unidad', 280.00,  8000, 1000, 'ALE-002', 'Alevino de tilapia roja',       'ACTIVO', CURRENT_DATE),
--     ('Purina 40%',     'CONCENTRADO','bulto',  85000.00, 120,   20,  'CON-001', 'Concentrado iniciación 40%',   'ACTIVO', CURRENT_DATE),
--     ('Purina 32%',     'CONCENTRADO','bulto',  75000.00, 200,   30,  'CON-002', 'Concentrado engorde 32%',      'ACTIVO', CURRENT_DATE),
--     ('Concentrado Eng','CONCENTRADO','bulto',  70000.00,  80,   15,  'CON-003', 'Concentrado engorde genérico', 'ACTIVO', CURRENT_DATE);

-- ──────────────────────────────────────────────────────────────
-- 5. Verificación post-migración
-- ──────────────────────────────────────────────────────────────
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'negocio' AND table_name = 'insumo'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'negocio' AND table_name = 'movimiento_insumo'
-- ORDER BY ordinal_position;






-- ── PASO 1: Eliminar el DEFAULT automático de la columna ──────
ALTER TABLE negocio.venta_insumo
    ALTER COLUMN id_productor DROP DEFAULT;

-- ── PASO 2: Eliminar la secuencia huérfana ────────────────────
DROP SEQUENCE IF EXISTS negocio.venta_insumo_id_productor_seq;

-- ── PASO 3: Verificar que quedó limpio ───────────────────────
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'negocio'
  AND table_name   = 'venta_insumo'
  AND column_name  = 'id_productor';





----------------------- CREACION DEL MODULO CLIENTE -------------------

-- ============================================================
--  ASOPISTAR — Migración tabla cliente → modelo B2B
--  Ejecutar en PostgreSQL sobre la BD: asopistar
--  Schema: negocio
-- ============================================================

-- PASO 1: Eliminar tabla antigua (vacía, sin datos de producción)
DROP TABLE IF EXISTS negocio.cliente CASCADE;

-- PASO 2: Crear tabla cliente empresarial B2B
CREATE TABLE negocio.cliente (
    id_cliente            SERIAL PRIMARY KEY,

    -- Identificación empresarial
    tipo_documento        VARCHAR(20)   NOT NULL,          -- NIT, CC, CE, PASAPORTE
    numero_documento      VARCHAR(20)   NOT NULL UNIQUE,
    nit                   VARCHAR(20)   NOT NULL UNIQUE,   -- NIT con dígito verificación
    razon_social          VARCHAR(100)  NOT NULL,

    -- Clasificación
    tipo_cliente          VARCHAR(30)   NOT NULL,          -- DISTRIBUIDOR, PUNTO_DE_VENTA, EMPRESA, COMERCIALIZADORA, OTRO
    clasificacion_comercial VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- PREFERENCIAL, ACTIVO, INACTIVO, BLOQUEADO

    -- Contacto principal
    nombre_contacto       VARCHAR(60)   NOT NULL,
    cargo_contacto        VARCHAR(50)   NOT NULL,
    telefono              VARCHAR(15)   NOT NULL,
    telefono_secundario   VARCHAR(15),
    correo                VARCHAR(80)   NOT NULL UNIQUE,
    correo_secundario     VARCHAR(80),

    -- Ubicación
    direccion             VARCHAR(120)  NOT NULL,
    ciudad                VARCHAR(60)   NOT NULL,
    departamento          VARCHAR(60)   NOT NULL,

    -- Información comercial
    limite_credito        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    observaciones         VARCHAR(300),

    -- Estado y auditoría
    estado                VARCHAR(20)   NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, INACTIVO, BLOQUEADO
    fecha_creacion        TIMESTAMP     NOT NULL DEFAULT NOW(),
    fecha_actualizacion   TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_cliente_razon_social    ON negocio.cliente (LOWER(razon_social));
CREATE INDEX idx_cliente_nit             ON negocio.cliente (nit);
CREATE INDEX idx_cliente_tipo            ON negocio.cliente (tipo_cliente);
CREATE INDEX idx_cliente_estado          ON negocio.cliente (estado);
CREATE INDEX idx_cliente_clasificacion   ON negocio.cliente (clasificacion_comercial);
CREATE INDEX idx_cliente_ciudad          ON negocio.cliente (ciudad);

-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================
INSERT INTO negocio.cliente (
    tipo_documento, numero_documento, nit, razon_social, tipo_cliente,
    clasificacion_comercial, nombre_contacto, cargo_contacto,
    telefono, correo, direccion, ciudad, departamento,
    limite_credito, estado
) VALUES
(
    'NIT', '900123456', '900123456-1',
    'Distribuidora Norte S.A.S', 'DISTRIBUIDOR',
    'PREFERENCIAL', 'Carlos Ramírez', 'Gerente de Compras',
    '3001234567', 'distribuidoranorte@gmail.com',
    'Calle 5 #10-20', 'Cúcuta', 'Norte de Santander',
    10000000.00, 'ACTIVO'
),
(
    'NIT', '800987654', '800987654-2',
    'Comercializadora del Sur Ltda', 'COMERCIALIZADORA',
    'ACTIVO', 'María López', 'Directora Comercial',
    '3109876543', 'comercializadorasur@hotmail.com',
    'Carrera 12 #34-56', 'Ocaña', 'Norte de Santander',
    5000000.00, 'ACTIVO'
),
(
    'NIT', '700456789', '700456789-3',
    'Pescadería El Buen Sabor', 'PUNTO_DE_VENTA',
    'ACTIVO', 'Pedro Gómez', 'Propietario',
    '3205551234', 'buensabor@pescados.com',
    'Av. Principal #7-90', 'Tibú', 'Norte de Santander',
    2000000.00, 'ACTIVO'
);



------------------ CREACION DEL MODULO PUNTOS DE VENTA --------------------

-- ============================================================
--  MIGRACIÓN: Expandir tabla negocio.punto_venta
--  Ejecutar en pgAdmin o psql ANTES de arrancar el backend
--  con las nuevas entidades.
--  Es seguro: solo agrega columnas con DEFAULT / nullable.
-- ============================================================

-- 1. Corregir el typo en la columna "ciudadd" → "ciudad"
ALTER TABLE negocio.punto_venta
    RENAME COLUMN ciudadd TO ciudad;

-- 2. Agregar columnas nuevas (todas nullable o con DEFAULT para no romper datos existentes)
ALTER TABLE negocio.punto_venta
    ADD COLUMN IF NOT EXISTS codigo             VARCHAR(15),
    ADD COLUMN IF NOT EXISTS tipo               VARCHAR(20)  DEFAULT 'PROPIO',
    ADD COLUMN IF NOT EXISTS departamento       VARCHAR(40),
    ADD COLUMN IF NOT EXISTS responsable        VARCHAR(60),
    ADD COLUMN IF NOT EXISTS cargo_responsable  VARCHAR(50),
    ADD COLUMN IF NOT EXISTS telefono           VARCHAR(15),
    ADD COLUMN IF NOT EXISTS correo             VARCHAR(60),
    ADD COLUMN IF NOT EXISTS fecha_apertura     DATE,
    ADD COLUMN IF NOT EXISTS observaciones      VARCHAR(200),
    ADD COLUMN IF NOT EXISTS estado             VARCHAR(20)  DEFAULT 'ACTIVO',
    ADD COLUMN IF NOT EXISTS fecha_creacion     TIMESTAMP    DEFAULT NOW();

-- 3. Migrar la columna "activo" a "estado" para los registros ya existentes
UPDATE negocio.punto_venta
SET estado = CASE WHEN activo = TRUE THEN 'ACTIVO' ELSE 'INACTIVO' END
WHERE estado IS NULL OR estado = 'ACTIVO';

-- 4. Asegurarse de que todos los registros existentes tengan fecha_creacion
UPDATE negocio.punto_venta
SET fecha_creacion = NOW()
WHERE fecha_creacion IS NULL;

-- Verificación rápida
SELECT id_punto, codigo, nombre, tipo, ciudad, departamento,
       responsable, estado, fecha_creacion
FROM negocio.punto_venta
LIMIT 5;




------------------------- CREACION DEL MODULO ENVIO --------------------------------

-- ============================================================
--  MIGRACIÓN: Expandir tabla negocio.envio
--  Ejecutar en pgAdmin ANTES de arrancar el backend actualizado.
--  Solo agrega columnas nuevas — no toca nada existente.
-- ============================================================

-- 1. Agregar columnas nuevas al envío
ALTER TABLE negocio.envio
    ADD COLUMN IF NOT EXISTS codigo_guia           VARCHAR(20),
    ADD COLUMN IF NOT EXISTS fecha_preparacion     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_salida          TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_entrega_estimada DATE,
    ADD COLUMN IF NOT EXISTS fecha_entrega_real     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS empresa_transportadora VARCHAR(60),
    ADD COLUMN IF NOT EXISTS nombre_conductor       VARCHAR(60),
    ADD COLUMN IF NOT EXISTS telefono_conductor     VARCHAR(15),
    ADD COLUMN IF NOT EXISTS placa_vehiculo         VARCHAR(10),
    ADD COLUMN IF NOT EXISTS tipo_vehiculo          VARCHAR(30),
    ADD COLUMN IF NOT EXISTS observacion_entrega    VARCHAR(200),
    ADD COLUMN IF NOT EXISTS nombre_receptor        VARCHAR(60);

-- 2. Poblar fecha_preparacion con fecha_envio para registros existentes
UPDATE negocio.envio
SET fecha_preparacion = fecha_envio
WHERE fecha_preparacion IS NULL;

-- 3. Agregar estado CANCELADO al check constraint si existe
--    (Si no hay constraint en el estado, este bloque no aplica)
-- ALTER TABLE negocio.envio DROP CONSTRAINT IF EXISTS envio_estado_check;

-- 4. Generar códigos de guía para los envíos existentes que no tienen
UPDATE negocio.envio
SET codigo_guia = CONCAT(
    'GUIA-',
    TO_CHAR(COALESCE(fecha_envio, NOW()), 'YYYY'),
    '-',
    LPAD(id_envio::TEXT, 5, '0')
)
WHERE codigo_guia IS NULL;

-- 5. Crear índice único para codigo_guia
CREATE UNIQUE INDEX IF NOT EXISTS idx_envio_codigo_guia
    ON negocio.envio(codigo_guia);

-- Verificación
SELECT id_envio, codigo_guia, estado, fecha_preparacion,
       empresa_transportadora, nombre_conductor
FROM negocio.envio
ORDER BY id_envio
LIMIT 10;


----Correción de null en id_cliente y id_punto ---------

-- Corregir columnas de destino para que sean nullable
-- Solo una de las dos tendrá valor según el tipo_destino
ALTER TABLE negocio.envio
    ALTER COLUMN id_punto   DROP NOT NULL;

ALTER TABLE negocio.envio
    ALTER COLUMN id_cliente DROP NOT NULL;

-- Verificar
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'negocio'
  AND table_name   = 'envio'
  AND column_name  IN ('id_punto', 'id_cliente');




--------------------------- CREACION DEL MODULO INGRESOS ASOCIADOS A VENTAS ----------

-- ============================================================
-- MIGRACIÓN: Módulo de Registro de Ingresos - ASOPISTAR
-- Versión: V2
-- Descripción: Amplía la tabla ingreso existente y crea la
--              tabla pago_ingreso para historial de abonos.
--
-- ⚠️  IMPORTANTE: La tabla negocio.INGRESO ya existe.
--     Solo se agregan columnas nuevas con ALTER TABLE.
--     No se toca ninguna tabla existente.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. AMPLIAR TABLA INGRESO (ya existe, solo se añaden campos)
-- ────────────────────────────────────────────────────────────

-- Número de ingreso secuencial legible (ej: ING-2024-0001)
ALTER TABLE negocio.ingreso
    ADD COLUMN IF NOT EXISTS numero_ingreso   VARCHAR(20)    UNIQUE,
    ADD COLUMN IF NOT EXISTS tipo_ingreso     VARCHAR(30),         -- VENTA_PESCADO | VENTA_ALEVINOS | VENTA_CONCENTRADO | OTRO
    ADD COLUMN IF NOT EXISTS id_cliente       INT            REFERENCES negocio.cliente(id_cliente),
    ADD COLUMN IF NOT EXISTS valor_total      DECIMAL(14,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS valor_pagado     DECIMAL(14,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS saldo_pendiente  DECIMAL(14,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estado_pago      VARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | PARCIAL | PAGADO | ANULADO
    ADD COLUMN IF NOT EXISTS referencia       VARCHAR(60),
    ADD COLUMN IF NOT EXISTS fecha_creacion   TIMESTAMP      DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;

-- Actualizar las filas existentes para que tengan valores coherentes
UPDATE negocio.ingreso
SET
    valor_total     = monto,
    valor_pagado    = monto,
    saldo_pendiente = 0,
    estado_pago     = 'PAGADO',
    tipo_ingreso    = tipo_origen,
    fecha_creacion  = fecha
WHERE numero_ingreso IS NULL;

-- Generar numero_ingreso para registros existentes
UPDATE negocio.ingreso
SET numero_ingreso = 'ING-' || TO_CHAR(fecha, 'YYYY') || '-' || LPAD(id_ingreso::TEXT, 4, '0')
WHERE numero_ingreso IS NULL;

-- Hacer el campo NOT NULL ahora que todos tienen valor
ALTER TABLE negocio.ingreso
    ALTER COLUMN numero_ingreso SET NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 2. NUEVA TABLA: pago_ingreso (historial de abonos)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS negocio.pago_ingreso (
    id_pago_ingreso  SERIAL          PRIMARY KEY,
    id_ingreso       INT             NOT NULL REFERENCES negocio.ingreso(id_ingreso),
    fecha_pago       TIMESTAMP       NOT NULL DEFAULT NOW(),
    valor_pago       DECIMAL(14,2)   NOT NULL,
    id_metodo_pago   INT             NOT NULL REFERENCES negocio.metodo_pago(id_metodo_pago),
    referencia       VARCHAR(60),
    observaciones    VARCHAR(200),
    registrado_por   VARCHAR(80),     -- email del usuario que registró
    CONSTRAINT ck_valor_pago CHECK (valor_pago > 0)
);

CREATE INDEX IF NOT EXISTS idx_pago_ingreso_ingreso ON negocio.pago_ingreso(id_ingreso);

-- ────────────────────────────────────────────────────────────
-- 3. ÍNDICES en ingreso para búsquedas frecuentes
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ingreso_estado_pago  ON negocio.ingreso(estado_pago);
CREATE INDEX IF NOT EXISTS idx_ingreso_tipo         ON negocio.ingreso(tipo_ingreso);
CREATE INDEX IF NOT EXISTS idx_ingreso_cliente      ON negocio.ingreso(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ingreso_fecha        ON negocio.ingreso(fecha);

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================


-- ============================================================
-- FIX: Permitir NULL en id_envio e id_venta_insumo de ingreso
-- El schema original los declaró como SERIAL (NOT NULL implícito)
-- pero son opcionales según el tipo de ingreso.
-- ============================================================

-- Quitar la constraint NOT NULL heredada del SERIAL original
ALTER TABLE negocio.ingreso
    ALTER COLUMN id_envio       DROP NOT NULL,
    ALTER COLUMN id_venta_insumo DROP NOT NULL;

-- Cambiar el tipo de SERIAL a INT para que acepten NULL correctamente
ALTER TABLE negocio.ingreso
    ALTER COLUMN id_envio        TYPE INT,
    ALTER COLUMN id_venta_insumo TYPE INT;




-- ============================================================
-- FIX: Agregar prefijo ROLE_ a todos los roles en la BD
--
-- El problema: la BD tiene "ADMINISTRADOR_GENERAL" pero
-- Spring Security espera "ROLE_ADMINISTRADOR_GENERAL".
-- El JWT se genera desde los roles de la BD, así que
-- si no tienen el prefijo, hasAuthority() siempre falla.
--
-- Ejecutar en pgAdmin contra la BD 'asopistar'.
-- Es idempotente: no hace nada si ya tienen el prefijo.
-- ============================================================

-- Ver estado actual antes del fix:
SELECT id_rol, nombre FROM negocio.rol ORDER BY id_rol;

-- Aplicar prefijo ROLE_ solo a los que aún no lo tienen
UPDATE negocio.rol
SET nombre = 'ROLE_' || nombre
WHERE nombre NOT LIKE 'ROLE_%';

-- Verificar resultado:
SELECT id_rol, nombre FROM negocio.rol ORDER BY id_rol;

-- ⚠️  IMPORTANTE: después de ejecutar este script,
-- cierra sesión en la app y vuelve a hacer login
-- para que el JWT nuevo ya traiga los roles correctos.



-- ============================================================
-- DIAGNÓSTICO: verificar qué usuarios tienen qué rol
-- ============================================================

SELECT u.id_usuario, u.nombre1, u.apellido1, u.email, r.nombre AS rol
FROM negocio.usuario u
JOIN negocio.rol r ON u.id_rol = r.id_rol
ORDER BY r.nombre;

-- ============================================================
-- Si algún usuario tiene id_rol = 1 (ROLE_ADMIN) y debería
-- ser ADMINISTRADOR_GENERAL, actualízalo:
-- ============================================================

-- Ver cuántos usuarios tienen el rol ROLE_ADMIN (id_rol=1):
SELECT COUNT(*) FROM negocio.usuario WHERE id_rol = 1;

-- Si el resultado es > 0, cambia esos usuarios al rol correcto
-- (reemplaza 2 por el id_rol de ROLE_ADMINISTRADOR_GENERAL según tu tabla):
UPDATE negocio.usuario
SET id_rol = (SELECT id_rol FROM negocio.rol WHERE nombre = 'ROLE_ADMINISTRADOR_GENERAL')
WHERE id_rol = (SELECT id_rol FROM negocio.rol WHERE nombre = 'ROLE_ADMIN');

-- Opcional: eliminar el rol ROLE_ADMIN si ya no tiene usuarios:
DELETE FROM negocio.rol
WHERE nombre = 'ROLE_ADMIN'
  AND NOT EXISTS (SELECT 1 FROM negocio.usuario u WHERE u.id_rol = negocio.rol.id_rol);

-- Verificar resultado final:
SELECT r.id_rol, r.nombre, COUNT(u.id_usuario) AS usuarios
FROM negocio.rol r
LEFT JOIN negocio.usuario u ON u.id_rol = r.id_rol
GROUP BY r.id_rol, r.nombre
ORDER BY r.id_rol;


UPDATE negocio.rol
SET nombre = SUBSTRING(nombre FROM 6)  -- quita los primeros 5 caracteres "ROLE_"
WHERE nombre LIKE 'ROLE_%';





-- ============================================================
-- MIGRACIÓN ASOPISTAR — Sistema de reenvío y auditoría
-- Ejecutar sobre la BD: asopistar  /  Schema: negocio
-- ============================================================

-- ── 1. Nuevas columnas en negocio.usuario ────────────────────
-- Control de reenvíos de correo de verificación
ALTER TABLE negocio.usuario
    ADD COLUMN IF NOT EXISTS cantidad_reenvios  INTEGER      NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ultimo_reenvio     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS error_envio_correo VARCHAR(500);

-- El enum EstadoUsuario ya incluye ERROR_ENVIO_CORREO y SUSPENDIDO;
-- como está mapeado con EnumType.STRING en JPA, Postgres acepta
-- cualquier varchar — no hay tipo ENUM nativo que migrar.
-- Validar que la columna estado acepte los nuevos valores:
-- (Si en tu BD la columna estado es un tipo enum de Postgres,
--  ejecuta estas líneas; si es VARCHAR, omítelas.)
-- ALTER TYPE negocio.estado_usuario_enum ADD VALUE IF NOT EXISTS 'ERROR_ENVIO_CORREO';
-- ALTER TYPE negocio.estado_usuario_enum ADD VALUE IF NOT EXISTS 'SUSPENDIDO';


-- ── 2. Tabla de auditoría ────────────────────────────────────
CREATE TABLE IF NOT EXISTS negocio.auditoria_usuario (
    id_auditoria    SERIAL PRIMARY KEY,
    id_usuario      INT          NOT NULL REFERENCES negocio.usuario(id_usuario),
    fecha           TIMESTAMP    NOT NULL DEFAULT NOW(),
    accion          VARCHAR(50)  NOT NULL,
    -- Valores de accion:
    --   REGISTRO, CORREO_ENVIADO, CORREO_REENVIADO, ERROR_ENVIO_CORREO,
    --   VERIFICACION_REALIZADA, APROBACION_MANUAL, APROBACION_NORMAL,
    --   RECHAZO, ACTIVACION, SUSPENSION, DESACTIVACION
    id_admin        INT          REFERENCES negocio.usuario(id_usuario),
    observaciones   VARCHAR(500)
);

-- Índices útiles para filtrar por usuario y por fecha
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario  ON negocio.auditoria_usuario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha     ON negocio.auditoria_usuario(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion    ON negocio.auditoria_usuario(accion);
