// Add this at the beginning of the complete-filter-fix.js file, replacing any existing code

(function() {
  console.log("Loading simplified pagination fix...");

  // Wait for document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Execute immediately
    console.log("Applying direct pagination fixes...");
    applyDirectFixes();
  });

  // Also run when window loads to catch all cases
  window.addEventListener('load', function() {
    console.log("Applying direct pagination fixes on window load...");
    applyDirectFixes();
  });

  function applyDirectFixes() {
    console.log("Applying direct pagination fixes...");

    // 1. Add a visible refresh button at the top of the page
    addVisibleRefreshButton();

    // 2. Fix page size buttons
    fixPageSizeButtons();

    // 3. Fix the renderItems function to properly render all items
    fixRenderItemsFunction();
  }

  function addVisibleRefreshButton() {
    // Remove any existing refresh button
    const existingButton = document.getElementById('emergency-refresh-btn');
    if (existingButton) {
      existingButton.remove();
    }

    // Create a new, very visible button
    const refreshButton = document.createElement('button');
    refreshButton.id = 'emergency-refresh-btn';
    refreshButton.textContent = '🔄 Refresh Data & Pagination';
    refreshButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 10px 15px;
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        `;

    // Add click handler
    refreshButton.addEventListener('click', function() {
      console.log("Emergency refresh button clicked");

      // Show loading state
      refreshButton.textContent = '⏳ Loading...';
      refreshButton.style.backgroundColor = '#9333ea';

      // Try to reload data with current page size
      reloadDataWithPageSize(window.pageSize || 20);

      // Restore button after a short delay
      setTimeout(function() {
        refreshButton.textContent = '🔄 Refresh Data & Pagination';
        refreshButton.style.backgroundColor = '#2563eb';
      }, 2000);
    });

    // Add to body
    document.body.appendChild(refreshButton);
    console.log("Emergency refresh button added to page");
  }

  function fixPageSizeButtons() {
    console.log("Fixing page size buttons...");

    // Get all page size buttons
    const pageSizeButtons = document.querySelectorAll('.page-size-btn');

    if (!pageSizeButtons.length) {
      console.log("No page size buttons found, will try again later");
      setTimeout(fixPageSizeButtons, 1000);
      return;
    }

    console.log(`Found ${pageSizeButtons.length} page size buttons`);

    // Replace existing click handlers
    pageSizeButtons.forEach(button => {
      // Get the size from the button
      const size = button.dataset.size === 'all' ? 1000 : parseInt(button.dataset.size, 10);

      if (isNaN(size)) return;

      // Remove existing handler
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add direct handler
      newButton.addEventListener('click', function() {
        console.log(`Page size button clicked: ${size}`);

        // Update visual state
        pageSizeButtons.forEach(btn => btn.classList.remove('active'));
        newButton.classList.add('active');

        // Reload data with new size
        reloadDataWithPageSize(size);
      });
    });

    // Fix List All button if it exists
    const listAllButton = document.querySelector('.page-size-btn[data-size="all"]');
    if (listAllButton) {
      console.log("Found List All button, fixing it");

      // Replace existing handler
      const newListAllButton = listAllButton.cloneNode(true);
      listAllButton.parentNode.replaceChild(newListAllButton, listAllButton);

      // Add direct handler
      newListAllButton.addEventListener('click', function() {
        console.log("List All button clicked");

        // Update visual state
        pageSizeButtons.forEach(btn => btn.classList.remove('active'));
        newListAllButton.classList.add('active');

        // Use a very large number for "all"
        reloadDataWithPageSize(1000);
      });
    }

    // Fix custom input if it exists
    const customInput = document.querySelector('.custom-size-input');
    const customButton = document.querySelector('.custom-size-apply');

    if (customInput && customButton) {
      console.log("Found custom input, fixing it");

      // Replace existing handler
      const newCustomButton = customButton.cloneNode(true);
      customButton.parentNode.replaceChild(newCustomButton, customButton);

      // Function to handle custom size
      function applyCustomSize() {
        const value = parseInt(customInput.value, 10);

        if (isNaN(value) || value < 1) {
          alert("Please enter a valid number");
          return;
        }

        console.log(`Custom size entered: ${value}`);

        // Update visual state
        pageSizeButtons.forEach(btn => btn.classList.remove('active'));

        // Reload with custom size
        reloadDataWithPageSize(value);
      }

      // Add direct handlers
      newCustomButton.addEventListener('click', applyCustomSize);

      customInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          applyCustomSize();
        }
      });
    }
  }

  function fixRenderItemsFunction() {
    console.log("Fixing renderItems function...");

    // Check if the function exists
    if (typeof window.renderItems !== 'function') {
      console.log("renderItems function not found, will try again later");
      setTimeout(fixRenderItemsFunction, 1000);
      return;
    }

    // Store the original function
    const originalRenderItems = window.renderItems;

    // Replace with enhanced version
    window.renderItems = function() {
      console.log(`Enhanced renderItems called with pageSize: ${window.pageSize}`);

      try {
        // Get DOM elements
        const feedbackItems = document.getElementById('feedback-items');
        const noResults = document.getElementById('no-results');
        const resultsCount = document.getElementById('results-count');

        if (!feedbackItems || !noResults || !resultsCount) {
          console.error("Critical DOM elements not found");
          return;
        }

        // Show all data in filteredData without slicing
        if (!window.filteredData || !Array.isArray(window.filteredData)) {
          console.error("filteredData is not available");
          return;
        }

        console.log(`Have ${window.filteredData.length} filtered items to render`);

        // Update results count
        resultsCount.textContent = `Showing all ${window.filteredData.length} of ${window.filteredData.length} results`;

        // Clear previous items
        feedbackItems.innerHTML = '';

        if (window.filteredData.length === 0) {
          noResults.classList.remove('hidden');
        } else {
          noResults.classList.add('hidden');

          // Create all items without slicing
          window.filteredData.forEach(item => {
            try {
              // Create item element
              const itemElement = document.createElement('div');
              itemElement.className = 'feedback-item';
              itemElement.dataset.id = item.id;

              const schemaButtons = document.createElement('div');
              schemaButtons.className = 'schema-buttons';

              // Add schema buttons
              (window.schemaList || ["Mesai", "Mukavele", "Genel"]).forEach(schema => {
                const button = document.createElement('button');
                button.className = `schema-btn${item.schema === schema ? ' active' : ''}`;
                button.textContent = schema;
                button.dataset.schema = schema;

                button.addEventListener('click', (e) => {
                  e.stopPropagation();
                  if (typeof window.setSchema === 'function') {
                    window.setSchema(item.id, schema);
                  }
                });

                schemaButtons.appendChild(button);
              });

              // Create content area
              const contentArea = document.createElement('div');
              contentArea.className = 'feedback-content';

              // Add user info
              const userInfo = document.createElement('div');
              userInfo.className = 'feedback-user-info';
              userInfo.innerHTML = `
                                <span class="user-name">User: ${item.user || 'Unknown'}</span>
                                <span class="datetime">${item.datetime || 'No date'}</span>
                            `;
              contentArea.appendChild(userInfo);

              // Add conversation button
              const conversationBtn = document.createElement('button');
              conversationBtn.className = 'conversation-btn';
              conversationBtn.textContent = item.question || 'No question';
              conversationBtn.addEventListener('click', () => {
                if (typeof window.openConversationModal === 'function') {
                  window.openConversationModal(item);
                }
              });

              // Add small buttons
              const smallButtons = document.createElement('div');
              smallButtons.className = 'small-buttons';

              const suggestionBtn = document.createElement('button');
              suggestionBtn.className = 'suggestion-btn';
              suggestionBtn.textContent = 'Suggestion';
              suggestionBtn.addEventListener('click', () => {
                if (typeof window.openSuggestionModal === 'function') {
                  window.openSuggestionModal(item);
                }
              });

              const cypherBtn = document.createElement('button');
              cypherBtn.className = 'cypher-btn';
              cypherBtn.textContent = 'Cypher Query';
              cypherBtn.addEventListener('click', () => {
                if (typeof window.openCypherModal === 'function') {
                  window.openCypherModal(item);
                }
              });

              smallButtons.appendChild(suggestionBtn);
              smallButtons.appendChild(cypherBtn);

              // Add buttons container
              const buttonsContainer = document.createElement('div');
              buttonsContainer.className = 'feedback-buttons';
              buttonsContainer.appendChild(conversationBtn);
              buttonsContainer.appendChild(smallButtons);

              contentArea.appendChild(buttonsContainer);

              // Add actions
              const actions = document.createElement('div');
              actions.className = 'feedback-actions';

              // Add positive button
              const positiveBtn = document.createElement('button');
              positiveBtn.className = `action-btn positive${item.feedback === 'positive' ? ' active' : ''}`;
              positiveBtn.dataset.action = 'positive';
              positiveBtn.innerHTML = `
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M7 10v12"></path>
                                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                                </svg>
                            `;
              positiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.handlePositiveFeedback === 'function') {
                  window.handlePositiveFeedback(item.id);
                }
              });

              // Add archive button
              const archiveBtn = document.createElement('button');
              archiveBtn.className = `action-btn archive${item.hidden ? ' active' : ''}`;
              archiveBtn.dataset.action = 'archive';
              archiveBtn.innerHTML = `
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                                    <path d="M10 12h4"></path>
                                </svg>
                            `;
              archiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.handleToggleHidden === 'function') {
                  window.handleToggleHidden(item.id);
                }
              });

              // Add negative button
              const negativeBtn = document.createElement('button');
              negativeBtn.className = `action-btn negative${item.feedback === 'negative' ? ' active' : ''}`;
              negativeBtn.dataset.action = 'negative';
              negativeBtn.innerHTML = `
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 14V2"></path>
                                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                                </svg>
                            `;
              negativeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.handleNegativeFeedback === 'function') {
                  window.handleNegativeFeedback(item.id);
                }
              });

              // Add buttons to actions
              actions.appendChild(positiveBtn);
              actions.appendChild(archiveBtn);
              actions.appendChild(negativeBtn);

              // Assemble the item
              itemElement.appendChild(schemaButtons);
              itemElement.appendChild(contentArea);
              itemElement.appendChild(actions);

              // Add to feedback items
              feedbackItems.appendChild(itemElement);
            } catch(err) {
              console.error("Error rendering item:", err);
            }
          });
        }
      } catch (error) {
        console.error("Error in enhanced renderItems:", error);

        // Try calling original as fallback
        try {
          originalRenderItems.apply(this, arguments);
        } catch (fallbackError) {
          console.error("Error in original renderItems too:", fallbackError);
        }
      }
    };

    console.log("renderItems function enhanced successfully");
  }

  // Add a function to reload data with a specific page size
  window.reloadDataWithPageSize = function(pageSize) {
    // Update global page size
    window.pageSize = pageSize;
    console.log(`Setting pageSize to ${pageSize} and reloading data`);

    try {
      // Try using connectToMongoDB to refresh data
      if (typeof window.connectToMongoDB === 'function') {
        console.log("Using connectToMongoDB to reload data");
        window.connectToMongoDB(0);

        // Force renderItems after a short delay
        setTimeout(function() {
          if (typeof window.renderItems === 'function') {
            console.log("Forcing renderItems call after data reload");
            window.renderItems();
          }
        }, 1000);

        return;
      }

      // Fallback: If we have data already, just re-render
      if (window.data && window.data.length && typeof window.renderItems === 'function') {
        console.log("Using existing data and re-rendering");

        // Update filtered data
        window.filteredData = window.data.filter(item => window.showHidden || !item.hidden);

        // Render
        window.renderItems();
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      alert("Error reloading data. Please try again.");
    }
  };

  console.log("Simple direct pagination fix loaded successfully");
})();