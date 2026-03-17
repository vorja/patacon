export const Url = "http://localhost:3105";

let fecha = new Date();

export const fechaHoy = "2026-03-14"
/* `${fecha.getFullYear()}-${
    fecha.getMonth() + 1
}-${fecha.getDate()}`;   */


// ============================================
// SERVICIO API PARA EL CLIENTE
// ============================================

export class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL || Url;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Retornar la respuesta normalizada
            return {
                success: data.success,
                statusCode: data.statusCode,
                type: data.type,
                message: data.message,
                data: data.data || null,
                errors: data.errors || null,
                timestamp: data.timestamp,
            };
        } catch (error) {
            // Error de red o servidor no responde
            return {
                success: false,
                statusCode: 0,
                type: "error",
                message: "Error de conexión con el servidor",
                data: null,
                errors: [{ message: error.message }],
                timestamp: new Date().toISOString(),
            };
        }
    }

    // Métodos HTTP
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
}
// ============================================
// SISTEMA DE ALERTAS
// ============================================

export class AlertManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de alertas si no existe
        if (!document.getElementById("alert-container")) {
            this.container = document.createElement("div");
            this.container.id = "alert-container";
            this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById("alert-container");
        }
    }

    show(response) {
        const { type, message, errors } = response;

        // Crear elemento de alerta
        const alert = document.createElement("div");
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
        padding: 16px 20px;
        margin-bottom: 12px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        background: ${this.getBackgroundColor(type)};
        color: ${this.getTextColor(type)};
        border-left: 4px solid ${this.getBorderColor(type)};
        display: flex;
        justify-content: space-between;
        align-items: start;
        `;

        // Contenido
        let content = `
        <div>
            <strong style="display: block; margin-bottom: 4px;">${this.getIcon(
                type
            )} ${this.getTitle(type)}</strong>
            <p style="margin: 0; font-size: 14px;">${message}</p>
        `;

        // Agregar errores si existen
        if (errors && errors.length > 0) {
            content +=
                '<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">';
            errors.forEach((error) => {
                content += `<li>${
                    error.field ? `<strong>${error.field}:</strong> ` : ""
                }${error.message}</li>`;
            });
            content += "</ul>";
        }

        content += "</div>";

        // Botón de cerrar
        content += `
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        margin-left: 12px;
      ">×</button>
    `;

        alert.innerHTML = content;
        this.container.appendChild(alert);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            alert.style.animation = "slideOut 0.3s ease-out";
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
    getBackgroundColor(type) {
        const colors = {
            success: "#d4edda",
            error: "#f8d7da",
            warning: "#fff3cd",
            info: "#d1ecf1",
        };
        return colors[type] || colors.info;
    }

    getTextColor(type) {
        const colors = {
            success: "#155724",
            error: "#721c24",
            warning: "#856404",
            info: "#0c5460",
        };
        return colors[type] || colors.info;
    }

    getBorderColor(type) {
        const colors = {
            success: "#28a745",
            error: "#dc3545",
            warning: "#ffc107",
            info: "#17a2b8",
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: "✓",
            error: "✕",
            warning: "⚠",
            info: "ℹ",
        };
        return icons[type] || icons.info;
    }

    getTitle(type) {
        const titles = {
            success: "Éxito",
            error: "Error",
            warning: "Advertencia",
            info: "Información",
        };
        return titles[type] || titles.info;
    }
}

// animaciones CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
