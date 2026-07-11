# Nortia SQL Academy

Sitio estático de una sola página para aprender SQL en español, con ejercicios que se
ejecutan de verdad (SQLite corriendo en el navegador vía sql.js/WebAssembly) contra una
base de datos ficticia de una empresa ("Nortia Comercial"). No es una serie de ejercicios
de texto simulado: cada consulta que el usuario escribe se ejecuta contra datos reales.

No hay backend, no hay build step (no npm/webpack/etc.), no hay framework. Es HTML/CSS/JS
plano servido tal cual.

## Estructura de carpetas

```
index.html            Esqueleto de la página, todos los ids que app.js referencia
css/styles.css         Todo el CSS (tema oscuro + verde, responsive, sidebar plegable)
js/schema.js           Definición de la base de datos de ejemplo (tablas + datos semilla)
js/lessons.js           Contenido del curso: 14 módulos (teoría + ejemplo + ejercicios)
js/app.js               Lógica de la aplicación (routing, render, ejecución de SQL)
.claude/launch.json     Config para levantar un servidor local de previsualización
CLAUDE.md               Este archivo
```

No hay carpeta `src/`, no hay `package.json`: todo se sirve directo, abriendo `index.html`
o con cualquier servidor estático.

## Qué hace cada archivo

### `index.html`
Contiene el esqueleto fijo de la app: la pantalla de carga (`#loading-screen`), el shell
`#app` (sidebar + topbar + contenedor de contenido), el modal de esquema (`#schema-modal`)
y el toast (`#toast`). Todo el contenido dinámico (qué módulo se ve, resultados de
consultas, etc.) lo inyecta `app.js` en `#module-container`. Carga sql.js desde un CDN
(cdnjs, versión 1.10.3) antes de los scripts propios.

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
  como "activo" o "visitado" (progreso guardado en `localStorage`).
- Delegación de eventos: un solo listener en el contenedor de contenido maneja todos los
  botones de "Ejecutar", "Ver solución", el playground y el botón "Iniciar" de la home,
  vía atributos `data-action`.

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
- **Progreso**: se guarda en `localStorage` (clave `sqlAcademy_progress_v1`) qué módulos
  ya se visitaron, mostrando un ✓ en el sidebar en vez del número. Es progreso "por
  navegador", no hay cuentas de usuario ni backend.

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
