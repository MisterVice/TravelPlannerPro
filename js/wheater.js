// ==================== WHEATER.JS ====================
// Open-Meteo API – Clima actual (nombre del archivo respetado tal como está en el proyecto)

const Weather = {

    // Códigos WMO → descripción
    descripcionClima(codigo) {
        const codigos = {
            0: 'Despejado ☀️',
            1: 'Principalmente despejado 🌤️',
            2: 'Parcialmente nublado ⛅',
            3: 'Nublado ☁️',
            45: 'Niebla 🌫️',
            48: 'Niebla con escarcha 🌫️',
            51: 'Llovizna ligera 🌦️',
            53: 'Llovizna moderada 🌦️',
            55: 'Llovizna densa 🌧️',
            61: 'Lluvia ligera 🌧️',
            63: 'Lluvia moderada 🌧️',
            65: 'Lluvia intensa 🌧️',
            71: 'Nieve ligera 🌨️',
            73: 'Nieve moderada 🌨️',
            75: 'Nieve intensa ❄️',
            80: 'Chubascos ligeros 🌦️',
            81: 'Chubascos moderados 🌧️',
            82: 'Chubascos violentos ⛈️',
            95: 'Tormenta eléctrica ⛈️',
            99: 'Tormenta con granizo ⛈️',
        };
        return codigos[codigo] || 'Condición desconocida';
    },

    async obtenerClima(lat, lng) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
            `&wind_speed_unit=kmh&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener clima');
        return await res.json();
    },

    renderizarClima(data) {
        const c = data.current;
        const estado = this.descripcionClima(c.weather_code);
        return `
        <div class="card clima-card">
            <h3>🌡️ Clima Actual</h3>
            <p class="clima-estado">${estado}</p>
            <div class="clima-datos">
                <div><span class="clima-valor">${c.temperature_2m}°C</span><br><small>Temperatura</small></div>
                <div><span class="clima-valor">${c.relative_humidity_2m}%</span><br><small>Humedad</small></div>
                <div><span class="clima-valor">${c.wind_speed_10m} km/h</span><br><small>Viento</small></div>
            </div>
        </div>`;
    },

    renderizarError() {
        return `<div class="card clima-card error-msg">No se pudo obtener el clima para este destino.</div>`;
    }
};