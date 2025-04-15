// comprehensive-fix.js - Add this BEFORE all other scripts

(function() {
    console.log("Comprehensive Feedback System Fix - Loading...");

    // Core variables that will be synchronized with the application
    const config = {
        // Track if fixes have been applied
        fixesApplied: false,

        // Store references to original functions
        originalFunctions: {},

        // Default configuration values
        defaults: {
            pageSize: 20,
            showHidden: false,
            activeSchema: null,
            activeFeedbackFilter: null,
            searchQuery: '',
            currentPage: 0,
            totalPages: 1
        }
    };

    /**
     * This function runs when the document is ready to initialize all fixes
     */
    function initialize() {
        console.log("Initializing comprehensive fixes...");

        // Only apply fixes once
        if (config.fixesApplied) return;

        try {
            // Ensure required global variables exist
            ensureGlobalVariables();

            // Apply core function fixes
            patchCoreFunctions();

            // Ensure DOM is properly set up
            fixDOMStructure();

            // Set up monitoring for data changes
            setupDataMonitoring();

            // Mark fixes as applied
            config.fixesApplied = true;

            console.log("✅ All fixes applied successfully");

            // Check rendering after a delay to ensure other scripts have loaded
            setTimeout(checkAndRepairRendering, 1000);
        } catch (error) {
            console.error("Error applying comprehensive fixes:", error);
        }
    }

    /**
     * Create or ensure required global variables exist
     */
    function ensureGlobalVariables() {
        // Create data arrays if they don't exist
        if (typeof window.data === 'undefined' || !Array.isArray(window.data)) {
            window.data = [];
        }

        if (typeof window.filteredData === 'undefined' || !Array.isArray(window.filteredData)) {
            window.filteredData = [];
        }

        // Set other essential variables with defaults
        Object.entries(config.defaults).forEach(([key, defaultValue]) => {
            if (typeof window[key] === 'undefined') {
                window[key] = defaultValue;
            }
        });

        // Ensure API_BASE_URL is defined
        if (typeof window.API_BASE_URL === 'undefined') {
            window.API_BASE_URL = 'http://localhost:3000/api';
            console.warn("API_BASE_URL was undefined, set to default:", window.API_BASE_URL);
        }

        console.log("Global variables ensured");
    }

    /**
     * Fix critical DOM structure elements needed for rendering
     */
    function fixDOMStructure() {
        // Critical elements required for the application
        const criticalElements = [
            { id: 'feedback-items', class: 'feedback-items' },
            { id: 'no-results', class: 'no-results hidden' },
            { id: 'results-count', class: 'results-count' }
        ];

        // Container elements that should exist
        const container = document.querySelector('.container');

        // If container doesn't exist, create it
        if (!container) {
            console.warn("Container element missing - creating it");
            const newContainer = document.createElement('div');
            newContainer.className = 'container';
            document.body.appendChild(newContainer);
        }

        // Create any missing critical elements
        criticalElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                console.warn(`Critical element missing: ${element.id} - creating it`);

                const el = document.createElement('div');
                el.id = element.id;
                el.className = element.class;

                if (element.id === 'no-results') {
                    el.textContent = 'No questions found matching your criteria';
                }

                const targetContainer = document.querySelector('.container');
                if (targetContainer) {
                    targetContainer.appendChild(el);
                    console.log(`Created missing element: ${element.id}`);
                }
            }
        });

        console.log("DOM structure verified");
    }

    /**
     * Set up data change monitoring to detect when new data is loaded
     */
    function setupDataMonitoring() {
        // Only proxy data objects if they're arrays
        if (Array.isArray(window.data)) {
            // Store original arrays
            const originalData = window.data;

            // Create proxy for data array
            window.data = new Proxy(originalData, {
                set: function(target, property, value) {
                    // Set the property normally
                    target[property] = value;

                    // If length property changes, data is being updated
                    if (property === 'length') {
                        console.log(`Data array length changed to ${value}`);

                        // Check if we need to fix filtering issues
                        setTimeout(() => {
                            if (window.filteredData && window.filteredData.length === 0 && value > 0) {
                                console.warn("Data exists but filteredData is empty - recreating filtered data");
                                window.filteredData = [...window.data.filter(item => window.showHidden || !item.hidden)];

                                // Try rendering
                                safeRender();
                            }
                        }, 100);
                    }

                    return true;
                }
            });
        }

        console.log("Data monitoring enabled");
    }

    /**
     * Add the main patch for critical functions
     */
    function patchCoreFunctions() {
        // 1. Fix renderItems function
        if (typeof window.renderItems === 'function') {
            // Store original function
            config.originalFunctions.renderItems = window.renderItems;

            // Create patched version
            window.renderItems = function() {
                console.log("Enhanced renderItems called");

                try {
                    // Ensure critical DOM elements exist
                    const feedbackItems = document.getElementById('feedback-items');
                    const noResults = document.getElementById('no-results');
                    const resultsCount = document.getElementById('results-count');

                    if (!feedbackItems || !noResults || !resultsCount) {
                        console.error("Missing critical DOM elements - fixing...");
                        fixDOMStructure();
                    }

                    // Make sure we have filteredData
                    if (!window.filteredData || !Array.isArray(window.filteredData)) {
                        console.warn("filteredData is missing or not an array - regenerating");
                        window.filteredData = window.data ? [...window.data.filter(item => window.showHidden || !item.hidden)] : [];
                    }

                    // Call original function
                    config.originalFunctions.renderItems.apply(this, arguments);

                    // Check if items were rendered
                    if (feedbackItems && feedbackItems.children.length === 0 && window.filteredData && window.filteredData.length > 0) {
                        console.warn("Original renderItems didn't produce output despite having data - using fallback");
                        renderItemsFallback();
                    }
                } catch (error) {
                    console.error("Error in original renderItems:", error);
                    renderItemsFallback();
                }
            };
        } else {
            // Create new renderItems if it doesn't exist
            window.renderItems = renderItemsFallback;
            console.warn("renderItems function was missing - created fallback version");
        }

        // 2. Fix applyFilters function
        if (typeof window.applyFilters === 'function') {
            // Store original function
            config.originalFunctions.applyFilters = window.applyFilters;

            // Create patched version
            window.applyFilters = function() {
                console.log("Enhanced applyFilters called");

                // Ensure data exists
                if (!window.data) {
                    console.error("Data array is undefined");
                    return;
                }

                try {
                    // Get current filtered count for comparison
                    const countBefore = window.filteredData ? window.filteredData.length : 0;

                    // Call original function
                    config.originalFunctions.applyFilters.apply(this, arguments);

                    // Check if all data was filtered out
                    const countAfter = window.filteredData ? window.filteredData.length : 0;

                    if (countAfter === 0 && window.data.length > 0 && countBefore > 0) {
                        console.warn("All data was filtered out - filters may be too restrictive");

                        // Show alert message to user
                        const alert = createAlert("No items match current filters", "warning");

                        // Add reset button
                        const resetButton = document.createElement('button');
                        resetButton.textContent = "Reset Filters";
                        resetButton.style.cssText = "padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; margin-left: 10px; cursor: pointer;";
                        resetButton.addEventListener('click', function() {
                            resetAllFilters();
                            alert.remove();
                        });

                        alert.firstChild.appendChild(resetButton);
                    }
                } catch (error) {
                    console.error("Error in original applyFilters:", error);
                    // Use fallback filtering
                    applyFiltersFallback();
                }
            };
        } else {
            // Create new applyFilters if it doesn't exist
            window.applyFilters = applyFiltersFallback;
            console.warn("applyFilters function was missing - created fallback version");
        }

        // 3. Fix parseMessages function
        if (typeof window.parseMessages === 'function') {
            // Store original function
            config.originalFunctions.parseMessages = window.parseMessages;

            // Create patched version
            window.parseMessages = function(messagesString) {
                console.log("Enhanced parseMessages called");

                try {
                    // Call original function
                    const result = config.originalFunctions.parseMessages.call(this, messagesString);

                    // Validate result
                    if (!Array.isArray(result)) {
                        console.warn("parseMessages didn't return an array - using fallback");
                        return parseMessagesFallback(messagesString);
                    }

                    // Check if items have required fields
                    const invalidItems = result.filter(item => !item || typeof item !== 'object' || !item.hasOwnProperty('role') || !item.hasOwnProperty('message'));

                    if (invalidItems.length > 0) {
                        console.warn("parseMessages returned items with missing fields - using fallback");
                        return parseMessagesFallback(messagesString);
                    }

                    return result;
                } catch (error) {
                    console.error("Error in original parseMessages:", error);
                    return parseMessagesFallback(messagesString);
                }
            };
        } else {
            // Create new parseMessages if it doesn't exist
            window.parseMessages = parseMessagesFallback;
            console.warn("parseMessages function was missing - created fallback version");
        }

        // 4. Fix convertMongoDataToAppFormat function
        if (typeof window.convertMongoDataToAppFormat === 'function') {
            // Store original function
            config.originalFunctions.convertMongoDataToAppFormat = window.convertMongoDataToAppFormat;

            // Create patched version
            window.convertMongoDataToAppFormat = function(mongoData) {
                console.log("Enhanced convertMongoDataToAppFormat called");

                try {
                    // Call original function
                    const result = config.originalFunctions.convertMongoDataToAppFormat.call(this, mongoData);

                    // Validate result
                    if (!Array.isArray(result)) {
                        console.warn("convertMongoDataToAppFormat didn't return an array - using fallback");
                        return convertMongoDataFallback(mongoData);
                    }

                    // Check if items have required fields
                    const missingFields = [];
                    result.forEach((item, index) => {
                        if (!item || typeof item !== 'object') {
                            missingFields.push(`Item ${index} is not an object`);
                            return;
                        }

                        // Check for critical fields
                        ['id', 'question', 'conversation'].forEach(field => {
                            if (!item.hasOwnProperty(field)) {
                                missingFields.push(`Item ${index} missing field: ${field}`);
                            }
                        });

                        // Ensure conversation has the correct format
                        if (item.conversation && Array.isArray(item.conversation)) {
                            item.conversation.forEach((msg, msgIndex) => {
                                if (!msg.hasOwnProperty('role') || !msg.hasOwnProperty('message')) {
                                    missingFields.push(`Item ${index}, conversation message ${msgIndex} missing role or message property`);
                                }
                            });
                        }
                    });

                    if (missingFields.length > 0) {
                        console.warn("convertMongoDataToAppFormat returned items with issues:", missingFields);
                        console.warn("Attempting to fix data format issues");

                        // Try to fix missing fields rather than completely replacing
                        return result.map(item => {
                            if (!item || typeof item !== 'object') {
                                return null; // Skip invalid items
                            }

                            // Ensure all required fields exist
                            return {
                                id: item.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                                schema: item.schema || '',
                                question: item.question || 'No question found',
                                conversation: Array.isArray(item.conversation) ?
                                    item.conversation.map(msg => ({
                                        role: msg.role || 'unknown',
                                        message: msg.message || msg.content || 'No content'
                                    })) : [],
                                suggestions: Array.isArray(item.suggestions) ? item.suggestions : [],
                                cypherQueries: Array.isArray(item.cypherQueries) ? item.cypherQueries : [],
                                feedback: item.feedback || null,
                                hidden: !!item.hidden,
                                user: item.user || item.userName || 'Unknown',
                                datetime: item.datetime || 'No date',
                                timestamp: item.timestamp || Date.now(),
                                ...item // Keep additional fields
                            };
                        }).filter(Boolean); // Remove null items
                    }

                    return result;
                } catch (error) {
                    console.error("Error in original convertMongoDataToAppFormat:", error);
                    return convertMongoDataFallback(mongoData);
                }
            };
        } else {
            // Create new convertMongoDataToAppFormat if it doesn't exist
            window.convertMongoDataToAppFormat = convertMongoDataFallback;
            console.warn("convertMongoDataToAppFormat function was missing - created fallback version");
        }

        // 5. Make connectToMongoDB more robust if it exists
        if (typeof window.connectToMongoDB === 'function') {
            // Store original function
            config.originalFunctions.connectToMongoDB = window.connectToMongoDB;

            // Create patched version
            window.connectToMongoDB = async function(page = 0) {
                console.log("Enhanced connectToMongoDB called");

                try {
                    // Call original function
                    await config.originalFunctions.connectToMongoDB.apply(this, arguments);

                    // Check if data was loaded successfully
                    setTimeout(() => {
                        if ((!window.data || window.data.length === 0) &&
                            (!window.filteredData || window.filteredData.length === 0)) {
                            console.warn("connectToMongoDB did not populate data arrays - showing error UI");
                            showConnectionError();
                        }
                    }, 2000); // Check after 2 seconds
                } catch (error) {
                    console.error("Error in original connectToMongoDB:", error);
                    showConnectionError(error.message);
                }
            };
        }

        // 6. Fix openDialog/openConversationModal function if it exists
        ['openDialog', 'openConversationModal'].forEach(functionName => {
            if (typeof window[functionName] === 'function') {
                // Store original function
                config.originalFunctions[functionName] = window[functionName];

                // Create patched version
                window[functionName] = function(item) {
                    console.log(`Enhanced ${functionName} called`);

                    try {
                        // Ensure item has required fields
                        if (!item || typeof item !== 'object') {
                            console.error(`Invalid item passed to ${functionName}`);
                            return;
                        }

                        // Make sure conversation is properly formatted
                        if (!item.conversation || !Array.isArray(item.conversation)) {
                            console.warn("Item missing conversation array - creating default");
                            item.conversation = [
                                { role: 'user', message: item.question || 'No question found' },
                                { role: 'assistant', message: 'No conversation available' }
                            ];
                        }

                        // Call original function
                        config.originalFunctions[functionName].apply(this, arguments);
                    } catch (error) {
                        console.error(`Error in original ${functionName}:`, error);

                        // Show basic alert with conversation if dialog fails
                        const conversationText = item.conversation
                            .map(msg => `${msg.role}: ${msg.message}`)
                            .join('\n\n');

                        alert(`Conversation for "${item.question}"\n\n${conversationText}`);
                    }
                };
            }
        });

        console.log("Core functions patched");
    }

    /**
     * Fallback renderItems implementation
     */
    function renderItemsFallback() {
        console.log("Using fallback renderItems implementation");

        // Get required DOM elements
        const feedbackItems = document.getElementById('feedback-items');
        const noResults = document.getElementById('no-results');
        const resultsCount = document.getElementById('results-count');

        // Create them if missing
        if (!feedbackItems || !noResults || !resultsCount) {
            fixDOMStructure();
        }

        // Use new references after potential creation
        const feedbackItemsEl = document.getElementById('feedback-items');
        const noResultsEl = document.getElementById('no-results');
        const resultsCountEl = document.getElementById('results-count');

        if (!feedbackItemsEl || !noResultsEl || !resultsCountEl) {
            console.error("Critical DOM elements still missing after fix attempt");
            return;
        }

        // Make sure we have filtered data
        if (!window.filteredData || !Array.isArray(window.filteredData)) {
            window.filteredData = window.data ? [...window.data.filter(item => window.showHidden || !item.hidden)] : [];
        }

        // Update results count
        resultsCountEl.textContent = `Showing ${Math.min(window.pageSize || 20, window.filteredData.length)} of ${window.filteredData.length} results`;

        // Handle no results case
        if (window.filteredData.length === 0) {
            noResultsEl.classList.remove('hidden');
            feedbackItemsEl.innerHTML = '';
            return;
        }

        // Show results
        noResultsEl.classList.add('hidden');

        // Clear previous items
        feedbackItemsEl.innerHTML = '';

        // Render items
        window.filteredData.slice(0, window.pageSize || 20).forEach((item, index) => {
            // Create main container
            const itemElement = document.createElement('div');
            itemElement.className = `feedback-item${item.hidden ? ' hidden' : ''}${item.feedback === 'positive' ? ' positive' : item.feedback === 'negative' ? ' negative' : ''}`;
            itemElement.dataset.id = item.id;

            // Create content with flex layout to match expected structure
            itemElement.style.cssText = "display: flex; background-color: #1f2937; border-radius: 0.5rem; margin-bottom: 1rem; overflow: hidden;";

            // Left section - Schema buttons
            const schemaSection = document.createElement('div');
            schemaSection.className = 'schema-buttons';
            schemaSection.style.cssText = "display: flex; flex-direction: column; padding: 1rem; border-right: 1px solid #374151; min-width: 120px; align-items: center; gap: 0.5rem;";

            // Add schema buttons - use a default list if schemaList is not defined
            const schemas = window.schemaList || ["Mesai", "Mukavele", "Genel"];
            schemas.forEach(schema => {
                const btn = document.createElement('button');
                btn.className = `schema-btn${item.schema === schema ? ' active' : ''}`;
                btn.textContent = schema;
                btn.dataset.schema = schema;
                btn.style.cssText = `
          display: block;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.5rem;
          background-color: ${item.schema === schema ? '#2563eb' : '#1f2937'};
          color: ${item.schema === schema ? 'white' : '#d1d5db'};
          border: 1px solid ${item.schema === schema ? '#2563eb' : '#374151'};
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        `;

                // Add click handler if setSchema exists
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof window.setSchema === 'function') {
                        window.setSchema(item.id, schema);
                    } else {
                        // Fallback schema setting
                        item.schema = schema;
                        btn.style.backgroundColor = '#2563eb';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#2563eb';

                        // Reset other buttons
                        schemaSection.querySelectorAll('.schema-btn').forEach(otherBtn => {
                            if (otherBtn !== btn) {
                                otherBtn.style.backgroundColor = '#1f2937';
                                otherBtn.style.color = '#d1d5db';
                                otherBtn.style.borderColor = '#374151';
                            }
                        });
                    }
                });

                schemaSection.appendChild(btn);
            });

            // Middle section - Content
            const contentSection = document.createElement('div');
            contentSection.className = 'feedback-content';
            contentSection.style.cssText = "flex: 1; display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem;";

            // User info header
            const userInfo = document.createElement('div');
            userInfo.className = 'feedback-user-info';
            userInfo.style.cssText = "display: flex; justify-content: space-between; font-size: 0.8rem; color: #9ca3af; border-bottom: 1px solid #374151; padding-bottom: 0.5rem;";
            userInfo.innerHTML = `
        <span class="user-name">User: ${item.user || 'Unknown'}</span>
        <span class="datetime">${item.datetime || 'No date'}</span>
      `;
            contentSection.appendChild(userInfo);

            // Main question/conversation button
            const conversationBtn = document.createElement('button');
            conversationBtn.className = 'conversation-btn';
            conversationBtn.style.cssText = `
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background-color: #374151;
        border: none;
        border-radius: 0.5rem;
        color: white;
        font-size: 1rem;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s;
        min-height: 60px;
      `;
            conversationBtn.textContent = item.question || 'No question';
            conversationBtn.addEventListener('click', () => {
                // Open dialog using available function
                if (typeof window.openDialog === 'function') {
                    window.openDialog(item);
                } else if (typeof window.openConversationModal === 'function') {
                    window.openConversationModal(item);
                } else {
                    // Fallback dialog
                    const conversationText = Array.isArray(item.conversation) ?
                        item.conversation.map(msg => `${msg.role}: ${msg.message}`).join('\n\n') :
                        'No conversation available';

                    alert(`Conversation for "${item.question}"\n\n${conversationText}`);
                }
            });
            contentSection.appendChild(conversationBtn);

            // Small buttons container
            const smallButtons = document.createElement('div');
            smallButtons.className = 'small-buttons';
            smallButtons.style.cssText = "display: flex; gap: 0.5rem; width: 100%;";

            // Suggestions button
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.style.cssText = `
        flex: 1;
        padding: 0.5rem;
        background-color: #374151;
        border: none;
        border-radius: 0.5rem;
        color: white;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
            suggestionBtn.textContent = 'Suggestion';
            suggestionBtn.addEventListener('click', () => {
                if (typeof window.openSuggestionModal === 'function') {
                    window.openSuggestionModal(item);
                } else {
                    alert(`Suggestions for "${item.question}"\n\n${Array.isArray(item.suggestions) ? item.suggestions.join('\n') : 'No suggestions available'}`);
                }
            });
            smallButtons.appendChild(suggestionBtn);

            // Cypher button
            const cypherBtn = document.createElement('button');
            cypherBtn.className = 'cypher-btn';
            cypherBtn.style.cssText = `
        flex: 1;
        padding: 0.5rem;
        background-color: #374151;
        border: none;
        border-radius: 0.5rem;
        color: white;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
      `;
            cypherBtn.textContent = 'Cypher Query';
            cypherBtn.addEventListener('click', () => {
                if (typeof window.openCypherModal === 'function') {
                    window.openCypherModal(item);
                } else {
                    alert(`Cypher Queries for "${item.question}"\n\n${Array.isArray(item.cypherQueries) ? item.cypherQueries.join('\n\n') : 'No cypher queries available'}`);
                }
            });
            smallButtons.appendChild(cypherBtn);

            contentSection.appendChild(smallButtons);

            // Right section - Actions
            const actionsSection = document.createElement('div');
            actionsSection.className = 'feedback-actions';
            actionsSection.style.cssText = "display: flex; flex-direction: column; padding: 1rem; border-left: 1px solid #374151; justify-content: center; gap: 1rem;";

            // Action buttons
            const actionButtons = [
                {
                    type: 'positive',
                    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>`,
                    active: item.feedback === 'positive',
                    color: '#10b981',
                    hoverColor: '#059669',
                    onClick: (e) => {
                        e.stopPropagation();
                        if (typeof window.handlePositiveFeedback === 'function') {
                            window.handlePositiveFeedback(item.id);
                        } else {
                            // Fallback toggle
                            item.feedback = item.feedback === 'positive' ? null : 'positive';
                            e.currentTarget.style.backgroundColor = item.feedback === 'positive' ? '#10b981' : '#374151';

                            // Update other action buttons
                            const negativeBtn = actionsSection.querySelector('.action-btn.negative');
                            if (negativeBtn && item.feedback === 'positive') {
                                negativeBtn.style.backgroundColor = '#374151';
                            }
                        }
                    }
                },
                {
                    type: 'archive',
                    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                  <path d="M10 12h4"></path>
                </svg>`,
                    active: item.hidden,
                    color: '#f59e0b',
                    hoverColor: '#d97706',
                    onClick: (e) => {
                        e.stopPropagation();
                        if (typeof window.handleToggleHidden === 'function') {
                            window.handleToggleHidden(item.id);
                        } else {
                            // Fallback toggle
                            item.hidden = !item.hidden;
                            e.currentTarget.style.backgroundColor = item.hidden ? '#f59e0b' : '#374151';
                        }
                    }
                },
                {
                    type: 'negative',
                    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 14V2"></path>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                </svg>`,
                    active: item.feedback === 'negative',
                    color: '#ef4444',
                    hoverColor: '#dc2626',
                    onClick: (e) => {
                        e.stopPropagation();
                        if (typeof window.handleNegativeFeedback === 'function') {
                            window.handleNegativeFeedback(item.id);
                        } else {
                            // Fallback toggle
                            item.feedback = item.feedback === 'negative' ? null : 'negative';
                            e.currentTarget.style.backgroundColor = item.feedback === 'negative' ? '#ef4444' : '#374151';

                            // Update other action buttons
                            const positiveBtn = actionsSection.querySelector('.action-btn.positive');
                            if (positiveBtn && item.feedback === 'negative') {
                                positiveBtn.style.backgroundColor = '#374151';
                            }
                        }
                    }
                }
            ];

            // Create action buttons
            actionButtons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `action-btn ${button.type}`;
                btn.dataset.action = button.type;
                btn.innerHTML = button.icon;
                btn.style.cssText = `
          padding: 0.5rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: ${button.active ? button.color : '#374151'};
          color: white;
        `;

                // Hover effect
                btn.addEventListener('mouseover', () => {
                    btn.style.transform = 'scale(1.1)';
                    if (button.active) {
                        btn.style.backgroundColor = button.hoverColor;
                    } else {
                        btn.style.backgroundColor = '#4b5563';
                    }
                });

                btn.addEventListener('mouseout', () => {
                    btn.style.transform = 'scale(1)';
                    btn.style.backgroundColor = button.active ? button.color : '#374151';
                });

                // Click handler
                btn.addEventListener('click', button.onClick);

                actionsSection.appendChild(btn);
            });

            // Assemble all sections
            itemElement.appendChild(schemaSection);
            itemElement.appendChild(contentSection);
            itemElement.appendChild(actionsSection);

            // Add to container
            feedbackItemsEl.appendChild(itemElement);
        });

        console.log(`Fallback rendered ${Math.min(window.pageSize || 20, window.filteredData.length)} items`);
    }

    /**
     * Fallback applyFilters implementation
     */
    function applyFiltersFallback() {
        console.log("Using fallback applyFilters implementation");

        if (!window.data || !Array.isArray(window.data)) {
            console.error("Cannot apply filters: data is undefined or not an array");
            return;
        }

        // Start with all data
        let filtered = [...window.data];

        // Apply schema filter if active
        if (window.activeSchema) {
            filtered = filtered.filter(item => item.schema === window.activeSchema);
        }

        // Apply feedback filter if active
        if (window.activeFeedbackFilter) {
            filtered = filtered.filter(item => item.feedback === window.activeFeedbackFilter);
        }

        // Apply hidden filter
        if (!window.showHidden) {
            filtered = filtered.filter(item => !item.hidden);
        }

        // Apply search query
        if (window.searchQuery && window.searchQuery.length > 0) {
            const query = window.searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                // Search in question
                if (item.question && item.question.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in conversation
                if (item.conversation && Array.isArray(item.conversation)) {
                    return item.conversation.some(msg =>
                        msg.message && msg.message.toLowerCase().includes(query)
                    );
                }

                // Search in user name
                if (item.user && item.user.toLowerCase().includes(query)) {
                    return true;
                }

                return false;
            });
        }

        // Update filtered data
        window.filteredData = filtered;

        // Render items
        safeRender();
    }

    /**
     * Fallback parseMessages implementation
     */
    function parseMessagesFallback(messagesString) {
        console.log("Using fallback parseMessages implementation");

        // Handle null/undefined
        if (!messagesString) {
            return [{ role: 'user', message: 'No messages available' }];
        }

        // If it's not a string, return default message
        if (typeof messagesString !== 'string') {
            return [
                { role: 'user', message: 'Message parsing error' },
                { role: 'assistant', message: 'Unable to parse messages' }
            ];
        }

        try {
            // First try: Direct JSON parse
            try {
                const parsed = JSON.parse(messagesString);
                if (Array.isArray(parsed)) {
                    return parsed.map(msg => ({
                        role: msg.role || 'unknown',
                        message: msg.content || msg.message || 'No content'
                    }));
                }
            } catch (e) {
                // Continue to next approach
            }

            // Second try: Clean and parse JSON
            try {
                const cleaned = messagesString
                    .replace(/'/g, '"')
                    .replace(/(\w+)=/g, '"$1":');

                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) {
                    return parsed.map(msg => ({
                        role: msg.role || 'unknown',
                        message: msg.content || msg.message || 'No content'
                    }));
                }
            } catch (e) {
                // Continue to next approach
            }

            // Third try: Regex extraction
            const regex = /\{role=([^,]+), content=([^}]+)\}/g;
            const matches = [];
            let match;

            while ((match = regex.exec(messagesString)) !== null) {
                matches.push({
                    role: match[1].trim(),
                    message: match[2].trim()
                });
            }

            if (matches.length > 0) {
                return matches;
            }

            // Last resort
            return [
                { role: 'user', message: 'Could not parse conversation' },
                { role: 'assistant', message: 'Conversation format unknown' }
            ];
        } catch (error) {
            console.error("Error in parseMessagesFallback:", error);
            return [
                { role: 'user', message: 'Error parsing conversation' },
                { role: 'assistant', message: 'An error occurred while processing the conversation' }
            ];
        }
    }

    /**
     * Fallback convertMongoDataToAppFormat implementation
     */
    function convertMongoDataFallback(mongoData) {
        console.log("Using fallback convertMongoDataToAppFormat implementation");

        if (!mongoData || !Array.isArray(mongoData)) {
            console.error("Invalid MongoDB data:", mongoData);
            return [];
        }

        try {
            return mongoData.map(item => {
                try {
                    // Parse messages
                    const parsedMessages = parseMessagesFallback(item.messages || "[]");

                    // Find first user message for question
                    const firstUserMessage = parsedMessages.length > 0 ?
                        parsedMessages.find(msg => msg.role === 'user') : null;
                    const question = firstUserMessage ? firstUserMessage.message : 'No question found';

                    // Extract ID with multiple fallbacks
                    const id = item._id?.$oid ||
                        (typeof item._id === 'string' ? item._id : null) ||
                        item.id ||
                        item.uuid ||
                        `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

                    // Handle date/timestamp
                    let timestamp;
                    if (item.timestamp) {
                        timestamp = typeof item.timestamp === 'number' ?
                            item.timestamp : (typeof item.timestamp === 'string' ? parseInt(item.timestamp) : null);
                    } else if (item.RDate && item.RDate.$date) {
                        timestamp = new Date(item.RDate.$date).getTime();
                    } else {
                        timestamp = Date.now();
                    }

                    const date = new Date(timestamp);
                    const formattedDate = isNaN(date.getTime()) ? 'Invalid date' :
                        date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                    // Handle entitySuggesterData
                    let suggestions = [];
                    try {
                        if (item.entitySuggesterData && item.entitySuggesterData !== "[]") {
                            // Try different parsing approaches
                            if (typeof item.entitySuggesterData === 'string') {
                                // Try regex to extract suggestions
                                const suggestionMatches = item.entitySuggesterData.match(/suggestion=([^,}]+)/g) ||
                                    item.entitySuggesterData.match(/text=([^,}]+)/g);
                                if (suggestionMatches) {
                                    suggestions = suggestionMatches.map(match => {
                                        const value = match.replace(/^(suggestion|text)=/, '').trim();
                                        return value.replace(/^['"]|['"]$/g, '');
                                    }).filter(Boolean);
                                }
                            }
                        }
                    } catch (suggErr) {
                        console.warn("Error processing suggestions:", suggErr);
                    }

                    // Handle sql_query
                    let cypherQueries = [];
                    if (item.sql_query) {
                        if (typeof item.sql_query === 'string') {
                            cypherQueries = [item.sql_query];
                        } else if (Array.isArray(item.sql_query)) {
                            cypherQueries = item.sql_query;
                        }
                    }

                    // Create standardized item
                    return {
                        id: id,
                        schema: item.schema || '',
                        question: question,
                        conversation: parsedMessages,
                        suggestions: suggestions,
                        cypherQueries: cypherQueries,
                        feedback: item.feedback || null,
                        hidden: !!item.hidden,
                        user: item.userName || 'Unknown',
                        datetime: formattedDate,
                        timestamp: timestamp,
                        // Additional fields for compatibility
                        hasAgentHistoryData: item.agentHistoryFilteredData && item.agentHistoryFilteredData !== "[]",
                        hasContractIds: item.contract_ids && item.contract_ids !== "[]",
                        hasDocumentIds: item.document_ids && item.document_ids !== "[]",
                        hasEntitySuggesterData: item.entitySuggesterData && item.entitySuggesterData !== "[]",
                        agentHistoryFilteredData: item.agentHistoryFilteredData || "[]",
                        contractIds: item.contract_ids || "[]",
                        documentIds: item.document_ids || "[]",
                        entitySuggesterData: item.entitySuggesterData || "[]"
                    };
                } catch (itemError) {
                    console.error("Error converting item:", itemError, item);
                    return null;
                }
            }).filter(Boolean); // Remove null items
        } catch (error) {
            console.error("Error converting MongoDB data:", error);
            return [];
        }
    }

    /**
     * Safely call renderItems with error handling
     */
    function safeRender() {
        if (typeof window.renderItems === 'function') {
            try {
                window.renderItems();
            } catch (error) {
                console.error("Error in renderItems:", error);
                renderItemsFallback();
            }
        } else {
            renderItemsFallback();
        }
    }

    /**
     * Reset all filters to show all data
     */
    function resetAllFilters() {
        console.log("Resetting all filters");

        // Reset filter state
        window.activeSchema = null;
        window.activeFeedbackFilter = null;
        window.searchQuery = '';

        // Update UI elements to reflect reset

        // Reset schema filter buttons
        document.querySelectorAll('.filter-btn[data-schema]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Reset feedback filter buttons
        document.getElementById('positive-filter')?.classList.remove('active');
        document.getElementById('negative-filter')?.classList.remove('active');

        // Reset search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Regenerate filtered data
        window.filteredData = window.data ? [...window.data.filter(item => window.showHidden || !item.hidden)] : [];

        // Render items
        safeRender();

        // Show success message
        createAlert("Filters have been reset", "success");
    }

    /**
     * Display a connection error
     */
    function showConnectionError(message = 'Failed to connect to the database') {
        console.log("Showing connection error:", message);

        // Update connection indicator
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.remove('connected');
            connectionIndicator.classList.add('disconnected');
        }

        if (connectionText) {
            connectionText.textContent = `Error: ${message}`;
        }

        // Show alert message
        const alert = createAlert(
            `Connection Error: ${message}. Try refreshing the page or checking your API configuration.`,
            "error",
            true // Persistent
        );

        // Add retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = "Retry Connection";
        retryButton.style.cssText = "padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; margin-left: 10px; cursor: pointer;";
        retryButton.addEventListener('click', function() {
            alert.remove();
            if (typeof window.connectToMongoDB === 'function') {
                window.connectToMongoDB(0);
            }
        });

        alert.firstChild.appendChild(retryButton);

        // Add debug button
        const debugButton = document.createElement('button');
        debugButton.textContent = "Use Sample Data";
        debugButton.style.cssText = "padding: 4px 8px; background: #10b981; color: white; border: none; border-radius: 4px; margin-left: 10px; cursor: pointer;";
        debugButton.addEventListener('click', function() {
            alert.remove();
            loadSampleData();
        });

        alert.firstChild.appendChild(debugButton);
    }

    /**
     * Create and show an alert message
     */
    function createAlert(message, type = 'info', persistent = false) {
        const alertId = `alert-${Date.now()}`;
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 15px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 9999;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 80%;
    `;

        // Set background color based on type
        switch (type) {
            case 'success':
                alert.style.backgroundColor = '#10b981';
                break;
            case 'warning':
                alert.style.backgroundColor = '#f59e0b';
                break;
            case 'error':
                alert.style.backgroundColor = '#ef4444';
                break;
            default:
                alert.style.backgroundColor = '#3b82f6';
        }

        // Create content container
        const content = document.createElement('div');
        content.style.flexGrow = '1';
        content.textContent = message;
        alert.appendChild(content);

        // Add close button if persistent
        if (persistent) {
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        padding: 0 5px;
      `;
            closeButton.addEventListener('click', function() {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            });
            alert.appendChild(closeButton);
        }

        // Add to body
        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => {
            alert.style.opacity = '1';
        }, 10);

        // Auto remove if not persistent
        if (!persistent) {
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        }

        return alert;
    }

    /**
     * Load sample data for debugging
     */
    function loadSampleData() {
        // Create sample data
        const sampleData = [
            {
                id: "sample1",
                schema: "Mesai",
                question: "Bu hafta mesai saatlerim neler?",
                conversation: [
                    { role: "user", message: "Bu hafta mesai saatlerim neler?" },
                    { role: "assistant", message: "Bu haftaki mesai saatleriniz:\nPazartesi: 9:00-17:00\nSalı: 9:00-17:00\nÇarşamba: 10:00-18:00\nPerşembe: 9:00-17:00\nCuma: 9:00-16:00" }
                ],
                suggestions: ["Fazla mesai durumunu kontrol et", "İzin talebi oluştur", "Tatil günlerini göster"],
                cypherQueries: ["MATCH (e:Employee {id: '12345'})-[:HAS_SCHEDULE]->(s:Schedule) WHERE s.week = '2023-W42' RETURN s"],
                feedback: "positive",
                hidden: false,
                user: "kullanici1",
                datetime: "2023-10-20 14:32:45"
            },
            {
                id: "sample2",
                schema: "Mukavele",
                question: "Sözleşmemin bitiş tarihi ne zaman?",
                conversation: [
                    { role: "user", message: "Sözleşmemin bitiş tarihi ne zaman?" },
                    { role: "assistant", message: "Mevcut sözleşmeniz 31 Aralık 2023 tarihinde sona erecektir. Yenileme süreci hakkında bilgi almak ister misiniz?" }
                ],
                suggestions: ["Sözleşme şartlarını görüntüle", "Yenileme süreci hakkında bilgi al", "İK ile görüşme talep et"],
                cypherQueries: ["MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract) RETURN c.expiryDate"],
                feedback: "negative",
                hidden: false,
                user: "kullanici2",
                datetime: "2023-10-19 10:15:30"
            },
            {
                id: "sample3",
                schema: "Genel",
                question: "İzin talebinde nasıl bulunabilirim?",
                conversation: [
                    { role: "user", message: "İzin talebinde nasıl bulunabilirim?" },
                    { role: "assistant", message: "İzin talebinde bulunmak için:\n1. Çalışan portalına giriş yapın\n2. 'İzin Talepleri' bölümüne gidin\n3. 'Yeni İzin Talebi' butonuna tıklayın\n4. Tarih ve izin türünü seçin\n5. Onay için gönderin" }
                ],
                suggestions: ["İzin bakiyenizi kontrol edin", "Tatil takvimini görüntüle", "Hastalık izni politikasını öğren"],
                cypherQueries: ["MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.vacationDays"],
                feedback: null,
                hidden: true,
                user: "kullanici3",
                datetime: "2023-10-18 09:45:12"
            }
        ];

        // Update connection status
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.remove('disconnected');
            connectionIndicator.classList.add('connected');
        }

        if (connectionText) {
            connectionText.textContent = `DEBUG MODE: ${sampleData.length} sample records loaded`;
        }

        // Update global variables
        window.data = sampleData;
        window.filteredData = [...sampleData.filter(item => !item.hidden)];
        window.currentPage = 0;
        window.totalPages = 1;

        // Initialize tabs if available
        if (typeof window.initializeTabs === 'function') {
            window.initializeTabs(1);
        }

        // Render items
        safeRender();

        // Show success message
        createAlert("Sample data loaded successfully", "success");
    }

    /**
     * Check and fix rendering issues
     */
    function checkAndRepairRendering() {
        console.log("Checking for rendering issues...");

        // Get key elements
        const feedbackItems = document.getElementById('feedback-items');

        // Only proceed if we have the container
        if (!feedbackItems) {
            console.error("feedback-items element not found!");
            fixDOMStructure();
            return;
        }

        // Check if we have data but nothing is rendered
        if (window.data &&
            window.data.length > 0 &&
            (!window.filteredData || window.filteredData.length === 0)) {

            console.warn("Data exists but filtered data is empty - resetting filters");
            resetAllFilters();
            return;
        }

        // Check if we have filtered data but no rendered items
        if (window.filteredData &&
            window.filteredData.length > 0 &&
            feedbackItems.children.length === 0) {

            console.warn("Filtered data exists but nothing is rendered - attempting rendering fix");
            safeRender();
        }
    }

    // Run initialization when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded
        initialize();
    }

    // Expose utility functions globally for access from console
    window.feedbackSystemDebug = {
        resetFilters: resetAllFilters,
        fixRendering: checkAndRepairRendering,
        loadSampleData: loadSampleData
    };

    console.log("Comprehensive Feedback System Fix loaded successfully");
})();

