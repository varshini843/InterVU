// Script to populate all templates with sample data on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Populating all templates with sample data');
  
  // Sample data
  const sampleData = {
    fullName: 'John Smith',
    jobTitle: 'Software Engineer',
    email: 'john@example.com',
    phone: '(123) 456-7890',
    location: 'New York, NY',
    website: 'linkedin.com/in/johnsmith',
    summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Proficient in JavaScript, React, and Node.js. Passionate about creating efficient, scalable, and user-friendly applications.'
  };
  
  // Populate all templates
  setTimeout(function() {
    // Modern template
    const modernTemplate = document.getElementById('template-modern');
    if (modernTemplate && typeof updateModernTemplate === 'function') {
      updateModernTemplate(modernTemplate, sampleData);
    }
    
    // Minimalist template
    const minimalistTemplate = document.getElementById('template-minimalist');
    if (minimalistTemplate && typeof updateMinimalistTemplate === 'function') {
      updateMinimalistTemplate(minimalistTemplate, sampleData);
    }
    
    // Creative template
    const creativeTemplate = document.getElementById('template-creative');
    if (creativeTemplate && typeof updateCreativeTemplate === 'function') {
      updateCreativeTemplate(creativeTemplate, sampleData);
    }
    
    // Traditional template
    const traditionalTemplate = document.getElementById('template-traditional');
    if (traditionalTemplate && typeof updateTraditionalTemplate === 'function') {
      updateTraditionalTemplate(traditionalTemplate, sampleData);
    }
    
    // Elegant template
    const elegantTemplate = document.getElementById('template-elegant');
    if (elegantTemplate && typeof updateElegantTemplate === 'function') {
      updateElegantTemplate(elegantTemplate, sampleData);
    }
    
    // Vibrant template
    const vibrantTemplate = document.getElementById('template-vibrant');
    if (vibrantTemplate && typeof updateVibrantTemplate === 'function') {
      updateVibrantTemplate(vibrantTemplate, sampleData);
    }
    
    // Executive template
    const executiveTemplate = document.getElementById('template-executive');
    if (executiveTemplate && typeof updateExecutiveTemplate === 'function') {
      updateExecutiveTemplate(executiveTemplate, sampleData);
    }
    
    // Tech template
    const techTemplate = document.getElementById('template-tech');
    if (techTemplate && typeof updateTechTemplate === 'function') {
      updateTechTemplate(techTemplate, sampleData);
    }
    
    // Gradient template
    const gradientTemplate = document.getElementById('template-gradient');
    if (gradientTemplate && typeof updateGradientTemplate === 'function') {
      updateGradientTemplate(gradientTemplate, sampleData);
    }
    
    // Bold template
    const boldTemplate = document.getElementById('template-bold');
    if (boldTemplate && typeof updateBoldTemplate === 'function') {
      updateBoldTemplate(boldTemplate, sampleData);
    }
    
    console.log('All templates populated with sample data');
  }, 500); // Small delay to ensure all scripts are loaded
});