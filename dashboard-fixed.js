// Dashboard functionality for InterVU

document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard loaded');
  
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) {
    // Create a demo user if none exists
    const demoUser = {
      fullname: 'Demo User',
      email: 'demo@intervu.app',
      id: 'demo123'
    };
    localStorage.setItem('intervuCurrentUser', JSON.stringify(demoUser));
    console.log('Created demo user');
    window.location.reload();
    return;
  }

  // Set user name and initials
  const userName = document.getElementById('userName');
  const userInitials = document.getElementById('userInitials');
  
  if (userName) {
    userName.textContent = currentUser.fullname;
  }
  
  if (userInitials) {
    // Get initials from full name
    const nameParts = currentUser.fullname.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();
    userInitials.textContent = initials;
  }

  // User menu toggle
  const userAvatar = document.getElementById('userAvatar');
  const userMenu = document.getElementById('userMenu');
  
  if (userAvatar && userMenu) {
    userAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      userMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
      userMenu.classList.remove('active');
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('intervuCurrentUser');
      window.location.href = 'login.html';
    });
  }

  // Initialize user activity data
  initializeUserActivity(currentUser.email);

  // Load and display user data
  loadUserData(currentUser.email);

  // Track current session
  trackCurrentSession(currentUser.email);

  // Setup export functionality
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      exportUserData(currentUser.email);
    });
  }

  // Setup date filter
  const dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', function() {
      loadUserData(currentUser.email, parseInt(this.value));
    });
  }
  
  // Setup notification handling
  setupNotifications();
  
  // Setup tab switching
  setupTabSwitching();
});

// Initialize user activity data
function initializeUserActivity(userEmail) {
  const now = new Date();
  
  // Get existing stats if available
  const userStats = JSON.parse(localStorage.getItem('userStats')) || {
    interviewSessions: 0,
    chatbotInteractions: 0,
    totalPracticeTime: 0,
    resumesCreated: 0
  };
  
  // Save the stats
  localStorage.setItem('userStats', JSON.stringify(userStats));
  
  // Check if data already exists
  let activityData = {};
  if (localStorage.getItem('intervuUserActivity_' + userEmail)) {
    activityData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
    
    // Track login activity
    const loginId = trackUserActivity('login');
    
    // Start tracking duration
    updateActivityDuration('login', loginId);
    
    return;
  }
  
  // Initialize with empty data structure
  activityData = {
    interviews: [],
    resumes: [],
    chats: [],
    logins: [],
    goals: [
      {
        id: 1,
        title: "Complete 5 practice interviews",
        target: 5,
        current: 0,
        category: "interview",
        createdAt: now.getTime(),
        completed: false,
        completedAt: null
      },
      {
        id: 2,
        title: "Create 3 different resumes",
        target: 3,
        current: 0,
        category: "resume",
        createdAt: now.getTime(),
        completed: false,
        completedAt: null
      },
      {
        id: 3,
        title: "Spend 2 hours on interview prep",
        target: 2,
        current: 0,
        category: "time",
        completed: false,
        createdAt: now.getTime(),
        completedAt: null
      }
    ],
    achievements: [],
    lockedAchievements: [
      {
        id: "first_interview",
        name: "First Interview",
        description: "Complete your first practice interview",
        requirement: 1,
        progress: 0,
        icon: "star"
      },
      {
        id: "resume_pro",
        name: "Resume Pro",
        description: "Create 3 different resumes",
        requirement: 3,
        progress: 0,
        icon: "file"
      },
      {
        id: "chatty",
        name: "Chatty",
        description: "Have 10+ AI chat sessions",
        requirement: 10,
        progress: 0,
        icon: "comments"
      },
      {
        id: "interview_master",
        name: "Interview Master",
        description: "Complete 10 interviews",
        requirement: 10,
        progress: 0,
        icon: "award"
      }
    ],
    notifications: [
      {
        id: 1,
        type: "info",
        title: "Welcome to Your Dashboard",
        description: "Track your progress and achievements as you prepare for interviews.",
        timestamp: now.getTime(),
        read: false,
        actions: ["Got it"]
      }
    ]
  };

  localStorage.setItem('intervuUserActivity_' + userEmail, JSON.stringify(activityData));
  
  // Track login activity
  const loginId = trackUserActivity('login');
  
  // Start tracking duration
  updateActivityDuration('login', loginId);
}

// Function to update achievements based on stats
function updateAchievementsBasedOnStats(activityData, userStats, now) {
  // Check if any achievements are unlocked based on stats
  if (userStats.interviewSessions >= 1) {
    // Move from locked to unlocked
    const achievement = activityData.lockedAchievements.find(a => a.id === "first_interview");
    if (achievement) {
      activityData.achievements.push({
        id: "first_interview",
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now.getTime(),
        icon: achievement.icon
      });
      
      // Remove from locked
      activityData.lockedAchievements = activityData.lockedAchievements.filter(a => a.id !== "first_interview");
      
      // Add notification
      activityData.notifications.push({
        id: activityData.notifications.length + 1,
        type: "success",
        title: "Achievement Unlocked",
        description: `Congratulations! You've earned the "${achievement.name}" badge.`,
        timestamp: now.getTime(),
        read: false,
        actions: ["View Achievements"]
      });
    }
  }
  
  if (userStats.resumesCreated >= 3) {
    // Move from locked to unlocked
    const achievement = activityData.lockedAchievements.find(a => a.id === "resume_pro");
    if (achievement) {
      activityData.achievements.push({
        id: "resume_pro",
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now.getTime(),
        icon: achievement.icon
      });
      
      // Remove from locked
      activityData.lockedAchievements = activityData.lockedAchievements.filter(a => a.id !== "resume_pro");
      
      // Add notification
      activityData.notifications.push({
        id: activityData.notifications.length + 1,
        type: "success",
        title: "Achievement Unlocked",
        description: `Congratulations! You've earned the "${achievement.name}" badge.`,
        timestamp: now.getTime(),
        read: false,
        actions: ["View Achievements"]
      });
    }
  }
  
  if (userStats.chatbotInteractions >= 10) {
    // Move from locked to unlocked
    const achievement = activityData.lockedAchievements.find(a => a.id === "chatty");
    if (achievement) {
      activityData.achievements.push({
        id: "chatty",
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now.getTime(),
        icon: achievement.icon
      });
      
      // Remove from locked
      activityData.lockedAchievements = activityData.lockedAchievements.filter(a => a.id !== "chatty");
      
      // Add notification
      activityData.notifications.push({
        id: activityData.notifications.length + 1,
        type: "success",
        title: "Achievement Unlocked",
        description: `Congratulations! You've earned the "${achievement.name}" badge.`,
        timestamp: now.getTime(),
        read: false,
        actions: ["View Achievements"]
      });
    }
  }
  
  if (userStats.interviewSessions >= 10) {
    // Move from locked to unlocked
    const achievement = activityData.lockedAchievements.find(a => a.id === "interview_master");
    if (achievement) {
      activityData.achievements.push({
        id: "interview_master",
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now.getTime(),
        icon: achievement.icon
      });
      
      // Remove from locked
      activityData.lockedAchievements = activityData.lockedAchievements.filter(a => a.id !== "interview_master");
      
      // Add notification
      activityData.notifications.push({
        id: activityData.notifications.length + 1,
        type: "success",
        title: "Achievement Unlocked",
        description: `Congratulations! You've earned the "${achievement.name}" badge.`,
        timestamp: now.getTime(),
        read: false,
        actions: ["View Achievements"]
      });
    }
  }
  
  // Update progress for locked achievements
  activityData.lockedAchievements.forEach(achievement => {
    if (achievement.id === "first_interview" || achievement.id === "interview_master") {
      achievement.progress = userStats.interviewSessions;
    } else if (achievement.id === "resume_pro") {
      achievement.progress = userStats.resumesCreated;
    } else if (achievement.id === "chatty") {
      achievement.progress = userStats.chatbotInteractions;
    }
  });
}

// Track current session
function trackCurrentSession(userEmail) {
  // This is now handled by the activity-tracker.js
  // We'll just refresh the dashboard data periodically
  const refreshInterval = setInterval(() => {
    loadUserData(userEmail);
  }, 60000); // Refresh every minute
  
  // Clear interval when page is unloaded
  window.addEventListener('beforeunload', function() {
    clearInterval(refreshInterval);
  });
}

// Load and display user data
function loadUserData(userEmail, days = 30) {
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
  
  if (!userData) return;
  
  // Get existing stats
  const userStats = JSON.parse(localStorage.getItem('userStats')) || {
    interviewSessions: 0,
    chatbotInteractions: 0,
    totalPracticeTime: 0,
    resumesCreated: 0
  };
  
  // Filter data by date range
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const filteredInterviews = userData.interviews.filter(i => i.timestamp >= startDate.getTime());
  const filteredResumes = userData.resumes.filter(r => r.timestamp >= startDate.getTime());
  const filteredChats = userData.chats.filter(c => c.timestamp >= startDate.getTime());
  
  // Update stats display
  updateStatsDisplay(userStats);
  
  // Update activity charts
  updateActivityCharts(filteredInterviews, filteredResumes, filteredChats, days);
  
  // Update goals
  updateGoalsDisplay(userData.goals);
  
  // Update achievements
  updateAchievementsDisplay(userData.achievements, userData.lockedAchievements);
  
  // Update recent activity
  updateRecentActivity(filteredInterviews, filteredResumes, filteredChats);
  
  // Update notifications
  updateNotificationsDisplay(userData.notifications);
}

// Update stats display
function updateStatsDisplay(stats) {
  const interviewsElement = document.getElementById('interviewsCount');
  const resumesElement = document.getElementById('resumesCount');
  const practiceTimeElement = document.getElementById('practiceTimeCount');
  const chatbotElement = document.getElementById('chatbotCount');
  
  if (interviewsElement) {
    interviewsElement.textContent = stats.interviewSessions;
  }
  
  if (resumesElement) {
    resumesElement.textContent = stats.resumesCreated;
  }
  
  if (practiceTimeElement) {
    const hours = Math.floor(stats.totalPracticeTime / 60);
    const minutes = stats.totalPracticeTime % 60;
    practiceTimeElement.textContent = `${hours}h ${minutes}m`;
  }
  
  if (chatbotElement) {
    chatbotElement.textContent = stats.chatbotInteractions;
  }
}

// Update activity charts
function updateActivityCharts(interviews, resumes, chats, days) {
  // Activity by day chart
  const activityByDayChart = document.getElementById('activityByDayChart');
  if (activityByDayChart) {
    // Generate labels for the past X days
    const labels = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Count activities by day
    const interviewsByDay = new Array(days).fill(0);
    const resumesByDay = new Array(days).fill(0);
    const chatsByDay = new Array(days).fill(0);
    
    interviews.forEach(interview => {
      const date = new Date(interview.timestamp);
      const dayIndex = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        interviewsByDay[days - 1 - dayIndex]++;
      }
    });
    
    resumes.forEach(resume => {
      const date = new Date(resume.timestamp);
      const dayIndex = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        resumesByDay[days - 1 - dayIndex]++;
      }
    });
    
    chats.forEach(chat => {
      const date = new Date(chat.timestamp);
      const dayIndex = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        chatsByDay[days - 1 - dayIndex]++;
      }
    });
    
    // Create or update chart
    if (window.activityByDayChartInstance) {
      window.activityByDayChartInstance.data.labels = labels;
      window.activityByDayChartInstance.data.datasets[0].data = interviewsByDay;
      window.activityByDayChartInstance.data.datasets[1].data = resumesByDay;
      window.activityByDayChartInstance.data.datasets[2].data = chatsByDay;
      window.activityByDayChartInstance.update();
    } else {
      window.activityByDayChartInstance = new Chart(activityByDayChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Interviews',
              data: interviewsByDay,
              borderColor: '#4C84FF',
              backgroundColor: 'rgba(76, 132, 255, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Resumes',
              data: resumesByDay,
              borderColor: '#FF4D6D',
              backgroundColor: 'rgba(255, 77, 109, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Chats',
              data: chatsByDay,
              borderColor: '#50C878',
              backgroundColor: 'rgba(80, 200, 120, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  }
  
  // Activity distribution chart
  const activityDistributionChart = document.getElementById('activityDistributionChart');
  if (activityDistributionChart) {
    const totalInterviews = interviews.length;
    const totalResumes = resumes.length;
    const totalChats = chats.length;
    const total = totalInterviews + totalResumes + totalChats;
    
    const interviewPercentage = total > 0 ? Math.round((totalInterviews / total) * 100) : 0;
    const resumePercentage = total > 0 ? Math.round((totalResumes / total) * 100) : 0;
    const chatPercentage = total > 0 ? Math.round((totalChats / total) * 100) : 0;
    
    // Create or update chart
    if (window.activityDistributionChartInstance) {
      window.activityDistributionChartInstance.data.datasets[0].data = [interviewPercentage, resumePercentage, chatPercentage];
      window.activityDistributionChartInstance.update();
    } else {
      window.activityDistributionChartInstance = new Chart(activityDistributionChart, {
        type: 'doughnut',
        data: {
          labels: ['Interviews', 'Resumes', 'Chats'],
          datasets: [{
            data: [interviewPercentage, resumePercentage, chatPercentage],
            backgroundColor: ['#4C84FF', '#FF4D6D', '#50C878'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
  }
  
  // Interview scores chart
  const interviewScoresChart = document.getElementById('interviewScoresChart');
  if (interviewScoresChart && interviews.length > 0) {
    // Get scores from interviews
    const scores = interviews.map(interview => interview.details.score || 0);
    const dates = interviews.map(interview => new Date(interview.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Create or update chart
    if (window.interviewScoresChartInstance) {
      window.interviewScoresChartInstance.data.labels = dates;
      window.interviewScoresChartInstance.data.datasets[0].data = scores;
      window.interviewScoresChartInstance.update();
    } else {
      window.interviewScoresChartInstance = new Chart(interviewScoresChart, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: 'Interview Score',
            data: scores,
            backgroundColor: scores.map(score => {
              if (score >= 80) return '#50C878'; // Good
              if (score >= 60) return '#FFD700'; // Average
              return '#FF4D6D'; // Needs improvement
            }),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    }
  }
}

// Update goals display
function updateGoalsDisplay(goals) {
  const goalsContainer = document.getElementById('goalsContainer');
  if (!goalsContainer) return;
  
  // Clear existing goals
  goalsContainer.innerHTML = '';
  
  // Add goals
  goals.forEach(goal => {
    const goalElement = document.createElement('div');
    goalElement.className = 'goal-item';
    
    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    
    goalElement.innerHTML = `
      <div class="goal-header">
        <div class="goal-title">${goal.title}</div>
        <div class="goal-progress">${goal.current}/${goal.target}</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      ${goal.completed ? '<div class="goal-completed"><i class="fas fa-check-circle"></i> Completed</div>' : ''}
    `;
    
    goalsContainer.appendChild(goalElement);
  });
}

// Update achievements display
function updateAchievementsDisplay(achievements, lockedAchievements) {
  const achievementsContainer = document.getElementById('achievementsContainer');
  if (!achievementsContainer) return;
  
  // Clear existing achievements
  achievementsContainer.innerHTML = '';
  
  // Add unlocked achievements
  achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-item unlocked';
    
    achievementElement.innerHTML = `
      <div class="achievement-icon">
        <i class="fas fa-${achievement.icon}"></i>
      </div>
      <div class="achievement-details">
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-date">Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString()}</div>
      </div>
    `;
    
    achievementsContainer.appendChild(achievementElement);
  });
  
  // Add locked achievements
  lockedAchievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-item locked';
    
    const progress = Math.min(Math.round((achievement.progress / achievement.requirement) * 100), 100);
    
    achievementElement.innerHTML = `
      <div class="achievement-icon">
        <i class="fas fa-${achievement.icon}"></i>
      </div>
      <div class="achievement-details">
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-text">${achievement.progress}/${achievement.requirement}</div>
        </div>
      </div>
    `;
    
    achievementsContainer.appendChild(achievementElement);
  });
}

// Update recent activity
function updateRecentActivity(interviews, resumes, chats) {
  const activityContainer = document.getElementById('recentActivityContainer');
  if (!activityContainer) return;
  
  // Clear existing activity
  activityContainer.innerHTML = '';
  
  // Combine all activities
  const allActivities = [
    ...interviews.map(interview => ({
      type: 'interview',
      timestamp: interview.timestamp,
      duration: interview.duration,
      details: interview.details
    })),
    ...resumes.map(resume => ({
      type: 'resume',
      timestamp: resume.timestamp,
      duration: resume.duration,
      details: resume.details
    })),
    ...chats.map(chat => ({
      type: 'chat',
      timestamp: chat.timestamp,
      duration: chat.duration,
      details: chat.details
    }))
  ];
  
  // Sort by timestamp (most recent first)
  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  
  // Take the 10 most recent activities
  const recentActivities = allActivities.slice(0, 10);
  
  // Add activities to container
  recentActivities.forEach(activity => {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    
    const date = new Date(activity.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    let icon, title, details;
    
    switch(activity.type) {
      case 'interview':
        icon = 'fa-video';
        title = 'Practice Interview';
        details = `Score: ${activity.details.score}% • ${activity.duration} minutes`;
        break;
      case 'resume':
        icon = 'fa-file-alt';
        title = 'Resume Created';
        details = `Template: ${activity.details.template} • ${activity.duration} minutes`;
        break;
      case 'chat':
        icon = 'fa-comments';
        title = 'AI Chat Session';
        details = `${activity.details.messages} messages • ${activity.duration} minutes`;
        break;
    }
    
    activityElement.innerHTML = `
      <div class="activity-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="activity-details">
        <div class="activity-title">${title}</div>
        <div class="activity-info">${details}</div>
        <div class="activity-time">${formattedDate} at ${formattedTime}</div>
      </div>
    `;
    
    activityContainer.appendChild(activityElement);
  });
  
  // If no activities, show a message
  if (recentActivities.length === 0) {
    activityContainer.innerHTML = '<div class="no-activity">No recent activity to display</div>';
  }
}

// Update notifications display
function updateNotificationsDisplay(notifications) {
  const notificationsContainer = document.getElementById('notificationsContainer');
  const notificationCount = document.getElementById('notificationCount');
  
  if (!notificationsContainer) return;
  
  // Clear existing notifications
  notificationsContainer.innerHTML = '';
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Update notification count
  if (notificationCount) {
    notificationCount.textContent = unreadCount;
    if (unreadCount > 0) {
      notificationCount.style.display = 'flex';
    } else {
      notificationCount.style.display = 'none';
    }
  }
  
  // Add notifications to container
  notifications.forEach(notification => {
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
    notificationElement.dataset.id = notification.id;
    
    const date = new Date(notification.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    let icon;
    switch(notification.type) {
      case 'success':
        icon = 'fa-check-circle';
        break;
      case 'warning':
        icon = 'fa-exclamation-triangle';
        break;
      case 'info':
      default:
        icon = 'fa-info-circle';
    }
    
    notificationElement.innerHTML = `
      <div class="notification-icon ${notification.type}">
        <i class="fas ${icon}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-header">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-time">${formattedDate} ${formattedTime}</div>
        </div>
        <div class="notification-description">${notification.description}</div>
        ${notification.actions && notification.actions.length > 0 ? 
          `<div class="notification-actions">
            ${notification.actions.map(action => `<button class="notification-action">${action}</button>`).join('')}
          </div>` : ''}
      </div>
      <button class="notification-dismiss"><i class="fas fa-times"></i></button>
    `;
    
    notificationsContainer.appendChild(notificationElement);
  });
  
  // If no notifications, show a message
  if (notifications.length === 0) {
    notificationsContainer.innerHTML = '<div class="no-notifications">No notifications</div>';
  }
}

// Setup notifications
function setupNotifications() {
  const notificationsContainer = document.getElementById('notificationsContainer');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  const notificationsToggle = document.getElementById('notificationsToggle');
  
  if (!notificationsContainer || !notificationsDropdown || !notificationsToggle) return;
  
  // Toggle notifications dropdown
  notificationsToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationsDropdown.classList.toggle('active');
    
    // Mark all as read when opening
    if (notificationsDropdown.classList.contains('active')) {
      markAllNotificationsAsRead();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function() {
    notificationsDropdown.classList.remove('active');
  });
  
  // Prevent dropdown from closing when clicking inside
  notificationsDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Handle notification actions
  notificationsContainer.addEventListener('click', function(e) {
    // Dismiss notification
    if (e.target.closest('.notification-dismiss')) {
      const notificationItem = e.target.closest('.notification-item');
      if (notificationItem) {
        const notificationId = parseInt(notificationItem.dataset.id);
        dismissNotification(notificationId);
      }
    }
    
    // Handle action buttons
    if (e.target.classList.contains('notification-action')) {
      const notificationItem = e.target.closest('.notification-item');
      if (notificationItem) {
        const notificationId = parseInt(notificationItem.dataset.id);
        const action = e.target.textContent;
        handleNotificationAction(notificationId, action);
      }
    }
  });
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
  if (!userData || !userData.notifications) return;
  
  // Mark all as read
  userData.notifications.forEach(notification => {
    notification.read = true;
  });
  
  // Save updated data
  localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
  
  // Update notification count
  const notificationCount = document.getElementById('notificationCount');
  if (notificationCount) {
    notificationCount.style.display = 'none';
    notificationCount.textContent = '0';
  }
  
  // Update notification items
  const notificationItems = document.querySelectorAll('.notification-item');
  notificationItems.forEach(item => {
    item.classList.remove('unread');
    item.classList.add('read');
  });
}

// Dismiss notification
function dismissNotification(notificationId) {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
  if (!userData || !userData.notifications) return;
  
  // Remove notification
  userData.notifications = userData.notifications.filter(n => n.id !== notificationId);
  
  // Save updated data
  localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
  
  // Update notifications display
  updateNotificationsDisplay(userData.notifications);
}

// Handle notification action
function handleNotificationAction(notificationId, action) {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + currentUser.email));
  if (!userData || !userData.notifications) return;
  
  // Find notification
  const notification = userData.notifications.find(n => n.id === notificationId);
  if (!notification) return;
  
  // Handle action
  if (action === 'View Achievements') {
    // Switch to achievements tab
    const achievementsTab = document.querySelector('.tab-button[data-tab="achievements"]');
    if (achievementsTab) {
      achievementsTab.click();
    }
  }
  
  // Mark as read
  notification.read = true;
  
  // Save updated data
  localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
  
  // Update notifications display
  updateNotificationsDisplay(userData.notifications);
}

// Setup tab switching
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to current button and content
      this.classList.add('active');
      document.getElementById(`${tabName}Tab`).classList.add('active');
    });
  });
}

// Export user data
function exportUserData(userEmail) {
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
  if (!userData) return;
  
  // Create a formatted version for export
  const exportData = {
    user: userEmail,
    exportDate: new Date().toISOString(),
    stats: JSON.parse(localStorage.getItem('userStats')),
    activity: userData
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create a blob
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intervu_data_${userEmail.replace('@', '_at_')}.json`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success message
  alert('Your data has been exported successfully!');
}