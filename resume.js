// resume.js - AI-powered resume builder functionality

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
    // Update preview
    if (typeof updateResumePreview === 'function') {
      setTimeout(updateResumePreview, 100); // Add a small delay to ensure DOM updates
    } else {
      console.error('updateResumePreview function not found');
    }
  } else {
    console.error(`Template element with ID template-${templateName} not found`);
  }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Template selection
  initializeTemplateSelection();
  
  // Function to initialize template selection
  function initializeTemplateSelection() {
    const templateItems = document.querySelectorAll('.template-item');
    const resumeTemplates = document.querySelectorAll('.resume-template');
    
    // Add a delegated event listener to the parent container
    const templatesGrid = document.querySelector('.templates-grid');
    if (templatesGrid) {
      templatesGrid.addEventListener('click', function(event) {
        // Find the closest template-item if clicked on a child element
        const templateItem = event.target.closest('.template-item');
        if (!templateItem) return; // Not clicking on a template item
        
        // Remove active class from all templates
        document.querySelectorAll('.template-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.resume-template').forEach(t => t.classList.remove('active'));
        
        // Add active class to selected template
        templateItem.classList.add('active');
        const templateName = templateItem.getAttribute('data-template');
        const templateElement = document.getElementById(`template-${templateName}`);
        
        if (templateElement) {
          templateElement.classList.add('active');
          // Update preview
          updateResumePreview();
        } else {
          console.error(`Template element with ID template-${templateName} not found`);
        }
      });
    }
    
    // Also initialize individual click handlers for backward compatibility
    templateItems.forEach(item => {
      // Remove existing event listener if any
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      // Add event listener
      newItem.addEventListener('click', function() {
        // Remove active class from all templates
        document.querySelectorAll('.template-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.resume-template').forEach(t => t.classList.remove('active'));
        
        // Add active class to selected template
        this.classList.add('active');
        const templateName = this.getAttribute('data-template');
        const templateElement = document.getElementById(`template-${templateName}`);
        
        if (templateElement) {
          templateElement.classList.add('active');
          // Update preview
          updateResumePreview();
        } else {
          console.error(`Template element with ID template-${templateName} not found`);
        }
      });
    });
  }
  
  // Add experience item
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  const experienceItems = document.getElementById('experienceItems');
  
  addExperienceBtn.addEventListener('click', function() {
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
      <button class="remove-item"><i class="fas fa-times"></i></button>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="job-title" placeholder="e.g. Senior Developer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" class="company" placeholder="e.g. Tech Solutions Inc.">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" class="job-location" placeholder="e.g. San Francisco, CA">
      </div>
      <div class="form-group" style="display: flex; gap: 1rem;">
        <div style="flex: 1;">
          <label>Start Date</label>
          <input type="month" class="start-date">
        </div>
        <div style="flex: 1;">
          <label>End Date</label>
          <input type="month" class="end-date">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="job-description" placeholder="Describe your responsibilities and achievements..."></textarea>
      </div>
      <button class="enhance-btn secondary-btn" style="width: auto; margin-top: 0.5rem;">
        <i class="fas fa-magic"></i> Enhance with AI
      </button>
    `;
    experienceItems.appendChild(newItem);
    
    // Add event listener to the new remove button
    const removeBtn = newItem.querySelector('.remove-item');
    removeBtn.addEventListener('click', function() {
      experienceItems.removeChild(newItem);
      updateResumePreview();
    });
    
    // Add event listeners to inputs for live preview
    const inputs = newItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', updateResumePreview);
    });
    
    // Add event listener to enhance button
    const enhanceBtn = newItem.querySelector('.enhance-btn');
    enhanceBtn.addEventListener('click', function() {
      enhanceJobDescription(this);
    });
    
    updateResumePreview();
  });
  
  // Add education item
  const addEducationBtn = document.getElementById('addEducationBtn');
  const educationItems = document.getElementById('educationItems');
  
  addEducationBtn.addEventListener('click', function() {
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
      <button class="remove-item"><i class="fas fa-times"></i></button>
      <div class="form-group">
        <label>Degree</label>
        <input type="text" class="degree" placeholder="e.g. Bachelor of Science in Computer Science">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" class="institution" placeholder="e.g. University of California">
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" class="edu-location" placeholder="e.g. Berkeley, CA">
      </div>
      <div class="form-group" style="display: flex; gap: 1rem;">
        <div style="flex: 1;">
          <label>Start Date</label>
          <input type="month" class="edu-start-date">
        </div>
        <div style="flex: 1;">
          <label>End Date</label>
          <input type="month" class="edu-end-date">
        </div>
      </div>
      <div class="form-group">
        <label>Description (Optional)</label>
        <textarea class="edu-description" placeholder="Relevant coursework, achievements, etc..."></textarea>
      </div>
    `;
    educationItems.appendChild(newItem);
    
    // Add event listener to the new remove button
    const removeBtn = newItem.querySelector('.remove-item');
    removeBtn.addEventListener('click', function() {
      educationItems.removeChild(newItem);
      updateResumePreview();
    });
    
    // Add event listeners to inputs for live preview
    const inputs = newItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', updateResumePreview);
    });
    
    updateResumePreview();
  });
  
  // Remove item event listeners for initial items
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.parentElement;
      const container = item.parentElement;
      container.removeChild(item);
      updateResumePreview();
    });
  });
  
  // Add event listeners to enhance buttons for initial items
  document.querySelectorAll('.enhance-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      enhanceJobDescription(this);
    });
  });
  
  // Live preview update for all inputs
  const allInputs = document.querySelectorAll('input, textarea, select');
  allInputs.forEach(input => {
    input.addEventListener('input', updateResumePreview);
  });
  
  // Track resume activity
  trackResumeActivity();
  
  // PDF Download functionality
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      try {
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
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
        
        // Clone the template to avoid modifying the original
        const templateClone = activeTemplate.cloneNode(true);
        
        // Make sure all styles are applied
        templateClone.style.display = 'block';
        templateClone.style.opacity = '1';
        templateClone.style.position = 'relative';
        
        // Create a container with white background for PDF
        const container = document.createElement('div');
        container.style.background = 'white';
        container.style.padding = '20px';
        container.style.width = '8.5in';
        container.style.minHeight = '11in';
        container.appendChild(templateClone);
        
        // Temporarily append to document (hidden)
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        // Get the name for the PDF file
        const fullName = document.getElementById('fullName').value || 'John Smith';
        const jobTitle = document.getElementById('jobTitle').value || 'Resume';
        const fileName = `${fullName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.pdf`;
        
        console.log('Generating PDF with html2pdf...');
        
        // Make sure html2pdf is loaded
        if (typeof html2pdf === 'undefined') {
          console.error('html2pdf is not defined');
          // Try to load it dynamically
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = function() {
            console.log('html2pdf loaded dynamically');
            generatePDF();
          };
          script.onerror = function() {
            console.error('Failed to load html2pdf dynamically');
            alert('PDF generation library could not be loaded. Please refresh the page and try again.');
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            document.body.removeChild(container);
          };
          document.head.appendChild(script);
          return;
        }
        
        generatePDF();
        
        function generatePDF() {
          // Generate PDF with html2pdf
          const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              useCORS: true,
              logging: true,
              letterRendering: true
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          // Add a small delay to ensure all styles are applied
          setTimeout(() => {
            html2pdf().from(container).set(opt).save()
              .then(() => {
                // Remove the temporary container
                document.body.removeChild(container);
                
                // Reset button
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                
                // Track resume creation
                if (typeof trackResumeCreation === 'function') {
                  trackResumeCreation();
                }
                
                alert('PDF downloaded successfully!');
              })
              .catch(err => {
                console.error('Error generating PDF:', err);
                alert('There was an error generating your PDF. Please try again.');
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                document.body.removeChild(container);
              });
          }, 500);
        }
      } catch (error) {
        console.error('Error in PDF download:', error);
        alert('There was an error generating your PDF. Please try again.');
        this.innerHTML = originalText;
        this.disabled = false;
      }
    });
  }
  
  // Print functionality
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      try {
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        this.disabled = true;
        
        const activeTemplate = document.querySelector('.resume-template.active');
        if (!activeTemplate) {
          alert('Please select a template first');
          this.innerHTML = originalText;
          this.disabled = false;
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
        
        // Create a container with white background for printing
        const container = document.createElement('div');
        container.style.background = 'white';
        container.style.padding = '20px';
        container.style.width = '100%';
        container.style.maxWidth = '8.5in';
        container.style.margin = '0 auto';
        container.appendChild(templateClone);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Add a small delay to ensure all styles are applied
        setTimeout(() => {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Resume</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <style>
                  body {
                    font-family: 'Poppins', sans-serif;
                    margin: 0;
                    padding: 0;
                  }
                  .resume-template {
                    display: block !important;
                    opacity: 1 !important;
                    position: relative !important;
                  }
                  @media print {
                    body {
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                  }
                  ${Array.from(document.styleSheets)
                    .filter(sheet => !sheet.href || sheet.href.includes(window.location.origin))
                    .map(sheet => {
                      try {
                        return Array.from(sheet.cssRules)
                          .map(rule => rule.cssText)
                          .join('\n');
                      } catch (e) {
                        console.warn('Cannot access stylesheet rules');
                        return '';
                      }
                    })
                    .join('\n')}
                </style>
              </head>
              <body>
                ${container.outerHTML}
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                      window.close();
                    }, 1000);
                  };
                </script>
              </body>
            </html>
          `);
          
          printWindow.document.close();
          
          // Track resume creation in user stats
          if (typeof trackResumeCreation === 'function') {
            trackResumeCreation();
          }
          
          // Reset button state
          setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
          }, 1500);
        }, 500);
      } catch (error) {
        console.error('Error in print functionality:', error);
        alert('There was an error preparing the print view. Please try again.');
        this.innerHTML = originalText;
        this.disabled = false;
      }
    });
  }
  
  // Share functionality
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      const activeTemplate = document.querySelector('.resume-template.active');
      if (!activeTemplate) {
        alert('Please select a template first');
        return;
      }
      
      // In a real app, this would generate a shareable link
      // For now, we'll just show a modal with a fake link
      alert('Resume sharing link generated: https://intervu.app/resume/share/abc123\n\nThis link has been copied to your clipboard.');
      
      // Track resume creation in user stats
      trackResumeCreation();
    });
  }

// Function to track resume activity
function trackResumeActivity() {
  // Initialize tracking timer
  let startTime = new Date().getTime();
  let activityId = Math.random().toString(36).substring(2, 15);
  
  console.log('Resume activity tracking started:', activityId);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  // Get user activity data
  let userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
  if (!userData) return;
  
  // Add a new resume activity
  const now = new Date().getTime();
  activityId = String(userData.resumes.length + 1);
  
  userData.resumes.push({
    id: activityId,
    timestamp: now,
    duration: 0, // Will be updated on page unload
    details: {
      template: document.querySelector('.resume-template.active')?.id.replace('template-', '') || 'modern'
    }
  });
  
  // Save updated data
  localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
  
  // Update duration periodically
  const updateInterval = setInterval(() => {
    if (!activityId) return;
    
    userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
    if (!userData) return;
    
    const activity = userData.resumes.find(item => item.id === activityId);
    if (activity) {
      activity.duration = Math.floor((new Date().getTime() - startTime) / 60000); // minutes
      localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
    }
  }, 60000); // Update every minute
  
  // Handle page unload
  window.addEventListener('beforeunload', function() {
    clearInterval(updateInterval);
    
    if (!activityId) return;
    
    userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
    if (!userData) return;
    
    const activity = userData.resumes.find(item => item.id === activityId);
    if (activity) {
      activity.duration = Math.floor((new Date().getTime() - startTime) / 60000); // minutes
      localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
    }
  });
}

// Function to track resume creation
function trackResumeCreation() {
  // Get user stats
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
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  // Get user activity data
  let userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
  if (!userData) return;
  
  // Update goals
  userData.goals.forEach(goal => {
    if (goal.category === 'resume') {
      goal.current = Math.min(userStats.resumesCreated, goal.target);
      goal.completed = goal.current >= goal.target;
      if (goal.completed && !goal.completedAt) {
        goal.completedAt = new Date().getTime();
        
        // Add notification for completed goal
        userData.notifications.push({
          id: userData.notifications.length + 1,
          type: 'success',
          title: 'Goal Completed',
          description: `Congratulations! You've completed the goal: "${goal.title}"`,
          timestamp: new Date().getTime(),
          read: false,
          actions: ['View Goals']
        });
      }
    }
  });
  
  // Update achievements
  const now = new Date();
  
  // Check for Resume Pro achievement
  if (userStats.resumesCreated >= 3) {
    const achievement = userData.lockedAchievements.find(a => a.id === 'resume_pro');
    if (achievement) {
      // Move from locked to unlocked
      userData.achievements.push({
        id: 'resume_pro',
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now.getTime(),
        icon: achievement.icon
      });
      
      // Remove from locked
      userData.lockedAchievements = userData.lockedAchievements.filter(a => a.id !== 'resume_pro');
      
      // Add notification
      userData.notifications.push({
        id: userData.notifications.length + 1,
        type: 'success',
        title: 'Achievement Unlocked',
        description: `Congratulations! You've earned the "${achievement.name}" badge.`,
        timestamp: now.getTime(),
        read: false,
        actions: ['View Achievements']
      });
    }
  }
  
  // Update progress for locked achievements
  userData.lockedAchievements.forEach(achievement => {
    if (achievement.id === 'resume_pro') {
      achievement.progress = userStats.resumesCreated;
    }
  });
  
  // Save updated data
  localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
}
  
  // Generate summary with AI
  const generateSummaryBtn = document.getElementById('generateSummaryBtn');
  generateSummaryBtn.addEventListener('click', function() {
    // In a real implementation, this would call an AI API
    // For now, we'll simulate it with a timeout
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    this.disabled = true;
    
    setTimeout(() => {
      const jobTitle = document.getElementById('jobTitle').value || 'Software Engineer';
      const skills = document.getElementById('skills').value || 'JavaScript, React, Node.js';
      
      const summaryText = `Experienced ${jobTitle} with a proven track record of developing innovative solutions. Proficient in ${skills}. Passionate about creating efficient, scalable, and user-friendly applications. Strong problem-solving abilities and excellent team collaboration skills.`;
      
      document.getElementById('summary').value = summaryText;
      updateResumePreview();
      
      this.innerHTML = '<i class="fas fa-magic"></i> Generate with AI';
      this.disabled = false;
    }, 1500);
  });
  
  // Generate skills with AI
  const generateSkillsBtn = document.getElementById('generateSkillsBtn');
  generateSkillsBtn.addEventListener('click', function() {
    // In a real implementation, this would call an AI API
    // For now, we'll simulate it with a timeout
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    this.disabled = true;
    
    setTimeout(() => {
      const jobTitle = document.getElementById('jobTitle').value || 'Software Engineer';
      
      let skillsText = '';
      if (jobTitle.toLowerCase().includes('software') || jobTitle.toLowerCase().includes('developer') || jobTitle.toLowerCase().includes('engineer')) {
        skillsText = 'JavaScript, React, Node.js, HTML/CSS, Git, SQL, RESTful APIs, Agile Methodologies, Problem Solving, Team Collaboration';
      } else if (jobTitle.toLowerCase().includes('data')) {
        skillsText = 'Python, SQL, Data Analysis, Machine Learning, Pandas, NumPy, Data Visualization, Statistical Analysis, Problem Solving, Communication';
      } else if (jobTitle.toLowerCase().includes('design')) {
        skillsText = 'UI/UX Design, Figma, Adobe Creative Suite, Wireframing, Prototyping, User Research, Visual Design, Typography, Color Theory, Responsive Design';
      } else {
        skillsText = 'Project Management, Team Leadership, Communication, Problem Solving, Microsoft Office, Data Analysis, Strategic Planning, Time Management';
      }
      
      document.getElementById('skills').value = skillsText;
      updateResumePreview();
      
      this.innerHTML = '<i class="fas fa-magic"></i> Suggest Skills with AI';
      this.disabled = false;
    }, 1500);
  });
  
  // Enhance job description with AI
  function enhanceJobDescription(button) {
    // Get the parent item and the description field
    const item = button.closest('.dynamic-item');
    const descriptionField = item.querySelector('.job-description');
    const jobTitle = item.querySelector('.job-title').value || 'position';
    const company = item.querySelector('.company').value || 'company';
    
    // Save original text
    const originalText = descriptionField.value;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
    button.disabled = true;
    
    // In a real implementation, this would call an AI API
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      if (originalText.trim() === '') {
        // If no text, generate a sample description
        descriptionField.value = `Led key initiatives and projects as a ${jobTitle} at ${company}. Collaborated with cross-functional teams to deliver high-quality solutions. Improved processes and implemented best practices resulting in increased efficiency and productivity.`;
      } else {
        // If there's text, enhance it
        descriptionField.value = enhanceText(originalText, jobTitle);
      }
      
      // Update the preview
      updateResumePreview();
      
      // Reset button
      button.innerHTML = '<i class="fas fa-magic"></i> Enhance with AI';
      button.disabled = false;
    }, 1500);
  }
  
  // Helper function to enhance text
  function enhanceText(text, jobTitle) {
    // Simple enhancement: add action verbs and quantifiable results
    const actionVerbs = ['Led', 'Managed', 'Developed', 'Implemented', 'Designed', 'Created', 'Optimized', 'Streamlined'];
    const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    
    // Add quantifiable results if not present
    if (!text.includes('%') && !text.includes('increased') && !text.includes('improved')) {
      text += ` ${randomVerb} process improvements resulting in a 30% increase in efficiency.`;
    }
    
    // Add collaboration aspect if not present
    if (!text.includes('team') && !text.includes('collaborat')) {
      text += ` Collaborated with cross-functional teams to ensure successful project delivery.`;
    }
    
    // Add leadership aspect for senior positions
    if ((jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')) && 
        !text.includes('led') && !text.includes('managed')) {
      text += ` Led a team of professionals, providing mentorship and technical guidance.`;
    }
    
    return text;
  }
  
  // Download PDF functionality is already handled in the DOMContentLoaded event listener
  
  // Print resume functionality is already handled in the DOMContentLoaded event listener
  
  // Share resume
  // Share button is already handled in the DOMContentLoaded event listener
  
  // Add section button
  const addSectionBtn = document.getElementById('addSectionBtn');
  const additionalSectionSelect = document.getElementById('additionalSection');
  
  addSectionBtn.addEventListener('click', function() {
    const sectionType = additionalSectionSelect.value;
    if (!sectionType) return;
    
    // Create a new section in the form
    const formSection = document.createElement('div');
    formSection.className = 'form-section';
    formSection.dataset.sectionType = sectionType;
    
    // Set the section title and icon based on the type
    let title, icon;
    switch (sectionType) {
      case 'projects':
        title = 'Projects';
        icon = 'fas fa-project-diagram';
        break;
      case 'certifications':
        title = 'Certifications';
        icon = 'fas fa-certificate';
        break;
      case 'languages':
        title = 'Languages';
        icon = 'fas fa-language';
        break;
      case 'awards':
        title = 'Awards & Achievements';
        icon = 'fas fa-trophy';
        break;
      case 'volunteer':
        title = 'Volunteer Experience';
        icon = 'fas fa-hands-helping';
        break;
      case 'publications':
        title = 'Publications';
        icon = 'fas fa-book';
        break;
      case 'references':
        title = 'References';
        icon = 'fas fa-user-friends';
        break;
    }
    
    formSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3><i class="${icon}"></i> ${title}</h3>
        <button class="remove-section" style="background: none; border: none; color: #ff4d6d; cursor: pointer;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Add appropriate fields based on section type
    const dynamicSection = document.createElement('div');
    dynamicSection.className = 'dynamic-section';
    dynamicSection.id = `${sectionType}Items`;
    
    let itemHTML = '';
    switch (sectionType) {
      case 'projects':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" class="project-name" placeholder="e.g. E-commerce Website">
            </div>
            <div class="form-group">
              <label>Role</label>
              <input type="text" class="project-role" placeholder="e.g. Lead Developer">
            </div>
            <div class="form-group" style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label>Start Date</label>
                <input type="month" class="project-start-date">
              </div>
              <div style="flex: 1;">
                <label>End Date</label>
                <input type="month" class="project-end-date">
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="project-description" placeholder="Describe the project, your role, and achievements..."></textarea>
            </div>
            <div class="form-group">
              <label>Technologies Used</label>
              <input type="text" class="project-tech" placeholder="e.g. React, Node.js, MongoDB">
            </div>
            <div class="form-group">
              <label>URL (Optional)</label>
              <input type="url" class="project-url" placeholder="e.g. https://github.com/username/project">
            </div>
          </div>
        `;
        break;
      case 'certifications':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Certification Name</label>
              <input type="text" class="cert-name" placeholder="e.g. AWS Certified Solutions Architect">
            </div>
            <div class="form-group">
              <label>Issuing Organization</label>
              <input type="text" class="cert-org" placeholder="e.g. Amazon Web Services">
            </div>
            <div class="form-group">
              <label>Date Issued</label>
              <input type="month" class="cert-date">
            </div>
            <div class="form-group">
              <label>Expiration Date (Optional)</label>
              <input type="month" class="cert-expiry">
            </div>
            <div class="form-group">
              <label>Credential ID (Optional)</label>
              <input type="text" class="cert-id" placeholder="e.g. ABC123XYZ">
            </div>
          </div>
        `;
        break;
      case 'languages':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Language</label>
              <input type="text" class="language-name" placeholder="e.g. Spanish">
            </div>
            <div class="form-group">
              <label>Proficiency Level</label>
              <select class="language-level">
                <option value="Native">Native</option>
                <option value="Fluent">Fluent</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Basic">Basic</option>
              </select>
            </div>
          </div>
        `;
        break;
      case 'awards':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Award Name</label>
              <input type="text" class="award-name" placeholder="e.g. Employee of the Year">
            </div>
            <div class="form-group">
              <label>Issuing Organization</label>
              <input type="text" class="award-org" placeholder="e.g. ABC Company">
            </div>
            <div class="form-group">
              <label>Date Received</label>
              <input type="month" class="award-date">
            </div>
            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea class="award-description" placeholder="Describe the award and why you received it..."></textarea>
            </div>
          </div>
        `;
        break;
      case 'volunteer':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Organization</label>
              <input type="text" class="volunteer-org" placeholder="e.g. Red Cross">
            </div>
            <div class="form-group">
              <label>Role</label>
              <input type="text" class="volunteer-role" placeholder="e.g. Volunteer Coordinator">
            </div>
            <div class="form-group" style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label>Start Date</label>
                <input type="month" class="volunteer-start-date">
              </div>
              <div style="flex: 1;">
                <label>End Date</label>
                <input type="month" class="volunteer-end-date">
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="volunteer-description" placeholder="Describe your volunteer work and impact..."></textarea>
            </div>
          </div>
        `;
        break;
      case 'publications':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Title</label>
              <input type="text" class="publication-title" placeholder="e.g. Modern Approaches to AI">
            </div>
            <div class="form-group">
              <label>Publisher/Journal</label>
              <input type="text" class="publication-publisher" placeholder="e.g. Journal of Computer Science">
            </div>
            <div class="form-group">
              <label>Publication Date</label>
              <input type="month" class="publication-date">
            </div>
            <div class="form-group">
              <label>URL (Optional)</label>
              <input type="url" class="publication-url" placeholder="e.g. https://journal.com/article">
            </div>
            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea class="publication-description" placeholder="Brief description of the publication..."></textarea>
            </div>
          </div>
        `;
        break;
      case 'references':
        itemHTML = `
          <div class="dynamic-item">
            <button class="remove-item"><i class="fas fa-times"></i></button>
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="reference-name" placeholder="e.g. Jane Smith">
            </div>
            <div class="form-group">
              <label>Position</label>
              <input type="text" class="reference-position" placeholder="e.g. Senior Manager">
            </div>
            <div class="form-group">
              <label>Company</label>
              <input type="text" class="reference-company" placeholder="e.g. ABC Corporation">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="reference-email" placeholder="e.g. jane.smith@example.com">
            </div>
            <div class="form-group">
              <label>Phone (Optional)</label>
              <input type="tel" class="reference-phone" placeholder="e.g. (123) 456-7890">
            </div>
          </div>
        `;
        break;
    }
    
    dynamicSection.innerHTML = itemHTML;
    formSection.appendChild(dynamicSection);
    
    // Add button to add more items
    const addItemBtn = document.createElement('button');
    addItemBtn.className = 'add-item-btn';
    addItemBtn.innerHTML = `<i class="fas fa-plus"></i> Add ${title.replace(' & Achievements', '')}`;
    addItemBtn.addEventListener('click', function() {
      const newItem = document.createElement('div');
      newItem.className = 'dynamic-item';
      newItem.innerHTML = dynamicSection.querySelector('.dynamic-item').innerHTML;
      dynamicSection.appendChild(newItem);
      
      // Add event listener to the new remove button
      const removeBtn = newItem.querySelector('.remove-item');
      removeBtn.addEventListener('click', function() {
        dynamicSection.removeChild(newItem);
        updateResumePreview();
      });
      
      // Add event listeners to inputs for live preview
      const inputs = newItem.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('input', updateResumePreview);
      });
      
      updateResumePreview();
    });
    formSection.appendChild(addItemBtn);
    
    // Add the section to the form
    const resumeForm = document.querySelector('.resume-form');
    resumeForm.appendChild(formSection);
    
    // Add event listener to remove section button
    const removeSectionBtn = formSection.querySelector('.remove-section');
    removeSectionBtn.addEventListener('click', function() {
      resumeForm.removeChild(formSection);
      updateResumePreview();
    });
    
    // Add event listeners to remove item buttons
    formSection.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const item = this.parentElement;
        dynamicSection.removeChild(item);
        updateResumePreview();
      });
    });
    
    // Add event listeners to inputs for live preview
    formSection.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', updateResumePreview);
    });
    
    // Reset the select
    additionalSectionSelect.value = '';
    
    // Update the preview
    updateResumePreview();
  });
  
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
  
  function updateElegantTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
        <div class="contact-info">
          ${data.email ? `<div>${data.email}</div>` : ''}
          ${data.phone ? `<div>${data.phone}</div>` : ''}
          ${data.location ? `<div>${data.location}</div>` : ''}
          ${data.website ? `<div>${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">Professional Profile</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">Experience</div>
        
        <div class="item">
          <div class="item-title">Senior Developer</div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-date">January 2020 - Present</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-title">Web Developer</div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-date">March 2018 - December 2019</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Education</div>
        
        <div class="item">
          <div class="item-title">Bachelor of Science in Computer Science</div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
          <div class="item-date">September 2014 - June 2018</div>
          <div class="item-description">Graduated with honors. Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Skills</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
          <div class="skill-item">Agile</div>
          <div class="skill-item">AWS</div>
        </div>
      </div>
    `;
  }
  
  function updateVibrantTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
        <div class="contact-info">
          ${data.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
          ${data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
          ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
          ${data.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">About Me</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">Work Experience</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Senior Developer</div>
            <div class="item-date">Jan 2020 - Present</div>
          </div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Web Developer</div>
            <div class="item-date">Mar 2018 - Dec 2019</div>
          </div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Education</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Bachelor of Science in Computer Science</div>
            <div class="item-date">Sep 2014 - Jun 2018</div>
          </div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Skills</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
        </div>
      </div>
    `;
  }
  
  function updateExecutiveTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div>
          <div class="name">${data.fullName}</div>
          <div class="title">${data.jobTitle}</div>
        </div>
        <div class="contact-info">
          ${data.email ? `<div>${data.email}</div>` : ''}
          ${data.phone ? `<div>${data.phone}</div>` : ''}
          ${data.location ? `<div>${data.location}</div>` : ''}
          ${data.website ? `<div>${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">EXECUTIVE SUMMARY</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">PROFESSIONAL EXPERIENCE</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Senior Developer</div>
            <div class="item-date">January 2020 - Present</div>
          </div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Web Developer</div>
            <div class="item-date">March 2018 - December 2019</div>
          </div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EDUCATION</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Bachelor of Science in Computer Science</div>
            <div class="item-date">September 2014 - June 2018</div>
          </div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">SKILLS & EXPERTISE</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
        </div>
      </div>
    `;
  }
  
  function updateTechTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
        <div class="contact-info">
          ${data.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
          ${data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
          ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
          ${data.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">PROFILE</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">EXPERIENCE</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Senior Developer</div>
            <div class="item-date">Jan 2020 - Present</div>
          </div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Web Developer</div>
            <div class="item-date">Mar 2018 - Dec 2019</div>
          </div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EDUCATION</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Bachelor of Science in Computer Science</div>
            <div class="item-date">Sep 2014 - Jun 2018</div>
          </div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">TECHNICAL SKILLS</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
        </div>
      </div>
    `;
  }
  
  function updateGradientTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
        <div class="contact-info">
          ${data.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
          ${data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
          ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
          ${data.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">About Me</div>
          <div class="item">
            <p>${data.summary}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">Experience</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Senior Developer</div>
            <div class="item-date">Jan 2020 - Present</div>
          </div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Web Developer</div>
            <div class="item-date">Mar 2018 - Dec 2019</div>
          </div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Education</div>
        
        <div class="item">
          <div class="item-header">
            <div class="item-title">Bachelor of Science in Computer Science</div>
            <div class="item-date">Sep 2014 - Jun 2018</div>
          </div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Skills</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
        </div>
      </div>
    `;
  }
  
  function updateBoldTemplate(template, data) {
    template.innerHTML = `
      <div class="resume-header">
        <div class="name">${data.fullName}</div>
        <div class="title">${data.jobTitle}</div>
        <div class="contact-info">
          ${data.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
          ${data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
          ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
          ${data.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
        </div>
      </div>
      
      ${data.summary ? `
        <div class="section">
          <div class="section-title">PROFILE</div>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">EXPERIENCE</div>
        
        <div class="item">
          <div class="item-title">SENIOR DEVELOPER</div>
          <div class="item-date">JAN 2020 - PRESENT</div>
          <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
          <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
        </div>
        
        <div class="item">
          <div class="item-title">WEB DEVELOPER</div>
          <div class="item-date">MAR 2018 - DEC 2019</div>
          <div class="item-subtitle">Digital Innovations, New York, NY</div>
          <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">EDUCATION</div>
        
        <div class="item">
          <div class="item-title">BACHELOR OF SCIENCE IN COMPUTER SCIENCE</div>
          <div class="item-date">SEP 2014 - JUN 2018</div>
          <div class="item-subtitle">University of California, Berkeley, CA</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">SKILLS</div>
        
        <div class="skills-list">
          <div class="skill-item">JavaScript</div>
          <div class="skill-item">React</div>
          <div class="skill-item">Node.js</div>
          <div class="skill-item">HTML/CSS</div>
          <div class="skill-item">Git</div>
          <div class="skill-item">SQL</div>
        </div>
      </div>
    `;
  }
  
  // Helper function to format dates
  function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  }
  
  // Initialize the preview
  updateResumePreview();
});