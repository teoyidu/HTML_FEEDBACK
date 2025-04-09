// Debug Mode Implementation
// Add these functions near the top of your script section

// Debug mode state
let debugMode = false;

// Function to generate sample data with different schemas, feedback states, and content
function generateSampleData() {
    return [
        {
            id: "sample1",
            schema: "Mesai",
            question: "What are my work hours this week?",
            conversation: [
                { role: "user", message: "What are my work hours this week?" },
                { role: "assistant", message: "Your work hours for this week are:\nMonday: 9 AM - 5 PM\nTuesday: 9 AM - 5 PM\nWednesday: 10 AM - 6 PM\nThursday: 9 AM - 5 PM\nFriday: 9 AM - 4 PM" }
            ],
            suggestions: [
                "You might want to check your overtime hours for last week",
                "Would you like to request time off?",
                "Do you need to see your vacation balance?"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_SCHEDULE]->(s:Schedule) WHERE s.week = '2023-W42' RETURN s",
                "MATCH (e:Employee {id: '12345'})-[:WORKED]->(h:Hours) WHERE h.date >= '2023-10-16' RETURN h"
            ],
            feedback: "positive",
            hidden: false,
            user: "testuser1",
            datetime: "2023-10-20 14:32:45"
        },
        {
            id: "sample2",
            schema: "Mukavele",
            question: "When does my contract expire?",
            conversation: [
                { role: "user", message: "When does my contract expire?" },
                { role: "assistant", message: "Your current contract expires on December 31, 2023. Would you like information about the renewal process?" }
            ],
            suggestions: [
                "You might want to review your contract terms",
                "Would you like to schedule a meeting with HR about renewal?",
                "Do you need information about contract extensions?"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract) RETURN c.expiryDate",
                "MATCH (c:Contract)-[:HAS_TERMS]->(t:Terms) WHERE c.employeeId = '12345' RETURN t"
            ],
            feedback: "negative",
            hidden: false,
            user: "testuser2",
            datetime: "2023-10-19 10:15:30"
        },
        {
            id: "sample3",
            schema: "Genel",
            question: "How do I request vacation time?",
            conversation: [
                { role: "user", message: "How do I request vacation time?" },
                { role: "assistant", message: "To request vacation time, you need to:\n1. Log into the employee portal\n2. Go to 'Time Off' section\n3. Click 'Request Time Off'\n4. Select the dates and type of leave\n5. Submit for approval" }
            ],
            suggestions: [
                "You currently have 15 vacation days available",
                "Would you like to see the company holiday calendar?",
                "Do you need information about sick leave policy?"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.vacationDays",
                "MATCH (p:Policy {type: 'vacation'})-[:APPLIES_TO]->(d:Department {id: '54321'}) RETURN p"
            ],
            feedback: null,
            hidden: true,
            user: "testuser3",
            datetime: "2023-10-18 09:45:12"
        },
        {
            id: "sample4",
            schema: "",
            question: "What is the company travel policy?",
            conversation: [
                { role: "user", message: "What is the company travel policy?" },
                { role: "assistant", message: "The company travel policy includes:\n- Flights must be economy class for trips under 6 hours\n- Business class is permitted for flights over 6 hours\n- Hotel stays should not exceed $200 per night in most cities\n- All expenses must be submitted with receipts within 14 days of return" }
            ],
            suggestions: [
                "Would you like to see the list of approved travel vendors?",
                "Do you need the expense report form?",
                "I can help you book travel if you need assistance"
            ],
            cypherQueries: [
                "MATCH (p:Policy {name: 'TravelPolicy'})-[:HAS_SECTION]->(s:Section) RETURN s",
                "MATCH (v:Vendor)-[:APPROVED_FOR]->(c:Category {name: 'Travel'}) RETURN v"
            ],
            feedback: null,
            hidden: false,
            user: "testuser4",
            datetime: "2023-10-17 11:20:15"
        },
        {
            id: "sample5",
            schema: "Mesai",
            question: "How many sick days do I have left?",
            conversation: [
                { role: "user", message: "How many sick days do I have left?" },
                { role: "assistant", message: "You have 7 sick days remaining for this year. You started with 10 days and have used 3 so far." },
                { role: "user", message: "When do they expire?" },
                { role: "assistant", message: "Your sick days expire at the end of the calendar year, December 31, 2023. They do not roll over to the next year." }
            ],
            suggestions: [
                "Do you need to request a sick day?",
                "Would you like to review your recent time off?",
                "I can show you the company sick leave policy if needed"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.sickDaysRemaining",
                "MATCH (e:Employee {id: '12345'})-[:REQUESTED]->(t:TimeOff {type: 'Sick'}) RETURN t ORDER BY t.date DESC"
            ],
            feedback: "positive",
            hidden: false,
            user: "testuser5",
            datetime: "2023-10-16 09:05:22"
        },
        {
            id: "sample6",
            schema: "Mukavele",
            question: "Can I see the benefits included in my contract?",
            conversation: [
                { role: "user", message: "Can I see the benefits included in my contract?" },
                { role: "assistant", message: "Your contract includes the following benefits:\n- Health insurance (covers 90% of medical expenses)\n- Dental insurance (covers 80% of dental procedures)\n- Vision insurance (annual eye exam and $200 for glasses/contacts)\n- 401(k) matching up to 5% of salary\n- 3 weeks paid vacation\n- 10 sick days\n- 5 personal days\n- Gym membership reimbursement up to $50/month" }
            ],
            suggestions: [
                "Would you like more details about your health insurance plan?",
                "Do you want to update your 401(k) contribution percentage?",
                "I can help you submit a gym membership reimbursement"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract)-[:INCLUDES]->(b:Benefits) RETURN b",
                "MATCH (i:Insurance {type: 'Health'})-[:COVERS]->(p:Procedure) RETURN p, p.coveragePercentage"
            ],
            feedback: "positive",
            hidden: false,
            user: "testuser6",
            datetime: "2023-10-15 16:40:10"
        },
        {
            id: "sample7",
            schema: "Genel",
            question: "What are the office hours for IT support?",
            conversation: [
                { role: "user", message: "What are the office hours for IT support?" },
                { role: "assistant", message: "The IT support team is available during these hours:\nMonday-Friday: 8 AM - 8 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\nFor emergencies outside these hours, you can call the 24/7 support line at ext. 5555." }
            ],
            suggestions: [
                "Would you like to submit an IT support ticket?",
                "Do you need help with a specific IT issue?",
                "I can connect you with an IT specialist if it's urgent"
            ],
            cypherQueries: [
                "MATCH (d:Department {name: 'IT Support'})-[:HAS_HOURS]->(h:Hours) RETURN h",
                "MATCH (d:Department {name: 'IT Support'})-[:HAS_CONTACT]->(c:Contact) RETURN c"
            ],
            feedback: null,
            hidden: false,
            user: "testuser7",
            datetime: "2023-10-14 13:25:33"
        },
        {
            id: "sample8",
            schema: "",
            question: "How do I update my direct deposit information?",
            conversation: [
                { role: "user", message: "How do I update my direct deposit information?" },
                { role: "assistant", message: "To update your direct deposit information:\n1. Log into the employee portal\n2. Go to 'Personal Information' section\n3. Click on 'Banking Details'\n4. Select 'Edit'\n5. Enter your new banking information\n6. Submit for verification\n\nPlease note that changes may take 1-2 pay cycles to take effect." }
            ],
            suggestions: [
                "Would you like me to guide you through the employee portal?",
                "Do you need to check when your next payday is?",
                "I can show you your current banking information if needed"
            ],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_BANKING_INFO]->(b:BankAccount) RETURN b",
                "MATCH (p:PaySchedule) WHERE p.nextPayDate > date() RETURN p.nextPayDate ORDER BY p.nextPayDate LIMIT 1"
            ],
            feedback: "negative",
            hidden: false,
            user: "testuser8",
            datetime: "2023-10-13 10:10:05"
        },
        {
            id: "sample9",
            schema: "Mesai",
            question: "What are the holiday dates for this year?",
            conversation: [
                { role: "user", message: "What are the holiday dates for this year?" },
                { role: "assistant", message: "The company holidays for this year are:\n- New Year's Day: January 1\n- Martin Luther King Jr. Day: January 16\n- Presidents' Day: February 20\n- Memorial Day: May 29\n- Independence Day: July 4\n- Labor Day: September 4\n- Thanksgiving Day: November 23\n- Day after Thanksgiving: November 24\n- Christmas Eve: December 24\n- Christmas Day: December 25\n- New Year's Eve: December 31" }
            ],
            suggestions: [
                "Would you like to see next year's holiday calendar?",
                "Do you need to request time off around any of these holidays?",
                "I can show you which holidays fall on weekends this year"
            ],
            cypherQueries: [
                "MATCH (h:Holiday)-[:IN_YEAR]->(y:Year {year: 2023}) RETURN h ORDER BY h.date",
                "MATCH (h:Holiday)-[:IN_YEAR]->(y:Year {year: 2023}) WHERE h.date.dayOfWeek IN [6, 7] RETURN h"
            ],
            feedback: "positive",
            hidden: false,
            user: "testuser9",
            datetime: "2023-10-12 15:55:40"
        },
        {
            id: "sample10",
            schema: "Mukavele",
            question: "What is the company policy on remote work?",
            conversation: [
                { role: "user", message: "What is the company policy on remote work?" },
                { role: "assistant", message: "The current remote work policy allows employees to:\n- Work remotely up to 3 days per week\n- Must be in office Tuesday and Thursday for team meetings\n- Remote work requires manager approval with at least 24 hours notice\n- Must maintain regular working hours (9 AM - 5 PM)\n- Must be available via Teams/Slack during working hours\n- Need stable internet connection and appropriate home office setup" }
            ],
            suggestions: [
                "Would you like to see the full remote work policy document?",
                "Do you need to submit a remote work request?",
                "I can help you set up your home office equipment"
            ],
            cypherQueries: [
                "MATCH (p:Policy {name: 'RemoteWork'})-[:HAS_VERSION]->(v:Version) RETURN v ORDER BY v.date DESC LIMIT 1",
                "MATCH (e:Employee {id: '12345'})-[:REQUESTED]->(r:RemoteWork) WHERE r.date >= date() RETURN r"
            ],
            feedback: null,
            hidden: true,
            user: "testuser10",
            datetime: "2023-10-11 14:30:18"
        }
    ];
}

// Function to initialize debug mode
function initializeDebugMode() {
    // Create debug control panel element
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '20px';
    debugPanel.style.right = '20px';
    debugPanel.style.backgroundColor = '#1f2937';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '8px';
    debugPanel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.display = 'flex';
    debugPanel.style.flexDirection = 'column';
    debugPanel.style.gap = '10px';

    // Create title
    const panelTitle = document.createElement('div');
    panelTitle.textContent = 'Debug Controls';
    panelTitle.style.fontWeight = 'bold';
    panelTitle.style.borderBottom = '1px solid #374151';
    panelTitle.style.paddingBottom = '5px';
    panelTitle.style.marginBottom = '5px';
    debugPanel.appendChild(panelTitle);

    // Create toggle switch container
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.justifyContent = 'space-between';
    toggleContainer.style.gap = '10px';

    // Create toggle label
    const toggleLabel = document.createElement('label');
    toggleLabel.textContent = 'Use Sample Data';
    toggleLabel.style.cursor = 'pointer';
    toggleContainer.appendChild(toggleLabel);

    // Create toggle switch
    const toggleSwitch = document.createElement('label');
    toggleSwitch.className = 'switch';
    toggleSwitch.style.position = 'relative';
    toggleSwitch.style.display = 'inline-block';
    toggleSwitch.style.width = '50px';
    toggleSwitch.style.height = '24px';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'debug-toggle';
    toggleInput.checked = debugMode;
    toggleInput.style.opacity = '0';
    toggleInput.style.width = '0';
    toggleInput.style.height = '0';

    const toggleSlider = document.createElement('span');
    toggleSlider.style.position = 'absolute';
    toggleSlider.style.cursor = 'pointer';
    toggleSlider.style.top = '0';
    toggleSlider.style.left = '0';
    toggleSlider.style.right = '0';
    toggleSlider.style.bottom = '0';
    toggleSlider.style.backgroundColor = '#4b5563';
    toggleSlider.style.transition = '.4s';
    toggleSlider.style.borderRadius = '24px';

    // Create toggle button
    const toggleButton = document.createElement('span');
    toggleButton.style.position = 'absolute';
    toggleButton.style.content = '""';
    toggleButton.style.height = '18px';
    toggleButton.style.width = '18px';
    toggleButton.style.left = '3px';
    toggleButton.style.bottom = '3px';
    toggleButton.style.backgroundColor = 'white';
    toggleButton.style.transition = '.4s';
    toggleButton.style.borderRadius = '50%';
    toggleSlider.appendChild(toggleButton);

    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    toggleContainer.appendChild(toggleSwitch);
    debugPanel.appendChild(toggleContainer);

    // Create data count display
    const dataCountDisplay = document.createElement('div');
    dataCountDisplay.id = 'debug-data-count';
    dataCountDisplay.textContent = 'No sample data loaded';
    dataCountDisplay.style.fontSize = '0.8rem';
    dataCountDisplay.style.color = '#9ca3af';
    debugPanel.appendChild(dataCountDisplay);

    // Create show/hide button
    const hideButton = document.createElement('button');
    hideButton.textContent = 'Hide Panel';
    hideButton.style.padding = '5px 10px';
    hideButton.style.backgroundColor = '#374151';
    hideButton.style.border = 'none';
    hideButton.style.borderRadius = '4px';
    hideButton.style.color = 'white';
    hideButton.style.cursor = 'pointer';
    hideButton.style.fontSize = '0.8rem';
    hideButton.style.transition = 'background-color 0.2s';
    hideButton.style.marginTop = '5px';
    hideButton.addEventListener('mouseover', () => {
        hideButton.style.backgroundColor = '#4b5563';
    });
    hideButton.addEventListener('mouseout', () => {
        hideButton.style.backgroundColor = '#374151';
    });
    debugPanel.appendChild(hideButton);

    // Add panel to document
    document.body.appendChild(debugPanel);

    // Create show button (initially hidden)
    const showButton = document.createElement('button');
    showButton.id = 'debug-show-btn';
    showButton.textContent = 'Debug';
    showButton.style.position = 'fixed';
    showButton.style.bottom = '20px';
    showButton.style.right = '20px';
    showButton.style.backgroundColor = '#2563eb';
    showButton.style.color = 'white';
    showButton.style.padding = '5px 10px';
    showButton.style.borderRadius = '4px';
    showButton.style.border = 'none';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'none';
    showButton.style.zIndex = '1000';
    document.body.appendChild(showButton);

    // Add event listeners
    toggleInput.addEventListener('change', function() {
        debugMode = this.checked;

        if (debugMode) {
            // Visual indicator that debug mode is active
            document.documentElement.style.setProperty('--debug-border', '4px solid #2563eb');
            document.body.style.border = 'var(--debug-border)';

            // Update status in debug panel
            dataCountDisplay.textContent = 'Sample data enabled';
            dataCountDisplay.style.color = '#10b981';

            // Load sample data
            const sampleData = generateSampleData();
            data = sampleData;
            filteredData = [...data.filter(item => !item.hidden)];

            // Update the display
            currentPage = 0;
            totalPages = 1;
            initializeTabs(totalPages);
            dataCountDisplay.textContent = `${sampleData.length} sample records loaded`;
            renderItems();

            // Update connection status indicator
            const connectionIndicator = document.getElementById('connection-indicator');
            const connectionText = document.getElementById('connection-text');

            if (connectionIndicator) {
                connectionIndicator.classList.remove('disconnected');
                connectionIndicator.classList.add('connected');
            }

            if (connectionText) {
                connectionText.textContent = 'DEBUG MODE: Using sample data';
            }
        } else {
            // Remove visual debug indicator
            document.body.style.border = 'none';

            // Update status in debug panel
            dataCountDisplay.textContent = 'Using real data connection';
            dataCountDisplay.style.color = '#9ca3af';

            // Reconnect to real data
            connectToMongoDB();
        }
    });

    // Hide/Show panel toggle
    hideButton.addEventListener('click', function() {
        debugPanel.style.display = 'none';
        showButton.style.display = 'block';
    });

    showButton.addEventListener('click', function() {
        debugPanel.style.display = 'flex';
        showButton.style.display = 'none';
    });

    // Add CSS for toggle switch
    const style = document.createElement('style');
    style.textContent = `
    .switch input:checked + span {
      background-color: #2563eb;
    }
    
    .switch input:checked + span span {
      transform: translateX(26px);
    }
    
    .switch input:focus + span {
      box-shadow: 0 0 1px #2563eb;
    }
    
    :root {
      --debug-border: none;
    }
  `;
    document.head.appendChild(style);
}

// Modified connectToMongoDB function that uses sample data when in debug mode
async function connectToMongoDB(page = 0) {
    // If debug mode is active, use sample data instead of real API call
    if (debugMode) {
        console.log("DEBUG MODE: Using sample data instead of MongoDB connection");

        // Get sample data
        const sampleData = generateSampleData();

        // Simulate loading delay for realistic testing
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.remove('connected');
            connectionIndicator.classList.remove('disconnected');
        }

        if (connectionText) {
            connectionText.textContent = 'DEBUG MODE: Loading sample data...';
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update connection status
        if (connectionIndicator) {
            connectionIndicator.classList.add('connected');
        }

        if (connectionText) {
            connectionText.textContent = `DEBUG MODE: ${sampleData.length} sample records loaded`;
        }

        // Set data and pagination
        data = sampleData;
        filteredData = [...data.filter(item => !item.hidden)];
        currentPage = 0;
        totalPages = 1;

        // Initialize UI
        initializeTabs(totalPages);
        renderItems();

        return;
    }

    // Original connectToMongoDB function for real data
    try {
        // Show connecting status
        connectionIndicator.classList.remove('connected');
        connectionIndicator.classList.remove('disconnected');
        connectionText.textContent = `Connecting to MongoDB (page ${page + 1})...`;

        // Clear existing data
        data = [];
        filteredData = [];

        // Fetch data from our backend API with pagination
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

        // Convert and store data
        data = convertMongoDataToAppFormat(mongoData);
        console.log("Converted data:", data);

        filteredData = [...data.filter(item => !item.hidden)];

        // Initialize tabs
        initializeTabs(totalPages);

        // Render items
        renderItems();

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        connectionIndicator.classList.add('disconnected');
        connectionText.textContent = 'Failed to connect to MongoDB: ' + error.message;

        // For development/testing - offer to switch to debug mode
        if (confirm('Connection to API failed. Switch to debug mode with sample data?')) {
            // Enable debug mode
            debugMode = true;

            // Update the toggle if it exists
            const debugToggle = document.getElementById('debug-toggle');
            if (debugToggle) {
                debugToggle.checked = true;
            }

            // Load sample data
            const sampleData = generateSampleData();
            data = sampleData;
            filteredData = [...data.filter(item => !item.hidden)];

            // Update the display
            currentPage = 0;
            totalPages = 1;
            initializeTabs(totalPages);

            // Update connection status
            connectionIndicator.classList.remove('disconnected');
            connectionIndicator.classList.add('connected');
            connectionText.textContent = `DEBUG MODE: ${sampleData.length} sample records loaded`;

            // Add visual indicator that debug mode is active
            document.documentElement.style.setProperty('--debug-border', '4px solid #2563eb');
            document.body.style.border = 'var(--debug-border)';

            // Render the items
            renderItems();
        }
    }
}

// Add the initializeDebugMode() function call to the document load event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize debug panel
    initializeDebugMode();
});

// Update the mock API functions to respect debug mode
// This allows testing schema changes, feedback, etc. without a real backend

// Modified setSchema function with debug mode support
async function setSchema(id, schema) {
    const item = data.find(item => item.id === id);
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

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Schema for item ${id} updated to "${schema}"`);

        // Apply filters to update UI if needed
        if (activeSchema) {
            applyFilters();
        }
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/schema`, {
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
        if (activeSchema) {
            applyFilters();
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
}

// Modified handlePositiveFeedback function with debug mode support
async function handlePositiveFeedback(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // If already positive, remove feedback
    const newFeedback = item.feedback === 'positive' ? null : 'positive';

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, feedback: newFeedback };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Feedback for item ${id} updated to "${newFeedback}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/feedback`, {
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
    applyFilters();
}

// Modified handleNegativeFeedback function with debug mode support
async function handleNegativeFeedback(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // If already negative, remove feedback
    const newFeedback = item.feedback === 'negative' ? null : 'negative';

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, feedback: newFeedback };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Feedback for item ${id} updated to "${newFeedback}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/feedback`, {
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
    applyFilters();
}

// Modified handleToggleHidden function with debug mode support
async function handleToggleHidden(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // Toggle hidden state
    const newHiddenState = !item.hidden;

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, hidden: newHiddenState };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Hidden state for item ${id} updated to "${newHiddenState}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/archive`, {
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
    applyFilters();
}