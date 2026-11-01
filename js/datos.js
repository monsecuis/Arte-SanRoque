/* ==========================================================================
   datos.js — Gestión de datos del sitio (arquitectura de dos niveles)

   Nivel 1: Datos semiestáticos en archivos JSON (carpeta data/),
            cargados con fetch(). Si fetch falla (sin red, o la página se
            abrió con doble clic desde file://) se usan los datos de
            RESPALDO incluidos abajo.
   Nivel 2: Datos del usuario en LocalStorage (filtro elegido en la
            galería y mensajes del formulario de contacto).

   IMPORTANTE: si se editan los archivos JSON, conviene copiar el mismo
   contenido en RESPALDO para que el sitio funcione también sin servidor.
   ========================================================================== */

'use strict';

const Datos = (function () {
  const RUTA_DATOS = 'data/';
  const COLECCIONES = ['obras', 'artistas', 'eventos', 'categorias'];

  /* Copia local de data/*.json usada como respaldo (fallback) */
  const RESPALDO = {
    categorias: [
      { "id": "artes-plasticas", "nombre": "Artes plásticas", "icono": "fa-palette", "formatos": ["imagen", "video", "pdf"] },
      { "id": "musica", "nombre": "Música", "icono": "fa-music", "formatos": ["video", "imagen", "pdf"] },
      { "id": "danza", "nombre": "Danza", "icono": "fa-shoe-prints", "formatos": ["video", "imagen", "pdf"] },
      { "id": "teatro", "nombre": "Teatro", "icono": "fa-masks-theater", "formatos": ["video", "pdf", "imagen"] },
      { "id": "literatura", "nombre": "Literatura", "icono": "fa-book-open", "formatos": ["pdf", "imagen", "video"] }
    ],
    artistas: [
      {
        "id": "a6",
        "nombre": "Melanny Abigail Duarte Martínez",
        "disciplina": "danza",
        "curso": "8.º grado",
        "biografia": "Bailarina desde los 7 años; nació el 29 de enero de 2013. Cursa el 6.º año en la academia Bailares School of Dance y forma parte del elenco de danza del colegio. Ha concursado en varios certámenes nacionales e internacionales, llevando su talento, disciplina y entusiasmo a cada escenario.",
        "foto": "img/artistas/melanny-duarte.jpg"
      },
      {
        "id": "a7",
        "nombre": "Marian Nicole Espínola Varela",
        "disciplina": "danza",
        "curso": "8.º grado, sección A – Turno mañana",
        "biografia": "Nacida en Coronel Oviedo en 2012, integra el Elenco SanRo Jeroky desde 2025. Cursa el Profesorado en Danza en la Escuela Municipal de Danza de Coronel Oviedo y es miembro del Elenco Municipal de Danza de la ciudad. Es apasionada por la danza y el dibujo.",
        "foto": "img/artistas/marian-espinola.jpg"
      },
      {
        "id": "a8",
        "nombre": "Julieta Azucena Arami Oviedo",
        "disciplina": "danza",
        "curso": "1.er año – Bachillerato Científico con Énfasis en Ciencias Sociales",
        "biografia": "Integra el Elenco SanRo Jeroky desde el 7.º grado. Ganadora del 1.er puesto en la categoría Estilización del Concurso Nacional Danzares 2025. Alumna de la Escuela Municipal de Danza de Cnel. Oviedo, donde cursa el 1.er año del Profesorado Superior en Danza Paraguaya, Clásica y Española.",
        "foto": "img/artistas/julieta-oviedo.jpg"
      },
      {
        "id": "a9",
        "nombre": "Santiago Josué Ortiz González",
        "disciplina": "danza",
        "curso": "1.er año – Bachillerato Técnico en Informática",
        "biografia": "Nació en Coronel Oviedo el 1 de diciembre de 2010. Comenzó sus estudios de danza en la Casa de la Cultura. Forma parte del Elenco SanRo Jeroky desde 2024 y también del Elenco Municipal de Danza de Coronel Oviedo.",
        "foto": "img/artistas/santiago-ortiz.jpg"
      },
      {
        "id": "a10",
        "nombre": "José Alexander Nahuel Cáceres Cáceres",
        "disciplina": "danza",
        "curso": "8.º grado, sección A – Turno mañana",
        "biografia": "Bailarín y músico de 13 años. Estudia zapateo y los profesorados de música, canto y guitarra en la Escuela Municipal de Cnel. Oviedo. Representó al colegio en el Concurso Internacional Danzarte 2026 (Villarrica) y obtuvo el 1.er puesto en cuarteto masculino. Integra el Elenco SanRo Jeroky y la delegación artística de la Municipalidad de Cnel. Oviedo. Finalista del Concurso Ñe'ê ry 2026 con el poema \"Mi reflejo\".",
        "foto": "img/artistas/jose-caceres.jpg"
      },
      {
        "id": "a11",
        "nombre": "Margareth Magali Corrales Ortellado",
        "disciplina": "danza",
        "curso": "7.º grado, sección B – Turno mañana",
        "biografia": "Nació el 20 de febrero de 2014. Estudia en la academia Bailares School of Dance by Milagros Corrales danza clásica, paraguaya, española, árabe, acrodance y jazz, y es parte del elenco de la academia. Participó en varios concursos nacionales e internacionales obteniendo el primer puesto. Este año integra también el Elenco SanRo Jeroky.",
        "foto": "img/artistas/margareth-corrales.jpg"
      },
      {
        "id": "a12",
        "nombre": "Karen Jazmín Arias Pereira",
        "disciplina": "danza",
        "curso": "1.er año – Bachillerato Técnico en Informática",
        "biografia": "Nació en Coronel Oviedo el 2 de abril de 2011. Empezó la danza en la academia Bailares School of Dance (1.º a 3.er curso) y hoy cursa el 6.º año del Profesorado de Danza en la Escuela Municipal de Danzas de Coronel Oviedo. Integra el Elenco SanRo Jeroky desde 2023 y el Elenco Municipal de Cnel. Oviedo. Participó con éxito en concursos con cántaros, cantarillas y botellas.",
        "foto": "img/artistas/karen-arias.jpg"
      },
      {
        "id": "a13",
        "nombre": "Brahiam Samuel Barreto Franco",
        "disciplina": "danza",
        "curso": "7.º grado, sección A – Turno tarde",
        "biografia": "Nació en Coronel Oviedo en 2013. Desde este año forma parte del Elenco SanRo Jeroky. En agosto participó en el Concurso Internacional de Danza \"Danzarte\" (Villarrica del Espíritu Santo), donde obtuvo el 1.er puesto en la categoría Cuarteto. Estudia zapateo en la Escuela Municipal de Danza y es integrante del Elenco Municipal de Danza de Coronel Oviedo.",
        "foto": "img/artistas/brahiam-barreto.jpg"
      },
      {
        "id": "a14",
        "nombre": "Tobías Gabriel Rojas Román",
        "disciplina": "danza",
        "curso": "9.º grado, sección A – Turno tarde",
        "biografia": "Nació el 13 de agosto de 2011 en Coronel Oviedo e integra el Elenco SanRo Jeroky desde 2024. En agosto participó en el Concurso Internacional de Danza \"Danzarte\" (Villarrica del Espíritu Santo), donde obtuvo el 1.er puesto en Cuarteto. Estudia zapateo y distintas modalidades de danza en la Escuela Municipal de Danza y es integrante del Elenco Municipal de Danza de Coronel Oviedo.",
        "foto": "img/artistas/tobias-rojas.jpg"
      },
      {
        "id": "a15",
        "nombre": "Fabiana Verenise Cantero López",
        "disciplina": "literatura",
        "curso": "9.º grado, sección A – Turno tarde",
        "biografia": "Tiene 14 años; nació el 24 de enero de 2012 en Coronel Oviedo. Completó su formación desde el jardín de infantes hasta el segundo ciclo en la Escuela Dr. Pedro P. Peña, conocida como «Repollito». Finalista del Concurso Ñe'ẽry 2026 con el poema «Che Symi Porã».",
        "foto": "img/artistas/fabiana-cantero.jpg"
      },
      {
        "id": "a16",
        "nombre": "Alvaro Josué Guerrero Venialgo",
        "disciplina": "literatura",
        "curso": "8.º grado",
        "biografia": "Tiene 13 años; nació el 16 de enero de 2013 en Asunción y vive en Coronel Oviedo. Cursó la primaria en el Centro Educacional Betel. Es autodidacta y dibuja desde pequeño: empezó con los superhéroes y, al adentrarse en el mundo de los cómics, nació «El Monstruo del Pantano», obra reconocida por la Gobernación del V Departamento de Caaguazú por su aporte artístico y de concienciación ambiental. Dibuja y escribe.",
        "foto": "img/artistas/alvaro-guerrero.jpg"
      },
      {
        "id": "a17",
        "nombre": "Elenco SanRo Jeroky",
        "disciplina": "danza",
        "curso": "Elenco de danza folklórica – integrantes de distintos grados y cursos",
        "biografia": "Nació como un proyecto escolar para dar visibilidad al potencial artístico de los distintos grados, impulsado por las alumnas Soledad Escobar y Angélica Ortiz junto a la Lic. Liliana Insfrán. Su nombre se presentó oficialmente el 22 de agosto de 2023, en el Día del Folclore del colegio. Ese mismo mes se presentó en el programa Oviedo y Cultura y luego participó en la FESO. Hoy, coordinado por la Lic. Liliana Insfrán, el elenco trasciende generaciones manteniendo vivas nuestras raíces folclóricas y dejando en alto a la institución.",
        "foto": "img/artistas/elenco-sanro-jeroky.jpg"
      },
      {
        "id": "a18",
        "nombre": "Camila Aylen Cristaldo Aquino",
        "disciplina": "artes-plasticas",
        "curso": "9.º grado – Turno tarde",
        "biografia": "Nació en Coronel Oviedo el 30 de mayo de 2011. Inició el nivel inicial en la escuela Adolfo Kolping y cursó el 1.er y 2.º ciclo de la EEB en la escuela Wenceslaa Escalada. Su lema: «No tengas miedo a mancharte, ten miedo a irte sin haber pintado».",
        "foto": "img/artistas/camila-cristaldo.jpg"
      },
      {
        "id": "a19",
        "nombre": "Brenda Nicole Cohene Britos",
        "disciplina": "literatura",
        "curso": "8.º grado, sección B – Turno mañana",
        "biografia": "Tiene 13 años. Completó su formación desde el preescolar hasta el final del segundo ciclo de la EEB en la Escuela Básica N.º 1407 Amigos de las Américas. Con el poema «Preciosa Kyra» fue finalista del Concurso Ñe'ê ry 2026 y ganadora del primer puesto; representando al colegio en la etapa departamental obtuvo el segundo puesto. También estudia danza en la Escuela Municipal de Danza en Nueva Londres.",
        "foto": "img/artistas/brenda-cohene.jpg"
      },
      {
        "id": "a20",
        "nombre": "Lucas Fabrizio Ferreira Rotela",
        "disciplina": "literatura",
        "curso": "2.º año – Bachillerato Técnico en Informática – Turno mañana",
        "biografia": "Nació el 6 de septiembre de 2009 (17 años). Completó la EEB hasta el segundo ciclo en el Centro Cristiano Educacional Betel N.º 3744. Mejor alumno y estudiante destacado en lo académico, cultural y deportivo. Con el material audiovisual «Coronel» fue finalista del Concurso Ñe'ê ry 2026 y obtuvo el 3.er puesto. Como diseñador creó las remeras de la hinchada del colegio para los juegos estudiantiles de la FESO. Representa al colegio en natación y básquetbol, y a Coronel Oviedo en natación, donde fue varias veces campeón regional y nacional.",
        "foto": "img/artistas/lucas-ferreira.jpg"
      },
      {
        "id": "a21",
        "nombre": "Isaías Sebastián Mereles Coronel",
        "disciplina": "musica",
        "curso": "2.º año – Bachillerato Científico con Énfasis en Ciencias Sociales",
        "biografia": "Nació el 22 de septiembre de 2009 (17 años). Completó la formación básica hasta el 6.º grado en la Escuela Básica N.º 6017 Dr. Pedro P. Peña «Repollito». Baterista: cursa el 5.º año del Profesorado con énfasis en Batería, el 4.º año de Lenguaje Musical y el 3.er año del Profesorado con énfasis en Guitarra Popular. Participó en giras internacionales con orquestas filarmónicas y corales representando a Coronel Oviedo y Paraguay. Medallista de la OMAPA a nivel nacional (2022, 2024 y 2025) y finalista del Concurso Ñe'ê ry con el audiovisual «Mi Barrio» (3.er puesto). Completó el módulo Avanzado Superior 2 (AS2) en el CCPA y es voluntario en organizaciones benéficas.",
        "foto": "img/artistas/isaias-mereles.jpg",
        "instagram": "https://www.instagram.com/sebasmdrums"
      },
      {
        "id": "a22",
        "nombre": "Luciana Taís Ovelar Orquiola",
        "disciplina": "musica",
        "curso": "2.º año – Bachillerato Técnico en Informática – Turno mañana",
        "biografia": "Nació el 12 de mayo de 2010. Cantante y profesora de canto en formación: elabora su tesis para culminar la carrera de Canto Popular y cursa el Profesorado de Guitarra. Integra el Coro Municipal, con el que representó a Paraguay en Argentina, Chile y Brasil. En 2026 ganó el Concurso Ñe'ê ry en su institución con el audiovisual «Música y Cultura» y se clasificó a la fase 3. Representa al colegio en canto y básquetbol, y se desempeña como community manager.",
        "foto": "img/artistas/luciana-ovelar.jpg"
      },
      {
        "id": "a23",
        "nombre": "Bethania Noemí Escobar Mendoza",
        "disciplina": "literatura",
        "curso": "3.er año – Bachillerato Técnico en Informática – Turno mañana",
        "biografia": "Nació el 4 de abril de 2009 (17 años). Estudió en la Escuela Básica N.º 4781 «Carmen Marci Fossati de Flores» y en la Escuela Básica N.º 698 «Wenceslaa Escalada». Finalista del Concurso Ñe'ê ry 2026 (2.º puesto). Estudiante distinguida, destacada en el ámbito cultural y en aprendizaje-servicio e investigación. Representó al colegio en la «Justa del Saber» de la FESO (2022), fue «Directora por un día» en 2017 y 2018, y es vicepresidenta de curso en la Educación Media.",
        "foto": "img/artistas/bethania-escobar.jpg"
      },
      {
        "id": "a24",
        "nombre": "Lic. Perla Rocío Bobadilla Iglesias",
        "disciplina": "artes-plasticas",
        "curso": "Docente de Artes – Especialidad en Creatividad Plástica",
        "biografia": "Docente de Artes del colegio, nacida en Coronel Oviedo y egresada de esta misma institución (Bachiller 2005). Profesora de Dibujo y Pintura y de Artes Plásticas (IBA Emmanuel), Licenciada y Magíster en Ciencias de la Educación (ISE Santo Tomás) y Técnica Docente en Gestión Educativa (IFD). Destacada a nivel nacional en creatividad plástica, participó en proyectos como «Pintemos el Mañana» en la Plaza Amistad (2024), el Festival Audiovisual Internacional y las Escuelas Abiertas Vy'a Renda del MEC. Actualmente también enseña en el Colegio 12 de Junio – Centro N.º 90 Penitenciaría.",
        "foto": "img/artistas/perla-bobadilla.jpg"
      },
      {
        "id": "a25",
        "nombre": "Jhonny Salvador Franco Maciel",
        "disciplina": "literatura",
        "curso": "8.º grado – Educación Escolar Básica",
        "biografia": "Joven escritor de Coronel Oviedo, departamento de Caaguazú. Comenzó a escribir a principios de 2026 y desarrolla su primera novela, «Resurrección a 400 años luz», de ciencia ficción. Su inspiración nace de una sensación de vacío que busca llenar expresando las grandes historias que guarda su imaginación. Le gustan los videojuegos, la lectura, crear mundos fantásticos con Dungeons & Dragons, pasar tiempo con su familia y las series y películas de ficción, y estudia escritura para mejorar en cada palabra. Su objetivo es que su obra sea conocida y crezca más allá de su idea original.",
        "foto": "img/artistas/jhonny-franco.jpg"
      },
      {
        "id": "a26",
        "nombre": "Sofía Anabella Guerrero Venialgo",
        "disciplina": "literatura",
        "curso": "9.º grado",
        "biografia": "Tiene 14 años; nació el 5 de noviembre de 2011 en Asunción y vive en Coronel Oviedo. Le gusta escribir, crear, dibujar y el reciclaje. Su técnica es la escritura creativa a mano: en 2024, cuando cursaba el 7.º grado, escribió e ilustró el cuento «Los Gatos Guerreros y el V Clan» para el Programa Nacional de Lectura, Escritura y Oralidad.",
        "foto": "img/artistas/sofia-guerrero.jpg"
      },
      {
        "id": "a27",
        "nombre": "Antonela Paniagua",
        "disciplina": "literatura",
        "curso": "3.er año – Bachillerato Científico con Énfasis en Ciencias Sociales",
        "biografia": "Estudiante apasionada por la escritura. Cuenta con varios ensayos publicados en KidSpirit, una revista digital escrita por y para jóvenes de distintas partes del mundo, donde comparte sus reflexiones e ideas. Para ella, escribir es una forma de ordenar lo que piensa, mirar el mundo con otros ojos y dar voz a su generación.",
        "foto": "img/artistas/antonela-paniagua.jpg"
      }
    ],
    obras: [
      {
        "id": "o9",
        "titulo": "El Monstruo del Pantano – Blanco, Negro, Verde y Rojo",
        "artistaId": "a16",
        "categoria": "literatura",
        "tecnica": "Dibujo a mano con lápices y pinceles sobre papel de dibujo",
        "dimensiones": "Tamaño oficio",
        "anio": 2026,
        "descripcion": "Cómic que nos regala un poderoso mensaje de paz y un llamado urgente a la reforestación y el cuidado del planeta. El personaje sostiene una rosa roja como símbolo de esperanza.",
        "imagen": "img/obras/monstruo-del-pantano.jpg",
        "video": "",
        "pdf": "",
        "destacada": true
      },
      {
        "id": "o10",
        "titulo": "Sin título",
        "artistaId": "a18",
        "categoria": "artes-plasticas",
        "tecnica": "Pintura sobre lienzo",
        "dimensiones": "Sin especificar",
        "anio": 2026,
        "descripcion": "Paisaje campestre: un árbol de flores amarillas, una casita blanca, una palmera y un camino de tierra bajo un cielo azul al atardecer.",
        "imagen": "img/obras/paisaje-camila-cristaldo.jpg",
        "video": "",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o11",
        "titulo": "Acto del colegio en los Juegos Estudiantiles FESO",
        "artistaId": "a17",
        "categoria": "danza",
        "tecnica": "Danza folklórica paraguaya",
        "dimensiones": "0:30 min (fragmento)",
        "anio": 2026,
        "descripcion": "Presentación del Elenco SanRo Jeroky realizada como acto del Colegio Nacional San Roque González de Santacruz en los Juegos Estudiantiles FESO 2026. Fragmento de 30 segundos de la presentación.",
        "imagen": "img/obras/acto-feso-2026.jpg",
        "video": "videos/acto-feso-2026.mp4",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o12",
        "titulo": "Preciosa Kyra",
        "artistaId": "a19",
        "categoria": "literatura",
        "tecnica": "Poesía",
        "dimensiones": "4 estrofas",
        "anio": 2026,
        "descripcion": "Poema dedicado a Kyra, su fiel compañera de cuatro patas, que celebra la ternura y el amor de una mascota. Finalista del Concurso Ñe'ê ry 2026.",
        "imagen": "img/obras/preciosa-kyra.jpg",
        "video": "",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o13",
        "titulo": "Mi reflejo",
        "artistaId": "a10",
        "categoria": "literatura",
        "tecnica": "Poesía",
        "dimensiones": "6 estrofas",
        "anio": 2026,
        "descripcion": "Poema sobre los miedos de crecer frente al espejo y el coraje de enfrentarlos para convertirse cada día en una mejor versión de sí mismo. Finalista del Concurso Ñe'ê ry 2026.",
        "imagen": "img/obras/mi-reflejo.jpg",
        "video": "",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o14",
        "titulo": "Danza de la botella – Desfile Estudiantil en Homenaje a la Patria",
        "artistaId": "a17",
        "categoria": "danza",
        "tecnica": "Danza folklórica paraguaya",
        "dimensiones": "Fotografía",
        "anio": 2026,
        "descripcion": "Las bailarinas del Elenco SanRo Jeroky desfilan con botellas sobre la cabeza y polleras celestes en el Desfile Estudiantil en Homenaje a la Patria.",
        "imagen": "img/obras/desfile-patria-2026-botellas.jpg",
        "video": "",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o15",
        "titulo": "El elenco en el Desfile Estudiantil en Homenaje a la Patria",
        "artistaId": "a17",
        "categoria": "danza",
        "tecnica": "Danza folklórica paraguaya",
        "dimensiones": "Fotografía",
        "anio": 2026,
        "descripcion": "Foto grupal del Elenco SanRo Jeroky con trajes típicos paraguayos durante el Desfile Estudiantil en Homenaje a la Patria.",
        "imagen": "img/obras/desfile-patria-2026-elenco.jpg",
        "video": "",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o16",
        "titulo": "El legado del último latido",
        "artistaId": "a24",
        "categoria": "teatro",
        "tecnica": "Cortometraje",
        "dimensiones": "8:48 min",
        "anio": 2025,
        "descripcion": "Cortometraje realizado por los estudiantes del 2.º BCCS en 2025, bajo la guía de la profesora de Artes Perla Rocío Bobadilla Iglesias. Fue filmado en exteriores y en la capilla San Roque González de Santacruz.",
        "imagen": "img/obras/el-legado-del-ultimo-latido.jpg",
        "video": "videos/el-legado-del-ultimo-latido.mp4",
        "pdf": "",
        "destacada": true
      },
      {
        "id": "o17",
        "titulo": "Uña de Gato",
        "artistaId": "a24",
        "categoria": "teatro",
        "tecnica": "Cortometraje",
        "dimensiones": "10:49 min",
        "anio": 2023,
        "descripcion": "Cortometraje realizado por los estudiantes del 1.º BTI del turno tarde en 2023, bajo la guía de la profesora de Artes Perla Rocío Bobadilla Iglesias.",
        "imagen": "img/obras/una-de-gato.jpg",
        "video": "videos/una-de-gato.mp4",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o18",
        "titulo": "Resurrección a 400 años luz",
        "artistaId": "a25",
        "categoria": "literatura",
        "tecnica": "Novela de ciencia ficción",
        "dimensiones": "En desarrollo: 10 de 52 capítulos",
        "anio": 2026,
        "descripcion": "«Una misión forzada. 20 almas rotas.» Novela de ciencia ficción que nace del deseo del autor de dar vida a las grandes historias de su imaginación y compartirlas con otras personas. Está planificada en 52 capítulos, de los cuales lleva 10 escritos. Es su primera obra y el comienzo de su camino como escritor.",
        "imagen": "img/obras/resurreccion-400-anos-luz.jpg",
        "video": "",
        "pdf": "",
        "enlace": "https://www.wattpad.com/story/416100241",
        "destacada": true
      },
      {
        "id": "o19",
        "titulo": "Los Gatos Guerreros y el V Clan",
        "artistaId": "a26",
        "categoria": "literatura",
        "tecnica": "Escritura creativa a mano",
        "dimensiones": "Cuento ilustrado de 6 páginas",
        "anio": 2024,
        "descripcion": "Cuento escrito e ilustrado a mano para el Programa Nacional de Lectura, Escritura y Oralidad. Narra la historia de Zarpa de Fuego, un joven aprendiz del Clan del Trueno que, junto a su mentor Relámpago Gris y a Oliver, un gato doméstico que se une al clan como Huracán Gris, enfrenta la amenaza del Clan de la Sangre hasta convertirse en héroe y líder de su clan.",
        "imagen": "img/obras/los-gatos-guerreros.jpg",
        "video": "",
        "pdf": "pdf/los-gatos-guerreros.pdf",
        "destacada": false
      },
      {
        "id": "o20",
        "titulo": "Diversos cuadros pintados por alumnos del 9.º turno tarde",
        "artistaId": "a24",
        "categoria": "artes-plasticas",
        "tecnica": "Acrílico",
        "dimensiones": "Video de 1:13 min",
        "anio": 2026,
        "descripcion": "Recorrido en video por los cuadros en acrílico pintados por los alumnos del 9.º grado «A» del turno tarde y exhibidos en su stand «Brilla con luz propia». Entre las obras hay paisajes al atardecer, un guacamayo, un lapacho en flor, nenúfares, peces koi, tulipanes y una versión de «La noche estrellada» de Van Gogh.",
        "imagen": "img/obras/cuadros-9-tarde-2026.jpg",
        "video": "videos/cuadros-9-tarde-2026.mp4",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o21",
        "titulo": "Mi camino",
        "artistaId": "a27",
        "categoria": "literatura",
        "tecnica": "Ensayo personal",
        "dimensiones": "Publicado en línea (en inglés: «My Path»)",
        "anio": 2025,
        "descripcion": "Ensayo publicado en la revista KidSpirit, en el número «Ripple Effects» (septiembre de 2025). La autora cuenta cómo una decisión que creyó correcta la llevó a alejarse de los demás y a sentirse sola, y cómo animarse a pedir ayuda fue su punto de inflexión: aprendió a quererse y aceptarse, a valorar a quienes la rodean y a ser más compasiva, porque nunca sabemos qué batallas internas libra cada persona.",
        "imagen": "img/obras/kidspirit-mi-camino.jpg",
        "video": "",
        "pdf": "",
        "enlace": "https://www.kidspiritonline.com/magazine/ripple-effects/my-path/",
        "destacada": false
      },
      {
        "id": "o22",
        "titulo": "La voz de los futuros líderes",
        "artistaId": "a27",
        "categoria": "literatura",
        "tecnica": "Ensayo",
        "dimensiones": "Publicado en línea (en inglés: «The Voice of Future Leaders»)",
        "anio": 2025,
        "descripcion": "Ensayo publicado en la sección «Global Beat» de KidSpirit (diciembre de 2025), dentro del tema «Diálogo entre generaciones». A partir de su propia experiencia (escribir para la revista, el consejo estudiantil de su colegio y su servicio como catequista), reflexiona sobre los espacios que hoy tienen los jóvenes para liderar y ser escuchados, y sobre la esperanza de ofrecer aún más oportunidades a las próximas generaciones para construir una sociedad más justa, inclusiva y compasiva.",
        "imagen": "img/obras/kidspirit-la-voz-de-los-futuros-lideres.jpg",
        "video": "",
        "pdf": "",
        "enlace": "https://www.kidspiritonline.com/explore/global-beat/the-voice-of-future-leaders/",
        "destacada": false
      },
      {
        "id": "o23",
        "titulo": "El poder de tu mente",
        "artistaId": "a27",
        "categoria": "literatura",
        "tecnica": "Poesía",
        "dimensiones": "Publicado en línea (en inglés: «The Power of Your Mind»)",
        "anio": 2025,
        "descripcion": "Poema publicado en la revista KidSpirit, en el número «State of Mind» (abril de 2025). Invita a dejar de vivir atrapados en el pasado o en lo que podría ser y a valorar el presente: los pensamientos pueden destruir o sanar, y está en cada uno elegir dónde pone su atención.",
        "imagen": "img/obras/kidspirit-el-poder-de-tu-mente.jpg",
        "video": "",
        "pdf": "",
        "enlace": "https://www.kidspiritonline.com/magazine/state-of-mind/the-power-of-your-mind/",
        "destacada": false
      },
      {
        "id": "o24",
        "titulo": "Danza paraguaya en pareja",
        "artistaId": "a17",
        "categoria": "danza",
        "tecnica": "Danza folklórica paraguaya",
        "dimensiones": "2:30 min",
        "anio": 2026,
        "descripcion": "Una pareja del Elenco SanRo Jeroky interpreta una danza folklórica paraguaya en un salón decorado con globos celestes, blancos y negros, ante el público. Ella luce pollera celeste con volados y blusa de encaje; él, sombrero pirí, camisa a cuadros, faja y bombachas. Con giros y vueltas de pollera, la coreografía muestra la alegría y la complicidad del baile tradicional.",
        "imagen": "img/obras/elenco-danza-en-pareja-2026.jpg",
        "video": "videos/elenco-danza-en-pareja-2026.mp4",
        "pdf": "",
        "destacada": false
      },
      {
        "id": "o25",
        "titulo": "Entrada del elenco en los Juegos Estudiantiles FESO",
        "artistaId": "a17",
        "categoria": "danza",
        "tecnica": "Danza folklórica paraguaya",
        "dimensiones": "0:19 min",
        "anio": 2026,
        "descripcion": "Ingreso del Elenco SanRo Jeroky a la cancha en los Juegos Estudiantiles FESO 2026, como parte del acto del Colegio Nacional San Roque González de Santacruz. Las parejas avanzan con trajes típicos detrás de la bandera paraguaya, que flamea al frente, y ocupan sus lugares frente al escenario para comenzar la presentación.",
        "imagen": "img/obras/entrada-feso-2026.jpg",
        "video": "videos/entrada-feso-2026.mp4",
        "pdf": "",
        "destacada": false
      }
    ],
    eventos: [
      {
        "id": "e1",
        "titulo": "Muestras artísticas por el Día del Folklore",
        "fecha": "2026-08-04",
        "hora": "8:00 a.m.",
        "lugar": "Colegio San Roque González",
        "categoria": "danza",
        "descripcion": "Presentaciones de danzas folklóricas paraguayas en conmemoración del Día del Folklore."
      },
      {
        "id": "e4",
        "titulo": "Leyenda viva del Paraguay",
        "fecha": "2026-10-17",
        "hora": "8:00 p.m.",
        "lugar": "Salón Thunder Eventos",
        "categoria": "teatro",
        "descripcion": "Presentación de cortometrajes sobre leyendas paraguayas realizados por los estudiantes del 2.º BCCS, a cargo de la profesora de Artes Perla Rocío Bobadilla. Se votará el mejor cortometraje 2026. Entrada totalmente gratis."
      },
      {
        "id": "e2",
        "titulo": "Expo SanRo",
        "fecha": "2026-10-28",
        "hora": "8:00 a.m.",
        "lugar": "Polideportivo de la institución",
        "categoria": "artes-plasticas",
        "descripcion": "Exposición de obras de artes plásticas realizadas por los estudiantes."
      },
      {
        "id": "e3",
        "titulo": "FESTI SanRo",
        "fecha": "2026-11-04",
        "hora": "7:00 p.m.",
        "lugar": "Cerrito cerrado",
        "categoria": "danza",
        "descripcion": "Festival de danza con presentaciones de los estudiantes del colegio."
      }
    ]
  };

  const cache = {};   // evita volver a descargar un JSON ya cargado

  /** Devuelve una copia profunda para no modificar los originales por accidente. */
  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  /** Descarga un archivo JSON (Nivel 1) con manejo de errores y respaldo. */
  async function cargar(nombre) {
    if (cache[nombre]) return copiar(cache[nombre]);

    try {
      const respuesta = await fetch(RUTA_DATOS + nombre + '.json', { cache: 'no-cache' });
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      cache[nombre] = await respuesta.json();
    } catch (error) {
      console.warn('No se pudo cargar ' + nombre + '.json, se usan datos locales de respaldo.', error.message);
      cache[nombre] = RESPALDO[nombre] || [];
    }
    return copiar(cache[nombre]);
  }

  /** Carga todas las colecciones en paralelo. */
  async function cargarTodo() {
    const listas = await Promise.all(COLECCIONES.map(cargar));
    const datos = {};
    COLECCIONES.forEach(function (nombre, i) { datos[nombre] = listas[i]; });
    return datos;
  }

  /* ---- Preferencias del usuario (filtros, etc.) ---- */
  function guardarPreferencia(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  }

  function leerPreferencia(clave, porDefecto) {
    try {
      const texto = localStorage.getItem(clave);
      return texto ? JSON.parse(texto) : porDefecto;
    } catch (e) {
      return porDefecto;
    }
  }

  return {
    cargar: cargar,
    cargarTodo: cargarTodo,
    guardarPreferencia: guardarPreferencia,
    leerPreferencia: leerPreferencia
  };
})();
