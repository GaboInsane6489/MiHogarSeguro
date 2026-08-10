La Hoja de Ruta Pro: De To-Do List a Sistema Diario
┌─────────────────────────────────────────────────────────┐
│ FASE 1: Persistencia en Base de Datos (Supabase) │
│ • Crear tabla 'tasks' en PostgreSQL. │
│ • Conectar el cliente oficial de Supabase. │
└────────────────────────────┬────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ FASE 2: API Routes y Server Actions (Next.js) │
│ • Crear endpoints en src/app/api/tasks/route.ts. │
│ • Validar payloads con TypeScript estricto. │
└────────────────────────────┬────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ FASE 3: Asistente con IA (Google AI Studio / Gemini) │
│ • Crear un endpoint /api/ai/prioritize. │
│ • Enviar la lista de tareas a la IA para que las ordene │
│ por prioridad según categorías o estimación de tiempo.│
└────────────────────────────┬────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ FASE 4: UI/UX con Tailwind v4 │
│ • Indicadores de carga (loading states), manejo de │
│ errores con try/catch y feedback visual. │
└─────────────────────────────────────────────────────────┘
