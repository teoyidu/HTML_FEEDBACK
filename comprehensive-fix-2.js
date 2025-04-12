// feedback-system-fix-2.js - Add after comprehensive-fix.js

(function() {
    console.log("Restoring missing functionality - feedback-system-fix-2...");

    // Wait for document and data to be ready
    function initialize() {
        // Fix 1: Restore Agent History and ID buttons
        restoreDataButtons();

        // Fix 2: Ensure schema and feedback buttons work
        fixButtonFunctionality();

        // Fix 3: Fix tab system
        restoreTabSystem();

        console.log("Missing functionality restored!");
    }

    /**
     * Fix 1: Restore the additional data buttons (Agent History, IDs, etc.)
     */
    function restoreDataButtons() {
        // Store original renderItems function if it exists
        const originalRenderItems = window.renderItems;

        // Create enhanced version that adds the data buttons
        window.renderItems = function() {
            // Call the original renderItems function
            const result = originalRenderItems.apply(this, arguments);

            // After rendering, add the additional data buttons to each item
            addDataButtonsToItems();

            return result;
        };

        // Function to add data buttons to all items
        function addDataButtonsToItems() {
            const feedbackItems = document.querySelectorAll('.feedback-item');

            feedbackItems.forEach(item => {
                // Skip if item already has data buttons
                if (item.querySelector('.additional-data-buttons')) return;

                // Get the itemId
                const itemId = item.dataset.id;
                if (!itemId) return;

                // Find the matching data item
                const dataItem = window.data.find(d => d.id === itemId);
                if (!dataItem) return;

                // Find content area to add buttons to
                const contentArea = item.querySelector('.feedback-content');
                if (!contentArea) return;

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
    }

    /**
     * Fix 2: Ensure schema and feedback buttons work correctly
     */
    function fixButtonFunctionality() {
        // Fix schema button functionality
        patchSchemaFunction();

        // Fix feedback button functionality
        patchFeedbackFunctions();
    }

    /**
     * Patch the setSchema function
     */
    function patchSchemaFunction() {
        // If setSchema function doesn't exist, create it
        if (typeof window.setSchema !== 'function') {
            window.setSchema = function(id, schema) {
                console.log(`Setting schema for ${id} to ${schema}`);

                const item = window.data.find(item => item.id === id);
                if (!item) {
                    console.error(`Item with ID ${id} not found`);
                    return;
                }

                // Update schema locally
                const oldSchema = item.schema;
                item.schema = schema;

                // Update UI to reflect change
                const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
                if (itemElement) {
                    const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                    schemaButtons.forEach(button => {
                        const buttonSchema = button.dataset.schema;
                        if (buttonSchema === schema) {
                            button.classList.add('active');
                            button.style.backgroundColor = '#2563eb';
                            button.style.color = 'white';
                            button.style.borderColor = '#2563eb';
                        } else {
                            button.classList.remove('active');
                            button.style.backgroundColor = '#1f2937';
                            button.style.color = '#d1d5db';
                            button.style.borderColor = '#374151';
                        }
                    });
                }

                // If there's already a setSchema in progress for this item, cancel it
                if (item._schemaUpdateTimeout) {
                    clearTimeout(item._schemaUpdateTimeout);
                }

                // Update MongoDB via API with debounce
                item._schemaUpdateTimeout = setTimeout(async () => {
                    try {
                        const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                        const response = await fetch(`${apiUrl}/conversations/${id}/schema`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ schema })
                        });

                        if (!response.ok) {
                            console.error('Error updating schema:', await response.text());
                            // Revert to old schema if update failed
                            item.schema = oldSchema;
                            if (itemElement) {
                                const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                                schemaButtons.forEach(button => {
                                    const buttonSchema = button.dataset.schema;
                                    if (buttonSchema === oldSchema) {
                                        button.classList.add('active');
                                        button.style.backgroundColor = '#2563eb';
                                        button.style.color = 'white';
                                        button.style.borderColor = '#2563eb';
                                    } else {
                                        button.classList.remove('active');
                                        button.style.backgroundColor = '#1f2937';
                                        button.style.color = '#d1d5db';
                                        button.style.borderColor = '#374151';
                                    }
                                });
                            }
                            // Alert error
                            const alertMessage = `Failed to update schema to "${schema}" on server. Please try again.`;
                            createAlert(alertMessage, 'error');
                            return;
                        }

                        delete item._schemaUpdateTimeout;

                        // Apply filters to update UI if needed
                        if (window.activeSchema) {
                            window.applyFilters();
                        }
                    } catch (error) {
                        console.error('Failed to update schema:', error);
                        // Revert to old schema if update failed
                        item.schema = oldSchema;
                        if (itemElement) {
                            const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                            schemaButtons.forEach(button => {
                                const buttonSchema = button.dataset.schema;
                                if (buttonSchema === oldSchema) {
                                    button.classList.add('active');
                                    button.style.backgroundColor = '#2563eb';
                                    button.style.color = 'white';
                                    button.style.borderColor = '#2563eb';
                                } else {
                                    button.classList.remove('active');
                                    button.style.backgroundColor = '#1f2937';
                                    button.style.color = '#d1d5db';
                                    button.style.borderColor = '#374151';
                                }
                            });
                        }
                        // Alert error
                        const alertMessage = `Failed to update schema: ${error.message}`;
                        createAlert(alertMessage, 'error');
                    }
                }, 500); // Debounce 500ms
            };
        }
    }

    /**
     * Patch the feedback functions
     */
    function patchFeedbackFunctions() {
        window.handlePositiveFeedback = async function(id) {
            console.log(`Handling positive feedback for ${id}`);

            const item = window.data.find(item => item.id === id);
            if (!item) {
                console.error(`Item with ID ${id} not found`);
                return;
            }

            // If already positive, remove feedback
            const newFeedback = item.feedback === 'positive' ? null : 'positive';

            // Update data locally first
            window.data = window.data.map(dataItem => {
                if (dataItem.id === id) {
                    return { ...dataItem, feedback: newFeedback };
                }
                return dataItem;
            });

            // Update UI
            const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
            if (itemElement) {
                // Update feedback buttons
                const positiveBtn = itemElement.querySelector('.action-btn.positive');
                if (positiveBtn) {
                    positiveBtn.style.backgroundColor = newFeedback === 'positive' ? '#10b981' : '#374151';
                }

                const negativeBtn = itemElement.querySelector('.action-btn.negative');
                if (negativeBtn && newFeedback === 'positive') {
                    negativeBtn.style.backgroundColor = '#374151';
                }

                // Update item class
                if (newFeedback === 'positive') {
                    itemElement.classList.add('positive');
                    itemElement.classList.remove('negative');
                } else {
                    itemElement.classList.remove('positive');
                }
            }

            // Update MongoDB via API
            try {
                const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                const response = await fetch(`${apiUrl}/conversations/${id}/feedback`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback: newFeedback })
                });

                if (!response.ok) {
                    console.error('Error updating feedback:', await response.text());
                    createAlert('Error updating feedback on server', 'warning');
                } else if (newFeedback === 'positive') {
                    // If feedback changed to positive, show QDrant popup
                    showQdrantPopup(item);
                }
            } catch (error) {
                console.error('Failed to update feedback:', error);
                createAlert(`Failed to update feedback: ${error.message}`, 'error');
            }

            // Apply filters to update UI
            if (window.activeFeedbackFilter) {
                window.applyFilters();
            }
        };
        // Fix handleNegativeFeedback
        if (typeof window.handleNegativeFeedback !== 'function') {
            window.handleNegativeFeedback = async function(id) {
                console.log(`Handling negative feedback for ${id}`);

                const item = window.data.find(item => item.id === id);
                if (!item) {
                    console.error(`Item with ID ${id} not found`);
                    return;
                }

                // If already negative, remove feedback
                const newFeedback = item.feedback === 'negative' ? null : 'negative';

                // Update data locally first
                window.data = window.data.map(dataItem => {
                    if (dataItem.id === id) {
                        return { ...dataItem, feedback: newFeedback };
                    }
                    return dataItem;
                });

                // Update UI
                const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
                if (itemElement) {
                    // Update feedback buttons
                    const negativeBtn = itemElement.querySelector('.action-btn.negative');
                    if (negativeBtn) {
                        negativeBtn.style.backgroundColor = newFeedback === 'negative' ? '#ef4444' : '#374151';
                    }

                    const positiveBtn = itemElement.querySelector('.action-btn.positive');
                    if (positiveBtn && newFeedback === 'negative') {
                        positiveBtn.style.backgroundColor = '#374151';
                    }

                    // Update item class
                    if (newFeedback === 'negative') {
                        itemElement.classList.add('negative');
                        itemElement.classList.remove('positive');
                    } else {
                        itemElement.classList.remove('negative');
                    }
                }

                // Update MongoDB via API
                try {
                    const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                    const response = await fetch(`${apiUrl}/conversations/${id}/feedback`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ feedback: newFeedback })
                    });

                    if (!response.ok) {
                        console.error('Error updating feedback:', await response.text());
                        // Alert error but don't revert UI to avoid flickering (will be fixed on next load)
                        createAlert('Error updating feedback on server', 'warning');
                    }
                } catch (error) {
                    console.error('Failed to update feedback:', error);
                    createAlert(`Failed to update feedback: ${error.message}`, 'error');
                }

                // Apply filters to update UI
                if (window.activeFeedbackFilter) {
                    window.applyFilters();
                }
            };
        }

        // Fix handleToggleHidden
        if (typeof window.handleToggleHidden !== 'function') {
            window.handleToggleHidden = async function(id) {
                console.log(`Toggling hidden state for ${id}`);

                const item = window.data.find(item => item.id === id);
                if (!item) {
                    console.error(`Item with ID ${id} not found`);
                    return;
                }

                // Toggle hidden state
                const newHiddenState = !item.hidden;

                // Update data locally first
                window.data = window.data.map(dataItem => {
                    if (dataItem.id === id) {
                        return { ...dataItem, hidden: newHiddenState };
                    }
                    return dataItem;
                });

                // Update UI
                const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
                if (itemElement) {
                    // Update archive button
                    const archiveBtn = itemElement.querySelector('.action-btn.archive');
                    if (archiveBtn) {
                        archiveBtn.style.backgroundColor = newHiddenState ? '#f59e0b' : '#374151';
                    }

                    // Add/remove hidden class
                    if (newHiddenState) {
                        itemElement.classList.add('hidden');
                    } else {
                        itemElement.classList.remove('hidden');
                    }
                }

                // Update MongoDB via API
                try {
                    const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                    const response = await fetch(`${apiUrl}/conversations/${id}/archive`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ hidden: newHiddenState })
                    });

                    if (!response.ok) {
                        console.error('Error updating archive status:', await response.text());
                        // Alert error but don't revert UI to avoid flickering (will be fixed on next load)
                        createAlert('Error updating archive status on server', 'warning');
                    }
                } catch (error) {
                    console.error('Failed to update archive status:', error);
                    createAlert(`Failed to update archive status: ${error.message}`, 'error');
                }

                // Apply filters to update UI
                if (!window.showHidden) {
                    window.applyFilters();
                }
            };
        }
    }

    /**
     * Create an alert notification
     */
    function createAlert(message, type = 'info', autoDismiss = true) {
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

        // Add close button
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

        // Add to body
        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => {
            alert.style.opacity = '1';
        }, 10);

        // Auto dismiss after 5 seconds if specified
        if (autoDismiss) {
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        }

        return alert;
    }

    /**
     * Fix 3: Restore the tab system
     */
    function restoreTabSystem() {
        // If initializeTabs function doesn't exist, create it
        if (typeof window.initializeTabs !== 'function') {
            window.initializeTabs = function(totalPages) {
                const tabsList = document.getElementById('tabs-list');
                const prevTabBtn = document.getElementById('prev-tab-btn');
                const nextTabBtn = document.getElementById('next-tab-btn');

                if (!tabsList || !prevTabBtn || !nextTabBtn) {
                    console.warn("Tab navigation elements not found");
                    return;
                }

                // Clear existing tabs
                tabsList.innerHTML = '';

                // Create tabs
                for (let i = 0; i < totalPages; i++) {
                    const tab = document.createElement('button');
                    tab.className = `pagination-btn${window.currentPage === i ? ' active' : ''}`;
                    tab.textContent = `Page ${i + 1}`;
                    tab.dataset.page = i;

                    tab.addEventListener('click', () => {
                        if (window.currentPage !== i) {
                            loadPage(i);
                        }
                    });

                    tabsList.appendChild(tab);
                }

                // Update tab visibility based on current page
                updateTabsVisibility();

                // Update navigation buttons
                prevTabBtn.disabled = window.currentPage === 0;
                nextTabBtn.disabled = window.currentPage === totalPages - 1;

                // Make sure event listeners are set up
                setupTabNavigationButtons();
            };
        }

        // If updateTabsVisibility function doesn't exist, create it
        if (typeof window.updateTabsVisibility !== 'function') {
            window.updateTabsVisibility = function() {
                const tabButtons = document.querySelectorAll('.pagination-btn');

                // Default visible tab count if not set
                const visibleTabCount = window.visibleTabCount || 5;

                // Calculate start and end indexes for visible tabs
                let startIndex = Math.max(0, window.currentPage - Math.floor(visibleTabCount / 2));
                let endIndex = Math.min(window.totalPages - 1, startIndex + visibleTabCount - 1);

                // Adjust start index if needed
                if (endIndex - startIndex + 1 < visibleTabCount) {
                    startIndex = Math.max(0, endIndex - visibleTabCount + 1);
                }

                // Show/hide tabs based on calculated range
                tabButtons.forEach((tab, index) => {
                    tab.style.display = (index >= startIndex && index <= endIndex) ? 'block' : 'none';
                });
            };
        }

        // Add helper function to set up tab navigation buttons
        function setupTabNavigationButtons() {
            const prevTabBtn = document.getElementById('prev-tab-btn');
            const nextTabBtn = document.getElementById('next-tab-btn');

            if (!prevTabBtn || !nextTabBtn) return;

            // Remove existing event listeners to avoid duplicates
            const newPrevBtn = prevTabBtn.cloneNode(true);
            const newNextBtn = nextTabBtn.cloneNode(true);

            prevTabBtn.parentNode.replaceChild(newPrevBtn, prevTabBtn);
            nextTabBtn.parentNode.replaceChild(newNextBtn, nextTabBtn);

            // Add new event listeners
            newPrevBtn.addEventListener('click', () => {
                if (window.currentPage > 0) {
                    loadPage(window.currentPage - 1);
                }
            });

            newNextBtn.addEventListener('click', () => {
                if (window.currentPage < window.totalPages - 1) {
                    loadPage(window.currentPage + 1);
                }
            });
        }

        // If loadPage function doesn't exist, create it
        if (typeof window.loadPage !== 'function') {
            window.loadPage = async function(page) {
                // Show loading state
                const connectionText = document.getElementById('connection-text');
                if (connectionText) {
                    connectionText.textContent = `Loading page ${page + 1}...`;
                }

                try {
                    // Fetch data for specific page
                    const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
                    const response = await fetch(`${apiUrl}/conversations?page=${page}&limit=${window.pageSize || 20}`);

                    if (!response.ok) {
                        throw new Error(`API responded with status: ${response.status}`);
                    }

                    const result = await response.json();

                    // Get MongoDB data from result
                    let mongoData;
                    if (result.data) {
                        mongoData = result.data;

                        // Update pagination info
                        window.currentPage = result.pagination ? result.pagination.page : page;
                        window.totalPages = result.pagination ? result.pagination.totalPages : 1;
                    } else if (Array.isArray(result)) {
                        mongoData = result;
                        window.currentPage = page;
                        window.totalPages = 1;
                    } else {
                        throw new Error('Invalid data format from API');
                    }

                    // Convert and store data
                    window.data = window.convertMongoDataToAppFormat ?
                        window.convertMongoDataToAppFormat(mongoData) : mongoData;

                    window.filteredData = [...window.data.filter(item => window.showHidden || !item.hidden)];

                    // Update UI with new page
                    const tabButtons = document.querySelectorAll('.pagination-btn');
                    tabButtons.forEach(tab => {
                        const tabPage = parseInt(tab.dataset.page);
                        tab.classList.toggle('active', tabPage === window.currentPage);
                    });

                    // Update tab visibility
                    updateTabsVisibility();

                    // Update navigation buttons
                    const prevBtn = document.getElementById('prev-tab-btn');
                    const nextBtn = document.getElementById('next-tab-btn');
                    if (prevBtn) prevBtn.disabled = window.currentPage === 0;
                    if (nextBtn) nextBtn.disabled = window.currentPage === window.totalPages - 1;

                    // Update status message
                    if (connectionText) {
                        if (result.pagination) {
                            connectionText.textContent = `Page ${window.currentPage + 1} of ${window.totalPages} - Total records: ${result.pagination.totalCount}`;
                        } else {
                            connectionText.textContent = `Page ${window.currentPage + 1} - ${window.data.length} records loaded`;
                        }
                    }

                    // Apply filters to update UI
                    if (typeof window.applyFilters === 'function') {
                        window.applyFilters();
                    } else {
                        // Render items directly if applyFilters is not available
                        window.renderItems();
                    }
                } catch (error) {
                    console.error('Error loading page:', error);
                }
            };
        }
    }

    // Function to show the QDrant popup
    function showQdrantPopup(item) {
        // Check if a popup already exists and remove it
        const existingPopup = document.getElementById('qdrant-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'qdrant-popup';
        popup.className = 'qdrant-popup';
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
        max-width: 800px;
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
        popupTitle.textContent = "Add to QDrant";
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
            closePopup(popup);
        });
        popupHeader.appendChild(closeButton);

        // Create body
        const popupBody = document.createElement('div');
        popupBody.className = 'popup-body';
        popupBody.style.cssText = `
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
    `;

        // Create confirmation message
        const confirmationMessage = document.createElement('p');
        confirmationMessage.textContent = "Do you want to add this to QDrant?";
        confirmationMessage.style.cssText = `
        margin-bottom: 1rem;
    `;
        popupBody.appendChild(confirmationMessage);

        // Create textarea label for conversation
        const conversationLabel = document.createElement('label');
        conversationLabel.setAttribute('for', 'qdrant-conversation');
        conversationLabel.textContent = "Conversation:";
        conversationLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    `;
        popupBody.appendChild(conversationLabel);

        // Create textarea for conversation (empty as requested)
        const conversationTextarea = document.createElement('textarea');
        conversationTextarea.id = 'qdrant-conversation';
        conversationTextarea.placeholder = "Enter conversation here...";
        conversationTextarea.style.cssText = `
        width: 100%;
        min-height: 150px;
        padding: 0.75rem;
        background-color: #2d3748;
        color: #e5e7eb;
        border: 1px solid #4b5563;
        border-radius: 0.375rem;
        resize: vertical;
        font-family: monospace;
        margin-bottom: 1rem;
    `;
        popupBody.appendChild(conversationTextarea);

        // Create textarea label for cypher query
        const cypherLabel = document.createElement('label');
        cypherLabel.setAttribute('for', 'qdrant-cypher');
        cypherLabel.textContent = "Cypher Query:";
        cypherLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    `;
        popupBody.appendChild(cypherLabel);

        // Create textarea for cypher query (empty as requested)
        const cypherTextarea = document.createElement('textarea');
        cypherTextarea.id = 'qdrant-cypher';
        cypherTextarea.placeholder = "Enter cypher query here...";
        cypherTextarea.style.cssText = `
        width: 100%;
        min-height: 100px;
        padding: 0.75rem;
        background-color: #2d3748;
        color: #e5e7eb;
        border: 1px solid #4b5563;
        border-radius: 0.375rem;
        resize: vertical;
        font-family: monospace;
        margin-bottom: 1rem;
    `;
        popupBody.appendChild(cypherTextarea);

        // Create footer with buttons
        const popupFooter = document.createElement('div');
        popupFooter.className = 'popup-footer';
        popupFooter.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem;
        border-top: 1px solid #374151;
    `;

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = "Cancel";
        cancelButton.className = 'cancel-button';
        cancelButton.style.cssText = `
        padding: 0.5rem 1rem;
        background-color: #374151;
        color: #e5e7eb;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
        cancelButton.addEventListener('mouseover', () => {
            cancelButton.style.backgroundColor = '#4b5563';
        });
        cancelButton.addEventListener('mouseout', () => {
            cancelButton.style.backgroundColor = '#374151';
        });
        cancelButton.addEventListener('click', () => {
            closePopup(popup);
        });
        popupFooter.appendChild(cancelButton);

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = "Send to QDrant";
        submitButton.className = 'submit-button';
        submitButton.style.cssText = `
        padding: 0.5rem 1rem;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
        submitButton.addEventListener('mouseover', () => {
            submitButton.style.backgroundColor = '#1d4ed8';
        });
        submitButton.addEventListener('mouseout', () => {
            submitButton.style.backgroundColor = '#2563eb';
        });
        submitButton.addEventListener('click', () => {
            const conversation = conversationTextarea.value;
            const cypherQuery = cypherTextarea.value;
            sendToQdrant(item.id, conversation, cypherQuery);
            closePopup(popup);
        });
        popupFooter.appendChild(submitButton);

        // Add all parts to popup
        popupContent.appendChild(popupHeader);
        popupContent.appendChild(popupBody);
        popupContent.appendChild(popupFooter);
        popup.appendChild(popupContent);

        // Add popup to body
        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.visibility = 'visible';
            popupContent.style.transform = 'scale(1)';
        }, 10);

        // Close popup function
        function closePopup(element) {
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
            setTimeout(() => element.remove(), 300);
        }

        // Add click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup(popup);
        });

        // Handle ESC key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closePopup(popup);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

// Function to send data to QDrant
    async function sendToQdrant(id, conversation, cypherQuery) {
        try {
            // Input validation
            if (!conversation || !cypherQuery) {
                createAlert('Please enter both conversation and cypher query', 'warning');
                return false;
            }

            const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/qdrant/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    conversation,
                    cypherQuery
                })
            });

            if (!response.ok) {
                console.error('Error sending to QDrant:', await response.text());
                createAlert('Error sending to QDrant', 'error');
                return false;
            }

            createAlert('Successfully added to QDrant', 'success');
            return true;
        } catch (error) {
            console.error('Failed to send to QDrant:', error);
            createAlert(`Failed to send to QDrant: ${error.message}`, 'error');
            return false;
        }
    }
})();
// Function to show the QDrant popup
function showQdrantPopup(item) {
    // Check if a popup already exists and remove it
    const existingPopup = document.getElementById('qdrant-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'qdrant-popup';
    popup.className = 'qdrant-popup';
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
        max-width: 800px;
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
    popupTitle.textContent = "Add to QDrant";
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
        closePopup(popup);
    });
    popupHeader.appendChild(closeButton);

    // Create body
    const popupBody = document.createElement('div');
    popupBody.className = 'popup-body';
    popupBody.style.cssText = `
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
    `;

    // Create confirmation message
    const confirmationMessage = document.createElement('p');
    confirmationMessage.textContent = "Do you want to add this to QDrant?";
    confirmationMessage.style.cssText = `
        margin-bottom: 1rem;
    `;
    popupBody.appendChild(confirmationMessage);

    // Create textarea label for conversation
    const conversationLabel = document.createElement('label');
    conversationLabel.setAttribute('for', 'qdrant-conversation');
    conversationLabel.textContent = "Conversation:";
    conversationLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    `;
    popupBody.appendChild(conversationLabel);

    // Create textarea for conversation (empty as requested)
    const conversationTextarea = document.createElement('textarea');
    conversationTextarea.id = 'qdrant-conversation';
    conversationTextarea.placeholder = "Enter conversation here...";
    conversationTextarea.style.cssText = `
        width: 100%;
        min-height: 150px;
        padding: 0.75rem;
        background-color: #2d3748;
        color: #e5e7eb;
        border: 1px solid #4b5563;
        border-radius: 0.375rem;
        resize: vertical;
        font-family: monospace;
        margin-bottom: 1rem;
    `;
    popupBody.appendChild(conversationTextarea);

    // Create textarea label for cypher query
    const cypherLabel = document.createElement('label');
    cypherLabel.setAttribute('for', 'qdrant-cypher');
    cypherLabel.textContent = "Cypher Query:";
    cypherLabel.style.cssText = `
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    `;
    popupBody.appendChild(cypherLabel);

    // Create textarea for cypher query (empty as requested)
    const cypherTextarea = document.createElement('textarea');
    cypherTextarea.id = 'qdrant-cypher';
    cypherTextarea.placeholder = "Enter cypher query here...";
    cypherTextarea.style.cssText = `
        width: 100%;
        min-height: 100px;
        padding: 0.75rem;
        background-color: #2d3748;
        color: #e5e7eb;
        border: 1px solid #4b5563;
        border-radius: 0.375rem;
        resize: vertical;
        font-family: monospace;
        margin-bottom: 1rem;
    `;
    popupBody.appendChild(cypherTextarea);

    // Create footer with buttons
    const popupFooter = document.createElement('div');
    popupFooter.className = 'popup-footer';
    popupFooter.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem;
        border-top: 1px solid #374151;
    `;

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Cancel";
    cancelButton.className = 'cancel-button';
    cancelButton.style.cssText = `
        padding: 0.5rem 1rem;
        background-color: #374151;
        color: #e5e7eb;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
    cancelButton.addEventListener('mouseover', () => {
        cancelButton.style.backgroundColor = '#4b5563';
    });
    cancelButton.addEventListener('mouseout', () => {
        cancelButton.style.backgroundColor = '#374151';
    });
    cancelButton.addEventListener('click', () => {
        closePopup(popup);
    });
    popupFooter.appendChild(cancelButton);

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = "Send to QDrant";
    submitButton.className = 'submit-button';
    submitButton.style.cssText = `
        padding: 0.5rem 1rem;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
    submitButton.addEventListener('mouseover', () => {
        submitButton.style.backgroundColor = '#1d4ed8';
    });
    submitButton.addEventListener('mouseout', () => {
        submitButton.style.backgroundColor = '#2563eb';
    });
    submitButton.addEventListener('click', () => {
        const conversation = conversationTextarea.value;
        const cypherQuery = cypherTextarea.value;
        sendToQdrant(item.id, conversation, cypherQuery);
        closePopup(popup);
    });
    popupFooter.appendChild(submitButton);

    // Add all parts to popup
    popupContent.appendChild(popupHeader);
    popupContent.appendChild(popupBody);
    popupContent.appendChild(popupFooter);
    popup.appendChild(popupContent);

    // Add popup to body
    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.visibility = 'visible';
        popupContent.style.transform = 'scale(1)';
    }, 10);

    // Close popup function
    function closePopup(element) {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        setTimeout(() => element.remove(), 300);
    }

    // Add click outside to close
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup(popup);
    });

    // Handle ESC key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closePopup(popup);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Function to send data to QDrant
async function sendToQdrant(id, conversation, cypherQuery) {
    try {
        // Input validation
        if (!conversation || !cypherQuery) {
            createAlert('Please enter both conversation and cypher query', 'warning');
            return false;
        }

        const apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/qdrant/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                conversation,
                cypherQuery
            })
        });

        if (!response.ok) {
            console.error('Error sending to QDrant:', await response.text());
            createAlert('Error sending to QDrant', 'error');
            return false;
        }

        createAlert('Successfully added to QDrant', 'success');
        return true;
    } catch (error) {
        console.error('Failed to send to QDrant:', error);
        createAlert(`Failed to send to QDrant: ${error.message}`, 'error');
        return false;
    }
}
