/*
  Contenido del curso: un array de módulos. Cada módulo tiene teoría,
  un ejemplo resuelto y una lista de ejercicios con solución.
  app.js se encarga de renderizar todo esto y de ejecutar las consultas
  contra la base de datos de ejemplo (ver schema.js).
*/

const MODULES = [
  // ---------------------------------------------------------------
  {
    id: "introduccion",
    numero: 1,
    categoria: "Fundamentos",
    titulo: "Qué es SQL y cómo está organizada esta base de datos",
    resumen: "Bases de datos relacionales, tablas, filas, columnas y claves.",
    contenido: `
      <p><strong>SQL</strong> (Structured Query Language) es el lenguaje que se usa para hablar con
      una <strong>base de datos relacional</strong>: pedirle datos, insertarlos, modificarlos o borrarlos.
      Lo usan prácticamente todas las empresas del mundo para guardar información de clientes,
      ventas, empleados, inventarios, transacciones bancarias, etc.</p>

      <p>Una base de datos relacional organiza la información en <strong>tablas</strong>, muy parecidas
      a una hoja de Excel: cada tabla tiene <strong>columnas</strong> (los campos, ej. <code>nombre</code>,
      <code>precio</code>) y <strong>filas</strong> (los registros individuales, ej. un cliente concreto).</p>

      <p>Dos conceptos que vas a ver todo el tiempo:</p>
      <ul>
        <li><strong>Clave primaria (PRIMARY KEY):</strong> la columna que identifica de forma única cada
        fila de una tabla (por ejemplo, <code>id</code>).</li>
        <li><strong>Clave foránea (FOREIGN KEY):</strong> una columna que apunta a la clave primaria de
        otra tabla, y así se "conectan" las tablas entre sí. Por ejemplo, <code>empleados.departamento_id</code>
        apunta a <code>departamentos.id</code>.</li>
      </ul>

      <p>SQL se suele dividir en familias de comandos:</p>
      <ul>
        <li><strong>DQL</strong> (consulta): <code>SELECT</code> — lo que más vas a usar en el día a día.</li>
        <li><strong>DML</strong> (modificación de datos): <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>.</li>
        <li><strong>DDL</strong> (definición de estructura): <code>CREATE TABLE</code>, <code>CREATE INDEX</code>, <code>CREATE VIEW</code>.</li>
        <li><strong>TCL</strong> (control de transacciones): <code>BEGIN</code>, <code>COMMIT</code>, <code>ROLLBACK</code>.</li>
      </ul>

      <p>A lo largo de este curso vas a trabajar sobre una base de datos de ejemplo llamada
      <strong>"Nortia Comercial"</strong>, una empresa ficticia con departamentos, empleados, clientes,
      productos, pedidos y el detalle de cada pedido. Puedes ver el esquema completo en cualquier
      momento con el botón <strong>"Ver esquema"</strong> en la parte superior.</p>

      <p><strong>En la vida profesional:</strong> antes de escribir una sola consulta, cualquier
      analista o desarrollador dedica tiempo a entender el <em>modelo de datos</em>: qué tablas existen,
      qué significa cada columna y cómo se relacionan. Ese mapa mental es lo que te permite escribir
      consultas correctas rápido, en lugar de adivinar.</p>
    `,
    ejemplo: {
      descripcion: "Vamos a mirar el contenido completo de la tabla departamentos.",
      sql: `SELECT * FROM departamentos;`,
    },
    ejercicios: [
      {
        titulo: "Explora la tabla de clientes",
        enunciado: "Escribe una consulta que muestre todas las columnas y todas las filas de la tabla clientes.",
        solucion: `SELECT * FROM clientes;`,
      },
      {
        titulo: "Explora la tabla de productos",
        enunciado: "Escribe una consulta que muestre todas las columnas y todas las filas de la tabla productos.",
        solucion: `SELECT * FROM productos;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "consultas-basicas",
    numero: 2,
    categoria: "Básico",
    titulo: "SELECT, WHERE, ORDER BY y LIMIT",
    resumen: "La estructura básica de toda consulta SQL.",
    contenido: `
      <p>La estructura más básica de una consulta es:</p>
      <pre><code>SELECT columna1, columna2
FROM tabla
WHERE condición
ORDER BY columna [ASC | DESC]
LIMIT n;</code></pre>
      <ul>
        <li><code>SELECT</code>: qué columnas quieres ver (puedes usar <code>*</code> para "todas", aunque
        en producción es mejor nombrarlas explícitamente).</li>
        <li><code>FROM</code>: de qué tabla.</li>
        <li><code>WHERE</code>: filtra filas según una condición (<code>=</code>, <code>!=</code>, <code>&gt;</code>,
        <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>).</li>
        <li><code>ORDER BY</code>: ordena el resultado. <code>ASC</code> (ascendente) es el valor por defecto,
        <code>DESC</code> es descendente.</li>
        <li><code>LIMIT</code>: corta el resultado a las primeras <em>n</em> filas.</li>
      </ul>
      <p>También puedes renombrar una columna en el resultado con un <strong>alias</strong> usando <code>AS</code>:
      <code>SELECT salario AS sueldo_mensual FROM empleados;</code></p>

      <p><strong>En la vida profesional:</strong> este patrón (filtrar, ordenar, limitar) es la base del
      90% de los reportes que vas a construir: "los 10 clientes que más compraron", "los pedidos
      pendientes de esta semana", "los productos con menos stock". Dominarlo bien te ahorra tiempo
      todos los días.</p>
    `,
    ejemplo: {
      descripcion: "Empleados que ganan más de 3000, ordenados de mayor a menor salario.",
      sql: `SELECT nombre, salario
FROM empleados
WHERE salario > 3000
ORDER BY salario DESC;`,
    },
    ejercicios: [
      {
        titulo: "Empleados de Tecnología",
        enunciado: "Selecciona nombre y puesto de los empleados cuyo departamento_id sea 3.",
        solucion: `SELECT nombre, puesto FROM empleados WHERE departamento_id = 3;`,
      },
      {
        titulo: "Los 5 productos más caros",
        enunciado: "Muestra nombre y precio de los 5 productos más caros, ordenados de mayor a menor precio.",
        solucion: `SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5;`,
      },
      {
        titulo: "Pedidos pendientes",
        enunciado: "Muestra id, fecha y cliente_id de los pedidos con estado 'pendiente', ordenados por fecha ascendente.",
        solucion: `SELECT id, fecha, cliente_id FROM pedidos WHERE estado = 'pendiente' ORDER BY fecha ASC;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "funciones-operadores",
    numero: 3,
    categoria: "Básico",
    titulo: "LIKE, IN, BETWEEN, NULL y funciones de texto",
    resumen: "Operadores para filtrar con más precisión.",
    contenido: `
      <p>Además de <code>=</code> y <code>&gt;</code>, SQL trae operadores muy útiles:</p>
      <ul>
        <li><code>LIKE 'M%'</code>: busca texto que empiece con "M" (<code>%</code> es "cualquier cosa",
        <code>_</code> es "un solo carácter").</li>
        <li><code>IN ('España', 'México')</code>: el valor debe estar en esa lista.</li>
        <li><code>BETWEEN 50 AND 200</code>: el valor debe estar en ese rango (inclusive).</li>
        <li><code>IS NULL</code> / <code>IS NOT NULL</code>: para comparar con "sin valor" — nunca uses
        <code>= NULL</code>, en SQL eso no funciona como esperarías.</li>
        <li><code>AND</code>, <code>OR</code>, <code>NOT</code>: para combinar condiciones.</li>
      </ul>
      <p>También hay funciones de texto muy comunes: <code>UPPER()</code>, <code>LOWER()</code>,
      <code>LENGTH()</code>, <code>SUBSTR()</code>, y de fecha (en SQLite, <code>strftime('%Y', fecha)</code>
      para extraer el año, por ejemplo).</p>

      <p><strong>En la vida profesional:</strong> <code>NULL</code> es una de las fuentes de bugs más
      comunes para quien empieza con SQL. Un <code>NULL</code> no es "cero" ni "texto vacío": es
      "no tenemos ese dato". Por eso <code>WHERE departamento_id = NULL</code> nunca devuelve nada;
      hay que usar <code>IS NULL</code>.</p>
    `,
    ejemplo: {
      descripcion: "Clientes cuya ciudad empieza con 'M'.",
      sql: `SELECT nombre, ciudad FROM clientes WHERE ciudad LIKE 'M%';`,
    },
    ejercicios: [
      {
        titulo: "Clientes premium de España o México",
        enunciado: "Muestra nombre y pais de los clientes tipo 'premium' cuyo pais sea 'España' o 'México' (usa IN).",
        solucion: `SELECT nombre, pais FROM clientes WHERE tipo = 'premium' AND pais IN ('España', 'México');`,
      },
      {
        titulo: "Productos de precio medio",
        enunciado: "Muestra nombre y precio de los productos cuyo precio esté entre 50 y 200 (usa BETWEEN).",
        solucion: `SELECT nombre, precio FROM productos WHERE precio BETWEEN 50 AND 200;`,
      },
      {
        titulo: "Empleados sin departamento asignado",
        enunciado: "Muestra nombre y puesto de los empleados que no tienen departamento_id asignado (usa IS NULL).",
        solucion: `SELECT nombre, puesto FROM empleados WHERE departamento_id IS NULL;`,
      },
      {
        titulo: "Nombres de clientes en mayúsculas",
        enunciado: "Muestra el nombre de cada cliente convertido a mayúsculas (alias nombre_mayus) junto con su ciudad.",
        solucion: `SELECT UPPER(nombre) AS nombre_mayus, ciudad FROM clientes;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "agregacion-group-by",
    numero: 4,
    categoria: "Básico",
    titulo: "Funciones de agregación y GROUP BY / HAVING",
    resumen: "Resumir muchas filas en una sola cifra por grupo.",
    contenido: `
      <p>Las <strong>funciones de agregación</strong> resumen varias filas en un solo valor:
      <code>COUNT()</code> (cuenta filas), <code>SUM()</code> (suma), <code>AVG()</code> (promedio),
      <code>MIN()</code> y <code>MAX()</code>.</p>
      <p><code>GROUP BY</code> las aplica <em>por grupo</em> en lugar de sobre toda la tabla: por
      ejemplo, "el salario promedio, agrupado por departamento".</p>
      <p><code>HAVING</code> filtra grupos <em>después</em> de agruparlos (por eso se usa con funciones
      de agregación), mientras que <code>WHERE</code> filtra filas <em>antes</em> de agrupar.</p>
      <pre><code>SELECT departamento_id, COUNT(*) AS total_empleados
FROM empleados
GROUP BY departamento_id
HAVING COUNT(*) > 3;</code></pre>

      <p><strong>En la vida profesional:</strong> casi todos los dashboards y reportes ejecutivos
      ("ventas por región", "ticket promedio por mes", "usuarios activos por país") son, en el
      fondo, un <code>GROUP BY</code> con una o dos funciones de agregación.</p>
    `,
    ejemplo: {
      descripcion: "Cantidad de empleados por departamento.",
      sql: `SELECT departamento_id, COUNT(*) AS total_empleados
FROM empleados
GROUP BY departamento_id;`,
    },
    ejercicios: [
      {
        titulo: "Salario promedio por departamento",
        enunciado: "Muestra departamento_id y el salario promedio (AVG) de sus empleados.",
        solucion: `SELECT departamento_id, AVG(salario) AS salario_promedio FROM empleados GROUP BY departamento_id;`,
      },
      {
        titulo: "Departamentos con más de 3 empleados",
        enunciado: "Muestra departamento_id y la cantidad de empleados, solo para los departamentos con más de 3 empleados.",
        solucion: `SELECT departamento_id, COUNT(*) AS total FROM empleados GROUP BY departamento_id HAVING COUNT(*) > 3;`,
      },
      {
        titulo: "Ingresos totales por producto",
        enunciado: "Desde detalle_pedidos, muestra producto_id y la suma de cantidad * precio_unitario (alias ingresos), ordenado de mayor a menor.",
        solucion: `SELECT producto_id, SUM(cantidad * precio_unitario) AS ingresos
FROM detalle_pedidos
GROUP BY producto_id
ORDER BY ingresos DESC;`,
      },
      {
        titulo: "Clientes con 2 o más pedidos completados",
        enunciado: "Muestra cliente_id y cuántos pedidos con estado 'completado' tiene, solo para quienes tengan 2 o más.",
        solucion: `SELECT cliente_id, COUNT(*) AS pedidos_completados
FROM pedidos
WHERE estado = 'completado'
GROUP BY cliente_id
HAVING COUNT(*) >= 2;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "joins",
    numero: 5,
    categoria: "Intermedio",
    titulo: "JOIN: combinar tablas relacionadas",
    resumen: "INNER JOIN, LEFT JOIN y self join.",
    contenido: `
      <p>Los datos relacionales viven repartidos en varias tablas a propósito (para no repetir
      información). <code>JOIN</code> te permite juntarlas usando la relación entre clave primaria
      y clave foránea.</p>
      <ul>
        <li><strong>INNER JOIN</strong> (o solo <code>JOIN</code>): devuelve solo las filas que
        tienen coincidencia en ambas tablas.</li>
        <li><strong>LEFT JOIN</strong>: devuelve <em>todas</em> las filas de la tabla izquierda,
        aunque no tengan coincidencia en la derecha (en ese caso, las columnas de la derecha
        quedan en <code>NULL</code>). Muy útil para encontrar "los que no tienen": clientes sin
        pedidos, empleados sin departamento, etc.</li>
        <li><strong>Self join</strong>: una tabla puede unirse consigo misma, útil para relaciones
        como "empleado → su jefe" (ambos están en la tabla <code>empleados</code>).</li>
      </ul>
      <pre><code>SELECT e.nombre AS empleado, d.nombre AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id;</code></pre>
      <p>Fíjate en los <strong>alias de tabla</strong> (<code>e</code>, <code>d</code>): son casi
      obligatorios en cuanto trabajas con más de una tabla, para no repetir el nombre completo y
      para desambiguar columnas que se llaman igual en varias tablas (como <code>id</code>).</p>

      <p><strong>En la vida profesional:</strong> JOIN es probablemente la habilidad más usada de
      SQL en el trabajo real, porque casi ningún dato interesante vive en una sola tabla.</p>
    `,
    ejemplo: {
      descripcion: "Empleados con el nombre de su departamento.",
      sql: `SELECT e.nombre AS empleado, d.nombre AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id;`,
    },
    ejercicios: [
      {
        titulo: "Empleados y su departamento (incluyendo sin asignar)",
        enunciado: "Usa LEFT JOIN para mostrar el nombre del empleado y el nombre del departamento (puede ser NULL) de todos los empleados.",
        solucion: `SELECT e.nombre AS empleado, d.nombre AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.departamento_id = d.id;`,
      },
      {
        titulo: "Cada empleado con el nombre de su jefe",
        enunciado: "Usa un self join sobre empleados para mostrar el nombre del empleado y el nombre de su jefe.",
        solucion: `SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON e.jefe_id = j.id;`,
      },
      {
        titulo: "Detalle completo de pedidos",
        enunciado: "Combina pedidos, clientes, empleados, detalle_pedidos y productos para mostrar: pedido_id, cliente, vendedor, producto y cantidad.",
        solucion: `SELECT p.id AS pedido_id, c.nombre AS cliente, e.nombre AS vendedor,
       pr.nombre AS producto, dp.cantidad
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
JOIN empleados e ON p.empleado_id = e.id
JOIN detalle_pedidos dp ON dp.pedido_id = p.id
JOIN productos pr ON dp.producto_id = pr.id;`,
      },
      {
        titulo: "Clientes que nunca han hecho un pedido",
        enunciado: "Usa LEFT JOIN y busca las filas sin coincidencia (IS NULL) para mostrar el nombre de los clientes sin pedidos.",
        solucion: `SELECT c.nombre
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "subconsultas",
    numero: 6,
    categoria: "Intermedio",
    titulo: "Subconsultas: preguntas dentro de preguntas",
    resumen: "WHERE con subconsultas, EXISTS y subconsultas correlacionadas.",
    contenido: `
      <p>Una <strong>subconsulta</strong> es un <code>SELECT</code> dentro de otro <code>SELECT</code>.
      Se usa cuando la condición que necesitas depende, a su vez, del resultado de otra consulta.</p>
      <pre><code>SELECT nombre, salario
FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados);</code></pre>
      <p>Variantes comunes:</p>
      <ul>
        <li><strong>Subconsulta escalar</strong>: devuelve un solo valor (como el ejemplo de arriba,
        con <code>=</code> o <code>&gt;</code>).</li>
        <li><strong>Subconsulta con IN / NOT IN</strong>: devuelve una lista de valores.</li>
        <li><strong>EXISTS / NOT EXISTS</strong>: pregunta "¿existe al menos una fila que cumpla
        esto?", sin importar cuántas filas devuelva exactamente. Suele ser más eficiente que
        <code>IN</code> con listas grandes.</li>
        <li><strong>Subconsulta correlacionada</strong>: la subconsulta hace referencia a una columna
        de la consulta externa, así que se vuelve a evaluar para cada fila.</li>
      </ul>

      <p><strong>En la vida profesional:</strong> muchas subconsultas se pueden reescribir como JOIN
      y viceversa. Con la práctica vas a desarrollar criterio sobre cuál es más legible o más
      eficiente según el caso; por ahora, enfócate en que el resultado sea correcto.</p>
    `,
    ejemplo: {
      descripcion: "Empleados que ganan más que el salario promedio de toda la empresa.",
      sql: `SELECT nombre, salario
FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados);`,
    },
    ejercicios: [
      {
        titulo: "Productos nunca vendidos",
        enunciado: "Muestra el nombre de los productos cuyo id no aparece en detalle_pedidos (usa NOT IN).",
        solucion: `SELECT nombre FROM productos
WHERE id NOT IN (SELECT producto_id FROM detalle_pedidos);`,
      },
      {
        titulo: "Empleados que ganan más que su jefe",
        enunciado: "Usa una subconsulta correlacionada para mostrar nombre y salario de los empleados cuyo salario es mayor al de su jefe.",
        solucion: `SELECT e.nombre, e.salario
FROM empleados e
WHERE e.salario > (SELECT j.salario FROM empleados j WHERE j.id = e.jefe_id);`,
      },
      {
        titulo: "Clientes con al menos un pedido completado",
        enunciado: "Usa EXISTS para mostrar el nombre de los clientes que tienen al menos un pedido con estado 'completado'.",
        solucion: `SELECT nombre FROM clientes c
WHERE EXISTS (
  SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.estado = 'completado'
);`,
      },
      {
        titulo: "El departamento con mayor presupuesto",
        enunciado: "Muestra el nombre del departamento cuyo presupuesto sea igual al máximo presupuesto de la tabla.",
        solucion: `SELECT nombre FROM departamentos
WHERE presupuesto = (SELECT MAX(presupuesto) FROM departamentos);`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "ctes",
    numero: 7,
    categoria: "Intermedio",
    titulo: "CTEs: consultas con nombre (WITH)",
    resumen: "Organiza consultas complejas en pasos legibles, incluida la recursión.",
    contenido: `
      <p>Un <strong>CTE</strong> (Common Table Expression) es una subconsulta a la que le pones nombre
      con <code>WITH</code>, y que puedes usar como si fuera una tabla en el resto de la consulta.
      Su gran ventaja es la <strong>legibilidad</strong>: rompe una consulta compleja en pasos
      claros, uno encima del otro.</p>
      <pre><code>WITH ventas_por_vendedor AS (
  SELECT p.empleado_id, SUM(dp.cantidad * dp.precio_unitario) AS total
  FROM pedidos p
  JOIN detalle_pedidos dp ON dp.pedido_id = p.id
  GROUP BY p.empleado_id
)
SELECT e.nombre, v.total
FROM ventas_por_vendedor v
JOIN empleados e ON e.id = v.empleado_id
ORDER BY v.total DESC;</code></pre>
      <p>También existen las <strong>CTEs recursivas</strong> (<code>WITH RECURSIVE</code>), pensadas
      para datos jerárquicos: organigramas, categorías con subcategorías, árboles genealógicos. Se
      definen en dos partes: un "caso base" (el punto de partida) y un "caso recursivo" (cómo
      avanzar un nivel más), unidos con <code>UNION ALL</code>.</p>

      <p><strong>En la vida profesional:</strong> cuando una consulta empieza a tener varias
      subconsultas anidadas y se vuelve difícil de leer, es buena señal de que conviene
      reorganizarla con CTEs. Muchos equipos lo exigen como buena práctica en sus revisiones de
      código SQL.</p>
    `,
    ejemplo: {
      descripcion: "Total vendido por cada empleado, calculado primero en un CTE.",
      sql: `WITH ventas_por_vendedor AS (
  SELECT p.empleado_id, SUM(dp.cantidad * dp.precio_unitario) AS total
  FROM pedidos p
  JOIN detalle_pedidos dp ON dp.pedido_id = p.id
  GROUP BY p.empleado_id
)
SELECT e.nombre, v.total
FROM ventas_por_vendedor v
JOIN empleados e ON e.id = v.empleado_id
ORDER BY v.total DESC;`,
    },
    ejercicios: [
      {
        titulo: "Pedidos con total superior a 1000",
        enunciado: "Crea un CTE llamado totales_pedido con el total (cantidad * precio_unitario) por pedido_id, y selecciona del CTE los pedidos con total mayor a 1000.",
        solucion: `WITH totales_pedido AS (
  SELECT pedido_id, SUM(cantidad * precio_unitario) AS total
  FROM detalle_pedidos
  GROUP BY pedido_id
)
SELECT * FROM totales_pedido WHERE total > 1000 ORDER BY total DESC;`,
      },
      {
        titulo: "Jerarquía completa de la empresa (CTE recursiva)",
        enunciado: "Escribe una CTE recursiva que, partiendo de la directora general (jefe_id IS NULL), liste a todos los empleados junto con su nivel jerárquico (0, 1, 2...).",
        solucion: `WITH RECURSIVE jerarquia AS (
  SELECT id, nombre, jefe_id, 0 AS nivel
  FROM empleados
  WHERE jefe_id IS NULL
  UNION ALL
  SELECT e.id, e.nombre, e.jefe_id, j.nivel + 1
  FROM empleados e
  JOIN jerarquia j ON e.jefe_id = j.id
)
SELECT * FROM jerarquia ORDER BY nivel, nombre;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "window-functions",
    numero: 8,
    categoria: "Avanzado",
    titulo: "Funciones de ventana (window functions)",
    resumen: "Rankings, acumulados y comparaciones fila a fila sin perder el detalle.",
    contenido: `
      <p>Las funciones de ventana se parecen a las de agregación (<code>SUM</code>, <code>RANK</code>...)
      pero con una diferencia clave: <strong>no colapsan las filas</strong>. Con <code>GROUP BY</code>
      obtienes una fila por grupo; con <code>OVER()</code> obtienes el cálculo agregado <em>junto a
      cada fila individual</em>.</p>
      <pre><code>SELECT nombre, departamento_id, salario,
       RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC) AS ranking_salario
FROM empleados;</code></pre>
      <ul>
        <li><code>PARTITION BY</code>: divide los datos en grupos, como un <code>GROUP BY</code>, pero
        sin perder las filas.</li>
        <li><code>ORDER BY</code> (dentro del <code>OVER</code>): define el orden para calcular el
        ranking o el acumulado.</li>
        <li><code>ROW_NUMBER()</code>: numera las filas de forma consecutiva y única (1, 2, 3...).</li>
        <li><code>RANK()</code>: igual, pero deja huecos si hay empates (1, 2, 2, 4...).</li>
        <li><code>DENSE_RANK()</code>: como <code>RANK()</code> pero sin huecos (1, 2, 2, 3...).</li>
        <li><code>SUM()</code>/<code>AVG() OVER (...)</code>: totales o promedios acumulados.</li>
        <li><code>LAG()</code> / <code>LEAD()</code>: el valor de la fila anterior / siguiente dentro
        de la partición — perfecto para comparar "este mes vs. el anterior".</li>
      </ul>

      <p><strong>En la vida profesional:</strong> los rankings ("top 3 vendedores del mes"), los
      acumulados ("ventas acumuladas del año") y las comparaciones período a período son de lo
      más pedido en reportes de negocio, y las funciones de ventana son la forma correcta y
      eficiente de resolverlos en SQL.</p>
    `,
    ejemplo: {
      descripcion: "Ranking de salario dentro de cada departamento.",
      sql: `SELECT nombre, departamento_id, salario,
       RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC) AS ranking_salario
FROM empleados;`,
    },
    ejercicios: [
      {
        titulo: "Ranking de vendedores por ingresos",
        enunciado: "Con un CTE, calcula el total vendido por empleado_id, y luego usa RANK() OVER (ORDER BY total DESC) para asignarles un ranking.",
        solucion: `WITH ventas AS (
  SELECT p.empleado_id, SUM(dp.cantidad * dp.precio_unitario) AS total
  FROM pedidos p
  JOIN detalle_pedidos dp ON dp.pedido_id = p.id
  GROUP BY p.empleado_id
)
SELECT empleado_id, total, RANK() OVER (ORDER BY total DESC) AS ranking
FROM ventas;`,
      },
      {
        titulo: "Presupuesto acumulado por ciudad",
        enunciado: "Sobre departamentos, muestra id, nombre, ciudad, presupuesto y el acumulado de presupuesto dentro de cada ciudad (SUM() OVER PARTITION BY ciudad ORDER BY id).",
        solucion: `SELECT id, nombre, ciudad, presupuesto,
       SUM(presupuesto) OVER (PARTITION BY ciudad ORDER BY id) AS acumulado_ciudad
FROM departamentos;`,
      },
      {
        titulo: "El pedido anterior de cada cliente",
        enunciado: "Para cada pedido, muestra cliente_id, fecha y, con LAG(), la fecha del pedido anterior del mismo cliente (ordenado por fecha).",
        solucion: `SELECT cliente_id, fecha,
       LAG(fecha) OVER (PARTITION BY cliente_id ORDER BY fecha) AS fecha_pedido_anterior
FROM pedidos;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "insert-update-delete",
    numero: 9,
    categoria: "Avanzado",
    titulo: "Modificar datos: INSERT, UPDATE y DELETE",
    resumen: "Cómo dar de alta, actualizar y borrar información con seguridad.",
    contenido: `
      <p>Hasta ahora solo leímos datos. Estos tres comandos los modifican:</p>
      <pre><code>INSERT INTO tabla (col1, col2) VALUES (v1, v2);

UPDATE tabla SET columna = nuevo_valor WHERE condición;

DELETE FROM tabla WHERE condición;</code></pre>
      <p><strong>La regla de oro:</strong> <code>UPDATE</code> y <code>DELETE</code> sin
      <code>WHERE</code> afectan a <em>todas</em> las filas de la tabla. Es uno de los errores más
      costosos (y más comunes) en el trabajo real. Antes de ejecutar un <code>UPDATE</code> o
      <code>DELETE</code>, es buena práctica ejecutar primero un <code>SELECT</code> con el mismo
      <code>WHERE</code>, para verificar exactamente qué filas vas a afectar.</p>

      <p><em>Nota:</em> los ejercicios de este módulo modifican la base de datos de ejemplo. Puedes
      usar el botón <strong>"Reiniciar base de datos"</strong> en cualquier momento para volver al
      estado original.</p>

      <p><strong>En la vida profesional:</strong> en un entorno real, los cambios masivos de datos
      casi siempre se hacen dentro de una transacción (lo verás en el próximo módulo) y, muchas
      veces, después de un respaldo (<em>backup</em>). Nunca se ejecutan directamente en producción
      sin antes probarlos en un entorno de pruebas.</p>
    `,
    ejemplo: {
      descripcion: "Damos de alta un nuevo cliente.",
      sql: `INSERT INTO clientes (id, nombre, ciudad, pais, tipo)
VALUES (13, 'Cliente de Prueba', 'Lisboa', 'Portugal', 'regular');`,
    },
    ejercicios: [
      {
        titulo: "Da de alta un nuevo producto",
        enunciado: "Inserta en productos un nuevo producto: id 16, nombre 'Micrófono USB', categoria 'Electrónica', precio 45, stock 60.",
        solucion: `INSERT INTO productos (id, nombre, categoria, precio, stock)
VALUES (16, 'Micrófono USB', 'Electrónica', 45, 60);`,
      },
      {
        titulo: "Actualiza el stock tras una venta",
        enunciado: "Resta 5 unidades al stock del producto con id 2 (Mouse Inalámbrico).",
        solucion: `UPDATE productos SET stock = stock - 5 WHERE id = 2;`,
      },
      {
        titulo: "Elimina un pedido cancelado",
        enunciado: "Elimina de la tabla pedidos el pedido con id 7 (tiene estado 'cancelado'). Recuerda: siempre con un WHERE específico.",
        solucion: `DELETE FROM pedidos WHERE id = 7;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "transacciones",
    numero: 10,
    categoria: "Avanzado",
    titulo: "Transacciones: BEGIN, COMMIT y ROLLBACK",
    resumen: "Cómo agrupar varios cambios para que se apliquen todos o ninguno.",
    contenido: `
      <p>Una <strong>transacción</strong> agrupa varias operaciones para que se comporten como una
      sola unidad: o se aplican <em>todas</em>, o no se aplica <em>ninguna</em>. Esto es
      fundamental cuando un cambio de negocio implica varios pasos relacionados, por ejemplo
      "crear un pedido" (que implica insertar el pedido, insertar su detalle y descontar stock).</p>
      <pre><code>BEGIN TRANSACTION;
UPDATE productos SET stock = stock - 1 WHERE id = 1;
INSERT INTO pedidos (id, cliente_id, empleado_id, fecha, estado)
VALUES (26, 1, 5, '2024-01-01', 'completado');
COMMIT;</code></pre>
      <p>Si algo sale mal a mitad de camino, en lugar de <code>COMMIT</code> (confirmar) usas
      <code>ROLLBACK</code> (deshacer todo lo hecho desde el <code>BEGIN</code>).</p>
      <p>Esto se relaciona con las propiedades <strong>ACID</strong> que debe cumplir toda base de
      datos transaccional:</p>
      <ul>
        <li><strong>Atomicidad:</strong> todo o nada.</li>
        <li><strong>Consistencia:</strong> la base de datos pasa de un estado válido a otro estado válido.</li>
        <li><strong>Aislamiento:</strong> las transacciones no interfieren entre sí mientras están en curso.</li>
        <li><strong>Durabilidad:</strong> una vez confirmada (<code>COMMIT</code>), la información
        sobrevive incluso a un corte de luz o un reinicio del servidor.</li>
      </ul>

      <p><strong>En la vida profesional:</strong> imagina transferir dinero entre dos cuentas
      bancarias: si se resta el dinero de una cuenta pero el sistema falla antes de sumarlo a la
      otra, el dinero desaparece. Las transacciones son exactamente lo que evita ese tipo de
      desastres.</p>
    `,
    ejemplo: {
      descripcion: "Un pedido nuevo, con su descuento de stock, dentro de una sola transacción.",
      sql: `BEGIN TRANSACTION;
UPDATE productos SET stock = stock - 1 WHERE id = 1;
INSERT INTO pedidos (id, cliente_id, empleado_id, fecha, estado)
VALUES (26, 1, 5, '2024-01-01', 'completado');
COMMIT;`,
    },
    ejercicios: [
      {
        titulo: "Transacción completa: pedido nuevo con su detalle",
        enunciado: "Dentro de una única transacción, inserta un pedido (id 27, cliente_id 2, empleado_id 6, fecha '2024-02-01', estado 'completado') y su línea de detalle (id 37, pedido_id 27, producto_id 3, cantidad 1, precio_unitario 85).",
        solucion: `BEGIN TRANSACTION;
INSERT INTO pedidos (id, cliente_id, empleado_id, fecha, estado)
VALUES (27, 2, 6, '2024-02-01', 'completado');
INSERT INTO detalle_pedidos (id, pedido_id, producto_id, cantidad, precio_unitario)
VALUES (37, 27, 3, 1, 85);
COMMIT;`,
      },
      {
        titulo: "Practica un ROLLBACK",
        enunciado: "Empieza una transacción, borra todos los productos de categoria 'Oficina', y luego arrepiéntete con ROLLBACK. Termina con un SELECT que confirme que los productos siguen ahí.",
        solucion: `BEGIN TRANSACTION;
DELETE FROM productos WHERE categoria = 'Oficina';
ROLLBACK;
SELECT * FROM productos WHERE categoria = 'Oficina';`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "vistas",
    numero: 11,
    categoria: "Avanzado",
    titulo: "Vistas (CREATE VIEW)",
    resumen: "Guarda una consulta compleja con nombre y reutilízala como si fuera una tabla.",
    contenido: `
      <p>Una <strong>vista</strong> es una consulta <code>SELECT</code> guardada con un nombre, que
      puedes usar como si fuera una tabla normal. No duplica los datos: cada vez que consultas la
      vista, SQLite vuelve a ejecutar la consulta original por debajo.</p>
      <pre><code>CREATE VIEW vista_ventas_por_producto AS
SELECT producto_id, SUM(cantidad * precio_unitario) AS ingresos
FROM detalle_pedidos
GROUP BY producto_id;

SELECT * FROM vista_ventas_por_producto WHERE ingresos > 1000;</code></pre>
      <p>Las vistas son útiles para:</p>
      <ul>
        <li>Simplificar consultas complejas que se repiten mucho.</li>
        <li>Dar una "capa" de datos más simple a otros equipos (por ejemplo, a Marketing no le
        haces exponer las 6 tablas, le das una vista ya lista).</li>
        <li>Controlar qué columnas puede ver cada persona, en bases de datos con permisos por vista.</li>
      </ul>

      <p><strong>En la vida profesional:</strong> es habitual encontrar vistas que alimentan
      directamente herramientas de Business Intelligence (Power BI, Tableau, Looker), para que
      el equipo de datos no tenga que reescribir la misma lógica de negocio una y otra vez.</p>
    `,
    ejemplo: {
      descripcion: "Una vista con los ingresos totales por producto.",
      sql: `CREATE VIEW vista_ventas_por_producto AS
SELECT producto_id, SUM(cantidad * precio_unitario) AS ingresos
FROM detalle_pedidos
GROUP BY producto_id;

SELECT * FROM vista_ventas_por_producto WHERE ingresos > 1000;`,
    },
    ejercicios: [
      {
        titulo: "Vista de resumen de pedidos",
        enunciado: "Crea una vista vista_resumen_pedidos con pedido_id y total (suma de cantidad * precio_unitario) por pedido, y selecciona de ella los pedidos con total mayor a 500.",
        solucion: `CREATE VIEW vista_resumen_pedidos AS
SELECT pedido_id, SUM(cantidad * precio_unitario) AS total
FROM detalle_pedidos
GROUP BY pedido_id;

SELECT * FROM vista_resumen_pedidos WHERE total > 500;`,
      },
      {
        titulo: "Vista de empleados con su jefe",
        enunciado: "Crea una vista vista_empleados_jefes con el nombre del empleado y el nombre de su jefe (LEFT JOIN sobre empleados), y selecciona todo su contenido.",
        solucion: `CREATE VIEW vista_empleados_jefes AS
SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON e.jefe_id = j.id;

SELECT * FROM vista_empleados_jefes;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "indices-optimizacion",
    numero: 12,
    categoria: "Avanzado",
    titulo: "Índices y optimización de consultas",
    resumen: "Por qué algunas consultas son lentas y cómo acelerarlas.",
    contenido: `
      <p>Un <strong>índice</strong> funciona como el índice de un libro: en lugar de leer todas
      las páginas para encontrar un tema, saltas directo a la página correcta. En una base de
      datos, un índice le permite al motor encontrar filas sin tener que recorrer toda la tabla
      (lo que se llama un <em>full table scan</em>).</p>
      <pre><code>CREATE INDEX idx_empleados_departamento ON empleados(departamento_id);</code></pre>
      <p>Conviene crear índices sobre columnas que se usan mucho en <code>WHERE</code>,
      <code>JOIN</code> u <code>ORDER BY</code>. Pero no son gratis: ocupan espacio en disco y
      hacen un poco más lentos los <code>INSERT</code>/<code>UPDATE</code>/<code>DELETE</code>
      (porque el índice también hay que mantenerlo actualizado). Por eso no se indexa "todo", sino
      las columnas que realmente lo necesitan.</p>
      <p>Para saber si SQLite está usando un índice, se usa <code>EXPLAIN QUERY PLAN</code> antes
      de la consulta:</p>
      <pre><code>EXPLAIN QUERY PLAN
SELECT * FROM empleados WHERE departamento_id = 3;</code></pre>
      <p>Si el plan dice algo como <code>SCAN empleados</code>, está recorriendo toda la tabla. Si
      dice <code>SEARCH empleados USING INDEX ...</code>, está usando el índice.</p>

      <p><strong>En la vida profesional:</strong> en tablas con millones de filas, la diferencia
      entre tener o no el índice correcto puede ser la diferencia entre una consulta que tarda
      50 milisegundos y una que tarda 30 segundos (o que tumba el servidor). Es una de las
      primeras cosas que revisa cualquier persona de datos cuando algo "va lento".</p>
    `,
    ejemplo: {
      descripcion: "Comparamos el plan de ejecución antes y después de crear un índice.",
      sql: `EXPLAIN QUERY PLAN
SELECT * FROM empleados WHERE departamento_id = 3;

CREATE INDEX idx_empleados_departamento ON empleados(departamento_id);

EXPLAIN QUERY PLAN
SELECT * FROM empleados WHERE departamento_id = 3;`,
    },
    ejercicios: [
      {
        titulo: "Crea un índice y compara el plan",
        enunciado: "Ejecuta EXPLAIN QUERY PLAN sobre 'SELECT * FROM pedidos WHERE cliente_id = 1', crea un índice idx_pedidos_cliente sobre pedidos(cliente_id), y vuelve a ejecutar el EXPLAIN QUERY PLAN para comparar.",
        solucion: `EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente_id = 1;

CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);

EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente_id = 1;`,
      },
      {
        titulo: "Índice compuesto",
        enunciado: "Crea un índice compuesto idx_detalle_pedido_producto sobre detalle_pedidos(pedido_id, producto_id).",
        solucion: `CREATE INDEX idx_detalle_pedido_producto ON detalle_pedidos(pedido_id, producto_id);`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "diseno-normalizacion",
    numero: 13,
    categoria: "Profesional",
    titulo: "Diseño de bases de datos y normalización",
    resumen: "Por qué las tablas están separadas así, y no de otra forma.",
    contenido: `
      <p><strong>Normalizar</strong> es organizar las tablas para evitar datos duplicados e
      inconsistentes. La idea intuitiva, sin entrar en las formas normales formales (1FN, 2FN, 3FN),
      es esta: <em>cada dato debe vivir en un solo lugar</em>. Si el nombre de un cliente estuviera
      repetido en cada uno de sus pedidos, y un día cambia, tendrías que actualizarlo en decenas de
      filas — y sería facilísimo olvidar alguna y dejar datos inconsistentes.</p>
      <p>Nuestro esquema modela dos tipos de relación muy comunes:</p>
      <ul>
        <li><strong>Uno a muchos (1:N):</strong> un departamento tiene muchos empleados, pero cada
        empleado pertenece a un solo departamento. Se resuelve con una clave foránea en la tabla
        "muchos" (<code>empleados.departamento_id</code>).</li>
        <li><strong>Muchos a muchos (N:M):</strong> un pedido puede tener muchos productos, y un
        producto puede aparecer en muchos pedidos. Esto no se puede resolver con una sola clave
        foránea: se necesita una <strong>tabla intermedia</strong> (<code>detalle_pedidos</code>)
        que conecta ambas.</li>
      </ul>
      <p>Fíjate que <code>detalle_pedidos</code> guarda su propio <code>precio_unitario</code>, aunque
      ese dato "ya existe" en <code>productos.precio</code>. Esto es una <strong>desnormalización
      intencional y muy común</strong>: el precio de un producto cambia con el tiempo, y necesitamos
      recordar a qué precio se vendió realmente en ese pedido histórico, no el precio actual.</p>

      <p><strong>En la vida profesional:</strong> el diseño del esquema es una de las decisiones más
      difíciles de cambiar una vez que el sistema está en producción con datos reales. Vale la pena
      invertir tiempo pensándolo bien desde el principio, y entender cuándo normalizar
      "por el libro" y cuándo desnormalizar a propósito por rendimiento o por necesidad de negocio
      (como el caso del precio histórico).</p>
    `,
    ejemplo: {
      descripcion: "La relación muchos-a-muchos entre pedidos y productos, resuelta con detalle_pedidos.",
      sql: `SELECT pr.nombre, dp.cantidad
FROM detalle_pedidos dp
JOIN productos pr ON pr.id = dp.producto_id
WHERE dp.pedido_id = 1;`,
    },
    ejercicios: [
      {
        titulo: "Todos los productos de un pedido",
        enunciado: "Muestra, para el pedido 3, el nombre de cada producto y la cantidad comprada.",
        solucion: `SELECT pr.nombre, dp.cantidad
FROM detalle_pedidos dp
JOIN productos pr ON pr.id = dp.producto_id
WHERE dp.pedido_id = 3;`,
      },
      {
        titulo: "Precio histórico vs. precio actual",
        enunciado: "Para el pedido 1, compara el precio_unitario guardado en detalle_pedidos con el precio actual en productos.",
        solucion: `SELECT pr.nombre, dp.precio_unitario AS precio_al_vender, pr.precio AS precio_actual
FROM detalle_pedidos dp
JOIN productos pr ON pr.id = dp.producto_id
WHERE dp.pedido_id = 1;`,
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    id: "buenas-practicas",
    numero: 14,
    categoria: "Profesional",
    titulo: "Buenas prácticas profesionales",
    resumen: "Legibilidad, seguridad y rendimiento: lo que se espera en un equipo real.",
    contenido: `
      <p>Para cerrar el curso, un checklist de hábitos que marcan la diferencia entre "una consulta
      que funciona" y "una consulta lista para producción":</p>
      <ul>
        <li><strong>Legibilidad:</strong> palabras clave en mayúsculas (<code>SELECT</code>,
        <code>FROM</code>, <code>WHERE</code>), una cláusula por línea en consultas largas, alias
        con nombres que se entiendan.</li>
        <li><strong>Evita <code>SELECT *</code> en código de producción:</strong> nombra las
        columnas que realmente necesitas. Es más rápido, más claro, y no se rompe si alguien
        agrega una columna nueva a la tabla.</li>
        <li><strong>Cuidado con <code>NULL</code>:</strong> usa siempre <code>IS NULL</code> /
        <code>IS NOT NULL</code>, nunca <code>= NULL</code>.</li>
        <li><strong>Seguridad — inyección SQL:</strong> cuando una aplicación arma una consulta
        pegando directamente texto que escribió un usuario (por ejemplo, en un formulario de
        login), alguien malicioso puede escribir SQL dentro de ese campo y alterar la consulta.
        La defensa es usar siempre <strong>consultas parametrizadas</strong> (placeholders como
        <code>?</code> o <code>:nombre</code>), que la mayoría de los lenguajes de programación
        ofrecen, en lugar de concatenar strings a mano.</li>
        <li><strong>Rendimiento:</strong> revisa el plan de ejecución de las consultas lentas
        (<code>EXPLAIN QUERY PLAN</code>), indexa las columnas correctas, evita aplicar funciones
        sobre una columna indexada dentro del <code>WHERE</code> (eso suele impedir que se use el
        índice).</li>
        <li><strong>Cambios seguros:</strong> los <code>UPDATE</code>/<code>DELETE</code> masivos
        van dentro de una transacción, y siempre después de verificar con un <code>SELECT</code>
        qué filas se van a afectar.</li>
      </ul>

      <p><strong>Reto final:</strong> el ejercicio de abajo combina JOIN, agregación, filtros y
      alias — el tipo de consulta que te vas a encontrar constantemente en el trabajo real.</p>
    `,
    ejemplo: {
      descripcion: "Un ejemplo de consulta bien formateada y legible.",
      sql: `SELECT
  c.nombre   AS cliente,
  p.fecha    AS fecha_pedido,
  p.estado   AS estado_pedido
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
WHERE p.estado = 'completado'
ORDER BY p.fecha DESC;`,
    },
    ejercicios: [
      {
        titulo: "Reto final: reporte ejecutivo de vendedores",
        enunciado: "Escribe una sola consulta que muestre, para cada empleado cuyo puesto contenga 'Vendedor', su nombre, la cantidad de pedidos completados que gestionó y el monto total vendido en esos pedidos, ordenado de mayor a menor monto.",
        solucion: `SELECT e.nombre AS vendedor,
       COUNT(DISTINCT p.id) AS pedidos_completados,
       SUM(dp.cantidad * dp.precio_unitario) AS total_vendido
FROM empleados e
JOIN pedidos p ON p.empleado_id = e.id AND p.estado = 'completado'
JOIN detalle_pedidos dp ON dp.pedido_id = p.id
WHERE e.puesto LIKE '%Vendedor%'
GROUP BY e.id, e.nombre
ORDER BY total_vendido DESC;`,
      },
    ],
  },
];
