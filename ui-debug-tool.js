// ui-debug-tool.js - Add this script to your HTML page
// This will help diagnose rendering issues by showing what data is available

(function() {
    console.log("UI Debug Tool - Initializing...");

    // Track data states
    let originalRenderItems = null;
    let dataSnapshots = [];

    // Create debug panel
    function createDebugPanel() {
        // Check if panel already exists
        if (document.getElementById('debug-ui-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'debug-ui-panel';
        panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 400px;
      background: #1f2937;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      color: #e5e7eb;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: height 0.3s ease;
      display: flex;
      flex-direction: column;
    `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
      padding: 8px 12px;
      background: #111827;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #374151;
      cursor: pointer;
    `;
        header.innerHTML = `
      <span style="font-weight: bold;">UI Debug Tool</span>
      <div style="display: flex; gap: 8px;">
        <button id="debug-ui-refresh" style="background: #3b82f6; border: none; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Refresh</button>
        <button id="debug-ui-fix" style="background: #10b981; border: none; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Apply Fixes</button>
        <button id="debug-ui-toggle" style="background: none; border: none; color: white; cursor: pointer;">_</button>
      </div>
    `;

        // Create content area
        const content = document.createElement('div');
        content.id = 'debug-ui-content';
        content.style.cssText = `
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;
    `;

        // Assemble panel
        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);

        // Add event listeners
        let minimized = false;
        document.getElementById('debug-ui-toggle').addEventListener('click', function() {
            minimized = !minimized;
            content.style.display = minimized ? 'none' : 'block';
            this.textContent = minimized ? '□' : '_';
            panel.style.height = minimized ? 'auto' : 'auto';
        });

        document.getElementById('debug-ui-refresh').addEventListener('click', checkUIStatus);
        document.getElementById('debug-ui-fix').addEventListener('click', applyFixes);

        console.log("Debug panel created");
        return content;
    }

    // Update panel with current status
    function updateDebugPanel(status) {
        const content = document.getElementById('debug-ui-content');
        if (!content) return;

        // Store snapshot
        dataSnapshots.push({
            timestamp: new Date(),
            data: window.data ? window.data.length : 0,
            filteredData: window.filteredData ? window.filteredData.length : 0,
            status
        });

        // Keep only last 10 snapshots
        if (dataSnapshots.length > 10) {
            dataSnapshots.shift();
        }

        // Format status
        let html = `<div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 10px;">
      <div style="flex: 1; min-width: 120px;">
        <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">Data Status</div>
        <div>Total items: <span style="color: ${window.data && window.data.length > 0 ? '#10b981' : '#ef4444'}">${window.data ? window.data.length : 'undefined'}</span></div>
        <div>Filtered items: <span style="color: ${window.filteredData && window.filteredData.length > 0 ? '#10b981' : '#ef4444'}">${window.filteredData ? window.filteredData.length : 'undefined'}</span></div>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">Filter Status</div>
        <div>Active schema: <span style="color: #d1d5db">${window.activeSchema || 'none'}</span></div>
        <div>Feedback filter: <span style="color: #d1d5db">${window.activeFeedbackFilter || 'none'}</span></div>
        <div>Show hidden: <span style="color: #d1d5db">${window.showHidden || false}</span></div>
      </div>
    </div>`;

        // DOM status
        html += `<div style="margin-bottom: 12px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">DOM Status</div>
      <div>feedback-items: <span style="color: ${document.getElementById('feedback-items') ? '#10b981' : '#ef4444'}">${document.getElementById('feedback-items') ? 'Found' : 'Missing!'}</span></div>
      <div>no-results: <span style="color: ${document.getElementById('no-results') ? '#10b981' : '#ef4444'}">${document.getElementById('no-results') ? 'Found' : 'Missing!'}</span></div>
      <div>results-count: <span style="color: ${document.getElementById('results-count') ? '#10b981' : '#ef4444'}">${document.getElementById('results-count') ? 'Found' : 'Missing!'}</span></div>
      <div>feedback-items children: <span style="color: ${document.getElementById('feedback-items') && document.getElementById('feedback-items').children.length > 0 ? '#10b981' : '#ef4444'}">${document.getElementById('feedback-items') ? document.getElementById('feedback-items').children.length : 0}</span></div>
    </div>`;

        // Current status and issues
        html += `<div style="margin-bottom: 12px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">Status</div>
      <div>${status}</div>
    </div>`;

        // History
        html += `<div style="margin-top: 12px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">History</div>
      <div style="font-size: 10px;">`;

        dataSnapshots.slice().reverse().forEach((snapshot, i) => {
            if (i < 3) { // Show only last 3 entries
                const time = snapshot.timestamp.toLocaleTimeString();
                html += `<div style="margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dotted #374151;">
          <div>${time} - data: ${snapshot.data}, filtered: ${snapshot.filteredData}</div>
          <div style="color: ${i === 0 ? '#10b981' : '#9ca3af'};">${snapshot.status}</div>
        </div>`;
            }
        });

        html += `</div></div>`;

        content.innerHTML = html;
    }

    // Check if renderItems function is patched/overridden by any script
    function checkRenderItemsFunction() {
        // Check if the function is defined
        if (typeof window.renderItems !== 'function') {
            return "renderItems function is not defined in global scope";
        }

        // Check if it was patched by comparing to original if we have it
        if (originalRenderItems !== null && window.renderItems !== originalRenderItems) {
            return "renderItems function has been modified by another script";
        }

        return "renderItems function seems normal";
    }

    // Check if data format is as expected
    function checkDataFormat() {
        if (!window.data || !Array.isArray(window.data) || window.data.length === 0) {
            return "No data available or data is empty";
        }

        try {
            // Check first item
            const firstItem = window.data[0];

            // Check required fields
            const requiredFields = ['id', 'schema', 'question', 'conversation', 'feedback', 'hidden', 'user'];
            const missingFields = requiredFields.filter(field => !firstItem.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return `Data item is missing required fields: ${missingFields.join(', ')}`;
            }

            // Check conversation array
            if (!Array.isArray(firstItem.conversation)) {
                return "Conversation is not an array";
            }

            if (firstItem.conversation.length > 0) {
                const msg = firstItem.conversation[0];
                if (!msg.hasOwnProperty('role') || !msg.hasOwnProperty('message')) {
                    return "Conversation item is missing 'role' or 'message' fields";
                }
            }

            return "Data format looks good";
        } catch (error) {
            return `Error checking data format: ${error.message}`;
        }
    }

    // Check UI status
    function checkUIStatus() {
        const panel = createDebugPanel();

        // Save original renderItems function if not already saved
        if (originalRenderItems === null && typeof window.renderItems === 'function') {
            originalRenderItems = window.renderItems;
        }

        // Run checks
        const renderStatus = checkRenderItemsFunction();
        const dataStatus = checkDataFormat();

        // Check if filtered data is empty but data exists
        let filterStatus = "Filters are working normally";
        if (window.data && window.data.length > 0 && (!window.filteredData || window.filteredData.length === 0)) {
            filterStatus = "WARNING: Data exists but filtered data is empty - check filter conditions!";
        }

        // Update panel
        updateDebugPanel(`${renderStatus}. ${dataStatus}. ${filterStatus}`);
    }

    // Apply fixes automatically
    function applyFixes() {
        const problemsFixed = [];

        // Fix 1: Check if data exists but nothing is rendered
        if (window.data && window.data.length > 0 && (!window.filteredData || window.filteredData.length === 0)) {
            // Reset filters
            window.activeSchema = null;
            window.activeFeedbackFilter = null;
            window.searchQuery = '';

            // Recreate filtered data
            window.filteredData = window.data.filter(item => window.showHidden || !item.hidden);

            problemsFixed.push("Reset filters and regenerated filtered data");
        }

        // Fix 2: If renderItems function is missing, provide a basic implementation
        if (typeof window.renderItems !== 'function') {
            window.renderItems = function() {
                const feedbackItems = document.getElementById('feedback-items');
                const noResults = document.getElementById('no-results');
                const resultsCount = document.getElementById('results-count');

                if (!feedbackItems || !noResults || !resultsCount) {
                    console.error("Critical DOM elements missing");
                    return;
                }

                // Update results count
                resultsCount.textContent = `Showing ${Math.min(window.pageSize || 20, window.filteredData.length)} of ${window.filteredData.length} results`;

                // Show or hide no results message
                if (window.filteredData.length === 0) {
                    noResults.classList.remove('hidden');
                    feedbackItems.innerHTML = '';
                    return;
                }

                noResults.classList.add('hidden');

                // Clear existing items
                feedbackItems.innerHTML = '';

                // Render basic items
                window.filteredData.slice(0, window.pageSize || 20).forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = `feedback-item${item.hidden ? ' hidden' : ''}`;
                    itemElement.innerHTML = `
            <div style="padding: 16px; background: #1f2937; border-radius: 8px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold;">${item.schema || 'No Schema'}</span>
                <span>${item.user} - ${item.datetime}</span>
              </div>
              <div style="font-size: 16px; margin-bottom: 8px;">${item.question}</div>
              <div style="color: #9ca3af; font-size: 12px;">ID: ${item.id}</div>
            </div>
          `;
                    feedbackItems.appendChild(itemElement);
                });

                problemsFixed.push("Created basic renderItems function");
            };
        }

        // Fix 3: Ensure DOM elements exist
        const criticalElements = ['feedback-items', 'no-results', 'results-count'];
        criticalElements.forEach(id => {
            if (!document.getElementById(id)) {
                const container = document.querySelector('.container');
                if (container) {
                    const element = document.createElement('div');
                    element.id = id;
                    element.className = id;
                    if (id === 'no-results') {
                        element.classList.add('hidden');
                        element.textContent = 'No questions found matching your criteria';
                    }
                    container.appendChild(element);
                    problemsFixed.push(`Created missing element: ${id}`);
                }
            }
        });

        // Fix 4: Try rendering
        if (typeof window.renderItems === 'function') {
            try {
                window.renderItems();
                problemsFixed.push("Called renderItems function");
            } catch (error) {
                problemsFixed.push(`Error in renderItems: ${error.message}`);
            }
        }

        // Update debug panel with fixes applied
        updateDebugPanel(`Fixes applied: ${problemsFixed.join(', ')}`);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        console.log("UI Debug Tool - DOM Loaded");
        setTimeout(checkUIStatus, 1000); // Check status after 1 second
    });

    // If DOM already loaded, create panel immediately
    if (document.readyState !== 'loading') {
        console.log("UI Debug Tool - DOM Already Loaded");
        setTimeout(checkUIStatus, 1000);
    }

    // Patch core functions to debug them
    patchCoreFunctions();

    function patchCoreFunctions() {
        // Patch renderItems
        if (typeof window.renderItems === 'function') {
            const original = window.renderItems;
            window.renderItems = function() {
                console.log("renderItems called - filteredData length:", window.filteredData ? window.filteredData.length : 'undefined');
                try {
                    const result = original.apply(this, arguments);
                    console.log("renderItems completed successfully");
                    setTimeout(checkUIStatus, 100); // Check status after rendering
                    return result;
                } catch (error) {
                    console.error("Error in renderItems:", error);
                    return null;
                }
            };
        }

        // Patch applyFilters
        if (typeof window.applyFilters === 'function') {
            const original = window.applyFilters;
            window.applyFilters = function() {
                console.log("applyFilters called - data length:", window.data ? window.data.length : 'undefined');
                try {
                    const result = original.apply(this, arguments);
                    console.log("applyFilters completed - filteredData length:", window.filteredData ? window.filteredData.length : 'undefined');
                    return result;
                } catch (error) {
                    console.error("Error in applyFilters:", error);
                    return null;
                }
            };
        }
    }
})();