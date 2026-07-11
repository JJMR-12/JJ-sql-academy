---
name: revision-final
description: Revisa el sitio "Nortia SQL Academy" completo (local) contra un checklist fijo de calidad -- navegación/botones, vista móvil, textos de relleno, imágenes rotas y tono del copy -- y entrega una lista de problemas priorizada en el chat. Usa este skill siempre que el usuario pida una "revisión final", "revisión completa", "checklist del sitio", "pre-lanzamiento", "antes de publicar", o pregunte "¿está listo el sitio?" / "¿qué falta arreglar?". Este skill SOLO reporta -- nunca edita archivos ni arregla nada por su cuenta, ni siquiera si el usuario dice "arréglalo" en el mismo mensaje; siempre debe esperar confirmación explícita de qué ítems corregir.
---

# Revisión final — Nortia SQL Academy

Este skill audita el sitio local (no la versión publicada en GitHub Pages) contra un
checklist fijo de 5 puntos, y devuelve una lista de problemas priorizada. **No corrige
nada.** El usuario decide después qué arreglar.

## Por qué esto importa

El usuario pidió explícitamente que este skill sea de solo-lectura: quiere ver el
diagnóstico completo antes de decidir qué vale la pena tocar. Arreglar algo sin que lo
haya aprobado —aunque parezca obvio o trivial— rompe la confianza en el skill. Si el
usuario escribe "arréglalo" o "corrige todo" inmediatamente después del reporte, primero
confírmale qué ítems específicos quiere que arregles antes de tocar cualquier archivo.

## Paso 0: levantar el sitio

Usa `preview_start` con `{name: "sql-academy"}` (la config ya existe en
`.claude/launch.json`, sirve la carpeta del proyecto con `python -m http.server 8743`).
No uses la URL de GitHub Pages — este skill audita el código tal como está en disco
ahora mismo, que puede no coincidir con lo último publicado.

Antes de navegar, revisa `read_console_messages` y `preview_logs` para pescar errores
de arranque temprano (por ejemplo si sql.js no cargó).

## Paso 1: recorrer todo el sitio

Visita, en este orden, y deja que cada sección cargue por completo antes de seguir:

1. **Inicio** (`#home`) — el hero "Aprendamos SQL" y el botón "Iniciar →".
2. **Playground SQL libre** (`#playground`) — corre al menos una consulta real para
   confirmar que el motor SQL responde.
3. **Los 14 módulos del curso**, agrupados en Fundamentos / Básico / Intermedio /
   Avanzado / Profesional (usa el sidebar o navega directo por hash: `#introduccion`,
   `#consultas-basicas`, `#funciones-operadores`, `#agregacion-group-by`, `#joins`,
   `#subconsultas`, `#ctes`, `#window-functions`, `#insert-update-delete`,
   `#transacciones`, `#vistas`, `#indices-optimizacion`, `#diseno-normalizacion`,
   `#buenas-practicas`). En cada módulo corre el ejemplo y al menos un ejercicio.
4. El modal **"Ver esquema"**.

No hace falta abrir cada ejercicio de cada módulo uno por uno si el patrón ya se probó
en 3-4 módulos y funciona igual en todos (son generados por la misma plantilla en
`js/app.js`) — pero si encuentras un fallo en uno, sí revisa si se repite en los demás.

## Paso 2: evaluar contra el checklist

Reporta los hallazgos en este orden de prioridad (de más a menos grave). Dentro de cada
categoría, ordena por severidad real, no por orden de aparición.

### 1. Navegación y botones (Crítico/Alto)
Todo lo siguiente debe llevar exactamente a donde promete, sin errores en consola:
- Sidebar: item "🏠 Inicio", el logo/nombre "Nortia SQL Academy" (`#brand-btn`, clickeable
  y con teclado — Enter/Espacio), cada módulo de cada categoría, el check ✓ de progreso.
- Topbar: "Playground SQL libre", "Ver esquema" (abre/cierra el modal, incluyendo click
  fuera del modal para cerrarlo), "Reiniciar base de datos" (debe mostrar el toast).
- El botón "Iniciar →" de Inicio debe llevar al Playground.
- "← Anterior" / "Siguiente →" deben respetar el orden de los 14 módulos y desactivarse
  en los extremos; en Playground el botón debe decir "Empezar el curso →".
- Cada botón "Ejecutar" y "Ver solución" de cada ejercicio (data-action="run-exercise",
  "toggle-solution", "run-example", "run-playground") debe mostrar un resultado o un
  error de SQL legible — nunca quedarse colgado ni tirar un error de JavaScript en consola.
- El botón de menú (`#menu-toggle`) debe plegar/desplegar el sidebar en desktop y
  abrir/cerrar el overlay en mobile.

Cualquier botón que no haga lo que promete, o que genere un error en `read_console_messages`,
es Crítico si rompe la navegación principal (sidebar, topbar, prev/next) y Alto si es un
botón de un ejercicio puntual.

### 2. Vista móvil (Alto)
Usa `resize_window` a preset `mobile` (375x812) y recorre Inicio, un módulo con varios
ejercicios, y una tabla de resultados ancha (por ejemplo el ejercicio de "Detalle completo
de pedidos" en el módulo de JOINs). Verifica:
- El sidebar no se ve simultáneamente con el contenido (debe ser overlay off-canvas).
- La topbar no se corta ni se superpone texto sobre los botones.
- Las tablas de resultados largas hacen scroll horizontal dentro de su propio contenedor
  (`.table-wrap`), no desbordan la página completa.
- Nada de texto queda cortado o ilegible.

### 3. Textos de relleno (Medio)
Busca en `js/lessons.js` y en lo que se renderiza en pantalla cualquier "lorem ipsum",
"TODO", "TBD", "[placeholder]", "texto de prueba" o similar que haya quedado sin
reemplazar. Puedes grep-ear el archivo directamente en vez de navegar todo el sitio para
esto.

### 4. Imágenes rotas (Bajo, normalmente N/A)
Hoy el sitio no usa etiquetas `<img>` (solo emojis/íconos de texto), así que este punto
normalmente no debería arrojar nada. Igual, revisa `read_network_requests` filtrando por
imágenes (`.png`, `.jpg`, `.svg`, `.ico`) por si alguna referencia rota se coló. Si no hay
ninguna, repórtalo como "N/A — el sitio no usa imágenes actualmente" en vez de omitirlo,
para que quede constancia de que se revisó.

### 5. Tono del copy (Bajo/Medio — solo en `js/lessons.js`)
Reglas específicas que el usuario definió para su tono (no las inventes ni las relajes):
- **Trato**: siempre tuteo ("tú"/"escribe tu consulta"). Marca cualquier "usted" o "vos"
  que se haya colado.
- **Formalidad objetivo**: el usuario quiere un tono **más informal y desenfadado** que
  el actual — más chispa, más como le hablarías a un amigo que como un manual técnico.
  El texto actual es didáctico pero bastante serio; no hace falta que reescribas nada,
  pero señala los párrafos que se sientan más secos/formales de lo que el objetivo pide,
  como candidatos a aligerar (esto es una observación de tono, no un bug — repórtalo con
  prioridad más baja que los puntos anteriores).
- **Bloque "En la vida profesional:"**: cada uno de los 14 módulos debe tener uno,
  conectando el tema con su uso real en el trabajo. Si a algún módulo le falta, es un
  hallazgo de prioridad Media (es parte de la estructura pedagógica del curso, no solo
  de tono).
- **Muletillas y relleno verbal**: señala cada ocurrencia de frases como "básicamente",
  "cabe destacar", "en definitiva", "cabe mencionar", "es importante destacar que", y
  similares, con su ubicación (qué módulo).

## Paso 3: reportar

Entrega la lista en el chat con este formato — nada de archivos nuevos, nada de ediciones:

```
## Revisión final — [fecha/hora si es relevante]

### 🔴 Crítico
- [Módulo/elemento] — descripción del problema

### 🟠 Alto
- ...

### 🟡 Medio
- ...

### ⚪ Bajo
- ...

Si una categoría no tiene hallazgos, dilo explícitamente ("Sin hallazgos") en vez de omitirla —
así se sabe que sí se revisó y no que se saltó.
```

Cierra siempre preguntando qué ítems quiere que arregles, y espera su respuesta antes de
tocar cualquier archivo — incluso si pide "arréglalo todo", confirma la lista concreta de
ítems primero.
