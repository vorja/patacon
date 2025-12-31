export function redirigirPorRol(modulo, rol) {
    const rolesConfig = {
        produccion: {
            Produccion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/recepcion01",
                        icon: "icon-box",
                        label: "Recepción01",
                    },
                    {
                        href: "/tablet/recepcion02",
                        icon: "icon-clipboard",
                        label: "Recepción02",
                    },
                    {
                        href: "/tablet/alistamiento03",
                        icon: "icon-paper",
                        label: "Alistamiento",
                    },
                    {
                        href: "/tablet/registrocorte04",
                        icon: "icon-stack-2",
                        label: "Cortes",
                    },
                    {
                        href: "/tablet/registrofritura05",
                        icon: "ft-thermometer",
                        label: "Fritura",
                    },
                    {
                        href: "/tablet/registrotemperatura06",
                        icon: "ft-home",
                        label: "Temperatura",
                    },
                    {
                        href: "/tablet/registroempaque07",
                        icon: "icon-layers",
                        label: "Empaque",
                    },
                    {
                        href: "/tablet/verificacionempaque08",
                        icon: "icon-square-check",
                        label: "Verificación Empaque",
                    },
                    {
                        href: "/tablet/home",
                        icon: "icon-reply",
                        label: "Hogar",
                    },
                ],
            },
            Recepcion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/recepcion01",
                        icon: "icon-box",
                        label: "Recepción01",
                    },
                    {
                        href: "/tablet/recepcion02",
                        icon: "icon-clipboard",
                        label: "Recepción02",
                    },
                    {
                        href: "/tablet/alistamiento03",
                        icon: "icon-paper",
                        label: "Alistamiento",
                    },
                    {
                        href: "/tablet/home",
                        icon: "icon-reply",
                        label: "Hogar",
                    },
                ],
            },
            Cortador: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrocorte04",
                        icon: "icon-stack-2",
                        label: "Cortes",
                    },
                    {
                        href: "/tablet/home",
                        icon: "icon-reply",
                        label: "Hogar",
                    },
                ],
            },
            Fritura: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrofritura05",
                        icon: "ft-thermometer",
                        label: "Fritura",
                    },
                    {
                        href: "/tablet/home",
                        icon: "icon-reply",
                        label: "Hogar",
                    },
                ],
            },
            Refrigeracion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrotemperatura06",
                        icon: "icon-home",
                        label: "Temperatura",
                    },
                    {
                        href: "/tablet/home",
                        icon: "icon-reply",
                        label: "Hogar",
                    },
                ],
            },
            Empaque: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registroempaque07",
                        icon: "ft-package",
                        label: "Empaque",
                    },
                    {
                        href: "/tablet/verificacionempaque08",
                        icon: "ft-check-square",
                        label: "Verificación Empaque",
                    },
                    {
                        href: "/tablet/registroempaque07",
                        icon: "ft-package",
                        label: "Inventario",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
        },
    };

    const configModulo = rolesConfig[modulo];
    if (!configModulo) {
        alert(`Módulo '${modulo}' no encontrado`);
        return;
    }

    const configRol = configModulo[rol];
    if (!configRol) {
        alert(`Rol '${rol}' no reconocido en módulo '${modulo}'`);
        return;
    }

    window.location.href = configRol.home;
}

export function generarSidebar(modulo, rol) {
    const rolesConfig = {
        produccion: {
            Produccion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/recepcion01",
                        icon: "ft-box",
                        label: "Recepción01",
                    },
                    {
                        href: "/tablet/recepcion02",
                        icon: "ft-file",
                        label: "Recepción02",
                    },
                    {
                        href: "/tablet/alistamiento03",
                        icon: "ft-clipboard",
                        label: "Alistamiento",
                    },
                    {
                        href: "/tablet/registrocorte04",
                        icon: "ft-layers",
                        label: "Cortes",
                    },
                    {
                        href: "/tablet/registrofritura05",
                        icon: "ft-thermometer",
                        label: "Fritura",
                    },
                    {
                        href: "/tablet/registrotemperatura06",
                        icon: "ft-home",
                        label: "Temperatura",
                    },
                    {
                        href: "/tablet/registroempaque07",
                        icon: "ft-package",
                        label: "Empaque",
                    },
                    {
                        href: "/tablet/verificacionempaque08",
                        icon: "ft-check-square",
                        label: "Verificación Empaque",
                    },
                    {
                        href: "/tablet/verificacioninventario",
                        icon: "ft-book",
                        label: "Inventario",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
            Recepcion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/recepcion01",
                        icon: "ft-box",
                        label: "Recepción01",
                    },
                    {
                        href: "/tablet/recepcion02",
                        icon: "ft-file",
                        label: "Recepción02",
                    },
                    {
                        href: "/tablet/alistamiento03",
                        icon: "ft-clipboard",
                        label: "Alistamiento",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
            Cortador: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrocorte04",
                        icon: "ft-layers",
                        label: "Cortes",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
            Fritura: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrofritura05",
                        icon: "ft-thermometer",
                        label: "Fritura",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
            Refrigeracion: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registrotemperatura06",
                        icon: "ft-home",
                        label: "Temperatura",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
            Empaque: {
                home: "/tablet/home",
                menu: [
                    {
                        href: "/tablet/registroempaque07",
                        icon: "ft-package",
                        label: "Empaque",
                    },
                    {
                        href: "/tablet/verificacionempaque08",
                        icon: "ft-check-square",
                        label: "Verificación Empaque",
                    },
                    {
                        href: "/tablet/registroempaque07",
                        icon: "ft-package",
                        label: "Inventario",
                    },
                    {
                        href: "/tablet/home",
                        icon: "ft-corner-down-left",
                        label: "Hogar",
                    },
                ],
            },
        },
    };

    const configModulo = rolesConfig[modulo];

    if (!configModulo) return;

    const configRol = configModulo[rol];

    if (!configRol) return;

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const ul = sidebar.querySelector("ul");
    ul.innerHTML = "";
    /* Segun el modulo administrativo o produccion, */

    configRol.menu.forEach((item) => {
        const li = document.createElement("li");
        li.setAttribute("data-tooltip", item.label);

        const a = document.createElement("a");
        a.href = item.href;

        a.className =
            "m-4 border-0 btn btn-toggle align-content-center align-content-lg-center rounded-4";

        const i = document.createElement("i");
        i.className = `${item.icon} text-white fs-2`;

        a.appendChild(i);
        li.appendChild(a);
        ul.appendChild(li);
    });
}
