# VitaTrack — Instrucciones de ejecución

## 1. Estructura de carpetas (resumen)

```
VitaTrack/
├── app/                    # Expo Router: pantallas y navegación
│   ├── (auth)/             # Login y registro
│   ├── (patient)/          # Paciente: tabs + vitales + consulta rápida
│   ├── (doctor)/           # Doctor: tabs + detalle de paciente
│   ├── index.tsx           # Redirección según sesión y rol
│   └── select-role.tsx     # Elección paciente / doctor
├── components/ui/          # Botón con gradiente, tarjetas, pantalla
├── services/               # Supabase, alertas, notificaciones, etc.
├── store/                  # Zustand (auth)
├── hooks/                  # useAuth
├── lib/                    # Supabase, motor de alertas, Gemini (stub), formatos
├── types/                  # Tipos TypeScript
├── supabase/schema.sql     # Esquema PostgreSQL + RLS
├── global.css              # NativeWind / Tailwind
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
└── package.json
```

## 2. Base de datos Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql`.
3. Si el trigger sobre `auth.users` falla por permisos en tu entorno, desactívalo y crea `usuarios` + `perfiles` desde la app al registrarte (la app actualiza `perfiles` tras el registro). En proyectos hosted de Supabase el trigger suele aplicarse sin problema.
4. En **Authentication → Providers**, deja habilitado **Email**.
5. Copia **Project URL** y **anon public** key (Settings → API).

## 3. Variables de entorno

En la raíz del repo:

1. Copia `.env.example` a `.env`.
2. Rellena `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Expo carga automáticamente variables que empiezan por `EXPO_PUBLIC_` (reinicia `npx expo start` tras cambiar `.env`).

## 4. Instalación y arranque

El proyecto usa **Expo SDK 54** (compatible con la **Expo Go** actual de la tienda). Si venías de SDK 52, ejecuta de nuevo `npm install` en la carpeta del proyecto.

```bash
cd VitaTrack
npm install
npx expo start
```

- Escanea el QR con **Expo Go** (Android/iOS) o pulsa `a` / `i` para emulador.
- La primera vez, acepta permisos de notificaciones si el sistema los pide.

## 5. Flujo de demo recomendado

1. **Registro**: crea una cuenta (paciente), elige rol **Paciente**, completa medicamentos, síntomas y signos vitales.
2. **Segunda cuenta (doctor)**: regístrate como **Doctor**, en **Pacientes** vincula el **correo** de la cuenta paciente.
3. Revisa el **panel del doctor**, **alertas** y el **seguimiento** al abrir un paciente.

## 6. Lógica de alertas (local)

- Archivo: `lib/alertEngine.ts` (reglas).
- Persistencia y deduplicación: `services/alertas.ts` (`generarYGuardarAlertasLocales`).
- Integración futura con IA: `lib/gemini.ts` (stub).

## 7. Notas técnicas

- **NativeWind**: estilos con `className` en componentes compatibles; tema en `tailwind.config.js` alineado con `disenos/DESIGN.md`.
- **Gráficas**: `react-native-chart-kit` en signos vitales (paciente y seguimiento médico).
- **Iconos**: `lucide-react-native`.

Si algo no arranca, borra `node_modules` y `.expo`, vuelve a ejecutar `npm install` y `npx expo start -c`.

## 8. Checklist frente al MVP (revisión)

| Requisito | Estado |
| :--- | :--- |
| Expo + TypeScript + Expo Router | OK |
| Zustand, Supabase Auth, RHF + Zod | OK |
| NativeWind, react-native-chart-kit, Expo Notifications, Lucide | OK |
| Tablas SQL + FK + timestamps + RLS (`usuarios`, `perfiles`, `medicamentos`, `registro_medicamentos`, `sintomas`, `signos_vitales`, `alertas`, `doctor_pacientes` + `consultas_rapidas`) | OK |
| Módulo paciente (panel, meds, síntomas, vitales, alertas, consulta, perfil) | OK |
| Módulo doctor (panel, pacientes con prioridad por color, alertas, seguimiento en detalle, perfil) | OK |
| Motor de alertas local + stub Gemini | OK |
| ESLint (`npm run lint`) y TypeScript (`npx tsc --noEmit`) | OK en repo revisado |

## 9. Detalles que puedes pulir tú (no bloquean la demo)

1. **Iconos / splash**: los PNG en `assets/` son mínimos (1×1). Para competencia o tiendas, sustituye por arte final (1024×1024 icono, splash acorde a `app.json`).
2. **EAS Build**: si usas [EAS](https://docs.expo.dev/eas/), ejecuta `eas init` y se añadirá el `projectId` real en `app.json` (se quitó un UUID de relleno que podía confundir).
3. **Consultas rápidas (lado médico)**: la tabla `consultas_rapidas` y las políticas RLS permiten que el doctor lea mensajes si está vinculado; **no hay pantalla dedicada** en la app para la bandeja del médico. Si la quieres en la demo, sería una pantalla nueva que liste `consultas_rapidas` filtrando por `doctor_pacientes`.
4. **Alertas “dosis omitidas”**: la lógica cuenta registros con `tomado = false`. Hoy la app solo inserta tomas positivas al pulsar «Lo tomé». Para que esas alertas disparen en producción, conviene una segunda iteración (registros esperados o comparación horarios vs tomas). Ver comentario en `services/medicamentos.ts`.
5. **`.env`**: sin `EXPO_PUBLIC_SUPABASE_*` la app abre login pero no podrá autenticar; es el comportamiento esperado hasta que configures Supabase.
