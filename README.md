# 🍽️ Aura Gourmet - Sistema de Reservas Gastronómicas

**Aura Gourmet** es una aplicación web interactiva diseñada para modernizar la gestión de reservas en restaurantes de alta gama. Reemplaza el registro manual por una plataforma digital centralizada que permite a los comensales seleccionar su mesa exacta en tiempo real mediante un plano interactivo.

---

## 👥 Integrantes y Roles

| Integrante | Rol | Responsabilidades |
| :--- | :--- | :--- |
| **Canaza Mamani, Brayan Jesús** | Diseñador UI/UX (Bocetos) | Diseño de wireframes de baja fidelidad  |
| **Lizonde García, Diego Alberto** | Diseñador UI/UX (Prototipado) | Construcción del prototipo interactivo en Figma según requerimientos y guía de diseño. |
| **Armas Castro, José Luis** | Desarrollo Frontend & Coordinación | Desarrollo integral de la aplicación en React 19 + Vite + Tailwind CSS, lógica de negocio (`useReservations.ts`), plano interactivo (`FloorPlan.tsx`), persistencia local y redacción de la documentación. |

---

## 🚀 Características Principales

* 🗺️ **Plano Interactivo de Mesas:** Visualización de 13 mesas distribuidas en 4 zonas funcionales (Ventanales Panorámicos, Salón Central, Terraza Jardín y Zona VIP & Cava).
* ⏱️ **Disponibilidad en Tiempo Real:** Filtro automático por fecha, turno y cantidad de comensales.
* 📱 **Validaciones Inteligentes:** Restricciones en formularios para formato de teléfono celular e impedimento de reservas duplicadas.
* 💾 **Persistencia de Datos:** Gestión de estado global y sincronización continua con `localStorage`.
* 📊 **Módulo de Reportes Gerenciales:** Análisis de tasa de ocupación, horas pico, ingresos estimados y cumplimiento.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 19
* **Lenguaje:** TypeScript
* **Herramienta de Construcción:** Vite
* **Estilos:** Tailwind CSS (Paleta Dark Luxury)
* **Iconos:** Lucide React
* **Feedback Visual:** Canvas Confetti

---

## 💻 Instalación y Ejecución Local

Sigue estos pasos para clonar e iniciar el proyecto localmente:

```bash
# 1. Clonar el repositorio
git clone [https://github.com/JLAC-1/aura-gourmet.git](https://github.com/JLAC-1/aura-gourmet.git)

# 2. Entrar a la carpeta del proyecto
cd aura-gourmet

# 3. Instalar las dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
