// ==================== CURRENCY.JS ====================
// Conversor de monedas con open.er-api.com y fallback a Frankfurter

const Currency = {

    monedaActual: 'USD',

    async obtenerTasas(base) {
        // Usamos open.er-api.com como primera opción porque responde bien desde el navegador.
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
            if (res.ok) {
                const data = await res.json();
                if (data.result === 'success' && data.rates) {
                    return { base: data.base_code || base, rates: data.rates };
                }
                throw new Error('Respuesta inesperada de open.er-api.com');
            }
        } catch (err) {
            console.warn('[Currency] Error con open.er-api.com:', err.message);
        }

        // Fallback a Frankfurter si la primera API falla.
        const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
        if (!res.ok) throw new Error('Error al obtener tasas de cambio');
        const data = await res.json();
        return { base: data.base || base, rates: data.rates };
    },

    async renderizarConversor(monedaPais) {
        this.monedaActual = monedaPais || 'USD';

        const monedasObjetivo = ['COP', 'USD', 'EUR', 'GBP'];
        const base = 'USD';

        let tasas = {};
        try {
            const data = await this.obtenerTasas(base);
            tasas = data.rates;
            tasas[base] = 1;
        } catch {
            return `<div class="error-msg">No se pudieron obtener las tasas de cambio.</div>`;
        }

        const monedasMostrar = [...new Set([...monedasObjetivo, this.monedaActual])];
        const opcionesOrigen = monedasMostrar
            .map(m => `<option value="${m}"${m === 'USD' ? ' selected' : ''}>${m}</option>`)
            .join('');
        const opcionesDestino = monedasMostrar
            .map(m => `<option value="${m}"${m === this.monedaActual ? ' selected' : ''}>${m}</option>`)
            .join('');

        return `
        <div class="card conversor-card">
            <h3>💱 Conversor de Moneda</h3>
            <p class="texto-suave">Moneda del país: <strong>${this.monedaActual}</strong></p>
            <div class="conversor-form">
                <input type="number" id="montoConversion" value="100" min="0" step="any">
                <select id="monedaOrigen">${opcionesOrigen}</select>
                <span>→</span>
                <select id="monedaDestino">${opcionesDestino}</select>
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

            if (destino && monedaPais) {
                const opt = [...destino.options].find(o => o.value === monedaPais);
                if (opt) destino.value = monedaPais;
            }

            btnConvertir.onclick = () => {
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
            };

        } catch {
            const resultado = document.getElementById('resultadoConversion');
            if (resultado) resultado.textContent = 'Error al cargar tasas.';
        }
    }
};