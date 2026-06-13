// ==================== APP.JS ====================
// Controlador principal – Travel Planner Pro

document.addEventListener('DOMContentLoaded', async () => {

    // ── Elementos del DOM ──────────────────────────────────────────────
    const secRegistro   = document.getElementById('registro');
    const secDashboard  = document.getElementById('dashboard');
    const formRegistro  = document.getElementById('formRegistro');
    const formBuscador  = document.getElementById('formBuscador');
    const selectPais    = document.getElementById('pais');
    const spanNombre    = document.getElementById('nombreUsuario');
    const totalPaises   = document.getElementById('totalPaises');
    const totalFavoritos  = document.getElementById('totalFavoritos');
    const totalAtracciones = document.getElementById('totalAtracciones');
    const listaResultados = document.getElementById('listaresultados');
    const listaFavoritos  = document.getElementById('listaFavoritos');
    const listaHistorial  = document.getElementById('listaHistorial');
    const btnTema       = document.getElementById('btnTema');

    // ── Tema ───────────────────────────────────────────────────────────
    const aplicarTema = (tema) => {
        document.documentElement.setAttribute('data-theme', tema);
        btnTema.textContent = tema === 'dark' ? '☀️' : '🌙';
        Storage.guardarTema(tema);
    };

    aplicarTema(Storage.obtenerTema());

    btnTema.addEventListener('click', () => {
        const actual = document.documentElement.getAttribute('data-theme');
        aplicarTema(actual === 'dark' ? 'light' : 'dark');
    });

    // ── Inicialización: registro o bienvenida ──────────────────────────
    const usuario = Storage.obtenerUsuario();

    if (usuario) {
        secRegistro.style.display = 'none';
        spanNombre.textContent = usuario.nombre;
        actualizarDashboard();
    } else {
        secDashboard.style.display = 'none';
        // Llenar select de países en el formulario de registro
        try {
            const paises = await Countries.obtenerTodos();
            Countries.llenarSelectPaises(selectPais, paises);
        } catch {
            const opt = document.createElement('option');
            opt.value = 'Colombia';
            opt.textContent = 'Colombia';
            selectPais.appendChild(opt);
        }
    }

    // ── Registro ───────────────────────────────────────────────────────
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            pais:   selectPais.value,
        };
        Storage.guardarUsuario(datos);
        secRegistro.style.display = 'none';
        secDashboard.style.display = 'block';
        spanNombre.textContent = datos.nombre;
        actualizarDashboard();
    });

    // ── Dashboard ──────────────────────────────────────────────────────
    function actualizarDashboard() {
        totalPaises.textContent    = Storage.obtenerHistorial().length;
        totalFavoritos.textContent = Storage.obtenerFavoritos().length;
        totalAtracciones.textContent = Storage.obtenerAtraccionesFavoritas().length;
    }

    // ── Búsqueda ───────────────────────────────────────────────────────
    formBuscador.addEventListener('submit', async (e) => {
        e.preventDefault();
        const destino = document.getElementById('destino').value.trim();
        if (!destino) return;

        listaResultados.innerHTML = `<div class="loader">Buscando información de <strong>${destino}</strong>...</div>`;

        try {
            const pais = await Countries.buscarPais(destino);
            Storage.agregarHistorial(pais.name.common);
            actualizarDashboard();

            const lat = pais.capitalInfo?.latlng?.[0] ?? pais.latlng?.[0] ?? null;
            const lng = pais.capitalInfo?.latlng?.[1] ?? pais.latlng?.[1] ?? null;
            const moneda = Object.keys(pais.currencies || {})[0] || 'USD';

            // Construir resultados en paralelo
            let climaHTML = '';
            let conversorHTML = '';
            let atraccionesHTML = '';

            const [climaRes, conversorRes, atraccionesRes] = await Promise.allSettled([
                lat && lng ? Weather.obtenerClima(lat, lng) : Promise.reject(),
                Currency.renderizarConversor(moneda),
                lat && lng ? Tourism.obtenerAtracciones(lat, lng) : Promise.reject(),
            ]);

            climaHTML = climaRes.status === 'fulfilled'
                ? Weather.renderizarClima(climaRes.value)
                : Weather.renderizarError();

            conversorHTML = conversorRes.status === 'fulfilled'
                ? conversorRes.value
                : '<div class="error-msg">Conversor no disponible.</div>';

            atraccionesHTML = atraccionesRes.status === 'fulfilled'
                ? Tourism.renderizarAtracciones(atraccionesRes.value)
                : Tourism.renderizarError();

            listaResultados.innerHTML = `
                ${Countries.renderizarTarjeta(pais)}
                ${climaHTML}
                ${conversorHTML}
                <div class="seccion-atracciones">
                    <h3 class="subtitulo-atracciones">🏛️ Atracciones Turísticas</h3>
                    <div class="grid-atracciones">${atraccionesHTML}</div>
                </div>`;

            // Conectar conversor de moneda
            await Currency.cargarYConectarConversor(moneda);

            // Eventos de favoritos de país
            document.querySelectorAll('.btn-favorito').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cca2 = btn.dataset.cca2;
                    if (Storage.esFavorito(cca2)) {
                        Storage.eliminarFavorito(cca2);
                        btn.textContent = '☆ Favorito';
                        btn.classList.remove('activo');
                    } else {
                        Storage.guardarFavorito({
                            cca2,
                            nombre: btn.dataset.nombre,
                            bandera: btn.dataset.bandera,
                        });
                        btn.textContent = '★ Guardado';
                        btn.classList.add('activo');
                    }
                    actualizarDashboard();
                    renderizarFavoritos();
                });
            });

            // Eventos de favoritos de atracciones
            document.querySelectorAll('.btn-fav-atraccion').forEach(btn => {
                btn.addEventListener('click', () => {
                    const xid = btn.dataset.xid;
                    if (Storage.esAtraccionFavorita(xid)) {
                        Storage.eliminarAtraccionFavorita(xid);
                        btn.textContent = '☆ Guardar atracción';
                        btn.classList.remove('activo');
                    } else {
                        Storage.guardarAtraccionFavorita({
                            xid,
                            nombre:    btn.dataset.nombre,
                            imagen:    btn.dataset.imagen,
                            categoria: btn.dataset.categoria,
                        });
                        btn.textContent = '★ Guardada';
                        btn.classList.add('activo');
                    }
                    actualizarDashboard();
                });
            });

            // Scroll suave a resultados
            listaResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            listaResultados.innerHTML = `
                <div class="error-msg">
                    ❌ No se encontró información para "<strong>${destino}</strong>".
                    Verifica el nombre del país e intenta de nuevo.
                </div>`;
        }
    });

    // ── Favoritos ──────────────────────────────────────────────────────
    function renderizarFavoritos() {
        const favs = Storage.obtenerFavoritos();
        if (favs.length === 0) {
            listaFavoritos.innerHTML = `<p class="texto-suave">Aún no tienes destinos favoritos.</p>`;
            return;
        }
        listaFavoritos.innerHTML = favs.map(f => `
            <div class="card fav-card">
                <img src="${f.bandera}" alt="Bandera de ${f.nombre}" class="bandera-small">
                <h3>${f.nombre}</h3>
                <button class="btn-eliminar-fav" data-cca2="${f.cca2}">🗑️ Eliminar</button>
            </div>`).join('');

        document.querySelectorAll('.btn-eliminar-fav').forEach(btn => {
            btn.addEventListener('click', () => {
                Storage.eliminarFavorito(btn.dataset.cca2);
                actualizarDashboard();
                renderizarFavoritos();
            });
        });
    }

    // ── Historial ──────────────────────────────────────────────────────
    function renderizarHistorial() {
        const historial = Storage.obtenerHistorial();
        if (historial.length === 0) {
            listaHistorial.innerHTML = `<p class="texto-suave">Aún no hay búsquedas registradas.</p>`;
            return;
        }
        listaHistorial.innerHTML = historial.map(h => `
            <div class="card historial-card">
                <p><strong>${h.nombre}</strong></p>
                <p class="texto-suave">${h.fecha} – ${h.hora}</p>
            </div>`).join('');
    }

    // Renderizado inicial
    renderizarFavoritos();
    renderizarHistorial();

    // Actualizar historial tras búsquedas (observer simple)
    formBuscador.addEventListener('submit', () => {
        setTimeout(renderizarHistorial, 3000);
    });
});