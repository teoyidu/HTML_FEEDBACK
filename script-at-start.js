// Start the app - call at the end of the script
function initializeApp() {
    // Connect to MongoDB
    connectToMongoDB();

    // Set up schema buttons
    initializeSchemaFilters();

    // Set up event listeners for other filters
    positiveFilter.addEventListener('click', () => {
        if (activeFeedbackFilter === 'positive') {
            activeFeedbackFilter = null;
            positiveFilter.classList.remove('active');
        } else {
            activeFeedbackFilter = 'positive';
            positiveFilter.classList.add('active');
            negativeFilter.classList.remove('active');
        }

        applyFilters();
    });

    negativeFilter.addEventListener('click', () => {
        if (activeFeedbackFilter === 'negative') {
            activeFeedbackFilter = null;
            negativeFilter.classList.remove('active');
        } else {
            activeFeedbackFilter = 'negative';
            negativeFilter.classList.add('active');
            positiveFilter.classList.remove('active');
        }

        applyFilters();
    });

    // Archived filter
    hiddenFilter.addEventListener('click', () => {
        showHidden = !showHidden;

        if (showHidden) {
            hiddenFilter.classList.add('active');
            hiddenFilter.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none; margin-right: 4px;">
        <rect width="20" height="5" x="2" y="3" rx="1"></rect>
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
        <path d="M10 12h4"></path>
      </svg>
      Hide Archived
      `;
        } else {
            hiddenFilter.classList.remove('active');
            hiddenFilter.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none; margin-right: 4px;">
        <rect width="20" height="5" x="2" y="3" rx="1"></rect>
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
        <path d="M10 12h4"></path>
      </svg>
      Show Archived
      `;
        }

        applyFilters();
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase();
        applyFilters();
    });

    // Page size buttons
    pageSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            pageSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            pageSize = parseInt(button.dataset.size);
            // Reload current page with new page size
            loadPage(currentPage);
        });
    });

    // Dialog close
    dialogClose.addEventListener('click', closeDialog);
    dialogBackdrop.addEventListener('click', event => {
        if (event.target === dialogBackdrop) {
            closeDialog();
        }
    });

    // ESC key to close dialog
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !dialogBackdrop.classList.contains('hidden')) {
            closeDialog();
        }
    });

    // Edit messages button
    editMessagesBtn.addEventListener('click', () => {
        const item = data.find(item => item.id === currentItemId);
        if (item) {
            // Format messages into a readable format for editing
            const formattedMessages = item.conversation.map(msg =>
                `[${msg.role}] ${msg.message}`
            ).join('\n\n');

            editMessageTextarea.value = formattedMessages;
            editMessageContainer.classList.remove('hidden');

            // Scroll to the textarea
            editMessageTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Focus the textarea
            setTimeout(() => {
                editMessageTextarea.focus();
            }, 300);
        }
    });

    // Cancel edit button
    cancelEditBtn.addEventListener('click', () => {
        editMessageContainer.classList.add('hidden');
    });

    // Save edit button setup is already in place
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);    /* Notification styles */
.notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background-color: #1f2937;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 24rem;
}

.notification.success {
    border-left: 4px solid #10b981;
    background-color: rgba(16, 185, 129, 0.2);
    color: #d1fae5;
}

.notification.error {
    border-left: 4px solid #ef4444;
    background-color: rgba(239, 68, 68, 0.2);
    color: #fee2e2;
}

.notification.info {
    border-left: 4px solid #3b82f6;
    background-color: rgba(59, 130, 246, 0.2);
    color: #dbeafe;
}    // Filter by type
function filterByType(type) {
    const button = document.querySelector(`.filter-btn[data-type="${type}"]`);

    if (activeTypeFilter === type) {
        activeTypeFilter = null;
        button.classList.remove('active');
    } else {
        // Remove active class from all type buttons
        document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
            btn.classList.remove('active');
        });

        activeTypeFilter = type;
        button.classList.add('active');
    }

    applyFilters();
}

applyFilters();
}