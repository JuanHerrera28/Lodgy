/* ==========================================================================
   Lodgy · API para la aplicación de tareas
   Solo HTML, CSS y JavaScript puro. Sin librerías.
   ==========================================================================
*/

(function() {
  "use strict";

  // Base de la API
  const API_BASE = "http://localhost:3000";

  // Obtener cabecera de autorización
  function obtenerCabeceraAutorizacion() {
    const token = localStorage.getItem("token");
    if (!token) {
      return {};
    }
    return {
      "Authorization": "Bearer " + token
    };
  }

  // Manejar respuestas con errores
  function manejarRespuesta(resp) {
    if (resp.status === 401) {
      // Borrar sesión y volver a login
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
      return Promise.reject(new Error("Sesión inválida"));
    }
    if (resp.status === 403) {
      return resp.json().then(function(data) {
        throw new Error(data && data.error ? data.error : "No tienes permisos para esta acción");
      }).catch(function() {
        throw new Error("No tienes permisos para esta acción");
      });
    }
    return resp;
  }

  // POST /api/auth/login
  async function login(correo, contrasena) {
    try {
      const resp = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: correo,
          contrasena: contrasena
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(function() { return { error: "Correo o contraseña incorrectos" }; });
        throw new Error(errorData.error || "Correo o contraseña incorrectos");
      }

      return resp.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor");
      }
      throw error;
    }
  }

  // GET /api/cabanas/trabajo
  async function obtenerTrabajo() {
    const cabeceras = Object.assign({
      "Content-Type": "application/json"
    }, obtenerCabeceraAutorizacion());

    try {
      const resp = await fetch(API_BASE + "/api/cabanas/trabajo", {
        method: "GET",
        headers: cabeceras
      });

      const respManejada = await manejarRespuesta(resp);
      if (respManejada === undefined) {
        throw new Error("No autorizado");
      }

      if (!respManejada.ok) {
        const errorData = await respManejada.json().catch(function() { return { error: "Error al obtener el trabajo" }; });
        throw new Error(errorData.error || "Error al obtener el trabajo");
      }

      return respManejada.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      }
      throw error;
    }
  }

  // GET /api/cabanas
  async function obtenerCabanas() {
    const cabeceras = Object.assign({
      "Content-Type": "application/json"
    }, obtenerCabeceraAutorizacion());

    try {
      const resp = await fetch(API_BASE + "/api/cabanas", {
        method: "GET",
        headers: cabeceras
      });

      const respManejada = await manejarRespuesta(resp);
      if (respManejada === undefined) {
        throw new Error("No autorizado");
      }

      if (!respManejada.ok) {
        const errorData = await respManejada.json().catch(function() { return { error: "Error al obtener las cabañas" }; });
        throw new Error(errorData.error || "Error al obtener las cabañas");
      }

      return respManejada.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor");
      }
      throw error;
    }
  }

  // PUT /api/cabanas/:id/lista
  async function marcarCabanaLista(idCabana) {
    const cabeceras = Object.assign({
      "Content-Type": "application/json"
    }, obtenerCabeceraAutorizacion());

    try {
      const resp = await fetch(API_BASE + "/api/cabanas/" + idCabana + "/lista", {
        method: "PUT",
        headers: cabeceras
      });

      const respManejada = await manejarRespuesta(resp);
      if (respManejada === undefined) {
        throw new Error("No autorizado");
      }

      if (!respManejada.ok) {
        const errorData = await respManejada.json().catch(function() { return { error: "Error al marcar como lista" }; });
        throw new Error(errorData.error || "Error al marcar como lista");
      }

      return respManejada.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor");
      }
      throw error;
    }
  }

  // PUT /api/mantenimiento/:id/resolver
  async function resolverMantenimiento(idMantenimiento) {
    const cabeceras = Object.assign({
      "Content-Type": "application/json"
    }, obtenerCabeceraAutorizacion());

    try {
      const resp = await fetch(API_BASE + "/api/mantenimiento/" + idMantenimiento + "/resolver", {
        method: "PUT",
        headers: cabeceras
      });

      const respManejada = await manejarRespuesta(resp);
      if (respManejada === undefined) {
        throw new Error("No autorizado");
      }

      if (!respManejada.ok) {
        const errorData = await respManejada.json().catch(function() { return { error: "Error al resolver el mantenimiento" }; });
        throw new Error(errorData.error || "Error al resolver el mantenimiento");
      }

      return respManejada.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor");
      }
      throw error;
    }
  }

  // POST /api/mantenimiento
  async function reportarMantenimiento(datos) {
    const cabeceras = Object.assign({
      "Content-Type": "application/json"
    }, obtenerCabeceraAutorizacion());

    try {
      const resp = await fetch(API_BASE + "/api/mantenimiento", {
        method: "POST",
        headers: cabeceras,
        body: JSON.stringify(datos)
      });

      const respManejada = await manejarRespuesta(resp);
      if (respManejada === undefined) {
        throw new Error("No autorizado");
      }

      if (!respManejada.ok) {
        const errorData = await respManejada.json().catch(function() { return { error: "Error al reportar el mantenimiento" }; });
        throw new Error(errorData.error || "Error al reportar el mantenimiento");
      }

      return respManejada.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar con el servidor");
      }
      throw error;
    }
  }

  // Exportar
  window.LodgyAPI = {
    login: login,
    obtenerTrabajo: obtenerTrabajo,
    obtenerCabanas: obtenerCabanas,
    marcarCabanaLista: marcarCabanaLista,
    resolverMantenimiento: resolverMantenimiento,
    reportarMantenimiento: reportarMantenimiento
  };

})();
