/* ==========================================================================
   Lodgy · Panel administrativo
   --------------------------------------------------------------------------
   Sesión JWT contra /api/auth y datos reales de /api/cabanas y /api/reservas.
   La edición del catálogo usa los endpoints de administración.
   ========================================================================== */

(() => {
  "use strict";

  const contenido = window.LODGY;
  const api = window.LODGY_API;

  if (!contenido || !api) {
    console.error("Faltan js/data.js o js/api.js.");
    return;
  }

  const fotos = contenido.fotos || [];
  const permisosPorRol = contenido.permisosPorRol || {};

  const CLASES_ESTADO = {
    Disponible: "status--available",
    Ocupada: "status--occupied",
    "En Limpieza": "status--cleaning",
    "En Mantenimiento": "status--maintenance",
  };

  const CLASES_RESERVA = {
    Confirmada: "status--confirmed",
    "En curso": "status--in-progress",
    Finalizada: "status--finished",
    Cancelada: "status--cancelled",
  };

  const CLASES_SOLICITUD = {
    Pendiente: "status--pending",
    Aprobada: "status--confirmed",
    Rechazada: "status--cancelled",
  };

  const DESCRIPCION_ESTADO = {
    Disponible: "Lista para recibir huéspedes",
    Ocupada: "Con huéspedes alojados",
    "En Limpieza": "Pendiente de limpieza",
    "En Mantenimiento": "Fuera de servicio",
  };

  const elementos = {
    date: document.querySelector("#today-date"),
    avatar: document.querySelector("#user-avatar"),
    userName: document.querySelector("#user-name"),
    userRole: document.querySelector("#user-role"),
    greetingTime: document.querySelector("#greeting-time"),
    greeting: document.querySelector("#greeting-name"),
    totalCabins: document.querySelector("#total-cabins"),
    cabins: document.querySelector("#admin-cabins"),
    filters: Array.from(document.querySelectorAll(".filter-tab:not([data-catalog-filter])")),
    counts: Array.from(document.querySelectorAll("[data-count]")),
    statTotals: Array.from(document.querySelectorAll(".stat-card__value span")),
    filterCounts: Array.from(document.querySelectorAll("[data-filter-count]")),
    refresh: document.querySelector("#refresh-btn"),
    updatedAt: document.querySelector("#updated-at"),
    dialog: document.querySelector("#detail-dialog"),
    dialogKicker: document.querySelector("#detail-kicker"),
    dialogTitle: document.querySelector("#detail-title"),
    dialogContent: document.querySelector("#detail-content"),
    toast: document.querySelector("#toast"),
    sidebar: document.querySelector("#sidebar"),
    sidebarToggle: document.querySelector("#sidebar-toggle"),
    sidebarClose: document.querySelector("#sidebar-close"),
    sidebarBackdrop: document.querySelector("#sidebar-backdrop"),
    navLinks: Array.from(document.querySelectorAll(".sidebar__link")),
    viewPanel: document.querySelector("#view-panel"),
    viewReservas: document.querySelector("#view-reservas"),
    viewAdmin: document.querySelector("#view-administracion"),
    panelTitle: document.querySelector("#panel-title"),
    reservasTitle: document.querySelector("#reservas-title"),
    reservationsList: document.querySelector("#reservations-list"),
    reservationsSearch: document.querySelector("#reservations-search"),
    reservationFilters: Array.from(document.querySelectorAll("[data-reservation-filter]")),
    reservationFilterCounts: Array.from(document.querySelectorAll("[data-reservation-count]")),
    summaryResConfirmed: document.querySelector("#summary-res-confirmed"),
    summaryResInProgress: document.querySelector("#summary-res-in-progress"),
    summaryResFinished: document.querySelector("#summary-res-finished"),
    summaryResCancelled: document.querySelector("#summary-res-cancelled"),
    newReservationBtn: document.querySelector("#new-reservation-btn"),
    reservationFormDialog: document.querySelector("#reservation-form-dialog"),
    reservationForm: document.querySelector("#reservation-form"),
    reservationClientMode: Array.from(document.querySelectorAll('input[name="cliente_modo"]')),
    reservationClientExisting: document.querySelector("[data-client-existing]"),
    reservationClientNew: document.querySelector("[data-client-new]"),
    reservationClientSearch: document.querySelector("#reservation-client-search"),
    reservationClient: document.querySelector("#reservation-client"),
    reservationClientError: document.querySelector("#reservation-client-error"),
    reservationNewDocType: document.querySelector("#reservation-new-doc-type"),
    reservationNewDoc: document.querySelector("#reservation-new-doc"),
    reservationNewName: document.querySelector("#reservation-new-name"),
    reservationNewLastname: document.querySelector("#reservation-new-lastname"),
    reservationNewPhone: document.querySelector("#reservation-new-phone"),
    reservationNewEmail: document.querySelector("#reservation-new-email"),
    reservationCabin: document.querySelector("#reservation-cabin"),
    reservationCabinHint: document.querySelector("#reservation-cabin-hint"),
    reservationCheckin: document.querySelector("#reservation-checkin"),
    reservationCheckout: document.querySelector("#reservation-checkout"),
    reservationGuests: document.querySelector("#reservation-guests"),
    reservationObservations: document.querySelector("#reservation-observations"),
    reservationRate: document.querySelector("#reservation-rate"),
    reservationNights: document.querySelector("#reservation-nights"),
    reservationTotal: document.querySelector("#reservation-total"),
    reservationAvailability: document.querySelector("#reservation-availability"),
    reservationFormNote: document.querySelector("#reservation-form-note"),
    reservationFormSubmit: document.querySelector("#reservation-form-submit"),
    reservationActionDialog: document.querySelector("#reservation-action-dialog"),
    reservationActionTitle: document.querySelector("#reservation-action-title"),
    reservationActionCopy: document.querySelector("#reservation-action-copy"),
    reservationReasonField: document.querySelector("#reservation-reason-field"),
    reservationReason: document.querySelector("#reservation-reason"),
    reservationActionNote: document.querySelector("#reservation-action-note"),
    reservationActionConfirm: document.querySelector("#reservation-action-confirm"),
    requestsList: document.querySelector("#requests-list"),
    requestFilters: Array.from(document.querySelectorAll("[data-request-filter]")),
    requestFilterCounts: Array.from(document.querySelectorAll("[data-request-count]")),
    requestActionDialog: document.querySelector("#request-action-dialog"),
    requestActionTitle: document.querySelector("#request-action-title"),
    requestActionCopy: document.querySelector("#request-action-copy"),
    requestReasonField: document.querySelector("#request-reason-field"),
    requestReason: document.querySelector("#request-reason"),
    requestActionNote: document.querySelector("#request-action-note"),
    requestActionConfirm: document.querySelector("#request-action-confirm"),
    catalogTitle: document.querySelector("#catalog-title"),
    catalogList: document.querySelector("#catalog-list"),
    catalogSearch: document.querySelector("#catalog-search"),
    catalogFilters: Array.from(document.querySelectorAll("[data-catalog-filter]")),
    catalogCounts: Array.from(document.querySelectorAll("[data-catalog-count]")),
    summaryTotal: document.querySelector("#summary-total"),
    summaryActive: document.querySelector("#summary-active"),
    summaryInactive: document.querySelector("#summary-inactive"),
    summaryFeatured: document.querySelector("#summary-featured"),
    newCabinBtn: document.querySelector("#new-cabin-btn"),
    formDialog: document.querySelector("#cabin-form-dialog"),
    form: document.querySelector("#cabin-form"),
    formKicker: document.querySelector("#cabin-form-kicker"),
    formTitle: document.querySelector("#cabin-form-title"),
    formNote: document.querySelector("#cabin-form-note"),
    formSubmit: document.querySelector("#cabin-form-submit"),
    nameInput: document.querySelector("#cabin-name"),
    descriptionInput: document.querySelector("#cabin-description"),
    capacityInput: document.querySelector("#cabin-capacity"),
    priceInput: document.querySelector("#cabin-price"),
    photoSelect: document.querySelector("#cabin-photo"),
    featuredInput: document.querySelector("#cabin-featured"),
    servicesWrap: document.querySelector("#cabin-services"),
    statusDialog: document.querySelector("#cabin-status-dialog"),
    statusTitle: document.querySelector("#cabin-status-title"),
    statusCopy: document.querySelector("#cabin-status-copy"),
    statusNote: document.querySelector("#cabin-status-note"),
    statusConfirm: document.querySelector("#cabin-status-confirm"),
    adminShell: document.querySelector("#admin-shell"),
    loginScreen: document.querySelector("#login-screen"),
    loginForm: document.querySelector("#login-form"),
    loginEmail: document.querySelector("#login-correo"),
    loginPassword: document.querySelector("#login-contrasena"),
    loginNote: document.querySelector("#login-note"),
    loginSubmit: document.querySelector("#login-submit"),
    loginToggle: document.querySelector("#login-toggle"),
    sessionLoader: document.querySelector("#session-loader"),
    logoutBtn: document.querySelector("#logout-btn"),
  };

  let usuario = null;
  let cabanas = [];
  let serviciosCatalogo = [];
  let reservas = [];
  let solicitudes = [];
  let clientes = [];
  let puedeAdministrar = false;
  let puedeVerReservas = false;
  let panelPreparado = false;
  let filtroActivo = "all";
  let catalogoFiltro = "todas";
  let catalogoBusqueda = "";
  let reservaFiltro = "todas";
  let reservaBusqueda = "";
  let solicitudFiltro = "todas";
  let cabanaEnEdicion = null;
  let cabanaEnEstado = null;
  let reservaEnAccion = null;
  let accionReserva = "";
  let solicitudEnAccion = null;
  let accionSolicitud = "";
  let focoAntesDialogo = null;
  let ultimaActualizacion = new Date();
  let toastTimer = null;
  let refreshTimer = null;
  let disponibilidadTimer = null;
  let disponibilidadSolicitud = 0;
  let disponibilidadActual = null;
  let elementoConFoco = null;
  let guardandoCabana = false;
  let guardandoReserva = false;
  let ejecutandoAccionReserva = false;
  let ejecutandoAccionSolicitud = false;
  let refrescando = false;

  const temporizadoresDialogo = new WeakMap();
  const movimientoReducido = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const sincronizarBloqueoDialogos = () => {
    const abierto = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("is-locked", abierto);
    return !abierto;
  };

  const fechaLarga = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fechaCorta = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  });

  const moneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */

  function escapar(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalizarNombre(valor) {
    return String(valor)
      .trim()
      .replace(/^caba[ñn]a\s+/i, "")
      .toLocaleLowerCase("es");
  }

  function formatearMoneda(valor) {
    return moneda.format(valor).replace(/\s/g, " ");
  }

  function fecha(valor) {
    if (!valor) return "—";
    const fechaParseada = new Date(`${valor}T12:00:00`);
    if (Number.isNaN(fechaParseada.getTime())) return valor;
    return fechaCorta.format(fechaParseada).replace(".", "");
  }

  function fechaHora(valor) {
    if (!valor) return "—";
    const normalizado = String(valor).replace(" ", "T");
    const fechaParseada = new Date(normalizado);
    if (Number.isNaN(fechaParseada.getTime())) return String(valor);
    return fechaParseada.toLocaleString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function fechaISO(objetoFecha) {
    const anio = objetoFecha.getFullYear();
    const mes = String(objetoFecha.getMonth() + 1).padStart(2, "0");
    const dia = String(objetoFecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }

  function sumarDias(iso, dias) {
    if (!iso) return "";
    const base = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(base.getTime())) return "";
    base.setDate(base.getDate() + dias);
    return fechaISO(base);
  }

  function normalizarBusqueda(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es")
      .trim();
  }

  function nochesDeReserva(reserva) {
    if (!reserva) return 0;
    const entrada = new Date(`${reserva.fecha_entrada}T12:00:00`);
    const salida = new Date(`${reserva.fecha_salida}T12:00:00`);
    const dias = Math.round((salida - entrada) / 86400000);
    return Number.isFinite(dias) && dias > 0 ? dias : 0;
  }

  function nombreCliente(reserva) {
    return `${reserva.cliente_nombre || ""} ${reserva.cliente_apellido || ""}`.trim();
  }

  function documentoCliente(reserva) {
    const tipo = reserva.tipo_documento || "";
    const numero = reserva.numero_documento || "";
    return `${tipo} ${numero}`.trim();
  }

  const cabanaPorId = (id) => cabanas.find((cabana) => Number(cabana.id) === Number(id));
  const estadoDe = (cabana) => cabana.estado || "Disponible";

  const reservaEnCurso = (cabana) =>
    reservas.find(
      (reserva) => Number(reserva.id_cabana) === Number(cabana.id) && reserva.estado === "En curso",
    ) || null;

  function permisosDelUsuario() {
    return permisosPorRol[usuario?.rol] || [];
  }

  function actualizarPermisos() {
    const permisos = permisosDelUsuario();
    puedeAdministrar = permisos.includes("administracion");
    puedeVerReservas = usuario?.rol === "Administrador" || usuario?.rol === "Recepcionista";
  }

  function mostrarToast(mensaje) {
    if (!elementos.toast) return;
    window.clearTimeout(toastTimer);
    elementos.toast.textContent = mensaje;
    elementos.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      elementos.toast.classList.remove("is-visible");
    }, 3600);
  }

  function actualizarTextoActualizacion() {
    if (!elementos.updatedAt) return;
    const minutos = Math.floor((Date.now() - ultimaActualizacion.getTime()) / 60000);
    const hora = ultimaActualizacion.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (minutos < 1) {
      elementos.updatedAt.textContent = `Actualizado ahora mismo · ${hora}`;
    } else if (minutos === 1) {
      elementos.updatedAt.textContent = "Actualizado hace 1 minuto";
    } else {
      elementos.updatedAt.textContent = `Actualizado hace ${minutos} minutos`;
    }
  }

  function adaptarCabana(cabana, indice) {
    return {
      id: Number(cabana.id_cabana),
      nombre: cabana.nombre,
      descripcion: cabana.descripcion || "",
      capacidad: Number(cabana.capacidad) || 0,
      precioNoche: Number(cabana.precio_noche) || 0,
      recomendada: Boolean(cabana.es_recomendada),
      activa: Boolean(cabana.activa),
      estado: cabana.estado || "Disponible",
      servicios: String(cabana.servicios || "")
        .split(",")
        .map((servicio) => servicio.trim())
        .filter(Boolean),
      serviciosIds: String(cabana.ids_servicios || "")
        .split(",")
        .map((id) => Number(id))
        .filter(Boolean),
      imagen: contenido.imagenDeCabana(cabana, indice),
    };
  }

  function adaptarReserva(reserva) {
    const noches = nochesDeReserva(reserva);
    const precioNoche = Number(reserva.precio_noche) || 0;
    return {
      ...reserva,
      noches,
      total: precioNoche * noches,
    };
  }

  function adaptarSolicitud(solicitud) {
    const noches =
      Number(solicitud.noches) ||
      Math.max(
        0,
        Math.round(
          (new Date(`${solicitud.fecha_salida}T12:00:00`) -
            new Date(`${solicitud.fecha_entrada}T12:00:00`)) /
            86400000,
        ),
      );
    const precioNoche = Number(solicitud.precio_noche) || 0;
    return {
      ...solicitud,
      noches,
      total: Number(solicitud.total_estimado) || precioNoche * noches,
    };
  }

  /* ------------------------------------------------------------------------
     Sesión
     ------------------------------------------------------------------------ */

  function setLoginOcupado(ocupado) {
    if (!elementos.loginSubmit) return;
    elementos.loginSubmit.disabled = ocupado;
    elementos.loginSubmit.textContent = ocupado ? "Entrando…" : "Entrar";
    elementos.loginForm?.setAttribute("aria-busy", String(ocupado));
  }

  function mostrarLogin(mensaje = "") {
    if (elementos.adminShell) elementos.adminShell.hidden = true;
    if (elementos.sessionLoader) elementos.sessionLoader.hidden = true;
    if (elementos.loginScreen) elementos.loginScreen.hidden = false;
    if (elementos.loginNote) {
      elementos.loginNote.textContent = mensaje;
      elementos.loginNote.classList.remove("is-error");
    }
    document.body.classList.add("is-login");
  }

  function mostrarCargadorSesion() {
    if (elementos.adminShell) elementos.adminShell.hidden = true;
    if (elementos.loginScreen) elementos.loginScreen.hidden = true;
    if (elementos.sessionLoader) elementos.sessionLoader.hidden = false;
  }

  function mostrarPanel() {
    if (elementos.loginScreen) elementos.loginScreen.hidden = true;
    if (elementos.sessionLoader) elementos.sessionLoader.hidden = true;
    if (elementos.adminShell) elementos.adminShell.hidden = false;
    document.body.classList.remove("is-login");
  }

  function iniciarCabecera() {
    const hoy = new Date();
    const iniciales = `${usuario?.nombre?.[0] || ""}${usuario?.apellido?.[0] || ""}`.toLocaleUpperCase(
      "es",
    );

    if (elementos.date) elementos.date.textContent = fechaLarga.format(hoy);
    if (elementos.avatar) elementos.avatar.textContent = iniciales || "LO";
    if (elementos.userName) {
      elementos.userName.textContent = `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim();
    }
    if (elementos.userRole) elementos.userRole.textContent = usuario?.rol || "";
    if (elementos.greetingTime) elementos.greetingTime.textContent = saludoDelDia(hoy.getHours());
    if (elementos.greeting) elementos.greeting.textContent = usuario?.nombre || "";
  }

  function saludoDelDia(hora) {
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function iniciarPermisos() {
    const permitidos = permisosDelUsuario();

    elementos.navLinks.forEach((enlace) => {
      const permiso = enlace.dataset.permission;
      if (permiso) enlace.hidden = !permitidos.includes(permiso);
    });
  }

  function actualizarSesionUI() {
    actualizarPermisos();
    iniciarCabecera();
    iniciarPermisos();
  }

  async function entrar(evento) {
    evento.preventDefault();
    if (elementos.loginSubmit?.disabled) return;

    const correo = elementos.loginEmail?.value.trim() || "";
    const contrasena = elementos.loginPassword?.value || "";

    if (!correo || !contrasena) {
      if (elementos.loginNote) {
        elementos.loginNote.textContent = "Escribe tu correo y contraseña.";
        elementos.loginNote.classList.add("is-error");
      }
      (correo ? elementos.loginPassword : elementos.loginEmail)?.focus();
      return;
    }

    if (elementos.loginNote) {
      elementos.loginNote.textContent = "";
      elementos.loginNote.classList.remove("is-error");
    }
    setLoginOcupado(true);

    try {
      const datos = await api.sesion.login(correo, contrasena);
      usuario = datos.usuario;
      if (elementos.loginForm) elementos.loginForm.reset();
      await activarPanel();
    } catch (error) {
      if (elementos.loginNote) {
        elementos.loginNote.textContent =
          error?.message || "No pudimos iniciar sesión. Intenta de nuevo.";
        elementos.loginNote.classList.add("is-error");
      }
    } finally {
      setLoginOcupado(false);
    }
  }

  function salir(mensaje = "Tu sesión se cerró correctamente.") {
    api.sesion.salir();
    usuario = null;
    cabanas = [];
    serviciosCatalogo = [];
    reservas = [];
    clientes = [];
    filtroActivo = "all";
    catalogoBusqueda = "";
    catalogoFiltro = "todas";
    reservaFiltro = "todas";
    reservaBusqueda = "";
    disponibilidadActual = null;
    window.clearTimeout(disponibilidadTimer);
    if (elementos.cabins) elementos.cabins.innerHTML = "";
    if (elementos.catalogList) elementos.catalogList.innerHTML = "";
    if (elementos.reservationsList) elementos.reservationsList.innerHTML = "";
    document.querySelectorAll("dialog[open]").forEach((dialogo) => {
      if (typeof dialogo.close === "function") dialogo.close();
      else dialogo.removeAttribute("open");
    });
    document.body.classList.remove("is-locked");
    try {
      window.history.replaceState(null, "", "#panel");
    } catch (error) {
      window.location.hash = "#panel";
    }
    mostrarLogin(mensaje);
  }

  /* ------------------------------------------------------------------------
     Contadores y filtros
     ------------------------------------------------------------------------ */

  function renderContadores() {
    if (elementos.totalCabins) elementos.totalCabins.textContent = String(cabanas.length);
    elementos.statTotals.forEach((span) => {
      span.textContent = `de ${cabanas.length}`;
    });

    elementos.counts.forEach((contador) => {
      const estado = contador.dataset.count;
      contador.textContent = String(
        cabanas.filter((cabana) => estadoDe(cabana) === estado).length,
      );
    });

    elementos.filterCounts.forEach((contador) => {
      const filtro = contador.dataset.filterCount;
      contador.textContent = String(
        filtro === "all"
          ? cabanas.length
          : cabanas.filter((cabana) => estadoDe(cabana) === filtro).length,
      );
    });
  }

  /* ------------------------------------------------------------------------
     Tarjetas de cabañas
     ------------------------------------------------------------------------ */

  function plantillaCabana(cabana, indice) {
    const estado = estadoDe(cabana);
    const claseEstado = CLASES_ESTADO[estado] || "status--maintenance";
    const imagen = cabana.imagen;
    const reserva = estado === "Ocupada" ? reservaEnCurso(cabana) : null;

    const servicios = cabana.servicios
      .slice(0, 4)
      .map((servicio) => `<li>${escapar(servicio)}</li>`)
      .join("");

    const bloqueHuesped = estado === "Ocupada"
      ? `
        <div class="admin-cabin__guest">
          <span>Huésped actual</span>
          <strong>${
            reserva
              ? escapar(`${nombreCliente(reserva)} · ${fecha(reserva.fecha_salida)}`)
              : "Reserva no disponible"
          }</strong>
        </div>`
      : "";

    return `
      <article class="admin-cabin" data-status="${escapar(estado)}" style="--cabin-delay:${indice * 45}ms">
        <figure class="admin-cabin__media">
          <img
            src="${escapar(imagen.src)}"
            srcset="${escapar(imagen.srcset || "")}"
            sizes="(max-width: 720px) 100vw, (max-width: 1380px) 30vw, 260px"
            alt="${escapar(imagen.alt)}"
            width="${imagen.width || 1400}"
            height="${imagen.height || 934}"
            loading="lazy"
            decoding="async"
          >
          <span class="admin-cabin__id">Cabaña ${String(cabana.id).padStart(2, "0")}</span>
        </figure>

        <div class="admin-cabin__body">
          <div class="admin-cabin__head">
            <div class="admin-cabin__title">
              <h3>${escapar(cabana.nombre.replace(/^Cabaña\s+/i, ""))}</h3>
              <p>${escapar(cabana.descripcion || "Sin descripción registrada.")}</p>
            </div>
            <span class="status ${claseEstado}">${escapar(estado)}</span>
          </div>

          <dl class="admin-cabin__meta">
            <div>
              <dt>Capacidad</dt>
              <dd>${cabana.capacidad} personas</dd>
            </div>
            <div>
              <dt>Tarifa / noche</dt>
              <dd>${escapar(formatearMoneda(cabana.precioNoche))}</dd>
            </div>
          </dl>

          <ul class="admin-cabin__services" aria-label="Servicios incluidos">
            ${servicios || "<li>Sin servicios asignados</li>"}
          </ul>

          ${bloqueHuesped}

          <div class="admin-cabin__foot">
            <span class="admin-cabin__note">${escapar(DESCRIPCION_ESTADO[estado] || "")}</span>
            <button
              class="admin-cabin__action"
              type="button"
              data-cabin-id="${cabana.id}"
              aria-label="${reserva ? "Ver reserva de" : "Ver detalle de"} ${escapar(cabana.nombre)}"
            >
              ${reserva ? "Ver reserva" : "Ver detalle"}
              <svg class="icon" aria-hidden="true"><use href="#icon-chevron-right"></use></svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderCabanas() {
    if (!elementos.cabins) return;

    const lista = cabanas.filter(
      (cabana) => filtroActivo === "all" || estadoDe(cabana) === filtroActivo,
    );

    if (lista.length === 0) {
      elementos.cabins.innerHTML = `
        <div class="admin-cabins-empty">
          <strong>Sin cabañas en este estado</strong>
          <span>Selecciona otro filtro para ver el resto de la operación.</span>
        </div>`;
      return;
    }

    elementos.cabins.innerHTML = lista.map(plantillaCabana).join("");
  }

  function renderResumenReservas() {
    const contar = (estado) => reservas.filter((reserva) => reserva.estado === estado).length;

    if (elementos.summaryResConfirmed) {
      elementos.summaryResConfirmed.textContent = String(contar("Confirmada"));
    }
    if (elementos.summaryResInProgress) {
      elementos.summaryResInProgress.textContent = String(contar("En curso"));
    }
    if (elementos.summaryResFinished) {
      elementos.summaryResFinished.textContent = String(contar("Finalizada"));
    }
    if (elementos.summaryResCancelled) {
      elementos.summaryResCancelled.textContent = String(contar("Cancelada"));
    }

    elementos.reservationFilterCounts.forEach((contador) => {
      const filtro = contador.dataset.reservationCount;
      contador.textContent = String(
        filtro === "todas"
          ? reservas.length
          : reservas.filter((reserva) => reserva.estado === filtro).length,
      );
    });
  }

  function plantillaReserva(reserva) {
    const estado = reserva.estado || "Confirmada";
    const claseEstado = CLASES_RESERVA[estado] || "status--maintenance";
    const cliente = nombreCliente(reserva) || "Cliente sin nombre";
    const documento = documentoCliente(reserva);
    const contacto = [documento, reserva.telefono, reserva.correo].filter(Boolean).join(" · ");
    const cabana = reserva.cabana || cabanaPorId(reserva.id_cabana)?.nombre || "Cabaña";
    const referencia = `Reserva #${String(reserva.id_reserva).padStart(5, "0")}`;
    const observaciones = reserva.observaciones
      ? `<p class="reservation-card__note">${escapar(reserva.observaciones)}</p>`
      : '<p class="reservation-card__note reservation-card__note--muted">Sin observaciones registradas.</p>';

    const registros = [];
    if (reserva.fecha_checkin) registros.push(`Check-in ${fechaHora(reserva.fecha_checkin)}`);
    if (reserva.fecha_checkout) registros.push(`Check-out ${fechaHora(reserva.fecha_checkout)}`);

    let acciones = "";
    if (estado === "Confirmada") {
      acciones = `
        <button class="row-action row-action--danger" type="button" data-res-action="cancelar"
          data-res-id="${reserva.id_reserva}">Cancelar</button>
        <button class="row-action" type="button" data-res-action="checkin"
          data-res-id="${reserva.id_reserva}">Registrar check-in</button>`;
    } else if (estado === "En curso") {
      acciones = `
        <button class="row-action" type="button" data-res-action="checkout"
          data-res-id="${reserva.id_reserva}">Registrar check-out</button>`;
    }

    return `
      <article class="reservation-card" data-status="${escapar(estado)}">
        <div class="reservation-card__head">
          <div class="reservation-card__identity">
            <div class="reservation-card__title">
              <h2>${escapar(cliente)}</h2>
              <span class="status ${claseEstado}">${escapar(estado)}</span>
            </div>
            <p>${escapar(contacto || "Sin datos de contacto")}</p>
            <span class="reservation-card__ref">${escapar(referencia)}</span>
          </div>
          <span class="reservation-card__total">
            <span>Total estancia</span>
            <strong>${escapar(formatearMoneda(reserva.total))}</strong>
          </span>
        </div>

        <dl class="reservation-card__meta">
          <div class="reservation-card__meta-wide">
            <dt>Cabaña</dt>
            <dd>${escapar(cabana)}</dd>
          </div>
          <div>
            <dt>Entrada</dt>
            <dd>${escapar(fecha(reserva.fecha_entrada))}</dd>
          </div>
          <div>
            <dt>Salida</dt>
            <dd>${escapar(fecha(reserva.fecha_salida))}</dd>
          </div>
          <div>
            <dt>Noches</dt>
            <dd>${reserva.noches}</dd>
          </div>
          <div>
            <dt>Huéspedes</dt>
            <dd>${Number(reserva.num_personas) || 0}</dd>
          </div>
          <div>
            <dt>Tarifa</dt>
            <dd>${escapar(formatearMoneda(reserva.precio_noche))} / noche</dd>
          </div>
        </dl>

        <div class="reservation-card__foot">
          <div class="reservation-card__detail">
            ${observaciones}
            ${registros.length ? `<p class="reservation-card__log">${escapar(registros.join(" · "))}</p>` : ""}
          </div>
          ${acciones ? `<div class="reservation-card__actions">${acciones}</div>` : ""}
        </div>
      </article>`;
  }

  function renderReservas() {
    if (!elementos.reservationsList) return;

    renderResumenReservas();

    const busqueda = normalizarBusqueda(reservaBusqueda);
    const visibles = reservas.filter((reserva) => {
      if (reservaFiltro !== "todas" && reserva.estado !== reservaFiltro) return false;
      if (!busqueda) return true;

      const texto = normalizarBusqueda(
        [
          reserva.id_reserva,
          nombreCliente(reserva),
          documentoCliente(reserva),
          reserva.telefono,
          reserva.correo,
          reserva.cabana,
          reserva.observaciones,
        ].join(" "),
      );
      return texto.includes(busqueda);
    });

    if (visibles.length === 0) {
      const hayReservas = reservas.length > 0;
      elementos.reservationsList.innerHTML = `
        <div class="catalog-empty">
          <strong>${hayReservas ? "Sin reservas que coincidan" : "Aún no hay reservas"}</strong>
          <span>${
            hayReservas
              ? "Prueba con otro cliente, documento o cambia el filtro de estado."
              : "Registra la primera reserva con cliente, cabaña, fechas y huéspedes."
          }</span>
          <button class="btn btn--outline" type="button" ${
            hayReservas ? "data-clear-reservations" : "data-new-reservation"
          }>
            ${hayReservas ? "Limpiar búsqueda y filtros" : "Nueva reserva"}
          </button>
        </div>`;
      return;
    }

    elementos.reservationsList.innerHTML = visibles.map(plantillaReserva).join("");
  }

  function renderResumenSolicitudes() {
    elementos.requestFilterCounts.forEach((contador) => {
      const filtro = contador.dataset.requestCount;
      contador.textContent = String(
        filtro === "todas"
          ? solicitudes.length
          : solicitudes.filter((solicitud) => solicitud.estado === filtro).length,
      );
    });
  }

  function plantillaSolicitud(solicitud) {
    const estado = solicitud.estado || "Pendiente";
    const claseEstado = CLASES_SOLICITUD[estado] || "status--maintenance";
    const cliente = `${solicitud.nombre || ""} ${solicitud.apellido || ""}`.trim() || "Sin nombre";
    const documento = `${solicitud.tipo_documento || ""} ${solicitud.numero_documento || ""}`.trim();
    const contacto = [documento, solicitud.telefono, solicitud.correo].filter(Boolean).join(" · ");
    const cabana = solicitud.cabana || cabanaPorId(solicitud.id_cabana)?.nombre || "Cabaña";
    const referencia = `Solicitud S-${String(solicitud.id_solicitud).padStart(5, "0")}`;
    const recibida = solicitud.fecha_creacion
      ? `Recibida ${fechaHora(solicitud.fecha_creacion)}`
      : "Sin fecha de recepción";

    let detalle = '<p class="reservation-card__note reservation-card__note--muted">Sin observaciones del huésped.</p>';
    if (solicitud.observaciones) {
      detalle = `<p class="reservation-card__note">${escapar(solicitud.observaciones)}</p>`;
    }

    let seguimiento = "";
    if (estado === "Aprobada" && solicitud.id_reserva) {
      seguimiento = `<p class="request-card__linked">Reserva #${String(solicitud.id_reserva).padStart(5, "0")} creada al aprobar.</p>`;
    } else if (estado === "Rechazada") {
      seguimiento = `<p class="request-card__linked request-card__linked--rejected">${
        solicitud.motivo_rechazo
          ? `Motivo: ${escapar(solicitud.motivo_rechazo)}`
          : "Rechazada sin motivo registrado."
      }</p>`;
    }

    const acciones =
      estado === "Pendiente"
        ? `<div class="reservation-card__actions">
            <button class="row-action row-action--danger" type="button" data-request-action="rechazar"
              data-request-id="${solicitud.id_solicitud}">Rechazar</button>
            <button class="row-action" type="button" data-request-action="aprobar"
              data-request-id="${solicitud.id_solicitud}">Aprobar y crear reserva</button>
          </div>`
        : "";

    return `
      <article class="reservation-card request-card" data-status="${escapar(estado)}">
        <div class="reservation-card__head">
          <div class="reservation-card__identity">
            <div class="reservation-card__title">
              <h2>${escapar(cliente)}</h2>
              <span class="status ${claseEstado}">${escapar(estado)}</span>
            </div>
            <p>${escapar(contacto || "Sin datos de contacto")}</p>
            <span class="reservation-card__ref">${escapar(referencia)} · ${escapar(recibida)}</span>
          </div>
          <span class="reservation-card__total">
            <span>Total estimado</span>
            <strong>${escapar(formatearMoneda(solicitud.total))}</strong>
          </span>
        </div>

        <dl class="reservation-card__meta">
          <div class="reservation-card__meta-wide">
            <dt>Cabaña</dt>
            <dd>${escapar(cabana)}</dd>
          </div>
          <div>
            <dt>Entrada</dt>
            <dd>${escapar(fecha(solicitud.fecha_entrada))}</dd>
          </div>
          <div>
            <dt>Salida</dt>
            <dd>${escapar(fecha(solicitud.fecha_salida))}</dd>
          </div>
          <div>
            <dt>Noches</dt>
            <dd>${solicitud.noches}</dd>
          </div>
          <div>
            <dt>Huéspedes</dt>
            <dd>${Number(solicitud.num_personas) || 0}</dd>
          </div>
          <div>
            <dt>Tarifa</dt>
            <dd>${escapar(formatearMoneda(solicitud.precio_noche))} / noche</dd>
          </div>
        </dl>

        <div class="reservation-card__foot">
          <div class="reservation-card__detail">
            ${detalle}
            ${seguimiento}
          </div>
          ${acciones}
        </div>
      </article>`;
  }

  function renderSolicitudes() {
    if (!elementos.requestsList) return;

    renderResumenSolicitudes();

    const visibles =
      solicitudFiltro === "todas"
        ? solicitudes
        : solicitudes.filter((solicitud) => solicitud.estado === solicitudFiltro);

    if (!solicitudes.length) {
      elementos.requestsList.innerHTML = `
        <div class="catalog-empty">
          <strong>Sin solicitudes por ahora</strong>
          <span>Cuando alguien envíe el formulario de la web, aparecerá aquí para aprobarla o rechazarla.</span>
        </div>`;
      return;
    }

    if (!visibles.length) {
      elementos.requestsList.innerHTML = `
        <div class="catalog-empty">
          <strong>No hay solicitudes ${escapar(
            solicitudFiltro === "Pendiente"
              ? "pendientes"
              : solicitudFiltro === "Aprobada"
                ? "aprobadas"
                : "rechazadas",
          )}</strong>
          <span>Cambia el filtro para revisar las demás solicitudes.</span>
          <button class="btn btn--outline" type="button" data-clear-requests>Ver todas</button>
        </div>`;
      return;
    }

    elementos.requestsList.innerHTML = visibles.map(plantillaSolicitud).join("");
  }

  function renderTodo() {
    renderContadores();
    renderCabanas();
    renderCatalogo();
    renderReservas();
    renderSolicitudes();
  }

  /* ------------------------------------------------------------------------
     Detalle de cabaña / reserva
     ------------------------------------------------------------------------ */

  function plantillaDetalle(cabana) {
    const estado = estadoDe(cabana);
    const claseEstado = CLASES_ESTADO[estado] || "status--maintenance";
    const reserva = estado === "Ocupada" ? reservaEnCurso(cabana) : null;
    const imagen = cabana.imagen;

    const servicios = cabana.servicios
      .map((servicio) => `<li>${escapar(servicio)}</li>`)
      .join("") || "<li>Sin servicios asignados</li>";

    const datosCabana = `
      <section class="detail-section">
        <h3 class="detail-section__title">La cabaña</h3>
        <dl class="detail-grid">
          <div>
            <dt>Capacidad</dt>
            <dd>${cabana.capacidad} personas</dd>
          </div>
          <div>
            <dt>Tarifa por noche</dt>
            <dd>${escapar(formatearMoneda(cabana.precioNoche))}</dd>
          </div>
          <div>
            <dt>Identificador</dt>
            <dd>Cab-${String(cabana.id).padStart(3, "0")}</dd>
          </div>
          <div>
            <dt>Estado operativo</dt>
            <dd><span class="status ${claseEstado}">${escapar(estado)}</span></dd>
          </div>
          <div>
            <dt>Publicación</dt>
            <dd>${cabana.activa ? "Publicada en la web" : "Desactivada"}</dd>
          </div>
        </dl>
      </section>

      <section class="detail-section">
        <h3 class="detail-section__title">Servicios incluidos</h3>
        <ul class="detail-services">${servicios}</ul>
      </section>`;

    if (reserva) {
      const telefono = String(reserva.telefono || "").replace(/\D/g, "");
      const correo = reserva.correo || "";
      const observaciones = reserva.observaciones || "Sin observaciones registradas.";

      const acciones = [
        telefono
          ? `<a class="btn btn--primary" href="tel:+57${escapar(telefono)}">
               <svg class="icon" aria-hidden="true"><use href="#icon-phone"></use></svg>
               Llamar al huésped
             </a>`
          : "",
        correo
          ? `<a class="btn btn--outline" href="mailto:${escapar(correo)}">
               <svg class="icon" aria-hidden="true"><use href="#icon-mail"></use></svg>
               Enviar correo
             </a>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
        <div class="detail-hero">
          <img
            src="${escapar(imagen.src)}"
            alt="${escapar(imagen.alt)}"
            width="${imagen.width || 1400}"
            height="${imagen.height || 934}"
            loading="lazy"
            decoding="async"
          >
          <div class="detail-hero__copy">
            <span class="status ${claseEstado}">${escapar(estado)}</span>
            <p>${escapar(cabana.descripcion || "Sin descripción registrada.")}</p>
          </div>
        </div>

        <section class="detail-section">
          <h3 class="detail-section__title">Reserva en curso</h3>
          <dl class="detail-grid">
            <div>
              <dt>Huésped</dt>
              <dd>${escapar(nombreCliente(reserva))}</dd>
            </div>
            <div>
              <dt>Documento</dt>
              <dd>${escapar(documentoCliente(reserva) || "No registrado")}</dd>
            </div>
            <div>
              <dt>Personas</dt>
              <dd>${reserva.num_personas} huéspedes</dd>
            </div>
            <div>
              <dt>Noches</dt>
              <dd>${nochesDeReserva(reserva)} noches</dd>
            </div>
            <div>
              <dt>Llegada</dt>
              <dd>${escapar(fecha(reserva.fecha_entrada))}</dd>
            </div>
            <div>
              <dt>Salida</dt>
              <dd>${escapar(fecha(reserva.fecha_salida))}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>${
                telefono
                  ? `<a href="tel:+57${escapar(telefono)}">${escapar(reserva.telefono)}</a>`
                  : "No registrado"
              }</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>${
                correo
                  ? `<a href="mailto:${escapar(correo)}">${escapar(correo)}</a>`
                  : "No registrado"
              }</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3 class="detail-section__title">Observaciones</h3>
          <p class="detail-note detail-note--occupied">${escapar(observaciones)}</p>
        </section>

        ${datosCabana}

        ${acciones ? `<div class="detail-actions">${acciones}</div>` : ""}`;
    }

    const notas = {
      Disponible:
        "La cabaña está lista para recibir huéspedes. La disponibilidad por fechas se calcula con las reservas activas.",
      "En Limpieza":
        "La cabaña está pendiente de limpieza. El equipo de servicios generales la marca como lista al terminar.",
      "En Mantenimiento":
        "La cabaña está fuera de servicio por mantenimiento. Se actualiza desde el módulo de mantenimiento.",
    };

    return `
      <div class="detail-hero">
        <img
          src="${escapar(imagen.src)}"
          alt="${escapar(imagen.alt)}"
          width="${imagen.width || 1400}"
          height="${imagen.height || 934}"
          loading="lazy"
          decoding="async"
        >
        <div class="detail-hero__copy">
          <span class="status ${claseEstado}">${escapar(estado)}</span>
          <p>${escapar(cabana.descripcion || "Sin descripción registrada.")}</p>
        </div>
      </div>

      ${datosCabana}

      <section class="detail-section">
        <h3 class="detail-section__title">Nota operativa</h3>
        <p class="detail-note">${escapar(notas[estado] || notas.Disponible)}</p>
      </section>

      <div class="detail-actions">
        <a class="btn btn--outline" href="index.html#cabanas">
          <svg class="icon" aria-hidden="true"><use href="#icon-arrow-up-right"></use></svg>
          Ver en la web pública
        </a>
        <button class="btn btn--primary" type="button" data-close-detail>
          Cerrar detalle
        </button>
      </div>`;
  }

  function abrirDetalle(cabana) {
    if (!elementos.dialog || !cabana) return;

    const reserva = estadoDe(cabana) === "Ocupada" ? reservaEnCurso(cabana) : null;

    elementos.dialogKicker.textContent = reserva ? "Reserva en curso" : "Detalle de cabaña";
    elementos.dialogTitle.textContent = cabana.nombre;
    elementos.dialogContent.innerHTML = plantillaDetalle(cabana);

    abrirDialogo(elementos.dialog);
    elementos.dialog.querySelector(".dialog-close")?.focus();
  }

  function cerrarDetalle() {
    cerrarDialogo(elementos.dialog);
  }

  /* ------------------------------------------------------------------------
     Administración · catálogo de cabañas
     ------------------------------------------------------------------------ */

  function abrirDialogo(dialogo) {
    if (!dialogo) return;

    focoAntesDialogo = document.activeElement;
    window.clearTimeout(temporizadoresDialogo.get(dialogo));
    temporizadoresDialogo.delete(dialogo);
    dialogo.classList.remove("is-closing");

    if (typeof dialogo.showModal === "function") {
      if (!dialogo.open) dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }
    document.body.classList.add("is-locked");
  }

  function cerrarDialogo(dialogo) {
    if (!dialogo || dialogo.classList.contains("is-closing")) return;

    const finalizar = () => {
      window.clearTimeout(temporizadoresDialogo.get(dialogo));
      temporizadoresDialogo.delete(dialogo);
      dialogo.classList.remove("is-closing");
      if (typeof dialogo.close === "function" && dialogo.open) {
        dialogo.close();
      } else {
        dialogo.removeAttribute("open");
      }
      if (sincronizarBloqueoDialogos()) restaurarFocoDialogo();
    };

    if (movimientoReducido()) {
      finalizar();
      return;
    }

    dialogo.classList.add("is-closing");
    temporizadoresDialogo.set(dialogo, window.setTimeout(finalizar, 200));
  }

  function restaurarFocoDialogo() {
    if (!focoAntesDialogo) return;
    if (focoAntesDialogo instanceof HTMLElement && focoAntesDialogo.isConnected) {
      focoAntesDialogo.focus();
    } else {
      document.querySelector(".admin-view:not([hidden]) h1[tabindex='-1']")?.focus();
    }
    focoAntesDialogo = null;
  }

  function poblarOpcionesFoto(seleccionada) {
    if (!elementos.photoSelect) return;

    const opciones = fotos.slice();
    if (seleccionada && !opciones.some((opcion) => opcion.src === seleccionada)) {
      opciones.unshift({ src: seleccionada, etiqueta: "Foto actual" });
    }

    elementos.photoSelect.innerHTML = opciones
      .map(
        (opcion) =>
          `<option value="${escapar(opcion.src)}">${escapar(opcion.etiqueta || opcion.src)}</option>`,
      )
      .join("");

    if (seleccionada) elementos.photoSelect.value = seleccionada;
  }

  function poblarServicios(seleccionados = []) {
    if (!elementos.servicesWrap) return;

    if (!serviciosCatalogo.length) {
      elementos.servicesWrap.innerHTML =
        '<p class="form-hint">No hay servicios disponibles en el catálogo.</p>';
      return;
    }

    const ids = new Set(seleccionados.map(Number));

    elementos.servicesWrap.innerHTML = serviciosCatalogo
      .map(
        (servicio) => `
          <label class="check">
            <input type="checkbox" name="servicios" value="${Number(servicio.id_servicio)}"
              ${ids.has(Number(servicio.id_servicio)) ? "checked" : ""}>
            <span>${escapar(servicio.nombre)}</span>
          </label>`,
      )
      .join("");
  }

  function marcarError(input, idError, mensaje) {
    if (!input) return;
    const error = document.getElementById(idError);
    const campo = input.closest(".form-field");
    if (error) error.textContent = mensaje;
    if (campo) campo.classList.toggle("has-error", Boolean(mensaje));
    input.setAttribute("aria-invalid", mensaje ? "true" : "false");
  }

  function limpiarErroresFormulario() {
    [
      [elementos.nameInput, "cabin-name-error"],
      [elementos.capacityInput, "cabin-capacity-error"],
      [elementos.priceInput, "cabin-price-error"],
    ].forEach(([input, idError]) => marcarError(input, idError, ""));
    if (elementos.formNote) elementos.formNote.textContent = "";
  }

  function abrirFormulario(cabana = null) {
    if (!elementos.formDialog) return;
    cabanaEnEdicion = cabana;
    limpiarErroresFormulario();
    poblarOpcionesFoto(cabana?.imagen?.src);

    if (cabana) {
      elementos.formKicker.textContent = `Cab-${String(cabana.id).padStart(3, "0")}`;
      elementos.formTitle.textContent = `Editar ${cabana.nombre.replace(/^Cabaña\s+/i, "")}`;
      elementos.formSubmit.textContent = "Guardar cambios";
      elementos.nameInput.value = cabana.nombre;
      elementos.descriptionInput.value = cabana.descripcion || "";
      elementos.capacityInput.value = String(cabana.capacidad);
      elementos.priceInput.value = String(cabana.precioNoche);
      elementos.featuredInput.checked = Boolean(cabana.recomendada);
      poblarServicios(cabana.serviciosIds || []);
    } else {
      elementos.formKicker.textContent = "Catálogo";
      elementos.formTitle.textContent = "Nueva cabaña";
      elementos.formSubmit.textContent = "Crear cabaña";
      elementos.form.reset();
      elementos.featuredInput.checked = false;
      poblarServicios();
      poblarOpcionesFoto();
    }

    abrirDialogo(elementos.formDialog);
    window.setTimeout(() => elementos.nameInput?.focus(), 60);
  }

  function cerrarFormulario() {
    cerrarDialogo(elementos.formDialog);
    cabanaEnEdicion = null;
  }

  function validarFormulario() {
    limpiarErroresFormulario();

    const nombre = elementos.nameInput.value.trim();
    const capacidad = Number(elementos.capacityInput.value);
    const precioTexto = elementos.priceInput.value.trim();
    const precio = Number(precioTexto);
    let primerInvalido = null;

    const duplicado = cabanas.some(
      (cabana) =>
        Number(cabana.id) !== Number(cabanaEnEdicion?.id) &&
        normalizarNombre(cabana.nombre) === normalizarNombre(nombre),
    );

    if (!nombre) {
      marcarError(elementos.nameInput, "cabin-name-error", "Escribe el nombre de la cabaña.");
      primerInvalido = primerInvalido || elementos.nameInput;
    } else if (nombre.length > 50) {
      marcarError(
        elementos.nameInput,
        "cabin-name-error",
        "El nombre no puede superar los 50 caracteres.",
      );
      primerInvalido = primerInvalido || elementos.nameInput;
    } else if (duplicado) {
      marcarError(elementos.nameInput, "cabin-name-error", "Ya existe una cabaña con ese nombre.");
      primerInvalido = primerInvalido || elementos.nameInput;
    }

    if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 99) {
      marcarError(
        elementos.capacityInput,
        "cabin-capacity-error",
        "Indica una capacidad entre 1 y 99 personas.",
      );
      primerInvalido = primerInvalido || elementos.capacityInput;
    }

    if (!precioTexto || !Number.isFinite(precio) || precio < 0 || precio > 99999999) {
      marcarError(
        elementos.priceInput,
        "cabin-price-error",
        "Indica una tarifa válida en pesos colombianos.",
      );
      primerInvalido = primerInvalido || elementos.priceInput;
    }

    if (primerInvalido) {
      if (elementos.formNote) elementos.formNote.textContent = "Revisa los campos marcados.";
      primerInvalido.focus();
      return false;
    }

    return true;
  }

  function setFormularioOcupado(ocupado, etiqueta) {
    if (elementos.formSubmit) {
      elementos.formSubmit.disabled = ocupado;
      elementos.formSubmit.textContent =
        etiqueta || (cabanaEnEdicion ? "Guardar cambios" : "Crear cabaña");
    }
    elementos.form?.setAttribute("aria-busy", String(ocupado));
  }

  async function guardarCabana(evento) {
    evento.preventDefault();
    if (guardandoCabana || !validarFormulario()) return;

    const datos = {
      nombre: elementos.nameInput.value.trim(),
      descripcion: elementos.descriptionInput.value.trim(),
      capacidad: Number(elementos.capacityInput.value),
      precio_noche: Number(elementos.priceInput.value),
      foto: elementos.photoSelect.value || "",
      es_recomendada: elementos.featuredInput.checked,
      servicios: Array.from(
        elementos.servicesWrap.querySelectorAll('input[name="servicios"]:checked'),
      ).map((input) => Number(input.value)),
    };

    const editando = Boolean(cabanaEnEdicion);
    const nombre = datos.nombre;

    guardandoCabana = true;
    setFormularioOcupado(true, editando ? "Guardando…" : "Creando…");

    try {
      if (editando) {
        await api.cabanas.actualizar(cabanaEnEdicion.id, datos);
      } else {
        await api.cabanas.crear(datos);
      }

      await cargarDatosPanel();
      ultimaActualizacion = new Date();
      actualizarTextoActualizacion();
      cerrarFormulario();
      renderTodo();
      mostrarToast(
        editando
          ? `«${nombre}» actualizada en la base de datos.`
          : `«${nombre}» creada y publicada con estado Disponible.`,
      );
    } catch (error) {
      if (error.estado === 409) {
        marcarError(elementos.nameInput, "cabin-name-error", error.message);
        elementos.nameInput?.focus();
      } else if (elementos.formNote) {
        elementos.formNote.textContent =
          error?.message || "No pudimos guardar la cabaña. Intenta de nuevo.";
      }
    } finally {
      guardandoCabana = false;
      setFormularioOcupado(false);
    }
  }

  function abrirEstadoCabana(cabana) {
    if (!cabana || !elementos.statusDialog) return;
    cabanaEnEstado = cabana;
    const activa = cabana.activa !== false;
    const ocupada = estadoDe(cabana) === "Ocupada";

    elementos.statusTitle.textContent = activa ? "Desactivar cabaña" : "Publicar cabaña";
    elementos.statusCopy.textContent = activa
      ? `«${cabana.nombre}» dejará de aparecer en la web pública. No se elimina: podrás publicarla de nuevo cuando quieras.`
      : `«${cabana.nombre}» volverá a aparecer en la web pública con sus datos actuales.`;
    elementos.statusNote.hidden = !(activa && ocupada);
    elementos.statusNote.textContent =
      activa && ocupada
        ? "Esta cabaña tiene una reserva en curso. La desactivación la oculta del catálogo, pero no cancela la reserva ni cambia su estado operativo."
        : "";
    elementos.statusConfirm.textContent = activa ? "Desactivar" : "Publicar";

    abrirDialogo(elementos.statusDialog);
    window.setTimeout(() => elementos.statusConfirm?.focus(), 60);
  }

  function cerrarEstadoCabana() {
    cerrarDialogo(elementos.statusDialog);
    cabanaEnEstado = null;
  }

  function setEstadoOcupado(ocupado) {
    if (!elementos.statusConfirm) return;
    elementos.statusConfirm.disabled = ocupado;
    elementos.statusConfirm.textContent = ocupado
      ? "Guardando…"
      : cabanaEnEstado?.activa !== false
        ? "Desactivar"
        : "Publicar";
  }

  async function confirmarEstadoCabana() {
    if (!cabanaEnEstado || elementos.statusConfirm?.disabled) return;

    const estabaActiva = cabanaEnEstado.activa !== false;
    const nombre = cabanaEnEstado.nombre;
    const id = cabanaEnEstado.id;

    setEstadoOcupado(true);

    try {
      await api.cabanas.publicar(id, !estabaActiva);
      await cargarDatosPanel();
      ultimaActualizacion = new Date();
      actualizarTextoActualizacion();
      cerrarEstadoCabana();
      renderTodo();
      mostrarToast(
        estabaActiva
          ? `«${nombre}» desactivada. Ya no aparece en la web pública.`
          : `«${nombre}» publicada de nuevo en la web pública.`,
      );
    } catch (error) {
      if (elementos.statusNote) {
        elementos.statusNote.hidden = false;
        elementos.statusNote.textContent =
          error?.message || "No pudimos cambiar la publicación. Intenta de nuevo.";
      }
    } finally {
      setEstadoOcupado(false);
    }
  }

  function cabanasBuscadas() {
    const termino = catalogoBusqueda.trim().toLocaleLowerCase("es");
    if (!termino) return cabanas.slice();
    return cabanas.filter((cabana) =>
      `${cabana.nombre} ${cabana.descripcion || ""}`
        .toLocaleLowerCase("es")
        .includes(termino),
    );
  }

  function plantillaCatalogo(cabana) {
    const activa = cabana.activa !== false;
    const imagen = cabana.imagen || contenido.imagenDeCabana(cabana);
    const servicios = (cabana.servicios || [])
      .map((servicio) => `<li>${escapar(servicio)}</li>`)
      .join("");
    const nombreVisible = cabana.nombre.replace(/^Cabaña\s+/i, "");

    return `
      <article class="cabin-row${activa ? "" : " is-inactive"}">
        <figure class="cabin-row__media">
          <img
            src="${escapar(imagen.src)}"
            srcset="${escapar(imagen.srcset || "")}"
            alt="${escapar(imagen.alt || `Cabaña ${nombreVisible}`)}"
            width="${imagen.width || 1400}"
            height="${imagen.height || 934}"
            loading="lazy"
            decoding="async"
          >
        </figure>

        <div class="cabin-row__identity">
          <div class="cabin-row__title">
            <h3>${escapar(nombreVisible)}</h3>
            ${cabana.recomendada ? '<span class="tag">Recomendada</span>' : ""}
          </div>
          <p>${escapar(cabana.descripcion || "Sin descripción registrada.")}</p>
          <span class="cabin-row__ref">Cab-${String(cabana.id).padStart(3, "0")} · ${escapar(estadoDe(cabana))}</span>
        </div>

        <dl class="cabin-row__meta">
          <div>
            <dt>Capacidad</dt>
            <dd>${cabana.capacidad} personas</dd>
          </div>
          <div>
            <dt>Tarifa / noche</dt>
            <dd>${escapar(formatearMoneda(cabana.precioNoche))}</dd>
          </div>
        </dl>

        <div class="cabin-row__services">
          <span class="cabin-row__label">Servicios incluidos</span>
          <ul>${servicios || "<li>Sin servicios asignados</li>"}</ul>
        </div>

        <div class="cabin-row__actions">
          <span class="publish ${activa ? "publish--active" : "publish--inactive"}">
            ${activa ? "Publicada" : "Desactivada"}
          </span>
          <div class="cabin-row__buttons">
            <button class="row-action" type="button" data-edit-cabin="${cabana.id}">
              <svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg>
              Editar
            </button>
            <button class="row-action${activa ? " row-action--muted" : ""}" type="button"
              data-toggle-cabin="${cabana.id}">
              <svg class="icon" aria-hidden="true"><use href="#icon-${activa ? "eye-off" : "eye"}"></use></svg>
              ${activa ? "Desactivar" : "Publicar"}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderCatalogo() {
    if (!elementos.catalogList) return;

    const base = cabanasBuscadas();
    const cuentas = {
      todas: base.length,
      publicadas: base.filter((cabana) => cabana.activa !== false).length,
      desactivadas: base.filter((cabana) => cabana.activa === false).length,
    };

    elementos.catalogCounts.forEach((contador) => {
      const clave = contador.dataset.catalogCount;
      contador.textContent = String(cuentas[clave] ?? 0);
    });

    if (elementos.summaryTotal) elementos.summaryTotal.textContent = String(cabanas.length);
    if (elementos.summaryActive) {
      elementos.summaryActive.textContent = String(
        cabanas.filter((cabana) => cabana.activa !== false).length,
      );
    }
    if (elementos.summaryInactive) {
      elementos.summaryInactive.textContent = String(
        cabanas.filter((cabana) => cabana.activa === false).length,
      );
    }
    if (elementos.summaryFeatured) {
      elementos.summaryFeatured.textContent = String(
        cabanas.filter((cabana) => cabana.recomendada).length,
      );
    }

    const visibles = base.filter((cabana) => {
      if (catalogoFiltro === "publicadas") return cabana.activa !== false;
      if (catalogoFiltro === "desactivadas") return cabana.activa === false;
      return true;
    });

    if (visibles.length === 0) {
      elementos.catalogList.innerHTML = `
        <div class="catalog-empty">
          <strong>Sin cabañas que coincidan</strong>
          <span>Prueba con otro nombre o cambia el filtro de publicación.</span>
          <button class="btn btn--outline" type="button" data-clear-catalog>
            Limpiar búsqueda y filtros
          </button>
        </div>`;
      return;
    }

    elementos.catalogList.innerHTML = visibles.map(plantillaCatalogo).join("");
  }

  /* ------------------------------------------------------------------------
     Navegación entre vistas
     ------------------------------------------------------------------------ */

  function mostrarVista(nombre, opciones = {}) {
    const { actualizarHash = true, enfocar = true } = opciones;

    if (nombre === "administracion" && !puedeAdministrar) {
      mostrarToast("Tu rol no tiene acceso al módulo de Administración.");
      return;
    }

    if (nombre === "reservas" && !puedeVerReservas) {
      mostrarToast("Tu rol no tiene acceso al módulo de Reservas.");
      return;
    }

    const vistas = {
      panel: elementos.viewPanel,
      reservas: elementos.viewReservas,
      administracion: elementos.viewAdmin,
    };
    const destino = Object.prototype.hasOwnProperty.call(vistas, nombre) ? nombre : "panel";

    Object.entries(vistas).forEach(([clave, vista]) => {
      if (vista) vista.hidden = clave !== destino;
    });

    const vistaVisible = vistas[destino];
    if (vistaVisible) {
      vistaVisible.classList.remove("is-entering");
      void vistaVisible.offsetWidth;
      vistaVisible.classList.add("is-entering");
    }

    elementos.navLinks.forEach((enlace) => {
      const activo = enlace.dataset.module === destino;
      enlace.classList.toggle("is-active", activo);
      if (activo) enlace.setAttribute("aria-current", "page");
      else enlace.removeAttribute("aria-current");
    });

    if (actualizarHash) {
      const hash = `#${destino}`;
      if (window.location.hash !== hash) {
        try {
          window.history.replaceState(null, "", hash);
        } catch (error) {
          window.location.hash = hash;
        }
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (enfocar) {
      const titulos = {
        panel: elementos.panelTitle,
        reservas: elementos.reservasTitle,
        administracion: elementos.catalogTitle,
      };
      window.setTimeout(() => titulos[destino]?.focus({ preventScroll: true }), 80);
    }
  }

  function iniciarCatalogo() {
    if (!elementos.catalogList) return;

    elementos.newCabinBtn?.addEventListener("click", () => abrirFormulario());

    elementos.form?.addEventListener("submit", guardarCabana);

    elementos.form?.addEventListener("input", (evento) => {
      const campo = evento.target.closest(".form-field");
      if (campo) {
        campo.classList.remove("has-error");
        const error = campo.querySelector(".form-error");
        if (error) error.textContent = "";
        evento.target.removeAttribute("aria-invalid");
      }
      if (elementos.formNote) elementos.formNote.textContent = "";
    });

    elementos.formDialog?.addEventListener("click", (evento) => {
      if (evento.target === elementos.formDialog || evento.target.closest("[data-close-cabin-form]")) {
        cerrarFormulario();
      }
    });

    elementos.formDialog?.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
      cabanaEnEdicion = null;
      restaurarFocoDialogo();
    });

    elementos.formDialog?.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarFormulario();
    });

    elementos.statusDialog?.addEventListener("click", (evento) => {
      if (evento.target === elementos.statusDialog || evento.target.closest("[data-close-cabin-status]")) {
        cerrarEstadoCabana();
      }
    });

    elementos.statusDialog?.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
      cabanaEnEstado = null;
      restaurarFocoDialogo();
    });

    elementos.statusDialog?.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarEstadoCabana();
    });

    elementos.statusConfirm?.addEventListener("click", confirmarEstadoCabana);

    elementos.catalogSearch?.addEventListener("input", () => {
      catalogoBusqueda = elementos.catalogSearch.value;
      renderCatalogo();
    });

    elementos.catalogFilters.forEach((boton) => {
      boton.addEventListener("click", () => {
        catalogoFiltro = boton.dataset.catalogFilter;
        elementos.catalogFilters.forEach((otro) => {
          const activo = otro === boton;
          otro.classList.toggle("is-active", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });
        renderCatalogo();
      });
    });

    elementos.catalogList.addEventListener("click", (evento) => {
      const editar = evento.target.closest("[data-edit-cabin]");
      if (editar) {
        abrirFormulario(cabanaPorId(Number(editar.dataset.editCabin)));
        return;
      }

      const alternar = evento.target.closest("[data-toggle-cabin]");
      if (alternar) {
        abrirEstadoCabana(cabanaPorId(Number(alternar.dataset.toggleCabin)));
        return;
      }

      if (evento.target.closest("[data-clear-catalog]")) {
        catalogoBusqueda = "";
        catalogoFiltro = "todas";
        if (elementos.catalogSearch) elementos.catalogSearch.value = "";
        elementos.catalogFilters.forEach((boton) => {
          const activo = boton.dataset.catalogFilter === "todas";
          boton.classList.toggle("is-active", activo);
          boton.setAttribute("aria-pressed", String(activo));
        });
        renderCatalogo();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Reservas
     ------------------------------------------------------------------------ */

  function modoClienteReserva() {
    return elementos.reservationClientMode.find((radio) => radio.checked)?.value || "existente";
  }

  function actualizarModoClienteReserva() {
    const modo = modoClienteReserva();
    const existente = modo === "existente";

    if (elementos.reservationClientExisting) elementos.reservationClientExisting.hidden = !existente;
    if (elementos.reservationClientNew) elementos.reservationClientNew.hidden = existente;

    if (existente) {
      window.setTimeout(() => elementos.reservationClientSearch?.focus(), 40);
    } else {
      window.setTimeout(() => elementos.reservationNewDoc?.focus(), 40);
    }
  }

  function limpiarErroresReserva() {
    [
      [elementos.reservationClient, "reservation-client-error"],
      [elementos.reservationNewDoc, "reservation-new-doc-error"],
      [elementos.reservationNewName, "reservation-new-name-error"],
      [elementos.reservationNewLastname, "reservation-new-lastname-error"],
      [elementos.reservationNewPhone, "reservation-new-phone-error"],
      [elementos.reservationNewEmail, "reservation-new-email-error"],
      [elementos.reservationCabin, "reservation-cabin-error"],
      [elementos.reservationCheckin, "reservation-checkin-error"],
      [elementos.reservationCheckout, "reservation-checkout-error"],
      [elementos.reservationGuests, "reservation-guests-error"],
    ].forEach(([input, idError]) => marcarError(input, idError, ""));

    if (elementos.reservationFormNote) elementos.reservationFormNote.textContent = "";
  }

  function etiquetaCliente(cliente) {
    const nombre = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
    const documento = `${cliente.tipo_documento || ""} ${cliente.numero_documento || ""}`.trim();
    return [nombre || "Cliente sin nombre", documento, cliente.telefono]
      .filter(Boolean)
      .join(" · ");
  }

  function poblarClientesReserva(filtro = "") {
    if (!elementos.reservationClient) return;

    const busqueda = normalizarBusqueda(filtro);
    const lista = busqueda
      ? clientes.filter((cliente) =>
          normalizarBusqueda(
            [
              cliente.nombre,
              cliente.apellido,
              cliente.tipo_documento,
              cliente.numero_documento,
              cliente.telefono,
              cliente.correo,
            ].join(" "),
          ).includes(busqueda),
        )
      : clientes;

    if (lista.length === 0) {
      elementos.reservationClient.innerHTML = `<option value="">${
        clientes.length ? "Sin clientes que coincidan" : "No hay clientes registrados"
      }</option>`;
      elementos.reservationClient.disabled = clientes.length === 0;
      return;
    }

    elementos.reservationClient.disabled = false;
    elementos.reservationClient.innerHTML = lista
      .map(
        (cliente) =>
          `<option value="${Number(cliente.id_cliente)}">${escapar(etiquetaCliente(cliente))}</option>`,
      )
      .join("");
    elementos.reservationClient.value = String(lista[0].id_cliente);
  }

  function poblarCabanasReserva() {
    if (!elementos.reservationCabin) return;

    const activas = cabanas
      .filter((cabana) => cabana.activa)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    if (activas.length === 0) {
      elementos.reservationCabin.innerHTML =
        '<option value="">No hay cabañas activas para reservar</option>';
      elementos.reservationCabin.disabled = true;
      return;
    }

    elementos.reservationCabin.disabled = false;
    elementos.reservationCabin.innerHTML = activas
      .map(
        (cabana) =>
          `<option value="${cabana.id}">${escapar(cabana.nombre)} · ${cabana.capacidad} personas · ${escapar(
            formatearMoneda(cabana.precioNoche),
          )} / noche</option>`,
      )
      .join("");
  }

  function cabanaSeleccionadaReserva() {
    return cabanaPorId(Number(elementos.reservationCabin?.value));
  }

  function nochesFormularioReserva() {
    const entrada = elementos.reservationCheckin?.value;
    const salida = elementos.reservationCheckout?.value;
    if (!entrada || !salida) return 0;

    const inicio = new Date(`${entrada}T12:00:00`);
    const fin = new Date(`${salida}T12:00:00`);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return 0;

    const dias = Math.round((fin - inicio) / 86400000);
    return dias > 0 ? dias : 0;
  }

  function actualizarEstimacionReserva() {
    const cabana = cabanaSeleccionadaReserva();
    const noches = nochesFormularioReserva();

    if (!cabana) {
      if (elementos.reservationRate) elementos.reservationRate.textContent = "—";
      if (elementos.reservationNights) elementos.reservationNights.textContent = "0";
      if (elementos.reservationTotal) elementos.reservationTotal.textContent = "—";
      if (elementos.reservationCabinHint) {
        elementos.reservationCabinHint.textContent = elementos.reservationCabin?.disabled
          ? "No hay cabañas activas. Publica una cabaña en Administración."
          : "Selecciona una cabaña activa del catálogo.";
      }
      return;
    }

    if (elementos.reservationCabinHint) {
      elementos.reservationCabinHint.textContent = `Capacidad para ${cabana.capacidad} personas · ${formatearMoneda(
        cabana.precioNoche,
      )} por noche.`;
    }
    if (elementos.reservationRate) {
      elementos.reservationRate.textContent = formatearMoneda(cabana.precioNoche);
    }
    if (elementos.reservationNights) {
      elementos.reservationNights.textContent = String(noches);
    }
    if (elementos.reservationTotal) {
      elementos.reservationTotal.textContent =
        noches > 0 ? formatearMoneda(cabana.precioNoche * noches) : "—";
    }

    if (elementos.reservationGuests) {
      elementos.reservationGuests.max = String(Math.max(1, cabana.capacidad));
      const actuales = Number(elementos.reservationGuests.value);
      if (!actuales || actuales > cabana.capacidad) {
        elementos.reservationGuests.value = String(Math.min(Math.max(1, actuales || 1), cabana.capacidad));
      }
    }
  }

  function setNotaDisponibilidad(mensaje, tipo = "") {
    if (!elementos.reservationAvailability) return;
    elementos.reservationAvailability.textContent = mensaje;
    elementos.reservationAvailability.classList.toggle("is-ok", tipo === "ok");
    elementos.reservationAvailability.classList.toggle("is-error", tipo === "error");
    elementos.reservationAvailability.classList.toggle("is-loading", tipo === "loading");
  }

  async function consultarDisponibilidadReserva() {
    const cabana = cabanaSeleccionadaReserva();
    const entrada = elementos.reservationCheckin?.value || "";
    const salida = elementos.reservationCheckout?.value || "";
    const personas = Number(elementos.reservationGuests?.value);

    disponibilidadActual = null;

    if (!cabana) {
      setNotaDisponibilidad("Selecciona una cabaña para consultar la disponibilidad.");
      return;
    }
    if (!entrada || !salida || salida <= entrada) {
      setNotaDisponibilidad("Elige una entrada y una salida posterior para consultar la disponibilidad.");
      return;
    }
    if (!Number.isInteger(personas) || personas < 1) {
      setNotaDisponibilidad("Indica cuántos huéspedes se van a alojar.");
      return;
    }
    if (personas > cabana.capacidad) {
      setNotaDisponibilidad(`Esta cabaña admite máximo ${cabana.capacidad} personas.`, "error");
      return;
    }

    const solicitud = ++disponibilidadSolicitud;
    setNotaDisponibilidad("Consultando disponibilidad…", "loading");

    try {
      const libres = await api.cabanas.disponibilidad({
        fechaInicio: entrada,
        fechaFin: salida,
        personas,
      });

      if (solicitud !== disponibilidadSolicitud) return;

      const disponible = (libres || []).some(
        (item) => Number(item.id_cabana) === Number(cabana.id),
      );
      disponibilidadActual = disponible;

      setNotaDisponibilidad(
        disponible
          ? `${cabana.nombre} está disponible para ${personas} ${
              personas === 1 ? "huésped" : "huéspedes"
            } entre el ${fecha(entrada)} y el ${fecha(salida)}.`
          : `${cabana.nombre} no está disponible para esas fechas o no admite ${personas} ${
              personas === 1 ? "huésped" : "huéspedes"
            }.`,
        disponible ? "ok" : "error",
      );
    } catch (error) {
      if (solicitud !== disponibilidadSolicitud) return;
      disponibilidadActual = null;
      setNotaDisponibilidad(
        error?.message || "No pudimos consultar la disponibilidad en este momento.",
        "error",
      );
    }
  }

  function programarDisponibilidadReserva() {
    window.clearTimeout(disponibilidadTimer);
    disponibilidadActual = null;
    actualizarEstimacionReserva();
    disponibilidadTimer = window.setTimeout(consultarDisponibilidadReserva, 380);
  }

  async function abrirFormularioReserva() {
    if (!elementos.reservationFormDialog || !elementos.reservationForm) return;

    limpiarErroresReserva();
    elementos.reservationForm.reset();
    elementos.reservationClientMode.forEach((radio) => {
      radio.checked = radio.value === "existente";
    });

    const hoy = new Date();
    if (elementos.reservationCheckin) elementos.reservationCheckin.value = fechaISO(hoy);
    hoy.setDate(hoy.getDate() + 1);
    if (elementos.reservationCheckout) {
      elementos.reservationCheckout.value = fechaISO(hoy);
      elementos.reservationCheckout.min = fechaISO(hoy);
    }
    if (elementos.reservationGuests) {
      elementos.reservationGuests.value = "1";
      elementos.reservationGuests.max = "99";
    }
    if (elementos.reservationClientSearch) elementos.reservationClientSearch.value = "";

    if (!clientes.length) {
      try {
        clientes = (await api.clientes.listar()) || [];
      } catch (error) {
        // Si falla el listado, el formulario permite registrar un cliente nuevo.
      }
    }

    poblarClientesReserva();
    poblarCabanasReserva();
    actualizarModoClienteReserva();
    actualizarEstimacionReserva();
    setNotaDisponibilidad(
      elementos.reservationCabin?.disabled
        ? "No hay cabañas activas. Publica una cabaña en Administración para poder reservar."
        : "Elige cabaña y fechas para consultar la disponibilidad.",
    );

    if (!elementos.reservationCabin?.disabled) programarDisponibilidadReserva();

    abrirDialogo(elementos.reservationFormDialog);
    window.setTimeout(() => {
      if (modoClienteReserva() === "existente") elementos.reservationClientSearch?.focus();
      else elementos.reservationNewDoc?.focus();
    }, 60);
  }

  function cerrarFormularioReserva() {
    window.clearTimeout(disponibilidadTimer);
    disponibilidadSolicitud += 1;
    disponibilidadActual = null;
    cerrarDialogo(elementos.reservationFormDialog);
  }

  function validarFormularioReserva() {
    limpiarErroresReserva();

    let primerInvalido = null;
    const fallar = (input, idError, mensaje) => {
      marcarError(input, idError, mensaje);
      if (!primerInvalido) primerInvalido = input;
    };

    const modo = modoClienteReserva();
    let idCliente = 0;

    if (modo === "existente") {
      idCliente = Number(elementos.reservationClient?.value);
      if (!idCliente) {
        fallar(
          elementos.reservationClient,
          "reservation-client-error",
          "Selecciona un cliente o registra uno nuevo.",
        );
      }
    } else {
      const documento = elementos.reservationNewDoc?.value.trim() || "";
      const nombre = elementos.reservationNewName?.value.trim() || "";
      const apellido = elementos.reservationNewLastname?.value.trim() || "";
      const telefono = elementos.reservationNewPhone?.value.trim() || "";
      const correo = elementos.reservationNewEmail?.value.trim() || "";

      if (!documento) {
        fallar(elementos.reservationNewDoc, "reservation-new-doc-error", "Escribe el número de documento.");
      }
      if (!nombre) {
        fallar(elementos.reservationNewName, "reservation-new-name-error", "Escribe el nombre.");
      }
      if (!apellido) {
        fallar(
          elementos.reservationNewLastname,
          "reservation-new-lastname-error",
          "Escribe el apellido.",
        );
      }
      if (!telefono) {
        fallar(
          elementos.reservationNewPhone,
          "reservation-new-phone-error",
          "Escribe un teléfono de contacto.",
        );
      }
      if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        fallar(
          elementos.reservationNewEmail,
          "reservation-new-email-error",
          "Revisa el formato del correo.",
        );
      }
    }

    const cabana = cabanaSeleccionadaReserva();
    if (!cabana) {
      fallar(elementos.reservationCabin, "reservation-cabin-error", "Selecciona una cabaña activa.");
    }

    const entrada = elementos.reservationCheckin?.value || "";
    const salida = elementos.reservationCheckout?.value || "";
    const personas = Number(elementos.reservationGuests?.value);

    if (!entrada) {
      fallar(elementos.reservationCheckin, "reservation-checkin-error", "Indica la fecha de entrada.");
    }
    if (!salida) {
      fallar(elementos.reservationCheckout, "reservation-checkout-error", "Indica la fecha de salida.");
    } else if (entrada && salida <= entrada) {
      fallar(
        elementos.reservationCheckout,
        "reservation-checkout-error",
        "La salida debe ser posterior a la entrada.",
      );
    }

    if (!Number.isInteger(personas) || personas < 1) {
      fallar(elementos.reservationGuests, "reservation-guests-error", "Indica al menos un huésped.");
    } else if (cabana && personas > cabana.capacidad) {
      fallar(
        elementos.reservationGuests,
        "reservation-guests-error",
        `Esta cabaña admite máximo ${cabana.capacidad} personas.`,
      );
    }

    if (primerInvalido) {
      primerInvalido.focus();
      return null;
    }

    return {
      modo,
      idCliente,
      cabana,
      entrada,
      salida,
      personas,
      clienteNuevo:
        modo === "nuevo"
          ? {
              tipo_documento: elementos.reservationNewDocType?.value || "CC",
              numero_documento: elementos.reservationNewDoc.value.trim(),
              nombre: elementos.reservationNewName.value.trim(),
              apellido: elementos.reservationNewLastname.value.trim(),
              telefono: elementos.reservationNewPhone.value.trim(),
              correo: elementos.reservationNewEmail.value.trim() || null,
            }
          : null,
    };
  }

  function setReservaOcupada(ocupado) {
    if (!elementos.reservationFormSubmit) return;
    elementos.reservationFormSubmit.disabled = ocupado;
    elementos.reservationFormSubmit.textContent = ocupado ? "Guardando…" : "Confirmar reserva";
    elementos.reservationForm?.setAttribute("aria-busy", String(ocupado));
  }

  async function guardarReserva(evento) {
    evento.preventDefault();
    if (guardandoReserva) return;

    const valido = validarFormularioReserva();
    if (!valido) return;

    if (disponibilidadActual === false) {
      if (elementos.reservationFormNote) {
        elementos.reservationFormNote.textContent =
          "La cabaña no está disponible para esas fechas. Elige otras fechas o cambia de cabaña.";
      }
      return;
    }

    guardandoReserva = true;
    setReservaOcupada(true);
    let clienteCreado = 0;

    try {
      let idCliente = valido.idCliente;

      if (valido.modo === "nuevo") {
        const respuestaCliente = await api.clientes.crear(valido.clienteNuevo);
        idCliente = Number(respuestaCliente.id_cliente);
        clienteCreado = idCliente;
      }

      const respuesta = await api.reservas.crear({
        id_cliente: idCliente,
        id_cabana: valido.cabana.id,
        fecha_entrada: valido.entrada,
        fecha_salida: valido.salida,
        num_personas: valido.personas,
        observaciones: elementos.reservationObservations?.value.trim() || null,
      });

      cerrarFormularioReserva();
      mostrarToast(
        `Reserva #${String(respuesta.id_reserva).padStart(5, "0")} registrada y confirmada.`,
      );
      await cargarPanel();
      mostrarVista("reservas");

      if (clienteCreado) {
        try {
          clientes = (await api.clientes.listar()) || [];
        } catch (error) {
          // El listado se actualizará en la próxima carga del panel.
        }
      }
    } catch (error) {
      if (clienteCreado) {
        try {
          clientes = (await api.clientes.listar()) || [];
          elementos.reservationClientMode.forEach((radio) => {
            radio.checked = radio.value === "existente";
          });
          actualizarModoClienteReserva();
          poblarClientesReserva();
          elementos.reservationClient.value = String(clienteCreado);
        } catch (fallo) {
          // Mantiene el formulario abierto con el mensaje original.
        }
      }

      if (elementos.reservationFormNote) {
        elementos.reservationFormNote.textContent = clienteCreado
          ? `El cliente quedó registrado. La reserva no se pudo crear: ${error?.message || "intenta de nuevo."}`
          : error?.message || "No pudimos registrar la reserva. Intenta de nuevo.";
      }
    } finally {
      guardandoReserva = false;
      setReservaOcupada(false);
    }
  }

  function abrirAccionReserva(idReserva, tipo) {
    const reserva = reservas.find((item) => Number(item.id_reserva) === Number(idReserva));
    if (!reserva || !elementos.reservationActionDialog) return;

    reservaEnAccion = reserva;
    accionReserva = tipo;

    const cliente = nombreCliente(reserva) || "el cliente";
    const referencia = `#${String(reserva.id_reserva).padStart(5, "0")}`;
    const cabana = reserva.cabana || cabanaPorId(reserva.id_cabana)?.nombre || "la cabaña";

    const textos = {
      cancelar: {
        titulo: `Cancelar reserva ${referencia}`,
        copia: `La reserva de ${cliente} en ${cabana} quedará Cancelada. Esta acción no se puede deshacer.`,
        boton: "Cancelar reserva",
      },
      checkin: {
        titulo: `Registrar check-in ${referencia}`,
        copia: `Vas a registrar la entrada de ${cliente} en ${cabana}. La cabaña debe estar Disponible; después quedará Ocupada.`,
        boton: "Registrar check-in",
      },
      checkout: {
        titulo: `Registrar check-out ${referencia}`,
        copia: `Vas a registrar la salida de ${cliente} de ${cabana}. La reserva quedará Finalizada y la cabaña pasará a En Limpieza.`,
        boton: "Registrar check-out",
      },
    };

    const texto = textos[tipo];
    if (!texto) return;

    if (elementos.reservationActionTitle) elementos.reservationActionTitle.textContent = texto.titulo;
    if (elementos.reservationActionCopy) elementos.reservationActionCopy.textContent = texto.copia;
    if (elementos.reservationActionConfirm) {
      elementos.reservationActionConfirm.textContent = texto.boton;
      elementos.reservationActionConfirm.disabled = false;
    }
    if (elementos.reservationActionNote) elementos.reservationActionNote.textContent = "";
    if (elementos.reservationReasonField) elementos.reservationReasonField.hidden = tipo !== "cancelar";
    if (elementos.reservationReason) elementos.reservationReason.value = "";

    abrirDialogo(elementos.reservationActionDialog);
    window.setTimeout(() => elementos.reservationActionConfirm?.focus(), 60);
  }

  function cerrarAccionReserva() {
    cerrarDialogo(elementos.reservationActionDialog);
    reservaEnAccion = null;
    accionReserva = "";
  }

  async function confirmarAccionReserva() {
    if (!reservaEnAccion || !accionReserva || ejecutandoAccionReserva) return;

    const tipo = accionReserva;
    ejecutandoAccionReserva = true;
    if (elementos.reservationActionConfirm) {
      elementos.reservationActionConfirm.disabled = true;
      elementos.reservationActionConfirm.textContent = "Procesando…";
    }
    if (elementos.reservationActionNote) elementos.reservationActionNote.textContent = "";

    try {
      const id = reservaEnAccion.id_reserva;
      let respuesta;

      if (tipo === "cancelar") {
        respuesta = await api.reservas.cancelar(id, elementos.reservationReason?.value.trim() || "");
      } else if (tipo === "checkin") {
        respuesta = await api.reservas.checkin(id);
      } else {
        respuesta = await api.reservas.checkout(id);
      }

      cerrarAccionReserva();
      mostrarToast(respuesta?.mensaje || "Reserva actualizada.");
      await cargarPanel();
      mostrarVista("reservas");
    } catch (error) {
      if (elementos.reservationActionNote) {
        elementos.reservationActionNote.textContent =
          error?.message || "No pudimos completar la acción. Intenta de nuevo.";
      }
    } finally {
      ejecutandoAccionReserva = false;
      if (elementos.reservationActionConfirm) {
        elementos.reservationActionConfirm.disabled = false;
        elementos.reservationActionConfirm.textContent =
          tipo === "cancelar"
            ? "Cancelar reserva"
            : tipo === "checkin"
              ? "Registrar check-in"
              : "Registrar check-out";
      }
    }
  }

  function abrirAccionSolicitud(idSolicitud, tipo) {
    const solicitud = solicitudes.find(
      (item) => Number(item.id_solicitud) === Number(idSolicitud),
    );
    if (!solicitud || !elementos.requestActionDialog) return;

    const textos = {
      aprobar: {
        titulo: `Aprobar solicitud S-${String(solicitud.id_solicitud).padStart(5, "0")}`,
        boton: "Aprobar y crear reserva",
      },
      rechazar: {
        titulo: `Rechazar solicitud S-${String(solicitud.id_solicitud).padStart(5, "0")}`,
        boton: "Rechazar solicitud",
      },
    };

    const texto = textos[tipo];
    if (!texto) return;

    solicitudEnAccion = solicitud;
    accionSolicitud = tipo;

    const cliente = `${solicitud.nombre || ""} ${solicitud.apellido || ""}`.trim() || "el huésped";
    const cabana = solicitud.cabana || cabanaPorId(solicitud.id_cabana)?.nombre || "la cabaña";
    const rango = `${fecha(solicitud.fecha_entrada)} al ${fecha(solicitud.fecha_salida)}`;

    const copia =
      tipo === "aprobar"
        ? `Se creará una reserva Confirmada para ${cliente} en ${cabana}, del ${rango}, para ${
            Number(solicitud.num_personas) || 0
          } ${Number(solicitud.num_personas) === 1 ? "huésped" : "huéspedes"}. La base de datos validará otra vez el cruce de fechas y la capacidad, y copiará la tarifa vigente.`
        : `La solicitud de ${cliente} para ${cabana}, del ${rango}, quedará Rechazada. No se creará ninguna reserva y las fechas seguirán libres.`;

    if (elementos.requestActionTitle) elementos.requestActionTitle.textContent = texto.titulo;
    if (elementos.requestActionCopy) elementos.requestActionCopy.textContent = copia;
    if (elementos.requestActionConfirm) {
      elementos.requestActionConfirm.textContent = texto.boton;
      elementos.requestActionConfirm.disabled = false;
    }
    if (elementos.requestActionNote) elementos.requestActionNote.textContent = "";
    if (elementos.requestReasonField) elementos.requestReasonField.hidden = tipo !== "rechazar";
    if (elementos.requestReason) elementos.requestReason.value = "";

    abrirDialogo(elementos.requestActionDialog);
    window.setTimeout(() => {
      if (tipo === "rechazar") elementos.requestReason?.focus();
      else elementos.requestActionConfirm?.focus();
    }, 60);
  }

  function cerrarAccionSolicitud() {
    cerrarDialogo(elementos.requestActionDialog);
    solicitudEnAccion = null;
    accionSolicitud = "";
  }

  async function confirmarAccionSolicitud() {
    if (!solicitudEnAccion || !accionSolicitud || ejecutandoAccionSolicitud) return;

    const tipo = accionSolicitud;
    ejecutandoAccionSolicitud = true;
    if (elementos.requestActionConfirm) {
      elementos.requestActionConfirm.disabled = true;
      elementos.requestActionConfirm.textContent = "Procesando…";
    }
    if (elementos.requestActionNote) elementos.requestActionNote.textContent = "";

    try {
      const id = solicitudEnAccion.id_solicitud;
      const respuesta =
        tipo === "aprobar"
          ? await api.solicitudes.aprobar(id)
          : await api.solicitudes.rechazar(id, elementos.requestReason?.value.trim() || "");

      cerrarAccionSolicitud();
      mostrarToast(respuesta?.mensaje || "Solicitud actualizada.");
      await cargarPanel();
      mostrarVista("reservas");
    } catch (error) {
      if (elementos.requestActionNote) {
        elementos.requestActionNote.textContent =
          error?.message || "No pudimos completar la acción. Intenta de nuevo.";
      }
    } finally {
      ejecutandoAccionSolicitud = false;
      if (elementos.requestActionConfirm) {
        elementos.requestActionConfirm.disabled = false;
        elementos.requestActionConfirm.textContent =
          tipo === "aprobar" ? "Aprobar y crear reserva" : "Rechazar solicitud";
      }
    }
  }

  function iniciarReservas() {
    elementos.newReservationBtn?.addEventListener("click", () => {
      abrirFormularioReserva().catch((error) => {
        mostrarToast(error?.message || "No pudimos abrir el formulario de reserva.");
      });
    });

    elementos.reservationForm?.addEventListener("submit", guardarReserva);

    elementos.reservationForm?.addEventListener("input", (evento) => {
      const campo = evento.target.closest(".form-field");
      if (campo) {
        campo.classList.remove("has-error");
        const error = campo.querySelector(".form-error");
        if (error) error.textContent = "";
        evento.target.removeAttribute("aria-invalid");
      }
      if (elementos.reservationFormNote) elementos.reservationFormNote.textContent = "";
    });

    elementos.reservationClientMode.forEach((radio) => {
      radio.addEventListener("change", actualizarModoClienteReserva);
    });

    elementos.reservationClientSearch?.addEventListener("input", () => {
      poblarClientesReserva(elementos.reservationClientSearch.value);
    });

    elementos.reservationCabin?.addEventListener("change", programarDisponibilidadReserva);
    elementos.reservationGuests?.addEventListener("input", programarDisponibilidadReserva);

    elementos.reservationCheckin?.addEventListener("change", () => {
      const salidaMinima = sumarDias(elementos.reservationCheckin.value, 1);
      if (elementos.reservationCheckout) {
        elementos.reservationCheckout.min = salidaMinima;
        if (
          !elementos.reservationCheckout.value ||
          elementos.reservationCheckout.value <= elementos.reservationCheckin.value
        ) {
          elementos.reservationCheckout.value = salidaMinima;
        }
      }
      programarDisponibilidadReserva();
    });

    elementos.reservationCheckout?.addEventListener("change", programarDisponibilidadReserva);
    elementos.reservationObservations?.addEventListener("input", actualizarEstimacionReserva);

    elementos.reservationFormDialog?.addEventListener("click", (evento) => {
      if (
        evento.target === elementos.reservationFormDialog ||
        evento.target.closest("[data-close-reservation-form]")
      ) {
        cerrarFormularioReserva();
      }
    });

    elementos.reservationFormDialog?.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
      restaurarFocoDialogo();
    });

    elementos.reservationFormDialog?.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarFormularioReserva();
    });

    elementos.reservationActionDialog?.addEventListener("click", (evento) => {
      if (
        evento.target === elementos.reservationActionDialog ||
        evento.target.closest("[data-close-reservation-action]")
      ) {
        cerrarAccionReserva();
      }
    });

    elementos.reservationActionDialog?.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
      restaurarFocoDialogo();
    });

    elementos.reservationActionDialog?.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarAccionReserva();
    });

    elementos.reservationActionConfirm?.addEventListener("click", confirmarAccionReserva);

    elementos.requestActionDialog?.addEventListener("click", (evento) => {
      if (
        evento.target === elementos.requestActionDialog ||
        evento.target.closest("[data-close-request-action]")
      ) {
        cerrarAccionSolicitud();
      }
    });

    elementos.requestActionDialog?.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
      restaurarFocoDialogo();
    });

    elementos.requestActionDialog?.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarAccionSolicitud();
    });

    elementos.requestActionConfirm?.addEventListener("click", confirmarAccionSolicitud);

    elementos.requestFilters.forEach((boton) => {
      boton.addEventListener("click", () => {
        solicitudFiltro = boton.dataset.requestFilter || "todas";
        elementos.requestFilters.forEach((otro) => {
          const activo = otro === boton;
          otro.classList.toggle("is-active", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });
        renderSolicitudes();
      });
    });

    elementos.requestsList?.addEventListener("click", (evento) => {
      const accion = evento.target.closest("[data-request-action]");
      if (accion) {
        abrirAccionSolicitud(Number(accion.dataset.requestId), accion.dataset.requestAction);
        return;
      }

      if (evento.target.closest("[data-clear-requests]")) {
        solicitudFiltro = "todas";
        elementos.requestFilters.forEach((boton) => {
          const activo = boton.dataset.requestFilter === "todas";
          boton.classList.toggle("is-active", activo);
          boton.setAttribute("aria-pressed", String(activo));
        });
        renderSolicitudes();
      }
    });

    elementos.reservationsSearch?.addEventListener("input", () => {
      reservaBusqueda = elementos.reservationsSearch.value;
      renderReservas();
    });

    elementos.reservationFilters.forEach((boton) => {
      boton.addEventListener("click", () => {
        reservaFiltro = boton.dataset.reservationFilter || "todas";
        elementos.reservationFilters.forEach((otro) => {
          const activo = otro === boton;
          otro.classList.toggle("is-active", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });
        renderReservas();
      });
    });

    elementos.reservationsList?.addEventListener("click", (evento) => {
      const accion = evento.target.closest("[data-res-action]");
      if (accion) {
        abrirAccionReserva(Number(accion.dataset.resId), accion.dataset.resAction);
        return;
      }

      if (evento.target.closest("[data-new-reservation]")) {
        abrirFormularioReserva().catch((error) => {
          mostrarToast(error?.message || "No pudimos abrir el formulario de reserva.");
        });
        return;
      }

      if (evento.target.closest("[data-clear-reservations]")) {
        reservaBusqueda = "";
        reservaFiltro = "todas";
        if (elementos.reservationsSearch) elementos.reservationsSearch.value = "";
        elementos.reservationFilters.forEach((boton) => {
          const activo = boton.dataset.reservationFilter === "todas";
          boton.classList.toggle("is-active", activo);
          boton.setAttribute("aria-pressed", String(activo));
        });
        renderReservas();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Eventos del panel
     ------------------------------------------------------------------------ */

  function iniciarFiltros() {
    elementos.filters.forEach((boton) => {
      boton.addEventListener("click", () => {
        filtroActivo = boton.dataset.filter;
        elementos.filters.forEach((otro) => {
          const activo = otro === boton;
          otro.classList.toggle("is-active", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });
        renderCabanas();
      });
    });
  }

  function iniciarDetalle() {
    if (!elementos.cabins) return;

    elementos.cabins.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-cabin-id]");
      if (!boton) return;
      abrirDetalle(cabanaPorId(Number(boton.dataset.cabinId)));
    });

    if (!elementos.dialog) return;

    elementos.dialog.addEventListener("click", (evento) => {
      if (evento.target === elementos.dialog || evento.target.closest("[data-close-detail]")) {
        cerrarDetalle();
      }
    });

    elementos.dialog.addEventListener("close", () => {
      sincronizarBloqueoDialogos();
    });

    elementos.dialog.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarDetalle();
    });
  }

  function iniciarActualizacion() {
    if (!elementos.refresh) return;

    actualizarTextoActualizacion();

    elementos.refresh.addEventListener("click", () => {
      refrescarPanel();
    });

    window.setInterval(actualizarTextoActualizacion, 60000);
  }

  function iniciarMenu() {
    if (!elementos.sidebarToggle) return;

    elementos.sidebarToggle.addEventListener("click", () => {
      if (menuAbierto()) cerrarMenu();
      else abrirMenu();
    });

    elementos.sidebarClose?.addEventListener("click", () => cerrarMenu());

    elementos.sidebarBackdrop?.addEventListener("click", () => cerrarMenu());

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && menuAbierto()) cerrarMenu();
    });

    window.matchMedia("(min-width: 1025px)").addEventListener("change", (evento) => {
      if (evento.matches && menuAbierto()) cerrarMenu({ restaurarFoco: false });
    });
  }

  function menuAbierto() {
    return Boolean(elementos.sidebar?.classList.contains("is-open"));
  }

  function abrirMenu() {
    if (!elementos.sidebar) return;
    elementoConFoco = document.activeElement;
    elementos.sidebar.classList.add("is-open");
    elementos.sidebarBackdrop?.classList.add("is-visible");
    document.body.classList.add("is-locked");
    elementos.sidebarToggle?.setAttribute("aria-expanded", "true");
    elementos.sidebarClose?.focus();
  }

  function cerrarMenu({ restaurarFoco = true } = {}) {
    if (!elementos.sidebar) return;
    elementos.sidebar.classList.remove("is-open");
    elementos.sidebarBackdrop?.classList.remove("is-visible");
    document.body.classList.remove("is-locked");
    elementos.sidebarToggle?.setAttribute("aria-expanded", "false");
    if (restaurarFoco && elementoConFoco instanceof HTMLElement) {
      elementoConFoco.focus();
    }
  }

  function resolverVistaHash() {
    const hash = window.location.hash;

    if (hash === "#reservas") {
      if (puedeVerReservas) return { vista: "reservas", denegada: "" };
      return { vista: "panel", denegada: "Reservas" };
    }

    if (hash === "#administracion") {
      if (puedeAdministrar) return { vista: "administracion", denegada: "" };
      return { vista: "panel", denegada: "Administración" };
    }

    return { vista: "panel", denegada: "" };
  }

  function volverHashPanel() {
    try {
      window.history.replaceState(null, "", "#panel");
    } catch (error) {
      window.location.hash = "#panel";
    }
  }

  function iniciarNavegacion() {
    elementos.navLinks.forEach((enlace) => {
      enlace.addEventListener("click", (evento) => {
        const modulo = enlace.dataset.module;
        if (["panel", "reservas", "administracion"].includes(modulo)) {
          if (evento.metaKey || evento.ctrlKey) return;
          evento.preventDefault();
          mostrarVista(modulo);
          if (menuAbierto()) cerrarMenu({ restaurarFoco: false });
          return;
        }

        evento.preventDefault();
        const nombre = enlace.querySelector("span")?.textContent || "Este módulo";
        mostrarToast(`${nombre}: módulo en preparación para la siguiente etapa.`);
        if (menuAbierto()) cerrarMenu({ restaurarFoco: false });
      });
    });

    window.addEventListener("hashchange", () => {
      const { vista, denegada } = resolverVistaHash();
      if (denegada) {
        mostrarToast(`Tu rol no tiene acceso al módulo de ${denegada}.`);
        volverHashPanel();
      }
      mostrarVista(vista, { actualizarHash: false });
    });
  }

  /* ------------------------------------------------------------------------
     Carga de datos
     ------------------------------------------------------------------------ */

  async function cargarDatosPanel() {
    const [lista, catalogo] = await Promise.all([api.cabanas.listar(), api.cabanas.servicios()]);

    cabanas = (lista || []).map(adaptarCabana);
    serviciosCatalogo = catalogo || [];
    reservas = [];
    solicitudes = [];
    clientes = [];

    if (puedeVerReservas) {
      try {
        reservas = ((await api.reservas.listar()) || []).map(adaptarReserva);
      } catch (error) {
        if (![401, 403].includes(error.estado)) throw error;
      }

      try {
        solicitudes = ((await api.solicitudes.listar()) || []).map(adaptarSolicitud);
      } catch (error) {
        if (![401, 403].includes(error.estado)) throw error;
      }

      try {
        clientes = (await api.clientes.listar()) || [];
      } catch (error) {
        if (![401, 403].includes(error.estado)) throw error;
      }
    }
  }

  function mostrarErrorPanel(mensaje) {
    const bloque = `
      <div class="admin-cabins-empty">
        <strong>No pudimos cargar el panel</strong>
        <span>${escapar(mensaje)}</span>
        <button class="btn btn--outline" type="button" data-retry-panel>Reintentar</button>
      </div>`;

    if (elementos.cabins) elementos.cabins.innerHTML = bloque;
    if (elementos.catalogList) elementos.catalogList.innerHTML = bloque;
    if (elementos.reservationsList) elementos.reservationsList.innerHTML = bloque;
    if (elementos.requestsList) elementos.requestsList.innerHTML = bloque;
  }

  async function cargarPanel({ inicial = false } = {}) {
    if (inicial && elementos.cabins) {
      elementos.cabins.innerHTML = `
        <div class="admin-cabins-empty">
          <strong>Cargando cabañas…</strong>
          <span>Consultando la base de datos.</span>
        </div>`;
    }

    if (inicial && elementos.reservationsList && puedeVerReservas) {
      elementos.reservationsList.innerHTML = `
        <div class="catalog-empty">
          <strong>Cargando reservas…</strong>
          <span>Consultando la base de datos.</span>
        </div>`;
    }

    if (inicial && elementos.requestsList && puedeVerReservas) {
      elementos.requestsList.innerHTML = `
        <div class="catalog-empty">
          <strong>Cargando solicitudes…</strong>
          <span>Consultando la base de datos.</span>
        </div>`;
    }

    try {
      await cargarDatosPanel();
      ultimaActualizacion = new Date();
      actualizarTextoActualizacion();
      renderTodo();

      if (inicial) {
        const { vista, denegada } = resolverVistaHash();
        if (denegada) {
          mostrarToast(`Tu rol no tiene acceso al módulo de ${denegada}.`);
          volverHashPanel();
        }
        mostrarVista(vista, { actualizarHash: false, enfocar: false });
      }

      return true;
    } catch (error) {
      if (error.estado === 401) return false;
      mostrarErrorPanel(
        error?.message || "No pudimos consultar la base de datos. Intenta de nuevo.",
      );
      return false;
    }
  }

  async function refrescarPanel() {
    if (refrescando || !elementos.refresh) return;

    refrescando = true;
    elementos.refresh.disabled = true;
    elementos.refresh.classList.add("is-loading");
    elementos.refresh.setAttribute("aria-busy", "true");
    window.clearTimeout(refreshTimer);

    try {
      const correcto = await cargarPanel();
      if (correcto) {
        ultimaActualizacion = new Date();
        actualizarTextoActualizacion();
        mostrarToast("Panel actualizado con los datos de la base de datos.");
      }
    } catch (error) {
      mostrarToast(error?.message || "No pudimos actualizar el panel.");
    } finally {
      elementos.refresh.disabled = false;
      elementos.refresh.classList.remove("is-loading");
      elementos.refresh.removeAttribute("aria-busy");
      refrescando = false;
    }
  }

  function prepararPanel() {
    if (panelPreparado) return;
    panelPreparado = true;

    iniciarFiltros();
    iniciarDetalle();
    iniciarActualizacion();
    iniciarMenu();
    iniciarNavegacion();
    iniciarCatalogo();
    iniciarReservas();

    document.addEventListener("click", (evento) => {
      if (evento.target.closest("[data-retry-panel]")) cargarPanel();
    });
  }

  async function activarPanel() {
    mostrarPanel();
    actualizarSesionUI();
    prepararPanel();
    await cargarPanel({ inicial: true });
  }

  /* ------------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------------ */

  async function arrancar() {
    elementos.loginForm?.addEventListener("submit", entrar);

    elementos.loginToggle?.addEventListener("click", () => {
      if (!elementos.loginPassword) return;
      const mostrar = elementos.loginPassword.type === "password";
      elementos.loginPassword.type = mostrar ? "text" : "password";
      elementos.loginToggle.textContent = mostrar ? "Ocultar" : "Mostrar";
      elementos.loginToggle.setAttribute("aria-pressed", String(mostrar));
      elementos.loginToggle.setAttribute(
        "aria-label",
        mostrar ? "Ocultar contraseña" : "Mostrar contraseña",
      );
    });

    elementos.logoutBtn?.addEventListener("click", salir);

    elementos.loginEmail?.addEventListener("input", () => {
      if (elementos.loginNote) {
        elementos.loginNote.textContent = "";
        elementos.loginNote.classList.remove("is-error");
      }
    });
    elementos.loginPassword?.addEventListener("input", () => {
      if (elementos.loginNote) {
        elementos.loginNote.textContent = "";
        elementos.loginNote.classList.remove("is-error");
      }
    });

    window.addEventListener("lodgy:sesion-expirada", () => {
      if (!usuario) return;
      salir("Tu sesión venció. Vuelve a entrar para continuar.");
    });

    if (!api.sesion.activa()) {
      mostrarLogin();
      return;
    }

    mostrarCargadorSesion();

    try {
      usuario = await api.sesion.actualizar();
      await activarPanel();
    } catch (error) {
      api.sesion.salir();
      usuario = null;
      mostrarLogin(
        error.estado === 401
          ? "Tu sesión venció. Vuelve a entrar para continuar."
          : error?.message || "No pudimos comprobar tu sesión.",
      );
    }
  }

  arrancar();
})();
