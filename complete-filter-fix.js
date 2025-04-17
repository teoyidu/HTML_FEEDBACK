// ===== COMPREHENSIVE FIX FOR FEEDBACK SYSTEM =====
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
})();