# 🌤️ Clima Argentina

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)

Aplicación web moderna y responsive para consultar el clima en tiempo real de cualquier localidad de Argentina. Con pronóstico extendido, animaciones climáticas y diseño adaptable a todos los dispositivos.

## 🚀 **Demo en Vivo**

🌐 **Accede a la aplicación:** [https://clima-argentina.netlify.app](https://clima-argentina.netlify.app)

## 📸 **Vistas de la Aplicación**

### **1. Modo Oscuro 🌙**
 <img width="962" height="863" alt="image" src="https://github.com/user-attachments/assets/1f7ff7fb-9069-40c1-83ba-80cd40caa42c" />
 <img width="1043" height="665" alt="image" src="https://github.com/user-attachments/assets/2c3c706c-a587-4feb-8d90-deb9f53954b0" />
*Interfaz principal en modo oscuro con animaciones de clima*

### **2. Modo Claro ☀️**
<img width="1002" height="795" alt="image" src="https://github.com/user-attachments/assets/344d880a-cb4e-4cc1-a3ad-f86989423e87" />
<img width="897" height="583" alt="image" src="https://github.com/user-attachments/assets/05b5fae3-210f-460e-b6c1-8093ee65cbeb" />

*Misma interfaz en modo claro para uso diurno*

## ✨ **Características Principales**

### 🌍 **Ubicación y Búsqueda**
- **Provincias y localidades** completas de Argentina
- **Geolocalización automática** (usando tu ubicación actual)
- **Búsqueda rápida** por nombre de ciudad

### 📊 **Datos Climáticos**
- **Clima actual** con temperatura, humedad, viento y presión
- **Pronóstico 5 días** con temperaturas mínimas y máximas
- **Pronóstico por horas** (cada 3 horas)
- **Sensación térmica** y detalles adicionales

### 🎨 **Interfaz y Experiencia**
- **Modo oscuro/claro** (con persistencia)
- **Cambio de unidades** °C / °F
- **Animaciones climáticas** en tiempo real:
  - 🌧️ Gotas de lluvia cuando llueve
  - 💨 Hojas volando con viento fuerte
  - ☀️ Efecto de calor intenso
- **Diseño 100% responsive** (mobile, tablet, desktop)
- **Transiciones suaves** y efectos visuales

### 💾 **Persistencia**
- Guarda última ubicación buscada
- Recuerda preferencias de tema y unidad
- Carga automática al iniciar

## 🔧 **Tecnologías Utilizadas**

| Tecnología | Uso |
|------------|-----|
| **HTML5** | Estructura semántica |
| **CSS3** | Estilos y animaciones (Variables CSS, Flexbox, Grid) |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Bootstrap 5** | Framework CSS responsive |
| **Font Awesome** | Iconografía |
| **OpenWeatherMap API** | Datos climáticos |
| **Georef Argentina API** | Provincias y localidades |
| **Netlify** | Hosting y deploy |

## 🌐 **APIs Utilizadas**

### 1. **OpenWeatherMap API** 🌤️
- **URL:** `https://api.openweathermap.org/data/2.5/`
- **Uso:** Obtiene datos climáticos en tiempo real y pronóstico
- **Endpoints:**
  - `/weather` - Clima actual
  - `/forecast` - Pronóstico 5 días (3 horas)
- **Características:**
  - Datos en español
  - Unidades métricas/imperiales
  - Coordenadas geográficas

### 2. **Georef Argentina API** 🇦🇷
- **URL:** `https://apis.datos.gob.ar/georef/api/`
- **Uso:** Listado completo de provincias y localidades argentinas
- **Endpoints:**
  - `/provincias` - Todas las provincias
  - `/localidades` - Localidades por provincia
- **Características:**
  - Datos oficiales de Argentina
  - Coordenadas geográficas precisas
  - Actualización constante

### 3. **Geolocation API** 📍
- **Nativo del navegador**
- **Uso:** Obtiene ubicación del usuario
- **Permisos:** Requiere autorización del usuario

## 🛠️ **Instalación Local**

### Prerrequisitos
- Navegador web moderno
- Conexión a internet (para APIs)
- Editor de código (VS Code, Sublime, etc.)

### Pasos para ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/clima-argentina.git

# 2. Navegar al directorio
cd clima-argentina

# 3. Obtener API Key de OpenWeatherMap
#    - Regístrate en: https://openweathermap.org/api
#    - Obtén tu API Key gratuita

# 4. Configurar API Key
#    Edita el archivo script.js y reemplaza:
#    const API_KEY = "TU_API_KEY_AQUI";

# 5. Abrir en navegador
#    Simplemente abre index.html en tu navegador
