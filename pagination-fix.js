// pagination-fix.js - Fixes the data loading issue without changing UI animations

document.addEventListener('DOMContentLoaded', function() {
  console.log('Applying pagination fix...');

  // Store original references to functions we'll modify
  const originalConnectToMongoDB = window.connectToMongoDB;
  const originalLoadPage = window.loadPage;
  const originalApplyFilters = window.applyFilters;

  /**
   * Fix for connectToMongoDB - ensure it only loads current page data
   * @param {number} page - The page to load (default 0)
   */
  window.connectToMongoDB = async function(page = 0) {
    try {
      // Show connecting status
      connectionIndicator.classList.remove('connected');
      connectionIndicator.classList.remove('disconnected');
      connectionText.textContent = `Connecting to MongoDB (page ${page + 1})...`;

      // We'll only clear the current page data, not all data
      filteredData = [];

      // Properly format the API URL with pagination
      const response = await fetch(`${API_BASE_URL}/conversations?page=${page}&limit=${pageSize}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);

      let mongoData;
      if (result.data) {
        mongoData = result.data;

        // Update pagination info
        currentPage = result.pagination.page;
        totalPages = result.pagination.totalPages;

        // Store total count for reference
        window.totalRecordCount = result.pagination.totalCount;
      } else {
        // Handle old API format
        mongoData = result;
        currentPage = 0;
        totalPages = 1;
      }

      // Update connection status
      connectionIndicator.classList.add('connected');
      connectionText.textContent = `Connected to MongoDB - ${mongoData.length} records loaded`;

      if (result.pagination) {
        connectionText.textContent += ` (Page ${currentPage + 1} of ${totalPages} - Total: ${result.pagination.totalCount})`;
      }

      // Convert and store data - ONLY THE CURRENT PAGE
      data = convertMongoDataToAppFormat(mongoData);
      console.log("Converted data for current page:", data);

      // Set filtered data to the current page data that isn't hidden (unless showHidden is true)
      filteredData = [...data.filter(item => showHidden || !item.hidden)];

      // Initialize schema and type filters
      initializeSchemaFilters();
      initializeTypeFilters();

      // Initialize tabs
      initializeTabs(totalPages);

      // Render items
      renderItems();

    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      connectionIndicator.classList.add('disconnected');
      connectionText.textContent = 'Failed to connect to MongoDB: ' + error.message;

      // For development/testing only - fall back to sample data
      if (confirm('Connection to API failed. Use sample data instead?')) {
        const mongoData = sampleMongoData;
        data = convertMongoDataToAppFormat(mongoData);
        console.log("Sample data:", data);

        filteredData = [...data.filter(item => !item.hidden)];

        // Initialize filters
        initializeSchemaFilters();
        initializeTypeFilters();

        // Mock pagination for sample data
        currentPage = 0;
        totalPages = 1;
        initializeTabs(totalPages);

        renderItems();
      }
    }
  };

  /**
   * Fix for loadPage - ensure it only loads the requested page
   * @param {number} page - The page to load
   */
  window.loadPage = async function(page) {
    // Show loading state
    connectionText.textContent = `Loading page ${page + 1}...`;

    try {
      // Fetch data for specific page only
      const response = await fetch(`${API_BASE_URL}/conversations?page=${page}&limit=${pageSize}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      const mongoData = result.data;

      // Update current page
      currentPage = page;

      // Convert and store ONLY THIS PAGE's data
      data = convertMongoDataToAppFormat(mongoData);
      filteredData = [...data.filter(item => showHidden || !item.hidden)];

      // Update filters if the page has different types
      initializeTypeFilters();

      // Update tabs
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach(tab => {
        const tabPage = parseInt(tab.dataset.page);
        tab.classList.toggle('active', tabPage === currentPage);
      });

      // Update tab visibility
      updateTabsVisibility();

      // Update navigation buttons
      document.getElementById('prev-tab-btn').disabled = currentPage === 0;
      document.getElementById('next-tab-btn').disabled = currentPage === totalPages - 1;

      // Update connection status
      connectionText.textContent = `Page ${currentPage + 1} of ${totalPages} - Total records: ${result.pagination.totalCount}`;

      // Render items
      renderItems();

    } catch (error) {
      console.error('Error loading page:', error);
      connectionText.textContent = `Failed to load page ${page + 1}: ${error.message}`;
    }
  };

  /**
   * Fix for applyFilters - use server-side filtering when possible
   */
  window.applyFilters = async function() {
    try {
      // Build query parameters for server-side filtering
      const queryParams = new URLSearchParams();

      // Add page and limit
      queryParams.append('page', currentPage);
      queryParams.append('limit', pageSize);

      // Add active filters
      if (activeSchema) {
        queryParams.append('schema', activeSchema);
      }

      if (activeTypeFilter) {
        queryParams.append('type', activeTypeFilter);
      }

      if (activeFeedbackFilter) {
        queryParams.append('feedback', activeFeedbackFilter);
      }

      // Add hidden filter
      queryParams.append('hidden', showHidden);

      // Add search query
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      // Show loading state
      connectionText.textContent = 'Applying filters...';

      // Fetch filtered data
      const response = await fetch(`${API_BASE_URL}/conversations?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      const mongoData = result.data || result;

      // Convert and store only the filtered data from this page
      data = convertMongoDataToAppFormat(mongoData);
      filteredData = data;

      // Update pagination info if available
      if (result.pagination) {
        currentPage = result.pagination.page;
        totalPages = result.pagination.totalPages;

        // Update connection status
        connectionText.textContent = `Filtered results: ${result.pagination.totalCount} found (Page ${currentPage + 1} of ${totalPages})`;
      }

      // Update tabs
      initializeTabs(totalPages);

      // Render filtered items
      renderItems();
    } catch (error) {
      console.error('Error applying filters:', error);

      // Fall back to client-side filtering for development/testing
      console.log('Falling back to client-side filtering...');

      // Only client-side filter the current page data
      let filtered = [...data];

      // Apply schema filter if active
      if (activeSchema) {
        filtered = filtered.filter(item => item.schema === activeSchema);
      }

      // Apply type filter if active
      if (activeTypeFilter) {
        filtered = filtered.filter(item => (item.type || 'Unknown') === activeTypeFilter);
      }

      // Apply feedback filter if active
      if (activeFeedbackFilter) {
        filtered = filtered.filter(item => item.feedback === activeFeedbackFilter);
      }

      // Apply hidden filter
      if (!showHidden) {
        filtered = filtered.filter(item => !item.hidden);
      }

      // Apply search query
      if (searchQuery) {
        filtered = filtered.filter(item =>
            (item.question && item.question.toLowerCase().includes(searchQuery)) ||
            (item.query && item.query.toLowerCase().includes(searchQuery))
        );
      }

      filteredData = filtered;
      renderItems();
    }
  };

  // Fix the API routes if not already implemented on the server
  fixApiRoutes();

  console.log('Pagination fix applied successfully');
});

/**
 * Check if the API supports necessary pagination and filtering routes
 * If not, print instructions on what to add to the backend
 */
function fixApiRoutes() {
  // Test a simple call to see if pagination works
  fetch(`${API_BASE_URL}/conversations?page=0&limit=5`)
      .then(response => {
        if (!response.ok) {
          console.warn('API may not support pagination. Check server implementation.');
          console.log('Make sure your server has these routes implemented:');
          console.log('- GET /conversations?page=X&limit=Y - for pagination');
          console.log('- GET /conversations?schema=X - for schema filtering');
          console.log('- GET /conversations?type=X - for type filtering');
          console.log('- GET /conversations?feedback=X - for feedback filtering');
          console.log('- GET /conversations?hidden=true/false - for hidden filtering');
          console.log('- GET /conversations?search=X - for search filtering');
        } else {
          console.log('API pagination supported ✓');
        }
      })
      .catch(error => {
        console.error('Error checking API:', error);
      });
}

// Add these modifications to app.js
function modifyAppJs() {
  // Add server-side filtering support
  console.log(`
  
  === SERVER-SIDE CHANGES NEEDED ===
  
  Add this to your app.js to support server-side filtering:
  
  // Get all conversations with pagination and filtering
  app.get('/api/conversations', async (req, res) => {
    try {
      if (!db) {
        const connected = await connectToMongo();
        if (!connected) {
          return res.status(500).json({ error: 'Database connection failed' });
        }
      }

      const collection = db.collection(collectionName);

      // Pagination parameters
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 100;
      const skip = page * limit;

      // Build filter object
      const filter = {};
      
      // Add schema filter
      if (req.query.schema) {
        filter.schema = req.query.schema;
      }
      
      // Add type filter
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      // Add feedback filter
      if (req.query.feedback) {
        filter.feedback = req.query.feedback;
      }
      
      // Add hidden filter
      if (req.query.hidden !== undefined) {
        filter.hidden = req.query.hidden === 'true';
      }
      
      // Add search filter
      if (req.query.search) {
        // Search in messages (user queries)
        const searchQuery = req.query.search.toLowerCase();
        // Use text search if configured, or fallback to basic search
        filter['$or'] = [
          { messages: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      try {
        // Get total count matching the filter
        const totalCount = await collection.countDocuments(filter);

        // Get paginated and filtered data
        const conversations = await collection.find(filter)
          .skip(skip)
          .limit(limit)
          .toArray();

        console.log(\`Fetched \${conversations.length} conversations for page \${page} with filters\`);

        res.json({
          data: conversations,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Fall back to returning an empty array with pagination info
        res.json({
          data: [],
          pagination: {
            page,
            limit,
            totalCount: 0,
            totalPages: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });
  `);
}