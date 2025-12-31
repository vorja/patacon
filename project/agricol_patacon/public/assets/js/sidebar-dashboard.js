// tablet-sidebar.js
import { generarSidebar } from "./navigation-dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
    if (!window.usuario.rol || !window.modulo) return;

    const modulo = window.modulo;
    const rol = window.usuario.rol;
    generarSidebar(modulo, rol);
});
