/* ============================================================
   GameKeys - app.js  (shared across all pages)
   ============================================================ */

// ─── State ───────────────────────────────────────────────────
let JUEGOS      = [];
let GIFTCARDS   = [];
let GENEROS     = [];

// ─── Data loading ────────────────────────────────────────────
async function cargarDatos() {
  try {
    const res  = await fetch('/static/js/data.json');
    const data = await res.json();
    JUEGOS     = data.juegos     || [];
    GIFTCARDS  = data.giftcards  || [];
    GENEROS    = data.generos    || [];
    return data;
  } catch (e) {
    console.error('Error cargando data.json:', e);
    return {};
  }
}

// ─── Price helpers ───────────────────────────────────────────
function precioFinal(juego) {
  if (!juego.descuento) return juego.precio;
  return +(juego.precio * (1 - juego.descuento / 100)).toFixed(2);
}

function renderPrecio(juego) {
  const final = precioFinal(juego);
  if (juego.descuento > 0) {
    return `
      <span class="precio-original">$${juego.precio.toFixed(2)}</span>
      <span class="precio-final">$${final.toFixed(2)}</span>
      <span class="precio-descuento">-${juego.descuento}%</span>`;
  }
  return `<span class="precio-final">$${juego.precio.toFixed(2)}</span>`;
}

// ─── Platform helpers ────────────────────────────────────────
const PLAT_CONFIG = {
  'Steam':          { cls: 'plat-steam',        icon: '🟦', label: 'Steam' },
  'Epic':           { cls: 'plat-epic',          icon: '⬛', label: 'Epic' },
  'PlayStation':    { cls: 'plat-playstation',   icon: '🎮', label: 'PS' },
  'Xbox':           { cls: 'plat-xbox',          icon: '🟩', label: 'Xbox' },
  'Nintendo Switch':{ cls: 'plat-nintendo',      icon: '🔴', label: 'Switch' },
  'PC':             { cls: 'plat-pc',            icon: '🖥️', label: 'PC' },
};

function platClass(p) { return (PLAT_CONFIG[p] || {}).cls || 'plat-pc'; }
function platIcon(p)  { return (PLAT_CONFIG[p] || {}).icon || '🖥️'; }
function platLabel(p) { return (PLAT_CONFIG[p] || {}).label || p; }

function renderPlataformas(plats) {
  if (!plats || plats.length === 0) return '';
  if (plats.length >= 4) {
    return `<span class="tag-universal">🌐 Universal</span>`;
  }
  return plats.map(p =>
    `<span class="plat-tag ${platClass(p)}">${platIcon(p)} ${platLabel(p)}</span>`
  ).join('');
}

// ─── Cart ────────────────────────────────────────────────────
function getCarrito() {
  try { return JSON.parse(localStorage.getItem('gk_carrito') || '[]'); }
  catch { return []; }
}

function guardarCarrito(c) {
  localStorage.setItem('gk_carrito', JSON.stringify(c));
  actualizarBadgeCarrito();
}

function actualizarBadgeCarrito() {
  const c   = getCarrito();
  const tot = c.reduce((a, i) => a + (i.cantidad || 1), 0);
  document.querySelectorAll('.carrito-badge').forEach(el => {
    el.textContent = tot;
    el.style.display = tot > 0 ? '' : 'none';
  });
}

function agregarAlCarrito(juegoId, plataforma, esGiftCard, nombre, precio) {
  const c = getCarrito();

  if (esGiftCard) {
    const key = `gc_${nombre}_${precio}`;
    const existing = c.find(i => i.giftCardKey === key);
    if (existing) { existing.cantidad = (existing.cantidad || 1) + 1; }
    else {
      c.push({
        tipo: 'giftcard',
        giftCardKey: key,
        nombre,
        precio,
        plataforma,
        cantidad: 1
      });
    }
    guardarCarrito(c);
    mostrarToast(`🎁 ${nombre} ($${precio}) añadida al carrito`);
    return;
  }

  const juego = JUEGOS.find(j => j.id === juegoId);
  if (!juego) return;

  const key = `${juegoId}_${plataforma}`;
  const existing = c.find(i => i.key === key);
  if (existing) {
    existing.cantidad = (existing.cantidad || 1) + 1;
  } else {
    c.push({
      tipo: 'juego',
      key,
      juegoId,
      plataforma,
      nombre: juego.nombre,
      precio: precioFinal(juego),
      precioOriginal: juego.precio,
      descuento: juego.descuento,
      imagen: juego.imagen,
      cantidad: 1
    });
  }
  guardarCarrito(c);
  mostrarToast(`🛒 ${juego.nombre} añadido al carrito`);
}

// ─── Toast ───────────────────────────────────────────────────
function mostrarToast(msg) {
  const old = document.querySelector('.gk-toast');
  if (old) old.remove();

  const t = document.createElement('div');
  t.className = 'gk-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── User helpers ────────────────────────────────────────────
function getUsuario() {
  try { return JSON.parse(localStorage.getItem('gk_usuario') || 'null'); }
  catch { return null; }
}

function guardarUsuario(u) {
  localStorage.setItem('gk_usuario', JSON.stringify(u));
}

function cerrarSesion() {
  localStorage.removeItem('gk_usuario');
  window.location.href = '/login.html';
}

// ─── Navbar auth zone ────────────────────────────────────────
function initNavbar() {
  const zona = document.getElementById('auth-zone');
  if (!zona) return;
  const u = getUsuario();

  if (u) {
    const inicial = (u.nombre || u.email || '?')[0].toUpperCase();
    zona.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-violeta btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <span style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.2);
                display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;">
            ${inicial}
          </span>
          ${u.nombre || u.email}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><span class="dropdown-item-text small text-muted">${u.email}</span></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="/perfil.html">🛍️ Mis Compras</a></li>
          <li><a class="dropdown-item" href="/perfil.html?tab=perfil">👤 Mi Perfil</a></li>
          <li><a class="dropdown-item" href="/perfil.html?tab=facturacion">💳 Facturación</a></li>
          ${u.rol === 'admin' ? '<li><a class="dropdown-item" href="/admin.html">⚙️ Admin Panel</a></li>' : ''}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" onclick="cerrarSesion();return false;">🚪 Cerrar sesión</a></li>
        </ul>
      </div>`;
  } else {
    zona.innerHTML = `
      <a href="/login.html" class="btn btn-violeta btn-sm">
        👤 Iniciar sesión
      </a>`;
  }
}

// ─── Buscador ────────────────────────────────────────────────
function initBuscador() {
  const input = document.getElementById('buscador-input');
  const box   = document.getElementById('resultado-box');
  if (!input || !box) return;

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { box.innerHTML = ''; box.style.display = 'none'; return; }
      const found = JUEGOS.filter(j => j.nombre.toLowerCase().includes(q)).slice(0, 6);
      if (!found.length) {
        box.innerHTML = `<div class="resultado-item" style="color:#64748b;cursor:default;">Sin resultados para "${input.value}"</div>`;
      } else {
        box.innerHTML = found.map(j => `
          <div class="resultado-item" onclick="abrirModalDesdeSearch(${j.id})" style="cursor:pointer;">
            <img src="${j.imagen}" alt="${j.nombre}" loading="lazy">
            <div>
              <div class="res-name">${j.nombre}</div>
              <div class="res-price">${renderPrecio(j)}</div>
            </div>
          </div>`).join('');
      }
      box.style.display = 'block';
    }, 200);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !box.contains(e.target)) {
      box.style.display = 'none';
    }
  });

  // Buscar button / Enter
  const btnBuscar = document.getElementById('btn-buscar');
  if (btnBuscar) {
    btnBuscar.addEventListener('click', () => ejecutarBusqueda(input.value));
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') ejecutarBusqueda(input.value);
  });
}

function ejecutarBusqueda(q) {
  if (!q.trim()) return;
  window.location.href = `/busqueda.html?q=${encodeURIComponent(q.trim())}`;
}

function abrirModalDesdeSearch(id) {
  const box = document.getElementById('resultado-box');
  if (box) { box.innerHTML = ''; box.style.display = 'none'; }
  const input = document.getElementById('buscador-input');
  if (input) input.value = '';
  renderModalJuego(id);
}

// ─── Game detail modal ───────────────────────────────────────
function renderModalJuego(id) {
  const juego = JUEGOS.find(j => j.id === id);
  if (!juego) return;

  // Ensure modal element exists
  let modalEl = document.getElementById('modalJuego');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'modalJuego';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    document.body.appendChild(modalEl);
  }

  const estaAgotado = juego.stock === 0;
  const multiPlat   = juego.plataformas.length > 1;

  // Platform selector HTML
  let platSelectorHtml = '';
  if (multiPlat && !estaAgotado) {
    platSelectorHtml = `
      <div class="mb-3">
        <label class="form-label mb-2">Selecciona plataforma <span class="text-danger">*</span></label>
        <div class="d-flex flex-wrap gap-2" id="modal-plat-selector">
          ${juego.plataformas.map(p => `
            <button class="plat-selector-btn" data-plat="${p}" 
                    onclick="seleccionarPlatModal(this, '${p}')">
              ${platIcon(p)} ${p}
            </button>`).join('')}
        </div>
        <div id="modal-plat-error" class="text-danger small mt-1" style="display:none;">
          Por favor selecciona una plataforma
        </div>
      </div>`;
  }

  // Stock indicator
  let stockHtml = '';
  if (estaAgotado) {
    stockHtml = `<span class="stock-dot dot-red"></span><span class="stock-out">Sin stock</span>`;
  } else if (juego.stock <= 5) {
    stockHtml = `<span class="stock-dot dot-yellow"></span><span class="stock-low">Últimas ${juego.stock} unidades</span>`;
  } else {
    stockHtml = `<span class="stock-dot dot-green"></span><span class="stock-ok">${juego.stock} en stock</span>`;
  }

  // Video embed
  let videoHtml = '';
  if (juego.videoUrl) {
    const vid = juego.videoUrl.replace('watch?v=', 'embed/');
    videoHtml = `
      <div class="ratio ratio-16x9 mb-3">
        <iframe src="${vid}" allowfullscreen class="rounded"></iframe>
      </div>`;
  }

  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-0">
          <img src="${juego.imagen}" alt="${juego.nombre}" class="modal-img">
          <div class="p-4">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="genre-badge">${juego.genero}</span>
              ${estaAgotado ? '<span class="badge bg-danger">AGOTADO</span>' : ''}
            </div>
            <h4 class="fw-800 mb-1" style="color:#f1f5f9;">${juego.nombre}</h4>
            <div class="developer-tag mb-3">
              <span style="color:#64748b;">Desarrollado por</span> 
              <strong style="color:#a855f7;">${juego.desarrollador}</strong>
            </div>
            <p style="color:#94a3b8;font-size:0.93rem;line-height:1.6;">${juego.descripcion}</p>
            ${videoHtml}
            <div class="mb-3">
              <label class="form-label mb-2">Plataformas disponibles</label>
              <div>${renderPlataformas(juego.plataformas)}</div>
            </div>
            ${platSelectorHtml}
            <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div>${renderPrecio(juego)}</div>
              <div>${stockHtml}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          ${!estaAgotado ? `
          <button type="button" class="btn btn-violeta" 
                  id="modal-add-btn"
                  onclick="modalAgregarCarrito(${juego.id}, ${multiPlat})"
                  ${!multiPlat ? `data-plat="${juego.plataformas[0]}"` : ''}>
            🛒 Añadir al carrito
          </button>` : `
          <button class="btn btn-secondary" disabled>Sin stock</button>`}
        </div>
      </div>
    </div>`;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function seleccionarPlatModal(btn, plat) {
  document.querySelectorAll('#modal-plat-selector .plat-selector-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const addBtn = document.getElementById('modal-add-btn');
  if (addBtn) {
    addBtn.dataset.plat = plat;
    const err = document.getElementById('modal-plat-error');
    if (err) err.style.display = 'none';
  }
}

function modalAgregarCarrito(juegoId, multiPlat) {
  const addBtn = document.getElementById('modal-add-btn');
  const plat   = addBtn ? addBtn.dataset.plat : '';

  if (multiPlat && !plat) {
    const err = document.getElementById('modal-plat-error');
    if (err) err.style.display = 'block';
    return;
  }

  const juego = JUEGOS.find(j => j.id === juegoId);
  const finalPlat = plat || (juego ? juego.plataformas[0] : '');
  agregarAlCarrito(juegoId, finalPlat);

  const modalEl = document.getElementById('modalJuego');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

// ─── Game card HTML ──────────────────────────────────────────
function crearGameCard(juego, mostrarAgotado) {
  const agotado  = juego.stock === 0;
  const final    = precioFinal(juego);
  const multiP   = juego.plataformas.length > 1;

  return `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="game-card ${agotado && mostrarAgotado ? 'opacity-75' : ''}">
        <div class="card-img-wrap" onclick="renderModalJuego(${juego.id})" role="button" title="Ver detalles">
          <img src="${juego.imagen}" alt="${juego.nombre}" loading="lazy">
          ${juego.descuento > 0 ? `<div class="discount-badge">-${juego.descuento}%</div>` : ''}
          ${agotado && mostrarAgotado ? `
            <div class="agotado-overlay">
              <span class="badge-agotado">AGOTADO</span>
            </div>` : ''}
        </div>
        <div class="card-body">
          <div class="genre-badge">${juego.genero}</div>
          <h6 class="card-title">${juego.nombre}</h6>
          <p class="card-text">${(juego.descripcion || '').slice(0, 80)}…</p>
          <div class="developer-tag">🏢 ${juego.desarrollador}</div>
          <div class="mb-2">${renderPlataformas(juego.plataformas)}</div>
          <div class="price-block d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div>${renderPrecio(juego)}</div>
            ${!agotado ? `
            <button class="btn btn-violeta btn-sm" onclick="renderModalJuego(${juego.id})">
              🛒 Comprar
            </button>` : `
            <span class="badge bg-danger px-3 py-2">AGOTADO</span>`}
          </div>
        </div>
      </div>
    </div>`;
}

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await cargarDatos();
  actualizarBadgeCarrito();
  initNavbar();
  initBuscador();
  if (typeof initPagina === 'function') initPagina();
});
