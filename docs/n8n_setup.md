# 🤖 Guía de Configuración de n8n para Second Brain

Esta guía detalla los 5 pasos para conectar tus flujos automatizados de **n8n** con el Second Brain y recibir reportes diarios en **Telegram**.

---

## 1. Variables de Entorno en n8n
Configura las siguientes variables de entorno en tu instancia de n8n (o dentro del apartado de *Variables / Credentials*):

```env
SITE_URL=https://tu-dominio-o-ngrok.app
N8N_API_KEY=tu_clave_secreta_configurada_en_nextjs
TELEGRAM_CHAT_ID=tu_telegram_chat_id
```

> **Nota:** La clave `N8N_API_KEY` debe coincidir exactamente con el valor definido en tu archivo `.env.local` de Next.js.

---

## 2. Crear y Conectar el Bot de Telegram
1. Abre Telegram y busca a `@BotFather`.
2. Envía el comando `/newbot` y sigue las instrucciones para obtener el **Bot Token**.
3. En n8n, dirígete a **Credentials** > **Add Credential** > **Telegram API**.
4. Pega el Access Token generado por BotFather.
5. Inicia conversación con tu bot o agrégalo a tu canal/grupo, y obtén tu `TELEGRAM_CHAT_ID` enviando un mensaje y consultando `https://api.telegram.org/bot<TOKEN>/getUpdates`.

---

## 3. Importar el Workflow en n8n
1. En tu panel de n8n, haz clic en **Workflows** > **Add Workflow**.
2. En la esquina superior derecha, abre el menú de tres puntos (`...`) y selecciona **Import from File** (o **Import from JSON**).
3. Selecciona el archivo [`docs/n8n_daily_briefing_workflow.json`](file:///c:/GithubProjects/mi-app-diaria/docs/n8n_daily_briefing_workflow.json).

---

## 4. Estructura de los Nodos
El workflow contiene 4 nodos automáticos:
* **Schedule Trigger 06:00:** Disparador diario a las 06:00 AM (Zona `America/Caracas`).
* **Fetch Today Entries (HTTP Request):** Ejecuta `GET` a `/api/webhook/n8n?horizon=hoy` validando la cabecera `x-n8n-api-key`.
* **Format Daily Briefing (Code Node):** Agrupa las tareas por áreas (`💼 Trabajo`, `🎓 Universidad`, `🏋️ Gimnasio`, `💳 Cashea`, `🧠 Personal`) formateando los bloques de subtareas (`todo`) con iconos interactivos.
* **Send Telegram Message:** Despacha el mensaje estructurado con Markdown a tu chat personal.

---

## 5. Prueba y Activación
1. Haz clic en **Test Step** o **Execute Workflow** en n8n para validar que recibes el mensaje en Telegram.
2. Activa el toggle **Active** en la esquina superior derecha del workflow para que se ejecute de forma programada todas las mañanas.
