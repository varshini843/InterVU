// Dashboard functionality for InterVU

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
    return;
  }

  // Set user name and initials
  const userName = document.getElementById('userName');
  const userInitials = document.getElementById('userInitials');
  
  if (userName) {
    // Get user name from user metadata or email
    const fullName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
    userName.textContent = fullName;
  }
  
  if (userInitials) {
    // Get initials from full name or email
    const fullName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
    const nameParts = fullName.split(' ');
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
    logoutBtn.addEventListener('click', async function() {
      try {
        // Sign out using Supabase Auth
        if (window.authService) {
          await window.authService.signOut();
        }
      } catch (error) {
        console.error('Error signing out:', error);
      } finally {
        // Remove user from localStorage
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = 'login.html';
      }
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
  
  // Check if data already exists
  let activityData = {};
  if (localStorage.getItem('intervuUserActivity_' + userEmail)) {
    activityData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
    
    // Add a new login record
    activityData.logins.push({
      id: activityData.logins.length + 1,
      timestamp: now.getTime(),
      duration: 0 // Will be updated on logout/session end
    });
    
    // Update goals based on current stats
    activityData.goals.forEach(goal => {
      if (goal.category === 'interview') {
        goal.current = Math.min(userStats.interviewSessions, goal.target);
        goal.completed = goal.current >= goal.target;
        if (goal.completed && !goal.completedAt) {
          goal.completedAt = now.getTime();
        }
      } else if (goal.category === 'resume') {
        goal.current = Math.min(userStats.resumesCreated, goal.target);
        goal.completed = goal.current >= goal.target;
        if (goal.completed && !goal.completedAt) {
          goal.completedAt = now.getTime();
        }
      } else if (goal.category === 'time') {
        goal.current = Math.min(Math.floor(userStats.totalPracticeTime / 60), goal.target);
        goal.completed = goal.current >= goal.target;
        if (goal.completed && !goal.completedAt) {
          goal.completedAt = now.getTime();
        }
      }
    });
    
    // Update achievements based on current stats
    updateAchievementsBasedOnStats(activityData, userStats, now);
    
    localStorage.setItem('intervuUserActivity_' + userEmail, JSON.stringify(activityData));
    return;
  }
  
  // Initialize with real data structure
  activityData = {
    interviews: [],
    resumes: [],
    chats: [],
    logins: [
      {
        id: 1,
        timestamp: now.getTime(),
        duration: 0 // Will be updated on logout/session end
      }
    ],
    goals: [
      {
        id: 1,
        title: "Complete 5 practice interviews",
        target: 5,
        current: Math.min(userStats.interviewSessions, 5),
        category: "interview",
        createdAt: now.getTime(),
        completed: userStats.interviewSessions >= 5,
        completedAt: userStats.interviewSessions >= 5 ? now.getTime() : null
      },
      {
        id: 2,
        title: "Create 3 different resumes",
        target: 3,
        current: Math.min(userStats.resumesCreated, 3),
        category: "resume",
        createdAt: now.getTime(),
        completed: userStats.resumesCreated >= 3,
        completedAt: userStats.resumesCreated >= 3 ? now.getTime() : null
      },
      {
        id: 3,
        title: "Spend 2 hours on interview prep",
        target: 2,
        current: Math.min(Math.floor(userStats.totalPracticeTime / 60), 2),
        category: "time",
        completed: Math.floor(userStats.totalPracticeTime / 60) >= 2,
        createdAt: now.getTime(),
        completedAt: Math.floor(userStats.totalPracticeTime / 60) >= 2 ? now.getTime() : null
      }
    ],
    achievements: [],
    lockedAchievements: [
      {
        id: "first_interview",
        name: "First Interview",
        description: "Complete your first practice interview",
        requirement: 1,
        progress: userStats.interviewSessions,
        icon: "star"
      },
      {
        id: "resume_pro",
        name: "Resume Pro",
        description: "Create 3 different resumes",
        requirement: 3,
        progress: userStats.resumesCreated,
        icon: "file"
      },
      {
        id: "chatty",
        name: "Chatty",
        description: "Have 10+ AI chat sessions",
        requirement: 10,
        progress: userStats.chatbotInteractions,
        icon: "comments"
      },
      {
        id: "interview_master",
        name: "Interview Master",
        description: "Complete 10 interviews",
        requirement: 10,
        progress: userStats.interviewSessions,
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
  
  // Add activity records based on existing stats
  if (userStats.interviewSessions > 0) {
    for (let i = 0; i < userStats.interviewSessions; i++) {
      // Create a timestamp in the past (random between 1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      
      activityData.interviews.push({
        id: i + 1,
        timestamp: timestamp.getTime(),
        duration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        details: { score: Math.floor(Math.random() * 40) + 60 } // 60-100 score
      });
    }
  }
  
  if (userStats.resumesCreated > 0) {
    for (let i = 0; i < userStats.resumesCreated; i++) {
      // Create a timestamp in the past (random between 1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      
      activityData.resumes.push({
        id: i + 1,
        timestamp: timestamp.getTime(),
        duration: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
        details: { template: ['modern', 'minimalist', 'creative', 'traditional'][Math.floor(Math.random() * 4)] }
      });
    }
  }
  
  if (userStats.chatbotInteractions > 0) {
    for (let i = 0; i < userStats.chatbotInteractions; i++) {
      // Create a timestamp in the past (random between 1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      
      activityData.chats.push({
        id: i + 1,
        timestamp: timestamp.getTime(),
        duration: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
        details: { messages: Math.floor(Math.random() * 10) + 3 } // 3-13 messages
      });
    }
  }
  
  // Sort all activities by timestamp
  activityData.interviews.sort((a, b) => a.timestamp - b.timestamp);
  activityData.resumes.sort((a, b) => a.timestamp - b.timestamp);
  activityData.chats.sort((a, b) => a.timestamp - b.timestamp);
  
  // Update achievements based on current stats
  updateAchievementsBasedOnStats(activityData, userStats, now);

  localStorage.setItem('intervuUserActivity_' + userEmail, JSON.stringify(activityData));
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
  // Record activity every minute
  const activityInterval = setInterval(() => {
    const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
    
    if (!userData) {
      clearInterval(activityInterval);
      return;
    }
    
    // Update last login duration
    if (userData.logins && userData.logins.length > 0) {
      const lastLogin = userData.logins[userData.logins.length - 1];
      lastLogin.duration = Math.floor((new Date().getTime() - lastLogin.timestamp) / 60000); // minutes
      
      localStorage.setItem('intervuUserActivity_' + userEmail, JSON.stringify(userData));
      
      // Update time spent display
      updateTimeSpentDisplay(userData);
    }
  }, 60000); // Update every minute

  // Handle page unload
  window.addEventListener('beforeunload', function() {
    clearInterval(activityInterval);
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
  
  // Filter data by date range if needed
  const filteredData = filterDataByDays(userData, days);
  
  // Update stats
  updateStatCards(filteredData, userStats);
  
  // Update charts
  createActivityChart(filteredData, userStats);
  createPerformanceChart(filteredData, userStats);
  
  // Update timeline
  updateActivityTimeline(filteredData, userStats);
  
  // Update achievements
  updateAchievements(userData);
  
  // Update goals
  updateGoals(userData);
  
  // Update notifications
  updateNotifications(userData);
}

// Filter data by days
function filterDataByDays(userData, days) {
  if (days === 'all') return userData;
  
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTime = cutoffDate.getTime();
  
  const filteredData = {...userData};
  
  // Filter each activity type
  filteredData.interviews = userData.interviews.filter(item => item.timestamp >= cutoffTime);
  filteredData.resumes = userData.resumes.filter(item => item.timestamp >= cutoffTime);
  filteredData.chats = userData.chats.filter(item => item.timestamp >= cutoffTime);
  filteredData.logins = userData.logins.filter(item => item.timestamp >= cutoffTime);
  
  return filteredData;
}

// Update stat cards
function updateStatCards(userData, userStats) {
  // Update interview count
  const interviewCount = document.getElementById('interviewCount');
  if (interviewCount) {
    interviewCount.textContent = userStats.interviewSessions;
    
    // Update change percentage
    const interviewChange = document.querySelector('.stat-change.interview');
    if (interviewChange) {
      const lastWeekCount = userData.interviews.filter(item => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= weekAgo.getTime();
      }).length;
      
      const twoWeeksAgoCount = userData.interviews.filter(item => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= twoWeeksAgo.getTime() && item.timestamp < weekAgo.getTime();
      }).length;
      
      if (twoWeeksAgoCount > 0) {
        const changePercent = Math.round((lastWeekCount - twoWeeksAgoCount) / twoWeeksAgoCount * 100);
        interviewChange.innerHTML = `<i class="fas fa-${changePercent >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(changePercent)}% from last week`;
        interviewChange.className = `stat-change interview ${changePercent >= 0 ? 'positive' : 'negative'}`;
      } else if (lastWeekCount > 0) {
        interviewChange.innerHTML = `<i class="fas fa-arrow-up"></i> New this week`;
        interviewChange.className = 'stat-change interview positive';
      } else {
        interviewChange.innerHTML = `No change`;
        interviewChange.className = 'stat-change interview';
      }
    }
  }
  
  // Update resume count
  const resumeCount = document.getElementById('resumeCount');
  if (resumeCount) {
    resumeCount.textContent = userStats.resumesCreated;
    
    // Update change percentage
    const resumeChange = document.querySelector('.stat-change.resume');
    if (resumeChange) {
      const lastWeekCount = userData.resumes.filter(item => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= weekAgo.getTime();
      }).length;
      
      const twoWeeksAgoCount = userData.resumes.filter(item => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= twoWeeksAgo.getTime() && item.timestamp < weekAgo.getTime();
      }).length;
      
      if (twoWeeksAgoCount > 0) {
        const changePercent = Math.round((lastWeekCount - twoWeeksAgoCount) / twoWeeksAgoCount * 100);
        resumeChange.innerHTML = `<i class="fas fa-${changePercent >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(changePercent)}% from last week`;
        resumeChange.className = `stat-change resume ${changePercent >= 0 ? 'positive' : 'negative'}`;
      } else if (lastWeekCount > 0) {
        resumeChange.innerHTML = `<i class="fas fa-arrow-up"></i> New this week`;
        resumeChange.className = 'stat-change resume positive';
      } else {
        resumeChange.innerHTML = `No change`;
        resumeChange.className = 'stat-change resume';
      }
    }
  }
  
  // Update chat count
  const chatCount = document.getElementById('chatCount');
  if (chatCount) {
    chatCount.textContent = userStats.chatbotInteractions;
    
    // Update change percentage
    const chatChange = document.querySelector('.stat-change.chat');
    if (chatChange) {
      const lastWeekCount = userData.chats.filter(item => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= weekAgo.getTime();
      }).length;
      
      const twoWeeksAgoCount = userData.chats.filter(item => {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return item.timestamp >= twoWeeksAgo.getTime() && item.timestamp < weekAgo.getTime();
      }).length;
      
      if (twoWeeksAgoCount > 0) {
        const changePercent = Math.round((lastWeekCount - twoWeeksAgoCount) / twoWeeksAgoCount * 100);
        chatChange.innerHTML = `<i class="fas fa-${changePercent >= 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(changePercent)}% from last week`;
        chatChange.className = `stat-change chat ${changePercent >= 0 ? 'positive' : 'negative'}`;
      } else if (lastWeekCount > 0) {
        chatChange.innerHTML = `<i class="fas fa-arrow-up"></i> New this week`;
        chatChange.className = 'stat-change chat positive';
      } else {
        chatChange.innerHTML = `No change`;
        chatChange.className = 'stat-change chat';
      }
    }
  }
  
  // Update time spent
  updateTimeSpentDisplay(userData, userStats);
}

// Update time spent display
function updateTimeSpentDisplay(userData, userStats) {
  const timeSpent = document.getElementById('timeSpent');
  if (!timeSpent) return;
  
  // Use the total practice time from userStats
  const totalMinutes = userStats ? userStats.totalPracticeTime : 0;
  
  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // Display format
  if (hours > 0) {
    timeSpent.textContent = `${hours}${minutes > 0 ? '.' + Math.floor(minutes / 6) : ''}h`;
  } else {
    timeSpent.textContent = `${minutes}m`;
  }
}

// Create activity chart
function createActivityChart(userData, userStats) {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;
  
  // Prepare data for last 7 days
  const labels = [];
  const interviewData = Array(7).fill(0);
  const resumeData = Array(7).fill(0);
  const chatData = Array(7).fill(0);
  
  // Generate labels for last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  
  // Count activities per day
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Process interviews
  userData.interviews.forEach(interview => {
    const date = new Date(interview.timestamp);
    const interviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayDiff = Math.floor((today - interviewDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < 7) {
      interviewData[6 - dayDiff]++;
    }
  });
  
  // Process resumes
  userData.resumes.forEach(resume => {
    const date = new Date(resume.timestamp);
    const resumeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayDiff = Math.floor((today - resumeDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < 7) {
      resumeData[6 - dayDiff]++;
    }
  });
  
  // Process chats
  userData.chats.forEach(chat => {
    const date = new Date(chat.timestamp);
    const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayDiff = Math.floor((today - chatDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < 7) {
      chatData[6 - dayDiff]++;
    }
  });
  
  // Create chart
  if (window.activityChart) {
    window.activityChart.destroy();
  }
  
  window.activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Interviews',
          data: interviewData,
          backgroundColor: 'rgba(255, 77, 109, 0.7)',
          borderColor: 'rgba(255, 77, 109, 1)',
          borderWidth: 1
        },
        {
          label: 'Resumes',
          data: resumeData,
          backgroundColor: 'rgba(54, 185, 204, 0.7)',
          borderColor: 'rgba(54, 185, 204, 1)',
          borderWidth: 1
        },
        {
          label: 'AI Chats',
          data: chatData,
          backgroundColor: 'rgba(78, 115, 223, 0.7)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  });
}

// Create performance chart
function createPerformanceChart(userData, userStats) {
  const ctx = document.getElementById('performanceChart');
  if (!ctx) return;
  
  // Generate performance data based on interview data
  const performanceData = [];
  const labels = [];
  
  // Sort interviews by timestamp
  const sortedInterviews = [...userData.interviews].sort((a, b) => a.timestamp - b.timestamp);
  
  // Generate data points based on interviews
  sortedInterviews.forEach((interview, index) => {
    labels.push(`Interview ${index + 1}`);
    
    // Use score from details if available, otherwise generate one
    let score;
    if (interview.details && interview.details.score) {
      score = interview.details.score;
    } else {
      // Generate a performance score that generally improves over time (with some variation)
      const baseScore = 50 + (index * 2.5); // Base score increases with each interview
      const variation = Math.random() * 10 - 5; // Random variation between -5 and 5
      score = Math.min(Math.max(baseScore + variation, 0), 100); // Ensure score is between 0 and 100
      
      // Save the generated score for future reference
      if (!interview.details) interview.details = {};
      interview.details.score = score;
    }
    
    performanceData.push(score);
  });
  
  // If no interviews yet, show sample data
  if (sortedInterviews.length === 0) {
    labels.push('Sample');
    performanceData.push(50);
  }
  
  // Create chart
  if (window.performanceChart) {
    window.performanceChart.destroy();
  }
  
  window.performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Interview Performance',
        data: performanceData,
        fill: false,
        borderColor: 'rgba(255, 77, 109, 1)',
        tension: 0.1,
        pointBackgroundColor: 'rgba(255, 77, 109, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Performance Score'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Score: ${context.parsed.y.toFixed(1)}%`;
            }
          }
        }
      }
    }
  });
  
  // Save updated interview data with scores
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (currentUser) {
    localStorage.setItem('intervuUserActivity_' + currentUser.email, JSON.stringify(userData));
  }
}

// Update activity timeline
function updateActivityTimeline(userData, userStats) {
  const timeline = document.getElementById('activityTimeline');
  if (!timeline) return;
  
  // Clear existing content
  timeline.innerHTML = '';
  
  // Combine all activities
  const allActivities = [
    ...userData.interviews,
    ...userData.resumes,
    ...userData.chats,
    ...userData.logins
  ];
  
  // Sort by timestamp (most recent first)
  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  
  // Take only the most recent 10 activities
  const recentActivities = allActivities.slice(0, 10);
  
  // Create timeline items
  recentActivities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    // Determine activity type
    let type = '';
    if (userData.interviews.includes(activity)) type = 'interview';
    else if (userData.resumes.includes(activity)) type = 'resume';
    else if (userData.chats.includes(activity)) type = 'chat';
    else type = 'login';
    
    // Activity icon
    const iconClass = type === 'interview' ? 'interview' : 
                     type === 'resume' ? 'resume' : 
                     type === 'chat' ? 'chat' : 'login';
    
    const iconName = type === 'interview' ? 'microphone' : 
                    type === 'resume' ? 'file-alt' : 
                    type === 'chat' ? 'comments' : 'sign-in-alt';
    
    // Activity title
    const title = type === 'interview' ? 'Completed an interview practice' : 
                 type === 'resume' ? 'Created a resume' : 
                 type === 'chat' ? 'Had an AI chat session' : 'Logged in';
    
    // Format time
    const timeAgo = getTimeAgo(activity.timestamp);
    
    // Create HTML
    activityItem.innerHTML = `
      <div class="activity-icon ${iconClass}">
        <i class="fas fa-${iconName}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${title}</div>
        <div class="activity-time">${timeAgo}</div>
      </div>
    `;
    
    timeline.appendChild(activityItem);
  });
  
  // If no activities
  if (recentActivities.length === 0) {
    timeline.innerHTML = '<div class="no-activity">No recent activity to display.</div>';
  }
}

// Update achievements section
function updateAchievements(userData) {
  const achievementsList = document.querySelector('.achievements-list');
  if (!achievementsList) return;
  
  // Clear existing content
  achievementsList.innerHTML = '';
  
  // Add unlocked achievements
  userData.achievements.forEach(achievement => {
    const achievementItem = document.createElement('div');
    achievementItem.className = 'achievement';
    achievementItem.innerHTML = `
      <div class="achievement-icon unlocked">
        <i class="fas fa-${achievement.icon}"></i>
      </div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
    `;
    achievementsList.appendChild(achievementItem);
  });
  
  // Add locked achievements
  userData.lockedAchievements.forEach(achievement => {
    const achievementItem = document.createElement('div');
    achievementItem.className = 'achievement';
    achievementItem.innerHTML = `
      <div class="achievement-icon locked">
        <i class="fas fa-${achievement.icon}"></i>
      </div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
    `;
    achievementsList.appendChild(achievementItem);
  });
  
  // If no achievements
  if (userData.achievements.length === 0 && userData.lockedAchievements.length === 0) {
    achievementsList.innerHTML = '<div class="no-achievements">No achievements available.</div>';
  }
}

// Update goals section
function updateGoals(userData) {
  const goalsList = document.querySelector('.goals-list');
  if (!goalsList) return;
  
  // Clear existing content
  goalsList.innerHTML = '';
  
  // Add goals
  userData.goals.forEach(goal => {
    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    const statusClass = goal.completed ? 'completed' : 'in-progress';
    const statusText = goal.completed ? 'Completed' : 'In Progress';
    
    const goalItem = document.createElement('div');
    goalItem.className = 'goal-item';
    goalItem.innerHTML = `
      <div class="goal-header">
        <div class="goal-title">${goal.title}</div>
        <div class="goal-status ${statusClass}">${statusText}</div>
      </div>
      <div class="goal-progress">
        <div class="goal-progress-bar ${goal.category}" style="width: ${progress}%"></div>
      </div>
      <div class="goal-details">
        <div>${goal.current}/${goal.target} ${goal.category === 'time' ? 'hours' : 'completed'}</div>
        <div>${progress}%</div>
      </div>
    `;
    goalsList.appendChild(goalItem);
  });
  
  // If no goals
  if (userData.goals.length === 0) {
    goalsList.innerHTML = '<div class="no-goals">No goals available.</div>';
  }
}

// Update notifications section
function updateNotifications(userData) {
  const notificationsList = document.querySelector('.notifications-list');
  if (!notificationsList) return;
  
  // Clear existing content
  notificationsList.innerHTML = '';
  
  // Sort notifications by timestamp (most recent first)
  const sortedNotifications = [...userData.notifications].sort((a, b) => b.timestamp - a.timestamp);
  
  // Add notifications
  sortedNotifications.forEach(notification => {
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    
    // Format time
    const timeAgo = getTimeAgo(notification.timestamp);
    
    // Create actions HTML
    const actionsHTML = notification.actions ? notification.actions.map(action => 
      `<div class="notification-action">${action}</div>`
    ).join('') : '';
    
    notificationItem.innerHTML = `
      <div class="notification-icon ${notification.type}">
        <i class="fas fa-${notification.type === 'alert' ? 'bell' : notification.type === 'info' ? 'info-circle' : 'trophy'}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-desc">${notification.description}</div>
        <div class="notification-time">${timeAgo}</div>
        ${actionsHTML ? `<div class="notification-actions">${actionsHTML}</div>` : ''}
      </div>
    `;
    
    notificationsList.appendChild(notificationItem);
  });
  
  // If no notifications
  if (sortedNotifications.length === 0) {
    notificationsList.innerHTML = '<div class="no-notifications">No notifications available.</div>';
  }
}

// Get time ago string
function getTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : interval + ' years ago';
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : interval + ' months ago';
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : interval + ' days ago';
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : interval + ' hours ago';
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : interval + ' minutes ago';
  }
  
  return 'Just now';
}

// Export user data
function exportUserData(userEmail) {
  const userData = JSON.parse(localStorage.getItem('intervuUserActivity_' + userEmail));
  
  if (!userData) {
    alert('No data to export');
    return;
  }
  
  // Get user stats
  const userStats = JSON.parse(localStorage.getItem('userStats')) || {
    interviewSessions: 0,
    chatbotInteractions: 0,
    totalPracticeTime: 0,
    resumesCreated: 0
  };
  
  // Format data for export
  const exportData = {
    user: userEmail,
    exportDate: new Date().toISOString(),
    stats: {
      totalInterviews: userStats.interviewSessions,
      totalResumes: userStats.resumesCreated,
      totalChats: userStats.chatbotInteractions,
      totalPracticeTime: userStats.totalPracticeTime,
      achievements: userData.achievements.length
    },
    activityData: userData
  };
  
  // Convert to JSON string
  const dataStr = JSON.stringify(exportData, null, 2);
  
  // Create download link
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'intervu-activity-report.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}