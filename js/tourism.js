// ==================== TOURISM.JS ====================
// Geoapify Places API – reemplazo de OpenTripMap
// Key gratuita en: https://www.geoapify.com/  (3000 req/día, sin tarjeta)
// Reemplaza 'TU_API_KEY' con tu clave de Geoapify

const Tourism = {

    API_KEY: '893be3274d924b058910bed87b7d7dc5',

    async obtenerAtracciones(lat, lng) {
        const categorias = 'tourism.attraction,tourism.sights,entertainment.museum';
        const url = `https://api.geoapify.com/v2/places` +
            `?categories=${categorias}` +
            `&filter=circle:${lng},${lat},50000` +
            `&bias=proximity:${lng},${lat}` +
            `&limit=10` +
            `&apikey=${this.API_KEY}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener atracciones');
        const data = await res.json();
        return data.features || [];
    },

    renderizarAtracciones(lista) {
        if (!lista || lista.length === 0) {
            return `<div class="error-msg">No se encontraron atracciones para este destino.</div>`;
        }

        return lista.map(lugar => {
            const props      = lugar.properties || {};
            const nombre     = props.name || 'Sin nombre';
            const categoria  = (props.categories?.[0] || 'atracción')
                .split('.').pop().replace(/_/g, ' ');
            const direccion  = props.formatted || props.address_line2 || '';
            const xid        = props.place_id || (props.lon + ',' + props.lat);
            const esFav      = Storage.esAtraccionFavorita(xid);

            // Geoapify no provee imágenes propias; usamos placeholder con emoji por categoría
            const emoji = this._emojiCategoria(props.categories?.[0] || '');

            return `
            <div class="card atraccion-card">
                <div class="atraccion-img-placeholder">${emoji}</div>
                <h3>${nombre}</h3>
                <p class="categoria-badge">${categoria}</p>
                <p class="texto-suave">${direccion}</p>
                <button class="btn-fav-atraccion ${esFav ? 'activo' : ''}"
                    data-xid="${xid}"
                    data-nombre="${nombre}"
                    data-imagen=""
                    data-categoria="${categoria}">
                    ${esFav ? '★ Guardada' : '☆ Guardar atracción'}
                </button>
            </div>`;
        }).join('');
    },

    _emojiCategoria(cat) {
        if (cat.includes('museum'))     return '🏛️';
        if (cat.includes('monument'))   return '🗿';
        if (cat.includes('religion'))   return '⛪';
        if (cat.includes('park'))       return '🌿';
        if (cat.includes('beach'))      return '🏖️';
        if (cat.includes('castle'))     return '🏰';
        if (cat.includes('entertain'))  return '🎭';
        return '📍';
    },

    renderizarError() {
        return `<div class="error-msg">No se pudieron cargar las atracciones turísticas.</div>`;
    }
};