// feedback-module.js - Module pattern implementation for feedback system components
// Add this after the initialization script

(function(FS) {
    // Verify FeedbackSystem is available
    if (!FS) {
        console.error('FeedbackSystem not initialized. Make sure feedback-system-init.js is loaded first.');
        return;
    }

    // UI Module - Handles UI rendering and updates
    FS.UI = {
        // Render feedback items
        renderItems: function() {
            const feedbackItems = document.getElementById('feedback-items');
            const noResults = document.getElementById('no-results');
            const resultsCount = document.getElementById('results-count');

            console.log("Rendering items, filtered data length:", FS.state.filteredData.length);

            if (!feedbackItems || !noResults || !resultsCount) return;

            resultsCount.textContent = `Showing ${Math.min(FS.state.pageSize, FS.state.filteredData.length)} of ${FS.state.filteredData.length} results`;

            feedbackItems.innerHTML = '';

            if (FS.state.filteredData.length === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');

                FS.state.filteredData.slice(0, FS.state.pageSize).forEach((item, index) => {
                    // Create item element
                    const itemElement = this.createFeedbackItemElement(item);
                    // Add to the container
                    feedbackItems.appendChild(itemElement);
                });
            }

            // Emit rendering complete event
            document.dispatchEvent(new CustomEvent('renderingComplete', {
                detail: {
                    renderedCount: Math.min(FS.state.pageSize, FS.state.filteredData.length),
                    totalCount: FS.state.filteredData.length
                }
            }));
        },

        // Create a feedback item element
        createFeedbackItemElement: function(item) {
            const itemElement = document.createElement('div');
            itemElement.className = 'feedback-item';
            itemElement.dataset.id = item.id;

            // Create schema buttons
            const schemaButtons = this.createSchemaButtons(item);

            // Create content area
            const contentArea = this.createContentArea(item);

            // Create actions area
            const actions = this.createActionsArea(item);

            // Add all parts to the item
            itemElement.appendChild(schemaButtons);
            itemElement.appendChild(contentArea);
            itemElement.appendChild(actions);

            return itemElement;
        },

        // Create schema buttons section
        createSchemaButtons: function(item) {
            const schemaButtons = document.createElement('div');
            schemaButtons.className = 'schema-buttons';

            FS.config.schemaList.forEach(schema => {
                const button = document.createElement('button');
                button.className = `schema-btn${item.schema === schema ? ' active' : ''}`;
                button.textContent = schema;
                button.dataset.schema = schema;

                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    FS.setSchema(item.id, schema);
                });

                schemaButtons.appendChild(button);
            });

            return schemaButtons;
        },

        // Create content area section
        createContentArea: function(item) {
            const contentArea = document.createElement('div');
            contentArea.className = 'feedback-content';

            // User info
            const userInfo = document.createElement('div');
            userInfo.className = 'feedback-user-info';
            userInfo.innerHTML = `
        <span class="user-name">User: ${item.user}</span>
        <span class="datetime">${FS.formatDateTime(item.datetime)}</span>
      `;
            contentArea.appendChild(userInfo);

            // Buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'feedback-buttons';

            // Conversation button
            const conversationBtn = document.createElement('button');
            conversationBtn.className = 'conversation-btn';
            conversationBtn.textContent = item.question;
            conversationBtn.addEventListener('click', () => {
                FS.openConversationModal(item);
            });

            // Small buttons
            const smallButtons = document.createElement('div');
            smallButtons.className = 'small-buttons';

            // Suggestion button
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.textContent = 'Suggestion';
            suggestionBtn.addEventListener('click', () => {
                FS.openSuggestionModal(item);
            });

            // Cypher button
            const cypherBtn = document.createElement('button');
            cypherBtn.className = 'cypher-btn';
            cypherBtn.textContent = 'Cypher Query';
            cypherBtn.addEventListener('click', () => {
                FS.openCypherModal(item);
            });

            smallButtons.appendChild(suggestionBtn);
            smallButtons.appendChild(cypherBtn);

            buttonsContainer.appendChild(conversationBtn);
            buttonsContainer.appendChild(smallButtons);

            contentArea.appendChild(buttonsContainer);

            // Add additional data buttons (if needed)
            const additionalDataButtons = this.createDataButtons(item);
            contentArea.appendChild(additionalDataButtons);

            return contentArea;
        },

        // Create additional data buttons
        createDataButtons: function(item) {
            const additionalDataButtons = document.createElement('div');
            additionalDataButtons.className = 'additional-data-buttons';

            // Agent History button
            const agentHistoryBtn = document.createElement('button');
            agentHistoryBtn.className = 'data-btn agent-history-btn';
            agentHistoryBtn.disabled = !item.hasAgentHistoryData;
            agentHistoryBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5Z"></path>
          <path d="M3 12c0-5.5 5.9-10 9-10"></path>
          <path d="M15 2v6h6"></path>
          <path d="M21 12c0 5.5-5.9 10-9 10"></path>
          <path d="M9 22v-6H3"></path>
        </svg>
        Agent History
      `;
            agentHistoryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.hasAgentHistoryData) {
                    FS.openDataPopup('Agent History', item.agentHistoryFilteredData);
                }
            });

            // Contract IDs button
            const contractIdsBtn = document.createElement('button');
            contractIdsBtn.className = 'data-btn contract-ids-btn';
            contractIdsBtn.disabled = !item.hasContractIds;
            contractIdsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path>
          <path d="M9 9h1"></path>
          <path d="M9 13h6"></path>
          <path d="M9 17h6"></path>
        </svg>
        Contract IDs
      `;
            contractIdsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.hasContractIds) {
                    FS.openDataPopup('Contract IDs', item.contractIds);
                }
            });

            // Document IDs button
            const documentIdsBtn = document.createElement('button');
            documentIdsBtn.className = 'data-btn document-ids-btn';
            documentIdsBtn.disabled = !item.hasDocumentIds;
            documentIdsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Document IDs
      `;
            documentIdsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.hasDocumentIds) {
                    FS.openDataPopup('Document IDs', item.documentIds);
                }
            });

            // Entity suggester button
            const entitySuggesterBtn = document.createElement('button');
            entitySuggesterBtn.className = 'data-btn entity-suggester-btn';
            entitySuggesterBtn.disabled = !item.hasEntitySuggesterData;
            entitySuggesterBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        Entity Data
      `;
            entitySuggesterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.hasEntitySuggesterData) {
                    FS.openDataPopup('Entity Suggester Data', item.entitySuggesterData);
                }
            });

            // Add buttons to container
            additionalDataButtons.appendChild(agentHistoryBtn);
            additionalDataButtons.appendChild(contractIdsBtn);
            additionalDataButtons.appendChild(documentIdsBtn);
            additionalDataButtons.appendChild(entitySuggesterBtn);

            return additionalDataButtons;
        },

        // Create actions area section
        createActionsArea: function(item) {
            const actions = document.createElement('div');
            actions.className = 'feedback-actions';

            // Positive button
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
                FS.handlePositiveFeedback(item.id);
            });

            // Archive button
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
                FS.handleToggleHidden(item.id);
            });

            // Negative button
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
                FS.handleNegativeFeedback(item.id);
            });

            // Add buttons to actions container
            actions.appendChild(positiveBtn);
            actions.appendChild(archiveBtn);
            actions.appendChild(negativeBtn);

            return actions;
        },

        // Initialize tabs for pagination
        initializeTabs: function(totalPages) {
            const tabsList = document.getElementById('tabs-list');
            const prevTabBtn = document.getElementById('prev-tab-btn');
            const nextTabBtn = document.getElementById('next-tab-btn');

            if (!tabsList || !prevTabBtn || !nextTabBtn) return;

            tabsList.innerHTML = '';

            for (let i = 0; i < totalPages; i++) {
                const tab = document.createElement('button');
                tab.className = `pagination-btn${FS.state.currentPage === i ? ' active' : ''}`;
                tab.textContent = `Page ${i + 1}`;
                tab.dataset.page = i;

                tab.addEventListener('click', () => {
                    if (FS.state.currentPage !== i) {
                        FS.loadPage(i);
                    }
                });

                tabsList.appendChild(tab);
            }

            this.updateTabsVisibility();

            prevTabBtn.disabled = FS.state.currentPage === 0;
            nextTabBtn.disabled = FS.state.currentPage === totalPages - 1;

            // Remove any existing event listeners
            const newPrevBtn = prevTabBtn.cloneNode(true);
            const newNextBtn = nextTabBtn.cloneNode(true);

            prevTabBtn.parentNode.replaceChild(newPrevBtn, prevTabBtn);
            nextTabBtn.parentNode.replaceChild(newNextBtn, nextTabBtn);

            // Add new event listeners
            newPrevBtn.addEventListener('click', () => {
                if (FS.state.currentPage > 0) {
                    FS.loadPage(FS.state.currentPage - 1);
                }
            });

            newNextBtn.addEventListener('click', () => {
                if (FS.state.currentPage < FS.state.totalPages - 1) {
                    FS.loadPage(FS.state.currentPage + 1);
                }
            });
        },

        // Update tabs visibility based on current page
        updateTabsVisibility: function() {
            const tabButtons = document.querySelectorAll('.pagination-btn');

            let startIndex = Math.max(0, FS.state.currentPage - Math.floor(FS.config.visibleTabCount / 2));
            let endIndex = Math.min(FS.state.totalPages - 1, startIndex + FS.config.visibleTabCount - 1);

            if (endIndex - startIndex + 1 < FS.config.visibleTabCount) {
                startIndex = Math.max(0, endIndex - FS.config.visibleTabCount + 1);
            }

            tabButtons.forEach((tab, index) => {
                tab.style.display = (index >= startIndex && index <= endIndex) ? 'block' : 'none';
            });
        },

        // Show QDrant confirmation dialog
        showQdrantConfirmDialog: function(item) {
            // Create dialog
            const dialog = document.createElement('div');
            dialog.className = 'qdrant-confirm-dialog';
            dialog.innerHTML = `
        <div class="qdrant-confirm-content">
          <h3 class="qdrant-confirm-title">Add to QDrant</h3>
          <p class="qdrant-confirm-text">Would you like to add this question to QDrant?</p>
          <div class="qdrant-confirm-buttons">
            <button class="qdrant-confirm-btn cancel">Cancel</button>
            <button class="qdrant-confirm-btn confirm">Add to QDrant</button>
          </div>
        </div>
      `;

            // Add event listeners
            const cancelBtn = dialog.querySelector('.cancel');
            const confirmBtn = dialog.querySelector('.confirm');

            cancelBtn.addEventListener('click', () => {
                dialog.remove();
            });

            confirmBtn.addEventListener('click', () => {
                dialog.remove();
                this.fillQdrantForm(item);
            });

            document.body.appendChild(dialog);
        },

        // Fill QDrant form and scroll to top
        fillQdrantForm: function(item) {
            // Get the form elements
            const questionTextarea = document.getElementById('qdrant-question');
            const cypherTextarea = document.getElementById('qdrant-cypher');

            if (!questionTextarea || !cypherTextarea) return;

            // Fill with data
            questionTextarea.value = item.question || '';

            // Fill cypher query if available
            if (item.cypherQueries && item.cypherQueries.length > 0) {
                cypherTextarea.value = item.cypherQueries[0] || '';
            } else {
                cypherTextarea.value = '';
            }

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Highlight the textareas
            questionTextarea.classList.add('highlighted');
            cypherTextarea.classList.add('highlighted');

            // Remove highlight after animation
            setTimeout(() => {
                questionTextarea.classList.remove('highlighted');
                cypherTextarea.classList.remove('highlighted');
            }, 2000);
        }
    };

    // API Module - Handles API requests
    FS.API = {
        // Handle positive feedback
        handlePositiveFeedback: async function(id) {
            const item = FS.state.data.find(item => item.id === id);
            if (!item) {
                console.error(`Item with id ${id} not found`);
                return;
            }

            // If already positive, remove feedback
            const newFeedback = item.feedback === 'positive' ? null : 'positive';
            console.log(`Setting feedback for ${id} to ${newFeedback}`);

            // Update data locally first
            FS.state.data = FS.state.data.map(dataItem => {
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
                const response = await fetch(`${FS.config.API_BASE_URL}/conversations/${id}/feedback`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback: newFeedback })
                });

                if (!response.ok) {
                    console.error('Error updating feedback:', await response.text());
                } else if (newFeedback === 'positive') {
                    // Show QDrant confirmation dialog
                    FS.UI.showQdrantConfirmDialog(item);
                }
            } catch (error) {
                console.error('Failed to update feedback:', error);
            }
        },

        // Handle negative feedback
        handleNegativeFeedback: async function(id) {
            const item = FS.state.data.find(item => item.id === id);
            if (!item) return;

            // If already negative, remove feedback
            const newFeedback = item.feedback === 'negative' ? null : 'negative';

            // Update data locally first
            FS.state.data = FS.state.data.map(dataItem => {
                if (dataItem.id === id) {
                    return { ...dataItem, feedback: newFeedback };
                }
                return dataItem;
            });

            // Update MongoDB via API
            try {
                const response = await fetch(`${FS.config.API_BASE_URL}/conversations/${id}/feedback`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ feedback: newFeedback })
                });

                if (!response.ok) {
                    console.error('Error updating feedback:', await response.text());
                }
            } catch (error) {
                console.error('Failed to update feedback:', error);
            }

            // Apply filters to update UI
            FS.applyFilters();
        },

        // Handle toggle hidden
        handleToggleHidden: async function(id) {
            const item = FS.state.data.find(item => item.id === id);
            if (!item) return;

            // Toggle hidden state
            const newHiddenState = !item.hidden;

            // Update data locally first
            FS.state.data = FS.state.data.map(dataItem => {
                if (dataItem.id === id) {
                    return { ...dataItem, hidden: newHiddenState };
                }
                return dataItem;
            });

            // Update MongoDB via API
            try {
                const response = await fetch(`${FS.config.API_BASE_URL}/conversations/${id}/archive`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hidden: newHiddenState })
                });

                if (!response.ok) {
                    console.error('Error updating archive status:', await response.text());
                }
            } catch (error) {
                console.error('Failed to update archive status:', error);
            }

            // Apply filters to update UI
            FS.applyFilters();
        },

        // Set schema for an item
        setSchema: async function(id, schema) {
            const item = FS.state.data.find(item => item.id === id);
            if (!item) return;

            // Update schema locally first
            const oldSchema = item.schema;
            item.schema = schema;

            // Update schema buttons in this item
            const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
            if (itemElement) {
                const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                schemaButtons.forEach(button => {
                    const buttonSchema = button.dataset.schema;
                    button.classList.toggle('active', buttonSchema === schema);
                });
            }

            // Update MongoDB via API
            try {
                const response = await fetch(`${FS.config.API_BASE_URL}/conversations/${id}/schema`, {
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
                            button.classList.toggle('active', buttonSchema === oldSchema);
                        });
                    }
                    alert('Failed to update schema on server. Please try again.');
                    return;
                }

                // Apply filters to update UI if needed
                if (FS.state.activeSchema) {
                    FS.applyFilters();
                }
            } catch (error) {
                console.error('Failed to update schema:', error);
                // Revert to old schema if update failed
                item.schema = oldSchema;
                if (itemElement) {
                    const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                    schemaButtons.forEach(button => {
                        const buttonSchema = button.dataset.schema;
                        button.classList.toggle('active', buttonSchema === oldSchema);
                    });
                }
                alert('Failed to update schema: ' + error.message);
            }
        },

        // Load page
        loadPage: async function(page) {
            const connectionText = document.getElementById('connection-text');
            if (connectionText) {
                connectionText.textContent = `Loading page ${page + 1}...`;
            }

            try {
                const response = await fetch(`${FS.config.API_BASE_URL}/conversations?page=${page}&limit=${FS.state.pageSize}`);

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const result = await response.json();
                const mongoData = result.data;

                FS.state.currentPage = page;

                FS.state.data = FS.Utils.convertMongoDataToAppFormat(mongoData);
                FS.state.filteredData = [...FS.state.data.filter(item => !item.hidden)];

                const tabButtons = document.querySelectorAll('.pagination-btn');
                tabButtons.forEach(tab => {
                    const tabPage = parseInt(tab.dataset.page);
                    tab.classList.toggle('active', tabPage === FS.state.currentPage);
                });

                FS.UI.updateTabsVisibility();

                document.getElementById('prev-tab-btn').disabled = FS.state.currentPage === 0;
                document.getElementById('next-tab-btn').disabled = FS.state.currentPage === FS.state.totalPages - 1;

                if (connectionText) {
                    connectionText.textContent = `Page ${FS.state.currentPage + 1} of ${FS.state.totalPages} - Total records: ${result.pagination.totalCount}`;
                }

                FS.renderItems();

            } catch (error) {
                console.error('Error loading page:', error);
                if (connectionText) {
                    connectionText.textContent = `Failed to load page ${page + 1}: ${error.message}`;
                }
            }
        }
    };

    // Utils Module - Utility functions
    FS.Utils = {
        // Format date in a user-friendly way
        formatDateTime: function(dateStr) {
            if (/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2}/.test(dateStr)) {
                return dateStr;
            }

            let date;

            if (typeof dateStr === 'string') {
                if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) {
                    date = new Date(dateStr);
                } else if (/^\d{10}$/.test(dateStr)) {
                    date = new Date(parseInt(dateStr) * 1000); // seconds
                } else if (/^\d{13}$/.test(dateStr)) {
                    date = new Date(parseInt(dateStr)); // milliseconds
                } else {
                    date = new Date(dateStr); // fallback
                }
            } else if (typeof dateStr === 'number') {
                if (dateStr < 1e12) {
                    date = new Date(dateStr * 1000); // number in seconds
                } else {
                    date = new Date(dateStr); // number in milliseconds
                }
            } else if (dateStr instanceof Date) {
                date = dateStr;
            } else {
                return "Invalid date";
            }

            if (isNaN(date.getTime())) {
                return "Invalid date";
            }

            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC' // optional, depends on if you want local or UTC
            };

            return date.toLocaleString(undefined, options);
        },

        // Parse messages from string to usable objects
        parseMessages: function(messagesString) {
            try {
                if (!messagesString) {
                    return [
                        { role: 'user', message: 'No messages available' }
                    ];
                }

                if (typeof messagesString !== 'string') {
                    return [
                        { role: 'user', message: 'Message parsing error' },
                        { role: 'assistant', message: 'Unable to parse messages' }
                    ];
                }

                // Try different parsing strategies...
                // [Parsing code implementation would go here]

                return [
                    { role: 'user', message: 'Messages parsing needs implementation' }
                ];
            } catch (error) {
                console.error("Critical error parsing messages:", error);
                return [
                    { role: 'user', message: 'Error parsing message' },
                    { role: 'assistant', message: 'Error parsing message' }
                ];
            }
        },

        // Convert MongoDB data to app format
        convertMongoDataToAppFormat: function(mongoData) {
            if (!mongoData || !Array.isArray(mongoData)) {
                console.error("Invalid MongoDB data:", mongoData);
                return [];
            }

            try {
                return mongoData.map(item => {
                    try {
                        // Implementation would go here...
                        // This is where we convert MongoDB data structure to our app's data structure

                        return {
                            id: item._id || 'unknown-id',
                            schema: item.schema || '',
                            question: 'Question would be parsed here',
                            conversation: [],
                            suggestions: [],
                            cypherQueries: [],
                            feedback: item.feedback || null,
                            hidden: false,
                            user: 'User',
                            datetime: 'Date'
                        };
                    } catch (itemError) {
                        console.error("Error converting item:", itemError, item);
                        return null;
                    }
                }).filter(Boolean);
            } catch (error) {
                console.error("Error converting MongoDB data:", error);
                return [];
            }
        },

        // Fix timestamp if it's in seconds instead of milliseconds
        fixTimestamp: function(timestamp) {
            if (!timestamp) return Date.now();

            // Convert to number if it's a string
            if (typeof timestamp === 'string') {
                timestamp = parseInt(timestamp, 10);
                if (isNaN(timestamp)) return Date.now();
            }

            // Check if timestamp represents seconds (Unix timestamp standard)
            const now = Date.now();
            const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000;

            // If timestamp is in seconds, convert to milliseconds
            if (timestamp < now / 100 && timestamp * 1000 > now - tenYearsMs && timestamp * 1000 < now + tenYearsMs) {
                console.log(`Converting timestamp from seconds to milliseconds: ${timestamp} -> ${timestamp * 1000}`);
                return timestamp * 1000;
            }

            return timestamp;
        }
    };

    // Modals Module - Handles modal dialogs
    FS.Modals = {
        // Open conversation modal
        openConversationModal: function(item) {
            FS.state.currentItemId = item.id;

            document.getElementById('modal-title').textContent = "Conversation";
            document.getElementById('modal-username').textContent = `User: ${item.user}`;
            document.getElementById('modal-datetime').textContent = `Date: ${FS.Utils.formatDateTime(item.datetime)}`;

            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '';

            if (item.conversation && item.conversation.length > 0) {
                item.conversation.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `conversation-item ${message.role}`;

                    const formattedMessage = this.renderFormattedContent(message.message);

                    messageElement.innerHTML = `
            <div class="conversation-bubble">
              <p class="conversation-role">${message.role === 'user' ? 'User' : 'Assistant'}</p>
              <div class="conversation-content">${formattedMessage}</div>
            </div>
          `;
                    modalBody.appendChild(messageElement);
                });
            } else {
                modalBody.innerHTML = '<p>No conversation available</p>';
            }

            const modal = document.getElementById('feedback-modal');
            modal.classList.add('active');
        },

        // Open suggestion modal
        openSuggestionModal: function(item) {
            FS.state.currentItemId = item.id;

            document.getElementById('modal-title').textContent = "Suggestions";
            document.getElementById('modal-username').textContent = `User: ${item.user}`;
            document.getElementById('modal-datetime').textContent = `Date: ${FS.Utils.formatDateTime(item.datetime)}`;

            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '';

            const suggestionList = document.createElement('ul');
            suggestionList.className = 'suggestion-list';

            if (item.suggestions && item.suggestions.length > 0) {
                item.suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.innerHTML = this.renderFormattedContent(suggestion);
                    suggestionList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No suggestions available';
                suggestionList.appendChild(li);
            }

            modalBody.appendChild(suggestionList);

            const modal = document.getElementById('feedback-modal');
            modal.classList.add('active');
        },

        // Open cypher query modal
        openCypherModal: function(item) {
            FS.state.currentItemId = item.id;

            document.getElementById('modal-title').textContent = "Cypher Query";
            document.getElementById('modal-username').textContent = `User: ${item.user}`;
            document.getElementById('modal-datetime').textContent = `Date: ${FS.Utils.formatDateTime(item.datetime)}`;

            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = '';

            const cypherContainer = document.createElement('div');
            cypherContainer.className = 'cypher-container';

            if (item.cypherQueries && item.cypherQueries.length > 0) {
                item.cypherQueries.forEach(query => {
                    const queryElement = document.createElement('div');
                    queryElement.className = 'cypher-query';
                    queryElement.innerHTML = this.renderFormattedContent(query);
                    cypherContainer.appendChild(queryElement);
                });
            } else {
                const noQueryElement = document.createElement('div');
                noQueryElement.textContent = 'No Cypher queries available';
                cypherContainer.appendChild(noQueryElement);
            }

            modalBody.appendChild(cypherContainer);

            const modal = document.getElementById('feedback-modal');
            modal.classList.add('active');
        },

        // Close modal
        closeModal: function() {
            const modal = document.getElementById('feedback-modal');
            modal.classList.remove('active');
            FS.state.currentItemId = null;
        },

        // Helper to render formatted content with better HTML handling
        renderFormattedContent: function(text) {
            if (!text) return '';

            if (text.includes('<') && text.includes('>')) {
                return text;
            }

            let formattedText = text.replace(/\n/g, '<br>');

            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

            if (formattedText.includes('|')) {
                const lines = formattedText.split('<br>');
                let inTable = false;
                let tableContent = '';
                let processedLines = [];

                for (let line of lines) {
                    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                        if (!inTable) {
                            inTable = true;
                            tableContent = '<table class="conversation-table">';
                        }

                        const cells = line.split('|').filter(cell => cell.trim() !== '');
                        tableContent += '<tr>';
                        cells.forEach(cell => {
                            tableContent += `<td>${cell.trim()}</td>`;
                        });
                        tableContent += '</tr>';
                    } else {
                        if (inTable) {
                            tableContent += '</table>';
                            processedLines.push(tableContent);
                            inTable = false;
                            tableContent = '';
                        }
                        processedLines.push(line);
                    }
                }

                if (inTable) {
                    tableContent += '</table>';
                    processedLines.push(tableContent);
                }

                formattedText = processedLines.join('<br>');
            }

            return formattedText;
        },

        // Open data popup
        openDataPopup: function(title, data) {
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

            // Create popup content
            const popupContent = document.createElement('div');
            popupContent.className = 'popup-content';

            // Create header
            const popupHeader = document.createElement('div');
            popupHeader.className = 'popup-header';

            // Create title
            const popupTitle = document.createElement('h3');
            popupTitle.id = 'popup-title';
            popupTitle.textContent = title;
            popupHeader.appendChild(popupTitle);

            // Create button container for header
            const headerButtons = document.createElement('div');
            headerButtons.className = 'popup-header-buttons';

            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'popup-copy';
            copyButton.title = 'Copy to clipboard';
            copyButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
            copyButton.addEventListener('click', () => {
                let textToCopy = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        copyButton.classList.add('success');
                        setTimeout(() => copyButton.classList.remove('success'), 1500);
                    })
                    .catch(err => console.error('Failed to copy: ', err));
            });
            headerButtons.appendChild(copyButton);

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
            closeButton.addEventListener('click', () => this.closePopup(popup));
            headerButtons.appendChild(closeButton);

            popupHeader.appendChild(headerButtons);
            popupContent.appendChild(popupHeader);

            // Create body
            const popupBody = document.createElement('div');
            popupBody.className = 'popup-body';

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
            popupContent.appendChild(popupBody);

            // Add content to popup
            popup.appendChild(popupContent);

            // Add popup to body
            document.body.appendChild(popup);

            // Trap focus in modal for accessibility
            const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            if (firstElement) firstElement.focus();

            // Animate the popup
            setTimeout(() => popup.classList.add('active'), 10);

            // Add click outside to close
            popup.addEventListener('click', (e) => {
                if (e.target === popup) this.closePopup(popup);
            });

            // Add escape key to close
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closePopup(popup);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        },

        // Close popup helper
        closePopup: function(element) {
            element.classList.remove('active');
            setTimeout(() => element.remove(), 300);
        }
    };

    // Filter Module - Handling filters
    FS.Filters = {
        // Filter by schema
        filterBySchema: function(schema) {
            const button = document.querySelector(`.filter-btn[data-schema="${schema}"]`);

            if (!button) return;

            if (FS.state.activeSchema === schema) {
                FS.state.activeSchema = null;
                button.classList.remove('active');
            } else {
                document.querySelectorAll('.filter-btn[data-schema]').forEach(btn => {
                    btn.classList.remove('active');
                });

                FS.state.activeSchema = schema;
                button.classList.add('active');
            }

            FS.applyFilters();
        }
    };

    // Add API module functions to main FeedbackSystem object
    FS.handlePositiveFeedback = FS.API.handlePositiveFeedback;
    FS.handleNegativeFeedback = FS.API.handleNegativeFeedback;
    FS.handleToggleHidden = FS.API.handleToggleHidden;
    FS.setSchema = FS.API.setSchema;
    FS.loadPage = FS.API.loadPage;

    // Add UI module functions
    FS.renderItems = FS.UI.renderItems;
    FS.initializeTabs = FS.UI.initializeTabs;
    FS.updateTabsVisibility = FS.UI.updateTabsVisibility;
    FS.showQdrantConfirmDialog = FS.UI.showQdrantConfirmDialog;

    // Add Modal module functions
    FS.openConversationModal = FS.Modals.openConversationModal;
    FS.openSuggestionModal = FS.Modals.openSuggestionModal;
    FS.openCypherModal = FS.Modals.openCypherModal;
    FS.closeModal = FS.Modals.closeModal;
    FS.openDataPopup = FS.Modals.openDataPopup;

    // Add Filter module functions
    FS.filterBySchema = FS.Filters.filterBySchema;

    // Add Utils module functions
    FS.formatDateTime = FS.Utils.formatDateTime;
    FS.parseMessages = FS.Utils.parseMessages;
    FS.convertMongoDataToAppFormat = FS.Utils.convertMongoDataToAppFormat;

    console.log("FeedbackSystem modules initialized");
})(window.FeedbackSystem);