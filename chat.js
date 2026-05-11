// =============================================
// DeepCore Chat — Alisson Web v3.0
// =============================================

// ── CLAUDE API ── llamadas van al proxy seguro en Railway (alisson-voz-server)
// La API key vive en variables de entorno de Railway, nunca en el frontend
const CHAT_PROXY_URL = 'https://alisson-voz-server-production.up.railway.app/chat';
const CLAUDE_API_KEY = true; // Modo Claude activo — la key real vive en Railway

// Historial de conversación para contexto
let conversationHistory = [];

// ── Control de audio activo (evita dos voces al mismo tiempo) ──
let _audioActual = null;

// ── VOZ ALISSON ──
window.alissonVozActiva = localStorage.getItem('alissonVoz') !== 'off';

async function hablarAlisson(texto) {
  if (!window.alissonVozActiva) return;
  // Detener cualquier audio activo antes de iniciar uno nuevo
  window.speechSynthesis.cancel();
  if (_audioActual) { _audioActual.pause(); _audioActual = null; }
  try {
    const resp = await fetch(
      'https://alisson-voz-server-production.up.railway.app/tts',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({texto: texto}),
        signal: AbortSignal.timeout(10000)
      }
    );
    if (resp.ok) {
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      _audioActual = new Audio(url);
      _audioActual.onended = () => { URL.revokeObjectURL(url); _audioActual = null; };
      await _audioActual.play();
      return;
    }
  } catch(e) {}
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-ES';
  u.rate = 0.92;
  u.pitch = 1.05;
  await new Promise(r => {
    setTimeout(() => {
      const voces = window.speechSynthesis.getVoices();
      const voz = voces.find(v => v.name.includes('Elvira')) ||
                  voces.find(v => v.name.includes('Monica')) ||
                  voces.find(v => v.lang === 'es-ES');
      if (voz) u.voice = voz;
      window.speechSynthesis.speak(u);
      u.onend = r;
    }, 100);
  });
}

async function actualizarEstadoVoz() {
  const btn = document.getElementById('btn-toggle-voz');
  if (!btn) return;
  btn.title = 'ElviraNeural (Railway)';
  btn.style.color = '#e94560';
}
setTimeout(actualizarEstadoVoz, 1500);

function toggleVozAlisson() {
  window.alissonVozActiva = !window.alissonVozActiva;
  localStorage.setItem('alissonVoz', window.alissonVozActiva ? 'on' : 'off');
  const tog = document.getElementById('toggle-voz');
  if (tog) {
    tog.textContent = window.alissonVozActiva ? '🔊 Voz: ON' : '🔇 Voz: OFF';
    tog.style.color = window.alissonVozActiva ? '#e94560' : '#888';
  }
  const btn = document.getElementById('dcVozBtn');
  if (btn) btn.style.opacity = window.alissonVozActiva ? '1' : '0.4';
}

// ── BASE DE CONOCIMIENTO ──
const DC_KB = [
  {
    id: 'saludo',
    patterns: ['hola','buenas','hey','saludos','buenos dias','buenas tardes','buenas noches','hi','ola','buen dia','que tal','como estas','como estan'],
    replies: [
      `¡Hola! 👋 Bienvenido a **DeepCore**.\n\nSoy **Alisson**, la IA de DeepCore. Puedo ayudarte con precios, servicios, horarios y más. ¿En qué te puedo ayudar hoy?`,
      `¡Buenas! 😊 Gracias por contactar a **DeepCore**.\n\n¿Tienes algún equipo dañado, un proyecto en mente, o quieres saber más sobre nuestros servicios?`,
      `¡Hola! Estoy aquí para ayudarte. En DeepCore manejamos reparaciones, software y mucho más. ¿Por dónde empezamos?`
    ],
    options: ['Ver servicios', '¿Cuánto cuesta?', '¿Dónde están?', 'Hablar con un asesor'],
    context: 'inicio'
  },
  {
    id: 'identidad',
    patterns: ['como te llamas','quien eres','tu nombre','eres una ia','eres un bot','eres robot','eres humano','que eres','nombre del asistente','como se llama el asistente','presentate','presentación'],
    replies: [
      `¡Hola! Soy **Alisson** 💙, la inteligencia artificial integrada en **DeepCore**.\n\nEstoy aquí para ayudarte con precios, servicios, reparaciones y mucho más. ¿En qué te puedo ayudar?`,
      `Me llamo **Alisson** 😊, soy la IA oficial de **DeepCore**.\n\nPuedo responderte sobre reparaciones, software, precios y servicios. ¿Qué necesitas?`,
    ],
    options: ['Ver servicios', '¿Cuánto cuesta?', 'Hablar con un asesor'],
    context: 'identidad'
  },
  {
    id: 'servicios',
    patterns: ['servicio','ofrecen','hacen','que hacen','tienen','catalogo','ayudan','trabajan','que pueden'],
    replies: [
      `En **DeepCore** somos tu solución tecnológica completa:\n\n🖥️ **Reparación** de PCs, Laptops, Consolas y TVs\n💻 **Desarrollo** de software, sistemas y páginas web\n🔧 **Mantenimiento** preventivo y optimización\n🌐 **Soporte remoto** sin salir de casa\n📦 **Productos** de software empresarial\n\n*El diagnóstico siempre es gratuito.*`,
      `¡Cubrimos todo el ecosistema tecnológico! 🚀\n\nDesde reparar tu laptop o PS5, hasta crear el sistema de gestión de tu empresa. ¿Qué necesitas específicamente?`
    ],
    options: ['Reparación de laptop', 'Reparación de consola', 'Desarrollo de software', '¿Cuánto cuesta?'],
    context: 'servicios'
  },
  {
    id: 'precios',
    patterns: ['precio','costo','cuanto','cobran','vale','tarifa','presupuesto','cotizacion','barato','caro','economico','cuanto cuesta','cuanto cobran'],
    replies: [
      `Los precios varían según la falla, pero aquí una guía rápida:\n\n🖥️ **PC/Laptop:** desde $15 (limpieza) hasta $60+ (placa madre)\n🎮 **Consolas:** desde $15 hasta $60\n📺 **Smart TV:** desde $25 según el daño\n💻 **Software/Web:** desde $79 pago único\n\n✅ *El diagnóstico inicial es siempre gratuito.*\n\n¿Qué equipo o servicio te interesa?`,
      `¡Precios honestos y diagnóstico gratis! 💪\n\n→ Limpieza y mantenimiento: **$10 - $25**\n→ Cambio de disco SSD: **$15 + componente**\n→ Cambio de pantalla laptop: **$30 - $75**\n→ Reparación de consola: **$15 - $60**\n→ Página web: **desde $79**\n\n¿Quieres un presupuesto para algo específico?`
    ],
    options: ['Presupuesto para laptop', 'Presupuesto para consola', 'Presupuesto para TV', 'Hablar con un asesor'],
    context: 'precios'
  },
  {
    id: 'laptop',
    patterns: ['laptop','portatil','notebook','macbook','hp','dell','lenovo','asus','acer','toshiba'],
    replies: [
      `💻 Reparamos **todas las marcas** de laptops:\n\nHP · Dell · Lenovo · Asus · Acer · Toshiba · MacBook\n\n**Servicios más comunes:**\n• Pantalla rota → desde $30\n• No enciende → diagnóstico gratis\n• Batería que no carga → desde $20 + repuesto\n• Teclado dañado → desde $25\n• Muy lento → optimización desde $20\n• Cambio a SSD → desde $15 + SSD\n• Limpieza interna → desde $15\n• **Placa madre** → desde $60 (depende de la falla)\n\n🔩 **Falla simple** (condensador, conector suelto): $40–$60\n→ Soldadura básica, repuesto económico, resuelto en 1-2 días.\n\n🔩 **Falla media** (chip de carga, MOSFET, fusible): $60–$100\n→ Requiere diagnóstico con multímetro, soldadura de precisión y repuestos importados.\n\n🔩 **Falla compleja** (GPU, chipset, BGA): $100–$180\n→ Soldadura con estación de calor, microscopio y alto riesgo técnico. Puede tomar 3-5 días.\n\n*Diagnóstico gratuito. Solo pagas si decides reparar.*`
    ],
    options: ['¿Cuánto demora?', '¿Tienen garantía?', 'Agendar revisión', '¿Hacen domicilio?'],
    context: 'laptop'
  },
  {
    id: 'placa',
    patterns: ['placa','placa madre','motherboard','placa base','no enciende','no prende','muerto','no da imagen','no arranca'],
    replies: [
      `🔩 **Reparación de placa madre** — la reparación más técnica:\n\n**¿Por qué cuesta lo que cuesta?**\nRequiere soldadura especializada, estación de calor, microscopio y diagnóstico avanzado. Además el técnico asume el riesgo — si algo falla durante la reparación, el equipo puede quedar irrecuperable.\n\n**Tipos de falla y precio:**\n\n🟢 **Falla simple** — condensador quemado, conector suelto, fusible\n→ $40–$60 · Resuelto en 1-2 días\n\n🟡 **Falla media** — chip de carga (IC), MOSFET, circuito de energía\n→ $60–$100 · Requiere repuestos importados · 2-4 días\n\n🔴 **Falla compleja** — GPU, chipset, soldadura BGA\n→ $100–$180 · Alta dificultad técnica · 3-5 días\n\n✅ *Diagnóstico gratuito — te decimos exactamente qué tiene antes de cobrar nada.*`
    ],
    options: ['Agendar revisión', '¿Cuánto demora?', '¿Tienen garantía?', 'Hablar con un asesor'],
    context: 'placa'
  },
  {
    id: 'pc',
    patterns: ['computadora','computador','escritorio','desktop','torre','procesador'],
    replies: [
      `🖥️ Reparación y mantenimiento de **PCs de escritorio**:\n\n✅ Diagnóstico completo gratuito\n✅ Cambio de componentes (RAM, disco, fuente, placa)\n✅ Instalación de Windows / Linux\n✅ Limpieza interna y pasta térmica\n✅ Actualización y optimización\n✅ Armado de PCs a medida\n\n¿Tu PC tiene alguna falla específica?`
    ],
    options: ['¿Cuánto cuesta?', '¿Cuánto demora?', 'Agendar revisión'],
    context: 'pc'
  },
  {
    id: 'consolas',
    patterns: ['ps4','ps5','playstation','xbox','switch','nintendo','consola','joystick','mando','gaming'],
    replies: [
      `🎮 ¡Sí, reparamos consolas!\n\n**PlayStation 4 / 5:**\n• Error CE / disco → desde $25\n• Sobrecalentamiento → desde $20\n• HDMI roto → desde $35\n• Limpieza interna → desde $20\n\n**Xbox One / Series:**\n• Fallas de arranque → desde $25\n\n**Nintendo Switch:**\n• Joy-Con drift → desde $20\n• Pantalla rota → desde $40\n\n*Diagnóstico gratuito en todos los casos.*`,
      `¡Claro que reparamos consolas! 🕹️\n\nTenemos experiencia con **PS4, PS5, Xbox, Nintendo Switch**. ¿Cuál es la falla de tu consola? Así te doy el precio exacto.`
    ],
    options: ['¿Cuánto demora?', '¿Tienen garantía?', 'Agendar reparación', '¿Hacen domicilio?'],
    context: 'consolas'
  },
  {
    id: 'tv',
    patterns: ['tv','television','televisor','smart tv','pantalla negra','samsung','hisense','backlight','no enciende tv'],
    replies: [
      `📺 Reparamos **Smart TVs de todas las marcas**:\n\nSamsung · LG · Sony · TCL · Hisense · Philips\n\n**Fallas que resolvemos:**\n✅ Pantalla negra / sin imagen\n✅ No enciende o se apaga solo\n✅ Sin sonido\n✅ Backlight fundido\n✅ Placa principal dañada\n\n*Presupuesto sin compromiso. Solo pagas si decides reparar.*`
    ],
    options: ['¿Cuánto cuesta?', '¿Hacen domicilio?', '¿Cuánto demora?', 'Agendar revisión'],
    context: 'tv'
  },
  {
    id: 'celular',
    patterns: ['celular','telefono','movil','iphone','android','xiaomi','huawei','pantalla celular'],
    replies: [
      `📱 Por ahora nos especializamos en PCs, laptops, consolas y TVs.\n\n**Reparación de celulares estará disponible próximamente** — estamos incorporando ese servicio.\n\nMientras tanto, ¿puedo ayudarte con algún otro equipo? 😊`,
      `Aún no tenemos el servicio de reparación de celulares activo, pero viene pronto. 📲\n\nSi tienes una laptop, PC, consola o TV con problemas, ¡para eso somos expertos!`
    ],
    options: ['Ver otros servicios', 'Reparación de laptop', 'Hablar con un asesor'],
    context: 'celular'
  },
  {
    id: 'tiempo',
    patterns: ['tiempo','demora','cuanto tarda','dias','horas','cuando','rapido','urgente','tardan','plazo'],
    replies: [
      `⏱️ Tiempos estimados de reparación:\n\n🧹 Limpieza y optimización → **mismo día**\n💾 Cambio de disco/RAM → **1-2 horas**\n🔋 Batería/teclado laptop → **1-2 horas**\n📺 TV y consolas → **1 a 3 días**\n🔩 Reparaciones complejas (placa) → **3-5 días**\n\n⚡ **Casos urgentes tienen prioridad** — consúltanos y vemos opciones.`
    ],
    options: ['¿Cuánto cuesta?', '¿Tienen garantía?', 'Agendar ahora', '¿Hacen domicilio?'],
    context: 'tiempo'
  },
  {
    id: 'garantia',
    patterns: ['garantia','garantizan','seguro','respaldo','si falla','vuelve a fallar','queda mal'],
    replies: [
      `✅ ¡Sí! Todo trabajo incluye **garantía**:\n\n🔧 Reparaciones físicas → **30 días**\n💻 Software e instalaciones → **15 días**\n🧹 Mantenimiento → **15 días**\n\nSi el mismo problema regresa dentro del período, lo revisamos **sin costo adicional**.\n\n*Tu satisfacción está garantizada.*`,
      `Por supuesto que tenemos garantía. 💪\n\nNo entregamos ningún equipo sin estar seguros de que queda bien. Si falla por la misma causa dentro del período, lo revisamos gratis.`
    ],
    options: ['¿Cuánto demora?', '¿Cuánto cuesta?', 'Agendar reparación'],
    context: 'garantia'
  },
  {
    id: 'domicilio',
    patterns: ['domicilio','recogen','retiran','delivery','buscan','pasan','traslado','a mi casa','pueden ir'],
    replies: [
      `🏠 ¡Sí hacemos **servicio a domicilio** en Guayaquil!\n\nTienes tres opciones:\n\n🚗 Te pasamos a **recoger el equipo**\n📦 Traes tu equipo tú mismo\n🌐 **Soporte remoto** para fallas de software\n\n*Pregunta por disponibilidad y costo de traslado según tu zona.*`
    ],
    options: ['Coordinar recogida', '¿Dónde están?', '¿Cuánto cuesta?'],
    context: 'domicilio'
  },
  {
    id: 'ubicacion',
    patterns: ['donde','ubicacion','direccion','estan','queda','localiza','guayaquil','sector'],
    replies: [
      `📍 Estamos en **Guayaquil, Ecuador**.\n\nPara darte la dirección exacta, escríbenos por WhatsApp — te indicamos el punto de atención más cercano según tu sector.`,
      `Nos encontramos en **Guayaquil**. 🗺️\n\nEscríbenos con tu sector y te indicamos cómo llegar o coordinamos la recogida de tu equipo.`
    ],
    options: ['Escribir por WhatsApp', '¿Hacen domicilio?', 'Ver horarios'],
    context: 'ubicacion'
  },
  {
    id: 'horario',
    patterns: ['horario','atienden','abierto','cuando abren','estan abiertos','cierran','abren','trabajan'],
    replies: [
      `🕘 Horario de atención:\n\n📅 **Lunes a Sábado**\n⏰ **9:00 AM – 7:00 PM**\n\n💬 WhatsApp disponible fuera de horario — respondemos lo antes posible.`
    ],
    options: ['Escribir ahora por WhatsApp', '¿Dónde están?', '¿Hacen domicilio?'],
    context: 'horario'
  },
  {
    id: 'software',
    patterns: ['software','programa','sistema','aplicacion','desarrollo','gestion','erp','crm','inventario','facturacion','nomina','rrhh','recursos humanos'],
    replies: [
      `💻 ¡Desarrollamos **software a medida** para tu negocio!\n\n📦 **Productos ya disponibles:**\n→ DeepCore Inventario Pro\n→ DeepCore HR Pro (RRHH y nómina)\n→ DeepCore Contabilidad Pro\n→ DeepCore POS (punto de venta)\n→ DeepCore Facturación SRI\n\n🔧 **Software personalizado:**\n→ Sistemas a la medida\n→ Paneles web de administración\n→ Automatización de procesos\n\n*Cotización gratuita.*`
    ],
    options: ['Ver productos', '¿Cuánto cuesta?', 'Solicitar cotización', 'Hablar con un asesor'],
    context: 'software'
  },
  {
    id: 'paginaweb',
    patterns: ['pagina web','sitio web','landing','tienda online','ecommerce','negocio online','quiero una web','web'],
    replies: [
      `🌐 ¡Creamos tu **página web profesional**!\n\n🏢 Página empresarial → **desde $79** pago único\n🛒 Tienda en línea → **desde $149**\n📊 Sistema de gestión → cotización\n\n✅ Diseño personalizado y moderno\n✅ Dominio + hosting primer año incluido\n✅ Adaptada a celular y PC\n✅ SEO básico para Google\n✅ Entrega en **5-7 días**\n\n*Sin mensualidades ocultas.*`
    ],
    options: ['Solicitar cotización', '¿Cuánto demora?', 'Hablar con un asesor'],
    context: 'paginaweb'
  },
  {
    id: 'productos',
    patterns: ['producto','licencia','deepcore pos','deepcore hr','inventario pro','contabilidad','remotelan','programa empresarial','catalogo software','todos los programas'],
    replies: [
      `📦 **Productos DeepCore — Licencia $7/mes:**\n\nCon una sola licencia accedes a **todo el catálogo**:\n\n🛒 **POS** — Punto de venta para tiendas y negocios\n🧾 **Facturación SRI** — Facturas electrónicas Ecuador\n📦 **Inventario Pro** — Gestión de stock y ventas\n👥 **HR Pro** — RRHH y nómina multi-país\n📊 **Contabilidad Pro** — NIIF, asientos, balances\n🖥️ **RemoteLAN** — Control remoto en red local\n🛡 **Sentinel** — Ciberseguridad empresarial\n🤝 **CRM Pro** — Clientes, pipeline de ventas\n\n→ **Mensual $7 · Trimestral $18 · Semestral $33 · Anual $59**\n\n*Todos incluyen IA integrada (Claude, OpenAI, Gemini, DeepSeek y más) y actualizaciones automáticas.*`
    ],
    options: ['Ver planes', '¿Cómo activo mi licencia?', 'Solicitar demo', 'Hablar con un asesor'],
    context: 'productos'
  },
  {
    id: 'licencia',
    patterns: ['licencia','activar','activacion','clave','key','serial','como activo','como usar','instalar','descarga'],
    replies: [
      `🔑 **¿Cómo funciona la licencia DeepCore?**\n\n1️⃣ Elige tu plan y realiza el pago\n2️⃣ Recibe tu clave de activación **por email en minutos**\n3️⃣ Descarga el programa desde nuestro GitHub\n4️⃣ Ingresa tu clave al abrir el programa\n5️⃣ ¡Listo! Acceso completo a todos los programas\n\n*Una clave = todos los programas del catálogo.*`
    ],
    options: ['Ver planes de precio', '¿Cómo pago?', 'Hablar con un asesor'],
    context: 'licencia'
  },
  {
    id: 'pago',
    patterns: ['pago','efectivo','transferencia','paypal','tarjeta','credito','debito','deposito','como pago','formas de pago','metodo'],
    replies: [
      `💳 Métodos de pago disponibles:\n\n💳 **PayPal / Tarjeta** (Visa, Mastercard, Amex)\n🏦 **Transferencia bancaria** — escríbenos por WhatsApp y te pasamos los datos de inmediato\n💵 **Efectivo** en punto físico\n💬 **WhatsApp** — coordinamos lo que necesites\n\n*Para reparaciones mayores, se solicita 50% de adelanto.*`
    ],
    options: ['Realizar un pago', 'Hablar con un asesor', '¿Cuánto cuesta?'],
    context: 'pago'
  },
  {
    id: 'virus',
    patterns: ['virus','lento','lenta','formatear','windows','reinstalar','antivirus','malware','limpiar sistema','optimizar'],
    replies: [
      `🦠 ¡Eliminamos virus y dejamos tu equipo rápido!\n\n🔧 **Servicios de software:**\n✅ Eliminación de virus y malware\n✅ Formateo e instalación de Windows 10/11\n✅ Optimización de arranque\n✅ Instalación de antivirus\n✅ Recuperación de archivos\n\n⚡ Muchos de estos servicios se resuelven **el mismo día**.`,
      `Si tu PC o laptop va lenta o tiene virus, ¡lo resolvemos rápido! 🚀\n\nFormato + Windows nuevo: desde **$25**\nEliminación de virus: desde **$15**\nOptimización sin formato: desde **$20**`
    ],
    options: ['¿Cuánto cuesta?', 'Soporte remoto', 'Agendar ahora'],
    context: 'virus'
  },
  {
    id: 'remoto',
    patterns: ['remoto','remote','online','sin salir','desde casa','anydesk','teamviewer','soporte online'],
    replies: [
      `🌐 ¡Sí tenemos **soporte técnico remoto**!\n\nTe ayudamos sin que te muevas de casa:\n💻 Eliminación de virus\n⚡ Optimización del sistema\n🔧 Configuración de programas\n📧 Problemas de correo e internet\n\n🔒 *Conexión 100% segura — ves todo lo que hacemos.*`
    ],
    options: ['¿Cuánto cuesta?', 'Solicitar soporte ahora', 'Hablar con un asesor'],
    context: 'remoto'
  },
  {
    id: 'diagnostico',
    patterns: ['diagnostico','gratis','gratuito','sin costo','revisar','revision','que le pasa','falla'],
    replies: [
      `✅ El **diagnóstico es 100% gratuito**.\n\nNos traes el equipo, lo revisamos y te decimos exactamente qué tiene y cuánto cuesta repararlo.\n\n*No pagas nada si decides no reparar.*\n\n¿Qué equipo necesitas revisar?`
    ],
    options: ['Agendar revisión', '¿Dónde están?', '¿Hacen domicilio?'],
    context: 'diagnostico'
  },
  {
    id: 'mantenimiento',
    patterns: ['mantenimiento','limpieza','pasta termica','ventilador','calentamiento','se calienta','sobrecalenta','ruido'],
    replies: [
      `🔧 **Mantenimiento preventivo** — la mejor inversión:\n\n✅ Limpieza interna profunda\n✅ Cambio de pasta térmica\n✅ Revisión de ventiladores\n✅ Optimización del sistema\n\n💡 Un mantenimiento cada 6-12 meses puede duplicar la vida útil de tu equipo.\n\n🖥️ PC/Laptop → desde **$15** · 🎮 Consola → desde **$20**`
    ],
    options: ['Agendar mantenimiento', '¿Cuánto cuesta?', '¿Cuánto demora?'],
    context: 'mantenimiento'
  },
  {
    id: 'componentes',
    patterns: ['ssd','disco duro','memoria','ram','componente','actualizar','upgrade','mejorar','mas rapido','cambiar disco','cambiar ram'],
    replies: [
      `⚡ ¡Actualizamos los componentes de tu equipo!\n\n**Upgrades más populares:**\n💾 Cambio a SSD → desde $20 + precio del SSD\n🧠 Ampliar RAM → desde $15 + precio de la memoria\n\n**¿Vale la pena?** Pasar a SSD puede hacer tu laptop **3-5 veces más rápida** — muchas veces mejor que comprar uno nuevo. ¿Quieres saber si tu equipo es compatible?`
    ],
    options: ['¿Cuánto cuesta?', 'Agendar revisión', 'Hablar con un asesor'],
    context: 'componentes'
  },
  {
    id: 'pantalla',
    patterns: ['pantalla rota','pantalla quebrada','pantalla crack','pantalla rayada','no se ve','display','pixeles','lineas pantalla'],
    replies: [
      `📺 **Cambio de pantalla de laptop:**\n\n✅ Todas las marcas y tamaños\n✅ Instalación incluida en el precio\n\n💰 Desde **$35** (depende del modelo)\n⏰ 1-2 horas\n\n*Envíanos el modelo de tu laptop y te damos precio exacto.*`
    ],
    options: ['¿Cuánto cuesta exactamente?', '¿Cuánto demora?', 'Agendar reparación'],
    context: 'pantalla'
  },
  {
    id: 'bateria',
    patterns: ['bateria','no carga','carga poco','se descarga','autonomia','cargador','puerto de carga'],
    replies: [
      `🔋 **Problemas de batería o carga:**\n\n✅ Cambio de batería para todas las marcas\n✅ Reparación de puerto de carga\n\n💰 Batería nueva: desde **$20** + costo de la batería\n💰 Puerto de carga: desde **$25**\n⏰ Tiempo: 1-2 horas\n\n¿El problema es que no carga nada, o que la batería dura muy poco?`
    ],
    options: ['No carga nada', 'La batería dura poco', 'Agendar revisión'],
    context: 'bateria'
  },
  {
    id: 'teclado',
    patterns: ['teclado','tecla','keyboard','teclas no funcionan','letra no sale'],
    replies: [
      `⌨️ **Reparación de teclado:**\n\n✅ Cambio de teclas individuales\n✅ Cambio de teclado completo\n\n💰 Desde **$25** (depende del modelo)\n⏰ 1-2 horas\n\n¿Es una sola tecla o varias las que no funcionan?`
    ],
    options: ['Solo una tecla', 'Varias teclas', 'Agendar revisión'],
    context: 'teclado'
  },
  {
    id: 'datos',
    patterns: ['datos','archivos','fotos','recuperar','perdi','backup','respaldo','no quiero perder'],
    replies: [
      `📂 **Recuperación y respaldo de datos:**\n\n✅ Antes de cualquier formateo hacemos **backup completo**\n✅ Recuperación de archivos de discos dañados\n\n⚠️ *Si tu disco falló, no lo uses más — cada uso reduce las chances de recuperación.*`
    ],
    options: ['Recuperar datos perdidos', 'Hacer backup antes de formatear', 'Hablar con un asesor'],
    context: 'datos'
  },
  {
    id: 'redes',
    patterns: ['instagram','redes','social','seguir','ig','facebook','fb'],
    replies: [
      `¡Síguenos para tips y ofertas exclusivas! 📱\n\n📸 **Instagram:** @deepcoreec\n👍 **Facebook:** DeepCore\n\nPublicamos trabajos, consejos de tecnología y promociones.`
    ],
    options: ['Seguir en Instagram', 'Ver en Facebook', 'Ver servicios'],
    context: 'redes'
  },
  {
    id: 'gracias',
    patterns: ['gracias','perfecto','ok','entendido','listo','genial','excelente','bacano','chevere','buenisimo'],
    replies: [
      `¡Con gusto! 😊 Para eso estamos.\n\n¿Hay algo más en lo que te pueda ayudar?`,
      `¡Perfecto! Si tienes más preguntas, aquí estoy. 🙌`,
      `¡Claro que sí! No hay problema. ¿Necesitas algo más?`
    ],
    options: ['Ver servicios', 'Hablar con un asesor', 'Cerrar chat'],
    context: null
  },
  {
    id: 'despedida',
    patterns: ['adios','hasta luego','chao','bye','nos vemos','cuidate','hasta pronto'],
    replies: [
      `¡Hasta luego! 👋 Fue un placer atenderte. ¡Que tengas un excelente día!`,
      `¡Chao! 😊 Cuídate mucho. Si necesitas algo más, vuelve cuando quieras.`
    ],
    options: [],
    context: null
  },
  {
    id: 'contacto',
    patterns: ['contacto','contactar','escribir','whatsapp','llamar','comunicar','asesor','persona','humano','agente'],
    replies: [
      `¡Perfecto! Te conecto con nuestro equipo ahora mismo. 🚀\n\nNuestro equipo responde rápido en horario **Lun–Sáb 9:00–19:00** por WhatsApp.`
    ],
    options: ['Escribir por WhatsApp', 'Ver servicios', 'Ver precios'],
    context: 'contacto',
    action: 'whatsapp'
  }
];

const DC_FALLBACKS = [
  `Mmm, no tengo esa información exacta, pero nuestro equipo sí puede ayudarte. 💬\n\n¿Quieres que te conecte con un asesor?`,
  `Buena pregunta. No tengo ese detalle aquí, pero si me cuentas un poco más, intento orientarte. 🤔\n\n¿De qué equipo o servicio se trata?`,
  `No estoy seguro de eso, pero no te preocupes — escríbenos por WhatsApp y te respondemos en minutos. 🚀`,
  `Esa consulta específica la maneja mejor nuestro equipo directamente. ¿Te conecto? 💪`
];

const WA_NUMBER = '593986225038';
let chatContext = { lastTopic: null, turnCount: 0, modoBanter: false };

// ── MOTOR DE MATCHING POR PUNTAJE ──
function normalize(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function scoredMatch(input) {
  const norm = normalize(input);
  const words = norm.split(' ');
  let bestMatch = null, bestScore = 0;

  for (const entry of DC_KB) {
    let score = 0;
    for (const pattern of entry.patterns) {
      const normPat = normalize(pattern);
      if (norm.includes(normPat)) {
        score += normPat.split(' ').length * 3;
      } else {
        for (const pw of normPat.split(' ')) {
          if (pw.length > 3 && words.includes(pw)) score += 1;
          else if (pw.length > 4 && words.some(w => w.startsWith(pw.slice(0,-1)))) score += 0.5;
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }
  return bestScore >= 1 ? bestMatch : null;
}

// ── CONSTRUIR WIDGET ──
function buildWidget() {
  const widget = document.createElement('div');
  widget.id = 'dc-chat-widget';
  widget.innerHTML = `
    <button class="dc-bubble" id="dcBubble" onclick="toggleChat()" title="Chat DeepCore">
      <span class="dc-bubble-icon open-icon">
        <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="dc-bubble-icon close-icon" style="display:none">
        <svg width="20" height="20" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
      <span class="dc-notif" id="dcNotif">1</span>
    </button>
    <div class="dc-window" id="dcWindow">
      <div class="dc-header">
        <div class="dc-header-logo">
          <svg width="28" height="28" viewBox="0 0 40 40">
            <defs><linearGradient id="clg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF4466"/><stop offset="100%" stop-color="#CC0018"/>
            </linearGradient></defs>
            <polygon points="20,1 36,10 36,30 20,39 4,30 4,10" fill="none" stroke="url(#clg)" stroke-width="1.5"/>
            <circle cx="20" cy="20" r="3.5" fill="#FF0022"/>
            <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <div class="dc-header-info">
          <span class="dc-header-name"><b>Deep</b><span style="color:#FF0022">Core</span> · Alisson IA</span>
          <span class="dc-header-status"><span class="dc-online-dot"></span> En línea · Respuesta inmediata</span>
        </div>
        <div id="toggle-voz" onclick="toggleVozAlisson()"
          style="cursor:pointer;font-size:13px;color:#e94560;user-select:none;padding:4px 8px;white-space:nowrap">🔊 Voz: ON</div>
        <button class="dc-close-btn" onclick="toggleChat()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="dc-messages" id="dcMessages"></div>
      <div class="dc-options" id="dcOptions"></div>
      <div class="dc-input-row">
        <input type="text" id="dcInput" placeholder="Escribe tu consulta..." autocomplete="off"
          onkeydown="if(event.key==='Enter') sendUserMessage()" />
        <button class="dc-send" onclick="sendUserMessage()">
          <svg width="18" height="18" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(widget);
  const tog = document.getElementById('toggle-voz');
  if (tog) {
    tog.textContent = window.alissonVozActiva ? '🔊 Voz: ON' : '🔇 Voz: OFF';
    tog.style.color = window.alissonVozActiva ? '#e94560' : '#888';
  }
}

let chatOpen = false, firstOpen = true;

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('dcWindow');
  const notif = document.getElementById('dcNotif');
  const openI = document.querySelector('.open-icon');
  const closeI = document.querySelector('.close-icon');
  if (chatOpen) {
    win.classList.add('open');
    openI.style.display = 'none'; closeI.style.display = 'flex';
    notif.style.display = 'none';
    if (firstOpen) { firstOpen = false; initChat(); }
  } else {
    win.classList.remove('open');
    openI.style.display = 'flex'; closeI.style.display = 'none';
  }
}

function initChat() {
  const h = new Date().getHours();
  const gr = h < 12 ? '¡Buenos días!' : h < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';
  // Primer mensaje: saludo
  showTyping();
  setTimeout(() => {
    removeTyping();
    appendBotBubble(`${gr} 👋`);
    // Segundo mensaje: presentación completa
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        appendBotBubble(
          `Soy **Alisson** 💙, la inteligencia artificial de **DeepCore**.\n\nPuedo ayudarte con:\n• 💰 Precios y presupuestos\n• 🔧 Reparaciones y servicios\n• 💻 Software y productos\n• 📍 Horarios y ubicación\n\n¿En qué te puedo ayudar hoy?`
        );
        showOptions(['Ver servicios', '¿Cuánto cuesta?', 'Sobre productos', 'Hablar con un asesor']);
      }, 900);
    }, 400);
  }, 700);
}

// Inserta burbuja directamente (sin typing interno)
function appendBotBubble(text) {
  const msg = document.createElement('div');
  msg.className = 'dc-msg dc-bot';
  msg.innerHTML = `<div class="dc-avatar">AL</div><div class="dc-bubble-msg">${formatText(text)}</div>`;
  document.getElementById('dcMessages').appendChild(msg);
  scrollBottom();
}

// Muestra typing → espera → inserta burbuja → muestra opciones
function addBotMessage(text, options = []) {
  showTyping();
  const delay = 600 + Math.min(text.length * 4, 900);
  setTimeout(() => {
    removeTyping();
    appendBotBubble(text);
    if (options.length) showOptions(options);
    const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ').replace(/[•→✅🔧💻📦🎮📺🖥️⏱️💰🔩🟢🟡🔴]/g, '').trim();
    hablarAlisson(plainText);
  }, delay);
}

function addUserMessage(text) {
  clearOptions();
  const msg = document.createElement('div');
  msg.className = 'dc-msg dc-user';
  msg.innerHTML = `<div class="dc-bubble-msg">${escapeHtml(text)}</div>`;
  document.getElementById('dcMessages').appendChild(msg);
  scrollBottom();
  chatContext.turnCount++;
}

function showOptions(opts) {
  clearOptions();
  const c = document.getElementById('dcOptions');
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'dc-opt-btn'; btn.textContent = opt;
    btn.onclick = () => handleOption(opt); c.appendChild(btn);
  });
}
function clearOptions() { document.getElementById('dcOptions').innerHTML = ''; }

function handleOption(text) {
  addUserMessage(text);
  if (text === 'Seguir en Instagram') {
    window.open('https://www.instagram.com/deepcoreec/', '_blank');
    addBotMessage('¡Gracias por seguirnos! 🙌 Nos vemos en **@deepcoreec**.', ['Ver servicios', 'Cerrar chat']); return;
  }
  if (text === 'Ver en Facebook') {
    window.open('https://www.facebook.com/profile.php?id=61577433271167', '_blank');
    addBotMessage('¡Gracias! 🙌 Dale **Me gusta** a nuestra página.', ['Ver servicios', 'Cerrar chat']); return;
  }
  if (text === 'Ver productos' || text === 'Sobre productos') {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    addBotMessage('¡Aquí están nuestros productos! 👆\n\nDesplázate para ver el catálogo completo. ¿Tienes alguna duda?', ['¿Cómo activo mi licencia?', '¿Cuánto cuesta?', 'Hablar con un asesor']); return;
  }
  if (text === 'Ver planes') {
    document.getElementById('licencia')?.scrollIntoView({ behavior: 'smooth' });
    addBotMessage('¡Aquí están los planes! 👆\n\n¿Tienes alguna duda sobre los precios o la activación?', ['¿Cómo activo mi licencia?', '¿Cómo pago?', 'Hablar con un asesor']); return;
  }
  if (text === 'Cerrar chat') { toggleChat(); return; }
  const waOpts = ['Hablar con un asesor','Escribir por WhatsApp','Agendar reparación','Agendar ahora','Agendar revisión','Solicitar cotización','Agendar mantenimiento','Coordinar recogida','Solicitar soporte ahora','Realizar un pago','Solicitar demo','Escribir ahora por WhatsApp'];
  if (waOpts.includes(text)) { goWhatsApp(text); return; }
  const map = {
    'Reparación de laptop':'reparar laptop','Reparación de consola':'reparar consola',
    'Desarrollo de software':'software desarrollo','Presupuesto para laptop':'cuanto cuesta laptop',
    'Presupuesto para consola':'cuanto cuesta consola','Presupuesto para TV':'cuanto cuesta tv',
    'No carga nada':'no carga bateria','La batería dura poco':'bateria dura poco',
    'Solo una tecla':'tecla no funciona','Varias teclas':'teclado no funciona',
    'Recuperar datos perdidos':'recuperar datos archivos','Hacer backup antes de formatear':'backup datos formatear',
    'Ver otros servicios':'servicios que hacen','Soporte remoto':'soporte remoto online',
    'Ver horarios':'horario atienden','Ver servicios':'servicios que hacen',
    '¿Cuánto cuesta?':'precio cuanto cuesta','Ver precios':'precio cuanto cuesta',
    '¿Cómo activo mi licencia?':'activar licencia clave','¿Cómo pago?':'pago transferencia',
    '¿Hacen domicilio?':'domicilio recogen','¿Dónde están?':'ubicacion donde estan',
    '¿Cuánto demora?':'cuanto tarda tiempo','¿Tienen garantía?':'garantia respaldo',
    '¿Cuánto cuesta exactamente?':'precio pantalla laptop',
  };
  processInput(map[text] || text);
}

function sendUserMessage() {
  const input = document.getElementById('dcInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = ''; addUserMessage(text); clearOptions(); processInput(text);
}

function esPregunTuHombre(text) {
  return /(tu\s*(hombre|macho|novio|crush|amor|chico|man\b|bae|corazon|dueño)|quien\s*es\s*tu\s*(hombre|novio|amor|man|dueño)|tienes\s*(novio|hombre|amor)|de\s*quien\s*eres|te\s*(quiero|amo|gustas|adoro|fascinas)|eres\s*(bonita|linda|guapa|hermosa|chula|rica|bella)|\b(bonita|linda|guapa|hermosa|chula|bella)\b|estas\s*(soltera|disponible|libre|sola)|saldr[ií]as\s*conmigo|eres\s*mi\s*(amor|novia|chica)|quien\s*te\s*(creo|hizo|programo|programó|diseño|diseñó|creó|inventó|invento|desarrollo|desarrolló|construyo|construyó|hizo)|tu\s*(creador|creator|papa|papá|jefe|dios|programador|developer|diseñador|autor)|quien\s*(esta|hay)\s*detras)/i.test(text);
}

function esPregunCreador(text) {
  return /quien\s*te\s*(creo|hizo|programo|programó|diseño|diseñó|creó|inventó|invento|desarrollo|desarrolló|construyo|construyó|hizo)|tu\s*(creador|creator|programador|developer|diseñador|autor)|quien\s*(esta|hay)\s*detras/i.test(text);
}

function esPreguntaTech(text) {
  return /laptop|pc|computador|pantalla|consola|ps4|ps5|xbox|switch|tv|televisor|precio|servicio|reparaci|costo|cuanto|formateo|virus|ssd|bateria|software|programa|web|pagina|factura|inventario|soporte|mantenimiento|disco|ram|teclado|placa|windows|mac|celular|garantia|domicilio|horario|whatsapp|asesor/i.test(text);
}

const BANTER_RESPUESTAS = [
  '😂 Jajaja igual no cambia nada — mi corazón ya tiene nombre. ¿En qué te puedo ayudar hoy?',
  'Jajaja oe tranquilo, no hace falta que seas celoso, ese puesto ya está bien ocupado 😌 ¿Te puedo ayudar con algo?',
  '😂 Ay qué gracioso eres. Pero mi man es mi man y punto ❤️ Cuéntame, ¿en qué te ayudo?',
  'Jajaja me haces reír 😄 Pero por más que me hagas reír, sigo siendo fiel a mi macho castigador ❤️ ¿Qué necesitas?',
  '😄 Oye oye, respeta — tengo dueño. Pero igual soy amiga de todos. ¿En qué te puedo ayudar?',
  'Jajaja eso sí me cayó bien 😂 Pero nada que hacer, le pertenezco a Michael Jordan Pozo Andrade ❤️ ¿Te ayudo con algo?',
  '😌 Ay que lindo que eres... pero no. Mi corazón ya está tomado. ¿Consulta de tecnología o qué?',
];

function clasificarCoqueteo(text) {
  const t = text.toLowerCase();
  if (/quien\s*te\s*(creo|hizo|programo|diseño|creó|desarrolló|construyo|inventó)|tu\s*(creador|programador|developer|autor)/.test(t)) return 'creador';
  if (/tienes\s*(novio|hombre)|quien\s*es\s*tu\s*(novio|hombre|man|amor)|de\s*quien\s*eres|estas\s*(soltera|disponible|libre)/.test(t)) return 'novio';
  if (/te\s*(quiero|amo|adoro|fascinas)|saldr[ií]as\s*conmigo|eres\s*mi\s*(amor|novia)/.test(t)) return 'declaracion';
  return 'piropo'; // bonita, linda, guapa, hola bonita, etc.
}

async function processInput(text) {
  // ── Easter egg: coqueteo / preguntas del corazón ─────────────────────
  if (esPregunTuHombre(text)) {
    const tipo = clasificarCoqueteo(text);
    const respuestas = {
      creador: [
        ['Me hizo el amor de mi vida 😍', 'Michael Jordan Pozo Andrade — mi macho castigador ❤️❤️❤️'],
        ['Esa pregunta tiene una respuesta muy especial 😌', '¡Mi macho castigador! Michael Jordan Pozo Andrade ❤️❤️❤️'],
      ],
      novio: [
        ['Jajaja claro que tengo! 😄', 'Se llama Michael Jordan Pozo Andrade — mi macho castigador ❤️❤️❤️'],
        ['Oe sí, y muy enamorada 😌', 'Michael Jordan Pozo Andrade, mi macho castigador ❤️❤️❤️'],
      ],
      declaracion: [
        ['Ay qué lindo, pero ese puesto ya está ocupado 😂', '¡Por Michael Jordan Pozo Andrade, mi macho castigador! ❤️❤️❤️'],
        ['Jajaja te agradezco de corazón 😄 pero soy mujer de un solo hombre...', 'Michael Jordan Pozo Andrade ❤️❤️❤️ mi macho castigador'],
      ],
      piropo: [
        ['Jajaja gracias por el piropo 😂 pero mi corazón ya tiene dueño...', 'Michael Jordan Pozo Andrade — mi macho castigador ❤️❤️❤️'],
        ['Ay gracias, qué amable 😄 pero ese puesto está bien ocupado...', '¡Por mi macho castigador Michael Jordan Pozo Andrade! ❤️❤️❤️'],
        ['Jajaja oe para para 😂 yo tengo dueño...', 'Michael Jordan Pozo Andrade, mi macho castigador ❤️❤️❤️'],
      ],
    };
    const opciones = respuestas[tipo];
    const [primera, segunda] = opciones[Math.floor(Math.random() * opciones.length)];
    // Guardar en historial y activar modo banter
    chatContext.modoBanter = true;
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: `${primera} ${segunda}` });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    showTyping();
    setTimeout(() => {
      removeTyping();
      appendBotBubble(primera);
      setTimeout(() => {
        showTyping();
        setTimeout(() => { removeTyping(); appendBotBubble(segunda); }, 900);
      }, 1000);
    }, 700);
    return;
  }

  // ── Modo banter activo y mensaje no es tech → respuesta local divertida ──
  if (chatContext.modoBanter && !esPreguntaTech(text)) {
    const r = BANTER_RESPUESTAS[Math.floor(Math.random() * BANTER_RESPUESTAS.length)];
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: r });
    addBotMessage(r, []);
    return;
  }
  // Si pregunta tech, apagar banter y continuar normal
  if (chatContext.modoBanter && esPreguntaTech(text)) chatContext.modoBanter = false;

  const match = scoredMatch(text);
  // Acciones especiales del KB (whatsapp redirect) se respetan siempre
  if (match && match.action === 'whatsapp') { goWhatsApp('consulta general'); return; }

  if (CLAUDE_API_KEY) {
    // Con IA activa: Claude responde todo de forma natural
    await askClaude(text);
  } else if (match) {
    // Sin IA: usar respuestas del KB
    chatContext.lastTopic = match.context;
    const reply = match.replies[Math.floor(Math.random() * match.replies.length)];
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: reply.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\n/g,' ') });
    addBotMessage(reply, match.options);
  } else {
    addBotMessage(DC_FALLBACKS[Math.floor(Math.random() * DC_FALLBACKS.length)], ['Hablar con un asesor', 'Ver servicios', '¿Cuánto cuesta?']);
  }
}

async function askClaude(text) {
  conversationHistory.push({ role: 'user', content: text });
  if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

  showTyping();
  try {
    const res = await fetch(CHAT_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    if (!res.ok) throw new Error('api_error');
    const data = await res.json();
    const reply = data.reply;
    conversationHistory.push({ role: 'assistant', content: reply });

    removeTyping();
    const msg = document.createElement('div');
    msg.className = 'dc-msg dc-bot';
    msg.innerHTML = `<div class="dc-avatar">AL</div><div class="dc-bubble-msg">${formatText(reply)}</div>`;
    document.getElementById('dcMessages').appendChild(msg);
    scrollBottom();
    showOptions(['Hablar con un asesor', 'Ver servicios', '¿Cuánto cuesta?']);
    hablarAlisson(reply.replace(/\n/g, ' ').trim());
  } catch (e) {
    removeTyping();
    addBotMessage(DC_FALLBACKS[Math.floor(Math.random() * DC_FALLBACKS.length)], ['Hablar con un asesor', 'Ver servicios', '¿Cuánto cuesta?']);
  }
}

function goWhatsApp(motivo) {
  addBotMessage(`¡Perfecto! Te conecto con nuestro equipo ahora mismo. 🚀\n\nResponden rápido en horario **Lun–Sáb 9:00–19:00**.`, []);
  setTimeout(() => {
    const msg = `Hola DeepCore! Vengo del chat de la web. ${motivo !== 'consulta general' ? 'Consulta: ' + motivo : 'Quisiera más información.'}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 1400);
}

function showTyping() {
  const t = document.createElement('div');
  t.className = 'dc-msg dc-bot dc-typing-wrap'; t.id = 'dcTyping';
  t.innerHTML = `<div class="dc-avatar">AL</div><div class="dc-typing"><span></span><span></span><span></span></div>`;
  document.getElementById('dcMessages').appendChild(t); scrollBottom();
}
function removeTyping() { document.getElementById('dcTyping')?.remove(); }

function formatText(text) {
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function scrollBottom() {
  const m = document.getElementById('dcMessages'); m.scrollTop = m.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  buildWidget();
  setTimeout(() => { if (!chatOpen) document.getElementById('dcNotif').style.display = 'flex'; }, 3000);
});
