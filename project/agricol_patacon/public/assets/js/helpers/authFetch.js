async function authenticatedFetch(url, options = {}) {
    const token = document
        .querySelector('meta[name="jwt"]')
        .getAttribute("content");

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
        // Si ya manejamos el error de autenticación, no mostrar alerta adicional
        if (
            error.message === "Token expirado" ||
            error.message === "Token inválido"
        ) {
            throw error;
        }

        // Otro tipo de error
        console.error("Error en request:", error);
        throw error;
    }
}
