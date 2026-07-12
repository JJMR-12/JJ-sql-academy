# Nortia SQL Academy

Sitio estático de una sola página para aprender SQL en español, con ejercicios que se
ejecutan de verdad (SQLite corriendo en el navegador vía sql.js/WebAssembly) contra una
base de datos ficticia de una empresa ("Nortia Comercial"). No es una serie de ejercicios
de texto simulado: cada consulta que el usuario escribe se ejecuta contra datos reales.

No hay build step (no npm/webpack/etc.), no hay framework: es HTML/CSS/JS plano servido tal
cual. El motor de ejercicios (sql.js) sigue corriendo 100% en el navegador. Lo único que
usa backend es **cuentas y progreso**: hay auth por usuario+contraseña y persistencia de
progreso/intentos en **Supabase** (ver "Backend: cuentas y progreso" abajo). El acceso es
**obligatorio**: sin iniciar sesión no se ve el curso.

## Estructura de carpetas

```
index.html            Esqueleto de la página, todos los ids que app.js referencia
css/styles.css         Todo el CSS (tema oscuro + verde, responsive, sidebar plegable)
js/schema.js           Definición de la base de datos de ejemplo (tablas + datos semilla)
js/lessons.js           Contenido del curso: 14 módulos (teoría + ejemplo + ejercicios)
js/app.js               Lógica de la aplicación (routing, render, ejecución de SQL, auth UI)
js/supabase-api.js      Cliente de Supabase: signup/login/logout, progreso e intentos
.claude/launch.json     Config para levantar un servidor local de previsualización
CLAUDE.md               Este archivo
```

El código de servidor (la Edge Function de registro y el esquema SQL) vive en el proyecto
de Supabase, no en este repo. Ver "Backend: cuentas y progreso".

No hay carpeta `src/`, no hay `package.json`: todo se sirve directo, abriendo `index.html`
o con cualquier servidor estático.

## Qué hace cada archivo

### `index.html`
Contiene el esqueleto fijo de la app: la pantalla de carga (`#loading-screen`), el shell
`#app` (sidebar + topbar + contenedor de contenido), el modal de esquema (`#schema-modal`)
y el toast (`#toast`). Todo el contenido dinámico (qué módulo se ve, resultados de
consultas, etc.) lo inyecta `app.js` en `#module-container`. También contiene la pantalla
de login/registro (`#auth-screen`) y el chip de usuario + botón "Salir" en la topbar. Carga
sql.js (cdnjs 1.10.3) y supabase-js (jsdelivr `@supabase/supabase-js@2`) desde CDN antes de
los scripts propios.

### `css/styles.css`
Un solo archivo de estilos, sin preprocesador. Usa variables CSS en `:root` para toda la
paleta (ver "Decisiones de diseño" abajo). Incluye las reglas responsive (`@media`) para
mobile y la lógica de plegado del sidebar en desktop.

### `js/schema.js`
Define la base de datos de ejemplo "Nortia Comercial": 6 tablas relacionadas
(`departamentos`, `empleados` con jerarquía jefe→subordinado vía `jefe_id`, `clientes`,
`productos`, `pedidos`, `detalle_pedidos`). Los datos están escritos como arrays de
objetos JS (no como SQL crudo) y una función `buildSetupSQL()` arma el `CREATE TABLE` +
`INSERT` final. Los datos son deterministas a propósito (nada de `Math.random()`) porque
las soluciones de los ejercicios dependen de que los datos no cambien entre sesiones.
También expone `SCHEMA_DESCRIPTION` (para el modal "Ver esquema") y `SCHEMA_SQL` (el DDL
en texto, para mostrarlo tal cual).

### `js/lessons.js`
Un array `MODULES` con los 14 módulos del curso. Cada módulo tiene:
`id`, `numero`, `categoria` (Fundamentos/Básico/Intermedio/Avanzado/Profesional),
`titulo`, `resumen`, `contenido` (HTML de teoría), `ejemplo` (`{descripcion, sql}`) y
`ejercicios` (array de `{titulo, enunciado, solucion}`). Todo el texto está en español.
Este archivo es puro contenido/datos, no tiene lógica.

### `js/app.js`
Toda la lógica de la aplicación, en un único IIFE. Responsabilidades:
- Inicializar sql.js y crear la base de datos en memoria a partir de `schema.js`.
- Guardar un snapshot binario inicial (`db.export()`) para poder "Reiniciar base de datos".
- Ejecutar consultas (`runSQL`) y renderizar resultados como tablas HTML, o el mensaje de
  error tal cual lo devuelve SQLite.
- Construir el menú lateral a partir de `MODULES`, agrupado por categoría.
- Manejar la navegación entre secciones (`selectSection`): rutea por `location.hash`,
  soporta recargar en cualquier módulo (deep link) y actualiza qué aparece en el sidebar
  como "activo" o "visitado". El progreso se guarda en **Supabase** vía `supabase-api.js`
  (ya no en `localStorage`).
- Delegación de eventos: un solo listener en el contenedor de contenido maneja todos los
  botones de "Ejecutar", "Ver solución", el playground y el botón "Iniciar" de la home,
  vía atributos `data-action`. Al ejecutar un ejercicio, además registra el intento
  (`logAttempt`) y, si la consulta corre sin error, marca el módulo como "completado".
- Manejar la **pantalla de login/registro** (`#auth-screen`): tabs, submit, validación y
  el gate de acceso (nadie ve el curso sin sesión). Ver "Backend: cuentas y progreso".

## Backend: cuentas y progreso (Supabase)

Todo el estado de usuario vive en un proyecto de **Supabase** (Postgres + Auth + Edge
Functions). El cliente se conecta con la **publishable key** (pública por diseño); la
seguridad real la dan las políticas **RLS**. La URL del proyecto y la key están en
`js/supabase-api.js` (constantes `SUPABASE_URL` / `SUPABASE_KEY`).

**Modelo de auth — usuario+contraseña, sin email.** El usuario solo escribe un nombre de
usuario y una contraseña. Internamente se mapea a un email sintético
`usuario@nortiasqlacademy.com` (constante `EMAIL_DOMAIN`, tanto en `supabase-api.js` como
en la Edge Function — deben coincidir). El dominio debe tener un TLD válido: Supabase
rechaza cosas como `.local`. Nunca se envía correo real a esa dirección.

**Registro vía Edge Function `signup` (clave del diseño).** El registro NO usa
`auth.signUp` del cliente, porque eso dispara el envío de un correo de confirmación (que
para un email sintético nunca llega, y además choca con los límites de envío). En su lugar
hay una Edge Function `signup` desplegada en Supabase que, con la **service_role key**
(inyectada por Supabase, nunca llega al navegador), crea el usuario **ya confirmado**
(`admin.createUser({ email_confirm: true })`) sin enviar correo. El cliente
(`Backend.signUp`) llama a esa función por `fetch` y, si responde OK, hace login normal con
`signInWithPassword`. La función está desplegada con `verify_jwt: false` (endpoint público,
valida usuario/contraseña por su cuenta). Gracias a esto, **los ajustes de Auth del
dashboard (Confirm email, Allow signups) pueden quedar en sus valores seguros por defecto**:
no afectan el flujo.

**Tablas (esquema `public`, todas con RLS "solo el dueño ve/escribe lo suyo"):**
- `profiles` — `id` (→ `auth.users`), `username` (único), `display_name`, `created_at`.
  Se crea sola al registrarse, vía el trigger `on_auth_user_created` →
  `handle_new_user()` (que lee el `username` de la metadata). La función tiene `EXECUTE`
  revocado a `anon`/`authenticated` (endurecimiento; el trigger igual funciona).
- `progress` — `user_id` + `module_id` (PK compuesta), `status` (`visitado` | `completado`),
  `updated_at`. Se hace `upsert`: `visitado` al navegar a un módulo, `completado` al correr
  un ejercicio sin error. El ✓ del sidebar aparece cuando existe cualquier fila del módulo.
- `attempts` — cada "Ejecutar" de un ejercicio: `user_id`, `module_id`, `exercise_index`,
  `sql`, `success`, `error`, `created_at`. Guarda tanto éxitos como fallos (con el mensaje
  de SQLite).

**`js/supabase-api.js` (`window.NortiaBackend`)** encapsula todo esto: `init` (crea cliente
+ recupera sesión), `signUp` (Edge Function), `signIn`, `signOut`, `getProfile`,
`loadProgress`, `saveProgress`, `logAttempt`. Las escrituras de progreso/intentos son
fire-and-forget (no bloquean la UI). La sesión persiste en `localStorage` (la maneja el
propio supabase-js), así que recargar mantiene al usuario logueado.

**Notas operativas:**
- `index.html` carga supabase-js por CDN (jsdelivr, `@supabase/supabase-js@2`) antes de
  `supabase-api.js` y `app.js`.
- Si se cambia `EMAIL_DOMAIN`, hay que cambiarlo en los **dos** lados (cliente + Edge
  Function) y re-desplegar la función.
- Cambios en el esquema o en la función se aplican en Supabase (por MCP o dashboard/CLI),
  no en este repo.

## Cómo está armada la navegación (secciones existentes)

Es una SPA simple con routing por hash, sin ningún router de terceros. Las secciones
posibles (todas viven en el mismo `index.html`, `app.js` decide qué mostrar):

1. **Inicio** (`#home`, `id: "home"`) — pantalla de bienvenida: título "Aprendamos SQL",
   subtítulo y un botón "Iniciar →" que lleva siempre al Playground. Es la página que se
   ve por defecto al abrir la app sin hash en la URL. Se accede también haciendo clic en
   el logo/nombre de la app en la esquina superior del sidebar (`#brand-btn`).
2. **Playground SQL libre** (`#playground`) — editor libre para correr cualquier SQL
   contra la base de ejemplo, sin ejercicio guiado. Botón dedicado en la barra superior
   (no vive en el sidebar).
3. **14 módulos del curso** (`#introduccion`, `#consultas-basicas`, ... `#buenas-practicas`),
   agrupados en el sidebar por categoría: Fundamentos → Básico → Intermedio → Avanzado →
   Profesional. Cada uno tiene teoría, un ejemplo resuelto ejecutable, y 2-4 ejercicios con
   editor + botón "Ejecutar" + botón "Ver solución" (que muestra el código Y ejecuta la
   solución para comparar resultados lado a lado).

Utilidades siempre visibles en la barra superior (no dependen de qué sección se esté
viendo): **Playground SQL libre**, **Ver esquema** (abre un modal con las tablas/columnas
y el DDL completo) y **Reiniciar base de datos** (vuelve al snapshot inicial, útil después
de los ejercicios de INSERT/UPDATE/DELETE/transacciones que sí modifican los datos).

## Decisiones de diseño

- **Tema oscuro con verde sutil**, pedido explícitamente por el usuario. Paleta clave
  (variables CSS en `css/styles.css`):
  - `--bg: #10141a` — fondo neutro del área de contenido principal.
  - `--sidebar-bg: #0a1512` — el sidebar usa un tono verde-negro **distinto** del fondo
    principal a propósito, para que se diferencie visualmente (pedido explícito del
    usuario: "que se diferencie del dark mode").
  - `--accent: #4f9d72` / `--accent-dark: #6cbf8f` — verde apagado, no neón, usado en
    botones primarios, badges, checkmarks de progreso y estados activos.
  - `--panel`, `--panel-alt`, `--border` — grises oscuros para tarjetas de ejercicio,
    inputs y separadores.
  - Colores de resultado: verde apagado para éxito (`--ok`), rojo-salmón apagado para
    error (`--error`) — ambos con fondos oscuros, no los rojos/verdes saturados típicos.
- **Tipografía**: stack de fuentes del sistema (`-apple-system, "Segoe UI", Roboto,
  Helvetica, Arial, sans-serif`) para todo el texto — sin fuentes web externas, para no
  depender de más requests de red. Todo el código SQL, los textarea de ejercicios y los
  bloques `<pre>` usan una pila monoespaciada (`Consolas, "Liberation Mono", Menlo,
  monospace`).
- **Layout**: sidebar fijo a la izquierda (280px) + barra superior sticky con título de
  la sección actual y las acciones globales + área de contenido centrada (max-width 860px)
  con scroll propio.
- **Sidebar plegable**: un solo botón hamburguesa (`#menu-toggle`, arriba a la izquierda)
  sirve para dos cosas según el ancho de pantalla — en desktop (>880px) colapsa el
  sidebar a ancho 0 con transición; en mobile (≤880px) lo desliza como overlay encima
  del contenido. Mismo botón, mismo listener, dos comportamientos vía media queries
  (clases `sidebar-collapsed` y `sidebar-open` respectivamente).
- **Progreso**: se guarda por usuario en **Supabase** (tabla `progress`), mostrando un ✓ en
  el sidebar en vez del número cuando el módulo tiene progreso. Es progreso "por cuenta":
  sigue al usuario entre dispositivos al iniciar sesión. Ver "Backend: cuentas y progreso".
  (Antes era `localStorage` por navegador; se migró a cuentas con auth.)

## Preferencias del usuario (cómo le gusta trabajar este proyecto)

- Contenido siempre en español, tono didáctico, con secciones "En la vida profesional:"
  conectando cada tema con su uso real en el trabajo — esto se pidió implícitamente al
  describir el curso como una guía "para aplicar en la vida profesional".
- Insiste en que los ejercicios sean **SQL real ejecutable**, no un simulacro de texto:
  se eligió sql.js/SQLite en el navegador específicamente por esto.
- Prefiere que las acciones utilitarias (Playground, Ver esquema, Reiniciar base de
  datos) vivan en la barra superior, accesibles desde cualquier sección, en vez de
  enterradas dentro del menú lateral — pidió explícitamente mover el Playground del
  sidebar a la topbar "como está la opción de ver esquema".
- Pidió que el sidebar sea plegable/desplegable y que se distinga visualmente del resto
  del tema oscuro (de ahí el verde-negro del sidebar vs. el gris oscuro neutro del resto).
- Le gusta iterar visualmente: pide cambios de diseño concretos (modo oscuro, colores,
  layout) sobre lo ya construido, no diseños desde cero — conviene, ante nuevos pedidos
  de estilo, ajustar las variables CSS existentes en vez de reescribir el archivo.

## Notas técnicas para retomar el trabajo

- **Sin build step**: cualquier cambio en `.html`, `.css` o `.js` se ve con solo recargar
  el navegador. No hay que compilar ni instalar dependencias de Node.
- **Requiere internet la primera vez**: `index.html` carga `sql.js` desde
  `cdnjs.cloudflare.com`. Si no hay conexión, la pantalla de carga muestra un mensaje de
  error explicando esto.
- **Previsualización local**: `.claude/launch.json` define una configuración llamada
  `sql-academy` que levanta `python -m http.server 8743` en la raíz del proyecto — usarla
  para verificar cambios en el navegador embebido, ya que abrir el `index.html` como
  `file://` directo no funciona en el navegador de prueba (sí funciona en un navegador
  real de escritorio).
- **Los ejercicios de escritura mutan la base compartida**: los módulos de INSERT/UPDATE/
  DELETE, transacciones, vistas e índices modifican la única instancia de `db` en memoria.
  El botón "Reiniciar base de datos" restaura el snapshot original (`initialSnapshot`)
  exportado justo después de crear la base — cualquier cambio futuro a los datos semilla
  en `schema.js` debe mantenerse determinista para no romper las soluciones ya escritas
  en `lessons.js`.
