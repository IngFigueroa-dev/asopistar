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
