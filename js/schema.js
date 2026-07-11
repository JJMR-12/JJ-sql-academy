/*
  Base de datos de ejemplo: una empresa ficticia ("Nortia Comercial") con
  departamentos, empleados (con jerarquía jefe -> subordinado), clientes,
  productos, pedidos y el detalle de cada pedido.

  Este archivo NO ejecuta nada por sí solo: solo arma el SQL de creación
  y de datos iniciales, que app.js usa para levantar la base en sql.js.
*/

function sqlVal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function buildInsert(table, columns, rows) {
  const values = rows
    .map((row) => "  (" + columns.map((c) => sqlVal(row[c])).join(", ") + ")")
    .join(",\n");
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${values};`;
}

const SCHEMA_SQL = `
CREATE TABLE departamentos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  presupuesto REAL,
  ciudad TEXT
);

CREATE TABLE empleados (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  puesto TEXT,
  salario REAL,
  departamento_id INTEGER REFERENCES departamentos(id),
  jefe_id INTEGER REFERENCES empleados(id),
  fecha_contratacion TEXT
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT,
  pais TEXT,
  tipo TEXT
);

CREATE TABLE productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  precio REAL,
  stock INTEGER
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  empleado_id INTEGER REFERENCES empleados(id),
  fecha TEXT,
  estado TEXT
);

CREATE TABLE detalle_pedidos (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER,
  precio_unitario REAL
);
`;

const DEPARTAMENTOS = [
  { id: 1, nombre: "Dirección", presupuesto: 500000, ciudad: "Madrid" },
  { id: 2, nombre: "Ventas", presupuesto: 300000, ciudad: "Madrid" },
  { id: 3, nombre: "Tecnología", presupuesto: 450000, ciudad: "Barcelona" },
  { id: 4, nombre: "Recursos Humanos", presupuesto: 150000, ciudad: "Madrid" },
  { id: 5, nombre: "Marketing", presupuesto: 200000, ciudad: "Valencia" },
];

const EMPLEADOS = [
  { id: 1, nombre: "Elena Torres", puesto: "Directora General", salario: 9000, departamento_id: 1, jefe_id: null, fecha_contratacion: "2016-01-10" },
  { id: 2, nombre: "Marco Díaz", puesto: "Gerente de Ventas", salario: 6200, departamento_id: 2, jefe_id: 1, fecha_contratacion: "2017-03-15" },
  { id: 3, nombre: "Sofía Ruiz", puesto: "Gerente de Tecnología", salario: 6500, departamento_id: 3, jefe_id: 1, fecha_contratacion: "2017-06-01" },
  { id: 4, nombre: "Diego Herrera", puesto: "Gerente de RRHH", salario: 6000, departamento_id: 4, jefe_id: 1, fecha_contratacion: "2018-02-20" },
  { id: 5, nombre: "Laura Gómez", puesto: "Vendedora Senior", salario: 3200, departamento_id: 2, jefe_id: 2, fecha_contratacion: "2018-09-05" },
  { id: 6, nombre: "Pablo Sánchez", puesto: "Vendedor", salario: 2900, departamento_id: 2, jefe_id: 2, fecha_contratacion: "2019-11-12" },
  { id: 7, nombre: "Carla Medina", puesto: "Vendedora", salario: 2850, departamento_id: 2, jefe_id: 2, fecha_contratacion: "2021-04-18" },
  { id: 8, nombre: "Andrés Flores", puesto: "Desarrollador Senior", salario: 4200, departamento_id: 3, jefe_id: 3, fecha_contratacion: "2018-05-22" },
  { id: 9, nombre: "Beatriz León", puesto: "Desarrolladora", salario: 3700, departamento_id: 3, jefe_id: 3, fecha_contratacion: "2020-01-30" },
  { id: 10, nombre: "Iván Castro", puesto: "Desarrollador", salario: 3500, departamento_id: 3, jefe_id: 3, fecha_contratacion: "2021-07-14" },
  { id: 11, nombre: "Natalia Rojas", puesto: "Analista de Datos", salario: 3800, departamento_id: 3, jefe_id: 3, fecha_contratacion: "2019-10-01" },
  { id: 12, nombre: "Rodrigo Paredes", puesto: "Especialista RRHH", salario: 3100, departamento_id: 4, jefe_id: 4, fecha_contratacion: "2019-08-19" },
  { id: 13, nombre: "Camila Vega", puesto: "Especialista RRHH", salario: 2950, departamento_id: 4, jefe_id: 4, fecha_contratacion: "2022-03-03" },
  { id: 14, nombre: "Tomás Navarro", puesto: "Vendedor Junior", salario: 2600, departamento_id: null, jefe_id: 2, fecha_contratacion: "2023-06-10" },
  { id: 15, nombre: "Julieta Campos", puesto: "Pasante de Tecnología", salario: 1200, departamento_id: 3, jefe_id: 3, fecha_contratacion: "2024-01-15" },
];

const CLIENTES = [
  { id: 1, nombre: "TechNova S.A.", ciudad: "Madrid", pais: "España", tipo: "premium" },
  { id: 2, nombre: "Comercial Iberia", ciudad: "Barcelona", pais: "España", tipo: "regular" },
  { id: 3, nombre: "Andes Retail", ciudad: "Bogotá", pais: "Colombia", tipo: "premium" },
  { id: 4, nombre: "Pacífico Trading", ciudad: "Lima", pais: "Perú", tipo: "regular" },
  { id: 5, nombre: "Fashion Hub", ciudad: "Ciudad de México", pais: "México", tipo: "premium" },
  { id: 6, nombre: "Green Foods", ciudad: "Buenos Aires", pais: "Argentina", tipo: "regular" },
  { id: 7, nombre: "Norte Distribuciones", ciudad: "Santiago", pais: "Chile", tipo: "regular" },
  { id: 8, nombre: "Delta Import", ciudad: "Miami", pais: "Estados Unidos", tipo: "premium" },
  { id: 9, nombre: "Sol Naciente", ciudad: "Valencia", pais: "España", tipo: "regular" },
  { id: 10, nombre: "Río Comercio", ciudad: "Montevideo", pais: "Uruguay", tipo: "regular" },
  { id: 11, nombre: "Estrella Digital", ciudad: "Quito", pais: "Ecuador", tipo: "regular" },
  { id: 12, nombre: "Cliente Fantasma", ciudad: null, pais: null, tipo: "regular" },
];

const PRODUCTOS = [
  { id: 1, nombre: "Laptop Pro 14", categoria: "Electrónica", precio: 1200, stock: 25 },
  { id: 2, nombre: "Mouse Inalámbrico", categoria: "Electrónica", precio: 25, stock: 150 },
  { id: 3, nombre: "Teclado Mecánico", categoria: "Electrónica", precio: 85, stock: 80 },
  { id: 4, nombre: "Monitor 27 pulgadas", categoria: "Electrónica", precio: 320, stock: 40 },
  { id: 5, nombre: "Silla Ergonómica", categoria: "Mobiliario", precio: 250, stock: 30 },
  { id: 6, nombre: "Escritorio Ajustable", categoria: "Mobiliario", precio: 450, stock: 15 },
  { id: 7, nombre: "Lámpara LED", categoria: "Mobiliario", precio: 40, stock: 100 },
  { id: 8, nombre: "Auriculares Bluetooth", categoria: "Electrónica", precio: 90, stock: 60 },
  { id: 9, nombre: "Webcam HD", categoria: "Electrónica", precio: 55, stock: 70 },
  { id: 10, nombre: "Impresora Láser", categoria: "Electrónica", precio: 300, stock: 20 },
  { id: 11, nombre: "Papel A4 (paquete)", categoria: "Oficina", precio: 8, stock: 500 },
  { id: 12, nombre: "Bolígrafos (caja)", categoria: "Oficina", precio: 5, stock: 300 },
  { id: 13, nombre: "Pizarra Blanca", categoria: "Oficina", precio: 60, stock: 25 },
  { id: 14, nombre: "Cámara de Seguridad", categoria: "Electrónica", precio: 150, stock: 45 },
  { id: 15, nombre: "Router WiFi 6", categoria: "Electrónica", precio: 130, stock: 35 },
];

const PEDIDOS = [
  { id: 1, cliente_id: 1, empleado_id: 5, fecha: "2023-01-15", estado: "completado" },
  { id: 2, cliente_id: 2, empleado_id: 6, fecha: "2023-01-20", estado: "completado" },
  { id: 3, cliente_id: 3, empleado_id: 5, fecha: "2023-02-03", estado: "completado" },
  { id: 4, cliente_id: 1, empleado_id: 7, fecha: "2023-02-10", estado: "pendiente" },
  { id: 5, cliente_id: 4, empleado_id: 6, fecha: "2023-02-18", estado: "completado" },
  { id: 6, cliente_id: 5, empleado_id: 5, fecha: "2023-03-01", estado: "completado" },
  { id: 7, cliente_id: 6, empleado_id: 14, fecha: "2023-03-05", estado: "cancelado" },
  { id: 8, cliente_id: 7, empleado_id: 7, fecha: "2023-03-12", estado: "completado" },
  { id: 9, cliente_id: 2, empleado_id: 6, fecha: "2023-03-20", estado: "completado" },
  { id: 10, cliente_id: 8, empleado_id: 5, fecha: "2023-04-02", estado: "completado" },
  { id: 11, cliente_id: 3, empleado_id: 7, fecha: "2023-04-15", estado: "pendiente" },
  { id: 12, cliente_id: 9, empleado_id: 6, fecha: "2023-04-22", estado: "completado" },
  { id: 13, cliente_id: 1, empleado_id: 5, fecha: "2023-05-05", estado: "completado" },
  { id: 14, cliente_id: 10, empleado_id: 14, fecha: "2023-05-14", estado: "completado" },
  { id: 15, cliente_id: 5, empleado_id: 7, fecha: "2023-05-30", estado: "cancelado" },
  { id: 16, cliente_id: 11, empleado_id: 6, fecha: "2023-06-10", estado: "completado" },
  { id: 17, cliente_id: 4, empleado_id: 5, fecha: "2023-06-18", estado: "completado" },
  { id: 18, cliente_id: 2, empleado_id: 14, fecha: "2023-07-01", estado: "pendiente" },
  { id: 19, cliente_id: 8, empleado_id: 7, fecha: "2023-07-15", estado: "completado" },
  { id: 20, cliente_id: 6, empleado_id: 5, fecha: "2023-08-02", estado: "completado" },
  { id: 21, cliente_id: 3, empleado_id: 6, fecha: "2023-08-20", estado: "completado" },
  { id: 22, cliente_id: 1, empleado_id: 7, fecha: "2023-09-05", estado: "completado" },
  { id: 23, cliente_id: 9, empleado_id: 5, fecha: "2023-09-25", estado: "completado" },
  { id: 24, cliente_id: 7, empleado_id: 14, fecha: "2023-10-10", estado: "completado" },
  { id: 25, cliente_id: 10, empleado_id: 6, fecha: "2023-10-28", estado: "pendiente" },
];

const DETALLE_PEDIDOS = [
  { id: 1, pedido_id: 1, producto_id: 1, cantidad: 1, precio_unitario: 1200 },
  { id: 2, pedido_id: 1, producto_id: 2, cantidad: 2, precio_unitario: 25 },
  { id: 3, pedido_id: 2, producto_id: 3, cantidad: 1, precio_unitario: 85 },
  { id: 4, pedido_id: 2, producto_id: 9, cantidad: 1, precio_unitario: 55 },
  { id: 5, pedido_id: 3, producto_id: 1, cantidad: 2, precio_unitario: 1200 },
  { id: 6, pedido_id: 3, producto_id: 4, cantidad: 1, precio_unitario: 320 },
  { id: 7, pedido_id: 4, producto_id: 5, cantidad: 1, precio_unitario: 250 },
  { id: 8, pedido_id: 5, producto_id: 8, cantidad: 3, precio_unitario: 90 },
  { id: 9, pedido_id: 5, producto_id: 2, cantidad: 1, precio_unitario: 25 },
  { id: 10, pedido_id: 6, producto_id: 1, cantidad: 1, precio_unitario: 1200 },
  { id: 11, pedido_id: 7, producto_id: 11, cantidad: 10, precio_unitario: 8 },
  { id: 12, pedido_id: 8, producto_id: 6, cantidad: 1, precio_unitario: 450 },
  { id: 13, pedido_id: 8, producto_id: 7, cantidad: 2, precio_unitario: 40 },
  { id: 14, pedido_id: 9, producto_id: 3, cantidad: 2, precio_unitario: 85 },
  { id: 15, pedido_id: 10, producto_id: 14, cantidad: 2, precio_unitario: 150 },
  { id: 16, pedido_id: 10, producto_id: 15, cantidad: 1, precio_unitario: 130 },
  { id: 17, pedido_id: 11, producto_id: 4, cantidad: 1, precio_unitario: 320 },
  { id: 18, pedido_id: 12, producto_id: 9, cantidad: 1, precio_unitario: 55 },
  { id: 19, pedido_id: 12, producto_id: 12, cantidad: 5, precio_unitario: 5 },
  { id: 20, pedido_id: 13, producto_id: 1, cantidad: 1, precio_unitario: 1200 },
  { id: 21, pedido_id: 13, producto_id: 8, cantidad: 1, precio_unitario: 90 },
  { id: 22, pedido_id: 14, producto_id: 2, cantidad: 3, precio_unitario: 25 },
  { id: 23, pedido_id: 14, producto_id: 3, cantidad: 1, precio_unitario: 85 },
  { id: 24, pedido_id: 15, producto_id: 5, cantidad: 1, precio_unitario: 250 },
  { id: 25, pedido_id: 16, producto_id: 10, cantidad: 1, precio_unitario: 300 },
  { id: 26, pedido_id: 17, producto_id: 7, cantidad: 4, precio_unitario: 40 },
  { id: 27, pedido_id: 18, producto_id: 13, cantidad: 2, precio_unitario: 60 },
  { id: 28, pedido_id: 19, producto_id: 1, cantidad: 1, precio_unitario: 1200 },
  { id: 29, pedido_id: 19, producto_id: 4, cantidad: 1, precio_unitario: 320 },
  { id: 30, pedido_id: 20, producto_id: 15, cantidad: 2, precio_unitario: 130 },
  { id: 31, pedido_id: 21, producto_id: 6, cantidad: 1, precio_unitario: 450 },
  { id: 32, pedido_id: 22, producto_id: 2, cantidad: 5, precio_unitario: 25 },
  { id: 33, pedido_id: 22, producto_id: 9, cantidad: 1, precio_unitario: 55 },
  { id: 34, pedido_id: 23, producto_id: 14, cantidad: 1, precio_unitario: 150 },
  { id: 35, pedido_id: 24, producto_id: 11, cantidad: 20, precio_unitario: 8 },
  { id: 36, pedido_id: 25, producto_id: 4, cantidad: 1, precio_unitario: 320 },
];

function buildSetupSQL() {
  const parts = [SCHEMA_SQL];
  parts.push(buildInsert("departamentos", ["id", "nombre", "presupuesto", "ciudad"], DEPARTAMENTOS));
  parts.push(buildInsert("empleados", ["id", "nombre", "puesto", "salario", "departamento_id", "jefe_id", "fecha_contratacion"], EMPLEADOS));
  parts.push(buildInsert("clientes", ["id", "nombre", "ciudad", "pais", "tipo"], CLIENTES));
  parts.push(buildInsert("productos", ["id", "nombre", "categoria", "precio", "stock"], PRODUCTOS));
  parts.push(buildInsert("pedidos", ["id", "cliente_id", "empleado_id", "fecha", "estado"], PEDIDOS));
  parts.push(buildInsert("detalle_pedidos", ["id", "pedido_id", "producto_id", "cantidad", "precio_unitario"], DETALLE_PEDIDOS));
  return parts.join("\n\n");
}

const SCHEMA_DESCRIPTION = [
  { tabla: "departamentos", columnas: "id, nombre, presupuesto, ciudad" },
  { tabla: "empleados", columnas: "id, nombre, puesto, salario, departamento_id → departamentos.id, jefe_id → empleados.id, fecha_contratacion" },
  { tabla: "clientes", columnas: "id, nombre, ciudad, pais, tipo ('regular' | 'premium')" },
  { tabla: "productos", columnas: "id, nombre, categoria, precio, stock" },
  { tabla: "pedidos", columnas: "id, cliente_id → clientes.id, empleado_id → empleados.id, fecha, estado ('completado' | 'pendiente' | 'cancelado')" },
  { tabla: "detalle_pedidos", columnas: "id, pedido_id → pedidos.id, producto_id → productos.id, cantidad, precio_unitario" },
];
