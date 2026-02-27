import { redirigirPorRol } from "./navigation.js";
import { redirigirPorRolAdministrativo } from "./navigation-dashboard.js";


const txtUsuario = document.querySelector("#usuario");
const txtPassword = document.querySelector("#password");
const correoFeedBack = document.querySelector("#correoFeedBack");
const passwordFeedBack = document.querySelector("#passwordFeedBack");
const API_URL = document.body.getAttribute("data-api-url");
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizarUsuario(userName) {
    userName = escapeHtml(userName.trim());
    const regex = /^[a-zA-Z0-9]*$/;
    if (regex.test(userName)) return userName;
    throw new Error("Usuario inválido");
}

function sanitizarPassword(password) {
    password = escapeHtml(password.trim());
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@_\-*!\.]{8,}$/;
    if (regex.test(password)) return password;
    throw new Error(
        "Contraseña inválida. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y solo usar símbolos (@ _ - * ! .)"
    );
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    // Validaciones simples de campos vacíos
    let errors = false;
    txtPassword.classList.remove("is-invalid");
    txtUsuario.classList.remove("is-invalid");
    if (!txtUsuario.value.trim()) {
        txtUsuario.classList.add("is-invalid");
        correoFeedBack.textContent = "Completa este campo";
        errors = true;
    }
    if (!txtPassword.value.trim()) {
        txtPassword.classList.add("is-invalid");
        passwordFeedBack.textContent = "Completa este campo";
        errors = true;
    }
    if (errors) return;

    // Sanitización
    try {
        txtUsuario.value = sanitizarUsuario(txtUsuario.value);
        txtPassword.value = sanitizarPassword(txtPassword.value);
    } catch (error) {
        Swal.fire({
            title: "Atención!",
            text: error.message,
            icon: "warning",
            showConfirmButton: false,
            timer: 2300,
        });
        txtUsuario.value = "";
        txtPassword.value = "";
        return;
    }

    try {
        const response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: txtUsuario.value,
                password: txtPassword.value,
            }),
        });
        const dataUsuario = await response.json();
        const { data } = dataUsuario;
        console.log(data)
        if (response.ok) {
            await fetch("/sesion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                credentials: "same-origin",
                body: JSON.stringify(data),
            });

            if (data.modulo === "administrativo") {
                redirigirPorRolAdministrativo(data.modulo, data.usuario.rol);
            } else {
               redirigirPorRol(data.modulo, data.usuario.rol);
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: dataUsuario.message || "Credenciales inválidas",
                showConfirmButton: false,
                timer: 3000,
            });
            txtUsuario.value = "";
            txtPassword.value = "";
            txtUsuario.focus();
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data?.error || "Credenciales inválidas",
            showConfirmButton: false,
            timer: 3000,
        });
        txtUsuario.value = "";
        txtPassword.value = "";
        txtUsuario.focus();
    }
});
