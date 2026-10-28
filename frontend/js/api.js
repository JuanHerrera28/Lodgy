/* ==========================================================================
   Lodgy · Cliente de la API
   --------------------------------------------------------------------------
   Centraliza la URL del backend, el token JWT y los errores.
   El token se guarda en localStorage; ante un 401 se cierra la sesión y se
   avisa al panel con el evento «lodgy:sesion-expirada».
   ========================================================================== */

window.LODGY_API = (() => {
  "use strict";

  const BASE = (window.LODGY_API_BASE || "http://127.0.0.1:3000/api").replace(/\/+$/, "");
  const CLAVE_TOKEN = "lodgy.token";
  const CLAVE_USUARIO = "lodgy.usuario";

  class ErrorApi extends Error {
    constructor(mensaje, estado = 0, datos = null) {
      super(mensaje);
      this.name = "ErrorApi";
      this.estado = estado;
      this.datos = datos;
    }
  }

  const leerUsuario = () => {
    try {
      return JSON.parse(window.localStorage.getItem(CLAVE_USUARIO) || "null");
    } catch (error) {
      return null;
    }
  };

  const token = () => window.localStorage.getItem(CLAVE_TOKEN) || "";
  const usuario = () => leerUsuario();
  const activa = () => Boolean(token());

  const guardarSesion = (datos) => {
    window.localStorage.setItem(CLAVE_TOKEN, datos.token);
    if (datos.usuario) {
      window.localStorage.setItem(CLAVE_USUARIO, JSON.stringify(datos.usuario));
    }
  };

  const cerrarSesion = () => {
    window.localStorage.removeItem(CLAVE_TOKEN);
    window.localStorage.removeItem(CLAVE_USUARIO);
  };

  async function solicitar(ruta, opciones = {}) {
    const { metodo = "GET", cuerpo, autenticado = true } = opciones;
    const cabeceras = { "Content-Type": "application/json" };
    const actual = token();

    if (autenticado && actual) cabeceras.Authorization = `Bearer ${actual}`;

    let respuesta;
    try {
      respuesta = await fetch(`${BASE}${ruta}`, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch (error) {
      throw new ErrorApi(
        "No pudimos conectar con el servidor. Verifica que el backend esté en marcha.",
        0,
      );
    }

    const texto = await respuesta.text();
    let datos = null;
    if (texto) {
      try {
        datos = JSON.parse(texto);
      } catch (error) {
        datos = null;
      }
    }

    if (!respuesta.ok) {
      if (respuesta.status === 401 && autenticado) {
        cerrarSesion();
        window.dispatchEvent(new CustomEvent("lodgy:sesion-expirada"));
      }
      throw new ErrorApi(
        datos?.error || "No se pudo completar la solicitud.",
        respuesta.status,
        datos,
      );
    }

    return datos;
  }

  const publico = {
    cabanas: () => solicitar("/publico/cabanas", { autenticado: false }),
    servicios: () => solicitar("/publico/servicios", { autenticado: false }),
    experiencias: () => solicitar("/publico/servicios-adicionales", { autenticado: false }),
    disponibilidad: ({ fechaInicio, fechaFin, personas }) => {
      const parametros = new URLSearchParams({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        personas: String(personas || 1),
      });
      return solicitar(`/publico/disponibilidad?${parametros}`, { autenticado: false });
    },
    crearSolicitud: (datos) =>
      solicitar("/publico/solicitudes", {
        metodo: "POST",
        cuerpo: datos,
        autenticado: false,
      }),
  };

  const sesion = {
    activa,
    token,
    usuario,
    login: async (correo, contrasena) => {
      const datos = await solicitar("/auth/login", {
        metodo: "POST",
        cuerpo: { correo, contrasena },
        autenticado: false,
      });
      guardarSesion(datos);
      return datos;
    },
    actualizar: async () => {
      const datos = await solicitar("/auth/yo");
      guardarSesion({ token: token(), usuario: datos });
      return datos;
    },
    salir: cerrarSesion,
  };

  const cabanas = {
    listar: () => solicitar("/cabanas"),
    servicios: () => solicitar("/cabanas/servicios"),
    disponibilidad: ({ fechaInicio, fechaFin, personas }) => {
      const parametros = new URLSearchParams({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        personas: String(personas || 1),
      });
      return solicitar(`/cabanas/disponibilidad?${parametros}`);
    },
    crear: (datos) => solicitar("/cabanas", { metodo: "POST", cuerpo: datos }),
    actualizar: (id, datos) => solicitar(`/cabanas/${id}`, { metodo: "PUT", cuerpo: datos }),
    publicar: (id, estado) =>
      solicitar(`/cabanas/${id}/estado`, { metodo: "PUT", cuerpo: { activa: estado } }),
    asignarServicios: (id, servicios) =>
      solicitar(`/cabanas/${id}/servicios`, { metodo: "PUT", cuerpo: { servicios } }),
  };

  const clientes = {
    listar: (busqueda = "") => {
      const parametros = busqueda ? `?q=${encodeURIComponent(busqueda)}` : "";
      return solicitar(`/clientes${parametros}`);
    },
    crear: (datos) => solicitar("/clientes", { metodo: "POST", cuerpo: datos }),
  };

  const reservas = {
    listar: () => solicitar("/reservas"),
    crear: (datos) => solicitar("/reservas", { metodo: "POST", cuerpo: datos }),
    cancelar: (id, motivo = "") =>
      solicitar(`/reservas/${id}/cancelar`, { metodo: "POST", cuerpo: { motivo } }),
    checkin: (id) => solicitar(`/reservas/${id}/checkin`, { metodo: "POST" }),
    checkout: (id) => solicitar(`/reservas/${id}/checkout`, { metodo: "POST" }),
  };

  const solicitudes = {
    listar: (estado = "") => {
      const parametros = estado ? `?estado=${encodeURIComponent(estado)}` : "";
      return solicitar(`/solicitudes${parametros}`);
    },
    aprobar: (id) => solicitar(`/solicitudes/${id}/aprobar`, { metodo: "POST" }),
    rechazar: (id, motivo = "") =>
      solicitar(`/solicitudes/${id}/rechazar`, { metodo: "POST", cuerpo: { motivo } }),
  };

  return {
    BASE,
    ErrorApi,
    solicitar,
    publico,
    sesion,
    cabanas,
    clientes,
    reservas,
    solicitudes,
  };
})();
