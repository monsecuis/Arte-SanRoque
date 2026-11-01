/* ==========================================================================
   main.js — Funciones compartidas del sitio
     toggleMenu()        menú hamburguesa en móviles
     filtrarObras()      filtros de la galería
     validarFormulario() validación del formulario de contacto
     cargarDestacados()  carrusel de obras destacadas (inicio)
     renderizarEventos() agenda / línea de tiempo de eventos
   Cada página indica cuál es en <body data-pagina="...">.
   ========================================================================== */

'use strict';

/* Datos compartidos entre funciones (se completan al iniciar) */
let CATEGORIAS = [];
let ARTISTAS = [];

/* Estado de los filtros de la galería */
const estadoFiltro = { categoria: 'todas', artista: '', tecnica: '', anio: '' };

/* ==========================================================================
   Utilidades
   ========================================================================== */

/** Escapa texto para insertarlo de forma segura en HTML. */
function escaparHTML(texto) {
  return String(texto === undefined || texto === null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buscarCategoria(id) {
  return CATEGORIAS.find(function (c) { return c.id === id; }) || { id: id, nombre: id, icono: 'fa-star' };
}

function buscarArtista(id) {
  return ARTISTAS.find(function (a) { return a.id === id; }) || { id: id, nombre: 'Autor desconocido' };
}

/** Convierte "2026-10-16" en una fecha local (sin desfase de zona horaria). */
function crearFecha(texto) {
  const partes = String(texto).split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function formatearFecha(texto) {
  return crearFecha(texto).toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function hoySinHora() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

/**
 * Devuelve el HTML de una imagen. Si no hay imagen, muestra un
 * marcador de posición con el ícono de la disciplina.
 */
function htmlImagen(src, alt, categoria) {
  const cat = buscarCategoria(categoria);
  if (!src) {
    return '<div class="media placeholder" data-categoria="' + escaparHTML(cat.id) + '" role="img" aria-label="' +
      escaparHTML(alt) + '"><i class="fa-solid ' + escaparHTML(cat.icono) + '"></i></div>';
  }
  return '<img class="media" src="' + escaparHTML(src) + '" alt="' + escaparHTML(alt) + '" loading="lazy" ' +
    'data-categoria="' + escaparHTML(cat.id) + '">';
}

/* ==========================================================================
   Formatos de obra: imagen, video y PDF
   Cada disciplina define en categorias.json qué formato se muestra primero
   (por ejemplo, video para danza y PDF para literatura).
   ========================================================================== */

const FORMATOS = {
  imagen: { campo: 'imagen', nombre: 'Imagen', icono: 'fa-image' },
  video: { campo: 'video', nombre: 'Video', icono: 'fa-circle-play' },
  pdf: { campo: 'pdf', nombre: 'PDF', icono: 'fa-file-pdf' }
};

const DURACION_MINIMA_VIDEO = 10;   // segundos

/** Formatos que tiene cargados la obra, ordenados según su disciplina. */
function formatosDeObra(obra) {
  const orden = buscarCategoria(obra.categoria).formatos || ['imagen', 'video', 'pdf'];
  return orden.filter(function (f) { return FORMATOS[f] && obra[FORMATOS[f].campo]; });
}

/** Devuelve el identificador de un enlace de YouTube, o null si no lo es. */
function idYouTube(url) {
  const coincidencia = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return coincidencia ? coincidencia[1] : null;
}

/** HTML del visor de un formato de la obra (imagen, reproductor de video o lector de PDF). */
function htmlFormato(obra, formato) {
  if (formato === 'video') {
    const idYT = idYouTube(obra.video);
    if (idYT) {
      return '<iframe class="visor" src="https://www.youtube-nocookie.com/embed/' + escaparHTML(idYT) + '" title="Video: ' +
        escaparHTML(obra.titulo) + '" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    }
    return '<video class="visor" src="' + escaparHTML(obra.video) + '" controls preload="metadata"' +
      (obra.imagen ? ' poster="' + escaparHTML(obra.imagen) + '"' : '') + '>' +
      'Tu navegador no puede reproducir este video. <a href="' + escaparHTML(obra.video) + '">Descargarlo</a>.</video>';
  }
  if (formato === 'pdf') {
    return '<div class="visor-pdf">' +
      '<iframe class="visor visor--pdf" src="' + escaparHTML(obra.pdf) + '#view=FitH" title="Documento PDF: ' + escaparHTML(obra.titulo) + '"></iframe>' +
      '<a class="btn btn--secundario btn--pequeno" href="' + escaparHTML(obra.pdf) + '" target="_blank" rel="noopener">' +
      '<i class="fa-solid fa-up-right-from-square"></i> Abrir PDF en otra pestaña</a>' +
      '</div>';
  }
  return htmlImagen(obra.imagen, obra.titulo, obra.categoria);
}

/** Visor de la ficha: la imagen va dentro de un botón que permite verla completa. */
function htmlMediaFicha(obra, formato) {
  if (formato !== 'imagen' || !obra.imagen) return htmlFormato(obra, formato);
  return '<button type="button" class="ficha__ampliar" aria-label="Ver la obra completa">' +
    htmlImagen(obra.imagen, obra.titulo, obra.categoria) +
    '<span class="ficha__ampliar-aviso"><i class="fa-solid fa-expand"></i> Ver completa</span></button>';
}

/** Muestra la imagen completa (sin recortes) en una ventana a pantalla completa. */
function verImagenCompleta(src, alt) {
  let visor = document.getElementById('visorCompleto');
  if (!visor) {
    visor = document.createElement('dialog');
    visor.id = 'visorCompleto';
    visor.className = 'visor-completo';
    visor.setAttribute('aria-label', 'Obra completa');
    visor.innerHTML = '<button class="modal__cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button><img alt="">';
    // Cualquier clic (en la imagen, el fondo o la ×) cierra el visor
    visor.addEventListener('click', function () { visor.close(); });
    document.body.appendChild(visor);
  }
  const img = visor.querySelector('img');
  img.src = src;
  img.alt = alt;
  visor.showModal();
}

/** Enlace externo de la obra (campo "enlace"): solo se aceptan direcciones http/https. */
function enlaceDeObra(obra) {
  return /^https?:\/\//i.test(obra.enlace || '') ? obra.enlace : '';
}

/** Texto del botón según el sitio al que lleva el enlace. */
function nombreEnlace(url) {
  if (/wattpad\.com/i.test(url)) return 'Wattpad';
  if (/kidspiritonline\.com/i.test(url)) return 'KidSpirit';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'YouTube';
  return 'Enlace';
}

/** Texto del botón de la ficha: "Leer en…" para textos, "Ver en…" para videos. */
function textoBotonEnlace(url) {
  const sitio = nombreEnlace(url);
  if (sitio === 'Wattpad' || sitio === 'KidSpirit') return 'Leer en ' + sitio;
  if (sitio === 'YouTube') return 'Ver en YouTube';
  return 'Ver la obra completa';
}

/** Íconos sobre la tarjeta que avisan si la obra tiene video, PDF o enlace externo. */
function htmlInsigniasFormato(obra) {
  const extras = formatosDeObra(obra).filter(function (f) { return f !== 'imagen'; });
  const enlace = enlaceDeObra(obra);
  if (!extras.length && !enlace) return '';
  return '<span class="obra__formatos">' + extras.map(function (f) {
    return '<span title="Incluye ' + FORMATOS[f].nombre + '"><i class="fa-solid ' + FORMATOS[f].icono + '"></i> ' +
      FORMATOS[f].nombre + '</span>';
  }).join('') +
    (enlace ? '<span title="Disponible en ' + nombreEnlace(enlace) + '"><i class="fa-solid fa-arrow-up-right-from-square"></i> ' +
      nombreEnlace(enlace) + '</span>' : '') +
    '</span>';
}

/* Aviso para quien carga contenidos: los videos deben durar al menos 10 segundos */
document.addEventListener('loadedmetadata', function (e) {
  const video = e.target;
  if (video.tagName === 'VIDEO' && video.duration < DURACION_MINIMA_VIDEO) {
    console.warn('El video ' + video.currentSrc + ' dura ' + video.duration.toFixed(1) +
      ' s; se recomienda un mínimo de ' + DURACION_MINIMA_VIDEO + ' s.');
  }
}, true);

/* Fade-in al cargar imágenes y reemplazo por marcador si la imagen no existe */
document.addEventListener('load', function (e) {
  if (e.target.tagName === 'IMG' && e.target.classList.contains('media')) e.target.classList.add('cargada');
}, true);

document.addEventListener('error', function (e) {
  const img = e.target;
  if (img.tagName === 'IMG' && img.classList.contains('media')) {
    img.outerHTML = htmlImagen('', img.alt, img.dataset.categoria);
  }
}, true);

/* ==========================================================================
   Comunes a todas las páginas
   ========================================================================== */

/** Abre o cierra el menú en móviles y tablets. */
function toggleMenu() {
  const menu = document.getElementById('menuPrincipal');
  const boton = document.getElementById('menuToggle');
  if (!menu || !boton) return;

  const abierto = menu.classList.toggle('abierta');
  boton.setAttribute('aria-expanded', abierto);
  boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  boton.innerHTML = abierto ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
}

/** Resalta en el menú el enlace de la página actual. */
function marcarEnlaceActivo() {
  const actual = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navegacion a').forEach(function (enlace) {
    if (enlace.getAttribute('href') === actual) {
      enlace.classList.add('activo');
      enlace.setAttribute('aria-current', 'page');
    }
  });
}

/** Service Worker: permite navegar sin conexión tras la primera visita (RNF6). */
function registrarServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(function (error) {
      console.warn('Service Worker no registrado:', error);
    });
  }
}

/* ==========================================================================
   Inicio: carrusel de destacados
   ========================================================================== */

function cargarDestacados(obras) {
  const pista = document.getElementById('carruselPista');
  const puntos = document.getElementById('carruselPuntos');
  if (!pista) return;

  let destacadas = obras.filter(function (o) { return o.destacada; });
  if (destacadas.length === 0) destacadas = obras.slice(0, 4);

  if (destacadas.length === 0) {
    pista.innerHTML = '<p class="vacio">Todavía no hay obras destacadas.</p>';
    return;
  }

  pista.innerHTML = destacadas.map(function (obra, i) {
    const cat = buscarCategoria(obra.categoria);
    return '<article class="carrusel__slide" role="group" aria-roledescription="diapositiva" aria-label="' +
      (i + 1) + ' de ' + destacadas.length + '">' +
      htmlImagen(obra.imagen, obra.titulo, obra.categoria) +
      '<div class="carrusel__info">' +
      '<span class="etiqueta">' + escaparHTML(cat.nombre) + '</span>' +
      '<h3>' + escaparHTML(obra.titulo) + '</h3>' +
      '<p class="obra__autor">' + escaparHTML(buscarArtista(obra.artistaId).nombre) + ' · ' + escaparHTML(obra.anio) + '</p>' +
      '<p>' + escaparHTML(obra.descripcion) + '</p>' +
      '<a class="btn btn--secundario btn--pequeno" href="galeria.html?categoria=' + encodeURIComponent(obra.categoria) +
      '">Ver más de ' + escaparHTML(cat.nombre.toLowerCase()) + '</a>' +
      '</div></article>';
  }).join('');

  puntos.innerHTML = destacadas.map(function (_, i) {
    return '<button class="carrusel__punto" data-indice="' + i + '" aria-label="Ir a la obra ' + (i + 1) + '"></button>';
  }).join('');

  let indice = 0;

  function mostrar(nuevo) {
    indice = (nuevo + destacadas.length) % destacadas.length;
    pista.style.transform = 'translateX(-' + (indice * 100) + '%)';
    puntos.querySelectorAll('.carrusel__punto').forEach(function (p, i) {
      p.classList.toggle('activo', i === indice);
    });
  }

  document.getElementById('carruselPrev').addEventListener('click', function () { mostrar(indice - 1); });
  document.getElementById('carruselNext').addEventListener('click', function () { mostrar(indice + 1); });
  puntos.addEventListener('click', function (e) {
    if (e.target.dataset.indice !== undefined) mostrar(Number(e.target.dataset.indice));
  });

  mostrar(0);
}

function renderizarDisciplinas() {
  const contenedor = document.getElementById('disciplinas');
  if (!contenedor) return;
  contenedor.innerHTML = CATEGORIAS.map(function (c) {
    return '<a class="disciplina" href="galeria.html?categoria=' + encodeURIComponent(c.id) + '">' +
      '<i class="fa-solid ' + escaparHTML(c.icono) + '"></i>' + escaparHTML(c.nombre) + '</a>';
  }).join('');
}

/* ==========================================================================
   Galería: obras y filtros
   ========================================================================== */

function htmlObra(obra) {
  const cat = buscarCategoria(obra.categoria);
  const artista = buscarArtista(obra.artistaId);
  return '<figure class="obra" tabindex="0" data-id="' + escaparHTML(obra.id) + '"' +
    ' data-categoria="' + escaparHTML(obra.categoria) + '"' +
    ' data-artista="' + escaparHTML(obra.artistaId) + '"' +
    ' data-tecnica="' + escaparHTML(obra.tecnica) + '"' +
    ' data-anio="' + escaparHTML(obra.anio) + '">' +
    htmlImagen(obra.imagen, obra.titulo, obra.categoria) +
    htmlInsigniasFormato(obra) +
    '<figcaption>' +
    '<span class="etiqueta">' + escaparHTML(cat.nombre) + '</span> ' +
    (obra.destacada ? '<span class="etiqueta etiqueta--destacada"><i class="fa-solid fa-star"></i> Destacada</span>' : '') +
    '<h3>' + escaparHTML(obra.titulo) + '</h3>' +
    '<p class="obra__autor">' + escaparHTML(artista.nombre) + ' · ' + escaparHTML(obra.anio) + '</p>' +
    '</figcaption></figure>';
}

/** Llena un <select> con opciones únicas y ordenadas. */
function llenarSelect(select, opciones, textoTodos) {
  select.innerHTML = '<option value="">' + textoTodos + '</option>' + opciones.map(function (op) {
    return '<option value="' + escaparHTML(op.valor) + '">' + escaparHTML(op.texto) + '</option>';
  }).join('');
}

function unicos(lista) {
  return Array.from(new Set(lista)).filter(Boolean);
}

function iniciarGaleria(datos) {
  const grilla = document.getElementById('grillaObras');
  const botones = document.getElementById('filtroCategorias');
  const selArtista = document.getElementById('filtroArtista');
  const selTecnica = document.getElementById('filtroTecnica');
  const selAnio = document.getElementById('filtroAnio');

  // 1. Renderizar las obras desde los datos (JSON o LocalStorage)
  const obras = datos.obras.slice().sort(function (a, b) { return b.anio - a.anio; });
  grilla.innerHTML = obras.map(htmlObra).join('');

  // 2. Botones de categoría
  botones.innerHTML = '<button class="filtro-btn" data-categoria="todas">Todas</button>' +
    CATEGORIAS.map(function (c) {
      return '<button class="filtro-btn" data-categoria="' + escaparHTML(c.id) + '">' +
        '<i class="fa-solid ' + escaparHTML(c.icono) + '"></i> ' + escaparHTML(c.nombre) + '</button>';
    }).join('');

  // 3. Listas desplegables (autor, técnica, año)
  llenarSelect(selArtista, unicos(obras.map(function (o) { return o.artistaId; })).map(function (id) {
    return { valor: id, texto: buscarArtista(id).nombre };
  }), 'Todos los autores');
  llenarSelect(selTecnica, unicos(obras.map(function (o) { return o.tecnica; })).sort().map(function (t) {
    return { valor: t, texto: t };
  }), 'Todas las técnicas');
  llenarSelect(selAnio, unicos(obras.map(function (o) { return String(o.anio); })).sort().reverse().map(function (a) {
    return { valor: a, texto: a };
  }), 'Todos los años');

  // 4. Restaurar filtros: primero la URL (?categoria= / ?artista=), si no, LocalStorage
  const params = new URLSearchParams(location.search);
  const guardado = Datos.leerPreferencia('filtroGaleria', {});
  if (params.has('categoria') || params.has('artista')) {
    estadoFiltro.categoria = params.get('categoria') || 'todas';
    estadoFiltro.artista = params.get('artista') || '';
  } else {
    Object.assign(estadoFiltro, guardado);
  }
  selArtista.value = estadoFiltro.artista;
  selTecnica.value = estadoFiltro.tecnica;
  selAnio.value = estadoFiltro.anio;

  // 5. Eventos
  botones.addEventListener('click', function (e) {
    const btn = e.target.closest('.filtro-btn');
    if (btn) filtrarObras(btn.dataset.categoria);
  });

  [[selArtista, 'artista'], [selTecnica, 'tecnica'], [selAnio, 'anio']].forEach(function (par) {
    par[0].addEventListener('change', function () {
      estadoFiltro[par[1]] = par[0].value;
      filtrarObras(estadoFiltro.categoria);
    });
  });

  document.getElementById('limpiarFiltros').addEventListener('click', function () {
    estadoFiltro.artista = estadoFiltro.tecnica = estadoFiltro.anio = '';
    selArtista.value = selTecnica.value = selAnio.value = '';
    filtrarObras('todas');
  });

  // Abrir ficha técnica con clic o Enter
  grilla.addEventListener('click', function (e) {
    const fig = e.target.closest('.obra');
    if (fig) abrirFicha(fig.dataset.id, datos.obras);
  });
  grilla.addEventListener('keydown', function (e) {
    const fig = e.target.closest('.obra');
    if (fig && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      abrirFicha(fig.dataset.id, datos.obras);
    }
  });

  filtrarObras(estadoFiltro.categoria);
}

/**
 * Muestra u oculta las obras según su atributo data-categoria y
 * los demás filtros activos. Guarda la preferencia en LocalStorage.
 */
function filtrarObras(categoria) {
  estadoFiltro.categoria = categoria || 'todas';
  Datos.guardarPreferencia('filtroGaleria', estadoFiltro);

  document.querySelectorAll('#filtroCategorias .filtro-btn').forEach(function (btn) {
    const activo = btn.dataset.categoria === estadoFiltro.categoria;
    btn.classList.toggle('activo', activo);
    btn.setAttribute('aria-pressed', activo);
  });

  let visibles = 0;
  document.querySelectorAll('#grillaObras .obra').forEach(function (fig) {
    const coincide =
      (estadoFiltro.categoria === 'todas' || fig.dataset.categoria === estadoFiltro.categoria) &&
      (!estadoFiltro.artista || fig.dataset.artista === estadoFiltro.artista) &&
      (!estadoFiltro.tecnica || fig.dataset.tecnica === estadoFiltro.tecnica) &&
      (!estadoFiltro.anio || fig.dataset.anio === estadoFiltro.anio);
    fig.classList.toggle('oculto', !coincide);
    if (coincide) visibles++;
  });

  document.getElementById('resultadoFiltro').textContent =
    'Mostrando ' + visibles + (visibles === 1 ? ' obra' : ' obras');
  document.getElementById('sinResultados').classList.toggle('oculto', visibles > 0);
}

/** Ficha técnica de una obra en una ventana modal (RF3). */
function abrirFicha(id, obras) {
  const obra = obras.find(function (o) { return o.id === id; });
  const modal = document.getElementById('modalFicha');
  if (!obra || !modal) return;

  const artista = buscarArtista(obra.artistaId);
  const formatos = formatosDeObra(obra);
  const enlace = enlaceDeObra(obra);

  // Si la obra tiene más de un formato, se agregan botones para cambiar de uno a otro
  const selector = formatos.length > 1
    ? '<div class="ficha__formatos" role="group" aria-label="Formato de la obra">' + formatos.map(function (f, i) {
        return '<button type="button" class="filtro-btn' + (i === 0 ? ' activo' : '') + '" data-formato="' + f + '"' +
          ' aria-pressed="' + (i === 0) + '"><i class="fa-solid ' + FORMATOS[f].icono + '"></i> ' + FORMATOS[f].nombre + '</button>';
      }).join('') + '</div>'
    : '';

  document.getElementById('contenidoFicha').innerHTML =
    '<div class="ficha__media" id="fichaMedia">' + htmlMediaFicha(obra, formatos[0] || 'imagen') + '</div>' +
    '<div class="modal__cuerpo">' +
    selector +
    '<span class="etiqueta">' + escaparHTML(buscarCategoria(obra.categoria).nombre) + '</span>' +
    '<h2 id="tituloFicha">' + escaparHTML(obra.titulo) + '</h2>' +
    '<table class="ficha"><tbody>' +
    '<tr><th>Autor</th><td>' + escaparHTML(artista.nombre) + '</td></tr>' +
    '<tr><th>Técnica</th><td>' + escaparHTML(obra.tecnica) + '</td></tr>' +
    '<tr><th>Dimensiones / duración</th><td>' + escaparHTML(obra.dimensiones) + '</td></tr>' +
    '<tr><th>Año</th><td>' + escaparHTML(obra.anio) + '</td></tr>' +
    '</tbody></table>' +
    '<p>' + escaparHTML(obra.descripcion) + '</p>' +
    '<div class="ficha__acciones">' +
    (enlace
      ? '<a class="btn btn--primario btn--pequeno" href="' + escaparHTML(enlace) + '" target="_blank" rel="noopener noreferrer">' +
        '<i class="fa-solid fa-arrow-up-right-from-square"></i> ' +
        textoBotonEnlace(enlace) + '</a>'
      : '') +
    '<a class="btn btn--secundario btn--pequeno" href="artistas.html#' + encodeURIComponent(artista.id) + '">Conocer al artista</a>' +
    '</div>' +
    '</div>';

  const botones = modal.querySelector('.ficha__formatos');
  if (botones) {
    botones.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-formato]');
      if (!btn) return;
      document.getElementById('fichaMedia').innerHTML = htmlMediaFicha(obra, btn.dataset.formato);
      botones.querySelectorAll('[data-formato]').forEach(function (b) {
        b.classList.toggle('activo', b === btn);
        b.setAttribute('aria-pressed', b === btn);
      });
    });
  }

  // Clic en la imagen de arriba: se abre completa (si no cargó, no hay nada que ampliar)
  document.getElementById('fichaMedia').addEventListener('click', function (e) {
    const boton = e.target.closest('.ficha__ampliar');
    const img = boton && boton.querySelector('img');
    if (img) verImagenCompleta(img.src, obra.titulo);
  });

  // Al cerrar se vacía la ficha para que el video deje de sonar
  modal.addEventListener('close', function () {
    document.getElementById('contenidoFicha').innerHTML = '';
  }, { once: true });

  modal.showModal();
}

/* ==========================================================================
   Artistas
   ========================================================================== */

function renderizarArtistas(datos) {
  const contenedor = document.getElementById('grillaArtistas');
  if (!contenedor) return;

  contenedor.innerHTML = datos.artistas.map(function (a) {
    const cantidad = datos.obras.filter(function (o) { return o.artistaId === a.id; }).length;
    // Instagram del artista (campo opcional "instagram"): solo direcciones http/https
    const instagram = /^https?:\/\//i.test(a.instagram || '') ? a.instagram : '';
    return '<article class="artista" id="' + escaparHTML(a.id) + '">' +
      '<div class="artista__foto">' + htmlImagen(a.foto, 'Foto de ' + a.nombre, a.disciplina) + '</div>' +
      '<h3>' + escaparHTML(a.nombre) + '</h3>' +
      '<p class="artista__disciplina">' + escaparHTML(buscarCategoria(a.disciplina).nombre) + '</p>' +
      '<p class="artista__curso">' + escaparHTML(a.curso) + '</p>' +
      '<p class="artista__bio">' + escaparHTML(a.biografia) + '</p>' +
      '<div class="artista__acciones">' +
      '<a class="btn btn--primario btn--pequeno" href="galeria.html?artista=' + encodeURIComponent(a.id) + '">' +
      '<i class="fa-solid fa-images"></i> Ver obras (' + cantidad + ')</a>' +
      (instagram
        ? '<a class="btn btn--secundario btn--pequeno" href="' + escaparHTML(instagram) + '" target="_blank" rel="noopener noreferrer">' +
          '<i class="fa-brands fa-instagram"></i> Instagram</a>'
        : '') +
      '</div>' +
      '</article>';
  }).join('') || '<p class="vacio">Todavía no hay artistas cargados.</p>';
}

/* ==========================================================================
   Eventos
   ========================================================================== */

function htmlEvento(ev, pasado) {
  const cat = buscarCategoria(ev.categoria);
  return '<li class="evento ' + (pasado ? 'evento--pasado' : 'evento--proximo') + '">' +
    '<p class="evento__fecha"><time datetime="' + escaparHTML(ev.fecha) + '">' + escaparHTML(formatearFecha(ev.fecha)) + '</time></p>' +
    '<h3>' + escaparHTML(ev.titulo) + '</h3>' +
    '<div class="evento__meta">' +
    (ev.hora ? '<span><i class="fa-regular fa-clock"></i>' + escaparHTML(ev.hora) + (/[a-z]/i.test(ev.hora) ? '' : ' h') + '</span>' : '') +
    '<span><i class="fa-solid fa-location-dot"></i>' + escaparHTML(ev.lugar) + '</span>' +
    '<span><i class="fa-solid ' + escaparHTML(cat.icono) + '"></i>' + escaparHTML(cat.nombre) + '</span>' +
    '</div>' +
    '<p>' + escaparHTML(ev.descripcion) + '</p>' +
    '</li>';
}

/**
 * Dibuja la agenda de eventos.
 * opciones.limite  → cantidad máxima de próximos eventos (inicio)
 * opciones.pasados → contenedor para eventos ya realizados (página eventos)
 */
function renderizarEventos(eventos, contenedorProximos, opciones) {
  opciones = opciones || {};
  if (!contenedorProximos) return;

  const hoy = hoySinHora();
  const ordenados = eventos.slice().sort(function (a, b) { return crearFecha(a.fecha) - crearFecha(b.fecha); });
  let proximos = ordenados.filter(function (ev) { return crearFecha(ev.fecha) >= hoy; });
  const pasados = ordenados.filter(function (ev) { return crearFecha(ev.fecha) < hoy; }).reverse();

  if (opciones.limite) proximos = proximos.slice(0, opciones.limite);

  contenedorProximos.innerHTML = proximos.length
    ? proximos.map(function (ev) { return htmlEvento(ev, false); }).join('')
    : '<li class="vacio">No hay eventos próximos programados.</li>';

  if (opciones.pasados) {
    opciones.pasados.innerHTML = pasados.length
      ? pasados.map(function (ev) { return htmlEvento(ev, true); }).join('')
      : '<li class="vacio">Aún no hay eventos realizados este año.</li>';
  }
}

/* ==========================================================================
   Contacto: validación en tiempo real
   ========================================================================== */

// Los mensajes del formulario llegan a este correo (servicio FormSubmit, sin servidor propio)
const CORREO_CONTACTO = 'monserrathcuis16@gmail.com';
const URL_ENVIO_CORREO = 'https://formsubmit.co/ajax/' + CORREO_CONTACTO;

const REGLAS_CONTACTO = {
  nombre: function (v) { return v.trim().length >= 3 ? '' : 'Ingresá tu nombre (mínimo 3 caracteres).'; },
  correo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Ingresá un correo electrónico válido.'; },
  asunto: function (v) { return v.trim() ? '' : 'Seleccioná o escribí un asunto.'; },
  mensaje: function (v) { return v.trim().length >= 20 ? '' : 'El mensaje debe tener al menos 20 caracteres (' + v.trim().length + '/20).'; }
};

/** Valida un campo y muestra el error debajo. Devuelve true si es válido. */
function validarCampo(input) {
  const regla = REGLAS_CONTACTO[input.name];
  if (!regla) return true;

  const error = regla(input.value);
  const campo = input.closest('.campo');
  campo.classList.toggle('invalido', !!error);
  campo.classList.toggle('valido', !error);
  campo.querySelector('.campo__error').textContent = error;
  input.setAttribute('aria-invalid', !!error);
  return !error;
}

/** Valida el formulario completo. Devuelve true si todos los campos son válidos. */
function validarFormulario(formulario) {
  let valido = true;
  Array.from(formulario.elements).forEach(function (input) {
    if (input.name && !validarCampo(input)) valido = false;
  });
  return valido;
}

function iniciarContacto() {
  const formulario = document.getElementById('formContacto');
  const alerta = document.getElementById('alertaContacto');
  if (!formulario) return;

  // Si se llega desde Eventos (contacto.html?asunto=...), el asunto ya aparece completado
  const asuntoInicial = new URLSearchParams(location.search).get('asunto');
  if (asuntoInicial) formulario.asunto.value = asuntoInicial;

  formulario.addEventListener('input', function (e) { validarCampo(e.target); });

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validarFormulario(formulario)) {
      alerta.className = 'alerta alerta--error';
      alerta.textContent = 'Revisá los campos marcados en rojo.';
      formulario.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const datosMensaje = {
      nombre: formulario.nombre.value.trim(),
      correo: formulario.correo.value.trim(),
      asunto: formulario.asunto.value.trim(),
      mensaje: formulario.mensaje.value.trim(),
      fecha: new Date().toISOString()
    };
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    alerta.className = 'alerta';
    alerta.textContent = 'Enviando mensaje…';

    // Sitio estático: el mensaje se envía al correo con el servicio gratuito FormSubmit.
    fetch(URL_ENVIO_CORREO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'Arte San Roque – ' + datosMensaje.asunto,
        _replyto: datosMensaje.correo,
        _template: 'table',
        _captcha: 'false',
        Nombre: datosMensaje.nombre,
        Correo: datosMensaje.correo,
        Asunto: datosMensaje.asunto,
        Mensaje: datosMensaje.mensaje
      })
    })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        return respuesta.json();
      })
      .then(function (resultado) {
        if (String(resultado.success) !== 'true') throw new Error(resultado.message || 'Envío rechazado');
        alerta.className = 'alerta alerta--exito';
        alerta.textContent = '¡Gracias, ' + datosMensaje.nombre + '! Tu mensaje fue enviado correctamente.';
        formulario.reset();
        formulario.querySelectorAll('.campo').forEach(function (c) { c.classList.remove('valido', 'invalido'); });
      })
      .catch(function (error) {
        // Sin conexión u otro error: se guarda una copia local para no perder el mensaje.
        console.warn('No se pudo enviar el mensaje:', error.message);
        const pendientes = Datos.leerPreferencia('mensajesContacto', []);
        pendientes.push(datosMensaje);
        Datos.guardarPreferencia('mensajesContacto', pendientes);
        alerta.className = 'alerta alerta--error';
        alerta.textContent = 'No se pudo enviar el mensaje. Revisá tu conexión e intentá de nuevo, o escribinos a ' + CORREO_CONTACTO + '.';
      })
      .finally(function () { boton.disabled = false; });
  });
}

/* ==========================================================================
   Inicialización
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function () {
  const botonMenu = document.getElementById('menuToggle');
  if (botonMenu) botonMenu.addEventListener('click', toggleMenu);

  marcarEnlaceActivo();
  registrarServiceWorker();

  const anio = document.getElementById('anioActual');
  if (anio) anio.textContent = new Date().getFullYear();

  // Cerrar modales con el botón ×
  document.querySelectorAll('.modal__cerrar').forEach(function (btn) {
    btn.addEventListener('click', function () { btn.closest('dialog').close(); });
  });

  const pagina = document.body.dataset.pagina;
  if (pagina === 'contacto') { iniciarContacto(); return; }

  const datos = await Datos.cargarTodo();
  CATEGORIAS = datos.categorias;
  ARTISTAS = datos.artistas;

  switch (pagina) {
    case 'inicio':
      renderizarDisciplinas();
      cargarDestacados(datos.obras);
      renderizarEventos(datos.eventos, document.getElementById('proximosEventos'), { limite: 3 });
      break;
    case 'galeria':
      iniciarGaleria(datos);
      break;
    case 'artistas':
      renderizarArtistas(datos);
      if (location.hash) {
        const destino = document.querySelector(location.hash);
        if (destino) destino.scrollIntoView();
      }
      break;
    case 'eventos':
      renderizarEventos(datos.eventos, document.getElementById('eventosProximos'), {
        pasados: document.getElementById('eventosPasados')
      });
      break;
  }
});
