// ultimate-pagination-fix.js - Comprehensive fix for pagination issues

(function() {
    console.log("🛠️ ULTIMATE PAGINATION FIX - LOADING");

    // ===== UTILITY FUNCTIONS =====
    // Show a notification message
    function showNotification(message, type = 'info') {
        console.log(`Notification (${type}): ${message}`);

        // Create notification element if it doesn't exist
        let notification = document.getElementById('fix-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'fix-notification';
            notification.style.position = 'fixed';
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.padding = '10px 15px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            notification.style.transition = 'opacity 0.3s ease';
            notification.style.color = 'white';
            document.body.appendChild(notification);
        }

        // Set notification style based on type
        notification.style.backgroundColor = type === 'error' ? '#dc2626' :
            type === 'success' ? '#10b981' : '#2563eb';

        // Set message and animate
        notification.textContent = message;
        notification.style.opacity = '1';

        // Hide after a delay
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 5000);
    }

    // Log diagnostic info
    function logDiagnostics(message) {
        console.log(`🔍 DIAGNOSTICS: ${message}`);
    }

    // Add styled debug panel
    function addDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '10px';
        panel.style.right = '10px';
        panel.style.width = '300px';
        panel.style.maxHeight = '200px';
        panel.style.overflow = 'auto';
        panel.style.backgroundColor = '#1f2937';
        panel.style.borderRadius = '5px';
        panel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        panel.style.zIndex = '9999';
        panel.style.padding = '10px';
        panel.style.border = '1px solid #374151';
        panel.style.fontSize = '12px';
        panel.style.fontFamily = 'monospace';
        panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #374151;padding-bottom:5px;">
        <span style="font-weight:bold;color:#e5e7eb;">Pagination Fix Debug</span>
        <button id="debug-close" style="background:none;border:none;color:#e5e7eb;cursor:pointer;">X</button>
      </div>
      <div id="debug-content" style="color:#d1d5db;"></div>
    `;
        document.body.appendChild(panel);

        // Add close functionality
        document.getElementById('debug-close').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        return panel;
    }

    // Update debug panel
    function updateDebugPanel(text) {
        const content = document.getElementById('debug-content');
        if (content) {
            const entry = document.createElement('div');
            entry.textContent = text;
            entry.style.borderBottom = '1px dotted #374151';
            entry.style.paddingBottom = '4px';
            entry.style.marginBottom = '4px';
            content.appendChild(entry);

            // Auto-scroll to bottom
            content.scrollTop = content.scrollHeight;
        }
    }

    // ===== BEGIN ACTUAL FIX =====
    function applyFix() {
        logDiagnostics("Starting fix application");
        showNotification("Applying pagination fix...", "info");

        // Initialize debug panel
        const debugPanel = addDebugPanel();
        updateDebugPanel("Fix initialization started");

        // ===== APPROACH 1: OVERRIDE API FUNCTIONS =====
        // Create a new fetch function that bypasses the pagination limits
        window.fetchAllRecords = async function(pageSize) {
            try {
                logDiagnostics(`Fetching ${pageSize} records directly from API`);
                updateDebugPanel(`Fetching ${pageSize} records`);

                if (!window.API_BASE_URL) {
                    throw new Error("API_BASE_URL not defined");
                }

                // Show loading indicator
                showNotification(`Loading ${pageSize} records...`, "info");

                // Make direct API call to get all records at once
                const apiUrl = `${window.API_BASE_URL}/conversations?page=0&limit=${pageSize}`;
                logDiagnostics(`API URL: ${apiUrl}`);

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                const recordCount = result.data ? result.data.length : 0;

                logDiagnostics(`Received ${recordCount} records from API`);
                updateDebugPanel(`Received ${recordCount} records`);

                if (!result.data) {
                    throw new Error("No data received from API");
                }

                // Process the data
                if (typeof window.convertMongoDataToAppFormat === 'function') {
                    window.data = window.convertMongoDataToAppFormat(result.data);
                } else {
                    window.data = result.data;
                }

                // Set filtered data based on current filters
                window.filteredData = [...window.data];

                // Apply any active filters
                applyActiveFilters();

                // Show success message
                showNotification(`Loaded ${recordCount} records successfully`, "success");

                // Force render all items
                renderAllItems();

                return true;
            } catch (error) {
                logDiagnostics(`API Error: ${error.message}`);
                updateDebugPanel(`Error: ${error.message}`);
                showNotification(`Error: ${error.message}`, "error");
                return false;
            }
        };

        // Apply active filters to filteredData
        function applyActiveFilters() {
            let filtered = [...window.data];

            // Apply schema filter if active
            if (window.activeSchema) {
                filtered = filtered.filter(item => item.schema === window.activeSchema);
            }

            // Apply type filter if active
            if (window.activeTypeFilter) {
                filtered = filtered.filter(item => (item.type || 'Unknown') === window.activeTypeFilter);
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
            if (window.searchQuery) {
                filtered = filtered.filter(item =>
                    (item.question && item.question.toLowerCase().includes(window.searchQuery)) ||
                    (item.query && item.query.toLowerCase().includes(window.searchQuery))
                );
            }

            window.filteredData = filtered;
            logDiagnostics(`Applied filters: ${filtered.length} items remain`);
            updateDebugPanel(`Filtered: ${filtered.length} items`);
        }

        // ===== APPROACH 2: CUSTOM RENDER FUNCTION =====
        // Custom function to render all items
        function renderAllItems() {
            logDiagnostics("Rendering all items with custom function");
            updateDebugPanel("Rendering all items");

            const feedbackItems = document.getElementById('feedback-items');
            const resultsCount = document.getElementById('results-count');

            if (!feedbackItems) {
                logDiagnostics("ERROR: feedback-items container not found");
                return;
            }

            // Update results count
            if (resultsCount) {
                resultsCount.textContent = `Showing ${window.filteredData.length} of ${window.data.length} records`;
            }

            // Hide tabs temporarily
            const tabsContainer = document.getElementById('tabs-container');
            if (tabsContainer) {
                tabsContainer.style.display = 'none';
            }

            // Clear container with a visual indicator that we're using the custom render
            feedbackItems.innerHTML = '';

            // Add custom header to indicate we're using the fix
            const fixHeader = document.createElement('div');
            fixHeader.className = 'fix-header';
            fixHeader.style.padding = '10px';
            fixHeader.style.marginBottom = '15px';
            fixHeader.style.backgroundColor = '#1f2937';
            fixHeader.style.borderRadius = '5px';
            fixHeader.style.border = '1px solid #374151';
            fixHeader.style.display = 'flex';
            fixHeader.style.justifyContent = 'space-between';
            fixHeader.style.alignItems = 'center';

            fixHeader.innerHTML = `
        <div>
          <span style="color: #10b981; font-weight: bold;">✓ PAGINATION FIX ACTIVE</span>
          <span style="margin-left: 10px; color: #9ca3af;">Showing all ${window.filteredData.length} records</span>
        </div>
        <button id="restore-tab-view" style="padding: 5px 10px; background-color: #4b5563; border: none; border-radius: 5px; color: white; cursor: pointer;">
          Return to Tab View
        </button>
      `;

            feedbackItems.appendChild(fixHeader);

            // Add button event listener
            document.getElementById('restore-tab-view').addEventListener('click', function() {
                restoreTabView();
            });

            // Render all items from filteredData
            window.filteredData.forEach((item, index) => {
                try {
                    const itemElement = createItemElement(item, index);
                    feedbackItems.appendChild(itemElement);

                    // Animate in
                    setTimeout(() => {
                        itemElement.style.opacity = '1';
                        itemElement.style.transform = 'translateY(0)';
                    }, Math.min(index * 10, 1000)); // Cap delay for performance
                } catch (error) {
                    logDiagnostics(`Error creating item ${index}: ${error.message}`);
                }
            });

            // Update debug status
            updateDebugPanel(`Rendered ${window.filteredData.length} items`);
        }

        // Create feedback item element
        function createItemElement(item, index) {
            const itemElement = document.createElement('div');
            itemElement.className = `feedback-item${item.hidden ? ' hidden' : ''}${item.feedback === 'positive' ? ' positive' : item.feedback === 'negative' ? ' negative' : ''}`;
            itemElement.dataset.id = item.id;

            // Animation setup
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateY(10px)';
            itemElement.style.transition = 'all 0.3s ease';

            // Generate HTML content - match the existing format
            itemElement.innerHTML = `
        <div class="feedback-header">
          <div class="feedback-content">
            <div class="feedback-tags">
              ${item.schema ? `<span class="tag">${item.schema}</span>` : ''}
              <span class="tag type-tag">${item.type || 'Unknown'}</span>
              ${item.feedback === 'positive' ?
                `<span class="tag positive">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 10v12"></path>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                  </svg>
                  Positive
                </span>` :
                ''
            }
              ${item.feedback === 'negative' ?
                `<span class="tag negative">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 14V2"></path>
                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                  </svg>
                  Negative
                </span>` :
                ''
            }
              ${item.hidden ?
                `<span class="tag archived">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                    <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                    <path d="M10 12h4"></path>
                  </svg>
                  Archived
                </span>` :
                ''
            }
            </div>
            <h3 class="feedback-question">${item.question || 'No question'}</h3>
            <p class="feedback-query">User: ${item.userName || 'Unknown'}</p>
            <div class="feedback-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              ${item.conversation?.length || 0} messages
            </div>
          </div>
          <div class="feedback-actions">
            <button class="action-btn positive${item.feedback === 'positive' ? ' active' : ''}" data-action="positive" data-id="${item.id}" title="Pozitif olarak işaretle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
            </button>
            <button class="action-btn negative${item.feedback === 'negative' ? ' active' : ''}" data-action="negative" data-id="${item.id}" title="Negatif olarak işaretle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 14V2"></path>
                <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
              </svg>
            </button>
            <button class="action-btn archive${item.hidden ? ' active' : ''}" data-action="hidden" data-id="${item.id}" title="${item.hidden ? 'Restore item' : 'Arşivle'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                <path d="M10 12h4"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

            // Add click events
            try {
                // Open dialog on click
                itemElement.addEventListener('click', function() {
                    if (typeof window.openDialog === 'function') {
                        window.openDialog(item);
                    } else {
                        logDiagnostics("ERROR: openDialog function not found");
                    }
                });

                // Handle action buttons
                const actionButtons = itemElement.querySelectorAll('.action-btn');
                actionButtons.forEach(button => {
                    button.addEventListener('click', function(event) {
                        event.stopPropagation();

                        const action = this.dataset.action;
                        const id = this.dataset.id;

                        // Try to call the appropriate function based on action
                        if (action === 'positive' && typeof window.handlePositiveFeedback === 'function') {
                            window.handlePositiveFeedback(id);
                        } else if (action === 'negative' && typeof window.handleNegativeFeedback === 'function') {
                            window.handleNegativeFeedback(id);
                        } else if (action === 'hidden' && typeof window.handleToggleHidden === 'function') {
                            window.handleToggleHidden(id);
                        } else {
                            logDiagnostics(`Action function not found for: ${action}`);
                        }
                    });
                });
            } catch (error) {
                logDiagnostics(`Error adding event listeners: ${error.message}`);
            }

            return itemElement;
        }

        // Function to restore tab view
        function restoreTabView() {
            logDiagnostics("Restoring tab view");
            updateDebugPanel("Restoring tab view");

            // Show tabs
            const tabsContainer = document.getElementById('tabs-container');
            if (tabsContainer) {
                tabsContainer.style.display = '';
            }

            // Reset page size
            window.pageSize = 20;

            // Update active button
            const pageSizeButtons = document.querySelectorAll('.page-size-btn');
            pageSizeButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.size === '20') {
                    btn.classList.add('active');
                }
            });

            // Return to normal view by calling the original load function
            if (typeof window.connectToMongoDB === 'function') {
                window.connectToMongoDB(0);
            } else {
                logDiagnostics("ERROR: connectToMongoDB function not found");

                // Try to fallback to renderItems
                if (typeof window.renderItems === 'function') {
                    window.renderItems();
                }
            }

            showNotification("Returned to tab view", "info");
        }

        // Export to global scope
        window.restoreTabView = restoreTabView;

        // ===== APPROACH 3: MODIFY PAGE SIZE BUTTONS =====
        function fixPageSizeButtons() {
            logDiagnostics("Fixing page size buttons");
            updateDebugPanel("Fixing page size buttons");

            const pageSizeButtons = document.querySelectorAll('.page-size-btn');

            // If no buttons found, try to add them
            if (pageSizeButtons.length === 0) {
                logDiagnostics("No page size buttons found, trying to add them");
                const container = document.querySelector('.page-size');

                if (container) {
                    ['20', '40', '100', '200'].forEach(size => {
                        const btn = document.createElement('button');
                        btn.className = 'page-size-btn' + (size === '20' ? ' active' : '');
                        btn.dataset.size = size;
                        btn.textContent = size;
                        container.appendChild(btn);
                    });

                    // Try again with the new buttons
                    fixPageSizeButtons();
                    return;
                } else {
                    logDiagnostics("ERROR: page-size container not found");
                    return;
                }
            }

            // Process each button
            pageSizeButtons.forEach(button => {
                // Replace with new button to remove existing event listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                // Add visual indicator that these are fixed buttons
                newButton.style.position = 'relative';

                // Add new click handler
                newButton.addEventListener('click', function() {
                    const size = parseInt(this.dataset.size, 10);
                    logDiagnostics(`Page size button clicked: ${size}`);
                    updateDebugPanel(`Page size: ${size}`);

                    // Update active state
                    pageSizeButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Set page size
                    window.pageSize = size;

                    // Use our custom function for larger sizes
                    if (size > 20) {
                        window.fetchAllRecords(size);
                    } else {
                        // For smaller sizes, use the original functions
                        restoreTabView();
                    }
                });
            });

            // Add "List All" button if it doesn't exist
            if (!document.querySelector('.page-size-btn[data-size="all"]')) {
                const container = document.querySelector('.page-size');
                if (container) {
                    const allButton = document.createElement('button');
                    allButton.className = 'page-size-btn';
                    allButton.dataset.size = 'all';
                    allButton.textContent = 'All Records';
                    allButton.style.marginLeft = '10px';
                    allButton.style.backgroundColor = '#2563eb';
                    allButton.style.color = 'white';
                    allButton.style.fontWeight = 'bold';

                    // Add event listener
                    allButton.addEventListener('click', function() {
                        logDiagnostics("All Records button clicked");
                        updateDebugPanel("Fetching all records");

                        // Remove active class from all buttons
                        pageSizeButtons.forEach(btn => btn.classList.remove('active'));
                        allButton.classList.add('active');

                        // Set page size to a very large number
                        window.pageSize = 10000;

                        // Fetch all records
                        window.fetchAllRecords(10000);
                    });

                    container.appendChild(allButton);
                }
            }

            logDiagnostics("Page size buttons fixed successfully");
        }

        // ===== APPROACH 4: DIRECT DOM MANIPULATION =====
        // Last resort fix using MutationObserver
        function setupMutationObserver() {
            logDiagnostics("Setting up MutationObserver");

            const feedbackItems = document.getElementById('feedback-items');
            if (!feedbackItems) {
                logDiagnostics("ERROR: feedback-items container not found");
                return;
            }

            // Create observer
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        // Check if page size is larger than default and items count is less
                        if (window.pageSize > 20 && window.filteredData &&
                            feedbackItems.querySelectorAll('.feedback-item').length < Math.min(window.pageSize, window.filteredData.length)) {
                            logDiagnostics("DOM mutation detected - fixing display");
                            updateDebugPanel("Fixing display after DOM change");

                            // Force render with correct count
                            setTimeout(() => {
                                renderAllItems();
                            }, 100);
                        }
                    }
                });
            });

            // Start observing
            observer.observe(feedbackItems, {
                childList: true,
                subtree: false
            });

            logDiagnostics("MutationObserver set up successfully");
        }

        // ===== EXECUTE ALL FIXES =====
        function executeAllFixes() {
            // 1. Fix page size buttons
            fixPageSizeButtons();

            // 2. Set up mutation observer
            setupMutationObserver();

            // 3. Export all our functions to global scope
            window.renderAllItems = renderAllItems;
            window.createItemElement = createItemElement;
            window.fixPageSizeButtons = fixPageSizeButtons;

            // 4. Add additional CSS for our fixes
            const style = document.createElement('style');
            style.textContent = `
        .fix-active {
          border: 2px solid #10b981 !important;
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        .fix-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #10b981;
          animation: pulse 2s infinite;
        }
      `;
            document.head.appendChild(style);

            showNotification("All pagination fixes applied successfully", "success");
            logDiagnostics("All fixes applied successfully");
            updateDebugPanel("All fixes applied ✓");
        }

        // Execute all fixes
        executeAllFixes();
    }

    // Apply fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFix);
    } else {
        // Document is already loaded
        applyFix();
    }

    // Also apply fix after a delay in case other scripts load afterward
    setTimeout(() => {
        if (document.querySelector('.page-size-btn')) {
            applyFix();
        }
    }, 1000);

    console.log("🛠️ ULTIMATE PAGINATION FIX - LOADED");
})();