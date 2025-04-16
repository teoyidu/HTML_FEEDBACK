// Create a standardized DOM element access utility
// Add this to a new file called "dom-utils.js"

window.DOMUtils = (function() {
    // Critical elements required for the application to function
    const CRITICAL_ELEMENTS = [
        { id: 'feedback-items', class: 'feedback-items' },
        { id: 'no-results', class: 'no-results hidden', text: 'No questions found matching your criteria' },
        { id: 'results-count', class: 'results-count' },
        { id: 'connection-indicator', class: 'status-indicator' },
        { id: 'connection-text', text: 'Connecting to MongoDB...' }
    ];

    // Get or create an element
    function getElement(id, autocreate = true) {
        let element = document.getElementById(id);

        if (!element && autocreate) {
            console.warn(`Element with ID '${id}' not found - creating it`);

            // Find element definition
            const elementDef = CRITICAL_ELEMENTS.find(def => def.id === id);

            if (elementDef) {
                element = document.createElement('div');
                element.id = id;
                element.className = elementDef.class || '';

                if (elementDef.text) {
                    element.textContent = elementDef.text;
                }

                // Find appropriate container
                let container;
                if (id === 'connection-indicator' || id === 'connection-text') {
                    container = document.querySelector('.connection-status');
                    if (!container) {
                        container = document.createElement('div');
                        container.className = 'connection-status';
                        const mainContainer = document.querySelector('.container');
                        if (mainContainer) {
                            mainContainer.insertBefore(container, mainContainer.firstChild);
                        } else {
                            document.body.appendChild(container);
                        }
                    }
                } else {
                    container = document.querySelector('.container');
                    if (!container) {
                        container = document.createElement('div');
                        container.className = 'container';
                        document.body.appendChild(container);
                    }
                }

                container.appendChild(element);
            }
        }

        // Return either the found/created element or a safe dummy
        return element || {
            classList: { add: () => {}, remove: () => {}, toggle: () => {} },
            style: {},
            textContent: '',
            innerHTML: '',
            appendChild: () => {}
        };
    }

    // Ensure all critical elements exist
    function ensureCriticalElements() {
        CRITICAL_ELEMENTS.forEach(def => getElement(def.id, true));
    }

    // Public API
    return {
        getElement,
        ensureCriticalElements
    };
})();

// Update problematic code in other scripts
// For example, in feedback-system-fixes.js (line 12):
// REPLACE:
// const element = document.getElementById(id);
// if (!element) { ... }

// WITH:
// const element = window.DOMUtils.getElement(id);