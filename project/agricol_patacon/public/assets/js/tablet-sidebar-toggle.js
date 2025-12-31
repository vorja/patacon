import { generarSidebar } from "./navigation.js"; // Ajusta la ruta según tu estructura

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggle-sidebar");

    if (toggleButton && sidebar) {
        toggleButton.addEventListener("click", () => {
           
            sidebar.classList.toggle("hidden");
        });
    }

    if (!window.usuario.rol || !window.modulo) return;

    // Asegúrate de que los datos de usuario y módulo estén disponibles
    const rol = window.usuario.rol;
    const modulo = window.modulo;
    generarSidebar(modulo, rol);
});
