// =============================================
// DeepCore Chat — Widget propio v1.0
// =============================================

const DC_RESPONSES = [
  {
    patterns: ['hola','buenas','hey','saludos','buenos dias','buenas tardes','buenas noches','hi','ola','buen dia'],
    reply: `¡Hola! 👋 Bienvenido a **DeepCore**.\n\nSoy el asistente virtual. ¿En qué puedo ayudarte hoy?`,
    options: ['Ver servicios', '¿Cuánto cuesta?', '¿Dónde están?', 'Hablar con un humano']
  },
  {
    patterns: ['servicio','ofrecen','hacen','que hacen','tienen','catalogo'],
    reply: `En **DeepCore** ofrecemos:\n\n🖥️ Reparación de PCs y Laptops\n🎮 Consolas (PS4, PS5, Xbox, Switch)\n📺 Reparación de Smart TV\n💻 Desarrollo de Software\n🔧 Mantenimiento Preventivo\n🌐 Soporte Técnico Remoto`,
    options: ['¿Cuánto cuesta?', '¿Tienen garantía?', 'Hacer una consulta']
  },
  {
    patterns: ['precio','costo','cuanto','cobran','vale','tarifa','presupuesto','cotizacion'],
    reply: `Los precios dependen del diagnóstico, pero aquí una guía:\n\n🖥️ **Laptop/PC:** desde $15 (limpieza) hasta $80+ (placa)\n🎮 **Consolas:** desde $20 hasta $60\n📺 **TV:** desde $25 según la falla\n💻 **Software:** cotización personalizada\n\n*El diagnóstico inicial es gratuito.*`,
    options: ['¿Tienen garantía?', '¿Cuánto demora?', 'Solicitar cotización']
  },
  {
    patterns: ['tiempo','demora','cuanto tarda','dias','horas','cuando','rapido','urgente'],
    reply: `⏱️ Los tiempos estimados son:\n\n🖥️ Limpieza y optimización: **mismo día**\n💾 Cambio de disco/RAM: **1-2 horas**\n📺 TV / Consolas: **1 a 3 días**\n🔩 Reparación compleja: **3-5 días**\n\n*Casos urgentes tienen prioridad — consúltanos.*`,
    options: ['¿Hacen domicilios?', '¿Cuánto cuesta?', 'Agendar ahora']
  },
  {
    patterns: ['domicilio','van','recogen','envian','a domicilio','retiran','delivery'],
    reply: `🏠 Sí, hacemos **servicio a domicilio** en Guayaquil.\n\nPuedes:\n📦 Traer tu equipo directamente\n🚗 Solicitar que pasemos a recogerlo\n🌐 Soporte remoto para software sin salir de casa\n\n*Consulta disponibilidad y costo de traslado según tu zona.*`,
    options: ['¿Dónde están?', 'Solicitar recogida', 'Hablar con un humano']
  },
  {
    patterns: ['donde','ubicacion','direccion','estan','queda','localiza','guayaquil'],
    reply: `📍 Estamos en **Guayaquil, Ecuador**.\n\nPara la dirección exacta y coordinar una visita, escríbenos directamente por WhatsApp y te indicamos el punto de atención más cercano a ti.`,
    options: ['Escribir por WhatsApp', '¿Hacen domicilios?', 'Horario de atención']
  },
  {
    patterns: ['horario','atienden','abierto','hora','cuando abren','disponible'],
    reply: `🕘 Nuestro horario de atención:\n\n📅 **Lunes a Sábado**\n⏰ **9:00 AM – 7:00 PM**\n\n💬 WhatsApp disponible fuera de horario — respondemos lo antes posible.`,
    options: ['Escribir ahora', '¿Hacen domicilios?', 'Ver servicios']
  },
  {
    patterns: ['celular','telefono','movil','samsung','iphone','android'],
    reply: `📱 Por ahora nos especializamos en PCs, laptops, consolas y TVs.\n\n**Reparación de celulares próximamente** — estamos en proceso de incorporar este servicio.\n\n¿Te puedo ayudar con otro equipo?`,
    options: ['Ver servicios', '¿Cuánto cuesta?', 'Hablar con un humano']
  },
  {
    patterns: ['software','programa','sistema','app','web','pagina','aplicacion'],
    reply: `💻 ¡Desarrollamos software a medida!\n\nEjemplos de lo que hacemos:\n🌐 Páginas web profesionales\n📊 Sistemas de gestión empresarial\n🔄 Automatización de procesos\n📱 Aplicaciones web\n\n*Cotización gratuita según tu proyecto.*`,
    options: ['Solicitar cotización', '¿Cuánto cuesta?', 'Ver productos']
  },
  {
    patterns: ['pago','efectivo','transferencia','tarjeta','credito','debito','deposito'],
    reply: `💳 Aceptamos varios métodos de pago:\n\n💵 Efectivo\n📲 Transferencia bancaria\n📱 Pago móvil (Nequi, etc.)\n\n*Se solicita un adelanto para reparaciones mayores.*`,
    options: ['¿Cuánto cuesta?', 'Agendar reparación', 'Hablar con un humano']
  },
  {
    patterns: ['instagram','redes','social','seguir','ig'],
    reply: `¡Síguenos en nuestras redes! 📱\n\n📸 **Instagram:** @deepcoreec\n👍 **Facebook:** DeepCore\n\nPublicamos tips, trabajos y ofertas exclusivas.`,
    options: ['Seguir en Instagram', 'Ver en Facebook', 'Ver servicios']
  },
  {
    patterns: ['gracias','perfecto','ok','entendido','listo','genial','chevere','excelente','bacano','bien'],
    reply: `¡Con gusto! 😊 Estamos para servirte.\n\n¿Hay algo más en lo que te pueda ayudar?`,
    options: ['Ver servicios', 'Hablar con un humano', 'Cerrar chat']
  },
  {
    patterns: ['ps4','ps5','playstation','xbox','switch','nintendo','consola','joystick','mando'],
    reply: `🎮 ¡Sí, reparamos consolas!\n\n**PlayStation 4/5:** desde $25\n**Xbox One/Series:** desde $25\n**Nintendo Switch:** desde $20\n\nProblemas comunes que resolvemos:\n✅ Error CE / error de disco\n✅ Sobrecalentamiento\n✅ Joy-Con drift (Switch)\n✅ Lectura de discos\n✅ HDMI roto\n\n*Diagnóstico gratuito.*`,
    options: ['¿Cuánto demora?', '¿Tienen garantía?', 'Agendar reparación']
  },
  {
    patterns: ['laptop','portatil','notebook','pantalla','teclado','bateria','cargador'],
    reply: `💻 Reparamos todo tipo de laptops:\n\n✅ **Cambio de pantalla**\n✅ **Teclado roto o sin respuesta**\n✅ **Batería que no carga**\n✅ **Cargador o puerto USB**\n✅ **Limpieza interna y pasta térmica**\n✅ **Cambio de disco a SSD**\n\nMarcas: HP, Dell, Lenovo, Asus, Acer, Toshiba, MacBook y más.\n\n*Diagnóstico siempre gratuito.*`,
    options: ['¿Cuánto cuesta?', '¿Cuánto demora?', 'Agendar revisión']
  },
  {
    patterns: ['tv','television','smart tv','pantalla negra','no enciende','imagen','sonido'],
    reply: `📺 Reparamos Smart TVs de todas las marcas:\n\n✅ Samsung, LG, Sony, TCL, Hisense\n✅ Pantalla negra / sin imagen\n✅ Sin sonido\n✅ No enciende\n✅ Backlight fundido\n✅ Placa principal\n\n*Presupuesto sin compromiso — solo págás si decides reparar.*`,
    options: ['¿Cuánto cuesta?', '¿Hacen domicilios?', 'Agendar revisión']
  },
  {
    patterns: ['virus','lento','formatear','windows','reinstalar','antivirus'],
    reply: `🦠 ¡Eliminamos virus y optimizamos tu equipo!\n\nServicios de software:\n🔧 **Eliminación de virus/malware**\n💾 **Formateo e instalación de Windows**\n⚡ **Optimización de inicio**\n🔒 **Instalación de antivirus**\n\n*Muchos de estos servicios se hacen el mismo día.*\n\n¿Tu equipo está muy lento o tiene virus?`,
    options: ['¿Cuánto cuesta?', 'Agendar ahora', 'Soporte remoto']
  },
  {
    patterns: ['remoto','remote','online','sin salir','desde casa','anydesk','teamviewer'],
    reply: `🌐 ¡Sí tenemos **soporte técnico remoto**!\n\nPodemos ayudarte sin que salgas de casa:\n💻 Eliminación de virus\n⚡ Optimización del sistema\n🔧 Configuración de programas\n📧 Problemas de correo/internet\n\n*Conexión segura — tú ves todo lo que hacemos en tu pantalla.*`,
    options: ['¿Cuánto cuesta?', 'Solicitar soporte remoto', 'Hablar con un humano']
  },
  {
    patterns: ['pagina web','sitio web','tienda','ecommerce','negocio','emprendimiento'],
    reply: `🌐 ¡Creamos tu página web profesional!\n\n💼 **Página empresarial:** desde $79\n🛒 **Tienda en línea:** desde $149\n📊 **Sistema de gestión:** cotización\n\nIncluye:\n✅ Diseño personalizado\n✅ Dominio y hosting primer año\n✅ SEO básico incluido\n✅ Versión móvil\n✅ Formulario de contacto\n\n*Entrega en 7-10 días hábiles.*`,
    options: ['Solicitar cotización', '¿Cuánto demora?', 'Ver ejemplos']
  },
  {
    patterns: ['garantia','garantizan','seguro','respaldo'],
    reply: `¡Sí! ✅ Todo trabajo tiene **garantía**.\n\nLa garantía varía según el servicio:\n🔧 Reparaciones físicas: **30 días**\n💻 Software e instalaciones: **15 días**\n🧹 Mantenimiento: **15 días**\n\nSi algo falla dentro del período, lo revisamos sin costo adicional. ¡Tu satisfacción está garantizada!`,
    options: ['¿Cuánto demora?', '¿Hacen domicilios?', 'Agendar reparación']
  },
];

const WA_NUMBER = '593986225038';

// ── CONSTRUIR HTML DEL WIDGET ──
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
            <defs>
              <linearGradient id="clg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF4466"/>
                <stop offset="100%" stop-color="#CC0018"/>
              </linearGradient>
            </defs>
            <polygon points="20,1 36,10 36,30 20,39 4,30 4,10" fill="none" stroke="url(#clg)" stroke-width="1.5"/>
            <polygon points="20,7 31,13.5 31,26.5 20,33 9,26.5 9,13.5" fill="none" stroke="#FF0022" stroke-width="1" opacity="0.4" transform="rotate(30,20,20)"/>
            <circle cx="20" cy="20" r="3.5" fill="#FF0022"/>
            <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <div class="dc-header-info">
          <span class="dc-header-name"><b>Deep</b><span style="color:#FF0022">Core</span> Chat</span>
          <span class="dc-header-status"><span class="dc-online-dot"></span> En línea</span>
        </div>
        <button class="dc-close-btn" onclick="toggleChat()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="dc-messages" id="dcMessages"></div>

      <div class="dc-options" id="dcOptions"></div>

      <div class="dc-input-row">
        <input type="text" id="dcInput" placeholder="Escribe tu pregunta..." autocomplete="off" onkeydown="if(event.key==='Enter') sendUserMessage()" />
        <button class="dc-send" onclick="sendUserMessage()">
          <svg width="18" height="18" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
}

// ── TOGGLE CHAT ──
let chatOpen = false;
let firstOpen = true;

function toggleChat() {
  chatOpen = !chatOpen;
  const win  = document.getElementById('dcWindow');
  const notif = document.getElementById('dcNotif');
  const openI = document.querySelector('.open-icon');
  const closeI = document.querySelector('.close-icon');

  if (chatOpen) {
    win.classList.add('open');
    openI.style.display = 'none';
    closeI.style.display = 'flex';
    notif.style.display = 'none';
    if (firstOpen) { firstOpen = false; initChat(); }
  } else {
    win.classList.remove('open');
    openI.style.display = 'flex';
    closeI.style.display = 'none';
  }
}

// ── INIT ──
function initChat() {
  setTimeout(() => {
    addBotMessage(`¡Hola! 👋 Bienvenido a **DeepCore**.\n\nSoy tu asistente virtual. Puedo ayudarte con información sobre servicios, precios, horarios y más.\n\n¿En qué te puedo ayudar hoy?`,
      ['Ver servicios', '¿Cuánto cuesta?', '¿Dónde están?', 'Hablar con un humano']);
  }, 400);
}

// ── AÑADIR MENSAJE BOT ──
function addBotMessage(text, options = []) {
  showTyping();
  setTimeout(() => {
    removeTyping();
    const msg = document.createElement('div');
    msg.className = 'dc-msg dc-bot';
    msg.innerHTML = `
      <div class="dc-avatar">DC</div>
      <div class="dc-bubble-msg">${formatText(text)}</div>
    `;
    document.getElementById('dcMessages').appendChild(msg);
    scrollBottom();
    if (options.length) showOptions(options);
  }, 900 + Math.random() * 400);
}

// ── AÑADIR MENSAJE USUARIO ──
function addUserMessage(text) {
  clearOptions();
  const msg = document.createElement('div');
  msg.className = 'dc-msg dc-user';
  msg.innerHTML = `<div class="dc-bubble-msg">${text}</div>`;
  document.getElementById('dcMessages').appendChild(msg);
  scrollBottom();
}

// ── MOSTRAR OPCIONES ──
function showOptions(opts) {
  clearOptions();
  const container = document.getElementById('dcOptions');
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'dc-opt-btn';
    btn.textContent = opt;
    btn.onclick = () => handleOption(opt);
    container.appendChild(btn);
  });
}
function clearOptions() {
  document.getElementById('dcOptions').innerHTML = '';
}

// ── MANEJAR OPCIÓN ──
function handleOption(text) {
  addUserMessage(text);

  if (text === 'Seguir en Instagram') {
    window.open('https://www.instagram.com/deepcoreec/', '_blank');
    addBotMessage('¡Gracias por seguirnos! 🙌 Nos vemos en Instagram **@deepcoreec**.', ['Ver servicios', 'Hablar con un humano']);
    return;
  }
  if (text === 'Ver en Facebook') {
    window.open('https://www.facebook.com/profile.php?id=61577433271167', '_blank');
    addBotMessage('¡Gracias! 🙌 Nos vemos en Facebook. Dale **Me gusta** a nuestra página.', ['Ver servicios', 'Hablar con un humano']);
    return;
  }
  if (text === 'Hablar con un humano' || text === 'Escribir por WhatsApp' || text === 'Hacer una consulta' || text === 'Solicitar cotización' || text === 'Agendar reparación' || text === 'Agendar ahora' || text === 'Solicitar recogida' || text === 'Escribir ahora') {
    goWhatsApp(text);
    return;
  }
  if (text === 'Cerrar chat') { toggleChat(); return; }
  if (text === 'Ver productos') {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    addBotMessage('¡Aquí puedes ver nuestros productos! 👆\n\nRevisa la sección de **Productos** en la página. ¿Algo más en que pueda ayudarte?', ['Ver servicios', 'Hablar con un humano']);
    return;
  }

  processInput(text);
}

// ── ENVIAR MENSAJE MANUAL ──
function sendUserMessage() {
  const input = document.getElementById('dcInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  clearOptions();
  processInput(text);
}

// ── PROCESAR INPUT ──
function processInput(text) {
  const lower = text.toLowerCase();
  const match = DC_RESPONSES.find(r => r.patterns.some(p => lower.includes(p)));

  if (match) {
    addBotMessage(match.reply, match.options);
  } else {
    // Respuestas de fallback variadas para no sonar repetitivo
    const fallbacks = [
      `Hmm, no estoy seguro de cómo responder eso. 🤔\n\nPero puedo conectarte con nuestro equipo por WhatsApp ahora mismo.`,
      `No tengo esa información precisa, pero nuestro equipo sí puede ayudarte. 💬`,
      `Esa es una buena pregunta — déjame conectarte con alguien que sepa la respuesta exacta. 🚀`,
    ];
    addBotMessage(
      fallbacks[Math.floor(Math.random() * fallbacks.length)],
      ['Hablar con un humano', 'Ver servicios', '¿Cuánto cuesta?']
    );
  }
}

// ── IR A WHATSAPP ──
function goWhatsApp(motivo) {
  setTimeout(() => {
    addBotMessage(`¡Perfecto! Te voy a conectar con nuestro equipo en WhatsApp ahora mismo. 🚀\n\nResponden rápido en horario **Lun–Sáb 9:00–19:00**.`, []);
    setTimeout(() => {
      const msg = `Hola DeepCore! Vengo del chat de la web. Consulta: ${motivo}`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 1200);
  }, 200);
}

// ── TYPING INDICATOR ──
function showTyping() {
  const t = document.createElement('div');
  t.className = 'dc-msg dc-bot dc-typing-wrap';
  t.id = 'dcTyping';
  t.innerHTML = `
    <div class="dc-avatar">DC</div>
    <div class="dc-typing">
      <span></span><span></span><span></span>
    </div>
  `;
  document.getElementById('dcMessages').appendChild(t);
  scrollBottom();
}
function removeTyping() {
  document.getElementById('dcTyping')?.remove();
}

// ── UTILS ──
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
function scrollBottom() {
  const m = document.getElementById('dcMessages');
  m.scrollTop = m.scrollHeight;
}

// ── INIT WIDGET ──
document.addEventListener('DOMContentLoaded', () => {
  buildWidget();
  // Mostrar notificación después de 3 segundos
  setTimeout(() => {
    if (!chatOpen) {
      document.getElementById('dcNotif').style.display = 'flex';
    }
  }, 3000);
});
