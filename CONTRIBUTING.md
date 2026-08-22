# Guía de Contribución - Second Brain

Gracias por contribuir a **Second Brain**. Este documento establece las directrices de arquitectura, estándares de código, flujo de ramas Git y convenciones de commits para mantener la calidad y consistencia del proyecto.

---

## 1. Flujo de Ramas Git (Branch Strategy)

El proyecto utiliza una estrategia de desarrollo basada en ramas de características y sincronización controlada:

* **`main`**: Rama de producción y código estable. Solo recibe código probado y validado.
* **`dev-tryhard-gabo`**: Rama principal de desarrollo e integración de características principales.
* **`dev-carlos`**: Rama de trabajo colaborativo y prototipado de nuevas funcionalidades.

### Ciclo de Trabajo Estándar:

1. **Sincronizar rama local antes de iniciar:**
   ```bash
   git checkout dev-tryhard-gabo
   git pull origin dev-tryhard-gabo
   ```

2. **Desarrollar y validar cambios:**
   ```bash
   pnpm build
   ```

3. **Crear commit semántico:**
   ```bash
   git add .
   git commit -m "feat(profile): implement centered settings modal with webp avatar compression"
   git push origin dev-tryhard-gabo
   ```

4. **Sincronización con `main` y ramas activas:**
   ```bash
   git checkout main
   git merge dev-tryhard-gabo
   git push origin main
   ```

---

## 2. Convención de Commits (Conventional Commits)

Todos los mensajes de commit deben seguir el estándar de **Conventional Commits**:

```text
<tipo>(<alcance>): <descripción corta en imperativo>
```

### Tipos Permitidos:
* **`feat`**: Nueva funcionalidad (ej: `feat(ai): add user context input for task breakdown`).
* **`fix`**: Corrección de un error o bug (ej: `fix(auth): resolve session redirection on page refresh`).
* **`refactor`**: Reestructuración de código sin cambiar funcionalidad (ej: `refactor(profile): convert drawer into central modal`).
* **`style`**: Cambios de diseño, CSS, alineación o Tailwind (ej: `style(sidebar): add area color accent borders`).
* **`docs`**: Modificaciones o adiciones en documentación (ej: `docs(readme): add mermaid architecture diagram`).
* **`chore`**: Tareas de configuración, dependencias o tooling (ej: `chore(deps): update lucide-react`).

---

## 3. Estándares de Código y Diseño

### Reglas Críticas:
1. **Directiva de Cero Emojis:** Prohibido el uso de emojis en código fuente, interfaces de usuario (UI), mensajes de error y documentación. Usar exclusivamente iconos vectoriales de `lucide-react`.
2. **TypeScript Estricto:** Prohibido el uso de `any`. Todos los modelos de datos deben estar tipados en `src/types/database.types.ts`.
3. **Tailwind CSS v4 & Dark Mode:** Mantener la paleta oficial (`#090d16`, `#0d1117`, `#161b22`, `border-white/10`).
4. **Optimización de Imágenes:** Todo archivo subido a Supabase Storage debe ser optimizado previamente en el cliente a formato WebP utilizando `src/lib/imageOptimizer.ts`.
5. **Compatibilidad con App Router:** En componentes que utilicen hooks de React (`useState`, `useEffect`, `useRef`), incluir siempre `"use client";` en la primera línea.

---

## 4. Verificación y Testing Local

Antes de enviar cualquier commit o abrir un Pull Request, es obligatorio ejecutar la validación de compilación:

```bash
# Validar compilación de TypeScript y Turbopack
pnpm build
```

Si el comando termina con código 0 y sin errores de tipos, los cambios están listos para ser integrados.
