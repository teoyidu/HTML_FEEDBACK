// Simplified continuous-loading-fix.js
(function() {
  console.log('Applying simplified loading fix...');

  // Debounce function - less aggressive implementation
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Fix search input with minimal overhead
  function fixSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      console.log('Applying search debounce fix');

      // Remove existing event listeners
      const newSearch = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearch, searchInput);

      // Add debounced event listener
      newSearch.addEventListener('input', debounce(function() {
        window.searchQuery = this.value.toLowerCase();

        // Use a safe method to apply filters
        if (typeof window.applyFilters === 'function') {
          window.applyFilters();
        }
      }, 300));
    }
  }

  // Safely stop any recurring timers
  function stopRecurringTimers() {
    console.log('Stopping potential recurring timers');

    // Safely clear intervals and timeouts
    const maxTimerId = 1000; // Reasonable limit
    for (let i = 0; i < maxTimerId; i++) {
      try {
        window.clearInterval(i);
        window.clearTimeout(i);
      } catch (e) {
        // Silently ignore errors
      }
    }
  }

  // Optimize filter application to prevent redundant calls
  function optimizeFilterApplication() {
    const originalApplyFilters = window.applyFilters;

    if (typeof originalApplyFilters === 'function') {
      window.applyFilters = debounce(function() {
        // Call original apply filters with reduced frequency
        originalApplyFilters();
      }, 200);
    }
  }

  // Main initialization
  function initializeFixes() {
    try {
      fixSearchInput();
      stopRecurringTimers();
      optimizeFilterApplication();
    } catch (error) {
      console.error('Error in loading fix initialization:', error);
    }
  }

  // Apply fixes based on document ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFixes);
  } else {
    initializeFixes();
  }

  console.log('Simplified loading fix applied');
})();