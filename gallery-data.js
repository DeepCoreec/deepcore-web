/**
 * =====================================================
 *  GALERÍA — DeepCore
 * =====================================================
 *  Cómo agregar una foto:
 *
 *  1. Crea la carpeta  gallery/  si no existe
 *  2. Pon la foto ahí: ej.  gallery/laptop.jpg
 *  3. Agrega un bloque así:
 *
 *     { foto: 'gallery/laptop.jpg', comentario: 'Tu comentario aquí' },
 *
 *  4. git add . && git commit -m "galería: nueva foto" && git push origin master
 *
 *  Tip: foto vacía ('') → muestra placeholder mientras no tengas la foto lista
 * =====================================================
 */

const GALLERY_ITEMS = [

  {
    foto:       '',
    comentario: 'Cambio de pantalla HP Pavilion — lista en 2 horas ✓',
  },
  {
    foto:       '',
    comentario: 'PS5 con falla de lectura — lector cambiado, garantía 30 días ✓',
  },
  {
    foto:       '',
    comentario: 'Limpieza profunda + SSD — arranque de 3 min pasó a 12 seg ✓',
  },
  {
    foto:       '',
    comentario: 'Smart TV Samsung 55" — tarjeta de video reemplazada ✓',
  },
  {
    foto:       '',
    comentario: 'Página web para restaurante — entregada en 5 días ✓',
  },
  {
    foto:       '',
    comentario: 'Sistema de inventario para negocio local — entregado en 7 días ✓',
  },

];
