// resume.js - AI-powered resume builder functionality

// The selectTemplate function is now defined in template-display.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded - initializing resume builder');
  
  // Template selection
  initializeTemplateSelection();
  
  // Initialize form event listeners
  initializeFormListeners();
  
  // Initialize dynamic sections (education, experience, skills)
  initializeDynamicSections();
  
  // Initialize action buttons (download, print, share)
  initializeActionButtons();
  
  // Track resume activity
  trackResumeActivity();
});

// Initialize template selection
function initializeTemplateSelection() {
  console.log('Template selection initialized in resume-fixed.js');
  // Template selection is now handled in template-display.js
}

// Initialize form listeners
function initializeFormListeners() {
  // Add event listeners to all form inputs
  const formInputs = document.querySelectorAll('.resume-form input, .resume-form textarea, .resume-form select');
  formInputs.forEach(input => {
    input.addEventListener('input', function() {
      console.log('Form input changed:', this.id);
      updateResumePreview();
    });
  });
  
  // Add event listeners to enhance buttons
  document.querySelectorAll('.enhance-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      enhanceJobDescription(this);
    });
  });
}

// Initialize dynamic sections
function initializeDynamicSections() {
  // Experience section
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', function() {
      addDynamicItem('experienceItems', createExperienceItem);
    });
  }
  
  // Education section
  const addEducationBtn = document.getElementById('addEducationBtn');
  if (addEducationBtn) {
    addEducationBtn.addEventListener('click', function() {
      addDynamicItem('educationItems', createEducationItem);
    });
  }
  
  // Add initial items if none exist
  if (document.querySelectorAll('#experienceItems .dynamic-item').length === 0) {
    addDynamicItem('experienceItems', createExperienceItem);
  }
  
  if (document.querySelectorAll('#educationItems .dynamic-item').length === 0) {
    addDynamicItem('educationItems', createEducationItem);
  }
}

// Initialize action buttons
function initializeActionButtons() {
  // Download PDF button
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPDF);
  }
  
  // Download Image button
  const downloadImageBtn = document.getElementById('downloadImage');
  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', downloadAsImage);
  }
  
  // Print button
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', printResume);
  }
  
  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareResume);
  }
}

// Function to add a dynamic item (experience, education, etc.)
function addDynamicItem(containerId, createItemFunc) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const item = createItemFunc();
  container.appendChild(item);
  
  // Add event listeners to the new inputs
  item.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', updateResumePreview);
  });
  
  // Add event listener to remove button
  const removeBtn = item.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      container.removeChild(item);
      updateResumePreview();
    });
  }
  
  // Add event listener to enhance button
  const enhanceBtn = item.querySelector('.enhance-btn');
  if (enhanceBtn) {
    enhanceBtn.addEventListener('click', function() {
      enhanceJobDescription(this);
    });
  }
  
  // Update the preview
  updateResumePreview();
}

// Create an experience item
function createExperienceItem() {
  const item = document.createElement('div');
  item.className = 'dynamic-item';
  item.innerHTML = `
    <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
    <div class="form-group">
      <label for="jobTitle">Job Title</label>
      <input type="text" class="job-title" placeholder="e.g., Senior Developer">
    </div>
    <div class="form-group">
      <label for="company">Company</label>
      <input type="text" class="company" placeholder="e.g., Tech Solutions Inc.">
    </div>
    <div class="form-group">
      <label for="location">Location</label>
      <input type="text" class="job-location" placeholder="e.g., San Francisco, CA">
    </div>
    <div class="form-group" style="display: flex; gap: 1rem;">
      <div style="flex: 1;">
        <label for="startDate">Start Date</label>
        <input type="month" class="start-date">
      </div>
      <div style="flex: 1;">
        <label for="endDate">End Date</label>
        <input type="month" class="end-date">
      </div>
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea class="job-description" placeholder="Describe your responsibilities and achievements..."></textarea>
    </div>
    <button type="button" class="enhance-btn secondary-btn" style="width: auto; margin-top: 0.5rem;" onclick="enhanceJobDescription(this)">
      <i class="fas fa-magic"></i> Enhance with AI
    </button>
  `;
  
  // Add event listener to enhance button
  const enhanceBtn = item.querySelector('.enhance-btn');
  if (enhanceBtn) {
    enhanceBtn.addEventListener('click', function() {
      enhanceJobDescription(this);
    });
  }
  
  return item;
}

// Create an education item
function createEducationItem() {
  const item = document.createElement('div');
  item.className = 'dynamic-item';
  item.innerHTML = `
    <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
    <div class="form-group">
      <label for="degree">Degree</label>
      <input type="text" class="degree" placeholder="e.g., Bachelor of Science in Computer Science">
    </div>
    <div class="form-group">
      <label for="institution">Institution</label>
      <input type="text" class="institution" placeholder="e.g., University of California">
    </div>
    <div class="form-group">
      <label for="location">Location</label>
      <input type="text" class="edu-location" placeholder="e.g., Berkeley, CA">
    </div>
    <div class="form-group">
      <label for="startDate">Start Date</label>
      <input type="month" class="edu-start-date">
    </div>
    <div class="form-group">
      <label for="endDate">End Date</label>
      <input type="month" class="edu-end-date">
    </div>
    <div class="form-group">
      <label for="description">Description (Optional)</label>
      <textarea class="edu-description" placeholder="Additional information about your education..."></textarea>
    </div>
  `;
  return item;
}

// Function to update the resume preview
function updateResumePreview() {
  console.log('Updating resume preview...');
  const activeTemplate = document.querySelector('.resume-template.active');
  if (!activeTemplate) {
    console.error('No active template found');
    return;
  }
  
  const templateName = activeTemplate.id.replace('template-', '');
  
  // Get form values
  const fullName = document.getElementById('fullName').value || 'John Smith';
  const jobTitle = document.getElementById('jobTitle').value || 'Software Engineer';
  const email = document.getElementById('email').value || 'john@example.com';
  const phone = document.getElementById('phone').value || '(123) 456-7890';
  const location = document.getElementById('location').value || 'New York, NY';
  const website = document.getElementById('website').value || 'linkedin.com/in/johnsmith';
  const summary = document.getElementById('summary').value || 'Experienced software engineer with 5+ years of experience in full-stack development. Proficient in JavaScript, React, and Node.js. Passionate about creating efficient, scalable, and user-friendly applications.';
  
  // Get skills
  const skillsInput = document.getElementById('skills').value;
  const skills = skillsInput ? skillsInput.split(',').map(skill => skill.trim()) : 
              ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git', 'SQL'];
  
  // Get experience items
  const experienceItems = [];
  document.querySelectorAll('#experienceItems .dynamic-item').forEach(item => {
    const jobTitle = item.querySelector('.job-title')?.value;
    const company = item.querySelector('.company')?.value;
    const location = item.querySelector('.job-location')?.value;
    const startDate = item.querySelector('.start-date')?.value;
    const endDate = item.querySelector('.end-date')?.value;
    const description = item.querySelector('.job-description')?.value;
    
    if (jobTitle || company) {
      experienceItems.push({
        jobTitle: jobTitle || 'Job Title',
        company: company || 'Company Name',
        location: location || 'Location',
        startDate: startDate ? formatDate(startDate) : 'Jan 2020',
        endDate: endDate ? formatDate(endDate) : 'Present',
        description: description || 'Job description goes here.'
      });
    }
  });
  
  // If no experience items were added, use default
  if (experienceItems.length === 0) {
    experienceItems.push({
      jobTitle: 'Senior Developer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description: 'Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.'
    });
    
    experienceItems.push({
      jobTitle: 'Web Developer',
      company: 'Digital Innovations',
      location: 'New York, NY',
      startDate: 'Mar 2018',
      endDate: 'Dec 2019',
      description: 'Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.'
    });
  }
  
  // Get education items
  const educationItems = [];
  document.querySelectorAll('#educationItems .dynamic-item').forEach(item => {
    const degree = item.querySelector('.degree')?.value;
    const institution = item.querySelector('.institution')?.value;
    const location = item.querySelector('.edu-location')?.value;
    const startDate = item.querySelector('.edu-start-date')?.value;
    const endDate = item.querySelector('.edu-end-date')?.value;
    const description = item.querySelector('.edu-description')?.value;
    
    if (degree || institution) {
      educationItems.push({
        degree: degree || 'Degree',
        institution: institution || 'Institution Name',
        location: location || 'Location',
        startDate: startDate ? formatDate(startDate) : 'Sep 2014',
        endDate: endDate ? formatDate(endDate) : 'Jun 2018',
        description: description || ''
      });
    }
  });
  
  // If no education items were added, use default
  if (educationItems.length === 0) {
    educationItems.push({
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California',
      location: 'Berkeley, CA',
      startDate: 'Sep 2014',
      endDate: 'Jun 2018',
      description: ''
    });
  }
  
  // Create data object with all form values
  const data = {
    fullName, 
    jobTitle, 
    email, 
    phone, 
    location, 
    website, 
    summary,
    skills,
    experience: experienceItems,
    education: educationItems
  };
  
  console.log('Updating template:', templateName);
  console.log('Resume data:', data);
  
  try {
    // Update personal info in the template based on template name
    switch(templateName) {
      case 'modern':
        if (typeof updateModernTemplate === 'function') {
          updateModernTemplate(activeTemplate, data);
        } else {
          console.error('updateModernTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'minimalist':
        if (typeof updateMinimalistTemplate === 'function') {
          updateMinimalistTemplate(activeTemplate, data);
        } else {
          console.error('updateMinimalistTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'creative':
        if (typeof updateCreativeTemplate === 'function') {
          updateCreativeTemplate(activeTemplate, data);
        } else {
          console.error('updateCreativeTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'traditional':
        if (typeof updateTraditionalTemplate === 'function') {
          updateTraditionalTemplate(activeTemplate, data);
        } else {
          console.error('updateTraditionalTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'colorful':
        if (typeof updateColorfulTemplate === 'function') {
          updateColorfulTemplate(activeTemplate, data);
        } else {
          console.error('updateColorfulTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'professional':
        if (typeof updateProfessionalTemplate === 'function') {
          updateProfessionalTemplate(activeTemplate, data);
        } else {
          console.error('updateProfessionalTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'elegant':
        if (typeof updateElegantTemplate === 'function') {
          updateElegantTemplate(activeTemplate, data);
        } else {
          console.error('updateElegantTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'vibrant':
        if (typeof updateVibrantTemplate === 'function') {
          updateVibrantTemplate(activeTemplate, data);
        } else {
          console.error('updateVibrantTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'executive':
        if (typeof updateExecutiveTemplate === 'function') {
          updateExecutiveTemplate(activeTemplate, data);
        } else {
          console.error('updateExecutiveTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'tech':
        if (typeof updateTechTemplate === 'function') {
          updateTechTemplate(activeTemplate, data);
        } else {
          console.error('updateTechTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'gradient':
        if (typeof updateGradientTemplate === 'function') {
          updateGradientTemplate(activeTemplate, data);
        } else {
          console.error('updateGradientTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      case 'bold':
        if (typeof updateBoldTemplate === 'function') {
          updateBoldTemplate(activeTemplate, data);
        } else {
          console.error('updateBoldTemplate function not found');
          fallbackTemplateUpdate(activeTemplate, data);
        }
        break;
      default:
        // If no specific template handler, use fallback
        console.log('Using fallback template handler for:', templateName);
        fallbackTemplateUpdate(activeTemplate, data);
    }
  } catch (error) {
    console.error('Error updating template:', error);
    fallbackTemplateUpdate(activeTemplate, data);
  }
}

// Fallback template update function in case the template-specific functions are not available
function fallbackTemplateUpdate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience.map(exp => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${exp.jobTitle}</div>
        <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      </div>
      <div class="item-subtitle">${exp.company} | ${exp.location}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('');
  
  // Create education items HTML
  const educationHTML = data.education.map(edu => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${edu.degree}</div>
        <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      </div>
      <div class="item-subtitle">${edu.institution} | ${edu.location}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('');
  
  // Create skills HTML
  const skillsHTML = data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('');
  
  template.innerHTML = `
    <div class="resume-header">
      <div>
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
      </div>
      <div class="contact-info">
        ${data.email ? `<div><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
        ${data.phone ? `<div><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
        ${data.location ? `<div><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
        ${data.website ? `<div><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Experience</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Skills</div>
      
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Helper function to format date from YYYY-MM to readable format
function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    // Format as "MMM YYYY" (e.g., "Jan 2020")
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

// Function to download the resume as PDF - completely rewritten for reliability
function downloadPDF() {
  try {
    // Store the button reference
    const downloadBtn = this;
    
    // Show loading state
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    downloadBtn.disabled = true;
    
    // Get the active template
    const activeTemplate = document.querySelector('.resume-template.active');
    if (!activeTemplate) {
      alert('Please select a template first');
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
      return;
    }
    
    // Force an update of the resume preview
    updateResumePreview();
    
    // Get the name for the PDF file
    const fullName = document.getElementById('fullName').value || 'John Smith';
    const jobTitle = document.getElementById('jobTitle').value || 'Resume';
    const fileName = `${fullName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.pdf`;
    
    // Create a clean copy of the resume for PDF generation
    const resumeContainer = document.createElement('div');
    resumeContainer.style.width = '8.5in';
    resumeContainer.style.minHeight = '11in';
    resumeContainer.style.padding = '0.5in';
    resumeContainer.style.backgroundColor = 'white';
    resumeContainer.style.position = 'absolute';
    resumeContainer.style.left = '-9999px';
    resumeContainer.style.top = '0';
    
    // Clone the template
    const templateClone = activeTemplate.cloneNode(true);
    templateClone.style.display = 'block';
    templateClone.style.position = 'relative';
    templateClone.style.width = '100%';
    templateClone.style.height = 'auto';
    templateClone.style.opacity = '1';
    templateClone.style.visibility = 'visible';
    
    // Add the template to the container
    resumeContainer.appendChild(templateClone);
    
    // Add the container to the document
    document.body.appendChild(resumeContainer);
    
    // Use dom-to-image for better rendering
    console.log('Generating PDF using dom-to-image...');
    
    // Method 1: dom-to-image to PNG, then to PDF
    domtoimage.toPng(templateClone, {
      quality: 1,
      bgcolor: 'white',
      width: templateClone.offsetWidth,
      height: templateClone.offsetHeight,
      style: {
        'transform': 'scale(1)',
        'transform-origin': 'top left'
      }
    })
    .then(function(dataUrl) {
      try {
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'letter'
        });
        
        // Calculate dimensions
        const imgWidth = 8.5 - 1; // Letter width with margins
        const imgHeight = (templateClone.offsetHeight * imgWidth) / templateClone.offsetWidth;
        
        // Add image to PDF
        pdf.addImage(dataUrl, 'PNG', 0.5, 0.5, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save(fileName);
        
        // Clean up
        document.body.removeChild(resumeContainer);
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
        console.log('PDF generated successfully');
        alert('PDF downloaded successfully!');
        
        // Track resume creation
        if (typeof trackResumeCreation === 'function') {
          trackResumeCreation();
        }
      } catch (err) {
        console.error('Error creating PDF from image:', err);
        fallbackMethod();
      }
    })
    .catch(function(error) {
      console.error('Error with dom-to-image:', error);
      fallbackMethod();
    });
    
    // Fallback method if dom-to-image fails
    function fallbackMethod() {
      console.log('Using fallback method with html2canvas...');
      
      // Method 2: html2canvas to PDF
      html2canvas(templateClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: true
      }).then(function(canvas) {
        try {
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
          });
          
          // Calculate dimensions
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = 8.5 - 1; // Letter width with margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image to PDF
          pdf.addImage(imgData, 'JPEG', 0.5, 0.5, imgWidth, imgHeight);
          
          // Save the PDF
          pdf.save(fileName);
          
          // Clean up
          document.body.removeChild(resumeContainer);
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
          
          console.log('PDF generated successfully with fallback method');
          alert('PDF downloaded successfully!');
          
          // Track resume creation
          if (typeof trackResumeCreation === 'function') {
            trackResumeCreation();
          }
        } catch (err) {
          console.error('Error creating PDF from canvas:', err);
          finalFallback();
        }
      }).catch(function(error) {
        console.error('Error with html2canvas:', error);
        finalFallback();
      });
    }
    
    // Final fallback - direct print to PDF
    function finalFallback() {
      console.log('Using final fallback method - print to PDF');
      
      try {
        // Create a print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Please allow pop-ups to download your resume as PDF');
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
          document.body.removeChild(resumeContainer);
          return;
        }
        
        // Get all styles from the current page
        let styles = '';
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            const sheet = document.styleSheets[i];
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (let j = 0; j < rules.length; j++) {
                styles += rules[j].cssText + '\n';
              }
            }
          } catch (e) {
            console.warn('Could not access stylesheet rules:', e);
          }
        }
        
        // Write the content to the new window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${fileName}</title>
            <style>
              ${styles}
              body { margin: 0; padding: 0.5in; background: white; }
              .print-container { width: 7.5in; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${templateClone.outerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 500);
              };
            </script>
          </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Clean up
        document.body.removeChild(resumeContainer);
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
        alert('Please use the browser\'s "Save as PDF" option in the print dialog that opens.');
      } catch (err) {
        console.error('Error with final fallback method:', err);
        alert('Could not generate PDF. Please try using the Print button instead.');
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        document.body.removeChild(resumeContainer);
      }
    }
  } catch (error) {
    console.error('Error in PDF download:', error);
    alert('There was an error generating your PDF. Please try again or use the Print button instead.');
    this.innerHTML = originalText;
    this.disabled = false;
  }
}

// Function to print the resume - improved for reliability
function printResume() {
  try {
    // Store the button reference
    const printBtn = this;
    
    // Show loading state
    const originalText = printBtn.innerHTML;
    printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    printBtn.disabled = true;
    
    const activeTemplate = document.querySelector('.resume-template.active');
    if (!activeTemplate) {
      alert('Please select a template first');
      printBtn.innerHTML = originalText;
      printBtn.disabled = false;
      return;
    }
    
    // Force an update of the resume preview
    updateResumePreview();
    
    // Clone the template to avoid modifying the original
    const templateClone = activeTemplate.cloneNode(true);
    
    // Make sure all styles are applied
    templateClone.style.display = 'block';
    templateClone.style.opacity = '1';
    templateClone.style.position = 'relative';
    templateClone.style.visibility = 'visible';
    
    // Create a container with white background for printing
    const container = document.createElement('div');
    container.style.background = 'white';
    container.style.padding = '20px';
    container.style.width = '100%';
    container.style.maxWidth = '8.5in';
    container.style.margin = '0 auto';
    container.appendChild(templateClone);
    
    // Get all styles from the current page
    let styles = '';
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            styles += rules[j].cssText + '\n';
          }
        }
      } catch (e) {
        console.warn('Could not access stylesheet rules:', e);
      }
    }
    
    // Additional print-specific styles
    const printStyles = `
      @media print {
        body {
          padding: 0;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .resume-template {
          width: 100%;
          height: auto;
          box-shadow: none !important;
        }
        @page {
          size: letter portrait;
          margin: 0.5in;
        }
      }
      body {
        font-family: 'Poppins', sans-serif;
        background: white;
        margin: 0;
        padding: 0.5in;
      }
      .print-container {
        width: 8.5in;
        max-width: 100%;
        margin: 0 auto;
        background: white;
      }
      .resume-template {
        display: block !important;
        opacity: 1 !important;
        position: relative !important;
        visibility: visible !important;
        width: 100%;
        height: auto;
      }
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print your resume');
      printBtn.innerHTML = originalText;
      printBtn.disabled = false;
      return;
    }
    
    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Resume</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          ${styles}
          ${printStyles}
        </style>
      </head>
      <body>
        <div class="print-container">
          ${container.outerHTML}
        </div>
        <script>
          window.onload = function() {
            // Add a delay to ensure all resources are loaded
            setTimeout(function() {
              window.print();
              // Add another delay before closing to ensure print dialog appears
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Track resume creation
    if (typeof trackResumeCreation === 'function') {
      trackResumeCreation();
    }
    
    // Reset button state
    setTimeout(() => {
      printBtn.innerHTML = originalText;
      printBtn.disabled = false;
    }, 1500);
  } catch (error) {
    console.error('Error in print functionality:', error);
    alert('There was an error preparing the print view. Please try again.');
    this.innerHTML = originalText;
    this.disabled = false;
  }
}

// Function to download resume as image
function downloadAsImage() {
  try {
    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    this.disabled = true;
    
    // Get the active template
    const activeTemplate = document.querySelector('.resume-template.active');
    if (!activeTemplate) {
      alert('Please select a template first');
      this.innerHTML = originalText;
      this.disabled = false;
      return;
    }
    
    // Force an update of the resume preview
    updateResumePreview();
    
    // Get the name for the image file
    const fullName = document.getElementById('fullName').value || 'John Smith';
    const jobTitle = document.getElementById('jobTitle').value || 'Resume';
    const fileName = `${fullName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.png`;
    
    // Use dom-to-image to convert the template to an image
    domtoimage.toPng(activeTemplate, {
      quality: 1,
      bgcolor: 'white',
      style: {
        'transform': 'scale(1)',
        'transform-origin': 'top left'
      }
    })
    .then(function(dataUrl) {
      // Create a download link
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      // Reset button
      const downloadImageBtn = document.getElementById('downloadImage');
      if (downloadImageBtn) {
        downloadImageBtn.innerHTML = originalText;
        downloadImageBtn.disabled = false;
      }
      
      // Track resume creation
      if (typeof trackResumeCreation === 'function') {
        trackResumeCreation();
      }
    })
    .catch(function(error) {
      console.error('Error generating image:', error);
      
      // Try fallback method with html2canvas
      html2canvas(activeTemplate, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: true
      }).then(function(canvas) {
        // Convert canvas to data URL
        const imgData = canvas.toDataURL('image/png');
        
        // Create a download link
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imgData;
        link.click();
        
        // Reset button
        const downloadImageBtn = document.getElementById('downloadImage');
        if (downloadImageBtn) {
          downloadImageBtn.innerHTML = originalText;
          downloadImageBtn.disabled = false;
        }
        
        // Track resume creation
        if (typeof trackResumeCreation === 'function') {
          trackResumeCreation();
        }
      }).catch(function(err) {
        console.error('Error with fallback image generation:', err);
        alert('Could not generate image. Please try another format.');
        
        // Reset button
        const downloadImageBtn = document.getElementById('downloadImage');
        if (downloadImageBtn) {
          downloadImageBtn.innerHTML = originalText;
          downloadImageBtn.disabled = false;
        }
      });
    });
  } catch (error) {
    console.error('Error in image download:', error);
    alert('There was an error generating your image. Please try again.');
    this.innerHTML = originalText;
    this.disabled = false;
  }
}

// Function to share the resume
function shareResume() {
  try {
    const activeTemplate = document.querySelector('.resume-template.active');
    if (!activeTemplate) {
      alert('Please select a template first');
      return;
    }
    
    // In a real app, this would generate a shareable link
    // For now, we'll just show a modal with a fake link
    const shareLink = 'https://intervu.app/resume/share/' + Math.random().toString(36).substring(2, 8);
    
    // Create a temporary input to copy the link
    const tempInput = document.createElement('input');
    tempInput.value = shareLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert(`Resume sharing link generated: ${shareLink}\n\nThis link has been copied to your clipboard.`);
    
    // Track resume creation
    if (typeof trackResumeCreation === 'function') {
      trackResumeCreation();
    }
  } catch (error) {
    console.error('Error in share functionality:', error);
    alert('There was an error sharing your resume. Please try again.');
  }
}

// Function to track resume creation
function trackResumeCreation() {
  console.log('Resume created/updated at:', new Date().toISOString());
  // In a real app, this would send analytics data to a server
}

// Function to enhance job description with AI
function enhanceJobDescription(button) {
  // Get the job description textarea
  const jobDescriptionTextarea = button.closest('.dynamic-item').querySelector('.job-description');
  if (!jobDescriptionTextarea) {
    console.error('Job description textarea not found');
    return;
  }
  
  // Get the current job description
  const currentDescription = jobDescriptionTextarea.value.trim();
  if (!currentDescription) {
    alert('Please enter a job description first');
    return;
  }
  
  // Get the job title and company
  const jobTitle = button.closest('.dynamic-item').querySelector('.job-title').value || 'Job Title';
  const company = button.closest('.dynamic-item').querySelector('.company').value || 'Company';
  
  // Show loading state
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
  button.disabled = true;
  
  // In a real app, this would call an AI service
  // For now, we'll just simulate it with a timeout
  setTimeout(() => {
    // Generate an enhanced description
    const enhancedDescription = generateEnhancedDescription(currentDescription, jobTitle, company);
    
    // Update the textarea
    jobDescriptionTextarea.value = enhancedDescription;
    
    // Reset button
    button.innerHTML = originalText;
    button.disabled = false;
    
    // Update the preview
    updateResumePreview();
    
    // Show success message
    alert('Job description enhanced successfully!');
  }, 1500);
}

// Helper function to generate an enhanced job description
function generateEnhancedDescription(currentDescription, jobTitle, company) {
  // In a real app, this would use an AI service
  // For now, we'll just add some professional language
  
  // Split the description into bullet points if it's not already
  let points = currentDescription.split(/\\n|\\r\\n|\\r/);
  if (points.length === 1) {
    // Try to split by periods
    points = currentDescription.split(/\\.\\s+/);
    if (points.length === 1 || (points.length === 2 && points[1] === '')) {
      // Just one sentence, so we'll enhance it as is
      points = [currentDescription];
    }
  }
  
  // Clean up the points
  points = points.map(point => point.trim()).filter(point => point.length > 0);
  
  // Enhance each point
  const enhancedPoints = points.map(point => {
    // Don't enhance if it already starts with a strong action verb
    if (/^(Led|Managed|Developed|Created|Implemented|Designed|Coordinated|Achieved|Increased|Reduced|Improved|Streamlined|Optimized|Launched|Spearheaded|Executed)/i.test(point)) {
      return point;
    }
    
    // Add an action verb based on the content
    if (point.toLowerCase().includes('develop') || point.toLowerCase().includes('build') || point.toLowerCase().includes('create')) {
      return `Developed ${point.charAt(0).toLowerCase() + point.slice(1)}`;
    } else if (point.toLowerCase().includes('manage') || point.toLowerCase().includes('lead') || point.toLowerCase().includes('direct')) {
      return `Led ${point.charAt(0).toLowerCase() + point.slice(1)}`;
    } else if (point.toLowerCase().includes('improve') || point.toLowerCase().includes('enhance') || point.toLowerCase().includes('optimize')) {
      return `Improved ${point.charAt(0).toLowerCase() + point.slice(1)}`;
    } else if (point.toLowerCase().includes('implement') || point.toLowerCase().includes('deploy') || point.toLowerCase().includes('launch')) {
      return `Implemented ${point.charAt(0).toLowerCase() + point.slice(1)}`;
    } else {
      // Default enhancement
      return `Successfully executed ${point.charAt(0).toLowerCase() + point.slice(1)}`;
    }
  });
  
  // Add some quantifiable achievements if none exist
  if (!currentDescription.match(/\\d+%|\\d+ percent|increased|decreased|reduced|improved|grew|expanded/i)) {
    enhancedPoints.push(`Improved team productivity by 20% through implementation of streamlined workflows and processes.`);
    enhancedPoints.push(`Reduced project delivery time by 15% while maintaining high quality standards.`);
  }
  
  // Add a collaboration point if none exists
  if (!currentDescription.match(/team|collaborate|cross-functional|partner|work with/i)) {
    enhancedPoints.push(`Collaborated effectively with cross-functional teams to ensure successful project delivery.`);
  }
  
  // Join the points with line breaks
  return enhancedPoints.join('\\n');
}

// Function to track resume creation
function trackResumeCreation() {
  console.log('Resume created/updated at:', new Date().toISOString());
  
  // Get existing stats
  const userStats = JSON.parse(localStorage.getItem('userStats')) || {
    interviewSessions: 0,
    chatbotInteractions: 0,
    totalPracticeTime: 0,
    resumesCreated: 0
  };
  
  // Increment resume count
  userStats.resumesCreated++;
  
  // Save updated stats
  localStorage.setItem('userStats', JSON.stringify(userStats));
}

// Function to track resume activity
function trackResumeActivity() {
  // Initialize tracking timer
  let startTime = new Date().getTime();
  let activityId = Math.random().toString(36).substring(2, 15);
  
  console.log('Resume activity tracking started:', activityId);
  
  // Track when the user leaves the page
  window.addEventListener('beforeunload', function() {
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000; // in seconds
    console.log(`Resume activity ended. Duration: ${duration}s`);
    
    // Get existing stats
    const userStats = JSON.parse(localStorage.getItem('userStats')) || {
      interviewSessions: 0,
      chatbotInteractions: 0,
      totalPracticeTime: 0,
      resumesCreated: 0
    };
    
    // Add time spent
    userStats.totalPracticeTime += Math.floor(duration / 60);
    
    // Save updated stats
    localStorage.setItem('userStats', JSON.stringify(userStats));
  });
}