/**
 * Page Size Button Handler
 * 
 * This script handles the page size selector buttons, implementing:
 * - Clean event listener attachment (avoids duplicates via cloning)
 * - Updates active button state
 * - Changes page size and refreshes data view
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPageSizeButtons();
});

function setupPageSizeButtons() {
  // Wait a short time to ensure all buttons are rendered
  setTimeout(() => {
    const pageSizeButtons = document.querySelectorAll('.page-size-btn');
    
    if (pageSizeButtons.length === 0) {
      console.warn('No page size buttons found in the DOM');
      return;
    }
    
    console.log(`Found ${pageSizeButtons.length} page size buttons`);
    
    pageSizeButtons.forEach(button => {
      // Remove existing listeners by cloning
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add the new event listener
      newButton.addEventListener('click', () => {
        console.log(`Page size changed to: ${newButton.dataset.size}`);
        
        // Update active state on buttons
        document.querySelectorAll('.page-size-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        newButton.classList.add('active');
        
        // Update page size
        const newPageSize = parseInt(newButton.dataset.size);
        
        // Check if pageSize is a valid variable in window scope
        if (typeof window.pageSize !== 'undefined') {
          // Only reload if the size actually changed
          if (newPageSize !== window.pageSize) {
            window.pageSize = newPageSize;
            
            // Reload current page with new page size
            if (typeof window.loadPage === 'function') {
              window.loadPage(0); // Reset to first page with new size
            } else if (typeof loadPage === 'function') {
              loadPage(0);
            } else {
              console.warn('loadPage function not found, falling back to renderItems');
              if (typeof window.renderItems === 'function') {
                window.renderItems();
              } else if (typeof renderItems === 'function') {
                renderItems();
              } else {
                console.error('Neither loadPage nor renderItems functions were found');
              }
            }
          } else {
            // Just re-render with current data if size hasn't changed
            if (typeof window.renderItems === 'function') {
              window.renderItems();
            } else if (typeof renderItems === 'function') {
              renderItems();
            } else {
              console.error('renderItems function not found');
            }
          }
        } else {
          console.error('pageSize variable not found in window scope');
        }
        
        // Update the results count if it exists
        const resultsCountElement = document.getElementById('results-count');
        if (resultsCountElement && window.filteredData) {
          resultsCountElement.textContent = `Showing ${Math.min(newPageSize, window.filteredData.length)} of ${window.filteredData.length} results`;
        }
      });
    });
    
    console.log('Page size buttons setup completed successfully');
  }, 300); // Small delay to ensure DOM is ready
}

// Re-run setup when new content is added (for dynamically loaded buttons)
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // Check if any added nodes contain page size buttons
        const hasPageSizeButtons = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.classList?.contains('page-size-btn') || 
                  node.querySelector?.('.page-size-btn') !== null;
          }
          return false;
        });
        
        if (hasPageSizeButtons) {
          setupPageSizeButtons();
        }
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
}
