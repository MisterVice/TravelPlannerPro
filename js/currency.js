// ==================== CURRENCY.JS ====================
// Frankfurter API – Conversión de monedas

const Currency = {

    monedaActual: 'USD',

    async obtenerTasas(base) {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
        if (!res.ok) throw new Error('Error al obtener tasas de cambio');
        return await res.json();
    },

    async renderizarConversor(monedaPais) {
        this.monedaActual = monedaPais || 'USD';

        // Si la moneda del país es una de las objetivo, usamos USD como base
        const monedasObjetivo = ['COP', 'USD', 'EUR', 'GBP'];
        const base = monedasObjetivo.includes(this.monedaActual) ? 'USD' : this.monedaActual;

        let tasas = {};
        try {
            const data = await this.obtenerTasas(base);
            tasas = data.rates;
            tasas[base] = 1; // La propia base vale 1
        } catch {
            return `<div class="error-msg">No se pudieron obtener las tasas de cambio.</div>`;
        }

        const monedasMostrar = [...new Set([...monedasObjetivo, this.monedaActual])];

        const opciones = monedasMostrar
            .map(m => `<option value="${m}">${m}</option>`)
            .join('');

        return `
        <div class="card conversor-card">
            <h3>💱 Conversor de Moneda</h3>
            <p class="texto-suave">Moneda del país: <strong>${this.monedaActual}</strong></p>
            <div class="conversor-form">
                <input type="number" id="montoConversion" value="100" min="0" step="any">
                <select id="monedaOrigen">${opciones}</select>
                <span>→</span>
                <select id="monedaDestino">${opciones}</select>
            </div>
            <p id="resultadoConversion" class="resultado-conversion">—</p>
            <button id="btnConvertir">Convertir</button>
        </div>`;
    },

    calcular(monto, tasas, origen, destino) {
        // Convertir a USD primero, luego al destino
        if (!tasas[origen] || !tasas[destino]) return null;
        const enUSD = monto / tasas[origen];
        return (enUSD * tasas[destino]).toFixed(4);
    },

    // Guarda las tasas en memoria para usar al pulsar "Convertir"
    tasasCache: {},

    async cargarYConectarConversor(monedaPais) {
        const base = 'USD';
        try {
            const data = await this.obtenerTasas(base);
            this.tasasCache = data.rates;
            this.tasasCache['USD'] = 1;

            const btnConvertir = document.getElementById('btnConvertir');
            const resultado = document.getElementById('resultadoConversion');
            const montoInput = document.getElementById('montoConversion');
            const origen = document.getElementById('monedaOrigen');
            const destino = document.getElementById('monedaDestino');

            if (!btnConvertir) return;

            // Pre-seleccionar moneda del país como destino si existe
            if (destino && monedaPais) {
                const opt = [...destino.options].find(o => o.value === monedaPais);
                if (opt) destino.value = monedaPais;
            }

            btnConvertir.addEventListener('click', () => {
                const monto = parseFloat(montoInput.value);
                const o = origen.value;
                const d = destino.value;
                if (isNaN(monto) || monto < 0) {
                    resultado.textContent = 'Ingresa un monto válido.';
                    return;
                }
                const res = this.calcular(monto, this.tasasCache, o, d);
                if (res === null) {
                    resultado.textContent = 'Moneda no disponible en la API.';
                } else {
                    resultado.textContent = `${monto.toLocaleString()} ${o} = ${parseFloat(res).toLocaleString('es-CO', { maximumFractionDigits: 4 })} ${d}`;
                }
            });

        } catch {
            const resultado = document.getElementById('resultadoConversion');
            if (resultado) resultado.textContent = 'Error al cargar tasas.';
        }
    }
};