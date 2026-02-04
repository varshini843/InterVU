// Consolidated resume template functionality

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded - initializing resume builder');
  
  // Initialize template selection
  initializeTemplateSelection();
  
  // Initialize form event listeners
  initializeFormListeners();
  
  // Initialize dynamic sections (education, experience, skills)
  initializeDynamicSections();
  
  // Initialize action buttons (download, print, share)
  initializeActionButtons();
});

// Initialize template selection
function initializeTemplateSelection() {
  console.log('Initializing template selection');
  
  // Add click event listeners to all template items
  document.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', function() {
      const templateName = this.getAttribute('data-template');
      if (templateName) {
        console.log('Template clicked:', templateName);
        selectTemplate(templateName);
      }
    });
  });
  
  // Select the first template by default
  const firstTemplate = document.querySelector('.template-item');
  if (firstTemplate) {
    const templateName = firstTemplate.getAttribute('data-template');
    if (templateName) {
      selectTemplate(templateName);
    }
  }
}

// Global function for template selection (accessible from HTML)
function selectTemplate(templateName) {
  console.log('Selecting template:', templateName);
  
  // Remove active class from all templates
  document.querySelectorAll('.template-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.resume-template').forEach(t => t.classList.remove('active'));
  
  // Add active class to selected template
  const templateItem = document.querySelector(`.template-item[data-template="${templateName}"]`);
  if (templateItem) {
    templateItem.classList.add('active');
  } else {
    console.error(`Template item with data-template="${templateName}" not found`);
  }
  
  const templateElement = document.getElementById(`template-${templateName}`);
  if (templateElement) {
    templateElement.classList.add('active');
    console.log(`Template ${templateName} activated`);
    
    // Make sure the template is visible
    templateElement.style.display = 'block';
    templateElement.style.opacity = '1';
    templateElement.style.position = 'relative';
    templateElement.style.zIndex = '2';
  } else {
    console.error(`Template element with ID template-${templateName} not found`);
  }
}

// Initialize form listeners
function initializeFormListeners() {
  // Add event listeners to all form inputs
  const formInputs = document.querySelectorAll('.resume-form input, .resume-form textarea, .resume-form select');
  formInputs.forEach(input => {
    input.addEventListener('input', function() {
      console.log('Form input changed:', this.id);
    });
  });
}

// Initialize dynamic sections
function initializeDynamicSections() {
  // Experience section
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', function() {
      console.log('Add experience clicked');
    });
  }
  
  // Education section
  const addEducationBtn = document.getElementById('addEducationBtn');
  if (addEducationBtn) {
    addEducationBtn.addEventListener('click', function() {
      console.log('Add education clicked');
    });
  }
}

// Initialize action buttons
function initializeActionButtons() {
  // Download PDF button
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      console.log('Download PDF clicked');
    });
  }
  
  // Print button
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      console.log('Print clicked');
      window.print();
    });
  }
  
  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      console.log('Share clicked');
    });
  }
}