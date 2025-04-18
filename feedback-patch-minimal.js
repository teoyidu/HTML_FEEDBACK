// minimal-feedback-patch.js - Simple patch for feedback system
(function() {
    console.log("Applying minimal feedback system patch");

    // Wait for document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Apply initial fixes
        ensureCriticalElementsExist();

        // Apply remaining fixes after a short delay
        setTimeout(function() {
            deduplicateEventListeners();
            patchConnectionFunctions();
        }, 300);
    });

    // Make sure critical elements exist
    function ensureCriticalElementsExist() {
        // Critical elements that must exist
        const criticalElements = [
            { id: 'feedback-items', className: 'feedback-items' },
            { id: 'no-results', className: 'no-results hidden' },
            { id: 'results-count', className: 'results-count' },
            { id: 'connection-indicator', className: 'status-indicator' },
            { id: 'connection-text', content: 'Connecting to MongoDB...' }
        ];

        criticalElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                console.log(`Creating missing element: ${element.id}`);
                const el = document.createElement('div');
                el.id = element.id;
                if (element.className) el.className = element.className;
                if (element.content) el.textContent = element.content;

                // Add to appropriate container
                if (element.id === 'connection-indicator' || element.id === 'connection-text') {
                    let connectionStatus = document.querySelector('.connection-status');
                    if (!connectionStatus) {
                        connectionStatus = document.createElement('div');
                        connectionStatus.className = 'connection-status';
                        document.querySelector('.container').appendChild(connectionStatus);
                    }
                    connectionStatus.appendChild(el);
                } else {
                    document.querySelector('.container').appendChild(el);
                }
            }
        });

        // Ensure schema buttons exist
        ensureSchemaButtonsExist();
    }

    // Ensure schema buttons exist
    function ensureSchemaButtonsExist() {
        const schemaList = ["Mesai", "Mukavele", "Genel"];
        const schemaFilters = document.getElementById('schema-filters');

        if (!schemaFilters) {
            console.warn("Schema filters container not found, cannot create buttons");
            return;
        }

        const existingButtons = schemaFilters.querySelectorAll('.filter-btn[data-schema]');
        if (existingButtons.length === 0) {
            console.log("Creating schema filter buttons");

            schemaList.forEach(schema => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.schema = schema;
                button.textContent = schema;

                // Add event listener for schema filtering
                button.addEventListener('click', function() {
                    if (typeof window.filterBySchema === 'function') {
                        window.filterBySchema(schema);
                    }
                });

                schemaFilters.appendChild(button);
            });
        }
    }

    // Function to remove duplicate event listeners
    function deduplicateEventListeners() {
        const elementsToFix = [
            { selector: '#search-input', event: 'input', handler: function() {
                    window.searchQuery = this.value.toLowerCase();
                    if (typeof window.applyFilters === 'function') window.applyFilters();
                }},
            { selector: '#positive-filter', event: 'click', handler: function() {
                    if (window.activeFeedbackFilter === 'positive') {
                        window.activeFeedbackFilter = null;
                        this.classList.remove('active');
                    } else {
                        window.activeFeedbackFilter = 'positive';
                        this.classList.add('active');
                        document.getElementById('negative-filter')?.classList.remove('active');
                    }
                    if (typeof window.applyFilters === 'function') window.applyFilters();
                }},
            { selector: '#negative-filter', event: 'click', handler: function() {
                    if (window.activeFeedbackFilter === 'negative') {
                        window.activeFeedbackFilter = null;
                        this.classList.remove('active');
                    } else {
                        window.activeFeedbackFilter = 'negative';
                        this.classList.add('active');
                        document.getElementById('positive-filter')?.classList.remove('active');
                    }
                    if (typeof window.applyFilters === 'function') window.applyFilters();
                }},
            { selector: '#hidden-filter', event: 'click', handler: function() {
                    window.showHidden = !window.showHidden;
                    this.classList.toggle('active', window.showHidden);

                    if (window.showHidden) {
                        this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;">
              <rect width="20" height="5" x="2" y="3" rx="1"></rect>
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
              <path d="M10 12h4"></path>
            </svg>
            Hide Archived
          `;
                    } else {
                        this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;">
              <rect width="20" height="5" x="2" y="3" rx="1"></rect>
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
              <path d="M10 12h4"></path>
            </svg>
            Show Archived
          `;
                    }
                    if (typeof window.applyFilters === 'function') window.applyFilters();
                }},
            { selector: '.page-size-btn', event: 'click', handler: function() {
                    document.querySelectorAll('.page-size-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    window.pageSize = parseInt(this.dataset.size);
                    if (typeof window.renderItems === 'function') window.renderItems();
                }}
        ];

        elementsToFix.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(element => {
                // Clone element to remove all listeners
                const clone = element.cloneNode(true);

                if (element.parentNode) {
                    element.parentNode.replaceChild(clone, element);

                    // Re-attach handler
                    clone.addEventListener(item.event, item.handler);
                }
            });
        });

        console.log("Event listeners de-duplicated");
    }

    // Patch MongoDB connection functions
    function patchConnectionFunctions() {
        // Make sure connectToMongoDB is defined safely
        if (typeof window.connectToMongoDB !== 'function') {
            console.warn("connectToMongoDB function not found, creating placeholder");
            window.connectToMongoDB = async function(page = 0) {
                const connectionIndicator = document.getElementById('connection-indicator');
                const connectionText = document.getElementById('connection-text');

                if (connectionIndicator) {
                    connectionIndicator.classList.remove('connected');
                    connectionIndicator.classList.remove('disconnected');
                }

                if (connectionText) {
                    connectionText.textContent = `Connecting to MongoDB (page ${page + 1})...`;
                }

                // Call original if it exists
                if (typeof window._originalConnectToMongoDB === 'function') {
                    return window._originalConnectToMongoDB(page);
                }
            };
        } else {
            // Store reference to the original
            window._originalConnectToMongoDB = window.connectToMongoDB;

            // Create a safe wrapper
            window.connectToMongoDB = async function(page = 0) {
                try {
                    const connectionIndicator = document.getElementById('connection-indicator');
                    const connectionText = document.getElementById('connection-text');

                    if (connectionIndicator) {
                        connectionIndicator.classList.remove('connected');
                        connectionIndicator.classList.remove('disconnected');
                    }

                    if (connectionText) {
                        connectionText.textContent = `Connecting to MongoDB (page ${page + 1})...`;
                    }

                    // Call the original function
                    return await window._originalConnectToMongoDB(page);
                } catch (error) {
                    console.error("Error in connectToMongoDB:", error);

                    const connectionIndicator = document.getElementById('connection-indicator');
                    const connectionText = document.getElementById('connection-text');

                    if (connectionIndicator) {
                        connectionIndicator.classList.add('disconnected');
                    }

                    if (connectionText) {
                        connectionText.textContent = `Error connecting to MongoDB: ${error.message}`;
                    }
                }
            };
        }
    }
})();