-- VitaTrack — esquema PostgreSQL (Supabase)
-- Ejecutar en SQL Editor del proyecto Supabase

-- Extensión para UUID si hace falta
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- usuarios (metadatos ligados a auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- perfiles (paciente / doctor)
-- ---------------------------------------------------------------------------
CREATE TYPE public.rol_usuario AS ENUM ('paciente', 'doctor');

CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES public.usuarios (id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL DEFAULT '',
  rol public.rol_usuario,
  telefono TEXT,
  condicion_medica TEXT,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  especialidad TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- vínculo doctor ↔ paciente
-- ---------------------------------------------------------------------------
CREATE TABLE public.doctor_pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  doctor_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, paciente_id),
  CHECK (doctor_id <> paciente_id)
);

-- ---------------------------------------------------------------------------
-- medicamentos
-- ---------------------------------------------------------------------------
CREATE TABLE public.medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  horarios JSONB NOT NULL DEFAULT '[]'::JSONB,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- registro de tomas
-- ---------------------------------------------------------------------------
CREATE TABLE public.registro_medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  medicamento_id UUID NOT NULL REFERENCES public.medicamentos (id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  hora_programada TIME,
  tomado BOOLEAN NOT NULL DEFAULT FALSE,
  tomado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registro_med_fecha ON public.registro_medicamentos (medicamento_id, fecha);

-- ---------------------------------------------------------------------------
-- síntomas
-- ---------------------------------------------------------------------------
CREATE TABLE public.sintomas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  intensidad SMALLINT NOT NULL CHECK (
    intensidad >= 1
    AND intensidad <= 10
  ),
  registrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sintomas_paciente ON public.sintomas (paciente_id, registrado_en DESC);

-- ---------------------------------------------------------------------------
-- signos vitales
-- ---------------------------------------------------------------------------
CREATE TABLE public.signos_vitales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  presion_sistolica SMALLINT,
  presion_diastolica SMALLINT,
  glucosa NUMERIC(6, 2),
  temperatura NUMERIC(4, 1),
  pulso SMALLINT,
  notas TEXT,
  registrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signos_paciente ON public.signos_vitales (paciente_id, registrado_en DESC);

-- ---------------------------------------------------------------------------
-- alertas
-- ---------------------------------------------------------------------------
CREATE TYPE public.tipo_alerta AS ENUM (
  'abandono_tratamiento',
  'presion_elevada',
  'dosis_omitidas',
  'sintomas_repetidos',
  'otra'
);

CREATE TYPE public.severidad_alerta AS ENUM ('info', 'advertencia', 'urgente');

CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  tipo public.tipo_alerta NOT NULL DEFAULT 'otra',
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  severidad public.severidad_alerta NOT NULL DEFAULT 'advertencia',
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  generada_por TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alertas_paciente ON public.alertas (paciente_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- consultas rápidas (mensaje al médico)
-- ---------------------------------------------------------------------------
CREATE TABLE public.consultas_rapidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  paciente_id UUID NOT NULL REFERENCES public.perfiles (id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.perfiles (id) ON DELETE SET NULL,
  asunto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at ()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_perfiles_updated
BEFORE UPDATE ON public.perfiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_medicamentos_updated
BEFORE UPDATE ON public.medicamentos
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- Crear fila en usuarios + perfiles al registrarse (opcional: desde la app)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user ()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.perfiles (id, nombre_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre_completo', '')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.doctor_pacientes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.registro_medicamentos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sintomas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.signos_vitales ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.consultas_rapidas ENABLE ROW LEVEL SECURITY;

-- Helper: soy paciente
CREATE OR REPLACE FUNCTION public.es_paciente (uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles p
    WHERE p.id = uid AND p.rol = 'paciente'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Helper: soy doctor
CREATE OR REPLACE FUNCTION public.es_doctor (uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles p
    WHERE p.id = uid AND p.rol = 'doctor'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Helper: doctor tiene acceso a paciente
CREATE OR REPLACE FUNCTION public.doctor_ve_paciente (doc UUID, pac UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.doctor_pacientes dp
    WHERE dp.doctor_id = doc AND dp.paciente_id = pac
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- usuarios: solo el propio
CREATE POLICY usuarios_select_own ON public.usuarios FOR
SELECT USING (id = auth.uid ());

CREATE POLICY usuarios_insert_own ON public.usuarios FOR
INSERT
WITH
  CHECK (id = auth.uid ());

CREATE POLICY usuarios_update_own ON public.usuarios FOR
UPDATE USING (id = auth.uid ());

-- perfiles: propio; doctor lee pacientes vinculados
CREATE POLICY perfiles_select_own ON public.perfiles FOR
SELECT
  USING (
    id = auth.uid ()
    OR public.doctor_ve_paciente (auth.uid (), id)
  );

CREATE POLICY perfiles_insert_own ON public.perfiles FOR
INSERT
WITH
  CHECK (id = auth.uid ());

CREATE POLICY perfiles_update_own ON public.perfiles FOR
UPDATE USING (id = auth.uid ());

-- doctor_pacientes
CREATE POLICY dp_select ON public.doctor_pacientes FOR
SELECT USING (doctor_id = auth.uid () OR paciente_id = auth.uid ());

CREATE POLICY dp_insert_doctor ON public.doctor_pacientes FOR
INSERT
WITH
  CHECK (doctor_id = auth.uid ());

CREATE POLICY dp_delete ON public.doctor_pacientes FOR DELETE USING (doctor_id = auth.uid ());

-- medicamentos: paciente dueño; doctor lectura si vinculado
CREATE POLICY med_select ON public.medicamentos FOR
SELECT USING (
  paciente_id = auth.uid ()
  OR public.doctor_ve_paciente (auth.uid (), paciente_id)
);

CREATE POLICY med_all_paciente ON public.medicamentos FOR ALL USING (paciente_id = auth.uid ())
WITH
  CHECK (paciente_id = auth.uid ());

-- registro_medicamentos
CREATE POLICY reg_select ON public.registro_medicamentos FOR
SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.medicamentos m
    WHERE
      m.id = registro_medicamentos.medicamento_id
      AND (
        m.paciente_id = auth.uid ()
        OR public.doctor_ve_paciente (auth.uid (), m.paciente_id)
      )
  )
);

CREATE POLICY reg_modify_paciente ON public.registro_medicamentos FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.medicamentos m
    WHERE m.id = registro_medicamentos.medicamento_id AND m.paciente_id = auth.uid ()
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT 1
      FROM public.medicamentos m
      WHERE m.id = registro_medicamentos.medicamento_id AND m.paciente_id = auth.uid ()
    )
  );

-- síntomas
CREATE POLICY sintomas_select ON public.sintomas FOR
SELECT USING (
  paciente_id = auth.uid ()
  OR public.doctor_ve_paciente (auth.uid (), paciente_id)
);

CREATE POLICY sintomas_paciente ON public.sintomas FOR ALL USING (paciente_id = auth.uid ())
WITH
  CHECK (paciente_id = auth.uid ());

-- signos vitales
CREATE POLICY sv_select ON public.signos_vitales FOR
SELECT USING (
  paciente_id = auth.uid ()
  OR public.doctor_ve_paciente (auth.uid (), paciente_id)
);

CREATE POLICY sv_paciente ON public.signos_vitales FOR ALL USING (paciente_id = auth.uid ())
WITH
  CHECK (paciente_id = auth.uid ());

-- alertas
CREATE POLICY alertas_select ON public.alertas FOR
SELECT USING (
  paciente_id = auth.uid ()
  OR public.doctor_ve_paciente (auth.uid (), paciente_id)
);

CREATE POLICY alertas_paciente_update ON public.alertas FOR
UPDATE USING (paciente_id = auth.uid ());

CREATE POLICY alertas_paciente_insert ON public.alertas FOR
INSERT
WITH
  CHECK (paciente_id = auth.uid ());

-- consultas
CREATE POLICY cr_select ON public.consultas_rapidas FOR
SELECT USING (
  paciente_id = auth.uid ()
  OR doctor_id = auth.uid ()
  OR EXISTS (
    SELECT 1
    FROM public.doctor_pacientes dp
    WHERE
      dp.doctor_id = auth.uid ()
      AND dp.paciente_id = consultas_rapidas.paciente_id
  )
);

CREATE POLICY cr_insert_paciente ON public.consultas_rapidas FOR
INSERT
WITH
  CHECK (paciente_id = auth.uid ());

CREATE POLICY cr_update_doctor ON public.consultas_rapidas FOR
UPDATE USING (
  doctor_id = auth.uid ()
  OR paciente_id = auth.uid ()
);

-- ---------------------------------------------------------------------------
-- Realtime (opcional): en SQL Editor, si lo necesitas:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas;
-- ---------------------------------------------------------------------------
