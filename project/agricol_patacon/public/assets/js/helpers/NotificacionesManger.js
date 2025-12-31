// notificaciones.js
class NotificationManager {
    constructor() {
        this.socket = null;
        this.notificaciones = [];
        this.maxNotificaciones = 10;
        this.onNewNotification = null;
    }

    // Inicializar conexión WebSocket
    connect(url = "ws://localhost:3105") {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log(" Conexión WebSocket establecida");
        };

        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === "Notificacion") {
                this.agregarNotificacion(msg.data);
            }
        };

        this.socket.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        this.socket.onclose = () => {
            console.log("Conexión WebSocket cerrada. Reconectando...");
            setTimeout(() => this.connect(url), 3000);
        };
    }

    // Agregar nueva notificación
    agregarNotificacion(data) {
        const notificacion = {
            id: Date.now(),
            title: data.Title,
            fecha: data.Fecha,
            leida: false,
            timestamp: new Date().toLocaleTimeString(),
        };

        this.notificaciones.unshift(notificacion);

        // Limitar cantidad de notificaciones
        if (this.notificaciones.length > this.maxNotificaciones) {
            this.notificaciones.pop();
        }

        // Actualizar UI
        this.actualizarUI();

        // Mostrar toast/alerta
        this.mostrarAlerta(notificacion);

        // Callback personalizado
        if (this.onNewNotification) {
            this.onNewNotification(notificacion);
        }
    }

    // Actualizar interfaz de usuario
    actualizarUI() {
        const container = document.querySelector(".dropdown-menu");
        if (!container) return;

        const contador = this.notificaciones.filter((n) => !n.leida).length;

        // Actualizar badge de contador
        const badge = document.querySelector(".notification-badge");
        if (badge) {
            badge.textContent = contador;
            badge.style.display = contador > 0 ? "inline-block" : "none";
        }

        // Renderizar lista de notificaciones
        this.renderizarLista(container);
    }

    // Renderizar lista de notificaciones
    renderizarLista(container) {
        const html = `
            <h6 class="dropdown-header fw-bold">
                Notificaciones 
                ${
                    this.notificaciones.filter((n) => !n.leida).length > 0
                        ? `<span class="badge bg-danger ms-2">${
                              this.notificaciones.filter((n) => !n.leida).length
                          }</span>`
                        : ""
                }
            </h6>
            ${
                this.notificaciones.length === 0
                    ? '<div class="dropdown-item text-muted">No hay notificaciones</div>'
                    : this.notificaciones
                          .map(
                              (n) => `
                    <a class="dropdown-item d-flex align-items-center gap-2 ${
                        n.leida ? "text-muted" : ""
                    }" 
                       data-id="${n.id}" 
                       style="cursor: pointer;">
                        <i class="fas fa-bell text-primary"></i>
                        <div class="flex-grow-1">
                            <div class="fw-semibold">${n.title}</div>
                            <small class="text-muted">${n.timestamp} - ${
                                  n.fecha
                              }</small>
                        </div>
                        ${
                            !n.leida
                                ? '<span class="badge bg-primary">Nuevo</span>'
                                : ""
                        }
                    </a>
                `
                          )
                          .join("")
            }
            ${
                this.notificaciones.length > 0
                    ? '<hr class="dropdown-divider"><a class="dropdown-item text-center" id="marcar-todas-leidas" style="cursor: pointer;">Marcar todas como leídas</a>'
                    : ""
            }
        `;

        container.innerHTML = html;

        // Agregar listeners para marcar como leída
        container
            .querySelectorAll(".dropdown-item[data-id]")
            .forEach((item) => {
                item.addEventListener("click", (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    this.marcarComoLeida(id);
                });
            });

        // Agregar listener para marcar todas como leídas
        const btnMarcarTodas = container.querySelector("#marcar-todas-leidas");
        if (btnMarcarTodas) {
            btnMarcarTodas.addEventListener("click", () => {
                this.marcarTodasLeidas();
            });
        }
    }

    // Mostrar alerta visual
    mostrarAlerta(notificacion) {
        // Verificar si el navegador soporta notificaciones
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(notificacion.title, {
                body: `Fecha: ${notificacion.fecha}`,
                icon: "/images/notification-icon.png",
            });
        }

        // Toast notification
        const toast = document.createElement("div");
        toast.className = "toast-notification";
        toast.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show shadow-lg" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="fas fa-check-circle me-2"></i>
                <strong>${notificacion.title}</strong>
                <br>
                <small>Fecha: ${notificacion.fecha}</small>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(toast);

        // Reproducir sonido
        this.reproducirSonido();

        // Eliminar después de 5 segundos
        setTimeout(() => toast.remove(), 5000);
    }

    // Reproducir sonido de notificación
    reproducirSonido() {
        const audio = new Audio(
            "data:audio/wav;base64,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"
        );
        audio.volume = 0.3;
        audio.play().catch((e) => console.error("Error al reproducir:", e));
    }

    // Marcar notificación como leída
    marcarComoLeida(id) {
        const notificacion = this.notificaciones.find((n) => n.id === id);
        if (notificacion) {
            notificacion.leida = true;
            this.actualizarUI();
        }
    }

    // Marcar todas como leídas
    marcarTodasLeidas() {
        this.notificaciones.forEach((n) => (n.leida = true));
        this.actualizarUI();
    }

    // Solicitar permisos de notificación del navegador
    solicitarPermisos() {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }
}

// Crear instancia global
const notificationManager = new NotificationManager();

// Hacer disponible globalmente
window.notificationManager = notificationManager;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    notificationManager.connect();
    notificationManager.solicitarPermisos();
});

export default notificationManager;
