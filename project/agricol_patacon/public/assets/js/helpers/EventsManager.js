/**
 * EventManager - Sistema centralizado para manejar event listeners
 * Previene memory leaks y facilita la limpieza de eventos
 */
class EventManager {
    constructor() {
        // Almacena todas las referencias a listeners activos
        this.listeners = new Map();
        // Contador para IDs únicos
        this.idCounter = 0;
    }

    /**
     * Registra un event listener y retorna un ID único
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Tipo de evento ('click', 'input', etc.)
     * @param {Function} handler - Función manejadora
     * @param {Object} options - Opciones del listener
     * @returns {number} ID del listener para removerlo después
     */
    add(element, event, handler, options = {}) {
        if (!element) {
            console.warn("EventManager: Elemento no encontrado");
            return null;
        }

        const id = ++this.idCounter;

        // Almacenar referencia
        this.listeners.set(id, {
            element,
            event,
            handler,
            options,
        });

        // Agregar el listener
        element.addEventListener(event, handler, options);

        return id;
    }

    /**
     * Agrega un listener con debounce
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Tipo de evento
     * @param {Function} handler - Función original
     * @param {number} delay - Retraso en ms
     * @returns {number} ID del listener
     */
    addDebounced(element, event, handler, delay = 300) {
        const debouncedHandler = this.debounce(handler, delay);
        return this.add(element, event, debouncedHandler);
    }

    /**
     * Remueve un listener específico por ID
     * @param {number} id - ID del listener a remover
     */
    remove(id) {
        const listener = this.listeners.get(id);

        if (!listener) {
            console.warn(`EventManager: Listener ${id} no encontrado`);
            return;
        }

        const { element, event, handler, options } = listener;
        element.removeEventListener(event, handler, options);
        this.listeners.delete(id);
    }

    /**
     * Remueve todos los listeners de un elemento
     * @param {HTMLElement} element - Elemento DOM
     */
    removeFromElement(element) {
        const idsToRemove = [];

        this.listeners.forEach((listener, id) => {
            if (listener.element === element) {
                idsToRemove.push(id);
            }
        });

        idsToRemove.forEach((id) => this.remove(id));
    }

    /**
     * Remueve TODOS los listeners registrados
     * Útil al destruir la aplicación o cambiar de página
     */
    removeAll() {
        this.listeners.forEach((listener, id) => {
            const { element, event, handler, options } = listener;
            element.removeEventListener(event, handler, options);
        });

        this.listeners.clear();
        console.log("EventManager: Todos los listeners eliminados");
    }

    /**
     * Función debounce reutilizable
     * @param {Function} func - Función a ejecutar
     * @param {number} delay - Retraso en ms
     * @returns {Function} Función con debounce aplicado
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Delegación de eventos (para elementos dinámicos)
     * @param {HTMLElement} parent - Elemento padre
     * @param {string} event - Tipo de evento
     * @param {string} selector - Selector CSS del elemento hijo
     * @param {Function} handler - Función manejadora
     * @returns {number} ID del listener
     */
    delegate(parent, event, selector, handler) {
        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, e);
            }
        };

        return this.add(parent, event, delegatedHandler);
    }

    /**
     * Obtiene información de todos los listeners activos
     * Útil para debugging
     */
    getStats() {
        const stats = {
            total: this.listeners.size,
            byEvent: {},
            byElement: {},
        };

        this.listeners.forEach((listener) => {
            // Contar por tipo de evento
            stats.byEvent[listener.event] =
                (stats.byEvent[listener.event] || 0) + 1;

            // Contar por elemento
            const elementName = listener.element.tagName || "unknown";
            stats.byElement[elementName] =
                (stats.byElement[elementName] || 0) + 1;
        });

        return stats;
    }

    /**
     * Lista todos los listeners (para debugging)
     */
    list() {
        console.table(
            Array.from(this.listeners.entries()).map(([id, listener]) => ({
                ID: id,
                Elemento: listener.element.id || listener.element.tagName,
                Evento: listener.event,
                Función: listener.handler.name || "anonymous",
            }))
        );
    }
}

// Exportar una instancia singleton
const eventManager = new EventManager();

// Limpiar al cerrar/recargar la página
window.addEventListener("beforeunload", () => {
    eventManager.removeAll();
});

export default eventManager;
