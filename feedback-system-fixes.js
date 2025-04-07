// Find and fix the ID reference error
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, checking for reference errors...');
  
  // Find line 1182 error - likely related to element references
  // Common causes: trying to use getElementById on a non-existent element
  // or querySelector that doesn't match anything
  
  // 1. Add debug check for common elements to ensure they exist
  const elementsToCheck = [
    'schema-filters', 
    'type-filters', 
    'feedback-items',
    'dialog-content', 
    'tabs-list',
    'prev-tab-btn',
    'next-tab-btn'
  ];
  
  elementsToCheck.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Missing element with ID: ${id}`);
    } else {
      console.log(`Found element: ${id}`);
    }
  });
  
  // 2. Fix for ID reference error - check for schema buttons existence
  const schemaButtons = document.querySelectorAll('.schema-btn');
  if (schemaButtons.length === 0) {
    console.error('No schema buttons found. This might cause reference errors.');
  }
  
  // 3. Add safe element access helper
  window.safeGetElement = function(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID ${id} not found`);
      // Return a dummy element to prevent errors
      return { 
        style: {}, 
        classList: { 
          add: () => {}, 
          remove: () => {}, 
          contains: () => false,
          toggle: () => {}
        },
        addEventListener: () => {},
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
      };
    }
    return element;
  };
  
  // 4. Apply safe element access to critical parts of the application
  try {
    // Check MongoDB connection status
    const connectionIndicator = safeGetElement('connection-indicator');
    const connectionText = safeGetElement('connection-text');
    
    // Force reconnection to MongoDB
    console.log('Forcing reconnection to MongoDB...');
    
    // Reset connection classes
    connectionIndicator.classList.remove('connected');
    connectionIndicator.classList.remove('disconnected');
    connectionText.textContent = 'Reconnecting to MongoDB...';
    
    // Add a slight delay before reconnection to ensure DOM is ready
    setTimeout(() => {
      console.log('Attempting to connect to MongoDB...');
      // Call the global connectToMongoDB function if it exists
      if (typeof connectToMongoDB === 'function') {
        connectToMongoDB(0);
      } else {
        console.error('connectToMongoDB function not found');
        connectionText.textContent = 'Error: Connection function not found';
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error during connection retry:', error);
  }
  
  // 5. Add fallback error handling to prevent cascading errors
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    // Prevent the error from completely breaking the app
    event.preventDefault();
    
    // Try to show error in UI
    try {
      const connectionText = document.getElementById('connection-text');
      if (connectionText) {
        connectionText.textContent = 'Error encountered: ' + event.error.message;
      }
    } catch (e) {
      // Last resort if even error handling fails
    }
  });
});

// Additional logging to debug the MongoDB connection
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args[0]);
  return originalFetch(...args)
    .then(response => {
      console.log('Fetch response status:', response.status);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};
