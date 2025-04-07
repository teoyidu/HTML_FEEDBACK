// Fix for type filters not working
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying type filter fixes...');
  
  // Track the active type filter
  let activeTypeFilter = null;
  
  // Fix the type filter functionality
  function fixTypeFilters() {
    // Wait a bit to ensure the original code has had time to create filters
    setTimeout(() => {
      // Get all type filter buttons
      const typeFilterButtons = document.querySelectorAll('#type-filters .filter-btn');
      console.log(`Found ${typeFilterButtons.length} type filter buttons`);
      
      // Remove existing event listeners and add new ones
      typeFilterButtons.forEach(button => {
        const type = button.dataset.type || button.textContent.trim();
        console.log(`Setting up type filter for: ${type}`);
        
        // Clone and replace to remove all event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener
        newButton.addEventListener('click', function() {
          console.log(`Type filter clicked: ${type}`);
          filterByType(type, newButton);
        });
      });
      
      console.log('Type filter buttons reset and fixed');
    }, 1000);
  }
  
  // Improved filter by type function
  function filterByType(type, buttonElement) {
    console.log(`Filtering by type: ${type}`);
    
    // Toggle active state
    if (activeTypeFilter === type) {
      console.log('Removing active type filter');
      activeTypeFilter = null;
      
      // Remove active class from all type buttons
      document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      console.log(`Setting active type filter to: ${type}`);
      activeTypeFilter = type;
      
      // Remove active class from all type buttons
      document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to this button
      if (buttonElement) {
        buttonElement.classList.add('active');
      }
    }
    
    // Apply the filter
    applyTypeFilter();
  }
  
  // Apply the type filter
  function applyTypeFilter() {
    console.log('Applying type filter...');
    
    // Get all feedback items
    const items = document.querySelectorAll('.feedback-item');
    console.log(`Found ${items.length} feedback items`);
    
    items.forEach(item => {
      // Show all items if no active filter
      if (!activeTypeFilter) {
        item.style.display = '';
        return;
      }
      
      // Check if the item has the type tag matching our filter
      const typeTag = item.querySelector(`.type-tag`);
      const itemType = typeTag ? typeTag.textContent.trim() : 'Unknown';
      
      // Show or hide based on type match
      if (itemType === activeTypeFilter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Update results count
    updateResultsCount();
  }
  
  // Update the results count display
  function updateResultsCount() {
    const visibleItems = document.querySelectorAll('.feedback-item[style=""],.feedback-item:not([style])');
    const resultsCount = document.getElementById('results-count');
    
    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleItems.length} results`;
    }
  }
  
  // Check if we need to add a mutation observer to handle dynamically added filters
  function setupMutationObserver() {
    // Create an observer instance
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && 
            mutation.target.id === 'type-filters' &&
            mutation.addedNodes.length > 0) {
          console.log('Detected new type filters added, fixing...');
          fixTypeFilters();
        }
      });
    });
    
    // Start observing the target node for configured mutations
    const typeFiltersElement = document.getElementById('type-filters');
    if (typeFiltersElement) {
      observer.observe(typeFiltersElement, { 
        childList: true,
        subtree: false
      });
      console.log('Type filters mutation observer set up');
    }
  }
  
  // Initial fix
  fixTypeFilters();
  
  // Set up mutation observer
  setupMutationObserver();
  
  // Also watch for page changes that might affect filters
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Wait for the page to load, then fix filters
      setTimeout(fixTypeFilters, 1000);
    });
  });
  
  // Export functions to global scope so they can be called from console if needed
  window.fixTypeFilters = fixTypeFilters;
  window.filterByType = filterByType;
  window.applyTypeFilter = applyTypeFilter;
  
  console.log('Type filter fixes applied');
});
