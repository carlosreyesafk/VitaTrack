export type RolUsuario = "paciente" | "doctor";

export type TipoAlerta =
  | "abandono_tratamiento"
  | "presion_elevada"
  | "dosis_omitidas"
  | "sintomas_repetidos"
  | "otra";

export type SeveridadAlerta = "info" | "advertencia" | "urgente";

export interface Usuario {
  id: string;
  email: string;
  created_at: string;
}

export interface Perfil {
  id: string;
  nombre_completo: string;
  rol: RolUsuario | null;
  telefono: string | null;
  condicion_medica: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  especialidad: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medicamento {
  id: string;
  paciente_id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistroMedicamento {
  id: string;
  medicamento_id: string;
  fecha: string;
  hora_programada: string | null;
  tomado: boolean;
  tomado_at: string | null;
  created_at: string;
}

export interface Sintoma {
  id: string;
  paciente_id: string;
  descripcion: string;
  intensidad: number;
  registrado_en: string;
  created_at: string;
}

export interface SignoVital {
  id: string;
  paciente_id: string;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  glucosa: number | null;
  temperatura: number | null;
  pulso: number | null;
  notas: string | null;
  registrado_en: string;
  created_at: string;
}

export interface Alerta {
  id: string;
  paciente_id: string;
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
  severidad: SeveridadAlerta;
  leida: boolean;
  generada_por: string;
  created_at: string;
}

export interface DoctorPaciente {
  id: string;
  doctor_id: string;
  paciente_id: string;
  created_at: string;
}

export interface ConsultaRapida {
  id: string;
  paciente_id: string;
  doctor_id: string | null;
  asunto: string;
  mensaje: string;
  estado: string;
  created_at: string;
}

export interface PacienteResumen {
  perfil: Perfil;
  prioridad: "baja" | "media" | "alta";
  adherenciaPct: number;
  alertasActivas: number;
}
