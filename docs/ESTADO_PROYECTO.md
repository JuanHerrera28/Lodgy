# Estado del proyecto Lodgy

Documento de traspaso para continuar el trabajo en una conversación nueva.
Última actualización: 26 de octubre de 2026.

## Resumen

El **backend está terminado** (etapas 1 a 9 de `Guia_Backend_Lodgy.md`) y verificado
contra la base de datos real: **37 peticiones y 53 pruebas en Postman, 0 fallos**.

El **frontend ya está conectado a la API** en el alcance aprobado:

- Web pública con catálogo, servicios, experiencias y búsqueda real de disponibilidad.
- Login con JWT, restauración de sesión y cierre de sesión.
- Panel operativo con datos reales de cabañas y reservas.
- Módulo de Reservas para Administrador y Recepcionista: crear, cancelar,
  check-in y check-out contra la base de datos.
- Administración con crear, editar, publicar/desactivar y asignar servicios a cabañas.

Clientes, Inventario y Mantenimiento siguen mostrando el aviso de «en preparación».
No hay build step: son HTML, CSS y JavaScript servidos por HTTP.

## Cómo arrancar

### API

```
cd backend
npm start
```

Debe mostrar:

```
Servidor de Lodgy corriendo en http://localhost:3000
Conexión a MariaDB exitosa.
```

La API **no se recarga sola**: después de cambiar código hay que detenerla (Ctrl + C)
y volver a ejecutar `npm start`.

Prueba rápida: `http://localhost:3000/api/prueba`.

### Frontend

Desde la raíz del repositorio:

```
python -m http.server 5500
```

Y abrir:

- Web pública: <http://127.0.0.1:5500/frontend/index.html>
- Panel: <http://127.0.0.1:5500/frontend/dashboard.html>

También funciona servir solo la carpeta `frontend/` y abrir `/index.html` y
`/dashboard.html`. Lo importante es usar el puerto **5500** y HTTP, porque el CORS
del backend permite `http://localhost:5500` y `http://127.0.0.1:5500`.
Abrir los HTML con doble clic (`file://`) no funciona para las llamadas a la API.

## Usuarios de prueba

| Correo | Rol | Contraseña |
|---|---|---|
| ana@lodgy.com | Administrador | Lodgy12345 |
| maria@lodgy.com | Recepcionista | Lodgy12345 |
| servicios@lodgy.com | Servicios generales | Lodgy12345 |

La base de datos se usa con el usuario `lodgy_api`. Su clave está en `backend/.env`
(no se versiona). `JWT_SECRET` también vive ahí.

## Tecnología del backend

- Node.js + Express 5, MySQL/MariaDB con `mysql2` (promesas).
- Autenticación con JWT (`jsonwebtoken`) y contraseñas con `bcryptjs`.
- El rol y el id del usuario salen **del token**, nunca del cuerpo de la petición.
- Las reglas de negocio (cruces de reservas, capacidad, estados, saldos, stock)
  viven en la base de datos: procedimientos y triggers.
- La API solo valida datos de entrada y llama a esos objetos.

## Endpoints

| Método y ruta | Roles | Qué hace |
|---|---|---|
| `POST /api/auth/login` | público | Devuelve token y datos del usuario |
| `GET /api/auth/yo` | token | Datos de la sesión actual |
| `GET /api/cabanas` | todos | Lista cabañas con estado, servicios e ids de servicios |
| `GET /api/cabanas/servicios` | token | Catálogo de servicios asignables |
| `POST /api/cabanas` | Administrador | Crea cabaña (nace Disponible); acepta servicios |
| `PUT /api/cabanas/:id` | Administrador | Edita datos y servicios de una cabaña |
| `PUT /api/cabanas/:id/estado` | Administrador | Publica o desactiva sin eliminar |
| `PUT /api/cabanas/:id/servicios` | Administrador | Reemplaza los servicios incluidos |
| `GET /api/cabanas/disponibilidad?fecha_inicio=&fecha_fin=&personas=` | Admin, Recepción | Cabañas libres en el rango |
| `GET /api/cabanas/trabajo` | todos | Cabañas por limpiar + órdenes abiertas |
| `PUT /api/cabanas/:id/lista` | Admin, Servicios | Botón "Listo": En Limpieza → Disponible |
| `GET /api/clientes?q=` | Admin, Recepción | Lista o busca clientes |
| `POST /api/clientes` | Admin, Recepción | Crea cliente (409 si el documento existe) |
| `GET /api/reservas` | Admin, Recepción | Lista reservas con cliente, cabaña, estado y contacto |
| `POST /api/reservas` | Admin, Recepción | Llama a `sp_crear_reserva` |
| `POST /api/reservas/:id/cancelar` | Admin, Recepción | Solo si está Confirmada |
| `POST /api/reservas/:id/checkin` | Admin, Recepción | Confirmada → En curso; cabaña Ocupada |
| `POST /api/reservas/:id/checkout` | Admin, Recepción | En curso → Finalizada; cabaña En Limpieza |
| `GET /api/reservas/:id/saldo` | Admin, Recepción | Total, pagado y saldo (`v_saldo_reserva`) |
| `POST /api/reservas/:id/pagos` | Admin, Recepción | Valida que no supere el saldo |
| `POST /api/reservas/:id/cargos` | Admin, Recepción | Servicio adicional con precio del catálogo |
| `GET /api/mantenimiento?estado=` | Admin, Servicios | Lista órdenes |
| `POST /api/mantenimiento` | todos | Llama a `sp_abrir_mantenimiento` |
| `PUT /api/mantenimiento/:id/en-proceso` | Administrador | Pendiente → En proceso |
| `PUT /api/mantenimiento/:id/resolver` | Admin, Servicios | Llama a `sp_cerrar_mantenimiento` |
| `PUT /api/mantenimiento/:id/costo` | Administrador | Registra costo y responsable |
| `GET /api/articulos` | todos | Productos con `estado_stock` |
| `POST /api/articulos` | Administrador | Crea producto (stock inicial 0) |
| `POST /api/articulos/movimientos` | según rol | Admin: todos; Recepción: Venta; Servicios: Consumo |
| `GET /api/publico/cabanas` | sin login | Catálogo público con servicios |
| `GET /api/publico/servicios` | sin login | Servicios incluidos para la web pública |
| `GET /api/publico/servicios-adicionales` | sin login | Servicios adicionales con precio |
| `GET /api/publico/disponibilidad?fecha_inicio=&fecha_fin=&personas=` | sin login | Cabañas libres, sin datos sensibles |

Códigos esperados: 200/201 correcto, 400 datos inválidos, 401 sin token o token vencido,
403 rol sin permiso, 404 no existe, 409 regla de negocio, 500 error inesperado.

## Estructura del backend

```
backend/
├── index.js                 arranque y montaje de rutas
├── .env                     claves (NO se versiona)
├── scripts/establecerContrasena.js
└── src/
    ├── config/db.js         pool de MySQL
    ├── middlewares/authMiddleware.js
    ├── utils/validar.js     esFecha, esEntero
    ├── utils/errores.js     traduce errores de MySQL a HTTP
    ├── controllers/         auth, cabana, cliente, reserva,
    │                        mantenimiento, articulo, publico
    └── routes/              una por módulo
```

## Base de datos (importante)

- Base: `lodgy` en MariaDB (XAMPP), puerto 3306.
- Scripts en `database/00...12`. Al recrear la base se ejecutan en orden: el
  `12` es necesario para que la API pueda reemplazar servicios.
- `database/12_ajustes_api.sql` concede `DELETE` **solo** sobre `Cabana_Servicio`
  al usuario `lodgy_api` (lo necesita para reemplazar servicios) y desactiva la
  cabaña de prueba `Cabaña Tolú Prueba` (id 12). No se elimina.
- Procedimientos usados: `sp_crear_reserva`, `sp_cancelar_reserva`,
  `sp_registrar_checkin`, `sp_registrar_checkout`, `sp_registrar_pago`,
  `sp_cabana_lista`, `sp_abrir_mantenimiento`, `sp_cerrar_mantenimiento`.
- Vistas: `v_saldo_reserva`, `v_estado_stock`, `v_catalogo_publico`,
  `v_trabajo_servicios`.
- Triggers de reservas: cruces y capacidad (existen y funcionan).
- **Corrección aplicada:** había dos triggers actualizando el stock a la vez
  (`trg_inventario_stock` y `trg_actualizar_stock_insert_after`). Se eliminó el
  segundo con `database/11_corregir_trigger_stock.sql`. Si se vuelve a ejecutar
  `08_stock.sql`, hay que volver a ejecutar el 11.
- El usuario `lodgy_api` no tiene `DELETE` global: solo SELECT, INSERT, UPDATE,
  EXECUTE y el permiso puntual sobre `Cabana_Servicio`. Para tareas de
  administración se usa root en MySQL Workbench.
- Pendiente opcional: más datos de prueba y un respaldo actualizado.

## Estado del frontend

Archivos:

```
frontend/
├── index.html               Web pública
├── dashboard.html           Login + panel + Reservas + Administración
├── css/                     tokens, site y dashboard
├── js/api.js                Cliente de API, JWT y errores
├── js/data.js               Fotos locales, contacto, iconos y permisos por rol
├── js/site.js               Catálogo y disponibilidad pública
├── js/dashboard.js          Sesión, panel, CRUD y permisos
└── assets/                  fuentes, imágenes y favicon
```

### Web pública

- Catálogo real desde `GET /api/publico/cabanas` (hoy 5 cabañas publicadas).
- Servicios incluidos y experiencias desde la API.
- Contadores y textos (número de cabañas, capacidades, tarifa mínima) calculados
  con datos reales.
- Buscador conectado a `GET /api/publico/disponibilidad`: valida fechas, consulta
  cruces reales y muestra únicamente las cabañas libres para el rango y el número
  de huéspedes. No promete una reserva: indica que se confirma al escribir.
- Estados de carga, error y reintento; los datos se escapan antes de insertarse
  en el DOM.
- Las fotos de la BD están en `NULL`; se usa un mapeo local por nombre como
  respaldo. Si una cabaña tiene `foto`, se respeta esa ruta.

### Panel

- Login real contra `POST /api/auth/login`; el token y el usuario se guardan en
  `localStorage`.
- Al recargar se valida la sesión con `GET /api/auth/yo`; si vence, se limpia y
  se pide entrar de nuevo.
- Cabecera con nombre, rol e iniciales reales; cierre de sesión con botón.
- Contadores, grid y detalle de cabañas desde `GET /api/cabanas`.
- Para Admin y Recepción se consulta `GET /api/reservas`; los datos de cliente
  alimentan el detalle operativo y el módulo de Reservas.
- Menú por rol: Administrador ve todo; Recepcionista no ve Inventario ni
  Administración; Servicios generales no ve Reservas, Clientes ni Administración.
  Un acceso directo a `#reservas` o `#administracion` sin permiso vuelve al Panel
  con aviso.
- Clientes, Inventario y Mantenimiento siguen como módulos en preparación.

### Reservas

- Disponible para Administrador y Recepcionista.
- Listado real desde `GET /api/reservas` con resumen por estado (Confirmada,
  En curso, Finalizada, Cancelada), búsqueda y filtros.
- Crear reserva con cliente existente o cliente nuevo en el mismo formulario.
  El cliente nuevo se registra con `POST /api/clientes`; si la reserva falla, el
  cliente queda creado y seleccionado para reintentar.
- Cabaña, entrada, salida y huéspedes. La disponibilidad se consulta contra
  `GET /api/cabanas/disponibilidad` al cambiar los datos.
- Tarifa y total estimado con el precio real de la cabaña. La reserva nace
  **Confirmada** y `sp_crear_reserva` copia el precio vigente.
- Acciones: cancelar con motivo opcional, check-in y check-out. Los errores de
  negocio de la API (cruces RN-01, capacidad, estados RN-05, etc.) se muestran en
  el diálogo sin cerrarlo.
- Los pagos, cargos y saldo todavía no tienen UI; los endpoints ya existen.

### Administración

- Resumen de cabañas (total, publicadas, desactivadas, recomendadas).
- Búsqueda y filtros por publicación.
- Crear y editar cabaña con nombre, descripción, capacidad, precio, foto,
  recomendada y servicios.
- Publicar y desactivar sin eliminar el registro.
- La asignación de servicios se guarda en `Cabana_Servicio`.
- La fotografía se elige entre rutas locales de referencia; no hay carga de
  archivos ni almacenamiento externo.
- Los cambios se guardan en la BD y se reflejan de inmediato en la web pública.

## Estado de Git

- Rama `main`, commit `9a480b7` (`feat: completar backend de Lodgy y corregir inventario`).
- Rama local `respaldo-antes-backend` en `6f859e0` (estado anterior a los cambios).
- Al momento de escribir esto, `main` está **1 commit por delante de `origin/main`**
  (falta `git push`).
- Los cambios de esta etapa (frontend conectado, endpoints nuevos y ajustes de BD)
  están **sin commit**.
- `.env` y `node_modules` están ignorados. No hay secretos en el repositorio.

## Siguiente etapa

1. Implementar en el panel los módulos de Clientes, Inventario y Mantenimiento
   con los endpoints que ya existen.
2. Integrar pagos, cargos y saldo de la reserva en la UI.
3. Agregar los endpoints nuevos a la colección de Postman.
4. Administración de servicios adicionales y usuarios.
5. Reemplazar fotos y datos de contacto provisionales; definir carga de imágenes.
6. Endurecer seguridad para producción: claves, límite de intentos, expiración y
   almacenamiento del token.
7. Revisar accesibilidad y responsive con datos reales y hacer el commit de la etapa.

## Cómo continuar en una conversación nueva

Abrir un chat nuevo en la misma carpeta del proyecto y decir:

> Lee `docs/ESTADO_PROYECTO.md`. El backend está listo y la web pública, el login,
> el panel operativo, Reservas y Administración ya están conectados a la API.
> Vamos a continuar con los módulos de Clientes, Inventario y Mantenimiento.
