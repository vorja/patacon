export function redirigirPorRolAdministrativo(modulo, rol) {
    const rolesConfig = {
        administrativo: {
            Dashboard: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "fa-solid fa-file-text",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/produccion`,
                        icon: "fa-solid fa-tags",
                        label: "Produccion",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },
                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/recepcion`,
                        icon: "fa-solid fa-truck-loading",
                        label: "Recepcion",
                    },
                    {
                        href: `/database/alistamiento`,
                        icon: "fa-solid fa-table-cells",
                        label: "Alistamiento",
                    },
                    {
                        href: `/database/cortes`,
                        icon: "fa-solid fa-scale-balanced",
                        label: "Corte",
                    },
                    {
                        href: `/database/fritura`,
                        icon: "fa-regular fa-clock",
                        label: "Fritura",
                    },
                    {
                        href: `/database/empaque`,
                        icon: "fa-solid fa-box-open",
                        label: "Empaque",
                    },
                    {
                        href: `/database/temperatura`,
                        icon: "fa-solid fa-temperature-full",
                        label: "Temperatura",
                    },
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Registros",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
            },
            Gerente: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "ft-file-text m-2",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
            },
            Productor: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/produccion`,
                        icon: "fa-solid fa-tags",
                        label: "Produccion",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/recepcion`,
                        icon: "fa-solid fa-truck-loading",
                        label: "Recepcion",
                    },
                    {
                        href: `/database/alistamiento`,
                        icon: "fa-solid fa-table-cells",
                        label: "Alistamiento",
                    },
                    {
                        href: `/database/cortes`,
                        icon: "fa-solid fa-scale-balanced",
                        label: "Corte",
                    },
                    {
                        href: `/database/fritura`,
                        icon: "fa-regular fa-clock",
                        label: "Fritura",
                    },
                    {
                        href: `/database/empaque`,
                        icon: "fa-regular fa-box-open",
                        label: "Empaque",
                    },
                    {
                        href: `/database/temperatura`,
                        icon: "fa-solid fa-temperature-full",
                        label: "Temperatura",
                    },
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Insumos",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
            },
            RRHH: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "fa-solid fa-file-text",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },
                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Registros",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
            },
        },
    };

    const configModulo = rolesConfig[modulo];
    if (!configModulo) {
        alert(`Módulo '${modulo}' no encontrado`);
        console.log(`Módulo '${modulo}' no encontrado`);
        return;
    }

    const configRol = configModulo[rol];
    if (!configRol) {
        alert(`Rol '${rol}' no reconocido en módulo '${modulo}'`);
        console.log(`Rol '${rol}' no reconocido en módulo '${modulo}'`);

        return;
    }

    window.location.href = configRol.home;
}

export function generarSidebar(modulo, rol) {
    const rolesConfig = {
        administrativo: {
            Dashboard: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "fa-solid fa-file-text",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/produccion`,
                        icon: "fa-solid fa-tags",
                        label: "Produccion",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },
                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/recepcion`,
                        icon: "fa-solid fa-truck-loading",
                        label: "Recepcion",
                    },
                    {
                        href: `/database/alistamiento`,
                        icon: "fa-solid fa-table-cells",
                        label: "Alistamiento",
                    },
                    {
                        href: `/database/cortes`,
                        icon: "fa-solid fa-scale-balanced",
                        label: "Corte",
                    },
                    {
                        href: `/database/fritura`,
                        icon: "fa-regular fa-clock",
                        label: "Fritura",
                    },
                    {
                        href: `/database/empaque`,
                        icon: "fa-solid fa-box-open",
                        label: "Empaque",
                    },
                    {
                        href: `/database/temperatura`,
                        icon: "fa-solid fa-temperature-full",
                        label: "Temperatura",
                    },
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Registros",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
            },
            Gerente: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "fa-solid fa-file-text",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/produccion`,
                        icon: "fa-solid fa-tags",
                        label: "Produccion",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },
                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
            },
            Productor: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/produccion`,
                        icon: "fa-solid fa-tags",
                        label: "Produccion",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                    {
                        href: `/database/referencias`,
                        icon: "fa-solid fa-tag",
                        label: "Referencias",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/recepcion`,
                        icon: "fa-solid fa-truck-loading",
                        label: "Recepcion",
                    },
                    {
                        href: `/database/alistamiento`,
                        icon: "fa-solid fa-table-cells",
                        label: "Alistamiento",
                    },
                    {
                        href: `/database/cortes`,
                        icon: "fa-solid fa-scale-balanced",
                        label: "Corte",
                    },
                    {
                        href: `/database/fritura`,
                        icon: "fa-regular fa-clock",
                        label: "Fritura",
                    },
                    {
                        href: `/database/empaque`,
                        icon: "fa-regular fa-box-open",
                        label: "Empaque",
                    },
                    {
                        href: `/database/temperatura`,
                        icon: "fa-solid fa-temperature-full",
                        label: "Temperatura",
                    },
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Registros",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
                    },
                ],
            },
            RRHH: {
                home: "/panel",
                menuAdmin: [
                    {
                        href: `/database/ordenes`,
                        icon: "fa-solid fa-file-text",
                        label: "Ordenes",
                    },
                    {
                        href: `/database/cliente`,
                        icon: "fa-solid fa-briefcase",
                        label: "Clientes",
                    },

                    {
                        href: `/database/usuarios`,
                        icon: "fa-solid fa-users",
                        label: "Usuarios",
                    },
                    {
                        href: `/database/empleados`,
                        icon: "fa-solid fa-id-badge",
                        label: "Empleados",
                    },
                    {
                        href: `/database/sesiones`,
                        icon: "fa-solid fa-desktop",
                        label: "Sesiones",
                    },
                    {
                        href: `/database/rol`,
                        icon: "fa-solid fa-user-tag",
                        label: "Roles",
                    },
                ],
                menuProd: [
                    {
                        href: `/database/bodega`,
                        icon: "fa-solid fa-boxes-stacked",
                        label: "Bodega",
                    },
                    {
                        href: `/database/materia-recepcionada`,
                        icon: "fa-solid fa-seedling",
                        label: "Materia",
                    },
                ],
                menuProv: [
                    {
                        href: `/database/proveedores`,
                        icon: "fa-solid fa-truck",
                        label: "Plátano",
                    },
                    {
                        href: `/database/proveedoresInsumos`,
                        icon: "fa-solid fa-box",
                        label: "Insumos",
                    },
                ],
                menuInsumos: [
                    {
                        href: `/database/insumos`,
                        icon: "fa-solid fa-boxes-packing",
                        label: "Registros",
                    },
                    {
                        href: `/database/inventario`,
                        icon: "fa-regular fa-clipboard",
                        label: "Inventario",
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

    const ulAdmin = sidebar.querySelector(".submenuAdmin");
    const ulProduccion = sidebar.querySelector(".submenuProd");
    const ulProveedores = sidebar.querySelector(".submenuProv");
    const ulInsumos = sidebar.querySelector(".submenuInsumos");

    ulAdmin.innerHTML = "";
    ulProduccion.innerHTML = "";
    ulProveedores.innerHTML = "";
    ulInsumos.innerHTML = "";

    // Función recursiva para generar items con posible submenú
    function crearItem(item) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.href;
        a.className = "sidebar-item";
        a.innerHTML = `<i class="${item.icon}" ></i> ${item.label}`;
        li.appendChild(a);

        return li;
    }

    // Menú administrativo
    configRol.menuAdmin.forEach((item) => {
        ulAdmin.appendChild(crearItem(item));
    });

    // Menú de producción
    configRol.menuProd.forEach((item) => {
        ulProduccion.appendChild(crearItem(item));
    });

    // Menú de proveedores
    configRol.menuProv.forEach((item) => {
        ulProveedores.appendChild(crearItem(item));
    });

    // Menú de Insumos
    configRol.menuInsumos.forEach((item) => {
        ulInsumos.appendChild(crearItem(item));
    });
}
