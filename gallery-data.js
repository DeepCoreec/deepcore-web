/**
 * =====================================================
 *  GALERÍA DE TRABAJOS — DeepCore
 * =====================================================
 *  Cómo agregar un trabajo nuevo:
 *
 *  1. Pon las fotos en la carpeta  gallery/
 *     Ejemplo:  gallery/laptop-hp-pantalla.jpg
 *
 *  2. Copia el bloque de ejemplo de abajo y rellénalo:
 *     - tag        : etiqueta roja (Laptop, Consola, Web, PC, TV, Software, etc.)
 *     - titulo     : título del trabajo
 *     - descripcion: descripción corta
 *     - fotos      : array con rutas de las fotos.
 *                    Una foto → ["gallery/foto.jpg"]
 *                    Varias   → ["gallery/antes.jpg", "gallery/despues.jpg"]
 *                    Sin foto → []  (aparece placeholder)
 *
 *  3. git add . && git commit -m "galería: nuevo trabajo" && git push origin master
 * =====================================================
 */

const GALLERY_ITEMS = [

  // ── EJEMPLO 1: sin foto todavía ──
  {
    tag:         'Laptop',
    titulo:      'Cambio de pantalla — HP Pavilion',
    descripcion: 'Pantalla rota reemplazada. Equipo listo en 2 horas con garantía.',
    fotos:       [],   // agrega rutas aquí cuando tengas fotos
  },

  // ── EJEMPLO 2: una sola foto ──
  // {
  //   tag:         'Consola',
  //   titulo:      'Reparación PS5 — falla de lectura',
  //   descripcion: 'Lector óptico cambiado. Funcionando perfectamente con 30 días de garantía.',
  //   fotos:       ['gallery/ps5-reparacion.jpg'],
  // },

  // ── EJEMPLO 3: varias fotos (antes/después con flechas) ──
  // {
  //   tag:         'PC',
  //   titulo:      'Limpieza + upgrade SSD — PC escritorio',
  //   descripcion: 'Limpieza profunda y migración a SSD. Arranque pasó de 3 min a 12 seg.',
  //   fotos:       ['gallery/pc-antes.jpg', 'gallery/pc-despues.jpg'],
  // },

  {
    tag:         'Consola',
    titulo:      'Reparación PS5 — falla de lectura',
    descripcion: 'Lector óptico cambiado. Funcionando perfectamente con 30 días de garantía.',
    fotos:       [],
  },

  {
    tag:         'PC',
    titulo:      'Limpieza + upgrade SSD — PC escritorio',
    descripcion: 'Limpieza profunda y migración a SSD. Arranque pasó de 3 min a 12 seg.',
    fotos:       [],
  },

  {
    tag:         'Web',
    titulo:      'Página web — restaurante Guayaquil',
    descripcion: 'Diseño profesional, menú digital y reservas online. Entregada en 5 días.',
    fotos:       [],
  },

  {
    tag:         'Software',
    titulo:      'Sistema de inventario — negocio local',
    descripcion: 'Software con control de stock, ventas y reportes. Entrega en 7 días.',
    fotos:       [],
  },

  {
    tag:         'TV',
    titulo:      'Reparación Smart TV Samsung 55"',
    descripcion: 'Reemplazo de tarjeta de video. TV recuperado vs comprar uno nuevo.',
    fotos:       [],
  },

];
