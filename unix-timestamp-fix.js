// ===== UNIX TIMESTAMP FIX =====
// This standalone fix addresses issues with timestamps stored as Unix seconds
// rather than milliseconds, causing dates to display incorrectly

(function() {
    console.log("Loading Unix timestamp fix...");
    
    // The core timestamp fix function
    window.fixUnixTimestamp = function(timestamp) {
        // Handle null, undefined, or non-numeric values
        if (!timestamp || isNaN(Number(timestamp))) {
            return Date.now();
        }
        
        // Convert string to number if needed
        if (typeof timestamp === 'string') {
            timestamp = Number(timestamp);
        }
        
        // Check if this is a Unix timestamp in seconds
        // Unix timestamps from 2023-2030 in seconds format are roughly 1700000000-1900000000
        // In milliseconds, they would be 1700000000000-1900000000000
        if (timestamp > 1000000000 && timestamp < 2000000000) {
            console.log(`Converting Unix timestamp from seconds to ms: ${timestamp} × 1000 = ${timestamp * 1000}`);
            return timestamp * 1000;
        }
        
        return timestamp;
    };
    
    // Apply fixes to all relevant functions and data
    function applyTimestampFixes() {
        console.log("Applying timestamp fixes to all relevant parts of the application...");
        
        // 1. Fix formatDateTime function if it exists
        if (typeof window.formatDateTime === 'function') {
            const originalFormatDateTime = window.formatDateTime;
            window.formatDateTime = function(dateStr) {
                // If it's a number-like value, it might be a timestamp
                if (!isNaN(dateStr)) {
                    dateStr = window.fixUnixTimestamp(dateStr);
                }
                return originalFormatDateTime(dateStr);
            };
            console.log("✅ Patched formatDateTime function to handle Unix timestamps");
        }
        
        // 2. Fix any raw date displays using timestamps
        document.querySelectorAll('.datetime').forEach(el => {
            const timestamp = el.dataset.timestamp;
            if (timestamp && !isNaN(timestamp)) {
                const fixedTimestamp = window.fixUnixTimestamp(timestamp);
                const date = new Date(fixedTimestamp);
                el.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                console.log(`Fixed timestamp display: ${timestamp} -> ${date.toString()}`);
            }
        });
        
        // 3. Fix timestamps in existing data
        if (window.data && Array.isArray(window.data)) {
            console.log("Fixing timestamps in existing data...");
            window.data = window.data.map(item => {
                if (item.timestamp) {
                    const originalTimestamp = item.timestamp;
                    item.timestamp = window.fixUnixTimestamp(item.timestamp);
                    
                    // Update datetime field with corrected date
                    if (item.timestamp !== originalTimestamp) {
                        const fixedDate = new Date(item.timestamp);
                        item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                        console.log(`Fixed timestamp for item ${item.id}: ${originalTimestamp} -> ${item.timestamp}`);
                    }
                }
                return item;
            });
            
            // Also fix filteredData if it exists
            if (window.filteredData && Array.isArray(window.filteredData)) {
                window.filteredData = window.filteredData.map(item => {
                    if (item.timestamp) {
                        item.timestamp = window.fixUnixTimestamp(item.timestamp);
                        // Update datetime field
                        const fixedDate = new Date(item.timestamp);
                        item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                    }
                    return item;
                });
            }
        }
        
        // 4. Fix convertMongoDataToAppFormat function if it exists
        if (typeof window.convertMongoDataToAppFormat === 'function') {
            const originalConvert = window.convertMongoDataToAppFormat;
            window.convertMongoDataToAppFormat = function(mongoData) {
                // Call original function
                const converted = originalConvert(mongoData);
                
                // Fix timestamps in the converted data
                if (Array.isArray(converted)) {
                    converted.forEach(item => {
                        if (item.timestamp) {
                            const originalTimestamp = item.timestamp;
                            item.timestamp = window.fixUnixTimestamp(item.timestamp);
                            
                            // Update datetime field
                            if (item.timestamp !== originalTimestamp) {
                                const fixedDate = new Date(item.timestamp);
                                item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                            }
                        }
                    });
                }
                
                return converted;
            };
            console.log("✅ Enhanced convertMongoDataToAppFormat to fix timestamps");
        }
        
        // 5. Add a debug function to force-refresh all timestamps
        window.refreshAllTimestamps = function() {
            console.log("Manually refreshing all timestamps...");
            let count = 0;
            
            if (window.data && Array.isArray(window.data)) {
                window.data.forEach(item => {
                    if (item.timestamp) {
                        const originalTimestamp = item.timestamp;
                        item.timestamp = window.fixUnixTimestamp(item.timestamp);
                        
                        if (item.timestamp !== originalTimestamp) {
                            count++;
                            const fixedDate = new Date(item.timestamp);
                            item.datetime = fixedDate.toLocaleDateString() + ' ' + fixedDate.toLocaleTimeString();
                        }
                    }
                });
            }
            
            console.log(`Fixed ${count} timestamps`);
            
            // Re-render if possible
            if (typeof window.renderItems === 'function') {
                window.renderItems();
            }
            
            // Show notification if available
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Fixed ${count} timestamps`, 'success');
            }
            
            return count;
        };
        
        console.log("All timestamp fixes applied successfully");
    }
    
    // Run the fixes when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTimestampFixes);
    } else {
        // DOM already loaded
        applyTimestampFixes();
    }
    
    // Run the fixes again after a slight delay to ensure all data is loaded
    setTimeout(applyTimestampFixes, 1000);
    
    // For debugging, expose the fix in the console
    console.log("Unix timestamp fix loaded - you can manually refresh timestamps with window.refreshAllTimestamps()");
})();
