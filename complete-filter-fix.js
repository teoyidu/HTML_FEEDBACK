// ===== COMPREHENSIVE FIX FOR FEEDBACK SYSTEM =====
//complete-filter-fix.js
// Add this code to a new file called "complete-filter-fix.js" and include it last in your HTML.

(function() {
    console.log("Loading comprehensive filter fix...");
    
    // Fix for Unix timestamps in seconds format
    window.fixUnixTimestamp = function(timestamp) {
        // Handle null, undefined, or non-numeric values
        if (!timestamp || isNaN(Number(timestamp))) {
            return Date.now();
        }
        
        // Convert string to number if needed
        if (typeof timestamp === 'string') {
            timestamp = Number(timestamp);
        }
        
        // Check if this is a Unix timestamp in seconds
        // Unix timestamps from 2023-2030 in seconds format are roughly 1700000000-1900000000
        // In milliseconds, they would be 1700000000000-1900000000000
        if (timestamp > 1000000000 && timestamp < 2000000000) {
            console.log(`Converting Unix timestamp from seconds to ms: ${timestamp} × 1000 = ${timestamp * 1000}`);
            return timestamp * 1000;
        }
        
        return timestamp;
    };
    
    // Immediately fix any existing date formatting functions
    if (typeof window.formatDateTime === 'function') {
        const originalFormatDateTime = window.formatDateTime;
        window.formatDateTime = function(dateStr) {
            // If it's a number-like value, it might be a timestamp
            if (!isNaN(dateStr)) {
                dateStr = window.fixUnixTimestamp(dateStr);
            }
            return originalFormatDateTime(dateStr);
        };
        console.log("✅ Patched formatDateTime function to handle Unix timestamps");
    }

    // Wait for document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            console.log("Applying filter and feedback button fixes...");
            fixFiltersAndButtons();
        }, 1000); // Delay to ensure other scripts have loaded
    });

    function fixFiltersAndButtons() {
        // Apply timestamp fixes to existing data
        if (window.data && Array.isArray(window.data)) {
            console.log("Fixing timestamps in existing data...");
            window.data = window.data.map(item => {
                if (item.timestamp) {
                    const originalTimestamp = item.timestamp;
                    item.timestamp = window.fixUnixTimestamp(item.timestamp);
                    
                    // Only log if a conversion actually happened
                    if (item.timestamp !== originalTimestamp) {
                        // Update datetime field with the corrected date
                        const fixedDate = new Date(item.timestamp);
                        item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                        console.log(`Fixed timestamp for item ${item.id}: ${originalTimestamp} -> ${item.timestamp}`);
                    }
                }
                return item;
            });
            
            // Also fix filteredData if it exists
            if (window.filteredData && Array.isArray(window.filteredData)) {
                window.filteredData = window.filteredData.map(item => {
                    if (item.timestamp) {
                        item.timestamp = window.fixUnixTimestamp(item.timestamp);
                    }
                    return item;
                });
            }
        }
    
        // 1. Fix global variables that might be getting reset
        // Store original values for safekeeping
        const preservedState = {
            data: window.data || [],
            filteredData: window.filteredData || [],
            activeSchema: window.activeSchema,
            activeFeedbackFilter: window.activeFeedbackFilter,
            showHidden: window.showHidden || false,
            searchQuery: window.searchQuery || '',
            pageSize: window.pageSize || 20
        };

        console.log("Preserved state:", preservedState);

        // 2. Replace any broken applyFilters function with our robust implementation
        window.applyFilters = function() {
            console.log("⭐ Running fixed applyFilters with:", {
                activeSchema: window.activeSchema,
                activeFeedbackFilter: window.activeFeedbackFilter,
                showHidden: window.showHidden,
                searchQuery: window.searchQuery,
                dataLength: (window.data || []).length,
                filteredDataLength: (window.filteredData || []).length
            });

            if (!window.data || !Array.isArray(window.data) || window.data.length === 0) {
                console.warn("No data available for filtering");
                return;
            }

            // Start with full data
            let filtered = [...window.data];
            console.log(`Starting filter with ${filtered.length} items`);

            // Apply schema filter if active
            if (window.activeSchema) {
                console.log(`Applying schema filter: ${window.activeSchema}`);
                filtered = filtered.filter(item => item.schema === window.activeSchema);
                console.log(`After schema filter: ${filtered.length} items`);
            }

            // Apply feedback filter if active
            if (window.activeFeedbackFilter) {
                console.log(`Applying feedback filter: ${window.activeFeedbackFilter}`);
                filtered = filtered.filter(item => item.feedback === window.activeFeedbackFilter);
                console.log(`After feedback filter: ${filtered.length} items`);
            }

            // Apply hidden filter
            if (!window.showHidden) {
                console.log("Filtering out hidden items");
                filtered = filtered.filter(item => !item.hidden);
                console.log(`After hidden filter: ${filtered.length} items`);
            }

            // Apply search query
            if (window.searchQuery) {
                console.log(`Applying search filter: "${window.searchQuery}"`);
                const query = window.searchQuery.toLowerCase();
                filtered = filtered.filter(item => {
                    const matchesQuestion = item.question &&
                        item.question.toLowerCase().includes(query);

                    const matchesConversation = item.conversation &&
                        Array.isArray(item.conversation) &&
                        item.conversation.some(msg =>
                            msg.message && msg.message.toLowerCase().includes(query)
                        );

                    const matchesUser = item.user &&
                        item.user.toLowerCase().includes(query);

                    return matchesQuestion || matchesConversation || matchesUser;
                });
                console.log(`After search filter: ${filtered.length} items`);
            }

            // Update filtered data
            window.filteredData = filtered;

            // Call render function
            if (typeof window.renderItems === 'function') {
                console.log("Calling renderItems with filtered data");
                window.renderItems();
            } else {
                console.error("renderItems function not found");
            }
        };

        // 3. Fix schema filters
        const schemaFilterButtons = document.querySelectorAll('#schema-filters .filter-btn');
        
        // Fix filter buttons container layout if needed
        const schemaFiltersContainer = document.getElementById('schema-filters');
        if (schemaFiltersContainer) {
            schemaFiltersContainer.style.display = 'flex';
            schemaFiltersContainer.style.flexWrap = 'wrap';
            schemaFiltersContainer.style.gap = '0.75rem';
            schemaFiltersContainer.style.marginBottom = '1rem';
            schemaFiltersContainer.style.justifyContent = 'flex-start';
            schemaFiltersContainer.style.alignItems = 'center';
        }
        
        schemaFilterButtons.forEach(button => {
            // Improve button styling
            button.style.display = 'inline-flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.minWidth = '90px';
            button.style.textAlign = 'center';
            
            // Remove existing event listeners (to avoid duplicates)
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add our fixed event listener
            newButton.addEventListener('click', function() {
                const schema = this.dataset.schema;
                console.log(`Schema button clicked: ${schema}`);

                if (window.activeSchema === schema) {
                    window.activeSchema = null;
                    this.classList.remove('active');
                    console.log(`Deactivated schema filter: ${schema}`);
                } else {
                    // Remove active class from all schema buttons
                    document.querySelectorAll('#schema-filters .filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    window.activeSchema = schema;
                    this.classList.add('active');
                    console.log(`Activated schema filter: ${schema}`);
                }

                // Apply filters
                window.applyFilters();
            });
        });

        // 4. Fix feedback filter buttons
        const positiveFilter = document.getElementById('positive-filter');
        const negativeFilter = document.getElementById('negative-filter');

        if (positiveFilter) {
            // Remove existing event listeners
            const newPositiveFilter = positiveFilter.cloneNode(true);
            positiveFilter.parentNode.replaceChild(newPositiveFilter, positiveFilter);

            // Add our fixed event listener
            newPositiveFilter.addEventListener('click', function() {
                console.log("Positive filter clicked");

                if (window.activeFeedbackFilter === 'positive') {
                    window.activeFeedbackFilter = null;
                    this.classList.remove('active');
                    console.log("Deactivated positive filter");
                } else {
                    window.activeFeedbackFilter = 'positive';
                    this.classList.add('active');
                    if (negativeFilter) negativeFilter.classList.remove('active');
                    console.log("Activated positive filter");
                }

                // Apply filters
                window.applyFilters();
            });
        }

        if (negativeFilter) {
            // Remove existing event listeners
            const newNegativeFilter = negativeFilter.cloneNode(true);
            negativeFilter.parentNode.replaceChild(newNegativeFilter, negativeFilter);

            // Add our fixed event listener
            newNegativeFilter.addEventListener('click', function() {
                console.log("Negative filter clicked");

                if (window.activeFeedbackFilter === 'negative') {
                    window.activeFeedbackFilter = null;
                    this.classList.remove('active');
                    console.log("Deactivated negative filter");
                } else {
                    window.activeFeedbackFilter = 'negative';
                    this.classList.add('active');
                    if (positiveFilter) positiveFilter.classList.remove('active');
                    console.log("Activated negative filter");
                }

                // Apply filters
                window.applyFilters();
            });
        }

        // 5. Fix feedback button handlers
        window.handlePositiveFeedback = async function(id) {
            console.log(`Handling positive feedback for ${id}`);

            const item = window.data.find(item => item.id === id);
            if (!item) {
                console.error(`Item with ID ${id} not found`);
                return;
            }

            // Determine new feedback state
            const currentFeedback = item.feedback;
            const newFeedback = currentFeedback === 'positive' ? null : 'positive';
            console.log(`Changing feedback from ${currentFeedback} to ${newFeedback}`);

            // Update UI first to make it responsive
            const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
            if (itemElement) {
                // Update button visuals
                const positiveBtn = itemElement.querySelector('.action-btn.positive');
                if (positiveBtn) {
                    console.log("Updating positive button style");
                    if (newFeedback === 'positive') {
                        positiveBtn.style.backgroundColor = '#10b981'; // Green
                    } else {
                        positiveBtn.style.backgroundColor = '#374151'; // Gray
                    }
                }

                // Reset negative button
                if (newFeedback === 'positive') {
                    const negativeBtn = itemElement.querySelector('.action-btn.negative');
                    if (negativeBtn) {
                        console.log("Resetting negative button");
                        negativeBtn.style.backgroundColor = '#374151'; // Gray
                    }
                }
            }

            // Update local data
            window.data = window.data.map(dataItem => {
                if (dataItem.id === id) {
                    return { ...dataItem, feedback: newFeedback };
                }
                return dataItem;
            });

            // Update on server
            try {
                const response = await fetch(`${window.API_BASE_URL}/conversations/${id}/feedback`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback: newFeedback })
                });

                if (!response.ok) {
                    console.error('Server error updating feedback:', await response.text());
                    // Show error message
                    showNotification('Error updating feedback on server', 'error');
                } else {
                    console.log('Feedback updated successfully on server');
                    // Show success message
                    showNotification('Feedback updated successfully', 'success');

                    // Show QDrant dialog if appropriate
                    if (newFeedback === 'positive' && typeof window.showQdrantConfirmDialog === 'function') {
                        window.showQdrantConfirmDialog(item);
                    }
                }
            } catch (error) {
                console.error('Failed to update feedback:', error);
                showNotification('Failed to update feedback: ' + error.message, 'error');
            }

            // If we have an active feedback filter, reapply filters
            if (window.activeFeedbackFilter) {
                window.applyFilters();
            }
        };

        window.handleNegativeFeedback = async function(id) {
            console.log(`Handling negative feedback for ${id}`);

            const item = window.data.find(item => item.id === id);
            if (!item) {
                console.error(`Item with ID ${id} not found`);
                return;
            }

            // Determine new feedback state
            const currentFeedback = item.feedback;
            const newFeedback = currentFeedback === 'negative' ? null : 'negative';
            console.log(`Changing feedback from ${currentFeedback} to ${newFeedback}`);

            // Update UI first to make it responsive
            const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
            if (itemElement) {
                // Update button visuals
                const negativeBtn = itemElement.querySelector('.action-btn.negative');
                if (negativeBtn) {
                    console.log("Updating negative button style");
                    if (newFeedback === 'negative') {
                        negativeBtn.style.backgroundColor = '#ef4444'; // Red
                    } else {
                        negativeBtn.style.backgroundColor = '#374151'; // Gray
                    }
                }

                // Reset positive button
                if (newFeedback === 'negative') {
                    const positiveBtn = itemElement.querySelector('.action-btn.positive');
                    if (positiveBtn) {
                        console.log("Resetting positive button");
                        positiveBtn.style.backgroundColor = '#374151'; // Gray
                    }
                }
            }

            // Update local data
            window.data = window.data.map(dataItem => {
                if (dataItem.id === id) {
                    return { ...dataItem, feedback: newFeedback };
                }
                return dataItem;
            });

            // Update on server
            try {
                const response = await fetch(`${window.API_BASE_URL}/conversations/${id}/feedback`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback: newFeedback })
                });

                if (!response.ok) {
                    console.error('Server error updating feedback:', await response.text());
                    showNotification('Error updating feedback on server', 'error');
                } else {
                    console.log('Feedback updated successfully on server');
                    showNotification('Feedback updated successfully', 'success');
                }
            } catch (error) {
                console.error('Failed to update feedback:', error);
                showNotification('Failed to update feedback: ' + error.message, 'error');
            }

            // If we have an active feedback filter, reapply filters
            if (window.activeFeedbackFilter) {
                window.applyFilters();
            }
        };

        // 6. Add notification system if not present
        if (typeof window.showNotification !== 'function') {
            window.showNotification = function(message, type = 'info') {
                console.log(`Notification (${type}): ${message}`);

                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
          max-width: 300px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        `;

                // Set color based on type
                switch (type) {
                    case 'success':
                        notification.style.backgroundColor = '#10b981';
                        break;
                    case 'error':
                        notification.style.backgroundColor = '#ef4444';
                        break;
                    case 'warning':
                        notification.style.backgroundColor = '#f59e0b';
                        break;
                    default:
                        notification.style.backgroundColor = '#3b82f6';
                }

                notification.textContent = message;

                // Add to body
                document.body.appendChild(notification);

                // Animate in
                setTimeout(() => {
                    notification.style.opacity = '1';
                }, 10);

                // Remove after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            };
        }

        // 7. Add emergency reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = "Reset Filters";
        resetButton.style.cssText = `
      position: fixed;
      bottom: 20px;
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

        // 8. Override or patch the renderItems function to ensure timestamps are fixed
        if (typeof window.renderItems === 'function') {
            const originalRenderItems = window.renderItems;
            window.renderItems = function() {
                // Fix timestamps in all data before rendering
                if (window.filteredData && Array.isArray(window.filteredData)) {
                    window.filteredData.forEach(item => {
                        if (item.timestamp) {
                            const originalTimestamp = item.timestamp;
                            item.timestamp = window.fixUnixTimestamp(item.timestamp);
                            
                            // Update datetime field with the corrected date
                            if (item.timestamp !== originalTimestamp) {
                                const fixedDate = new Date(item.timestamp);
                                item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                            }
                        }
                    });
                }
                
                // Call the original function
                return originalRenderItems.apply(this, arguments);
            };
            console.log("✅ Enhanced renderItems to fix timestamps before rendering");
        }
        
        // 9. Patch data loading
        if (typeof window.connectToMongoDB === 'function') {
            const originalConnectToMongoDB = window.connectToMongoDB;
            window.connectToMongoDB = async function() {
                // Call original function
                await originalConnectToMongoDB.apply(this, arguments);
                
                // Fix timestamps in the loaded data
                console.log("Fixing timestamps in newly loaded data...");
                if (window.data && Array.isArray(window.data)) {
                    window.data.forEach(item => {
                        if (item.timestamp) {
                            const originalTimestamp = item.timestamp;
                            item.timestamp = window.fixUnixTimestamp(item.timestamp);
                            
                            // Update datetime field
                            if (item.timestamp !== originalTimestamp) {
                                const fixedDate = new Date(item.timestamp);
                                item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                            }
                        }
                    });
                }
            };
            console.log("✅ Enhanced connectToMongoDB to fix timestamps after loading data");
        }
        
        resetButton.addEventListener('click', function() {
            console.log("Emergency reset triggered");

            // Reset filter state
            window.activeSchema = null;
            window.activeFeedbackFilter = null;
            window.showHidden = false;

            // Reset UI
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Reset search
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
                window.searchQuery = '';
            }

            // Show notification
            window.showNotification('All filters have been reset', 'info');

            // Reload data
            if (window.filteredData) {
                window.filteredData = [...window.data].filter(item => !item.hidden);

                // Render items
                if (typeof window.renderItems === 'function') {
                    window.renderItems();
                }
            }
        });

        document.body.appendChild(resetButton);

        console.log("Filter and feedback button fixes applied successfully");
    }

    // Add this to the end of complete-filter-fix.js, after the previous fixes

    // ===== Fix for "List All" and Custom Amount Buttons =====
    setTimeout(function() {
        console.log("Applying fix for List All and custom amount buttons...");
        fixRenderingLimits();
    }, 2500); // Apply after other fixes

    function fixRenderingLimits() {
        console.log("Fixing rendering limits for special buttons...");

        // Store the original renderItems function, which might be
        // the enhanced version from feedback-system-fixes-2.js
        const originalRenderItems = window.renderItems;

        // Check if we have the addDataButtonsToItems function globally available
        const hasDataButtonsFunction = typeof window.addDataButtonsToItems === 'function';
        console.log("Data buttons function available:", hasDataButtonsFunction);

        if (typeof originalRenderItems === 'function') {
            console.log("Patching renderItems function to respect pageSize fully");

            window.renderItems = function() {
                console.log(`Rendering items with pageSize: ${window.pageSize}`);

                const feedbackItems = document.getElementById('feedback-items');
                const noResults = document.getElementById('no-results');
                const resultsCount = document.getElementById('results-count');

                if (!feedbackItems || !noResults || !resultsCount) {
                    console.error("Required DOM elements missing!");
                    return;
                }

                // Important: Don't limit the number of items to display here
                const displayCount = window.pageSize === 'all' ? window.filteredData.length : Math.min(window.pageSize, window.filteredData.length);
                resultsCount.textContent = `Showing ${displayCount} of ${window.filteredData.length} results`;

                // Clear previous items
                feedbackItems.innerHTML = '';

                if (window.filteredData.length === 0) {
                    noResults.classList.remove('hidden');
                } else {
                    noResults.classList.add('hidden');

                    // CRITICAL CHANGE: Don't limit the slice if pageSize is "all"
                    const itemsToRender = window.pageSize === 'all'
                        ? window.filteredData
                        : window.filteredData.slice(0, window.pageSize);

                    console.log(`Rendering ${itemsToRender.length} items out of ${window.filteredData.length} filtered items`);

                    try {
                        // Call the original renderItems function
                        originalRenderItems.apply(this, arguments);

                        // Ensure we call the addDataButtonsToItems function, with retries if needed
                        ensureDataButtonsAdded();

                    } catch (error) {
                        console.error("Error in renderItems:", error);
                        renderBasicItems();

                        // Still try to add data buttons even with fallback rendering
                        ensureDataButtonsAdded();
                    }
                }
            };

            // Function to ensure data buttons are added, with retries
            function ensureDataButtonsAdded() {
                // First try immediately
                if (typeof window.addDataButtonsToItems === 'function') {
                    console.log("Calling addDataButtonsToItems immediately");
                    window.addDataButtonsToItems();
                } else {
                    // If the function isn't available yet, try again after a short delay
                    console.log("Data buttons function not immediately available, will retry");
                    setTimeout(function() {
                        if (typeof window.addDataButtonsToItems === 'function') {
                            console.log("Calling addDataButtonsToItems after delay");
                            window.addDataButtonsToItems();
                        } else {
                            console.warn("Data buttons function still not found after delay");

                            // Last resort: Look for items without buttons and dispatch a custom event
                            const itemsWithoutButtons = document.querySelectorAll('.feedback-item:not(:has(.additional-data-buttons))');
                            console.log(`Found ${itemsWithoutButtons.length} items without data buttons`);

                            // Try one more approach - manually check for the function in feedback-system-fixes-2.js
                            tryToFindAndRestoreDataButtons();
                        }
                    }, 200);
                }
            }

            // Last resort function to try to find and restore data buttons
            function tryToFindAndRestoreDataButtons() {
                // Get all script elements
                const scripts = document.querySelectorAll('script');
                let feedbackFixes2Found = false;

                // Look for the feedback-system-fixes-2.js script
                scripts.forEach(script => {
                    if (script.src && script.src.includes('feedback-system-fixes-2.js')) {
                        feedbackFixes2Found = true;
                        console.log("Found feedback-system-fixes-2.js script, trying to initialize it");

                        // Try to manually call its initialization
                        try {
                            // This might re-expose the required functions
                            if (typeof initialize === 'function') {
                                initialize();
                            }

                            // Check again for the data buttons function
                            if (typeof window.addDataButtonsToItems === 'function') {
                                console.log("Successfully restored addDataButtonsToItems function");
                                window.addDataButtonsToItems();
                            }
                        } catch (error) {
                            console.error("Failed to manually initialize feedback fixes:", error);
                        }
                    }
                });

                if (!feedbackFixes2Found) {
                    console.warn("feedback-system-fixes-2.js script not found");
                }
            }

            // Basic fallback rendering function
            function renderBasicItems() {
                const feedbackItems = document.getElementById('feedback-items');
                if (!feedbackItems) return;

                feedbackItems.innerHTML = '';

                const itemsToRender = window.pageSize === 'all'
                    ? window.filteredData
                    : window.filteredData.slice(0, window.pageSize);

                itemsToRender.forEach(item => {
                    // Create a simple representation of the item
                    const itemElement = document.createElement('div');
                    itemElement.className = 'feedback-item';
                    itemElement.dataset.id = item.id;

                    itemElement.innerHTML = `
                    <div class="feedback-content">
                        <div class="feedback-user-info">
                            <span class="user-name">User: ${item.user || 'Unknown'}</span>
                            <span class="datetime">${item.datetime || 'No date'}</span>
                        </div>
                        <div class="feedback-buttons">
                            <button class="conversation-btn">${item.question || 'No question'}</button>
                        </div>
                    </div>
                `;

                    feedbackItems.appendChild(itemElement);
                });
            }
        }


        // 2. Fix the "List All" button if it exists
        const listAllButton = document.querySelector('.page-size-btn[data-size="all"]');
        if (listAllButton) {
            console.log('Fixing "List All" button');

            // Remove existing event listeners
            const newListAllButton = listAllButton.cloneNode(true);
            listAllButton.parentNode.replaceChild(newListAllButton, listAllButton);

            // Add enhanced event listener
            newListAllButton.addEventListener('click', function() {
                console.log('List All button clicked');

                // Update UI state
                document.querySelectorAll('.page-size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                newListAllButton.classList.add('active');

                // Set pageSize to 'all' - this is a special value we'll check for
                window.pageSize = 'all';
                console.log('Set pageSize to "all"');

                // Try different approaches to fix rendering
                try {
                    // 1. First set to a very large number as a fallback
                    const largeNumber = 10000;
                    console.log(`Also setting numeric pageSize to ${largeNumber} as fallback`);

                    // 2. Update currentPage to 0 to ensure we get all records
                    window.currentPage = 0;

                    // 3. If loadPage exists, reload data
                    if (typeof window.loadPage === 'function') {
                        console.log('Calling loadPage to fetch all data');
                        window.loadPage(0);
                    } else {
                        // 4. If applyFilters exists, call it to refilter data with new pageSize
                        if (typeof window.applyFilters === 'function') {
                            console.log('Calling applyFilters with new pageSize');
                            window.applyFilters();
                        } else {
                            // 5. Last resort: just call renderItems
                            if (typeof window.renderItems === 'function') {
                                console.log('Calling renderItems directly');
                                window.renderItems();
                            }
                        }
                    }

                    // Show notification
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Showing all records', 'info');
                    }
                } catch (error) {
                    console.error('Error in List All button handler:', error);
                }
            });
        }

        // 3. Fix custom amount input if it exists
        const customAmountInput = document.querySelector('.custom-size-input, .custom-page-size-input');
        const customAmountButton = document.querySelector('.custom-size-apply, .custom-page-size-apply');

        if (customAmountInput && customAmountButton) {
            console.log('Fixing custom amount input');

            // Remove existing event listeners
            const newCustomAmountButton = customAmountButton.cloneNode(true);
            customAmountButton.parentNode.replaceChild(newCustomAmountButton, customAmountButton);

            // Add enhanced event listener
            newCustomAmountButton.addEventListener('click', function() {
                applyCustomAmount();
            });

            // Also handle Enter key
            customAmountInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    applyCustomAmount();
                }
            });

            function applyCustomAmount() {
                const value = parseInt(customAmountInput.value, 10);

                if (isNaN(value) || value < 1) {
                    console.error('Invalid custom amount:', value);

                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Please enter a valid number', 'error');
                    }

                    return;
                }

                console.log(`Custom amount entered: ${value}`);

                // Update UI state
                document.querySelectorAll('.page-size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Update custom input styling
                customAmountInput.style.borderColor = '#2563eb';
                newCustomAmountButton.style.backgroundColor = '#1d4ed8';

                // Update pageSize
                window.pageSize = value;
                console.log(`Set pageSize to ${value}`);

                // First try loadPage
                if (typeof window.loadPage === 'function') {
                    console.log('Calling loadPage with custom amount');
                    window.loadPage(window.currentPage);
                } else {
                    // Then try applyFilters
                    if (typeof window.applyFilters === 'function') {
                        console.log('Calling applyFilters with custom amount');
                        window.applyFilters();
                    } else {
                        // Last resort: renderItems
                        if (typeof window.renderItems === 'function') {
                            console.log('Calling renderItems with custom amount');
                            window.renderItems();
                        }
                    }
                }

                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Page size changed to ${value}`, 'info');
                }
            }
        }

        // 4. Add debugging for any hidden limiters
        console.log('Adding pageSize debug logging');

        // Log whenever pageSize changes
        let lastPageSize = window.pageSize;
        setInterval(function() {
            if (window.pageSize !== lastPageSize) {
                console.log(`pageSize changed from ${lastPageSize} to ${window.pageSize}`);
                lastPageSize = window.pageSize;
            }
        }, 500);

        console.log('Rendering limits fix applied successfully');
    }


    // Add this to the end of complete-filter-fix.js, after all previous fixes

    // ===== Comprehensive Pagination Refresh Fix =====
    // This ensures immediate refresh of data and pagination when page size changes

    setTimeout(function() {
        console.log("Applying comprehensive pagination refresh fix...");
        fixPaginationRefresh();
    }, 3000); // Apply after all other fixes

    function fixPaginationRefresh() {
        console.log("Setting up pagination refresh system...");

        // 1. Create a refresh function that will update everything
        window.refreshPaginationSystem = async function(newPageSize, resetToFirstPage = true) {
            console.log(`Refreshing pagination system with pageSize: ${newPageSize}, resetToFirstPage: ${resetToFirstPage}`);

            // Update the global page size
            window.pageSize = newPageSize;

            // Calculate the current record index to try to maintain position
            const currentIndex = window.currentPage * (window.pageSize === 'all' ? 1000 : window.pageSize);

            // If we're resetting to first page or using "all", set currentPage to 0
            if (resetToFirstPage || newPageSize === 'all') {
                window.currentPage = 0;
            } else {
                // Otherwise calculate the new page based on the current record index
                window.currentPage = Math.floor(currentIndex / newPageSize);
            }

            console.log(`New page calculation: currentPage = ${window.currentPage}`);

            // Fetch fresh data with new page size
            try {
                console.log(`Fetching fresh data for page ${window.currentPage} with size ${newPageSize}`);

                // Construct API URL
                const apiUrl = `${window.API_BASE_URL || 'http://localhost:3000/api'}/conversations`;

                // Build query parameters
                const params = new URLSearchParams();
                params.append('page', window.currentPage);

                // Handle 'all' special case
                if (newPageSize === 'all') {
                    params.append('limit', 1000); // Use a large number as proxy for "all"
                } else {
                    params.append('limit', newPageSize);
                }

                // Apply any active filters to the query
                if (window.activeSchema) {
                    params.append('schema', window.activeSchema);
                }

                if (window.activeFeedbackFilter) {
                    params.append('feedback', window.activeFeedbackFilter);
                }

                if (window.searchQuery) {
                    params.append('search', window.searchQuery);
                }

                // Add date filters if they exist
                if (window.dateFrom) {
                    params.append('dateFrom', window.dateFrom);
                }

                if (window.dateTo) {
                    params.append('dateTo', window.dateTo);
                }

                // Add sort order if it exists
                if (window.sortOrder) {
                    params.append('sort', window.sortOrder);
                }

                // Full URL with parameters
                const fullUrl = `${apiUrl}?${params.toString()}`;
                console.log(`Fetching from: ${fullUrl}`);

                // Make the request
                const response = await fetch(fullUrl);

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const result = await response.json();
                console.log(`Received data with ${result.data?.length || 0} records`);

                // Process the data
                if (result.data) {
                    const mongoData = result.data;

                    // Update pagination info
                    window.currentPage = result.pagination ? result.pagination.page : 0;
                    window.totalPages = result.pagination ? result.pagination.totalPages : 1;

                    // Convert data to app format
                    if (typeof window.convertMongoDataToAppFormat === 'function') {
                        window.data = window.convertMongoDataToAppFormat(mongoData);
                    } else {
                        window.data = mongoData;
                    }

                    // Update filtered data
                    window.filteredData = [...window.data.filter(item => window.showHidden || !item.hidden)];

                    console.log(`Data processed: ${window.data.length} items, ${window.filteredData.length} filtered items`);

                    // Rebuild pagination controls
                    rebuildPaginationControls();

                    // Render the items
                    if (typeof window.renderItems === 'function') {
                        console.log("Rendering items with fresh data");
                        window.renderItems();
                    }

                    // Show success notification
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`Loaded ${window.data.length} records with page size ${newPageSize}`, 'success');
                    }

                    return true;
                } else {
                    throw new Error('Invalid data format from API');
                }
            } catch (error) {
                console.error("Error refreshing pagination:", error);

                // Show error notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Error refreshing data: ${error.message}`, 'error');
                }

                return false;
            }
        };

        // 2. Function to rebuild pagination controls
        function rebuildPaginationControls() {
            console.log(`Rebuilding pagination controls: ${window.totalPages} pages, current: ${window.currentPage+1}`);

            // Check if we have the required elements
            const tabsList = document.getElementById('tabs-list');
            const prevTabBtn = document.getElementById('prev-tab-btn');
            const nextTabBtn = document.getElementById('next-tab-btn');

            if (!tabsList || !prevTabBtn || !nextTabBtn) {
                console.error("Pagination controls not found");
                return;
            }

            // Clear existing tabs
            tabsList.innerHTML = '';

            // Special case for "all" - we won't have pagination
            if (window.pageSize === 'all') {
                console.log("Page size is 'all', pagination disabled");

                // Create a single "Page 1" button
                const tab = document.createElement('button');
                tab.className = 'pagination-btn active';
                tab.textContent = 'Page 1';
                tab.dataset.page = 0;
                tabsList.appendChild(tab);

                // Disable navigation buttons
                prevTabBtn.disabled = true;
                nextTabBtn.disabled = true;

                return;
            }

            // Create tabs for each page
            for (let i = 0; i < window.totalPages; i++) {
                const tab = document.createElement('button');
                tab.className = `pagination-btn${window.currentPage === i ? ' active' : ''}`;
                tab.textContent = `Page ${i + 1}`;
                tab.dataset.page = i;

                tab.addEventListener('click', function() {
                    if (window.currentPage !== i) {
                        if (typeof window.loadPage === 'function') {
                            window.loadPage(i);
                        }
                    }
                });

                tabsList.appendChild(tab);
            }

            // Update tab visibility
            if (typeof window.updateTabsVisibility === 'function') {
                window.updateTabsVisibility();
            }

            // Update navigation buttons
            prevTabBtn.disabled = window.currentPage === 0;
            nextTabBtn.disabled = window.currentPage === window.totalPages - 1 || window.totalPages === 0;

            // Reset navigation button event listeners
            setupNavButtons();
        }

        // 3. Helper function to set up navigation buttons
        function setupNavButtons() {
            const prevTabBtn = document.getElementById('prev-tab-btn');
            const nextTabBtn = document.getElementById('next-tab-btn');

            if (!prevTabBtn || !nextTabBtn) return;

            // Remove existing event listeners
            const newPrevBtn = prevTabBtn.cloneNode(true);
            const newNextBtn = nextTabBtn.cloneNode(true);

            prevTabBtn.parentNode.replaceChild(newPrevBtn, prevTabBtn);
            nextTabBtn.parentNode.replaceChild(newNextBtn, nextTabBtn);

            // Add new event listeners
            newPrevBtn.addEventListener('click', function() {
                if (window.currentPage > 0) {
                    if (typeof window.loadPage === 'function') {
                        window.loadPage(window.currentPage - 1);
                    }
                }
            });

            newNextBtn.addEventListener('click', function() {
                if (window.currentPage < window.totalPages - 1) {
                    if (typeof window.loadPage === 'function') {
                        window.loadPage(window.currentPage + 1);
                    }
                }
            });
        }

        // 4. Fix ALL page size buttons to use the new refresh function
        const pageSizeButtons = document.querySelectorAll('.page-size-btn');

        pageSizeButtons.forEach(button => {
            // Get size value from the button
            let size = button.dataset.size;
            if (size !== 'all') {
                size = parseInt(size, 10);
                if (isNaN(size)) return;
            }

            // Clone to remove existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add enhanced event listener
            newButton.addEventListener('click', function() {
                console.log(`Page size button clicked: ${size}`);

                // Update visual active state
                pageSizeButtons.forEach(btn => btn.classList.remove('active'));
                newButton.classList.add('active');

                // Use the new refresh function
                window.refreshPaginationSystem(size, true);
            });
        });

        // 5. Fix the custom amount input
        const customAmountInput = document.querySelector('.custom-size-input, .custom-page-size-input');
        const customAmountButton = document.querySelector('.custom-size-apply, .custom-page-size-apply');

        if (customAmountInput && customAmountButton) {
            console.log("Fixing custom amount input with refresh functionality");

            // Remove existing event listeners
            const newCustomAmountButton = customAmountButton.cloneNode(true);
            customAmountButton.parentNode.replaceChild(newCustomAmountButton, customAmountButton);

            // Create a custom input handler function
            function handleCustomAmount() {
                const value = parseInt(customAmountInput.value, 10);

                if (isNaN(value) || value < 1) {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Please enter a valid number', 'error');
                    }
                    return;
                }

                console.log(`Custom amount entered: ${value}`);

                // Update UI state
                pageSizeButtons.forEach(btn => btn.classList.remove('active'));

                // Update custom input styling
                customAmountInput.style.borderColor = '#2563eb';
                newCustomAmountButton.style.backgroundColor = '#1d4ed8';

                // Use the new refresh function
                window.refreshPaginationSystem(value, true);
            }

            // Add event listeners
            newCustomAmountButton.addEventListener('click', handleCustomAmount);

            customAmountInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    handleCustomAmount();
                }
            });
        }

        // 6. Add a refresh button near the page size controls
        addRefreshButton();

        function addRefreshButton() {
            const pageSize = document.querySelector('.page-size');
            if (!pageSize) return;

            // Check if button already exists
            if (document.getElementById('refresh-page-button')) return;

            // Create refresh button
            const refreshButton = document.createElement('button');
            refreshButton.id = 'refresh-page-button';
            refreshButton.className = 'refresh-page-button';
            refreshButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6"></path>
                    <path d="M2.5 12a10 10 0 0 1 17-7l2-2"></path>
                    <path d="M2.5 22v-6h6"></path>
                    <path d="M21.5 12a10 10 0 0 1-17 7l-2 2"></path>
                </svg>
                <span>Refresh</span>
            `;

            // Add styling
            refreshButton.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.25rem;
                margin-left: 0.75rem;
                padding: 0.25rem 0.75rem;
                background-color: #2563eb;
                color: white;
                border: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-size: 0.875rem;
                transition: background-color 0.2s;
            `;

            // Add hover state
            refreshButton.addEventListener('mouseover', function() {
                refreshButton.style.backgroundColor = '#1d4ed8';
            });

            refreshButton.addEventListener('mouseout', function() {
                refreshButton.style.backgroundColor = '#2563eb';
            });

            // Add click handler
            refreshButton.addEventListener('click', function() {
                console.log("Refresh button clicked");

                // Show spinner in button during refresh
                const originalText = refreshButton.innerHTML;
                refreshButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-spinner">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span>Refreshing...</span>
                `;

                // Add spinning animation to the SVG
                const spinner = refreshButton.querySelector('.loading-spinner');
                if (spinner) {
                    spinner.style.animation = 'spin 1s linear infinite';
                }

                // Add keyframes for spinning if not already present
                if (!document.getElementById('spin-keyframes')) {
                    const style = document.createElement('style');
                    style.id = 'spin-keyframes';
                    style.textContent = `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Disable button during refresh
                refreshButton.disabled = true;

                // Refresh with current page size
                window.refreshPaginationSystem(window.pageSize, false).then(() => {
                    // Restore button appearance when done
                    refreshButton.innerHTML = originalText;
                    refreshButton.disabled = false;
                }).catch(() => {
                    // Also restore on error
                    refreshButton.innerHTML = originalText;
                    refreshButton.disabled = false;
                });
            });

            // Add to page size container
            pageSize.appendChild(refreshButton);
            console.log("Refresh button added");
        }

        console.log("Pagination refresh fix applied successfully");
    }
})();