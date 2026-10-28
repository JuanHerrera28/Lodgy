/* ==========================================================================
   Lodgy · Interacciones de la web pública
   --------------------------------------------------------------------------
   Catálogo, servicios y experiencias provienen de la API pública. El buscador
   consulta GET /api/publico/disponibilidad con la misma regla de cruces que
   usa el backend para las reservas.
   ========================================================================== */

(() => {
  "use strict";

  const contenido = window.LODGY;
  const api = window.LODGY_API;

  if (!contenido || !api) {
    console.error("Faltan js/data.js o js/api.js.");
    return;
  }

  const imagenes = contenido.imagenes || {};
  const iconosServicio = contenido.iconosServicio || {};

  let cabanasPublicas = [];
  let experiencias = [];
  let servicios = [];
  let solicitudActual = 0;
  let observador = null;

  const money = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  });

  const formatCOP = (value) => `$${money.format(Number(value) || 0)}`;

  const escapar = (valor) =>
    String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const shortDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const toISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const icon = (name, className = "icon") =>
    `<svg class="${className}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

  const numeroEnPalabras = (numero, genero = "femenino") => {
    const palabras = [
      ["cero", "cero"],
      ["una", "uno"],
      ["dos", "dos"],
      ["tres", "tres"],
      ["cuatro", "cuatro"],
      ["cinco", "cinco"],
      ["seis", "seis"],
      ["siete", "siete"],
      ["ocho", "ocho"],
      ["nueve", "nueve"],
      ["diez", "diez"],
    ];
    const par = palabras[numero];
    if (!par) return String(numero);
    return genero === "femenino" ? par[0] : par[1];
  };

  const capitalizar = (texto) => texto.charAt(0).toLocaleUpperCase("es") + texto.slice(1);

  const conectar = (etiqueta, valor) => {
    const elemento = document.getElementById(etiqueta);
    if (elemento) elemento.textContent = valor;
  };

  /* ------------------------------------------------------------------------
     Referencias del DOM
     ------------------------------------------------------------------------ */

  const cabinsGrid = document.getElementById("cabins-grid");
  const catalogContext = document.getElementById("catalog-context");
  const bookingStatus = document.getElementById("booking-status");

  const dialog = document.getElementById("cabin-dialog");
  const dialogImage = document.getElementById("dialog-image");
  const dialogGallery = document.getElementById("dialog-gallery");
  const dialogPrev = document.getElementById("dialog-prev");
  const dialogNext = document.getElementById("dialog-next");
  const dialogCaption = document.getElementById("dialog-caption");
  const dialogDots = document.getElementById("dialog-dots");
  const dialogCount = document.getElementById("dialog-count");
  const dialogKicker = document.getElementById("dialog-kicker");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogDescription = document.getElementById("dialog-description");
  const dialogCapacity = document.getElementById("dialog-capacity");
  const dialogPrice = document.getElementById("dialog-price");
  const dialogServices = document.getElementById("dialog-services");
  const dialogBook = document.getElementById("dialog-book");
  const whatsappLink = document.getElementById("whatsapp-link");

  const bookingForm = document.getElementById("booking-form");
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  const guestsSelect = document.getElementById("guests");

  const requestDialog = document.getElementById("request-dialog");
  const requestFormWrap = document.getElementById("request-form-wrap");
  const requestForm = document.getElementById("request-form");
  const requestSuccess = document.getElementById("request-success");
  const requestSummary = document.getElementById("request-summary");
  const requestSuccessSummary = document.getElementById("request-success-summary");
  const requestSuccessTitle = document.getElementById("request-success-title");
  const requestSuccessCopy = document.getElementById("request-success-copy");
  const requestSuccessRef = document.getElementById("request-success-ref");
  const requestNote = document.getElementById("request-note");
  const requestSubmit = document.getElementById("request-submit");
  const requestSubmitLabel = requestSubmit?.querySelector("[data-request-submit-label]");
  const requestDocType = document.getElementById("request-doc-type");
  const requestDocNumber = document.getElementById("request-doc-number");
  const requestName = document.getElementById("request-name");
  const requestLastname = document.getElementById("request-lastname");
  const requestPhone = document.getElementById("request-phone");
  const requestEmail = document.getElementById("request-email");
  const requestObservations = document.getElementById("request-observations");
  const requestWebsite = document.getElementById("request-website");

  let lastFocusedElement = null;
  let selectedCabinId = null;
  let gallerySlides = [];
  let galleryIndex = 0;
  let galleryRequest = 0;
  let gallerySwapTimer = null;
  let dialogCloseTimer = null;
  let requestCloseTimer = null;
  let swipeStartX = null;
  let consultaDisponible = null;
  let cabanaSolicitud = null;
  let enviandoSolicitud = false;

  const reduceMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const syncDialogLock = () => {
    const hasOpenDialog = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("is-locked", hasOpenDialog);
    return !hasOpenDialog;
  };

  /* ------------------------------------------------------------------------
     Datos
     ------------------------------------------------------------------------ */

  const adaptarCabana = (cabana, indice) => ({
    id: Number(cabana.id_cabana),
    nombre: cabana.nombre,
    descripcion: cabana.descripcion || "",
    capacidad: Number(cabana.capacidad) || 0,
    precioNoche: Number(cabana.precio_noche) || 0,
    recomendada: Boolean(cabana.es_recomendada),
    activa: cabana.activa === undefined ? true : Boolean(cabana.activa),
    servicios: String(cabana.servicios || "")
      .split(",")
      .map((servicio) => servicio.trim())
      .filter(Boolean),
    imagen: contenido.imagenDeCabana(cabana, indice),
  });

  const actualizarTextos = () => {
    const total = cabanasPublicas.length;
    const capacidades = cabanasPublicas.map((cabana) => cabana.capacidad).filter(Boolean);
    const precios = cabanasPublicas.map((cabana) => cabana.precioNoche).filter((precio) => precio >= 0);
    const minimo = capacidades.length ? Math.min(...capacidades) : 0;
    const maximo = capacidades.length ? Math.max(...capacidades) : 0;
    const desde = precios.length ? Math.min(...precios) : 0;
    const cantidad = capitalizar(numeroEnPalabras(total));

    conectar("hero-copy", `${cantidad} cabañas de madera entre palmeras, una piscina para las tardes largas y la brisa del Caribe como única urgencia.`);
    conectar("mobile-cabins-copy", `${cantidad} cabañas de madera entre palmeras y mar.`);
    conectar("intro-lead", `${cantidad} cabañas de madera, una piscina entre palmeras y el mar de Coveñas como único horizonte.`);
    conectar("stat-cabins", String(total));
    conectar("stat-guests", minimo && maximo ? (minimo === maximo ? String(maximo) : `${minimo}–${maximo}`) : "—");
    conectar("cabins-title", `${cantidad} formas de habitar Coveñas.`);

    const piscina = cabanasPublicas.some((cabana) => cabana.servicios.includes("Piscina"));
    conectar("stat-pool", piscina ? "Sí" : "—");

    const copyCapacidad = document.getElementById("cabins-capacity-copy");
    if (copyCapacidad) {
      if (minimo && maximo && minimo !== maximo) {
        copyCapacidad.textContent = `Desde una cabaña para ${minimo} hasta una casa para ${maximo}. Elige la que mejor se ajuste a tu viaje.`;
      } else if (maximo) {
        copyCapacidad.textContent = `Cabañas para ${maximo} personas. Elige la que mejor se ajuste a tu viaje.`;
      } else {
        copyCapacidad.textContent = "Elige la cabaña que mejor se ajuste a tu viaje.";
      }
    }

    const desdeElemento = document.getElementById("cabins-from");
    if (desdeElemento) {
      desdeElemento.innerHTML = precios.length
        ? `Desde <strong>${escapar(formatCOP(desde))}</strong> COP / noche`
        : "Tarifas según temporada";
    }

    if (guestsSelect) {
      const maximoPersonas = Math.max(maximo, 1);
      const seleccionado = Math.min(Math.max(Number(guestsSelect.value) || 2, 1), maximoPersonas);
      guestsSelect.innerHTML = Array.from({ length: maximoPersonas }, (_, indice) => {
        const personas = indice + 1;
        return `<option value="${personas}">${personas} ${personas === 1 ? "huésped" : "huéspedes"}</option>`;
      }).join("");
      guestsSelect.value = String(seleccionado);
    }
  };

  /* ------------------------------------------------------------------------
     Render del catálogo
     ------------------------------------------------------------------------ */

  const cabinCardTemplate = (cabin, index) => {
    const tag = cabin.recomendada
      ? `<span class="cabin-card__tag">${icon("spark")} Recomendada</span>`
      : "";

    return `
      <article class="cabin-card" data-reveal style="--reveal-delay: ${Math.min(index * 70, 280)}ms"
        data-capacity="${cabin.capacidad}" data-cabin-id="${cabin.id}">
        <div class="cabin-card__media">
          <img
            src="${escapar(cabin.imagen.src)}"
            srcset="${escapar(cabin.imagen.srcset || "")}"
            sizes="(max-width: 620px) 92vw, (max-width: 980px) 46vw, 40vw"
            alt="${escapar(cabin.imagen.alt)}"
            width="${cabin.imagen.width || 1400}"
            height="${cabin.imagen.height || 934}"
            loading="lazy"
            decoding="async">
          ${tag}
        </div>
        <div class="cabin-card__body">
          <div class="cabin-card__top">
            <div>
              <h3 class="cabin-card__name">${escapar(cabin.nombre)}</h3>
              <p class="cabin-card__desc">${escapar(cabin.descripcion)}</p>
            </div>
            <div class="cabin-card__price">
              <span>Desde</span>
              <strong>${formatCOP(cabin.precioNoche)}</strong>
              <span>COP / noche</span>
            </div>
          </div>
          <div class="cabin-card__meta">
            ${icon("user")} ${cabin.capacidad} huéspedes
            <span class="dot" aria-hidden="true"></span>
            ${cabin.servicios.length} ${cabin.servicios.length === 1 ? "servicio" : "servicios"}
          </div>
          <p class="cabin-card__services">${escapar(cabin.servicios.join(" · "))}</p>
          <div class="cabin-card__actions">
            <button class="cabin-card__link" type="button" data-cabin-id="${cabin.id}" aria-haspopup="dialog">
              Ver cabaña
              ${icon("arrow-right")}
            </button>
            <button class="cabin-card__link cabin-card__link--request" type="button"
              data-request-cabin-id="${cabin.id}" hidden>
              Solicitar reserva
              ${icon("arrow-right")}
            </button>
          </div>
        </div>
      </article>
    `;
  };

  const mensajeCatalogo = (texto, conReintento = false) => `
    <div class="catalog-message" role="status">
      <p>${escapar(texto)}</p>
      ${conReintento ? '<button type="button" class="catalog-message__retry" data-reload>Reintentar</button>' : ""}
    </div>`;

  const renderCatalogo = () => {
    if (!cabinsGrid) return;

    consultaDisponible = null;

    if (!cabanasPublicas.length) {
      cabinsGrid.innerHTML = mensajeCatalogo("No hay cabañas publicadas en este momento.");
      return;
    }

    cabinsGrid.innerHTML = cabanasPublicas.map(cabinCardTemplate).join("");
    observarRevelados();
  };

  /* ------------------------------------------------------------------------
     Servicios y experiencias
     ------------------------------------------------------------------------ */

  const renderExperiencias = () => {
    const experienceList = document.getElementById("experience-list");
    if (!experienceList) return;

    if (!experiencias.length) {
      experienceList.innerHTML =
        '<li class="experience-row"><div><p class="experience-row__name">Sin experiencias publicadas</p></div></li>';
      return;
    }

    experienceList.innerHTML = experiencias
      .map(
        (item) => `
          <li class="experience-row">
            <div>
              <p class="experience-row__name">${escapar(item.nombre)}</p>
              <p class="experience-row__desc">${escapar(item.descripcion || "")}</p>
            </div>
            <p class="experience-row__price">
              ${formatCOP(item.precio)}
              <span>COP</span>
            </p>
          </li>
        `,
      )
      .join("");
  };

  const renderServicios = () => {
    const includedList = document.getElementById("included-list");
    if (!includedList) return;

    if (!servicios.length) {
      includedList.innerHTML =
        '<li class="included__item"><p class="included__name">Sin servicios registrados</p></li>';
      return;
    }

    includedList.innerHTML = servicios
      .map(
        (service) => `
          <li class="included__item">
            ${icon(iconosServicio[service.nombre] || "spark", "included__icon")}
            <p class="included__name">${escapar(service.nombre)}</p>
            <p class="included__desc">${escapar(service.descripcion || "")}</p>
          </li>
        `,
      )
      .join("");
  };

  /* ------------------------------------------------------------------------
     Animaciones al hacer scroll
     ------------------------------------------------------------------------ */

  function observarRevelados() {
    const elementos = document.querySelectorAll("[data-reveal]:not(.is-visible)");

    if (!("IntersectionObserver" in window)) {
      elementos.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    if (!observador) {
      observador = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observador.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
      );
    }

    elementos.forEach((element) => observador.observe(element));
  }

  /* ------------------------------------------------------------------------
     Cabecera al hacer scroll
     ------------------------------------------------------------------------ */

  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  /* ------------------------------------------------------------------------
     Menú móvil
     ------------------------------------------------------------------------ */

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  let menuOpen = false;

  const setMenu = (open, restoreFocus = true) => {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));

    if (open) {
      mobileMenu.removeAttribute("inert");
      document.body.classList.add("is-locked");
      const firstLink = mobileMenu.querySelector("a");
      window.setTimeout(() => firstLink?.focus(), 80);
    } else {
      mobileMenu.setAttribute("inert", "");
      document.body.classList.remove("is-locked");
      if (restoreFocus) menuToggle.focus();
    }
  };

  menuToggle?.addEventListener("click", () => setMenu(!menuOpen));

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false, false));
  });

  document.querySelectorAll("[data-close-menu]").forEach((link) => {
    link.addEventListener("click", () => setMenu(false, false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && menuOpen) setMenu(false, false);
  });

  /* ------------------------------------------------------------------------
     Diálogo de cabaña
     ------------------------------------------------------------------------ */

  const cabinGallery = (cabin) => {
    const slides = [{ image: cabin.imagen, label: "Exterior" }];

    if (imagenes.interior) slides.push({ image: imagenes.interior, label: "Habitación" });
    if (cabin.servicios.includes("Piscina") && imagenes.piscina) {
      slides.push({ image: imagenes.piscina, label: "Piscina" });
    }
    if (cabin.servicios.includes("Cocina equipada") && imagenes.cocina) {
      slides.push({ image: imagenes.cocina, label: "Cocina" });
    }

    return slides;
  };

  const applyGalleryImage = (slide) => {
    if (!dialogImage || !slide) return;
    dialogImage.src = slide.image.src;
    dialogImage.srcset = slide.image.srcset || "";
    dialogImage.sizes = "(max-width: 980px) 92vw, 52vw";
    dialogImage.alt = slide.image.alt;
    dialogImage.width = slide.image.width;
    dialogImage.height = slide.image.height;
  };

  const updateGalleryChrome = () => {
    const slide = gallerySlides[galleryIndex];
    if (!slide) return;

    if (dialogCaption) dialogCaption.textContent = slide.label;
    if (dialogCount) dialogCount.textContent = `${galleryIndex + 1} / ${gallerySlides.length}`;
    if (dialogDots) {
      dialogDots.querySelectorAll("[data-slide-index]").forEach((dot, index) => {
        const active = index === galleryIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    }
  };

  const preloadGallery = () => {
    gallerySlides.forEach((slide) => {
      const image = new Image();
      if (slide.image.srcset) image.srcset = slide.image.srcset;
      image.sizes = "(max-width: 980px) 92vw, 52vw";
      image.src = slide.image.src;
    });
  };

  const renderGallery = () => {
    const single = gallerySlides.length < 2;
    if (dialogGallery) dialogGallery.classList.toggle("has-single", single);
    if (dialogPrev) dialogPrev.hidden = single;
    if (dialogNext) dialogNext.hidden = single;
    if (dialogDots) {
      dialogDots.hidden = single;
      dialogDots.innerHTML = gallerySlides
        .map(
          (slide, index) => `
            <button type="button" class="gallery__dot" data-slide-index="${index}"
              aria-label="Ver ${escapar(slide.label)}" aria-current="${index === 0 ? "true" : "false"}"></button>
          `,
        )
        .join("");
    }

    applyGalleryImage(gallerySlides[0]);
    updateGalleryChrome();
    preloadGallery();
  };

  const showGallerySlide = (nextIndex) => {
    if (gallerySlides.length < 2) return;

    const index = (nextIndex + gallerySlides.length) % gallerySlides.length;
    if (index === galleryIndex) return;

    galleryIndex = index;
    const slide = gallerySlides[index];
    const request = ++galleryRequest;
    updateGalleryChrome();

    window.clearTimeout(gallerySwapTimer);

    const swap = () => {
      if (request !== galleryRequest || !dialogImage) return;
      applyGalleryImage(slide);
      if (!reduceMotion()) {
        window.requestAnimationFrame(() => dialogImage.classList.remove("is-swapping"));
      }
    };

    if (!dialogImage) return;

    if (reduceMotion()) {
      dialogImage.classList.remove("is-swapping");
      swap();
      return;
    }

    dialogImage.classList.add("is-swapping");
    gallerySwapTimer = window.setTimeout(swap, 150);
  };

  const openCabinDialog = (cabinId) => {
    const cabin = cabanasPublicas.find((item) => String(item.id) === String(cabinId));
    if (!cabin || !dialog) return;

    lastFocusedElement = document.activeElement;
    selectedCabinId = cabin.id;

    window.clearTimeout(dialogCloseTimer);
    window.clearTimeout(gallerySwapTimer);
    galleryRequest += 1;
    dialog.classList.remove("is-closing");
    dialogImage?.classList.remove("is-swapping");

    gallerySlides = cabinGallery(cabin);
    galleryIndex = 0;
    renderGallery();

    if (dialogKicker) {
      dialogKicker.textContent = cabin.recomendada ? "Recomendada · Cabaña" : "Cabaña";
    }
    if (dialogTitle) dialogTitle.textContent = cabin.nombre;
    if (dialogDescription) {
      dialogDescription.textContent = cabin.descripcion || "Cabaña de Lodgy.";
    }
    if (dialogCapacity) dialogCapacity.textContent = `${cabin.capacidad} huéspedes`;
    if (dialogPrice) dialogPrice.textContent = formatCOP(cabin.precioNoche);

    if (dialogServices) {
      dialogServices.innerHTML = cabin.servicios.length
        ? cabin.servicios
            .map((service) => `<li>${icon("check")}${escapar(service)}</li>`)
            .join("")
        : "<li>Sin servicios asignados</li>";
    }

    if (whatsappLink) {
      const mensajeBase = `Hola, me interesa la cabaña ${cabin.nombre}.`;
      const checkin = checkinInput?.value;
      const checkout = checkoutInput?.value;
      const guests = guestsSelect?.value;
      let extra = "";

      if (checkin && checkout) {
        extra += ` Fechas: ${formatDate(checkin)} al ${formatDate(checkout)}.`;
      } else if (checkin) {
        extra += ` Llegada: ${formatDate(checkin)}.`;
      } else if (checkout) {
        extra += ` Salida: ${formatDate(checkout)}.`;
      }

      if (guests) {
        extra += ` Huéspedes: ${guests}.`;
      }

      extra += " ¿Podrían confirmarme disponibilidad y precio?";
      whatsappLink.href = `https://wa.me/573209038259?text=${encodeURIComponent(mensajeBase + extra)}`;
    }

    if (dialogBook) dialogBook.dataset.cabinId = cabin.id;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    document.body.classList.add("is-locked");
    dialog.querySelector("[data-close-dialog]")?.focus();
  };

  const closeCabinDialog = () => {
    if (!dialog || dialog.classList.contains("is-closing")) return;

    const finish = () => {
      window.clearTimeout(dialogCloseTimer);
      dialog.classList.remove("is-closing");
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      if (syncDialogLock()) lastFocusedElement?.focus?.();
    };

    if (reduceMotion()) {
      finish();
      return;
    }

    dialog.classList.add("is-closing");
    dialogCloseTimer = window.setTimeout(finish, 220);
  };

  const setEstadoReserva = (mensaje, tipo = "") => {
    if (!bookingStatus) return;
    bookingStatus.textContent = mensaje;
    bookingStatus.classList.toggle("is-error", tipo === "error");
    bookingStatus.classList.toggle("is-info", tipo === "info");
  };

  /* ------------------------------------------------------------------------
     Solicitud de reserva desde la web
     ------------------------------------------------------------------------ */

  const nochesEntreISO = (entrada, salida) => {
    const inicio = new Date(`${entrada}T12:00:00`);
    const fin = new Date(`${salida}T12:00:00`);
    const dias = Math.round((fin - inicio) / 86400000);
    return Number.isFinite(dias) && dias > 0 ? dias : 0;
  };

  const resumenSolicitudHTML = (cabin, consulta, total) => {
    const noches = nochesEntreISO(consulta.checkin, consulta.checkout);
    return `
      <div class="request-summary__item request-summary__item--wide">
        <span class="request-summary__label">Cabaña</span>
        <strong>${escapar(cabin.nombre)}</strong>
        <span class="request-summary__hint">Hasta ${cabin.capacidad} huéspedes</span>
      </div>
      <div class="request-summary__item">
        <span class="request-summary__label">Llegada</span>
        <strong>${escapar(formatDate(consulta.checkin))}</strong>
      </div>
      <div class="request-summary__item">
        <span class="request-summary__label">Salida</span>
        <strong>${escapar(formatDate(consulta.checkout))}</strong>
      </div>
      <div class="request-summary__item">
        <span class="request-summary__label">Huéspedes</span>
        <strong>${consulta.guests} ${consulta.guests === 1 ? "persona" : "personas"}</strong>
      </div>
      <div class="request-summary__item">
        <span class="request-summary__label">Noches</span>
        <strong>${noches} ${noches === 1 ? "noche" : "noches"}</strong>
      </div>
      <div class="request-summary__item request-summary__item--wide request-summary__item--total">
        <span class="request-summary__label">Total estimado</span>
        <strong>${formatCOP(total)}</strong>
        <span class="request-summary__hint">${formatCOP(cabin.precioNoche)} por noche · tarifa vigente</span>
      </div>
    `;
  };

  const limpiarErroresSolicitud = () => {
    const campos = [
      [requestDocType, "request-doc-type-error"],
      [requestDocNumber, "request-doc-number-error"],
      [requestName, "request-name-error"],
      [requestLastname, "request-lastname-error"],
      [requestPhone, "request-phone-error"],
      [requestEmail, "request-email-error"],
    ];

    campos.forEach(([campo, idError]) => {
      campo?.removeAttribute("aria-invalid");
      const error = document.getElementById(idError);
      if (error) error.textContent = "";
    });
  };

  const marcarErrorSolicitud = (campo, idError, mensaje) => {
    if (campo) campo.setAttribute("aria-invalid", "true");
    const error = document.getElementById(idError);
    if (error) error.textContent = mensaje;
  };

  const validarSolicitud = () => {
    limpiarErroresSolicitud();

    let primero = null;
    const fallo = (campo, idError, mensaje) => {
      marcarErrorSolicitud(campo, idError, mensaje);
      if (!primero) primero = campo;
    };

    if (!consultaDisponible || !cabanaSolicitud) {
      if (requestNote) {
        requestNote.textContent = "Vuelve a consultar la disponibilidad para continuar.";
        requestNote.classList.add("is-error");
      }
      return false;
    }

    if (consultaDisponible.checkin < todayISO) {
      if (requestNote) {
        requestNote.textContent = "La fecha de llegada ya pasó. Consulta un nuevo rango de fechas.";
        requestNote.classList.add("is-error");
      }
      return false;
    }

    const tipoDocumento = requestDocType?.value || "";
    if (!["CC", "CE", "TI", "Pasaporte"].includes(tipoDocumento)) {
      fallo(requestDocType, "request-doc-type-error", "Selecciona el tipo de documento.");
    }

    const documento = requestDocNumber?.value.trim() || "";
    if (!documento) {
      fallo(requestDocNumber, "request-doc-number-error", "Escribe el número de documento.");
    } else if (documento.length > 20) {
      fallo(requestDocNumber, "request-doc-number-error", "Máximo 20 caracteres.");
    }

    const nombre = requestName?.value.trim() || "";
    if (!nombre) {
      fallo(requestName, "request-name-error", "Escribe tu nombre.");
    } else if (nombre.length > 60) {
      fallo(requestName, "request-name-error", "Máximo 60 caracteres.");
    }

    const apellido = requestLastname?.value.trim() || "";
    if (!apellido) {
      fallo(requestLastname, "request-lastname-error", "Escribe tu apellido.");
    } else if (apellido.length > 60) {
      fallo(requestLastname, "request-lastname-error", "Máximo 60 caracteres.");
    }

    const telefono = requestPhone?.value.trim() || "";
    if (!telefono) {
      fallo(requestPhone, "request-phone-error", "Escribe un teléfono de contacto.");
    } else if (!/^[0-9+()\-\s]{7,20}$/.test(telefono)) {
      fallo(requestPhone, "request-phone-error", "Usa solo números, espacios, +, ( o ).");
    }

    const correo = requestEmail?.value.trim() || "";
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      fallo(requestEmail, "request-email-error", "Revisa el formato del correo.");
    }

    if (primero) {
      primero.focus();
      return false;
    }

    return true;
  };

  const setSolicitudOcupada = (ocupado) => {
    if (requestSubmit) requestSubmit.disabled = ocupado;
    if (requestSubmitLabel) {
      requestSubmitLabel.textContent = ocupado ? "Enviando…" : "Enviar solicitud";
    }
    requestForm?.setAttribute("aria-busy", String(ocupado));
  };

  const mostrarSolicitudEnviada = (respuesta) => {
    const noches = Number(respuesta?.noches) || nochesEntreISO(consultaDisponible.checkin, consultaDisponible.checkout);
    const total = Number(respuesta?.total_estimado) || cabanaSolicitud.precioNoche * noches;
    const referencia = respuesta?.referencia || "";

    if (requestSuccessTitle) {
      requestSuccessTitle.textContent = `Gracias, ${requestName?.value.trim() || "viajero"}`;
    }
    if (requestSuccessCopy) {
      requestSuccessCopy.textContent =
        `Recibimos tu solicitud para ${cabanaSolicitud.nombre}. El equipo revisará la disponibilidad y te contactará al ${requestPhone?.value.trim() || "teléfono indicado"} para confirmar la reserva.`;
    }
    if (requestSuccessSummary) {
      requestSuccessSummary.innerHTML = resumenSolicitudHTML(cabanaSolicitud, consultaDisponible, total);
    }
    if (requestSuccessRef) requestSuccessRef.textContent = referencia || "pendiente";

    if (requestFormWrap) requestFormWrap.hidden = true;
    if (requestSuccess) requestSuccess.hidden = false;

    window.setTimeout(() => requestSuccessTitle?.focus(), 80);
  };

  const abrirSolicitud = (idCabana) => {
    if (!requestDialog) return;

    if (!consultaDisponible) {
      setEstadoReserva("Primero consulta la disponibilidad para ver las cabañas libres.", "info");
      document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const cabin = cabanasPublicas.find((item) => String(item.id) === String(idCabana));
    if (!cabin) return;

    cabanaSolicitud = cabin;
    lastFocusedElement = document.activeElement;

    const noches = nochesEntreISO(consultaDisponible.checkin, consultaDisponible.checkout);
    if (requestSummary) {
      requestSummary.innerHTML = resumenSolicitudHTML(cabin, consultaDisponible, noches * cabin.precioNoche);
    }

    requestForm?.reset();
    if (requestDocType) requestDocType.value = "CC";
    limpiarErroresSolicitud();
    if (requestNote) {
      requestNote.textContent = "";
      requestNote.classList.remove("is-error");
    }
    setSolicitudOcupada(false);
    if (requestFormWrap) requestFormWrap.hidden = false;
    if (requestSuccess) requestSuccess.hidden = true;

    window.clearTimeout(requestCloseTimer);
    requestDialog.classList.remove("is-closing");
    if (typeof requestDialog.showModal === "function") {
      requestDialog.showModal();
    } else {
      requestDialog.setAttribute("open", "");
    }
    document.body.classList.add("is-locked");
    window.setTimeout(() => requestDocNumber?.focus(), 80);
  };

  const cerrarSolicitud = ({ restaurarFoco = true } = {}) => {
    if (!requestDialog || requestDialog.classList.contains("is-closing")) return;

    const finish = () => {
      window.clearTimeout(requestCloseTimer);
      requestDialog.classList.remove("is-closing");
      if (typeof requestDialog.close === "function") requestDialog.close();
      else requestDialog.removeAttribute("open");
      if (syncDialogLock() && restaurarFoco) lastFocusedElement?.focus?.();
    };

    if (reduceMotion()) {
      finish();
      return;
    }

    requestDialog.classList.add("is-closing");
    requestCloseTimer = window.setTimeout(finish, 220);
  };

  const mostrarTodas = () => {
    solicitudActual += 1;
    consultaDisponible = null;
    if (!cabinsGrid) return;
    cabinsGrid.querySelectorAll(".cabin-card").forEach((card) => {
      card.hidden = false;
      card.classList.add("is-visible");
      const boton = card.querySelector("[data-request-cabin-id]");
      if (boton) boton.hidden = true;
    });
    if (catalogContext) {
      catalogContext.hidden = true;
      catalogContext.innerHTML = "";
    }
    setEstadoReserva("");
    if (bookingForm) bookingForm.removeAttribute("aria-busy");
  };

  const mostrarDisponibilidad = (disponibles, consulta) => {
    if (!cabinsGrid) return;

    consultaDisponible = {
      checkin: consulta.checkin,
      checkout: consulta.checkout,
      guests: Number(consulta.guests) || 1,
    };

    const ids = new Set(disponibles.map((cabana) => Number(cabana.id_cabana)));
    const tarjetas = Array.from(cabinsGrid.querySelectorAll(".cabin-card"));
    const visibles = tarjetas.filter((card) => ids.has(Number(card.dataset.cabinId)));

    tarjetas.forEach((card) => {
      const disponible = ids.has(Number(card.dataset.cabinId));
      card.hidden = !disponible;
      if (disponible) card.classList.add("is-visible");
      const boton = card.querySelector("[data-request-cabin-id]");
      if (boton) boton.hidden = !disponible;
    });

    const total = visibles.length;
    const rango = `${shortDate(consulta.checkin)} — ${shortDate(consulta.checkout)}`;
    const huespedes = `${consulta.guests} ${consulta.guests === 1 ? "huésped" : "huéspedes"}`;

    if (catalogContext) {
      catalogContext.hidden = false;
      catalogContext.innerHTML = total
        ? `<strong>${escapar(rango)}</strong> · ${huespedes} · ${total} ${
            total === 1 ? "cabaña disponible" : "cabañas disponibles"
          } para esas fechas.
            Elige una cabaña y envía tu solicitud; el equipo confirma la disponibilidad y la tarifa.
            <button type="button" class="catalog-context__clear" data-clear-filter>Ver todas</button>`
        : `<strong>${escapar(rango)}</strong> · ${huespedes} · No encontramos cabañas libres para esas fechas.
            Prueba con otras fechas o escríbenos a ${escapar(contenido.negocio.correo)}.
            <button type="button" class="catalog-context__clear" data-clear-filter>Ver todas</button>`;
    }

    if (total) {
      setEstadoReserva(
        `Mostrando ${total} ${total === 1 ? "cabaña disponible" : "cabañas disponibles"} para ${huespedes}. Puedes solicitar tu reserva y el equipo la confirmará.`,
        "info",
      );
    } else {
      setEstadoReserva(
        `No hay cabañas libres para ${huespedes} en esas fechas. Prueba otro rango o escríbenos a ${contenido.negocio.correo}.`,
        "error",
      );
    }

    document.getElementById("cabanas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  dialogPrev?.addEventListener("click", () => showGallerySlide(galleryIndex - 1));
  dialogNext?.addEventListener("click", () => showGallerySlide(galleryIndex + 1));

  dialogDots?.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-slide-index]");
    if (dot) showGallerySlide(Number(dot.dataset.slideIndex));
  });

  dialog?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showGallerySlide(galleryIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  dialogGallery?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("button")) return;
    swipeStartX = event.clientX;
  });

  dialogGallery?.addEventListener("pointerup", (event) => {
    if (swipeStartX === null) return;
    const delta = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(delta) < 40) return;
    showGallerySlide(galleryIndex + (delta < 0 ? 1 : -1));
  });

  dialogGallery?.addEventListener("pointercancel", () => {
    swipeStartX = null;
  });

  document.addEventListener("click", (event) => {
    const solicitudTrigger = event.target.closest("[data-request-cabin-id]");
    if (solicitudTrigger) {
      abrirSolicitud(solicitudTrigger.dataset.requestCabinId);
      return;
    }

    const trigger = event.target.closest("[data-cabin-id]");
    if (trigger && !trigger.closest("#cabin-dialog")) {
      openCabinDialog(trigger.dataset.cabinId);
    }

    if (event.target.closest("[data-close-dialog]")) {
      closeCabinDialog();
    }

    if (event.target.closest("[data-close-request]")) {
      cerrarSolicitud();
    }

    if (event.target.closest("[data-clear-filter]")) {
      mostrarTodas();
    }

    if (event.target.closest("[data-reload]")) {
      cargarDatos();
    }
  });

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeCabinDialog();
  });

  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCabinDialog();
  });

  dialog?.addEventListener("close", () => {
    dialog.classList.remove("is-closing");
    syncDialogLock();
  });

  dialogBook?.addEventListener("click", () => {
    const cabin = cabanasPublicas.find((item) => String(item.id) === String(selectedCabinId));

    if (cabin && guestsSelect) {
      const maximo = guestsSelect.options.length || 8;
      guestsSelect.value = String(Math.min(cabin.capacidad, maximo));
    }

    closeCabinDialog();

    checkinInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => checkinInput?.focus({ preventScroll: true }), 450);

    if (cabin) {
      setEstadoReserva(
        `${cabin.nombre} seleccionada. Elige tus fechas y consulta disponibilidad.`,
        "info",
      );
    }
  });

  /* ------------------------------------------------------------------------
     Diálogo de solicitud
     ------------------------------------------------------------------------ */

  requestDialog?.addEventListener("click", (event) => {
    if (event.target === requestDialog) cerrarSolicitud();
  });

  requestDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    cerrarSolicitud();
  });

  requestDialog?.addEventListener("close", () => {
    requestDialog.classList.remove("is-closing");
    requestForm?.reset();
    limpiarErroresSolicitud();
    if (requestNote) {
      requestNote.textContent = "";
      requestNote.classList.remove("is-error");
    }
    if (requestFormWrap) requestFormWrap.hidden = false;
    if (requestSuccess) requestSuccess.hidden = true;
    cabanaSolicitud = null;
    setSolicitudOcupada(false);
    syncDialogLock();
  });

  requestForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (enviandoSolicitud || !cabanaSolicitud || !consultaDisponible) return;
    if (!validarSolicitud()) return;

    enviandoSolicitud = true;
    setSolicitudOcupada(true);
    if (requestNote) {
      requestNote.textContent = "";
      requestNote.classList.remove("is-error");
    }

    try {
      const respuesta = await api.publico.crearSolicitud({
        id_cabana: cabanaSolicitud.id,
        fecha_entrada: consultaDisponible.checkin,
        fecha_salida: consultaDisponible.checkout,
        num_personas: consultaDisponible.guests,
        tipo_documento: requestDocType?.value || "CC",
        numero_documento: requestDocNumber?.value.trim() || "",
        nombre: requestName?.value.trim() || "",
        apellido: requestLastname?.value.trim() || "",
        telefono: requestPhone?.value.trim() || "",
        correo: requestEmail?.value.trim() || "",
        observaciones: requestObservations?.value.trim() || "",
        sitio_web: requestWebsite?.value || "",
      });

      mostrarSolicitudEnviada(respuesta || {});
    } catch (error) {
      if (requestNote) {
        requestNote.textContent =
          error?.message || "No pudimos enviar la solicitud. Intenta de nuevo.";
        requestNote.classList.add("is-error");
      }
    } finally {
      enviandoSolicitud = false;
      setSolicitudOcupada(false);
    }
  });

  requestForm?.addEventListener("input", (event) => {
    const campo = event.target;
    if (!(campo instanceof HTMLElement)) return;
    campo.removeAttribute("aria-invalid");
    const error = campo.closest(".request-field")?.querySelector(".request-error");
    if (error) error.textContent = "";
    if (requestNote) {
      requestNote.textContent = "";
      requestNote.classList.remove("is-error");
    }
  });

  /* ------------------------------------------------------------------------
     Formulario de reserva
     ------------------------------------------------------------------------ */

  const today = new Date();
  const todayISO = toISODate(today);
  const tomorrowISO = toISODate(addDays(today, 1));

  if (checkinInput) {
    checkinInput.min = todayISO;
    if (!checkinInput.value) checkinInput.value = todayISO;
  }

  if (checkoutInput) {
    checkoutInput.min = tomorrowISO;
    if (!checkoutInput.value) checkoutInput.value = tomorrowISO;
  }

  checkinInput?.addEventListener("change", () => {
    if (!checkinInput.value) return;
    const nextDay = toISODate(addDays(new Date(`${checkinInput.value}T12:00:00`), 1));
    if (checkoutInput) {
      checkoutInput.min = nextDay;
      if (!checkoutInput.value || checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = nextDay;
      }
    }
  });

  bookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const checkin = checkinInput?.value;
    const checkout = checkoutInput?.value;
    const guests = Number(guestsSelect?.value || 1);

    if (!checkin || !checkout) {
      setEstadoReserva("Selecciona la fecha de llegada y la fecha de salida.", "error");
      return;
    }

    if (checkin < todayISO) {
      setEstadoReserva("La fecha de llegada no puede ser anterior a hoy.", "error");
      checkinInput?.focus();
      return;
    }

    if (checkout <= checkin) {
      setEstadoReserva("La fecha de salida debe ser posterior a la llegada.", "error");
      checkoutInput?.focus();
      return;
    }

    if (!cabanasPublicas.length) {
      setEstadoReserva("El catálogo todavía se está cargando. Intenta de nuevo en un momento.", "error");
      return;
    }

    const solicitud = ++solicitudActual;
    setEstadoReserva("Consultando disponibilidad…", "info");
    bookingForm.setAttribute("aria-busy", "true");

    try {
      const disponibles = await api.publico.disponibilidad({
        fechaInicio: checkin,
        fechaFin: checkout,
        personas: guests,
      });

      if (solicitud !== solicitudActual) return;
      mostrarDisponibilidad(disponibles, { checkin, checkout, guests });
    } catch (error) {
      if (solicitud !== solicitudActual) return;
      setEstadoReserva(
        error?.message || "No pudimos consultar la disponibilidad. Intenta de nuevo.",
        "error",
      );
    } finally {
      if (solicitud === solicitudActual) bookingForm.removeAttribute("aria-busy");
    }
  });

  bookingForm?.addEventListener("input", () => {
    if (bookingStatus?.classList.contains("is-error")) setEstadoReserva("");
  });

  /* ------------------------------------------------------------------------
     Carga de datos
     ------------------------------------------------------------------------ */

  const mostrarErrorCarga = (mensaje) => {
    if (cabinsGrid) cabinsGrid.innerHTML = mensajeCatalogo(mensaje, true);
    const experienceList = document.getElementById("experience-list");
    if (experienceList) {
      experienceList.innerHTML =
        '<li class="experience-row"><div><p class="experience-row__name">No pudimos cargar las experiencias</p></div></li>';
    }
    const includedList = document.getElementById("included-list");
    if (includedList) {
      includedList.innerHTML =
        '<li class="included__item"><p class="included__name">No pudimos cargar los servicios</p></li>';
    }
    setEstadoReserva(mensaje, "error");
  };

  async function cargarDatos() {
    if (cabinsGrid) {
      cabinsGrid.innerHTML = mensajeCatalogo("Cargando cabañas…");
    }

    try {
      const [catalogo, catalogoServicios, catalogoExperiencias] = await Promise.all([
        api.publico.cabanas(),
        api.publico.servicios(),
        api.publico.experiencias(),
      ]);

      cabanasPublicas = (catalogo || []).map(adaptarCabana).filter((cabana) => cabana.activa);
      servicios = catalogoServicios || [];
      experiencias = (catalogoExperiencias || []).map((item) => ({
        nombre: item.nombre,
        descripcion: item.descripcion || "",
        precio: Number(item.precio) || 0,
      }));

      actualizarTextos();
      renderCatalogo();
      renderExperiencias();
      renderServicios();
      setEstadoReserva("");
    } catch (error) {
      mostrarErrorCarga(
        error?.message || "No pudimos cargar el catálogo. Revisa tu conexión e intenta de nuevo.",
      );
    }
  }

  /* ------------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------------ */

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  observarRevelados();

  // Compatibilidad con navegadores sin <dialog>
  if (dialog && typeof dialog.showModal !== "function") {
    dialog.setAttribute("open", "");
    dialog.style.position = "fixed";
    dialog.style.inset = "1rem";
    dialog.style.zIndex = "80";
  }

  cargarDatos();
})();
