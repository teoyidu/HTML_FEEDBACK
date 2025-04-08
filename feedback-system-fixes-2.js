// Comprehensive fixes for AI Chatbot Feedback System
// This script fixes:
// 1. Type filters not working
// 2. Adds a "List All" button to page size controls
// 3. Handles visible code cleanup

// ===== FIX 1: Type Filters =====

// Make sure filterByType function is in the global scope
window.filterByType = function(type) {
    const button = document.querySelector(`.filter-btn[data-type="${type}"]`);

    if (!button) {
        console.error(`Button for type "${type}" not found`);
        return;
    }

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
};

// Make sure the type button event listeners are properly set up
function setupTypeFilters() {
    // Find all type filter buttons
    const typeButtons = document.querySelectorAll('.filter-btn[data-type]');

    if (typeButtons.length === 0) {
        console.warn('No type filter buttons found');
    }

    // Add click event listener to each button
    typeButtons.forEach(button => {
        const type = button.dataset.type;

        // Remove any existing event listeners (to avoid duplicates)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add event listener to the new button
        newButton.addEventListener('click', () => {
            console.log(`Type filter clicked: ${type}`);
            window.filterByType(type);
        });
    });

    console.log('Type filters set up completed');
}

// Override initializeTypeFilters if it exists
if (typeof initializeTypeFilters !== 'undefined') {
    const originalInitializeTypeFilters = initializeTypeFilters;

    window.initializeTypeFilters = function() {
        // Call the original function
        originalInitializeTypeFilters();

        // Setup the event listeners again
        setTimeout(setupTypeFilters, 100);
    };
}

// ===== FIX 2: List All Button =====

function addListAllButton() {
    // Get the page size container
    const pageSizeContainer = document.querySelector('.page-size');

    if (!pageSizeContainer) {
        console.error('Page size container not found');
        return;
    }

    // Check if the button already exists
    if (document.querySelector('.page-size-btn[data-size="all"]')) {
        console.log('List All button already exists');
        return;
    }

    // Create the "List All" button
    const listAllButton = document.createElement('button');
    listAllButton.className = 'page-size-btn';
    listAllButton.dataset.size = 'all';
    listAllButton.textContent = 'List All';

    // Add a special style to make it stand out
    listAllButton.style.backgroundColor = '#2563eb';
    listAllButton.style.color = 'white';

    // Find the 200 button to insert after it
    const button200 = document.querySelector('.page-size-btn[data-size="200"]');

    if (button200) {
        // Insert after the 200 button
        if (button200.nextSibling) {
            pageSizeContainer.insertBefore(listAllButton, button200.nextSibling);
        } else {
            pageSizeContainer.appendChild(listAllButton);
        }
    } else {
        // If 200 button not found, just append to the end
        pageSizeContainer.appendChild(listAllButton);
    }

    // Add the event listener for the new button
    listAllButton.addEventListener('click', () => {
        // Remove active class from all page size buttons
        document.querySelectorAll('.page-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to this button
        listAllButton.classList.add('active');

        // Set page size to a very large number to show all items
        // We use data.length to match the actual number of items
        pageSize = data.length || 1000;

        // Update the results count text
        const resultsCountElement = document.getElementById('results-count');
        if (resultsCountElement) {
            resultsCountElement.textContent = `Showing all ${filteredData.length} results`;
        }

        // Apply the changes
        renderItems();
    });

    console.log('List All button added successfully');
}

// Enhance the renderItems function to handle the "List All" case
function enhanceRenderItems() {
    // Check if renderItems exists in window or as a local function
    if (typeof window.renderItems === 'function' || typeof renderItems === 'function') {
        // Store a reference to the original renderItems function
        const originalRenderItems = window.renderItems || renderItems;

        // Define our enhanced version
        window.renderItems = function() {
            // Check if "List All" is active
            const listAllActive = document.querySelector('.page-size-btn[data-size="all"].active');

            // Update results count
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                if (listAllActive) {
                    resultsCount.textContent = `Showing all ${filteredData.length} results`;
                } else {
                    resultsCount.textContent = `Showing ${Math.min(pageSize, filteredData.length)} of ${filteredData.length} results`;
                }
            }

            // Call the original function
            originalRenderItems();
        };

        console.log('Render items function enhanced to support List All button');
    } else {
        console.warn('renderItems function not found for enhancement');
    }
}

// ===== FIX 3: Visible Code Cleanup =====

function fixVisibleCode() {
    // Look for code patterns that might be visible
    const codePattern = /\/\/ Start the app|function initializeApp\(\)/;

    // Find nodes containing this code
    const allTextNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        if (codePattern.test(node.nodeValue)) {
            allTextNodes.push(node);
        }
    }

    // Remove the nodes that contain visible code
    allTextNodes.forEach(node => {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });

    // Also look for specific patterns in innerHTML
    const bodyContent = document.body.innerHTML;
    if (bodyContent.includes('// Start the app') || bodyContent.includes('function initializeApp()')) {
        // There's code in the HTML - remove it cleanly
        const startIndex = bodyContent.indexOf('// Start the app');

        if (startIndex !== -1) {
            // Find the next proper HTML tag after this point
            let endIndex = bodyContent.indexOf('<', startIndex);
            if (endIndex === -1) endIndex = bodyContent.length;

            // Replace the code with empty string
            const cleanedContent = bodyContent.substring(0, startIndex) + bodyContent.substring(endIndex);
            document.body.innerHTML = cleanedContent;
        }
    }

    console.log("Checked and fixed any visible code in HTML");
}

// ===== Run all fixes when the DOM is loaded =====

// Function to run all fixes with proper timing
function runAllFixes() {
    console.log("Running comprehensive fixes for the feedback system...");

    // Fix 1: First run the visible code cleanup
    fixVisibleCode();

    // Fix 2: Set up type filters
    setupTypeFilters();

    // Fix 3: Add List All button with a slight delay to ensure DOM is ready
    setTimeout(addListAllButton, 300);

    // Fix 4: Enhance renderItems function with a longer delay
    setTimeout(enhanceRenderItems, 500);

    console.log("All fixes applied successfully!");
}

// Run fixes when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllFixes);
} else {
    // DOM is already loaded
    runAllFixes();
}

// Enhanced data fetching functionality for AI Chatbot Feedback System
// This script adds:
// 1. "List All" button that fetches all data with warning
// 2. Custom amount input that fetches exact number of records
// 3. Refresh button in northeast corner

// ===== UTILITY FUNCTIONS =====

// Helper to create elements with attributes and event listeners
function createElement(tag, attributes = {}, eventListeners = {}) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });

    // Add event listeners
    Object.entries(eventListeners).forEach(([event, callback]) => {
        element.addEventListener(event, callback);
    });

    return element;
}

// Show confirmation dialog
function showConfirmationDialog(message, onConfirm, onCancel) {
    // Check if there's already a dialog
    const existingDialog = document.querySelector('.confirmation-dialog-backdrop');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create backdrop
    const backdrop = createElement('div', {
        className: 'confirmation-dialog-backdrop',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            opacity: 0,
            transition: 'opacity 0.2s ease'
        }
    });

    // Create dialog
    const dialog = createElement('div', {
        className: 'confirmation-dialog',
        style: {
            backgroundColor: '#1f2937',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            transform: 'scale(0.9)',
            transition: 'transform 0.2s ease',
            color: 'white'
        }
    });

    // Create warning icon
    const warningIcon = createElement('div', {
        className: 'warning-icon',
        innerHTML: `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
        style: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem'
        }
    });

    // Create message
    const messageElement = createElement('div', {
        className: 'confirmation-message',
        innerHTML: message,
        style: {
            marginBottom: '1.5rem',
            lineHeight: '1.5',
            textAlign: 'center'
        }
    });

    // Create buttons container
    const buttonsContainer = createElement('div', {
        className: 'confirmation-buttons',
        style: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
        }
    });

    // Create cancel button
    const cancelButton = createElement('button', {
        className: 'cancel-button',
        innerHTML: 'Cancel',
        style: {
            padding: '0.5rem 1rem',
            backgroundColor: '#4b5563',
            color: 'white',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
        }
    }, {
        click: () => {
            // Close dialog
            backdrop.style.opacity = '0';
            dialog.style.transform = 'scale(0.9)';

            setTimeout(() => {
                backdrop.remove();
            }, 200);

            // Call cancel callback
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    });

    // Create confirm button
    const confirmButton = createElement('button', {
        className: 'confirm-button',
        innerHTML: 'Continue',
        style: {
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
        }
    }, {
        click: () => {
            // Close dialog
            backdrop.style.opacity = '0';
            dialog.style.transform = 'scale(0.9)';

            setTimeout(() => {
                backdrop.remove();
            }, 200);

            // Call confirm callback
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }
    });

    // Add buttons to container
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);

    // Add elements to dialog
    dialog.appendChild(warningIcon);
    dialog.appendChild(messageElement);
    dialog.appendChild(buttonsContainer);

    // Add dialog to backdrop
    backdrop.appendChild(dialog);

    // Add backdrop to body
    document.body.appendChild(backdrop);

    // Animate in
    setTimeout(() => {
        backdrop.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
    }, 10);

    // Return the dialog
    return {
        close: () => {
            backdrop.style.opacity = '0';
            dialog.style.transform = 'scale(0.9)';

            setTimeout(() => {
                backdrop.remove();
            }, 200);
        }
    };
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = createElement('div', {
        className: `notification ${type}`,
        innerHTML: message,
        style: {
            position: 'fixed',
            top: '4rem',
            right: '1rem',
            backgroundColor: type === 'success' ? '#065f46' : type === 'error' ? '#7f1d1d' : '#1f2937',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: '100',
            transform: 'translateX(100%)',
            opacity: '0',
            transition: 'all 0.3s ease'
        }
    });

    // Add to body
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);

    // Automatically remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';

        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Function to fetch data from the server
async function fetchDataFromServer(limit = 20, page = 0) {
    try {
        // Show loading notification
        showNotification('Fetching data from server...', 'info');

        // Build API URL with parameters
        const apiUrl = `${API_BASE_URL}/conversations?page=${page}&limit=${limit}`;
        console.log(`Fetching data from: ${apiUrl}`);

        // Make the API request
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Update connection indicator
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.add('connected');
        }

        if (connectionText) {
            const recordCount = result.data ? result.data.length : 0;
            const totalCount = result.pagination ? result.pagination.totalCount : 'unknown';
            connectionText.textContent = `Connected to MongoDB - ${recordCount} records loaded (Page ${page + 1} - Total: ${totalCount})`;
        }

        // Process the data
        if (result.data) {
            // Convert and store data (using existing functions if available)
            if (typeof convertMongoDataToAppFormat === 'function') {
                window.data = convertMongoDataToAppFormat(result.data);
            } else {
                window.data = result.data;
            }

            // Update filtered data
            window.filteredData = [...window.data.filter(item => !item.hidden)];

            // Update pagination info
            window.currentPage = result.pagination ? result.pagination.page : 0;
            window.totalPages = result.pagination ? result.pagination.totalPages : 1;

            // Initialize filters if functions exist
            if (typeof initializeSchemaFilters === 'function') {
                initializeSchemaFilters();
            }

            if (typeof initializeTypeFilters === 'function') {
                initializeTypeFilters();
            }

            // Initialize tabs if function exists
            if (typeof initializeTabs === 'function') {
                initializeTabs(window.totalPages);
            }

            // Render items
            if (typeof renderItems === 'function') {
                renderItems();
            } else if (typeof window.renderItems === 'function') {
                window.renderItems();
            }

            // Show success notification
            showNotification(`Successfully loaded ${result.data.length} records`, 'success');

            return true;
        } else {
            throw new Error('No data returned from server');
        }
    } catch (error) {
        console.error('Error fetching data:', error);

        // Show error notification
        showNotification(`Error: ${error.message}`, 'error');

        // Update connection indicator
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.add('disconnected');
        }

        if (connectionText) {
            connectionText.textContent = 'Failed to connect to MongoDB: ' + error.message;
        }

        return false;
    }
}

// ===== FEATURE 1: IMPROVED LIST ALL BUTTON =====

function addListAllButton() {
    // Get the page size container
    const pageSizeContainer = document.querySelector('.page-size');

    if (!pageSizeContainer) {
        console.error('Page size container not found');
        return;
    }

    // Remove the existing List All button if it exists
    const existingButton = document.querySelector('.page-size-btn[data-size="all"]');
    if (existingButton) {
        existingButton.remove();
    }

    // Create the "List All" button
    const listAllButton = createElement('button', {
        className: 'page-size-btn',
        'data-size': 'all',
        innerHTML: 'List All',
        style: {
            backgroundColor: '#dc2626', // Red to indicate caution
            color: 'white',
            fontWeight: 'bold'
        }
    }, {
        click: () => {
            // Show warning confirmation dialog
            showConfirmationDialog(
                `<h3 style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold;">Performans Uyarısı</h3>
         <p> Veritabanındaki <strong>TÜM</strong> kayıtları çekmek istiyorsunuz. Bu yüzden:</p>
         <ul style="text-align: left; margin: 0.5rem 0; list-style-type: disc; padding-left: 1.5rem;">
           <li>Sistem donabilir</li>
           <li>Yüksek miktarda hafıza tüketimi olabilir</li>
           <li>Tarayıcınız yavaşlayabilir veya çökebilir</li>
         </ul>
         <p style="margin-top: 0.5rem;">Devam etmek istediğinize emin misiniz?</p>`,
                // On confirm
                () => {
                    // Remove active class from all page size buttons
                    document.querySelectorAll('.page-size-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    // Add active class to this button
                    listAllButton.classList.add('active');

                    // Use a very large number as limit (10000 is likely to be more than total records)
                    const largeLimit = 10000;

                    // Fetch all data from server
                    fetchDataFromServer(largeLimit, 0);
                },
                // On cancel
                () => {
                    console.log('Fetch all data cancelled');
                }
            );
        }
    });

    // Find the 200 button to insert after it
    const button200 = document.querySelector('.page-size-btn[data-size="200"]');

    if (button200) {
        // Insert after the 200 button
        if (button200.nextSibling) {
            pageSizeContainer.insertBefore(listAllButton, button200.nextSibling);
        } else {
            pageSizeContainer.appendChild(listAllButton);
        }
    } else {
        // If 200 button not found, just append to the end
        pageSizeContainer.appendChild(listAllButton);
    }

    console.log('List All button added successfully');
}

// ===== FEATURE 2: CUSTOM AMOUNT INPUT =====

function addCustomAmountInput() {
    // Get the page size container
    const pageSizeContainer = document.querySelector('.page-size');

    if (!pageSizeContainer) {
        console.error('Page size container not found');
        return;
    }

    // Create container for the custom input
    const customInputContainer = createElement('div', {
        className: 'custom-size-container',
        style: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: '0.5rem'
        }
    });

    // Create the input field for custom amount
    const customInput = createElement('input', {
        type: 'number',
        className: 'custom-size-input',
        min: '1',
        max: '10000',
        placeholder: 'Custom',
        style: {
            width: '70px',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#1f2937',
            color: '#d1d5db',
            border: '1px solid #374151',
            borderRadius: '0.25rem 0 0 0.25rem',
            fontSize: '0.875rem'
        }
    }, {
        keydown: (e) => {
            if (e.key === 'Enter') {
                applyCustomPageSize();
            }
        }
    });

    // Create the apply button
    const applyButton = createElement('button', {
        className: 'custom-size-apply',
        innerHTML: 'Fetch',
        style: {
            padding: '0.25rem 0.5rem',
            backgroundColor: '#dc2626', // Red to indicate caution
            color: 'white',
            border: 'none',
            borderRadius: '0 0.25rem 0.25rem 0',
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontWeight: 'bold'
        }
    }, {
        click: applyCustomPageSize
    });

    // Function to apply the custom page size
    function applyCustomPageSize() {
        const value = parseInt(customInput.value, 10);

        // Validate the input
        if (isNaN(value) || value < 1) {
            // Shake the input to indicate an error
            customInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                customInput.style.animation = '';
            }, 500);
            return;
        }

        // Show warning confirmation dialog
        showConfirmationDialog(
            `<h3 style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold;">Performans Uyarısı</h3>
       <p><strong>${value}</strong> adet kaydı veritabanından çekmek istiyorsunuz.</p>
       ${value > 500 ? `
       <p style="margin-top: 0.5rem;">500'den fazla sonuç getirmek:</p>
       <ul style="text-align: left; margin: 0.5rem 0; list-style-type: disc; padding-left: 1.5rem;">
         <li>Sisteminizi dondurabilir</li>
         <li>Yüksek miktarda hafıza tüketimine sebep olabilir</li>
         <li>Tarayıcınızı yavaşlatabilir veya çökertebilir</li>
       </ul>
       ` : ''}
       <p style="margin-top: 0.5rem;">Devam etmek istediğinize emin misiniz?</p>`,
            // On confirm
            () => {
                // Remove active class from all page size buttons
                document.querySelectorAll('.page-size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Add a class to indicate custom size is active
                customInput.classList.add('custom-size-input-active');
                applyButton.classList.add('active');

                // Fetch data with custom limit
                fetchDataFromServer(value, 0);
            },
            // On cancel
            () => {
                console.log('Fetch custom data cancelled');
            }
        );
    }

    // Add input and button to container
    customInputContainer.appendChild(customInput);
    customInputContainer.appendChild(applyButton);

    // Add container to page size container
    pageSizeContainer.appendChild(customInputContainer);

    // Add styles for the shake animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .custom-size-input-active {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 1px #dc2626 !important;
    }
    
    .custom-size-apply.active {
      background-color: #b91c1c !important;
    }
  `;
    document.head.appendChild(styleElement);

    console.log('Custom amount input added successfully');
}

// ===== FEATURE 3: REFRESH BUTTON =====

function addRefreshButton() {
    // Create the refresh button container
    const refreshButtonContainer = createElement('div', {
        className: 'refresh-button-container',
        style: {
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: '50'
        }
    });

    // Create the refresh button with SVG icon
    const refreshButton = createElement('button', {
        className: 'refresh-button',
        title: 'Refresh Data',
        innerHTML: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 2v6h6"></path>
        <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
        <path d="M21 22v-6h-6"></path>
        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
      </svg>
    `,
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
        }
    }, {
        click: () => {
            refreshData();
        },
        mouseover: (e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)';
        },
        mouseout: (e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });

    // Function to refresh data
    function refreshData() {
        // Add animation to show it's refreshing
        const svgElement = refreshButton.querySelector('svg');
        svgElement.style.animation = 'spin 1s linear infinite';

        // Get current page and page size
        const currentPageNum = window.currentPage || 0;

        // Get the current page size from active button
        let currentLimit = 20; // Default

        const activeButton = document.querySelector('.page-size-btn.active');
        if (activeButton) {
            const buttonSize = activeButton.dataset.size;
            if (buttonSize === 'all') {
                currentLimit = 10000; // Use a large number for "all"
            } else {
                currentLimit = parseInt(buttonSize, 10) || 20;
            }
        }

        // Check for custom size
        const customInput = document.querySelector('.custom-size-input-active');
        if (customInput) {
            const customValue = parseInt(customInput.value, 10);
            if (!isNaN(customValue) && customValue > 0) {
                currentLimit = customValue;
            }
        }

        // Fetch data with current settings
        fetchDataFromServer(currentLimit, currentPageNum)
            .then(() => {
                // Stop animation when done
                svgElement.style.animation = '';
            })
            .catch(() => {
                // Stop animation on error
                svgElement.style.animation = '';
            });
    }

    // Add refresh button animation style
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(styleElement);

    // Add to body
    refreshButtonContainer.appendChild(refreshButton);
    document.body.appendChild(refreshButtonContainer);

    console.log('Refresh button added successfully');
}

// ===== PATCH EXISTING PAGE SIZE BUTTONS =====

function patchPageSizeButtons() {
    // Find all page size buttons
    const pageSizeButtons = document.querySelectorAll('.page-size-btn:not([data-size="all"])');

    // Add click listeners to fetch data with the selected page size
    pageSizeButtons.forEach(button => {
        // Clone the button to remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add new event listener
        newButton.addEventListener('click', () => {
            // Remove active class from all page size buttons
            document.querySelectorAll('.page-size-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Remove active class from custom input if it exists
            const customInput = document.querySelector('.custom-size-input');
            if (customInput) {
                customInput.classList.remove('custom-size-input-active');
            }

            // Add active class to this button
            newButton.classList.add('active');

            // Get page size from button
            const size = parseInt(newButton.dataset.size, 10) || 20;

            // Update pageSize variable
            window.pageSize = size;

            // Fetch data with new page size
            fetchDataFromServer(size, 0);
        });
    });

    console.log('Patched page size buttons to fetch data');
}

// ===== MAIN FUNCTION TO RUN ALL FEATURES =====

function enhanceFeedbackSystem() {
    console.log("Applying data fetching enhancements to the Feedback System...");

    // Add our UI improvements
    addListAllButton();
    addCustomAmountInput();
    addRefreshButton();

    // Patch existing buttons
    patchPageSizeButtons();

    console.log("All enhancements applied successfully!");
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Run with a slight delay to ensure all other scripts have initialized
        setTimeout(enhanceFeedbackSystem, 500);
    });
} else {
    // DOM is already loaded, run with a delay
    setTimeout(enhanceFeedbackSystem, 500);
}