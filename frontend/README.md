# Lodgy · Frontend

Web pública y panel administrativo de Lodgy en HTML, CSS y JavaScript, sin build
step. La web pública, el login, el panel operativo, el módulo de Reservas y el de
Administración ya consumen la API real.

## Cómo verlo

1. Arranca la API (ver `docs/ESTADO_PROYECTO.md`):

   ```bash
   cd backend
   npm start
   ```

2. Sirve el frontend por HTTP en el puerto **5500**. Desde la raíz del repositorio:

   ```bash
   python -m http.server 5500
   ```

   Abre:

   - Web pública: <http://127.0.0.1:5500/frontend/index.html>
   - Panel: <http://127.0.0.1:5500/frontend/dashboard.html>

   También puedes servir solo esta carpeta:

   ```bash
   python -m http.server 5500 --directory frontend
   ```

   Y abrir <http://127.0.0.1:5500/index.html> o `/dashboard.html`.

El CORS del backend permite `http://localhost:5500` y `http://127.0.0.1:5500`.
Si usas otro puerto, agrégalo en `CORS_ORIGENES` del `backend/.env` y reinicia la
API. Abrir los HTML con doble clic (`file://`) no permite las llamadas a la API.

## Acceso al panel

| Correo | Rol | Contraseña |
|---|---|---|
| ana@lodgy.com | Administrador | Lodgy12345 |
| maria@lodgy.com | Recepcionista | Lodgy12345 |
| servicios@lodgy.com | Servicios generales | Lodgy12345 |

El menú se adapta al rol:

- **Administrador:** todos los módulos, incluido Administración.
- **Recepcionista:** Panel, Reservas, Clientes y Mantenimiento.
- **Servicios generales:** Panel, Inventario y Mantenimiento.

## Estructura

```
frontend/
├── index.html              Web pública
├── dashboard.html          Login + panel + Reservas + Administración
├── css/
│   ├── tokens.css          Paleta, tipografía, base y estados
│   ├── site.css            Estilos de la web pública
│   └── dashboard.css       Estilos del login y del panel
├── js/
│   ├── api.js              Cliente de API, JWT y manejo de errores
│   ├── data.js             Fotos locales, contacto, iconos y permisos por rol
│   ├── site.js             Catálogo y disponibilidad pública
│   └── dashboard.js        Sesión, panel, CRUD y permisos
└── assets/
    ├── fonts/              Cormorant Garamond y Manrope (locales)
    ├── images/             Fotografías de referencia (Unsplash)
    └── favicon.svg
```

## Web pública

Orden de la página:

1. Navegación fija y menú móvil.
2. Hero con fotografía y mensaje editorial.
3. Buscador de estancia.
4. «Un refugio entre naturaleza y mar».
5. Catálogo de cabañas publicadas.
6. Servicios incluidos y experiencias adicionales.
7. Ubicación.
8. Footer con contacto y acceso al sistema.

### Datos reales

- **Catálogo:** `GET /api/publico/cabanas`. Hoy devuelve 5 cabañas publicadas.
- **Servicios incluidos:** `GET /api/publico/servicios`.
- **Experiencias:** `GET /api/publico/servicios-adicionales`.
- **Disponibilidad:** `GET /api/publico/disponibilidad`.

Los textos que dependen de los datos (número de cabañas, capacidad mínima y
máxima, tarifa mínima) se calculan al cargar. No hay precios ni disponibilidad
inventados.

### Búsqueda

El formulario valida las fechas y consulta el endpoint público de disponibilidad,
que aplica la misma regla de cruces de reservas que el backend. El catálogo se
filtra por las cabañas libres para el rango y el número de huéspedes, y muestra
un contexto con la consulta y un enlace para ver todas.

La reserva no se crea desde la web pública: el mensaje indica que se confirma al
escribir. La creación real se hace desde el módulo de Reservas del panel, con un
cliente existente o registrando uno nuevo en el mismo formulario.

### Detalle de cabaña

El modal «Ver cabaña» incluye una galería con el exterior, la habitación, la
piscina y la cocina. Las imágenes de piscina y cocina solo aparecen cuando la
cabaña tiene esos servicios en la base de datos. La galería se recorre con las
flechas, los puntos, el teclado (`←` / `→`) o un gesto táctil. El cierre con
Escape, el clic en el fondo y las transiciones respetan `prefers-reduced-motion`.

### Fotos y datos provisionales

- `foto` está en `NULL` para las cabañas de prueba. Se usa un mapeo local por
  nombre como respaldo; si la BD trae una ruta, se respeta.
- Correo, teléfono, WhatsApp, Instagram y Facebook son provisionales.
- La ubicación pública es Coveñas, Sucre; la dirección exacta se comparte al
  confirmar la reserva.
- Las fotografías son imágenes de referencia de Unsplash.

## Panel

- **Login real:** `POST /api/auth/login`. El token y el usuario se guardan en
  `localStorage`.
- **Sesión:** al recargar se valida con `GET /api/auth/yo`. Si el token vence, se
  limpia y se pide entrar de nuevo.
- **Cabecera:** nombre, rol e iniciales reales, fecha y botón de salida.
- **Panel:** contadores, grid y detalle de cabañas con datos de `GET /api/cabanas`.
- **Reservas:** listado real con contadores por estado, búsqueda y filtros. El
  panel consulta `GET /api/reservas` para el detalle de la cabaña ocupada.
- **Módulos pendientes:** Clientes, Inventario y Mantenimiento muestran el aviso
  de «en preparación». Los endpoints existen; falta construir la UI.

### Reservas

Solo la ven Administrador y Recepcionista. Incluye:

- Resumen de confirmadas, en curso, finalizadas y canceladas.
- Búsqueda por cliente, documento, cabaña u observaciones y filtros por estado.
- Nueva reserva con cliente existente (buscador y selector) o cliente nuevo
  registrado en el mismo formulario (tipo y número de documento, nombre,
  apellido, teléfono y correo opcional).
- Cabaña, fechas y huéspedes. La entrada y la salida se ajustan entre sí; la
  capacidad máxima la define la cabaña.
- Consulta de disponibilidad contra `GET /api/cabanas/disponibilidad` al cambiar
  cabaña, fechas o huéspedes, con aviso inmediato de cruces o capacidad.
- Tarifa por noche tomada de la BD, noches y total estimado. El precio definitivo
  lo copia `sp_crear_reserva` al crear la reserva.
- Crear (nace **Confirmada**), cancelar con motivo opcional, registrar check-in y
  registrar check-out. Cada acción muestra los errores de negocio de la API
  (cruces, capacidad, estados) sin cerrar el diálogo.
- Si el cliente nuevo se crea pero la reserva falla, el cliente queda registrado
  y el formulario cambia a «cliente existente» con ese cliente seleccionado.

La creación y las acciones usan `POST /api/reservas`, `/cancelar`, `/checkin` y
`/checkout`. Los pagos y el saldo quedan para una etapa posterior.

### Administración

Solo la ve el rol Administrador. Incluye:

- Resumen de cabañas: total, publicadas, desactivadas y recomendadas.
- Búsqueda por nombre o descripción y filtros por publicación.
- Crear y editar cabaña: nombre, descripción, capacidad, precio por noche,
  fotografía, recomendada y servicios incluidos.
- Publicar y desactivar sin eliminar el registro (RN-17).
- Aviso al desactivar una cabaña con reserva en curso: se oculta del catálogo,
  pero la reserva no se cancela.
- Validación de nombre obligatorio, capacidad entera y precio no negativo.

Los cambios se guardan en la base de datos y se reflejan de inmediato en la web
pública. La fotografía se elige entre las rutas locales de referencia; todavía
no hay carga de archivos.

## Integración

| Vista | Fuente real |
|---|---|
| Catálogo público | `GET /api/publico/cabanas` |
| Servicios incluidos | `GET /api/publico/servicios` |
| Experiencias | `GET /api/publico/servicios-adicionales` |
| Disponibilidad pública | `GET /api/publico/disponibilidad` |
| Cabañas y estados del panel | `GET /api/cabanas` |
| Disponibilidad privada (reservas) | `GET /api/cabanas/disponibilidad` |
| Servicios asignables | `GET /api/cabanas/servicios` |
| Crear cabaña | `POST /api/cabanas` |
| Editar cabaña | `PUT /api/cabanas/:id` |
| Publicar / desactivar | `PUT /api/cabanas/:id/estado` |
| Asignar servicios | `PUT /api/cabanas/:id/servicios` |
| Clientes | `GET /api/clientes` + `POST /api/clientes` |
| Reservas | `GET /api/reservas` |
| Crear reserva | `POST /api/reservas` |
| Cancelar / check-in / check-out | `POST /api/reservas/:id/cancelar`, `/checkin`, `/checkout` |
| Usuario y rol | `POST /api/auth/login` + `GET /api/auth/yo` |
| Permisos del menú | Rol devuelto por la sesión |

La URL de la API se configura en `js/api.js` (por defecto
`http://127.0.0.1:3000/api`). Para otro entorno, define `window.LODGY_API_BASE`
antes de cargar ese script.

## Siguiente etapa

1. Construir las pantallas de Clientes, Inventario y Mantenimiento con los
   endpoints existentes.
2. Integrar pagos, cargos y saldo de la reserva en el panel.
3. Administración de servicios adicionales y usuarios.
4. Reemplazar fotos y datos de contacto por los definitivos.
5. Definir carga y almacenamiento de imágenes.
6. Endurecer la seguridad para producción (claves, límite de intentos, token).
7. Revisar accesibilidad y responsive con datos reales.
