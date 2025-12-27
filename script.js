const API_KEY = "tu-key-de-openweather-aqui";

// Elementos del DOM
const provinciaSelect = document.getElementById("provincia");
const localidadSelect = document.getElementById("localidad");
const climaActualDiv = document.getElementById("climaActual");
const pronosticoSection = document.getElementById("pronosticoSection");
const horasSection = document.getElementById("horasSection");
const unidadBtn = document.getElementById("unidad");
const geoBtn = document.getElementById("geo");
const themeToggle = document.getElementById("themeToggle");
const buscarBtn = document.getElementById("buscar");
const mensajesDiv = document.getElementById("mensajes");
const rainEffect = document.getElementById("rainEffect");
const windEffect = document.getElementById("windEffect");

// Estado global
let estado = {
    unidad: "metric",
    latActual: null,
    lonActual: null,
    ciudadActual: null,
    pronosticoData: null,
    diaSeleccionado: null,
    temaOscuro: true
};

// ===== INICIALIZACIÓN =====
function init() {
    cargarProvincias();
    cargarConfiguracion();
    setupEventListeners();
}

// ===== CONFIGURACIÓN Y TEMA =====
function cargarConfiguracion() {
    const temaGuardado = localStorage.getItem("temaClima");
    if (temaGuardado === "light") {
        cambiarTema();
    }
    
    const unidadGuardada = localStorage.getItem("unidadClima");
    if (unidadGuardada === "imperial") {
        estado.unidad = "imperial";
        unidadBtn.textContent = "°C";
    }
}

function cambiarTema() {
    estado.temaOscuro = !estado.temaOscuro;
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
    
    const icono = themeToggle.querySelector("i");
    icono.classList.toggle("fa-sun");
    icono.classList.toggle("fa-moon");
    
    themeToggle.innerHTML = `<i class="fas ${estado.temaOscuro ? 'fa-sun' : 'fa-moon'}"></i>`;
    
    localStorage.setItem("temaClima", estado.temaOscuro ? "dark" : "light");
}

function cambiarUnidad() {
    estado.unidad = estado.unidad === "metric" ? "imperial" : "metric";
    unidadBtn.textContent = estado.unidad === "metric" ? "°F" : "°C";
    localStorage.setItem("unidadClima", estado.unidad);
    
    if (estado.latActual && estado.lonActual) {
        cargarClimaActual();
    }
}

// ===== GEO-REF API =====
function cargarProvincias() {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
        .then(r => r.json())
        .then(d => {
            d.provincias.sort((a, b) => a.nombre.localeCompare(b.nombre))
                .forEach(p => {
                    provinciaSelect.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
                });
        })
        .catch(error => mostrarError("Error al cargar provincias"));
}

provinciaSelect.addEventListener("change", () => {
    const provincia = provinciaSelect.value;
    if (!provincia) return;
    
    localidadSelect.disabled = true;
    localidadSelect.innerHTML = '<option value="">Cargando localidades...</option>';
    
    fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(provincia)}&max=500`)
        .then(r => r.json())
        .then(d => {
            localidadSelect.innerHTML = '<option value="">Seleccionar localidad</option>';
            d.localidades.sort((a, b) => a.nombre.localeCompare(b.nombre))
                .forEach(l => {
                    localidadSelect.innerHTML += `
                        <option value="${l.nombre}" 
                                data-lat="${l.centroide.lat}" 
                                data-lon="${l.centroide.lon}">
                            ${l.nombre}
                        </option>`;
                });
            localidadSelect.disabled = false;
        })
        .catch(error => {
            mostrarError("Error al cargar localidades");
            localidadSelect.innerHTML = '<option value="">Error al cargar</option>';
        });
});

// ===== GEOLOCALIZACIÓN =====
geoBtn.addEventListener("click", () => {
    mostrarMensaje("Obteniendo tu ubicación...", "info");
    
    if (!navigator.geolocation) {
        mostrarError("Tu navegador no soporta geolocalización");
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        pos => {
            estado.latActual = pos.coords.latitude;
            estado.lonActual = pos.coords.longitude;
            mostrarMensaje("Ubicación obtenida", "success");
            setTimeout(() => cargarClimaActual(), 500);
        },
        error => {
            let mensaje = "No se pudo obtener tu ubicación";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensaje = "Permiso de ubicación denegado";
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensaje = "Ubicación no disponible";
                    break;
                case error.TIMEOUT:
                    mensaje = "Tiempo de espera agotado";
                    break;
            }
            mostrarError(mensaje);
        }
    );
});

// ===== OPENWEATHER API =====
function cargarClimaActual() {
    if (!estado.latActual || !estado.lonActual) return;
    
    mostrarMensaje("Cargando datos del clima...", "info");
    
    // Mostrar loader
    climaActualDiv.style.display = "none";
    pronosticoSection.style.display = "none";
    horasSection.style.display = "none";
    
    // Clima actual
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${estado.latActual}&lon=${estado.lonActual}&units=${estado.unidad}&lang=es&appid=${API_KEY}`)
        .then(r => r.json())
        .then(d => {
            estado.ciudadActual = d.name;
            actualizarClimaActual(d);
            mostrarMensaje("", "clear");
        })
        .catch(error => mostrarError("Error al cargar clima actual"));
    
    // Pronóstico 5 días
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${estado.latActual}&lon=${estado.lonActual}&units=${estado.unidad}&lang=es&appid=${API_KEY}`)
        .then(r => r.json())
        .then(d => {
            estado.pronosticoData = d;
            mostrarPronostico5Dias(d);
            aplicarEfectosClima(d.list[0]);
        })
        .catch(error => mostrarError("Error al cargar pronóstico"));
}

function actualizarClimaActual(data) {
    const unidadTemp = estado.unidad === "metric" ? "°C" : "°F";
    const unidadViento = estado.unidad === "metric" ? "km/h" : "mph";
    
    // Actualizar elementos
    document.getElementById("ciudadNombre").textContent = data.name;
    document.getElementById("temperaturaActual").textContent = `${Math.round(data.main.temp)}${unidadTemp}`;
    document.getElementById("descripcionClima").textContent = data.weather[0].description;
    document.getElementById("sensacionTermica").textContent = `${Math.round(data.main.feels_like)}${unidadTemp}`;
    document.getElementById("humedad").textContent = `${data.main.humidity}%`;
    document.getElementById("viento").textContent = `${data.wind.speed} ${unidadViento}`;
    document.getElementById("presion").textContent = `${data.main.pressure} hPa`;
    document.getElementById("tempMin").textContent = `${Math.round(data.main.temp_min)}${unidadTemp}`;
    document.getElementById("tempMax").textContent = `${Math.round(data.main.temp_max)}${unidadTemp}`;
    
    // Actualizar icono principal
    const iconoMain = document.querySelector(".weather-icon-main");
    const iconClass = obtenerClaseIcono(data.weather[0].id, data.weather[0].icon);
    iconoMain.className = `fas ${iconClass} weather-icon-main`;
    
    // Aplicar animaciones según temperatura
    const temp = data.main.temp;
    const card = document.querySelector(".clima-card");
    
    if (temp > 30) {
        card.classList.add("hot");
        card.classList.remove("windy");
    } else if (data.wind.speed > 30) {
        card.classList.add("windy");
        card.classList.remove("hot");
    } else {
        card.classList.remove("hot", "windy");
    }
    
    climaActualDiv.style.display = "block";
    pronosticoSection.style.display = "block";
}

function mostrarPronostico5Dias(data) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";
    
    // Agrupar por día
    const dias = {};
    const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    data.list.forEach(item => {
        const fecha = new Date(item.dt * 1000);
        const clave = fecha.toLocaleDateString();
        
        if (!dias[clave]) {
            dias[clave] = {
                fecha: fecha,
                items: [],
                temp_min: Infinity,
                temp_max: -Infinity
            };
        }
        
        dias[clave].items.push(item);
        dias[clave].temp_min = Math.min(dias[clave].temp_min, item.main.temp_min);
        dias[clave].temp_max = Math.max(dias[clave].temp_max, item.main.temp_max);
    });
    
    // Tomar los próximos 5 días
    const proximosDias = Object.values(dias).slice(0, 5);
    
    proximosDias.forEach((dia, index) => {
        const item = dia.items[0];
        const unidadTemp = estado.unidad === "metric" ? "°C" : "°F";
        const diaSemana = nombresDias[dia.fecha.getDay()];
        const diaMes = dia.fecha.getDate();
        const mes = nombresMeses[dia.fecha.getMonth()];
        
        const card = document.createElement("div");
        card.className = `col forecast-day ${index === 0 ? 'selected' : ''}`;
        card.dataset.fecha = dia.fecha.toISOString().split('T')[0];
        
        if (index === 0) {
            estado.diaSeleccionado = dia.fecha.toISOString().split('T')[0];
        }
        
        card.innerHTML = `
            <div class="weekday">${diaSemana}</div>
            <div class="date">${diaMes} ${mes}</div>
            <div class="weather-icon">
                <i class="fas ${obtenerClaseIcono(item.weather[0].id, item.weather[0].icon)}"></i>
            </div>
            <div class="temp">${Math.round(item.main.temp)}${unidadTemp}</div>
            <div class="temp-range">
                ${Math.round(dia.temp_max)}° / ${Math.round(dia.temp_min)}°
            </div>
        `;
        
        card.addEventListener("click", () => {
            // Remover selección anterior
            document.querySelectorAll(".forecast-day").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            
            // Mostrar pronóstico por horas para este día
            estado.diaSeleccionado = card.dataset.fecha;
            mostrarPronosticoHoras(dia.fecha);
        });
        
        forecastDiv.appendChild(card);
    });
    
    // Mostrar horas para el primer día seleccionado
    if (proximosDias[0]) {
        mostrarPronosticoHoras(proximosDias[0].fecha);
    }
}

function mostrarPronosticoHoras(fechaSeleccionada) {
    if (!estado.pronosticoData) return;
    
    const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
    const horasDelDia = estado.pronosticoData.list.filter(item => {
        const itemFecha = new Date(item.dt * 1000);
        return itemFecha.toISOString().split('T')[0] === fechaStr;
    });
    
    const horasContainer = document.getElementById("horasContainer");
    horasContainer.innerHTML = "";
    
    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const fechaTexto = `${fechaSeleccionada.getDate()} ${nombresMeses[fechaSeleccionada.getMonth()]}`;
    
    document.getElementById("fechaSeleccionada").textContent = fechaTexto;
    
    if (horasDelDia.length === 0) {
        horasContainer.innerHTML = '<p class="text-center">No hay datos horarios para este día</p>';
        horasSection.style.display = "block";
        return;
    }
    
    const unidadTemp = estado.unidad === "metric" ? "°C" : "°F";
    const unidadViento = estado.unidad === "metric" ? "km/h" : "mph";
    
    horasDelDia.slice(0, 8).forEach(item => { // Mostrar máximo 8 horas
        const fecha = new Date(item.dt * 1000);
        const hora = fecha.getHours().toString().padStart(2, '0') + ':00';
        
        const card = document.createElement("div");
        card.className = "col-6 col-md-3";
        card.innerHTML = `
            <div class="hour-card">
                <div class="hour">${hora}</div>
                <div class="weather-icon-small mb-2">
                    <i class="fas ${obtenerClaseIcono(item.weather[0].id, item.weather[0].icon)}"></i>
                </div>
                <div class="temp">${Math.round(item.main.temp)}${unidadTemp}</div>
                <div class="feels-like">Sensación: ${Math.round(item.main.feels_like)}°</div>
                <div class="wind">
                    <i class="fas fa-wind me-1"></i>
                    ${obtenerDireccionViento(item.wind.deg)} ${Math.round(item.wind.speed)} ${unidadViento}
                </div>
            </div>
        `;
        
        horasContainer.appendChild(card);
    });
    
    horasSection.style.display = "block";
}

// ===== FUNCIONES UTILITARIAS =====
function obtenerClaseIcono(weatherId, iconCode) {
    if (weatherId >= 200 && weatherId < 300) return "fa-bolt"; // Tormenta
    if (weatherId >= 300 && weatherId < 400) return "fa-cloud-rain"; // Llovizna
    if (weatherId >= 500 && weatherId < 600) return "fa-cloud-showers-heavy"; // Lluvia
    if (weatherId >= 600 && weatherId < 700) return "fa-snowflake"; // Nieve
    if (weatherId >= 700 && weatherId < 800) return "fa-smog"; // Atmosférico
    if (weatherId === 800) return iconCode.includes('n') ? "fa-moon" : "fa-sun"; // Despejado
    if (weatherId > 800) return "fa-cloud"; // Nublado
    return "fa-cloud";
}

function obtenerDireccionViento(grados) {
    const direcciones = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
    const indice = Math.round(grados / 22.5) % 16;
    return direcciones[indice];
}

function aplicarEfectosClima(dataItem) {
    // Limpiar efectos anteriores
    rainEffect.classList.remove("active");
    windEffect.classList.remove("active");
    
    // Aplicar lluvia si está lloviendo
    if (dataItem.weather[0].id >= 500 && dataItem.weather[0].id < 600) {
        rainEffect.classList.add("active");
    }
    
    // Aplicar viento si hay mucho viento
    if (dataItem.wind.speed > 30) {
        windEffect.classList.add("active");
    }
}

function mostrarMensaje(texto, tipo = "info") {
    mensajesDiv.innerHTML = "";
    
    if (!texto) return;
    
    let clase = "alert-info";
    let icono = "info-circle";
    
    switch(tipo) {
        case "success":
            clase = "alert-success";
            icono = "check-circle";
            break;
        case "error":
            clase = "alert-danger";
            icono = "exclamation-circle";
            break;
        case "clear":
            return;
    }
    
    mensajesDiv.innerHTML = `
        <div class="alert ${clase} alert-dismissible fade show" role="alert">
            <i class="fas fa-${icono} me-2"></i>${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, "error");
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    themeToggle.addEventListener("click", cambiarTema);
    unidadBtn.addEventListener("click", cambiarUnidad);
    
    buscarBtn.addEventListener("click", () => {
        const opcionSeleccionada = localidadSelect.selectedOptions[0];
        if (!opcionSeleccionada || !opcionSeleccionada.dataset.lat) {
            mostrarError("Por favor, selecciona una localidad");
            return;
        }
        
        estado.latActual = parseFloat(opcionSeleccionada.dataset.lat);
        estado.lonActual = parseFloat(opcionSeleccionada.dataset.lon);
        cargarClimaActual();
    });
}

// Inicializar la aplicación
init();