// Test script for activity tracking
// This script simulates user activities to test the tracking functionality

// Function to simulate activities
function simulateActivities() {
  console.log('Starting activity simulation...');
  
  // Create a test user if none exists
  if (!localStorage.getItem('intervuCurrentUser')) {
    console.log('Creating test user...');
    const testUser = {
      id: 'test-user-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com'
    };
    localStorage.setItem('intervuCurrentUser', JSON.stringify(testUser));
  }
  
  // Simulate interview activity
  console.log('Simulating interview activity...');
  const interviewId = trackActivity('interview', { 
    type: 'Technical Interview',
    duration: 15,
    questions: 5
  });
  console.log('Created interview activity with ID:', interviewId);
  
  // Simulate resume activity
  setTimeout(() => {
    console.log('Simulating resume activity...');
    const resumeId = trackActivity('resume', {
      template: 'Professional',
      sections: ['Experience', 'Education', 'Skills']
    });
    console.log('Created resume activity with ID:', resumeId);
    
    // Simulate chat activity
    setTimeout(() => {
      console.log('Simulating chat activity...');
      const chatId = trackActivity('chat', {
        topic: 'Interview Tips',
        messages: 10
      });
      console.log('Created chat activity with ID:', chatId);
      
      // Update dashboard
      setTimeout(() => {
        console.log('Updating dashboard...');
        updateDashboardStats();
        updateActivityTimeline();
        updateAchievements();
        updateNotifications();
        updateGoals();
        console.log('Dashboard updated!');
      }, 1000);
    }, 1000);
  }, 1000);
}

// Function to clear all activity data
function clearActivityData() {
  console.log('Clearing all activity data...');
  
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) {
    console.log('No user found!');
    return;
  }
  
  const userId = currentUser.id || currentUser.email;
  
  // Clear all activity data
  localStorage.removeItem(`intervu_activities_${userId}`);
  localStorage.removeItem(`intervu_stats_${userId}`);
  localStorage.removeItem(`intervu_goals_${userId}`);
  localStorage.removeItem(`intervu_achievements_${userId}`);
  localStorage.removeItem(`intervu_locked_achievements_${userId}`);
  localStorage.removeItem(`intervu_notifications_${userId}`);
  
  console.log('All activity data cleared!');
  
  // Reload the page to reset the dashboard
  window.location.reload();
}

// Add test buttons to the dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Create test buttons container
  const testContainer = document.createElement('div');
  testContainer.style.position = 'fixed';
  testContainer.style.bottom = '20px';
  testContainer.style.right = '20px';
  testContainer.style.zIndex = '9999';
  testContainer.style.display = 'flex';
  testContainer.style.flexDirection = 'column';
  testContainer.style.gap = '10px';
  
  // Create simulate button
  const simulateButton = document.createElement('button');
  simulateButton.textContent = 'Simulate Activities';
  simulateButton.style.padding = '10px 15px';
  simulateButton.style.backgroundColor = '#4e73df';
  simulateButton.style.color = 'white';
  simulateButton.style.border = 'none';
  simulateButton.style.borderRadius = '5px';
  simulateButton.style.cursor = 'pointer';
  simulateButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  simulateButton.onclick = simulateActivities;
  
  // Create clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear Activity Data';
  clearButton.style.padding = '10px 15px';
  clearButton.style.backgroundColor = '#e74a3b';
  clearButton.style.color = 'white';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '5px';
  clearButton.style.cursor = 'pointer';
  clearButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  clearButton.onclick = clearActivityData;
  
  // Add buttons to container
  testContainer.appendChild(simulateButton);
  testContainer.appendChild(clearButton);
  
  // Add container to body
  document.body.appendChild(testContainer);
  
  console.log('Test buttons added to dashboard!');
});