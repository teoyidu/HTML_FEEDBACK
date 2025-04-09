// Soft Wrap Fix Script
document.addEventListener('DOMContentLoaded', function() {
    // Function to add soft wrap styles
    function addSoftWrapStyles() {
        const style = document.createElement('style');
        style.textContent = `
      .edit-message-textarea {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      
      .conversation-bubble {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
    `;
        document.head.appendChild(style);
    }

    // Function to apply soft wrap to specific elements
    function applySoftWrap() {
        const editTextarea = document.getElementById('edit-message-textarea');
        const conversationBubbles = document.querySelectorAll('.conversation-bubble');

        if (editTextarea) {
            editTextarea.style.whiteSpace = 'pre-wrap';
            editTextarea.style.wordWrap = 'break-word';
            editTextarea.style.overflowWrap = 'break-word';
        }

        conversationBubbles.forEach(bubble => {
            bubble.style.whiteSpace = 'pre-wrap';
            bubble.style.wordWrap = 'break-word';
            bubble.style.overflowWrap = 'break-word';
        });
    }

    // Add styles
    addSoftWrapStyles();

    // Apply soft wrap on initial load
    applySoftWrap();

    // Observe dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length || mutation.removedNodes.length) {
                applySoftWrap();
            }
        });
    });

    // Configure the observer
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});