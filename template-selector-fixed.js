// Simple template selector script
document.addEventListener('DOMContentLoaded', function() {
  console.log('Template selector script loaded');
  
  // Add click handlers to all template items
  const templateItems = document.querySelectorAll('.template-item');
  templateItems.forEach(item => {
    // Remove any existing event listeners
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    // Add new event listener
    newItem.addEventListener('click', function() {
      const templateName = this.getAttribute('data-template');
      console.log('Template clicked:', templateName);
      selectTemplate(templateName);
    });
  });
  
  // Add delegated event listener to the parent container
  const templatesGrid = document.querySelector('.templates-grid');
  if (templatesGrid) {
    templatesGrid.addEventListener('click', function(event) {
      // Find the closest template-item if clicked on a child element
      const templateItem = event.target.closest('.template-item');
      if (!templateItem) return; // Not clicking on a template item
      
      const templateName = templateItem.getAttribute('data-template');
      if (templateName) {
        console.log('Template clicked via delegation:', templateName);
        selectTemplate(templateName);
      }
    });
  }
  
  // Select the first template by default
  const firstTemplate = document.querySelector('.template-item');
  if (firstTemplate) {
    const templateName = firstTemplate.getAttribute('data-template');
    if (templateName) {
      selectTemplate(templateName);
    }
  }
});

// The global selectTemplate function is defined in resume-fixed.js