/* import  AlertSystem  from "./helpers/AlertasManger.js"; */

document.addEventListener("DOMContentLoaded", function () {
    const API = "http://localhost:3105/auth";
    const btnLogout = document.querySelector("#logout");
    const token = document
        .querySelector('meta[name="jwt"]')
        ?.getAttribute("content");

    // Validar que exista el botón
    if (!btnLogout) {
        console.warn("Botón de logout no encontrado");
        return;
    }

    // Validar que exista el token
    if (!token) {
        console.warn("Token JWT no encontrado en meta tag");
    }

    btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¡Cerrar sesión eliminará tu sesión actual!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
        });

        // Si cancela, no hacer nada
        if (!result.isConfirmed) return;

        // Mostrar loading
        Swal.fire({
            title: "Cerrando sesión...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            // 1. Cerrar sesión en la API (actualizar estado en BD)
            const apiResponse = await fetch(`${API}/cerrar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const apiData = await apiResponse.json();

            // Si hay error en la API
            if (!apiData.success || apiData.statusCode !== 200) {
                Swal.close();
                await Swal.fire({
                    title: "Error al cerrar sesión",
                    text: apiData.message || "Error desconocido en la API",
                    icon: "error",
                });
                return;
            }

            // 2. Cerrar sesión en Laravel
            const laravelResponse = await fetch("/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // 3. Limpiar almacenamiento local
            localStorage.clear();
            sessionStorage.clear();

            // 4. Cerrar loading
            Swal.close();

            // 5. Mostrar mensaje de éxito
            await Swal.fire({
                icon: "success",
                title: "Sesión cerrada",
                text: "Has cerrado sesión correctamente",
                timer: 1500,
                showConfirmButton: false,
            });
            // limpiar el historial
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, window.location.href);
                window.onpopstate = function () {
                    window.history.go(1);
                };
            }
            // 6. Redirigir al login
            window.location.href = "/login";

            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, window.location.href);
                window.onpopstate = function () {
                    window.history.go(1);
                };
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            // Limpiar de todos modos
            localStorage.clear();
            sessionStorage.clear();

            Swal.close();

            await Swal.fire({
                icon: "warning",
                title: "Sesión cerrada",
                text: "Hubo un problema pero tu sesión fue cerrada localmente",
                timer: 2000,
                showConfirmButton: false,
            });

            // Redirigir de todos modos
            window.location.href = "/login";
            // limpiar el historial
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, window.location.href);
                window.onpopstate = function () {
                    window.history.go(1);
                };
            }
        }
    });

    // ============================================
    // VERIFICACIÓN PERIÓDICA DE SESIÓN
    // ============================================

    let sessionCheckInterval = null;

    async function checkSession() {
        // Si no hay token, redirigir
        if (!token) {
            redirectToLogin();
            return;
        }

        try {
            const response = await fetch(`${API}/check`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            // Token válido
            if (data.success && data.statusCode === 200) {
                console.log(" Sesión activa");
                return;
            }

            // Token expirado (401)
            if (data.statusCode === 401) {
                console.log(" Token expirado");
                await handleSessionExpired(data.message);
                return;
            }

            // Token inválido (403)
            if (data.statusCode === 403) {
                console.log(" Token inválido");
                await handleInvalidToken(data.message);
                return;
            }
        } catch (error) {
            console.error("Error al verificar sesión:", error);
            // No redirigir en errores de red
        }
    }

    async function handleSessionExpired(message) {
        // Detener verificación
        stopSessionCheck();

        // Cerrar sesión en Laravel
        try {
            await fetch("/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error al cerrar sesión en Laravel:", error);
        }

        // Limpiar almacenamiento
        localStorage.clear();
        sessionStorage.clear();
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function () {
                window.history.go(1);
            };
        }

        // Mostrar alerta
        await Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: message || "Tu sesión ha expirado. Inicia sesión nuevamente.",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        // Redirigir
        redirectToLogin();
    }

    async function handleInvalidToken(message) {
        // Detener verificación
        stopSessionCheck();

        // Cerrar sesión en Laravel
        try {
            await fetch("/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        // Limpiar almacenamiento
        localStorage.clear();
        sessionStorage.clear();

        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function () {
                window.history.go(1);
            };
        }

        // Mostrar alerta
        await Swal.fire({
            icon: "error",
            title: "Sesión inválida",
            text: message || "Tu sesión es inválida. Inicia sesión nuevamente.",
            confirmButtonText: "Aceptar",
            allowOutsideClick: false,
            allowEscapeKey: false,
        });

        // Redirigir
        redirectToLogin();
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function () {
                window.history.go(1);
            };
        }
    }

    function redirectToLogin() {
        window.location.href = "/login";
    }

    function startSessionCheck() {
        // Verificar cada 5 minutos
        sessionCheckInterval = setInterval(
            async () => {
                const currentPath = window.location.pathname;
                const publicRoutes = [
                    "/login",
                    "/register",
                    "/forgot-password",
                ];

                // Solo verificar en rutas protegidas
                if (!publicRoutes.includes(currentPath)) {
                    await checkSession();
                }
            },
            5 * 60 * 1000,
        ); // 5 minutos
    }

    function stopSessionCheck() {
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
            sessionCheckInterval = null;
        }
    }

    // Iniciar verificación automática
    const currentPath = window.location.pathname;
    const publicRoutes = ["/login", "/register", "/forgot-password"];

    if (!publicRoutes.includes(currentPath)) {
        // Verificar inmediatamente al cargar
        checkSession();

        // Iniciar verificación periódica
        startSessionCheck();
    }

    // Detener al cerrar/recargar
    window.addEventListener("beforeunload", () => {
        stopSessionCheck();
    });

    // ============================================
    // HELPER PARA REQUESTS AUTENTICADOS
    // ============================================

    window.authenticatedFetch = async function (url, options = {}) {
        if (!token) {
            await Swal.fire({
                icon: "warning",
                title: "No autenticado",
                text: "Debes iniciar sesión para realizar esta acción",
                timer: 2000,
            });
            redirectToLogin();
            throw new Error("No hay token disponible");
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            // Manejar token expirado o inválido
            if (data.statusCode === 401) {
                await handleSessionExpired(data.message);
                throw new Error("Token expirado");
            }

            if (data.statusCode === 403) {
                await handleInvalidToken(data.message);
                throw new Error("Token inválido");
            }

            return data;
        } catch (error) {
            if (
                error.message === "Token expirado" ||
                error.message === "Token inválido"
            ) {
                throw error;
            }

            console.error("Error en request:", error);
            throw error;
        }
    };
});
