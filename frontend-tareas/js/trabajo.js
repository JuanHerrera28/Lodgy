/* ==========================================================================
   Lodgy · Lógica de tareas
   Solo HTML, CSS y JavaScript puro. Sin librerías.
   ==========================================================================
*/

(function() {
  "use strict";

  let temporizadorActualizar = null;
  let temporizadoresBotones = {};

  // Verificar sesión
  function verificarSesion() {
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");
    
    if (!token) {
      window.location.href = "index.html";
      return null;
    }
    
    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario.rol !== "Servicios generales" && usuario.rol !== "Administrador") {
        window.location.href = "index.html";
        return null;
      }
      return usuario;
    } catch (e) {
      window.location.href = "index.html";
      return null;
    }
  }

  // Hace cuánto tiempo
  function haceCuantoTiempo(fechaStr) {
    try {
      const fecha = new Date(fechaStr.replace(' ', 'T'));
      const ahora = new Date();
      const diffMs = ahora - fecha;
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffHoras / 24);
      
      if (diffDias > 0) {
        return "hace " + diffDias + (diffDias === 1 ? " día" : " días");
      } else if (diffHoras > 0) {
        return "hace " + diffHoras + (diffHoras === 1 ? " hora" : " horas");
      } else {
        const diffMin = Math.floor(diffMs / (1000 * 60));
        if (diffMin > 0) {
          return "hace " + diffMin + (diffMin === 1 ? " minuto" : " minutos");
        }
        return "hace un momento";
      }
    } catch (e) {
      return "";
    }
  }

  // Mostrar mensaje
  function mostrarMensaje(texto, tipo) {
    const contenedor = document.getElementById("mensajesContenedor");
    const msg = document.createElement("div");
    msg.className = tipo === "exito" ? "mensaje mensaje-exito" : "mensaje mensaje-error";
    msg.textContent = texto;
    msg.setAttribute("role", "status");
    contenedor.appendChild(msg);
    
    setTimeout(function() {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    }, 5000);
  }

  // Actualizar hora
  function actualizarHora() {
    const ahora = new Date();
    const h = String(ahora.getHours()).padStart(2, '0');
    const m = String(ahora.getMinutes()).padStart(2, '0');
    document.getElementById("actualizadoA").textContent = "Actualizado a las " + h + ":" + m;
  }

  // Cargar trabajo
  async function cargarTrabajo() {
    const estadoCarga = document.getElementById("estadoCarga");
    const seccionCabanas = document.getElementById("seccionCabanas");
    const seccionDanos = document.getElementById("seccionDanos");
    
    try {
      const datos = await window.LodgyAPI.obtenerTrabajo();
      
      estadoCarga.style.display = "none";
      seccionCabanas.style.display = "block";
      seccionDanos.style.display = "block";
      
      // Cabañas por limpiar
      const listaCabanas = document.getElementById("listaCabanas");
      const contadorCabanas = document.getElementById("contadorCabanas");
      const sinCabanas = document.getElementById("sinCabanas");
      
      listaCabanas.innerHTML = "";
      const cabanas = datos.cabanas_por_limpiar || [];
      contadorCabanas.textContent = cabanas.length;
      
      if (cabanas.length === 0) {
        sinCabanas.style.display = "block";
      } else {
        sinCabanas.style.display = "none";
        cabanas.forEach(function(cabana) {
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta tarjeta-cabana";
          
          const nombre = document.createElement("div");
          nombre.className = "tarjeta-nombre";
          nombre.textContent = cabana.nombre;
          
          const btn = document.createElement("button");
          btn.className = "btn btn-grande";
          btn.style.width = "auto";
          btn.style.minWidth = "120px";
          btn.textContent = "Listo";
          btn.setAttribute("data-id", cabana.id_cabana);
          btn.setAttribute("data-tipo", "cabana");
          
          btn.addEventListener("click", function() {
            manejarConfirmacion(btn, function() {
              marcarLista(cabana.id_cabana, btn);
            });
          });
          
          tarjeta.appendChild(nombre);
          tarjeta.appendChild(btn);
          listaCabanas.appendChild(tarjeta);
        });
      }
      
      // Daños pendientes
      const listaDanos = document.getElementById("listaDanos");
      const contadorDanos = document.getElementById("contadorDanos");
      const sinDanos = document.getElementById("sinDanos");
      
      listaDanos.innerHTML = "";
      const danos = datos.ordenes_pendientes || [];
      contadorDanos.textContent = danos.length;
      
      if (danos.length === 0) {
        sinDanos.style.display = "block";
      } else {
        sinDanos.style.display = "none";
        danos.forEach(function(dano) {
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta";
          
          const cabanaNombre = document.createElement("div");
          cabanaNombre.className = "tarjeta-nombre tarjeta-cabana-nombre";
          cabanaNombre.textContent = dano.cabana;
          
          const descripcion = document.createElement("div");
          descripcion.className = "tarjeta-descripcion";
          descripcion.textContent = dano.descripcion;
          
          const info = document.createElement("div");
          info.className = "tarjeta-info";
          
          const estado = document.createElement("span");
          estado.className = "tarjeta-estado";
          estado.textContent = dano.estado;
          
          const tiempo = document.createElement("span");
          tiempo.textContent = haceCuantoTiempo(dano.fecha_reporte);
          
          info.appendChild(estado);
          info.appendChild(tiempo);
          
          const btn = document.createElement("button");
          btn.className = "btn btn-grande";
          btn.textContent = "Resolver";
          btn.setAttribute("data-id", dano.id_mantenimiento);
          btn.setAttribute("data-tipo", "mantenimiento");
          
          btn.addEventListener("click", function() {
            manejarConfirmacion(btn, function() {
              resolverDano(dano.id_mantenimiento, btn);
            });
          });
          
          tarjeta.appendChild(cabanaNombre);
          tarjeta.appendChild(descripcion);
          tarjeta.appendChild(info);
          tarjeta.appendChild(btn);
          listaDanos.appendChild(tarjeta);
        });
      }
      
      actualizarHora();
      
    } catch (error) {
      estadoCarga.style.display = "none";
      document.getElementById("seccionCabanas").style.display = "block";
      document.getElementById("seccionDanos").style.display = "block";
      document.getElementById("contadorCabanas").textContent = "0";
      document.getElementById("contadorDanos").textContent = "0";
      document.getElementById("sinCabanas").style.display = "block";
      document.getElementById("sinDanos").style.display = "block";
      mostrarMensaje(error.message || "Error al cargar", "error");
    }
  }

  // Manejar confirmación doble toque
  function manejarConfirmacion(boton, callback) {
    const id = boton.getAttribute("data-id") + "_" + boton.getAttribute("data-tipo");
    
    if (temporizadoresBotones[id]) {
      clearTimeout(temporizadoresBotones[id]);
      delete temporizadoresBotones[id];
      callback();
    } else {
      const original = boton.textContent;
      boton.textContent = "¿Confirmar?";
      temporizadoresBotones[id] = setTimeout(function() {
        boton.textContent = original;
        delete temporizadoresBotones[id];
      }, 4000);
    }
  }

  // Marcar lista
  async function marcarLista(idCabana, boton) {
    const original = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.marcarCabanaLista(idCabana);
      mostrarMensaje("Cabaña marcada como lista", "exito");
      cargarTrabajo();
    } catch (error) {
      boton.disabled = false;
      boton.textContent = original;
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else {
        mostrarMensaje(error.message, "error");
      }
    }
  }

  // Resolver daño
  async function resolverDano(idMantenimiento, boton) {
    const original = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.resolverMantenimiento(idMantenimiento);
      mostrarMensaje("Daño resuelto", "exito");
      cargarTrabajo();
    } catch (error) {
      boton.disabled = false;
      boton.textContent = original;
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else {
        mostrarMensaje(error.message, "error");
      }
    }
  }

  // Cargar cabanas para formulario
  async function cargarCabanasFormulario() {
    const select = document.getElementById("selectCabana");
    try {
      const cabanas = await window.LodgyAPI.obtenerCabanas();
      select.innerHTML = "";
      cabanas.forEach(function(cabana) {
        const option = document.createElement("option");
        option.value = cabana.id_cabana;
        option.textContent = cabana.nombre;
        select.appendChild(option);
      });
    } catch (error) {
      mostrarMensaje("Error al cargar cabañas", "error");
    }
  }

  // Panel reporte
  function abrirPanel() {
    document.getElementById("panelReporte").classList.add("activo");
    document.getElementById("descripcionDano").value = "";
    document.getElementById("bloqueaCabana").checked = false;
    document.getElementById("contador").textContent = "0";
    document.getElementById("btnEnviarReporte").disabled = false;
    document.getElementById("btnEnviarReporte").textContent = "Enviar";
    cargarCabanasFormulario();
    setTimeout(function() {
      document.getElementById("descripcionDano").focus();
    }, 100);
  }

  function cerrarPanel() {
    document.getElementById("panelReporte").classList.remove("activo");
  }

  async function enviarReporte() {
    const idCabana = document.getElementById("selectCabana").value;
    const descripcion = document.getElementById("descripcionDano").value.trim();
    const bloquea = document.getElementById("bloqueaCabana").checked;
    
    if (!descripcion) {
      mostrarMensaje("La descripción es obligatoria", "error");
      document.getElementById("descripcionDano").focus();
      return;
    }
    
    if (descripcion.length > 300) {
      mostrarMensaje("La descripción no puede exceder 300 caracteres", "error");
      return;
    }
    
    const btn = document.getElementById("btnEnviarReporte");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.reportarMantenimiento({
        id_cabana: parseInt(idCabana),
        descripcion: descripcion,
        bloquea_cabana: bloquea
      });
      mostrarMensaje("Daño reportado", "exito");
      cerrarPanel();
      cargarTrabajo();
    } catch (error) {
      btn.disabled = false;
      btn.textContent = "Enviar";
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else {
        mostrarMensaje(error.message, "error");
      }
    }
  }

  // Inicializar
  function inicializar() {
    verificarSesion();
    
    document.getElementById("btnCerrarSesion").addEventListener("click", function() {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
    
    document.getElementById("btnActualizar").addEventListener("click", cargarTrabajo);
    document.getElementById("btnReportarDano").addEventListener("click", abrirPanel);
    document.getElementById("btnCancelarReporte").addEventListener("click", cerrarPanel);
    document.getElementById("btnEnviarReporte").addEventListener("click", enviarReporte);
    
    document.getElementById("descripcionDano").addEventListener("input", function() {
      document.getElementById("contador").textContent = this.value.length;
    });
    
    document.getElementById("panelReporte").addEventListener("click", function(e) {
      if (e.target.id === "panelReporte") {
        cerrarPanel();
      }
    });
    
    actualizarHora();
    cargarTrabajo();
    
    if (temporizadorActualizar) {
      clearInterval(temporizadorActualizar);
    }
    temporizadorActualizar = setInterval(cargarTrabajo, 45000);
    setInterval(actualizarHora, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

})();
