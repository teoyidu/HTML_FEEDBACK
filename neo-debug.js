// Add this function to your main script file or as a separate script

(function() {
    // Create debug button
    const debugBtn = document.createElement('button');
    debugBtn.textContent = "Debug Panel";
    debugBtn.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    padding: 10px 15px;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  `;

    document.body.appendChild(debugBtn);

    // Debug state
    let debugPanelVisible = false;
    let debugPanel = null;

    // Debug panel function
    function toggleDebugPanel() {
        if (debugPanelVisible && debugPanel) {
            debugPanel.remove();
            debugPanelVisible = false;
            return;
        }

        // Create debug panel
        debugPanel = document.createElement('div');
        debugPanel.style.cssText = `
      position: fixed;
      bottom: 120px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background-color: #1f2937;
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 10px;
      z-index: 9998;
      color: white;
      font-family: monospace;
      font-size: 12px;
    `;

        // Add content
        const stateInfo = document.createElement('div');

        // Collect state information
        const state = {
            pageSize: window.pageSize || 'undefined',
            currentPage: window.currentPage || 'undefined',
            totalPages: window.totalPages || 'undefined',
            activeSchema: window.activeSchema || 'null',
            activeFeedbackFilter: window.activeFeedbackFilter || 'null',
            showHidden: window.showHidden || false,
            searchQuery: window.searchQuery || '',
            dataLength: window.data ? window.data.length : 'undefined',
            filteredDataLength: window.filteredData ? window.filteredData.length : 'undefined',
            visibleTabCount: window.visibleTabCount || 5,
            tabsListChildCount: document.getElementById('tabs-list') ?
                document.getElementById('tabs-list').children.length : 'tabs-list not found',
            feedbackItemsCount: document.getElementById('feedback-items') ?
                document.getElementById('feedback-items').children.length : 'feedback-items not found'
        };

        // Format state information
        let stateHtml = '<h3>Current State</h3>';
        for (const [key, value] of Object.entries(state)) {
            stateHtml += `<div><strong>${key}:</strong> ${value}</div>`;
        }

        stateInfo.innerHTML = stateHtml;
        debugPanel.appendChild(stateInfo);

        // Add functions section
        const functionsSection = document.createElement('div');
        functionsSection.innerHTML = '<h3>Debug Functions</h3>';

        // Reload current page button
        const reloadBtn = document.createElement('button');
        reloadBtn.textContent = "Reload Current Page";
        reloadBtn.style.cssText = 'margin: 5px; padding: 5px 10px; background-color: #374151; color: white; border: none; border-radius: 4px;';
        reloadBtn.addEventListener('click', () => {
            if (typeof window.loadPage === 'function') {
                window.loadPage(window.currentPage || 0);
            } else {
                alert('loadPage function not found!');
            }
        });
        functionsSection.appendChild(reloadBtn);

        // Fix tabs button
        const fixTabsBtn = document.createElement('button');
        fixTabsBtn.textContent = "Reinitialize Tabs";
        fixTabsBtn.style.cssText = 'margin: 5px; padding: 5px 10px; background-color: #374151; color: white; border: none; border-radius: 4px;';
        fixTabsBtn.addEventListener('click', () => {
            if (typeof window.initializeTabs === 'function') {
                window.initializeTabs(window.totalPages || 1);
                alert('Tabs reinitialized');
            } else {
                alert('initializeTabs function not found!');
            }
        });
        functionsSection.appendChild(fixTabsBtn);

        // Change page size button
        const pageSizeInput = document.createElement('input');
        pageSizeInput.type = 'number';
        pageSizeInput.min = '10';
        pageSizeInput.max = '500';
        pageSizeInput.value = window.pageSize || 20;
        pageSizeInput.style.cssText = 'margin: 5px; padding: 5px; width: 60px; background-color: #2d3748; color: white; border: 1px solid #4b5563; border-radius: 4px;';

        const setPageSizeBtn = document.createElement('button');
        setPageSizeBtn.textContent = "Set Page Size";
        setPageSizeBtn.style.cssText = 'margin: 5px; padding: 5px 10px; background-color: #374151; color: white; border: none; border-radius: 4px;';
        setPageSizeBtn.addEventListener('click', () => {
            const newSize = parseInt(pageSizeInput.value);
            if (newSize && newSize > 0) {
                window.pageSize = newSize;
                if (typeof window.loadPage === 'function') {
                    window.loadPage(0);
                    alert(`Page size set to ${newSize} and page reloaded`);
                } else {
                    alert('pageSize updated but loadPage function not found!');
                }
            }
        });

        functionsSection.appendChild(document.createTextNode('Page Size: '));
        functionsSection.appendChild(pageSizeInput);
        functionsSection.appendChild(setPageSizeBtn);

        debugPanel.appendChild(functionsSection);

        // Add script info
        const scriptInfo = document.createElement('div');
        scriptInfo.innerHTML = '<h3>Loaded Scripts</h3>';

        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                const scriptName = script.src.split('/').pop();
                scriptInfo.innerHTML += `<div>${scriptName}</div>`;
            }
        });

        debugPanel.appendChild(scriptInfo);

        // Add panel to body
        document.body.appendChild(debugPanel);
        debugPanelVisible = true;
    }

    // Attach click handler
    debugBtn.addEventListener('click', toggleDebugPanel);

    // Add to window for console access
    window.showDebugPanel = toggleDebugPanel;

    console.log("Debug panel initialized. Call window.showDebugPanel() to show it programmatically.");
})();


// Add this function to your code and call it after loading data

function diagnoseFeedbackSystem() {
    console.log("=== Feedback System Diagnostics ===");

    // Check if global data arrays exist
    console.log("Data array:", typeof data !== 'undefined' ? `exists with ${data.length} items` : "MISSING");
    console.log("Filtered data array:", typeof filteredData !== 'undefined' ? `exists with ${filteredData.length} items` : "MISSING");

    // Check critical DOM elements
    const criticalElements = [
        'feedback-items',
        'no-results',
        'results-count',
        'connection-indicator',
        'connection-text',
        'tabs-list',
        'prev-tab-btn',
        'next-tab-btn'
    ];

    console.log("\n=== Critical DOM Elements ===");
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? "Found" : "MISSING"}`);
    });

    // Check critical functions
    const criticalFunctions = [
        'renderItems',
        'loadPage',
        'applyFilters',
        'initializeTabs',
        'connectToMongoDB',
        'updateTabsVisibility',
        'filterBySchema',
        'handlePositiveFeedback',
        'handleNegativeFeedback',
        'handleToggleHidden'
    ];

    console.log("\n=== Critical Functions ===");
    criticalFunctions.forEach(funcName => {
        console.log(`${funcName}: ${typeof window[funcName] === 'function' ? "Defined" : "MISSING"}`);
    });

    // Check key variables
    console.log("\n=== Key Variables ===");
    console.log("pageSize:", typeof pageSize !== 'undefined' ? pageSize : "UNDEFINED");
    console.log("currentPage:", typeof currentPage !== 'undefined' ? currentPage : "UNDEFINED");
    console.log("totalPages:", typeof totalPages !== 'undefined' ? totalPages : "UNDEFINED");
    console.log("activeSchema:", typeof activeSchema !== 'undefined' ? (activeSchema || "null") : "UNDEFINED");
    console.log("activeFeedbackFilter:", typeof activeFeedbackFilter !== 'undefined' ? (activeFeedbackFilter || "null") : "UNDEFINED");
    console.log("showHidden:", typeof showHidden !== 'undefined' ? showHidden : "UNDEFINED");

    // Check API connection
    console.log("\n=== API Connection ===");
    console.log("API_BASE_URL:", typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "UNDEFINED");

    // Check rendering state
    const feedbackItems = document.getElementById('feedback-items');
    if (feedbackItems) {
        console.log("\n=== Rendering State ===");
        console.log("Feedback items container children:", feedbackItems.children.length);
        console.log("Container is visible:", feedbackItems.offsetParent !== null);
        console.log("Container dimensions:", `${feedbackItems.offsetWidth}x${feedbackItems.offsetHeight}`);
    }

    // Check if the API is reachable (just ping the base URL)
    fetch(API_BASE_URL)
        .then(response => {
            console.log("API ping status:", response.status);
        })
        .catch(error => {
            console.error("API unreachable:", error);
        });

    console.log("=== End of Diagnostics ===");

    return "Diagnostics complete. Check browser console for results.";
}

// Add a button to run diagnostics
const diagButton = document.createElement('button');
diagButton.textContent = "Run Diagnostics";
diagButton.style.cssText = `
  position: fixed;
  bottom: 120px;
  right: 20px;
  padding: 10px 15px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

diagButton.addEventListener('click', () => {
    diagnoseFeedbackSystem();

    // Try to force-reload data
    try {
        if (typeof connectToMongoDB === 'function') {
            connectToMongoDB(0);
            alert('Diagnostic complete and data reload attempted. Check console for details.');
        } else {
            alert('Diagnostic complete but connectToMongoDB function missing. Check console for details.');
        }
    } catch (error) {
        alert('Error during diagnostics: ' + error.message);
    }
});

document.body.appendChild(diagButton);