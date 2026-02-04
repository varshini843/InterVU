// Template display functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Template display script loaded');
  
  // Select the first template by default
  const firstTemplate = document.querySelector('.template-item');
  if (firstTemplate) {
    const templateName = firstTemplate.getAttribute('data-template');
    if (templateName) {
      selectTemplate(templateName);
    }
  }
});

// Global function for template selection
function selectTemplate(templateName) {
  console.log('Selecting template:', templateName);
  
  try {
    // First, hide all templates
    document.querySelectorAll('.resume-template').forEach(template => {
      template.style.display = 'none';
      template.style.opacity = '0';
      template.style.position = 'absolute';
      template.style.zIndex = '1';
      template.classList.remove('active');
    });
    
    // Remove active class from all template items
    document.querySelectorAll('.template-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected template item
    const templateItem = document.querySelector(`.template-item[data-template="${templateName}"]`);
    if (templateItem) {
      templateItem.classList.add('active');
    } else {
      console.error(`Template item with data-template="${templateName}" not found`);
    }
    
    // Show the selected template
    const templateElement = document.getElementById(`template-${templateName}`);
    if (templateElement) {
      // Force display with !important-like priority
      templateElement.classList.add('active');
      
      // Apply styles directly to ensure template is visible
      templateElement.style.display = 'block';
      templateElement.style.opacity = '1';
      templateElement.style.position = 'relative';
      templateElement.style.zIndex = '2';
      
      // Add a class to the body to indicate which template is active
      document.body.className = document.body.className.replace(/template-active-\S+/g, '');
      document.body.classList.add(`template-active-${templateName}`);
      
      console.log(`Template ${templateName} activated`);
    } else {
      console.error(`Template element with ID template-${templateName} not found`);
    }
  } catch (error) {
    console.error('Error in selectTemplate:', error);
  }
}