# Arte Institucional — Colegio Nacional San Roque González de Santacruz

Sitio web estático (HTML5 + CSS3 + JavaScript nativo), sin servidor de aplicaciones ni base de datos remota.

## Estructura

```
codigo/
├── index.html        Inicio: hero, disciplinas, carrusel de destacados, próximos eventos
├── galeria.html      Galería con filtros (disciplina, autor, técnica, año) y ficha técnica
├── artistas.html     Perfiles de artistas → "Ver obras" abre la galería filtrada
├── eventos.html      Agenda en línea de tiempo (próximos / realizados)
├── contacto.html     Formulario con validación en tiempo real y datos institucionales
├── css/estilos.css   Variables de color, Flexbox, Grid, media queries (Mobile First)
├── js/datos.js       Carga de JSON con fetch() + respaldo local + preferencias en LocalStorage
├── js/main.js        toggleMenu, filtrarObras, validarFormulario, cargarDestacados, renderizarEventos
├── data/*.json       Obras, artistas (autores de las obras), eventos y categorías
├── img/              (crear) imágenes de obras y artistas
├── videos/           (crear) videos de las obras (.mp4)
├── pdf/              (crear) documentos PDF de las obras
└── sw.js             Service Worker para uso sin conexión
```

## Cómo ejecutarlo

- **Rápido:** doble clic en `index.html`. Funciona con los datos de respaldo de `js/datos.js`
  (el navegador bloquea `fetch()` de archivos locales).
- **Recomendado:** abrir la carpeta en Visual Studio Code y usar la extensión *Live Server*,
  o publicar en GitHub Pages / Netlify. Así se leen los archivos `data/*.json` y se activa el Service Worker.

## Actualizar contenidos

1. Editar los archivos de `data/` (y copiar lo mismo en `RESPALDO` dentro de `js/datos.js`).
2. Las imágenes van en `img/` y se indican en el campo `imagen`, por ejemplo `"img/obras/atardecer.jpg"`.
   Si el campo está vacío se muestra un marcador con el ícono de la disciplina.
3. Cada obra puede tener además un **video** y un **PDF**:
   - `video`: archivo propio (`"videos/galopera.mp4"`) o enlace de YouTube
     (`"https://www.youtube.com/watch?v=..."`). Duración mínima recomendada: **10 segundos**
     (si es más corto se muestra un aviso en la consola del navegador). Para archivos propios
     conviene MP4 (H.264) y que no pesen demasiado; los videos largos es mejor subirlos a YouTube.
   - `pdf`: archivo PDF (`"pdf/cartas-a-mi-ciudad.pdf"`): poemarios, cuentos, guiones, partituras o catálogos.
   - `enlace` (opcional): dirección `https://` donde se puede ver o leer la obra completa fuera del sitio
     (por ejemplo, una novela en Wattpad). En la ficha aparece un botón que la abre en otra pestaña.
     Conviene pegar el enlace limpio, sin los parámetros de seguimiento (`?utm_source=...`).
   - En la ficha de la obra se muestra primero el formato principal de su disciplina, definido en
     el campo `formatos` de `data/categorias.json`:

     | Disciplina      | Orden de formatos       | Uso típico                          |
     |-----------------|-------------------------|-------------------------------------|
     | Artes plásticas | imagen → video → PDF    | foto de la obra, proceso, catálogo  |
     | Música          | video → imagen → PDF    | presentación, partitura             |
     | Danza           | video → imagen → PDF    | coreografía                         |
     | Teatro          | video → PDF → imagen    | puesta en escena, guion             |
     | Literatura      | PDF → imagen → video    | texto completo, lectura en voz alta |

     Si la obra tiene más de un formato aparecen botones para cambiar entre ellos.
4. `data/artistas.json` alimenta la página de Artistas y el nombre del autor de cada obra
   (campo `artistaId` en `obras.json`). La foto de cada artista va en el campo `foto`.
