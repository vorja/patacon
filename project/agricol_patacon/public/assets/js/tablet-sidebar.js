// tablet-sidebar.js
import { generarSidebar } from "./navigation.js";

document.addEventListener("DOMContentLoaded", () => {
    if (!window.usuario.rol || !window.modulo) return;

    const modulo = window.modulo;
    const rol = window.usuario.rol;

   
    generarSidebar(modulo, rol);
});
