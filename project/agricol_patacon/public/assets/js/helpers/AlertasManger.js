/* =========================================
   ALERT SYSTEM PRO v2.0
   Sistema avanzado de alertas con SweetAlert2
   ========================================= */

// ===============================
// CONFIGURACIÓN GLOBAL
// ===============================
export const AlertSystem = (() => {
    const config = {
        theme: "auto", // 'light', 'dark', 'auto'
        language: "es",
        defaultDuration: 3000,
        queueEnabled: true,
        animations: true,
        soundEnabled: false,
    };

    const i18n = {
        es: {
            confirm: "Aceptar",
            cancel: "Cancelar",
            close: "Cerrar",
            loading: "Procesando...",
            success: "Operación exitosa",
            error: "Ha ocurrido un error",
            warning: "Advertencia",
            info: "Información",
        },
        en: {
            confirm: "Accept",
            cancel: "Cancel",
            close: "Close",
            loading: "Processing...",
            success: "Successful operation",
            error: "An error occurred",
            warning: "Warning",
            info: "Information",
        },
    };

    // Cola de alertas
    class AlertQueue {
        constructor() {
            this.queue = [];
            this.isShowing = false;
        }

        add(alertFn) {
            this.queue.push(alertFn);
            if (!this.isShowing) this.processNext();
        }

        async processNext() {
            if (this.queue.length === 0) {
                this.isShowing = false;
                return;
            }

            this.isShowing = true;
            const alertFn = this.queue.shift();
            await alertFn();
            this.processNext();
        }
    }

    const queue = new AlertQueue();

    // ===============================
    // ESTILOS DINÁMICOS
    // ===============================
    function injectStyles() {
        if (document.getElementById("alert-system-styles")) return;

        const style = document.createElement("style");
        style.id = "alert-system-styles";
        style.innerHTML = `
      :root {
        --alert-radius: 20px;
        --alert-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        --alert-backdrop: rgba(0, 0, 0, 0.4);
      }

      /* Popup principal */
      .alert-popup {
        border-radius: var(--alert-radius);
        padding: 2rem;
        box-shadow: var(--alert-shadow);
        max-width: 440px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 0, 0, 0.05);
        animation: alertSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes alertSlideUp {
        from {
          transform: translateY(30px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      /* Contenedor de icono */
      .alert-icon-container {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 28px;
        position: relative;
        overflow: hidden;
      }

      .alert-icon-container::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        opacity: 0.1;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.1; }
        50% { transform: scale(1.1); opacity: 0.2; }
      }

      /* Tipos de iconos */
      .alert-success { 
        background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05));
        color: #22c55e; 
      }
      .alert-success::before { background: #22c55e; }

      .alert-error { 
        background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05));
        color: #ef4444; 
      }
      .alert-error::before { background: #ef4444; }

      .alert-warning { 
        background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05));
        color: #f59e0b; 
      }
      .alert-warning::before { background: #f59e0b; }

      .alert-info { 
        background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05));
        color: #3b82f6; 
      }
      .alert-info::before { background: #3b82f6; }

      /* Textos */
      .alert-title {
        font-size: 20px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 8px;
        color: #111827;
        letter-spacing: -0.01em;
      }

      .alert-message {
        font-size: 14px;
        color: #6b7280;
        text-align: center;
        line-height: 1.6;
      }

      /* Botones */
      .alert-btn {
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .alert-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .alert-btn:active {
        transform: translateY(0);
      }

      .btn-success { background: #22c55e; color: white; }
      .btn-error { background: #ef4444; color: white; }
      .btn-warning { background: #f59e0b; color: white; }
      .btn-info { background: #3b82f6; color: white; }
      .btn-primary { background: #8b5cf6; color: white; }

      .alert-btn-cancel {
        padding: 12px 28px;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #6b7280;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alert-btn-cancel:hover {
        border-color: #d1d5db;
        background: #f9fafb;
      }

      /* Toast notifications */
      .alert-toast {
        padding: 1rem 1.5rem !important;
        border-radius: 12px !important;
        backdrop-filter: blur(20px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .alert-toast .swal2-title {
        font-size: 14px !important;
        font-weight: 600;
        margin: 0 !important;
      }

      .alert-toast .swal2-icon {
        width: 24px !important;
        height: 24px !important;
        margin: 0 12px 0 0 !important;
      }

      /* Progress bar */
      .alert-progress {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 16px;
      }

      .alert-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        border-radius: 10px;
        transition: width 0.3s ease;
        animation: progressShimmer 1.5s infinite;
      }

      @keyframes progressShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Input personalizado */
      .alert-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        font-size: 14px;
        margin-top: 12px;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .alert-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      /* Modo oscuro */
      @media (prefers-color-scheme: dark) {
        .alert-popup {
          background: rgba(30, 41, 59, 0.98);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .alert-title {
          color: #f1f5f9;
        }

        .alert-message {
          color: #cbd5e1;
        }

        .alert-btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
        }

        .alert-input {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
        }
      }

      /* Responsive */
      @media (max-width: 640px) {
        .alert-popup {
          max-width: 90vw;
          padding: 1.5rem;
        }

        .alert-icon-container {
          width: 56px;
          height: 56px;
          font-size: 24px;
        }

        .alert-title {
          font-size: 18px;
        }
      }
    `;

        document.head.appendChild(style);
    }

    // ===============================
    // FUNCIÓN BASE
    // ===============================
    function createAlert(options) {
        const defaults = {
            icon: "bx bx-info-circle",
            iconClass: "alert-info",
            title: i18n[config.language].info,
            message: "",
            confirmText: i18n[config.language].confirm,
            confirmClass: "btn-primary",
            showCancel: false,
            cancelText: i18n[config.language].cancel,
            timer: null,
            showClose: true,
            backdrop: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            onConfirm: null,
            onCancel: null,
            onClose: null,
        };

        const opts = { ...defaults, ...options };

        const alertFn = () => {
            return Swal.fire({
                customClass: {
                    popup: "alert-popup",
                    confirmButton: `alert-btn ${opts.confirmClass}`,
                    cancelButton: "alert-btn-cancel",
                },
                buttonsStyling: false,
                showCancelButton: opts.showCancel,
                showCloseButton: opts.showClose,
                confirmButtonText: opts.confirmText,
                cancelButtonText: opts.cancelText,
                timer: opts.timer,
                backdrop: opts.backdrop ? "rgba(0, 0, 0, 0.4)" : false,
                allowOutsideClick: opts.allowOutsideClick,
                allowEscapeKey: opts.allowEscapeKey,
                html: `
          <div class="alert-icon-container ${opts.iconClass}">
            <i class="${opts.icon}"></i>
          </div>
          <h3 class="alert-title">${opts.title}</h3>
          <p class="alert-message">${opts.message}</p>
        `,
            }).then((result) => {
                if (result.isConfirmed && opts.onConfirm) opts.onConfirm();
                if (result.isDismissed && opts.onCancel) opts.onCancel();
                if (opts.onClose) opts.onClose();
                return result;
            });
        };

        if (config.queueEnabled) {
            queue.add(alertFn);
        } else {
            return alertFn();
        }
    }

    // ===============================
    // API PÚBLICA
    // ===============================
    return {
        init(options = {}) {
            Object.assign(config, options);
            injectStyles();
        },

        // Alertas básicas
        success(message, options = {}) {
            return createAlert({
                icon: "bx bx-check",
                iconClass: "alert-success",
                title: i18n[config.language].success,
                message,
                confirmClass: "btn-success",
                ...options,
            });
        },

        error(message, options = {}) {
            return createAlert({
                icon: "bx bx-x",
                iconClass: "alert-error",
                title: i18n[config.language].error,
                message,
                confirmClass: "btn-error",
                ...options,
            });
        },

        warning(message, options = {}) {
            return createAlert({
                icon: "bx bx-error",
                iconClass: "alert-warning",
                title: i18n[config.language].warning,
                message,
                confirmClass: "btn-warning",
                ...options,
            });
        },

        info(message, options = {}) {
            return createAlert({
                icon: "bx bx-info-circle",
                iconClass: "alert-info",
                title: i18n[config.language].info,
                message,
                confirmClass: "btn-info",
                ...options,
            });
        },

        // Confirmaciones
        confirm(title, message, onConfirm, options = {}) {
            return createAlert({
                icon: "bx bx-help-circle",
                iconClass: "alert-info",
                title,
                message,
                showCancel: true,
                confirmText: i18n[config.language].confirm,
                confirmClass: "btn-primary",
                onConfirm,
                ...options,
            });
        },

        confirmDelete(message, onConfirm, options = {}) {
            return createAlert({
                icon: "bx bx-trash",
                iconClass: "alert-error",
                title: "¿Eliminar?",
                message,
                showCancel: true,
                confirmText: "Eliminar",
                confirmClass: "btn-error",
                onConfirm,
                ...options,
            });
        },

        // Toast notifications
        toast(message, type = "info", duration = config.defaultDuration) {
            const icons = {
                success: "✓",
                error: "✕",
                warning: "⚠",
                info: "ℹ",
            };

            return Swal.fire({
                toast: true,
                position: "top-end",
                icon: type,
                iconHtml: icons[type],
                title: message,
                showConfirmButton: false,
                timer: duration,
                timerProgressBar: true,
                customClass: {
                    popup: "alert-toast",
                },
                didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                },
            });
        },

        // Loading
        loading(message = i18n[config.language].loading) {
            return Swal.fire({
                customClass: { popup: "alert-popup" },
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                html: `
          <div class="alert-icon-container alert-info">
            <i class="bx bx-loader-alt bx-spin"></i>
          </div>
          <h3 class="alert-title">${message}</h3>
        `,
            });
        },

        // Progreso
        progress(title, onCancel = null) {
            let currentProgress = 0;

            Swal.fire({
                customClass: { popup: "alert-popup" },
                allowOutsideClick: false,
                showCancelButton: !!onCancel,
                cancelButtonText: i18n[config.language].cancel,
                showConfirmButton: false,
                html: `
          <div class="alert-icon-container alert-info">
            <i class="bx bx-time"></i>
          </div>
          <h3 class="alert-title">${title}</h3>
          <div class="alert-progress">
            <div class="alert-progress-bar" id="alertProgressBar" style="width: 0%"></div>
          </div>
        `,
            }).then((result) => {
                if (result.isDismissed && onCancel) onCancel();
            });

            return {
                update: (progress) => {
                    currentProgress = Math.min(100, Math.max(0, progress));
                    const bar = document.getElementById("alertProgressBar");
                    if (bar) bar.style.width = `${currentProgress}%`;
                },
                close: () => Swal.close(),
            };
        },

        // Input
        input(title, placeholder, onSubmit, options = {}) {
            return createAlert({
                icon: "bx bx-edit",
                iconClass: "alert-info",
                title,
                message: `<input type="text" class="alert-input" placeholder="${placeholder}" id="alertInput">`,
                showCancel: true,
                confirmClass: "btn-primary",
                onConfirm: () => {
                    const value = document.getElementById("alertInput")?.value;
                    if (value && onSubmit) onSubmit(value);
                },
                ...options,
            });
        },

        // Utilidades
        close() {
            Swal.close();
        },

        clearQueue() {
            queue.queue = [];
        },

        setConfig(newConfig) {
            Object.assign(config, newConfig);
        },

        getConfig() {
            return { ...config };
        },
    };
})();

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
if (typeof window !== "undefined") {
    AlertSystem.init();
    window.AlertSystem = AlertSystem;

    // Aliases para retrocompatibilidad
    window.alertSuccess = (msg, opts) => AlertSystem.success(msg, opts);
    window.alertError = (msg, opts) => AlertSystem.error(msg, opts);
    window.alertWarning = (msg, opts) => AlertSystem.warning(msg, opts);
    window.alertInfo = (msg, opts) => AlertSystem.info(msg, opts);
    window.alertLoading = (msg) => AlertSystem.loading(msg);
    window.alertClose = () => AlertSystem.close();
    window.confirmAction = (title, msg, cb) =>
        AlertSystem.confirm(title, msg, cb);
    window.toast = (msg, type, duration) =>
        AlertSystem.toast(msg, type, duration);
}
