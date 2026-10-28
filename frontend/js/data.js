/* ==========================================================================
   Lodgy · Contenido estático
   --------------------------------------------------------------------------
   Lo que no vive en la base de datos: fotografías locales, datos de contacto,
   iconos de servicios y permisos por rol.
   Cabañas, precios, servicios y experiencias se consultan a la API:
     GET /api/publico/cabanas
     GET /api/publico/servicios
     GET /api/publico/servicios-adicionales
     GET /api/cabanas            (con token)
   ========================================================================== */

window.LODGY = (() => {
  "use strict";

  const fotosCabana = [
    {
      nombre: "Cabaña Brisa",
      src: "assets/images/cabana-brisa-1400.jpg",
      srcset: "assets/images/cabana-brisa-700.jpg 700w, assets/images/cabana-brisa-1400.jpg 1400w",
      alt: "Pequeña cabaña de madera entre palmeras en una isla tropical",
      width: 1400,
      height: 788,
    },
    {
      nombre: "Cabaña Coral",
      src: "assets/images/cabana-coral-1400.jpg",
      srcset: "assets/images/cabana-coral-700.jpg 700w, assets/images/cabana-coral-1400.jpg 1400w",
      alt: "Casa de madera junto a la playa durante la puesta de sol",
      width: 1400,
      height: 788,
    },
    {
      nombre: "Cabaña Marea",
      src: "assets/images/cabana-marea-1400.jpg",
      srcset: "assets/images/cabana-marea-700.jpg 700w, assets/images/cabana-marea-1400.jpg 1400w",
      alt: "Casa de madera sobre arena blanca bajo nubes blancas",
      width: 1400,
      height: 940,
    },
    {
      nombre: "Cabaña Palma",
      src: "assets/images/cabana-palma-1400.jpg",
      srcset: "assets/images/cabana-palma-700.jpg 700w, assets/images/cabana-palma-1400.jpg 1400w",
      alt: "Cabaña tropical de madera con terraza y palmeras",
      width: 1400,
      height: 932,
    },
    {
      nombre: "Cabaña Horizonte",
      src: "assets/images/cabana-horizonte-1400.jpg",
      srcset:
        "assets/images/cabana-horizonte-700.jpg 700w, assets/images/cabana-horizonte-1400.jpg 1400w",
      alt: "Cabaña en la playa con montañas al fondo",
      width: 1400,
      height: 934,
    },
  ];

  const imagenes = {
    hero: {
      src: "assets/images/hero-cabin-sea-2400.jpg",
      srcset:
        "assets/images/hero-cabin-sea-1200.jpg 1200w, assets/images/hero-cabin-sea-2400.jpg 2400w",
      alt: "Cabaña de madera sobre pilotes en una playa de arena con olas del mar",
      width: 2400,
      height: 1800,
    },
    intro: {
      src: "assets/images/intro-cabanas-palmas-1600.jpg",
      srcset:
        "assets/images/intro-cabanas-palmas-800.jpg 800w, assets/images/intro-cabanas-palmas-1600.jpg 1600w",
      alt: "Cabañas tropicales de playa entre palmeras y vegetación",
      width: 1600,
      height: 1067,
    },
    piscina: {
      src: "assets/images/piscina-1400.jpg",
      srcset: "assets/images/piscina-700.jpg 700w, assets/images/piscina-1400.jpg 1400w",
      alt: "Casa de madera junto a una piscina rodeada de vegetación",
      width: 1400,
      height: 934,
    },
    cocina: {
      src: "assets/images/cocina-1400.jpg",
      srcset: "assets/images/cocina-700.jpg 700w, assets/images/cocina-1400.jpg 1400w",
      alt: "Cocina equipada con isla central y acabados claros",
      width: 1400,
      height: 839,
    },
    lancha: {
      src: "assets/images/experiencia-lancha-1400.jpg",
      srcset:
        "assets/images/experiencia-lancha-700.jpg 700w, assets/images/experiencia-lancha-1400.jpg 1400w",
      alt: "Personas viajando en lancha por el mar durante el día",
      width: 1400,
      height: 788,
    },
    cena: {
      src: "assets/images/experiencia-cena-1200.jpg",
      srcset:
        "assets/images/experiencia-cena-600.jpg 600w, assets/images/experiencia-cena-1200.jpg 1200w",
      alt: "Mesa de madera bajo una palmera junto al océano",
      width: 1200,
      height: 900,
    },
    ubicacion: {
      src: "assets/images/ubicacion-caribe-1600.jpg",
      srcset:
        "assets/images/ubicacion-caribe-800.jpg 800w, assets/images/ubicacion-caribe-1600.jpg 1600w",
      alt: "Vista aérea de una playa con palmeras y agua turquesa",
      width: 1600,
      height: 822,
    },
    interior: {
      src: "assets/images/interior-cabana-1000.jpg",
      srcset:
        "assets/images/interior-cabana-500.jpg 500w, assets/images/interior-cabana-1000.jpg 1000w",
      alt: "Interior de un bungalow de playa con puerta de madera abierta",
      width: 1000,
      height: 1500,
    },
  };

  const fotos = [
    ...fotosCabana.map((foto) => ({
      src: foto.src,
      etiqueta: `Foto de ${foto.nombre.replace(/^Cabaña\s+/i, "")}`,
      imagen: foto,
    })),
    {
      src: imagenes.interior.src,
      etiqueta: "Interior de cabaña",
      imagen: imagenes.interior,
    },
    {
      src: imagenes.piscina.src,
      etiqueta: "Piscina y vegetación",
      imagen: imagenes.piscina,
    },
    {
      src: imagenes.cocina.src,
      etiqueta: "Cocina equipada",
      imagen: imagenes.cocina,
    },
    {
      src: imagenes.ubicacion.src,
      etiqueta: "Playa y palmeras",
      imagen: imagenes.ubicacion,
    },
  ];

  /* Contacto provisional: reemplazar por los datos reales del alojamiento. */
  const negocio = {
    nombre: "Lodgy",
    descriptor: "Cabañas del Caribe",
    region: "Coveñas, Sucre",
    correo: "reservas@lodgy.com",
    telefono: "+57 300 000 0000",
    whatsapp: "573000000000",
    instagram: "#",
    facebook: "#",
    direccion: "La ubicación exacta se comparte al confirmar la reserva.",
  };

  /* Iconos disponibles en el sprite de index.html. */
  const iconosServicio = {
    WiFi: "wifi",
    "Aire acondicionado": "air",
    Piscina: "pool",
    "Cocina equipada": "kitchen",
    Parqueadero: "parking",
  };

  /* Permisos visibles por rol (los roles los define la base de datos). */
  const permisosPorRol = {
    Administrador: [
      "panel",
      "reservas",
      "clientes",
      "inventario",
      "mantenimiento",
      "administracion",
    ],
    Recepcionista: ["panel", "reservas", "clientes", "mantenimiento"],
    "Servicios generales": ["panel", "mantenimiento", "inventario"],
  };

  const normalizar = (valor) =>
    String(valor || "")
      .trim()
      .replace(/^caba[ñn]a\s+/i, "")
      .toLocaleLowerCase("es");

  /* La base puede no tener foto (NULL): se usa una foto local por nombre. */
  const imagenDeCabana = (cabana = {}, indice = 0) => {
    const ruta = typeof cabana.foto === "string" ? cabana.foto.trim() : "";

    if (ruta) {
      const conocida = fotos.find((foto) => foto.src === ruta);
      if (conocida) return conocida.imagen;
      return {
        src: ruta,
        srcset: "",
        alt: `Fotografía de ${cabana.nombre || "la cabaña"}`,
        width: 1400,
        height: 934,
      };
    }

    const porNombre = fotosCabana.find((foto) => normalizar(foto.nombre) === normalizar(cabana.nombre));
    if (porNombre) return porNombre;

    return fotosCabana[indice % fotosCabana.length] || fotosCabana[0];
  };

  return {
    fotosCabana,
    fotos,
    imagenes,
    negocio,
    iconosServicio,
    permisosPorRol,
    imagenDeCabana,
  };
})();
