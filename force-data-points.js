// force-data-buttons.js
// This script forces the data buttons to appear regardless of other script issues
// Add this as a separate script tag at the very end of your HTML body

(function() {
    console.log("☢️ FORCE DATA BUTTONS: Starting standalone button restorer...");

    // Function to wait for a condition to be true
    function waitFor(condition, callback, timeout = 10000, interval = 100) {
        const startTime = Date.now();

        const checkCondition = function() {
            // Check if timeout has been reached
            if (Date.now() - startTime > timeout) {
                console.warn("☢️ FORCE DATA BUTTONS: Timeout waiting for condition");
                return;
            }

            // Check if condition is true
            const result = condition();
            if (result) {
                console.log("☢️ FORCE DATA BUTTONS: Condition met, executing callback");
                callback(result);
                return;
            }

            // Condition not met yet, check again after interval
            setTimeout(checkCondition, interval);
        };

        // Start checking
        checkCondition();
    }

    // The main function to restore data buttons
    function forceRestoreDataButtons() {
        console.log("☢️ FORCE DATA BUTTONS: Forcing data buttons restoration");

        // Wait for the DOM to be ready
        if (document.readyState !== 'complete') {
            console.log("☢️ FORCE DATA BUTTONS: DOM not ready, waiting...");
            window.addEventListener('load', forceRestoreDataButtons);
            return;
        }

        // Wait for feedback items to exist in the DOM
        waitFor(
            // Condition: Check if feedback items exist and are rendered
            function() {
                const items = document.querySelectorAll('.feedback-item');
                return items.length > 0 ? items : false;
            },
            // Callback: Add data buttons to all items found
            function(items) {
                console.log(`☢️ FORCE DATA BUTTONS: Found ${items.length} feedback items, adding data buttons`);
                addDataButtonsToAllItems(items);

                // Also set up a mutation observer to catch any newly added items
                setupMutationObserver();
            },
            // Timeout after 10 seconds
            10000,
            // Check every 100ms
            100
        );
    }

    // Function to add data buttons to all items
    function addDataButtonsToAllItems(items) {
        // Process each item
        items.forEach(item => {
            // Skip if item already has data buttons
            if (item.querySelector('.additional-data-buttons')) {
                console.log("☢️ FORCE DATA BUTTONS: Item already has data buttons, skipping");
                return;
            }

            // Get the item ID
            const itemId = item.dataset.id;
            if (!itemId) {
                console.warn("☢️ FORCE DATA BUTTONS: Item missing ID, skipping");
                return;
            }

            // Find the matching data item
            const dataItem = window.data?.find(d => d.id === itemId);
            if (!dataItem) {
                console.warn(`☢️ FORCE DATA BUTTONS: Data item with ID ${itemId} not found, skipping`);
                return;
            }

            // Find content area to add buttons to
            const contentArea = item.querySelector('.feedback-content');
            if (!contentArea) {
                console.warn("☢️ FORCE DATA BUTTONS: Content area not found, skipping");
                return;
            }

            // Create additional data buttons container
            const additionalDataButtons = document.createElement('div');
            additionalDataButtons.className = 'additional-data-buttons';
            additionalDataButtons.style.cssText = "display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;";

            // Create data buttons based on item properties
            const dataButtons = [
                {
                    type: 'agent-history',
                    label: 'Agent History',
                    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 8c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5Z"></path>
                        <path d="M3 12c0-5.5 5.9-10 9-10"></path>
                        <path d="M15 2v6h6"></path>
                        <path d="M21 12c0 5.5-5.9 10-9 10"></path>
                        <path d="M9 22v-6H3"></path>
                    </svg>`,
                    dataField: 'agentHistoryFilteredData',
                    enabled: dataItem.hasAgentHistoryData || (dataItem.agentHistoryFilteredData && dataItem.agentHistoryFilteredData !== "[]" && dataItem.agentHistoryFilteredData.length > 5)
                },
                {
                    type: 'contract-ids',
                    label: 'Contract IDs',
                    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path>
                        <path d="M9 9h1"></path>
                        <path d="M9 13h6"></path>
                        <path d="M9 17h6"></path>
                    </svg>`,
                    dataField: 'contract_ids',
                    enabled: dataItem.hasContractIds || (dataItem.contract_ids && dataItem.contract_ids !== "[]" && dataItem.contract_ids.length > 5) || (dataItem.contractIds && dataItem.contractIds !== "[]" && dataItem.contractIds.length > 5)
                },
                {
                    type: 'document-ids',
                    label: 'Document IDs',
                    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>`,
                    dataField: 'document_ids',
                    enabled: dataItem.hasDocumentIds || (dataItem.document_ids && dataItem.document_ids !== "[]" && dataItem.document_ids.length > 5) || (dataItem.documentIds && dataItem.documentIds !== "[]" && dataItem.documentIds.length > 5)
                },
                {
                    type: 'entity-suggester',
                    label: 'Entity Data',
                    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>`,
                    dataField: 'entitySuggesterData',
                    enabled: dataItem.hasEntitySuggesterData || (dataItem.entitySuggesterData && dataItem.entitySuggesterData !== "[]" && dataItem.entitySuggesterData.length > 5)
                }
            ];

            // Create each button
            dataButtons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `data-btn ${button.type}-btn`;
                btn.disabled = !button.enabled;
                btn.innerHTML = `${button.icon} ${button.label}`;
                btn.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.4rem 0.6rem;
                    background-color: ${button.enabled ? '#2d3748' : '#1f2937'};
                    color: ${button.enabled ? '#d1d5db' : '#6b7280'};
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.75rem;
                    cursor: ${button.enabled ? 'pointer' : 'not-allowed'};
                    transition: background-color 0.2s, transform 0.2s;
                    opacity: ${button.enabled ? '1' : '0.5'};
                `;

                // Add hover effects
                if (button.enabled) {
                    btn.addEventListener('mouseover', () => {
                        btn.style.backgroundColor = '#4a5568';
                        btn.style.transform = 'translateY(-1px)';
                    });

                    btn.addEventListener('mouseout', () => {
                        btn.style.backgroundColor = '#2d3748';
                        btn.style.transform = 'translateY(0)';
                    });

                    // Add click handler
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (button.enabled) {
                            openDataPopup(button.label, dataItem[button.dataField]);
                        }
                    });
                }

                additionalDataButtons.appendChild(btn);
            });

            // Add buttons to content area
            contentArea.appendChild(additionalDataButtons);
            console.log(`☢️ FORCE DATA BUTTONS: Added buttons to item ${itemId}`);
        });
    }

    // Function to open a data popup
    function openDataPopup(title, data) {
        // Check if a popup already exists and remove it
        const existingPopup = document.getElementById('data-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'data-popup';
        popup.className = 'data-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-labelledby', 'popup-title');
        popup.setAttribute('aria-modal', 'true');
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        `;

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popupContent.style.cssText = `
            background-color: #1f2937;
            border-radius: 0.5rem;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Create header
        const popupHeader = document.createElement('div');
        popupHeader.className = 'popup-header';
        popupHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #374151;
        `;

        // Create title
        const popupTitle = document.createElement('h3');
        popupTitle.id = 'popup-title';
        popupTitle.textContent = title;
        popupTitle.style.cssText = `
            margin: 0;
            font-size: 1.25rem;
            font-weight: 500;
        `;
        popupHeader.appendChild(popupTitle);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'popup-close';
        closeButton.title = 'Close';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
        `;
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#374151';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = 'transparent';
        });
        closeButton.addEventListener('click', () => {
            popup.style.opacity = '0';
            popup.style.visibility = 'hidden';
            setTimeout(() => popup.remove(), 300);
        });
        popupHeader.appendChild(closeButton);

        // Create body
        const popupBody = document.createElement('div');
        popupBody.className = 'popup-body';
        popupBody.style.cssText = `
            padding: 1rem;
            overflow-y: auto;
            flex: 1;
            max-height: calc(90vh - 60px);
        `;

        // Format and add the data
        let formattedData;
        try {
            // Handle if data is already an object
            if (typeof data === 'object' && data !== null) {
                formattedData = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }
            // Try to parse JSON if it's a string
            else if (typeof data === 'string') {
                try {
                    const parsedData = JSON.parse(data);
                    formattedData = `<pre>${JSON.stringify(parsedData, null, 2)}</pre>`;
                } catch {
                    // If not valid JSON, display as formatted text
                    formattedData = `<pre>${data}</pre>`;
                }
            } else {
                formattedData = `<pre>${String(data)}</pre>`;
            }
        } catch (e) {
            formattedData = `<pre>Error displaying data: ${e.message}</pre>`;
        }

        popupBody.innerHTML = formattedData;

        // Add content to popup
        popupContent.appendChild(popupHeader);
        popupContent.appendChild(popupBody);
        popup.appendChild(popupContent);

        // Add popup to body
        document.body.appendChild(popup);

        // Animate the popup
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.visibility = 'visible';
            popupContent.style.transform = 'scale(1)';
        }, 10);

        // Add click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.opacity = '0';
                popup.style.visibility = 'hidden';
                setTimeout(() => popup.remove(), 300);
            }
        });
    }

    // Set up mutation observer to catch new items added to the DOM
    function setupMutationObserver() {
        console.log("☢️ FORCE DATA BUTTONS: Setting up mutation observer");

        // Create a mutation observer
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Check if any new feedback items were added
                    const newItems = [];
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            if (node.classList && node.classList.contains('feedback-item')) {
                                newItems.push(node);
                            }

                            // Also check for feedback items inside the added node
                            const childItems = node.querySelectorAll('.feedback-item');
                            if (childItems.length > 0) {
                                childItems.forEach(item => newItems.push(item));
                            }
                        }
                    });

                    // Process any new items
                    if (newItems.length > 0) {
                        console.log(`☢️ FORCE DATA BUTTONS: Found ${newItems.length} new items from mutation`);
                        addDataButtonsToAllItems(newItems);
                    }
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also add a listener for page size button clicks, because they often trigger re-rendering
        document.querySelectorAll('.page-size-btn').forEach(button => {
            button.addEventListener('click', function() {
                console.log("☢️ FORCE DATA BUTTONS: Page size button clicked, scheduling check");
                setTimeout(function() {
                    const items = document.querySelectorAll('.feedback-item');
                    addDataButtonsToAllItems(items);
                }, 500);
            });
        });

        // Add a listener for custom size apply button
        const customApplyButton = document.querySelector('.custom-size-apply');
        if (customApplyButton) {
            customApplyButton.addEventListener('click', function() {
                console.log("☢️ FORCE DATA BUTTONS: Custom size apply clicked, scheduling check");
                setTimeout(function() {
                    const items = document.querySelectorAll('.feedback-item');
                    addDataButtonsToAllItems(items);
                }, 500);
            });
        }

        // Add a listener for refresh button
        const refreshButton = document.querySelector('.refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                console.log("☢️ FORCE DATA BUTTONS: Refresh button clicked, scheduling check");
                setTimeout(function() {
                    const items = document.querySelectorAll('.feedback-item');
                    addDataButtonsToAllItems(items);
                }, 1000);
            });
        }
    }

    // Also override the renderItems function to ensure our buttons are added
    const originalRenderItems = window.renderItems;
    if (typeof originalRenderItems === 'function') {
        console.log("☢️ FORCE DATA BUTTONS: Overriding renderItems function");

        window.renderItems = function() {
            // Call original function
            const result = originalRenderItems.apply(this, arguments);

            // Wait a bit for the DOM to update, then add our buttons
            setTimeout(function() {
                const items = document.querySelectorAll('.feedback-item');
                if (items.length > 0) {
                    console.log(`☢️ FORCE DATA BUTTONS: Adding buttons after renderItems to ${items.length} items`);
                    addDataButtonsToAllItems(items);
                }
            }, 100);

            return result;
        };
    }

    // Start the force restore process
    forceRestoreDataButtons();

    // Also set a periodic check to ensure buttons are always present
    setInterval(function() {
        const items = document.querySelectorAll('.feedback-item');
        const itemsWithoutButtons = document.querySelectorAll('.feedback-item:not(:has(.additional-data-buttons))');

        if (items.length > 0 && itemsWithoutButtons.length > 0) {
            console.log(`☢️ FORCE DATA BUTTONS: Periodic check found ${itemsWithoutButtons.length} items missing buttons out of ${items.length} total`);
            addDataButtonsToAllItems(itemsWithoutButtons);
        }
    }, 2000);

    console.log("☢️ FORCE DATA BUTTONS: Standalone button restorer initialized");
})();