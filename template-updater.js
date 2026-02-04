// Template updater functions for the resume builder

// Modern template updater
function updateModernTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${exp.jobTitle}</div>
        <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      </div>
      <div class="item-subtitle">${exp.company} | ${exp.location}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-header">
        <div class="item-title">Senior Developer</div>
        <div class="item-date">Jan 2020 - Present</div>
      </div>
      <div class="item-subtitle">Tech Solutions Inc. | San Francisco, CA</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-header">
        <div class="item-title">Web Developer</div>
        <div class="item-date">Mar 2018 - Dec 2019</div>
      </div>
      <div class="item-subtitle">Digital Innovations | New York, NY</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${edu.degree}</div>
        <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      </div>
      <div class="item-subtitle">${edu.institution} | ${edu.location}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-header">
        <div class="item-title">Bachelor of Science in Computer Science</div>
        <div class="item-date">Sep 2014 - Jun 2018</div>
      </div>
      <div class="item-subtitle">University of California | Berkeley, CA</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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

// Minimalist template updater
function updateMinimalistTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${exp.jobTitle}</div>
        <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      </div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
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
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${edu.degree}</div>
        <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      </div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-header">
        <div class="item-title">Bachelor of Science in Computer Science</div>
        <div class="item-date">Sep 2014 - Jun 2018</div>
      </div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">PROFILE</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">EXPERIENCE</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">EDUCATION</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">SKILLS</div>
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Creative template updater
function updateCreativeTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}</div>
      <div class="item-location">${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc.</div>
      <div class="item-location">San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations</div>
      <div class="item-location">New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}</div>
      <div class="item-location">${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California</div>
      <div class="item-location">Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">About Me</div>
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

// Traditional template updater
function updateTraditionalTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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

// Elegant template updater
function updateElegantTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
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
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">September 2014 - June 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">Professional Profile</div>
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

// Vibrant template updater
function updateVibrantTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">About Me</div>
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

// Executive template updater
function updateExecutiveTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">Executive Summary</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Core Competencies</div>
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Tech template updater
function updateTechTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">// PROFILE</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">// EXPERIENCE</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">// EDUCATION</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">// SKILLS</div>
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Gradient template updater
function updateGradientTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">Profile</div>
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

// Bold template updater
function updateBoldTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle.toUpperCase()}</div>
      <div class="item-date">${exp.startDate.toUpperCase()} - ${exp.endDate.toUpperCase()}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
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
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree.toUpperCase()}</div>
      <div class="item-date">${edu.startDate.toUpperCase()} - ${edu.endDate.toUpperCase()}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">BACHELOR OF SCIENCE IN COMPUTER SCIENCE</div>
      <div class="item-date">SEP 2014 - JUN 2018</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
  template.innerHTML = `
    <div class="resume-header">
      <div class="name">${data.fullName.toUpperCase()}</div>
      <div class="title">${data.jobTitle.toUpperCase()}</div>
      <div class="contact-info">
        ${data.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.email}</div>` : ''}
        ${data.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.phone}</div>` : ''}
        ${data.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>` : ''}
        ${data.website ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.website}</div>` : ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">PROFILE</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">EXPERIENCE</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">EDUCATION</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">SKILLS</div>
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Colorful template updater
function updateColorfulTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}</div>
      <div class="item-location">${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc.</div>
      <div class="item-location">San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations</div>
      <div class="item-location">New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}</div>
      <div class="item-location">${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California</div>
      <div class="item-location">Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">About Me</div>
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

// Professional template updater
function updateProfessionalTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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
    
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p>${data.summary}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${experienceHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHTML}
    </div>
    
    <div class="section">
      <div class="section-title">Technical Skills</div>
      <div class="skills-list">
        ${skillsHTML}
      </div>
    </div>
  `;
}

// Simple template updater
function updateSimpleTemplate(template, data) {
  // Create experience items HTML
  const experienceHTML = data.experience ? data.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.jobTitle}</div>
      <div class="item-subtitle">${exp.company}, ${exp.location}</div>
      <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
      <div class="item-description">${exp.description}</div>
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Senior Developer</div>
      <div class="item-subtitle">Tech Solutions Inc., San Francisco, CA</div>
      <div class="item-date">Jan 2020 - Present</div>
      <div class="item-description">Led a team of 5 developers in building a customer-facing web application. Implemented CI/CD pipelines and improved application performance by 40%.</div>
    </div>
    
    <div class="item">
      <div class="item-title">Web Developer</div>
      <div class="item-subtitle">Digital Innovations, New York, NY</div>
      <div class="item-date">Mar 2018 - Dec 2019</div>
      <div class="item-description">Developed responsive websites for clients across various industries. Collaborated with designers to implement UI/UX improvements.</div>
    </div>
  `;
  
  // Create education items HTML
  const educationHTML = data.education ? data.education.map(edu => `
    <div class="item">
      <div class="item-title">${edu.degree}</div>
      <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
      <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
      ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
    </div>
  `).join('') : `
    <div class="item">
      <div class="item-title">Bachelor of Science in Computer Science</div>
      <div class="item-subtitle">University of California, Berkeley, CA</div>
      <div class="item-date">Sep 2014 - Jun 2018</div>
    </div>
  `;
  
  // Create skills HTML
  const skillsHTML = data.skills ? data.skills.map(skill => `
    <div class="skill-item">${skill}</div>
  `).join('') : `
    <div class="skill-item">JavaScript</div>
    <div class="skill-item">React</div>
    <div class="skill-item">Node.js</div>
    <div class="skill-item">HTML/CSS</div>
    <div class="skill-item">Git</div>
    <div class="skill-item">SQL</div>
  `;
  
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