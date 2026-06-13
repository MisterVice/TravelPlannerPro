// ==================== COUNTRIES.JS ====================
// REST Countries API con fallback automático entre fuentes

const Countries = {

    // Fuentes en orden de preferencia
    _fuentes: [
        'https://restcountries.com/v3.1',
        'https://restcountries.com/v3.1', // mismo host, segundo intento con delay
    ],

    // Traducciones español → inglés para búsqueda
    _traducciones: {
        'japon': 'japan', 'japón': 'japan',
        'francia': 'france', 'alemania': 'germany',
        'espana': 'spain', 'españa': 'spain',
        'estados unidos': 'united states', 'eeuu': 'united states',
        'reino unido': 'united kingdom', 'gran bretana': 'united kingdom',
        'china': 'china', 'brasil': 'brazil',
        'rusia': 'russia', 'italia': 'italy',
        'canada': 'canada', 'canadá': 'canada',
        'mexico': 'mexico', 'méxico': 'mexico',
        'corea del sur': 'south korea', 'corea': 'south korea',
        'grecia': 'greece', 'suecia': 'sweden',
        'noruega': 'norway', 'dinamarca': 'denmark',
        'finlandia': 'finland', 'portugal': 'portugal',
        'paises bajos': 'netherlands', 'países bajos': 'netherlands',
        'holanda': 'netherlands', 'belgica': 'belgium', 'bélgica': 'belgium',
        'suiza': 'switzerland', 'austria': 'austria',
        'turquia': 'turkey', 'turquía': 'turkey',
        'egipto': 'egypt', 'sudafrica': 'south africa', 'sudáfrica': 'south africa',
        'tailandia': 'thailand', 'india': 'india',
        'indonesia': 'indonesia', 'filipinas': 'philippines',
        'vietnam': 'vietnam', 'singapur': 'singapore',
        'nueva zelanda': 'new zealand', 'australia': 'australia',
        'argentina': 'argentina', 'chile': 'chile',
        'peru': 'peru', 'perú': 'peru',
        'colombia': 'colombia', 'venezuela': 'venezuela',
        'cuba': 'cuba', 'marruecos': 'morocco',
        'nigeria': 'nigeria', 'kenia': 'kenya',
        'israel': 'israel', 'arabia saudi': 'saudi arabia',
        'emiratos': 'united arab emirates', 'irak': 'iraq',
        'iran': 'iran', 'irán': 'iran',
        'pakistan': 'pakistan', 'pakistán': 'pakistan',
        'ucrania': 'ukraine', 'polonia': 'poland',
        'republica checa': 'czechia', 'república checa': 'czechia',
        'hungria': 'hungary', 'hungría': 'hungary',
        'rumania': 'romania', 'bulgaria': 'bulgaria',
        'croacia': 'croatia', 'serbia': 'serbia',
    },

    // Lista mínima local de emergencia (se usa si la API está completamente caída)
    _paisesLocales: [
        { name: { common: 'Argentina' }, cca2: 'AR', flags: { svg: 'https://flagcdn.com/ar.svg' }, capital: ['Buenos Aires'], region: 'Americas', subregion: 'South America', population: 45376763, currencies: { ARS: { name: 'Argentine peso', symbol: '$' } }, languages: { spa: 'Spanish' }, latlng: [-34, -64] },
        { name: { common: 'Australia' }, cca2: 'AU', flags: { svg: 'https://flagcdn.com/au.svg' }, capital: ['Canberra'], region: 'Oceania', subregion: 'Australia and New Zealand', population: 25687041, currencies: { AUD: { name: 'Australian dollar', symbol: '$' } }, languages: { eng: 'English' }, latlng: [-27, 133] },
        { name: { common: 'Brazil' }, cca2: 'BR', flags: { svg: 'https://flagcdn.com/br.svg' }, capital: ['Brasília'], region: 'Americas', subregion: 'South America', population: 212559409, currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } }, languages: { por: 'Portuguese' }, latlng: [-10, -55] },
        { name: { common: 'Canada' }, cca2: 'CA', flags: { svg: 'https://flagcdn.com/ca.svg' }, capital: ['Ottawa'], region: 'Americas', subregion: 'North America', population: 38005238, currencies: { CAD: { name: 'Canadian dollar', symbol: '$' } }, languages: { eng: 'English', fra: 'French' }, latlng: [60, -95] },
        { name: { common: 'Chile' }, cca2: 'CL', flags: { svg: 'https://flagcdn.com/cl.svg' }, capital: ['Santiago'], region: 'Americas', subregion: 'South America', population: 19116201, currencies: { CLP: { name: 'Chilean peso', symbol: '$' } }, languages: { spa: 'Spanish' }, latlng: [-30, -71] },
        { name: { common: 'China' }, cca2: 'CN', flags: { svg: 'https://flagcdn.com/cn.svg' }, capital: ['Beijing'], region: 'Asia', subregion: 'Eastern Asia', population: 1402112000, currencies: { CNY: { name: 'Chinese yuan', symbol: '¥' } }, languages: { zho: 'Chinese' }, latlng: [35, 105] },
        { name: { common: 'Colombia' }, cca2: 'CO', flags: { svg: 'https://flagcdn.com/co.svg' }, capital: ['Bogotá'], region: 'Americas', subregion: 'South America', population: 50882884, currencies: { COP: { name: 'Colombian peso', symbol: '$' } }, languages: { spa: 'Spanish' }, latlng: [4, -72] },
        { name: { common: 'Egypt' }, cca2: 'EG', flags: { svg: 'https://flagcdn.com/eg.svg' }, capital: ['Cairo'], region: 'Africa', subregion: 'Northern Africa', population: 102334403, currencies: { EGP: { name: 'Egyptian pound', symbol: '£' } }, languages: { ara: 'Arabic' }, latlng: [27, 30] },
        { name: { common: 'France' }, cca2: 'FR', flags: { svg: 'https://flagcdn.com/fr.svg' }, capital: ['Paris'], region: 'Europe', subregion: 'Western Europe', population: 67391582, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { fra: 'French' }, latlng: [46, 2] },
        { name: { common: 'Germany' }, cca2: 'DE', flags: { svg: 'https://flagcdn.com/de.svg' }, capital: ['Berlin'], region: 'Europe', subregion: 'Western Europe', population: 83240525, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { deu: 'German' }, latlng: [51, 9] },
        { name: { common: 'Greece' }, cca2: 'GR', flags: { svg: 'https://flagcdn.com/gr.svg' }, capital: ['Athens'], region: 'Europe', subregion: 'Southern Europe', population: 10715549, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { ell: 'Greek' }, latlng: [39, 22] },
        { name: { common: 'India' }, cca2: 'IN', flags: { svg: 'https://flagcdn.com/in.svg' }, capital: ['New Delhi'], region: 'Asia', subregion: 'Southern Asia', population: 1380004385, currencies: { INR: { name: 'Indian rupee', symbol: '₹' } }, languages: { hin: 'Hindi', eng: 'English' }, latlng: [20, 77] },
        { name: { common: 'Italy' }, cca2: 'IT', flags: { svg: 'https://flagcdn.com/it.svg' }, capital: ['Rome'], region: 'Europe', subregion: 'Southern Europe', population: 59554023, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { ita: 'Italian' }, latlng: [42.83, 12.83] },
        { name: { common: 'Japan' }, cca2: 'JP', flags: { svg: 'https://flagcdn.com/jp.svg' }, capital: ['Tokyo'], region: 'Asia', subregion: 'Eastern Asia', population: 125836021, currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } }, languages: { jpn: 'Japanese' }, latlng: [36, 138] },
        { name: { common: 'Mexico' }, cca2: 'MX', flags: { svg: 'https://flagcdn.com/mx.svg' }, capital: ['Mexico City'], region: 'Americas', subregion: 'North America', population: 128932753, currencies: { MXN: { name: 'Mexican peso', symbol: '$' } }, languages: { spa: 'Spanish' }, latlng: [23, -102] },
        { name: { common: 'Morocco' }, cca2: 'MA', flags: { svg: 'https://flagcdn.com/ma.svg' }, capital: ['Rabat'], region: 'Africa', subregion: 'Northern Africa', population: 36910558, currencies: { MAD: { name: 'Moroccan dirham', symbol: 'DH' } }, languages: { ara: 'Arabic', ber: 'Berber' }, latlng: [32, -5] },
        { name: { common: 'Netherlands' }, cca2: 'NL', flags: { svg: 'https://flagcdn.com/nl.svg' }, capital: ['Amsterdam'], region: 'Europe', subregion: 'Western Europe', population: 17441139, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { nld: 'Dutch' }, latlng: [52.5, 5.75] },
        { name: { common: 'New Zealand' }, cca2: 'NZ', flags: { svg: 'https://flagcdn.com/nz.svg' }, capital: ['Wellington'], region: 'Oceania', subregion: 'Australia and New Zealand', population: 5084300, currencies: { NZD: { name: 'New Zealand dollar', symbol: '$' } }, languages: { eng: 'English', mri: 'Māori' }, latlng: [-41, 174] },
        { name: { common: 'Peru' }, cca2: 'PE', flags: { svg: 'https://flagcdn.com/pe.svg' }, capital: ['Lima'], region: 'Americas', subregion: 'South America', population: 32971846, currencies: { PEN: { name: 'Peruvian sol', symbol: 'S/.' } }, languages: { spa: 'Spanish' }, latlng: [-10, -76] },
        { name: { common: 'Portugal' }, cca2: 'PT', flags: { svg: 'https://flagcdn.com/pt.svg' }, capital: ['Lisbon'], region: 'Europe', subregion: 'Southern Europe', population: 10305564, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { por: 'Portuguese' }, latlng: [39.5, -8] },
        { name: { common: 'Russia' }, cca2: 'RU', flags: { svg: 'https://flagcdn.com/ru.svg' }, capital: ['Moscow'], region: 'Europe', subregion: 'Eastern Europe', population: 144104080, currencies: { RUB: { name: 'Russian ruble', symbol: '₽' } }, languages: { rus: 'Russian' }, latlng: [60, 100] },
        { name: { common: 'South Korea' }, cca2: 'KR', flags: { svg: 'https://flagcdn.com/kr.svg' }, capital: ['Seoul'], region: 'Asia', subregion: 'Eastern Asia', population: 51780579, currencies: { KRW: { name: 'South Korean won', symbol: '₩' } }, languages: { kor: 'Korean' }, latlng: [37, 127.5] },
        { name: { common: 'Spain' }, cca2: 'ES', flags: { svg: 'https://flagcdn.com/es.svg' }, capital: ['Madrid'], region: 'Europe', subregion: 'Southern Europe', population: 47351567, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { spa: 'Spanish' }, latlng: [40, -4] },
        { name: { common: 'Sweden' }, cca2: 'SE', flags: { svg: 'https://flagcdn.com/se.svg' }, capital: ['Stockholm'], region: 'Europe', subregion: 'Northern Europe', population: 10353442, currencies: { SEK: { name: 'Swedish krona', symbol: 'kr' } }, languages: { swe: 'Swedish' }, latlng: [62, 15] },
        { name: { common: 'Switzerland' }, cca2: 'CH', flags: { svg: 'https://flagcdn.com/ch.svg' }, capital: ['Bern'], region: 'Europe', subregion: 'Western Europe', population: 8654622, currencies: { CHF: { name: 'Swiss franc', symbol: 'Fr' } }, languages: { deu: 'German', fra: 'French', ita: 'Italian' }, latlng: [47, 8] },
        { name: { common: 'Thailand' }, cca2: 'TH', flags: { svg: 'https://flagcdn.com/th.svg' }, capital: ['Bangkok'], region: 'Asia', subregion: 'South-Eastern Asia', population: 69950807, currencies: { THB: { name: 'Thai baht', symbol: '฿' } }, languages: { tha: 'Thai' }, latlng: [15, 100] },
        { name: { common: 'Turkey' }, cca2: 'TR', flags: { svg: 'https://flagcdn.com/tr.svg' }, capital: ['Ankara'], region: 'Asia', subregion: 'Western Asia', population: 84339067, currencies: { TRY: { name: 'Turkish lira', symbol: '₺' } }, languages: { tur: 'Turkish' }, latlng: [39, 35] },
        { name: { common: 'United Kingdom' }, cca2: 'GB', flags: { svg: 'https://flagcdn.com/gb.svg' }, capital: ['London'], region: 'Europe', subregion: 'Northern Europe', population: 67215293, currencies: { GBP: { name: 'British pound', symbol: '£' } }, languages: { eng: 'English' }, latlng: [54, -2] },
        { name: { common: 'United States' }, cca2: 'US', flags: { svg: 'https://flagcdn.com/us.svg' }, capital: ['Washington, D.C.'], region: 'Americas', subregion: 'North America', population: 329484123, currencies: { USD: { name: 'United States dollar', symbol: '$' } }, languages: { eng: 'English' }, latlng: [38, -97] },
        { name: { common: 'Venezuela' }, cca2: 'VE', flags: { svg: 'https://flagcdn.com/ve.svg' }, capital: ['Caracas'], region: 'Americas', subregion: 'South America', population: 28435940, currencies: { VES: { name: 'Venezuelan bolívar soberano', symbol: 'Bs.S' } }, languages: { spa: 'Spanish' }, latlng: [8, -66] },
    ],

    _normalizar(texto) {
        return texto.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    },

    async buscarPais(nombre) {
        const normalizado = this._normalizar(nombre);
        const enIngles    = this._traducciones[normalizado] || nombre;
        const terminos    = [...new Set([nombre, enIngles])];

        // Intentar con la API
        for (const termino of terminos) {
            try {
                const res = await fetch(
                    `https://restcountries.com/v3.1/name/${encodeURIComponent(termino)}`,
                    { signal: AbortSignal.timeout(6000) }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data?.length > 0) return data[0];
                }
            } catch { /* continuar */ }

            // Intentar endpoint /translation/
            try {
                const res = await fetch(
                    `https://restcountries.com/v3.1/translation/${encodeURIComponent(termino)}`,
                    { signal: AbortSignal.timeout(6000) }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data?.length > 0) return data[0];
                }
            } catch { /* continuar */ }
        }

        // Fallback: buscar en lista local
        const local = this._buscarEnLocal(normalizado);
        if (local) return local;

        throw new Error('País no encontrado');
    },

    _buscarEnLocal(normalizado) {
        const enIngles = this._traducciones[normalizado] || normalizado;
        return this._paisesLocales.find(p => {
            const nombreNorm = this._normalizar(p.name.common);
            return nombreNorm === normalizado || nombreNorm === enIngles;
        }) || null;
    },

    async obtenerTodos() {
        try {
            const res = await fetch(
                'https://restcountries.com/v3.1/all?fields=name,cca2,flags',
                { signal: AbortSignal.timeout(8000) }
            );
            if (res.ok) return await res.json();
        } catch { /* caer al fallback */ }

        // Fallback: retornar lista local
        return this._paisesLocales;
    },

    renderizarTarjeta(pais) {
        const nombre    = pais.name?.common || 'Desconocido';
        const capital   = pais.capital?.[0] || 'No disponible';
        const region    = pais.region || 'No disponible';
        const subregion = pais.subregion || 'No disponible';
        const poblacion = pais.population?.toLocaleString('es-CO') || 'No disponible';
        const bandera   = pais.flags?.svg || pais.flags?.png || `https://flagcdn.com/${pais.cca2?.toLowerCase()}.svg`;
        const monedas   = pais.currencies
            ? Object.values(pais.currencies).map(m => `${m.name} (${m.symbol || ''})`).join(', ')
            : 'No disponible';
        const idiomas   = pais.languages
            ? Object.values(pais.languages).join(', ')
            : 'No disponible';
        const cca2      = pais.cca2;
        const esFav     = Storage.esFavorito(cca2);

        return `
        <div class="card pais-card" data-cca2="${cca2}">
            <img src="${bandera}" alt="Bandera de ${nombre}" class="bandera">
            <h3>${nombre}</h3>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Región:</strong> ${region}</p>
            <p><strong>Subregión:</strong> ${subregion}</p>
            <p><strong>Población:</strong> ${poblacion}</p>
            <p><strong>Moneda:</strong> ${monedas}</p>
            <p><strong>Idioma:</strong> ${idiomas}</p>
            <button class="btn-favorito ${esFav ? 'activo' : ''}" data-cca2="${cca2}"
                    data-nombre="${nombre}" data-bandera="${bandera}">
                ${esFav ? '★ Guardado' : '☆ Favorito'}
            </button>
        </div>`;
    },

    llenarSelectPaises(selectEl, paises) {
        const ordenados = [...paises].sort((a, b) =>
            a.name.common.localeCompare(b.name.common));
        ordenados.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name.common;
            opt.textContent = p.name.common;
            selectEl.appendChild(opt);
        });
    }
};