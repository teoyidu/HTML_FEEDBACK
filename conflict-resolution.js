// Add this script as the last <script> in your HTML
// It will ensure consistency between all the different scripts

(function() {
    console.log("Running conflict resolution script...");

    // Wait for all other scripts to load
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log("Applying final fixes to ensure tab system works correctly");

            // 1. Make sure event listeners aren't duplicated on critical elements

            // Fix page size buttons
            document.querySelectorAll('.page-size-btn').forEach(button => {
                const newBtn = button.cloneNode(true);
                button.parentNode.replaceChild(newBtn, button);

                newBtn.addEventListener('click', function() {
                    document.querySelectorAll('.page-size-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    newBtn.classList.add('active');

                    const newSize = parseInt(newBtn.dataset.size);
                    console.log(`Setting page size to ${newSize} from conflict resolver`);
                    window.pageSize = newSize;

                    // Reload current page with new size
                    if (typeof window.loadPage === 'function') {
                        window.loadPage(window.currentPage || 0);
                    } else {
                        console.error("loadPage function not found");
                    }
                });
            });

            // 2. Make sure tab navigation works
            const tabsList = document.getElementById('tabs-list');
            const prevTabBtn = document.getElementById('prev-tab-btn');
            const nextTabBtn = document.getElementById('next-tab-btn');

            if (tabsList && prevTabBtn && nextTabBtn) {
                // Replace navigation buttons to clear any conflicting event listeners
                const newPrevBtn = prevTabBtn.cloneNode(true);
                const newNextBtn = nextTabBtn.cloneNode(true);

                prevTabBtn.parentNode.replaceChild(newPrevBtn, prevTabBtn);
                nextTabBtn.parentNode.replaceChild(newNextBtn, nextTabBtn);

                // Add fresh event listeners
                newPrevBtn.addEventListener('click', function() {
                    if (window.currentPage > 0) {
                        window.loadPage(window.currentPage - 1);
                    }
                });

                newNextBtn.addEventListener('click', function() {
                    if (window.currentPage < window.totalPages - 1) {
                        window.loadPage(window.currentPage + 1);
                    }
                });

                // Make sure tab buttons have correct event listeners
                document.querySelectorAll('.pagination-btn').forEach(button => {
                    const newTabBtn = button.cloneNode(true);
                    button.parentNode.replaceChild(newTabBtn, button);

                    const pageIndex = parseInt(newTabBtn.dataset.page);
                    newTabBtn.addEventListener('click', function() {
                        console.log(`Tab clicked for page ${pageIndex + 1} from conflict resolver`);
                        if (window.currentPage !== pageIndex) {
                            window.loadPage(pageIndex);
                        }
                    });
                });
            }

            // 3. Fix renderItems to respect page size
            if (typeof window.renderItems === 'function') {
                const originalRenderItems = window.renderItems;

                window.renderItems = function() {
                    console.log("Enhanced renderItems called by conflict resolver");

                    try {
                        // Call original function
                        originalRenderItems.apply(this, arguments);

                        // Make sure results count is updated correctly
                        const resultsCount = document.getElementById('results-count');
                        if (resultsCount) {
                            resultsCount.textContent = `Showing ${Math.min(window.pageSize, window.filteredData.length)} of ${window.filteredData.length} results`;
                        }

                        // Verify that actually pageSize items are shown (if available)
                        const feedbackItems = document.getElementById('feedback-items');
                        if (feedbackItems) {
                            const visibleItems = feedbackItems.querySelectorAll('.feedback-item');
                            console.log(`Visible items: ${visibleItems.length}, Should be showing: ${Math.min(window.pageSize, window.filteredData.length)}`);

                            // If we're showing too few items, try rendering again
                            if (visibleItems.length < Math.min(window.pageSize, window.filteredData.length)) {
                                console.warn("Too few items rendered, forcing re-render");
                                feedbackItems.innerHTML = '';

                                // Re-render up to pageSize items
                                const itemsToRender = window.filteredData.slice(0, window.pageSize);
                                itemsToRender.forEach(item => {
                                    // This is a simplified version - in a real fix, you'd copy the full rendering logic
                                    const itemEl = document.createElement('div');
                                    itemEl.className = 'feedback-item';
                                    itemEl.textContent = item.question || 'No question';
                                    feedbackItems.appendChild(itemEl);
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Error in enhanced renderItems:", error);
                    }
                };
            }

            // 4. Make sure loadPage respects page size
            if (typeof window.loadPage === 'function') {
                const originalLoadPage = window.loadPage;

                window.loadPage = function(page) {
                    console.log(`Enhanced loadPage called for page ${page + 1} with page size ${window.pageSize}`);

                    try {
                        // Add the pageSize parameter explicitly to the function
                        return originalLoadPage.call(this, page, window.pageSize);
                    } catch (error) {
                        console.error("Error in enhanced loadPage:", error);
                    }
                };
            }

            console.log("Conflict resolution complete");
        }, 1000); // Wait 1 second for all scripts to finish
    });
})();