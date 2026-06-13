// ==================== STORAGE.JS ====================
// Manejo centralizado de LocalStorage
 
const Storage = {
 
    // --- Usuario ---
    guardarUsuario(datos) {
        localStorage.setItem('tpp_usuario', JSON.stringify(datos));
    },
    obtenerUsuario() {
        return JSON.parse(localStorage.getItem('tpp_usuario'));
    },
 
    // --- Tema ---
    guardarTema(tema) {
        localStorage.setItem('tpp_tema', tema);
    },
    obtenerTema() {
        return localStorage.getItem('tpp_tema') || 'light';
    },
 
    // --- Favoritos (países) ---
    obtenerFavoritos() {
        return JSON.parse(localStorage.getItem('tpp_favoritos')) || [];
    },
    guardarFavorito(pais) {
        const favoritos = this.obtenerFavoritos();
        const existe = favoritos.find(f => f.cca2 === pais.cca2);
        if (!existe) {
            favoritos.push(pais);
            localStorage.setItem('tpp_favoritos', JSON.stringify(favoritos));
        }
    },
    eliminarFavorito(cca2) {
        const favoritos = this.obtenerFavoritos().filter(f => f.cca2 !== cca2);
        localStorage.setItem('tpp_favoritos', JSON.stringify(favoritos));
    },
    esFavorito(cca2) {
        return this.obtenerFavoritos().some(f => f.cca2 === cca2);
    },
 
    // --- Atracciones favoritas ---
    obtenerAtraccionesFavoritas() {
        return JSON.parse(localStorage.getItem('tpp_atracciones')) || [];
    },
    guardarAtraccionFavorita(atraccion) {
        const lista = this.obtenerAtraccionesFavoritas();
        const existe = lista.find(a => a.xid === atraccion.xid);
        if (!existe) {
            lista.push(atraccion);
            localStorage.setItem('tpp_atracciones', JSON.stringify(lista));
        }
    },
    eliminarAtraccionFavorita(xid) {
        const lista = this.obtenerAtraccionesFavoritas().filter(a => a.xid !== xid);
        localStorage.setItem('tpp_atracciones', JSON.stringify(lista));
    },
    esAtraccionFavorita(xid) {
        return this.obtenerAtraccionesFavoritas().some(a => a.xid === xid);
    },
 
    // --- Historial ---
    obtenerHistorial() {
        return JSON.parse(localStorage.getItem('tpp_historial')) || [];
    },
    agregarHistorial(pais) {
        const historial = this.obtenerHistorial();
        const entrada = {
            nombre: pais,
            fecha: new Date().toLocaleDateString('es-CO'),
            hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        };
        historial.unshift(entrada);
        // Máximo 20 entradas
        if (historial.length > 20) historial.pop();
        localStorage.setItem('tpp_historial', JSON.stringify(historial));
    },
};