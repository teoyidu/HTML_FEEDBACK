// Enhanced similarity search functionality with better error handling
// Add this to your existing code

// Function to search for similar conversations with better error handling
async function searchSimilarConversations(query) {
    const similarItems = document.getElementById('similar-items');
    const noSimilarResults = document.getElementById('no-similar-results');

    if (!similarItems || !noSimilarResults) return;

    // Show loading indicator
    similarItems.innerHTML = '<div class="loading">Searching for similar conversations...</div>';
    noSimilarResults.classList.add('hidden');

    try {
        // Get active filters
        const schema = activeSchema || '';
        const type = activeTypeFilter || '';
        const showHiddenParam = showHidden ? 'true' : 'false';

        // Build query parameters
        const params = new URLSearchParams();
        params.append('query', query);
        if (schema) params.append('schema', schema);
        if (type) params.append('type', type);
        params.append('hidden', showHiddenParam);
        params.append('limit', 10);

        console.log(`Searching for similar conversations with query: "${query}"`);

        // Fetch similar conversations with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(`${API_BASE_URL}/similar-conversations?${params.toString()}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // Check for specific error status codes
            if (!response.ok) {
                let errorData = { error: 'Failed to search similar conversations' };

                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    const errorText = await response.text();
                    errorData.details = errorText || response.statusText;
                }

                console.error('Error response from similarity search:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });

                throw new Error(errorData.details || errorData.error || `API responded with status: ${response.status}`);
            }

            // Parse the JSON response with error handling
            let results;
            try {
                results = await response.json();
                console.log('Similarity search results:', results);
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Invalid response format from similarity search API');
            }

            // Clear loading indicator
            similarItems.innerHTML = '';

            // Display results or show no results message
            if (results && Array.isArray(results) && results.length > 0) {
                results.forEach(result => {
                    // Make sure we have a valid score
                    const similarityScore = typeof result.score === 'number' ? result.score : 0;
                    const similarityPercentage = Math.round(similarityScore * 100);

                    const itemElement = document.createElement('div');
                    itemElement.className = `feedback-item${result.hidden ? ' hidden' : ''}${result.feedback === 'positive' ? ' positive' : result.feedback === 'negative' ? ' negative' : ''}`;
                    itemElement.dataset.id = result.id;

                    // Create item content with more robust handling of missing properties
                    itemElement.innerHTML = `
            <div class="feedback-header">
              <div class="feedback-content">
                <div class="feedback-tags">
                  ${result.schema ? `<span class="tag">${result.schema}</span>` : ''}
                  <span class="tag type-tag">${result.type || 'Unknown'}</span>
                  <span class="tag" style="background-color: #2563eb;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                    </svg>
                    ${similarityPercentage}% Similar
                  </span>
                </div>
                <h3 class="feedback-question">${result.question || 'No question'}</h3>
                <p class="feedback-query">User: ${result.userName || 'Unknown'}</p>
              </div>
            </div>
          `;

                    // Add click event to open conversation
                    itemElement.addEventListener('click', () => {
                        // Close similar dialog
                        closeSimilarDialog();

                        // Find the full conversation from data or fetch it
                        const existingItem = data.find(item => item.id === result.id);
                        if (existingItem) {
                            openDialog(existingItem);
                        } else {
                            // Fetch the conversation if not in current data
                            fetchAndOpenConversation(result.id);
                        }
                    });

                    similarItems.appendChild(itemElement);
                });

                noSimilarResults.classList.add('hidden');
            } else {
                similarItems.innerHTML = '';
                noSimilarResults.classList.remove('hidden');
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        console.error('Error searching similar conversations:', error);

        // Detailed error message for users
        similarItems.innerHTML = `
      <div class="error">
        <h4>Error searching for similar conversations</h4>
        <p>${error.message}</p>
        ${error.message.includes('dimension') ?
            `<p class="error-suggestion">The vector dimensions are incorrect. Please run the init-qdrant.js script to rebuild the collection.</p>` : ''}
        <details>
          <summary>Technical Details</summary>
          <pre>${error.stack || 'No stack trace available'}</pre>
        </details>
      </div>
    `;
    }
}

// Enhanced version of fetchAndOpenConversation with better error handling
async function fetchAndOpenConversation(id) {
    try {
        console.log(`Fetching conversation: ${id}`);

        // Add loading indicator to the dialog
        const dialogContent = document.getElementById('dialog-content');
        if (dialogContent) {
            dialogContent.innerHTML = '<div class="loading">Loading conversation...</div>';
        }

        const response = await fetch(`${API_BASE_URL}/conversations/${id}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching conversation ${id}:`, {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Failed to fetch conversation (${response.status}): ${errorText}`);
        }

        const conversation = await response.json();
        console.log('Fetched conversation:', conversation);

        // More robust ID extraction
        const conversationId = conversation._id?.$oid || conversation._id || conversation.id || id;

        // Ensure we have a valid ID
        if (!conversationId) {
            throw new Error('Conversation has no valid ID');
        }

        // Better error handling for message parsing
        let parsedMessages;
        try {
            parsedMessages = parseMessages(conversation.messages);
        } catch (parseError) {
            console.error('Error parsing messages:', parseError);
            parsedMessages = [
                { role: 'system', message: 'Error parsing conversation messages' },
                { role: 'user', message: 'Original message format could not be processed' }
            ];
        }

        // Convert to app format with fallbacks for missing data
        const formattedConversation = {
            id: conversationId,
            schema: conversation.schema || '',
            question: extractQuestionFromConversation(conversation) || 'No question found',
            query: extractQuestionFromConversation(conversation) || '',
            feedback: conversation.feedback || null,
            hidden: Boolean(conversation.hidden),
            conversation: parsedMessages,
            timestamp: conversation.timestamp || '',
            type: conversation.type || 'Unknown',
            userName: conversation.userName || ''
        };

        // Open the dialog
        openDialog(formattedConversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);

        // Show error in dialog
        const dialogContent = document.getElementById('dialog-content');
        if (dialogContent) {
            dialogContent.innerHTML = `
        <div class="error">
          <h4>Error Loading Conversation</h4>
          <p>${error.message}</p>
        </div>
      `;
        } else {
            alert(`Error: ${error.message}`);
        }
    }
}

// Add these error-related styles to your CSS
function addErrorStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .error {
      background-color: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 0.25rem;
    }
    
    .error h4 {
      color: #ef4444;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    
    .error-suggestion {
      background-color: rgba(59, 130, 246, 0.1);
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-top: 0.5rem;
      border-left: 2px solid #3b82f6;
    }
    
    .error details {
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #1f2937;
      border-radius: 0.25rem;
    }
    
    .error pre {
      margin: 0.5rem 0;
      white-space: pre-wrap;
      font-size: 0.75rem;
      color: #d1d5db;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #9ca3af;
    }
    
    .loading::before {
      content: "";
      width: 20px;
      height: 20px;
      margin-right: 10px;
      border-radius: 50%;
      border: 2px solid #9ca3af;
      border-top-color: #3b82f6;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);
}

// Apply error styles when the document loads
document.addEventListener('DOMContentLoaded', function() {
    addErrorStyles();

    // Make sure we have a similar search button in the dialog controls
    const dialogControls = document.querySelector('.dialog-controls');
    if (dialogControls && !document.getElementById('find-similar-btn')) {
        const similarButton = document.createElement('button');
        similarButton.id = 'find-similar-btn';
        similarButton.className = 'edit-btn';
        similarButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      Find Similar
    `;
        dialogControls.appendChild(similarButton);

        // Add click event for the similar button
        similarButton.addEventListener('click', () => {
            openSimilarDialog();
        });
    }

    // Set up the similar search button and dialog close events
    const similarSearchButton = document.getElementById('similar-search-button');
    if (similarSearchButton) {
        similarSearchButton.addEventListener('click', () => {
            const query = document.getElementById('similar-search-input').value;
            if (query) {
                searchSimilarConversations(query);
            }
        });
    }

    const similarDialogClose = document.getElementById('similar-dialog-close');
    if (similarDialogClose) {
        similarDialogClose.addEventListener('click', closeSimilarDialog);
    }

    const similarDialogBackdrop = document.getElementById('similar-dialog-backdrop');
    if (similarDialogBackdrop) {
        similarDialogBackdrop.addEventListener('click', event => {
            if (event.target === similarDialogBackdrop) {
                closeSimilarDialog();
            }
        });
    }

    // Add keypress event to search input
    const similarSearchInput = document.getElementById('similar-search-input');
    if (similarSearchInput) {
        similarSearchInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                const query = similarSearchInput.value;
                if (query) {
                    searchSimilarConversations(query);
                }
            }
        });
    }
});

// Functions for similar dialog - make sure these exist or are defined accordingly
function openSimilarDialog() {
    const item = data.find(item => item.id === currentItemId);
    if (!item) return;

    const similarDialogBackdrop = document.getElementById('similar-dialog-backdrop');
    const similarDialog = document.getElementById('similar-dialog');
    const similarSearchInput = document.getElementById('similar-search-input');

    if (!similarDialogBackdrop || !similarDialog) return;

    // Set search input to current question
    if (similarSearchInput) {
        similarSearchInput.value = item.question;
    }

    // Clear previous results
    const similarItems = document.getElementById('similar-items');
    if (similarItems) {
        similarItems.innerHTML = '';
    }

    // Show dialog with animation
    similarDialogBackdrop.classList.remove('hidden');
    similarDialogBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    similarDialog.style.transform = 'scale(0.9)';
    similarDialog.style.opacity = '0';

    // Animate dialog in
    setTimeout(() => {
        similarDialogBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        similarDialog.style.transform = 'scale(1)';
        similarDialog.style.opacity = '1';

        // Auto search on open if there's a question
        if (similarSearchInput && similarSearchInput.value) {
            searchSimilarConversations(similarSearchInput.value);
        }
    }, 10);
}

function closeSimilarDialog() {
    const similarDialogBackdrop = document.getElementById('similar-dialog-backdrop');
    const similarDialog = document.getElementById('similar-dialog');

    if (!similarDialogBackdrop || !similarDialog) return;

    // Animate dialog out
    similarDialog.style.transform = 'scale(0.9)';
    similarDialog.style.opacity = '0';
    similarDialogBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    // Hide dialog after animation
    setTimeout(() => {
        similarDialogBackdrop.classList.add('hidden');
        similarDialog.style.transform = '';
        similarDialog.style.opacity = '';
    }, 300);
}

// Helper function to extract question from conversation - make sure this exists
function extractQuestionFromConversation(conversation) {
    try {
        if (!conversation.messages) return 'No messages';

        const parsedMessages = parseMessages(conversation.messages);
        const firstUserMessage = parsedMessages.find(msg => msg.role === 'user');
        return firstUserMessage ? firstUserMessage.message : 'No question found';
    } catch (error) {
        console.error('Error extracting question:', error);
        return 'Error extracting question';
    }
}