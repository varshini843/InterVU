// Simple template selector script
document.addEventListener('DOMContentLoaded', function() {
  console.log('Template selector script loaded');
  
  // Add click handlers to all template items
  const templateItems = document.querySelectorAll('.template-item');
  templateItems.forEach(item => {
    item.addEventListener('click', function() {
      const templateName = this.getAttribute('data-template');
      console.log('Template clicked:', templateName);
      switchTemplate(templateName);
    });
  });
  
  // Function to switch templates
  function switchTemplate(templateName) {
    console.log('Switching to template:', templateName);
    
    // Remove active class from all templates
    document.querySelectorAll('.template-item').forEach(item => {
      item.classList.remove('active');
    });
    
    document.querySelectorAll('.resume-template').forEach(template => {
      template.classList.remove('active');
    });
    
    // Add active class to selected template
    const selectedItem = document.querySelector(`.template-item[data-template="${templateName}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
    
    const selectedTemplate = document.getElementById(`template-${templateName}`);
    if (selectedTemplate) {
      selectedTemplate.classList.add('active');
    }
    
    // Update the preview if the function exists
    if (typeof updateResumePreview === 'function') {
      updateResumePreview();
    }
  }
  
  // Add direct click handlers to each template item
  document.getElementById('modern-template').onclick = function() { switchTemplate('modern'); };
  document.getElementById('minimalist-template').onclick = function() { switchTemplate('minimalist'); };
  document.getElementById('creative-template').onclick = function() { switchTemplate('creative'); };
  document.getElementById('traditional-template').onclick = function() { switchTemplate('traditional'); };
  document.getElementById('elegant-template').onclick = function() { switchTemplate('elegant'); };
  document.getElementById('vibrant-template').onclick = function() { switchTemplate('vibrant'); };
  document.getElementById('executive-template').onclick = function() { switchTemplate('executive'); };
  document.getElementById('tech-template').onclick = function() { switchTemplate('tech'); };
  document.getElementById('gradient-template').onclick = function() { switchTemplate('gradient'); };
  document.getElementById('bold-template').onclick = function() { switchTemplate('bold'); };
});

// Global function for template selection
function selectTemplate(templateName) {
  console.log('Global selectTemplate called with:', templateName);
  
  // First, hide all templates with a transition
  document.querySelectorAll('.resume-template').forEach(template => {
    if (template.classList.contains('active')) {
      template.style.opacity = '0';
    }
  });
  
  // Remove active class from all template items and buttons
  document.querySelectorAll('.template-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected template item and button
  const selectedItem = document.querySelector(`.template-item[data-template="${templateName}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }
  
  const selectedBtn = document.querySelector(`.template-btn[data-template="${templateName}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
  
  // Wait a short time for the fade-out transition
  setTimeout(() => {
    // Remove active class from all templates
    document.querySelectorAll('.resume-template').forEach(template => {
      template.classList.remove('active');
      template.style.opacity = '0';
    });
    
    // Add active class to selected template
    const selectedTemplate = document.getElementById(`template-${templateName}`);
    if (selectedTemplate) {
      selectedTemplate.classList.add('active');
      
      // Force template population with sample data if empty
      if (selectedTemplate.innerHTML.trim() === '' || 
          selectedTemplate.innerHTML.includes('Template content will be populated dynamically')) {
        
        // Get form values or use defaults
        const fullName = document.getElementById('fullName')?.value || 'John Smith';
        const jobTitle = document.getElementById('jobTitle')?.value || 'Software Engineer';
        const email = document.getElementById('email')?.value || 'john@example.com';
        const phone = document.getElementById('phone')?.value || '(123) 456-7890';
        const location = document.getElementById('location')?.value || 'New York, NY';
        const website = document.getElementById('website')?.value || 'linkedin.com/in/johnsmith';
        const summary = document.getElementById('summary')?.value || 'Experienced software engineer with 5+ years of experience in full-stack development. Proficient in JavaScript, React, and Node.js. Passionate about creating efficient, scalable, and user-friendly applications.';
        
        // Create data object
        const data = { fullName, jobTitle, email, phone, location, website, summary };
        
        // Call the appropriate update function based on template name
        switch(templateName) {
          case 'modern':
            if (typeof updateModernTemplate === 'function') updateModernTemplate(selectedTemplate, data);
            break;
          case 'minimalist':
            if (typeof updateMinimalistTemplate === 'function') updateMinimalistTemplate(selectedTemplate, data);
            break;
          case 'creative':
            if (typeof updateCreativeTemplate === 'function') updateCreativeTemplate(selectedTemplate, data);
            break;
          case 'traditional':
            if (typeof updateTraditionalTemplate === 'function') updateTraditionalTemplate(selectedTemplate, data);
            break;
          case 'elegant':
            if (typeof updateElegantTemplate === 'function') updateElegantTemplate(selectedTemplate, data);
            break;
          case 'vibrant':
            if (typeof updateVibrantTemplate === 'function') updateVibrantTemplate(selectedTemplate, data);
            break;
          case 'executive':
            if (typeof updateExecutiveTemplate === 'function') updateExecutiveTemplate(selectedTemplate, data);
            break;
          case 'tech':
            if (typeof updateTechTemplate === 'function') updateTechTemplate(selectedTemplate, data);
            break;
          case 'gradient':
            if (typeof updateGradientTemplate === 'function') updateGradientTemplate(selectedTemplate, data);
            break;
          case 'bold':
            if (typeof updateBoldTemplate === 'function') updateBoldTemplate(selectedTemplate, data);
            break;
          default:
            // Fallback to a simple template
            selectedTemplate.innerHTML = `
              <div class="resume-header">
                <div class="name">${fullName}</div>
                <div class="title">${jobTitle}</div>
                <div class="contact-info">
                  <div>${email}</div>
                  <div>${phone}</div>
                  <div>${location}</div>
                  <div>${website}</div>
                </div>
              </div>
              <div class="section">
                <div class="section-title">Summary</div>
                <p>${summary}</p>
              </div>
              <div class="section">
                <div class="section-title">Experience</div>
                <div class="item">
                  <div class="item-title">Senior Developer</div>
                  <div class="item-subtitle">Tech Solutions Inc.</div>
                  <div class="item-date">Jan 2020 - Present</div>
                  <div class="item-description">Led a team of 5 developers in building a customer-facing web application.</div>
                </div>
              </div>
            `;
        }
      }
      
      // Fade in the selected template
      setTimeout(() => {
        selectedTemplate.style.opacity = '1';
      }, 50);
      
      // Update the preview if the function exists
      if (typeof updateResumePreview === 'function') {
        updateResumePreview();
      }
    } else {
      console.error(`Template element with ID template-${templateName} not found`);
      alert(`Error: Could not find template "${templateName}". Please try another template.`);
    }
  }, 150); // Short delay for the transition
}