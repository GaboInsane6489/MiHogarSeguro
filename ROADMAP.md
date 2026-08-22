# Roadmap & Registro de Objetivos (Second Brain OS)

Bienvenido al mapa de ruta oficial y registro de evolución de **Second Brain OS**. Este documento establece los hitos completados, las funcionalidades en desarrollo y los objetivos estratégicos a corto, mediano y largo plazo.

---

## 1. Hitos Completados (v1.0 - v1.2)

### Nucleo de Productividad y Workspace
- [x] **Arquitectura Next.js 16 + React 19 + Supabase:** Base de datos Postgres con Row Level Security (RLS) y autenticación segura.
- [x] **Clasificación por Áreas y Horizontes Temporales:** Organización matricial de tareas (Trabajo, Universidad, Gimnasio, Cashea/Finanzas, Personal) cruzada con horizontes (Hoy, Corto, Mediano, Largo Plazo).
- [x] **Modal Centralizado Ejecutivo de Edición:** Edición de tareas con fecha límite, prioridad, bloques estructurados y checklist interactivo.
- [x] **Galería de Archivos Adjuntos:** Subida y gestión de archivos multimedia en Supabase Storage.
- [x] **Fondo de Pantalla Fijo Personalizado:** Soporte para portada/wallpaper de usuario con compresión WebP en cliente y paneles de cristal de alto contraste.
- [x] **Modal Central de Ajustes de Perfil & Contexto de IA:** Pestañas amplias de perfil general y contexto profesional para el modelo de inteligencia artificial.

### Inteligencia Artificial & Copiloto
- [x] **Copiloto AI Centralizado (Modal Console):** Asistente conversacional con memoria contextual de tareas pendientes.
- [x] **Creación de Tareas en 1 Clic:** Detección de intenciones y tarjetas interactivas de creación dentro del chat de IA.
- [x] **Desglose Inteligente con Directivas de Usuario:** Botón `+ Contexto IA` en el modal de tareas para guiar a Gemini con notas específicas.
- [x] **Captura Rápida Asistida con Isotipo Vectorial:** Formulario de entrada rápida con botón de sugerencia inteligente.

### Experiencia Multi-Dispositivo & Responsive
- [x] **Command Hub Móvil de Pantalla Completa:** Menú centralizado táctil para smartphones y tablets con grilla de áreas y píldoras de horizonte.
- [x] **Sidebar Fijo y Espacioso en Escritorio:** Barra lateral con ancho de 80px colapsado y 256px expandido con navegación fluida.
- [x] **Tarjetas de Tareas Adaptables (Anti-Overflow):** Badges dinámicos que se apilan ordenadamente en cualquier resolución de pantalla.

---

## 2. Objetivos a Corto Plazo (v1.3 - v1.4)

### Inteligencia Artificial Conversacional Proactiva
- [ ] **Acciones Autónomas de la IA (Function Calling):** Permitir a la IA editar títulos, cambiar prioridades, reprogramar fechas y agregar subtareas por orden del usuario.
- [ ] **Entrevista Guiada sin Prompts Técnicos:** La IA hace preguntas breves y conversacionales para extraer el contexto paso a paso, eliminando la necesidad de redactar prompts complejos.
- [ ] **Perfilado y Memoria Evolutiva del Usuario:** Aprendizaje automático de los hábitos, horarios más productivos y estilo de trabajo del usuario.
- [ ] **Comando Global de Voz y Atajo de Teclado (`Cmd+K` / `Ctrl+J`):** Apertura instantánea del Copiloto AI desde cualquier parte de la aplicación.

### Captura Rápida & Multimedia
- [ ] **Captura Directa con Cámara Móvil:** Integración nativa para abrir la cámara del smartphone, tomar fotos de apuntes o recibos y asociarlos como adjuntos en segundos.
- [ ] **Reconocimiento Óptico (OCR con IA):** Extraer texto de fotos de pizarras, documentos o facturas para convertirlos automáticamente en tareas estructuradas.

---

## 3. Objetivos a Mediano Plazo (v1.5 - v2.0)

### Gamificación, Niveles y Sistema Social
- [ ] **Sistema de Experiencia (XP) y Niveles de Productividad:** Ganancia de puntos de experiencia al completar tareas según su nivel de prioridad (Baja, Media, Alta, Urgente).
- [ ] **Sistema de Logros e Insignias:** Desbloqueo de medallas por rachas diarias de ejecución, tareas completadas a tiempo y constancia semanal.
- [ ] **Tabla de Clasificación y Comunidad (Leaderboard Social):** Ranking semanal y mensual para comparar volumen y calidad de ejecución con amigos o colegas de trabajo.
- [ ] **Rachas de Hábitos Diarios (*Streaks*):** Micro-indicadores visuales de días consecutivos cumpliendo metas diarias.

### Centro de Notificaciones & Automatizaciones
- [ ] **Notificaciones Push y Webhooks:** Alertas de tareas por vencer y recordatorios matutinos del plan diario.
- [ ] **Integración Bidireccional con n8n y Calendarios:** Sincronización automática con Google Calendar, Notion y Telegram.
- [ ] **Resumen Ejecutivo Semanal Generado por IA:** Informe en PDF / Markdown con análisis de productividad y recomendaciones de mejora.

---

## 4. Objetivos a Largo Plazo (v2.1+)

### Módulos Especializados con Rutas Dedicadas por Área

#### Módulo de Gimnasio & Salud (`/gym`)
- [ ] Registro de rutinas por grupo muscular, series, repeticiones y pesos máximos (1RM).
- [ ] Gráficas de progresión de fuerza y volumen semanal.
- [ ] Cronómetro de descansos integrado entre series.

#### Módulo de Cashea & Finanzas Personales (`/finance`)
- [ ] Calculadora de cuotas Cashea y calendario visual de pagos programados.
- [ ] Gráficas de flujo de caja, gastos recurrentes y presupuesto mensual.
- [ ] Alertas de vencimiento de cuotas para evitar recargos.

#### Módulo de Universidad & Estudio (`/university`)
- [ ] Gestión por semestres, materias y profesores.
- [ ] Calendario de entregas, exámenes y cálculo de promedio ponderado (GPA).
- [ ] Bloques de apuntes integrados con síntesis automática por IA.

#### Módulo de Trabajo & Proyectos (`/work`)
- [ ] Vista de Tablero Kanban con columnas de estado (Backlog, En Progreso, En Revisión, Listo).
- [ ] Gestión de sprints semanales y vinculación con repositorios de GitHub.

---

## 5. Matriz de Estado

| Módulo | Versión Meta | Estado | Prioridad |
| :--- | :--- | :--- | :--- |
| **Copiloto AI Autónomo (Function Calling)** | v1.3 | En Planificación | Alta |
| **Cámara Móvil Directa** | v1.3 | En Planificación | Alta |
| **Sistema de Niveles & XP** | v1.4 | En Diseño | Media |
| **Leaderboard Social & Logros** | v1.5 | En Diseño | Media |
| **Módulos Especializados (Rutas Dedicadas)** | v2.0 | Futuro | Alta |
| **Notificaciones Push & Sincronización** | v2.0 | Futuro | Media |

---

> *Este documento se actualiza periódicamente conforme se completan hitos y se incorporan nuevas propuestas de la comunidad y del equipo de desarrollo.*
