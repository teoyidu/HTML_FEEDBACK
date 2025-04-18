// diagnostic.js - Add this temporarily to understand what's happening
(function() {
    console.log("=== FEEDBACK SYSTEM DIAGNOSTIC ===");

    // Log all important global functions
    const criticalFunctions = [
        'renderItems', 'applyFilters', 'connectToMongoDB',
        'parseMessages', 'convertMongoDataToAppFormat'
    ];

    criticalFunctions.forEach(funcName => {
        console.log(`${funcName}: ${typeof window[funcName]}`);
    });

    // Capture original functions before any potential overrides
    const originalFunctions = {};
    criticalFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            originalFunctions[funcName] = window[funcName];
        }
    });

    // Monitor for function changes
    setInterval(() => {
        criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function' &&
                window[funcName] !== originalFunctions[funcName] &&
                originalFunctions[funcName]) {
                console.warn(`Function changed: ${funcName}`);
            }
        });
    }, 1000);

    // Intercept critical parsing functions
    if (typeof window.parseMessages === 'function') {
        const originalParse = window.parseMessages;
        window.parseMessages = function(messagesString) {
            console.log("parseMessages called with:", messagesString?.substring(0, 100));
            try {
                const result = originalParse.apply(this, arguments);
                console.log("parseMessages result:", result.length, "messages");
                return result;
            } catch (error) {
                console.error("Error in parseMessages:", error);
                throw error;
            }
        };
    }
})();