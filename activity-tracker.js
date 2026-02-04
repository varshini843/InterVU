// Activity Tracker for InterVU
// This file provides functions to track user activity across the application

// Global variables to store activity data
let userActivities = {
  interviews: [],
  resumes: [],
  chats: [],
  logins: []
};

let userStats = {
  interviewSessions: 0,
  chatbotInteractions: 0,
  totalPracticeTime: 0,
  resumesCreated: 0,
  lastUpdated: new Date()
};

let userGoals = [];
let userAchievements = [];
let lockedAchievements = [];
let userNotifications = [];

// Initialize when the script loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Activity tracker initialized');
  
  // Load data from localStorage if available
  loadUserDataFromStorage();
  
  // Set up interval to save data periodically
  setInterval(saveUserDataToStorage, 60000); // Save every minute
  
  // Set up interval to update activity durations
  setInterval(updateActivityDurations, 60000); // Update every minute
  
  // Set up beforeunload event to save data when user leaves
  window.addEventListener('beforeunload', function() {
    saveUserDataToStorage();
  });
  
  // Track page visit
  trackPageVisit();
});

// Load user data from localStorage
function loadUserDataFromStorage() {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const userId = currentUser.id || currentUser.email;
  
  // Load activities
  const storedActivities = localStorage.getItem(`intervu_activities_${userId}`);
  if (storedActivities) {
    userActivities = JSON.parse(storedActivities);
  }
  
  // Load stats
  const storedStats = localStorage.getItem(`intervu_stats_${userId}`);
  if (storedStats) {
    userStats = JSON.parse(storedStats);
  }
  
  // Load goals
  const storedGoals = localStorage.getItem(`intervu_goals_${userId}`);
  if (storedGoals) {
    userGoals = JSON.parse(storedGoals);
  } else {
    // Initialize default goals
    initializeDefaultGoals();
  }
  
  // Load achievements
  const storedAchievements = localStorage.getItem(`intervu_achievements_${userId}`);
  if (storedAchievements) {
    userAchievements = JSON.parse(storedAchievements);
  }
  
  // Load locked achievements
  const storedLockedAchievements = localStorage.getItem(`intervu_locked_achievements_${userId}`);
  if (storedLockedAchievements) {
    lockedAchievements = JSON.parse(storedLockedAchievements);
  } else {
    // Initialize default locked achievements
    initializeDefaultAchievements();
  }
  
  // Load notifications
  const storedNotifications = localStorage.getItem(`intervu_notifications_${userId}`);
  if (storedNotifications) {
    userNotifications = JSON.parse(storedNotifications);
  } else {
    // Add welcome notification
    addNotification('info', 'Welcome to Your Dashboard', 'Track your progress and achievements as you prepare for interviews.');
  }
}

// Save user data to localStorage
function saveUserDataToStorage() {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const userId = currentUser.id || currentUser.email;
  
  // Save activities
  localStorage.setItem(`intervu_activities_${userId}`, JSON.stringify(userActivities));
  
  // Save stats
  userStats.lastUpdated = new Date();
  localStorage.setItem(`intervu_stats_${userId}`, JSON.stringify(userStats));
  
  // Save goals
  localStorage.setItem(`intervu_goals_${userId}`, JSON.stringify(userGoals));
  
  // Save achievements
  localStorage.setItem(`intervu_achievements_${userId}`, JSON.stringify(userAchievements));
  
  // Save locked achievements
  localStorage.setItem(`intervu_locked_achievements_${userId}`, JSON.stringify(lockedAchievements));
  
  // Save notifications
  localStorage.setItem(`intervu_notifications_${userId}`, JSON.stringify(userNotifications));
}

// Initialize default goals
function initializeDefaultGoals() {
  const now = new Date();
  
  userGoals = [
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
      createdAt: now.getTime(),
      completed: Math.floor(userStats.totalPracticeTime / 60) >= 2,
      completedAt: Math.floor(userStats.totalPracticeTime / 60) >= 2 ? now.getTime() : null
    }
  ];
}

// Initialize default achievements
function initializeDefaultAchievements() {
  lockedAchievements = [
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
  ];
  
  // Check if any achievements should be unlocked based on current stats
  checkAchievements();
}

// Track page visit
function trackPageVisit() {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return;
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  console.log('Tracking page visit:', currentPage);
  
  // Track login activity if this is the first visit in this session
  if (!sessionStorage.getItem('intervu_session_started')) {
    console.log('Starting new session');
    trackActivity('login', { page: currentPage });
    sessionStorage.setItem('intervu_session_started', 'true');
    sessionStorage.setItem('intervu_session_start_time', new Date().getTime().toString());
    
    // Add welcome back notification
    addNotification('info', 'Welcome Back!', 
      `Good to see you again, ${currentUser.name || 'User'}! Continue your interview preparation.`);
  }
  
  // Track page-specific activities
  if (currentPage === 'interview.html') {
    // Start tracking interview session
    if (!sessionStorage.getItem('interview_session_started')) {
      console.log('Starting interview session tracking');
      sessionStorage.setItem('interview_session_started', 'true');
      sessionStorage.setItem('interview_session_start_time', new Date().getTime().toString());
    }
  } else if (currentPage === 'resume.html') {
    // Start tracking resume session
    if (!sessionStorage.getItem('resume_session_started')) {
      console.log('Starting resume session tracking');
      sessionStorage.setItem('resume_session_started', 'true');
      sessionStorage.setItem('resume_session_start_time', new Date().getTime().toString());
    }
  } else if (currentPage === 'chatbot.html') {
    // Start tracking chat session
    if (!sessionStorage.getItem('chat_session_started')) {
      console.log('Starting chat session tracking');
      sessionStorage.setItem('chat_session_started', 'true');
      sessionStorage.setItem('chat_session_start_time', new Date().getTime().toString());
      trackActivity('chat', { started: true });
    }
  } else if (currentPage === 'dashboard.html' || currentPage === 'dashboard-new.html') {
    // Update dashboard data
    console.log('Dashboard visit - checking achievements and goals');
    checkAchievements();
    updateGoals();
  }
}

// Track user activity
function trackActivity(activityType, details = {}) {
  const currentUser = JSON.parse(localStorage.getItem('intervuCurrentUser'));
  if (!currentUser) return null;
  
  const now = new Date();
  
  // Create new activity record
  const newActivity = {
    id: generateUniqueId(),
    timestamp: now.getTime(),
    duration: 0,
    details: details
  };
  
  // Add to appropriate activity type
  switch (activityType) {
    case 'interview':
      userActivities.interviews.push(newActivity);
      userStats.interviewSessions++;
      break;
    case 'resume':
      userActivities.resumes.push(newActivity);
      userStats.resumesCreated++;
      break;
    case 'chat':
      userActivities.chats.push(newActivity);
      userStats.chatbotInteractions++;
      break;
    case 'login':
      userActivities.logins.push(newActivity);
      break;
    default:
      console.error('Unknown activity type:', activityType);
      return null;
  }
  
  // Save data
  saveUserDataToStorage();
  
  // Check achievements and goals
  checkAchievements();
  updateGoals();
  
  return newActivity.id;
}

// Update activity durations
function updateActivityDurations() {
  const now = new Date().getTime();
  const sessionStartTime = parseInt(sessionStorage.getItem('intervu_session_start_time') || '0');
  
  console.log('Updating activity durations, session start time:', new Date(sessionStartTime));
  
  // Update durations for all active activities
  ['interviews', 'resumes', 'chats', 'logins'].forEach(type => {
    userActivities[type].forEach(activity => {
      // Only update activities from the current session
      if (activity.timestamp >= sessionStartTime) {
        const previousDuration = activity.duration || 0;
        const durationMinutes = Math.floor((now - activity.timestamp) / 60000);
        
        // Only update if duration has changed
        if (durationMinutes > previousDuration) {
          console.log(`Updating ${type} activity duration from ${previousDuration} to ${durationMinutes} minutes`);
          
          // Calculate the increment
          const increment = durationMinutes - previousDuration;
          
          // Update the activity duration
          activity.duration = durationMinutes;
          
          // Update total practice time for interviews and chats
          if (type === 'interviews' || type === 'chats') {
            userStats.totalPracticeTime += increment;
            console.log(`Updated total practice time to ${userStats.totalPracticeTime} minutes`);
          }
        }
      }
    });
  });
  
  // Save updated data
  saveUserDataToStorage();
  
  // Check goals
  updateGoals();
}

// Check achievements
function checkAchievements() {
  const now = new Date().getTime();
  
  // Check each locked achievement
  lockedAchievements = lockedAchievements.filter(achievement => {
    let unlocked = false;
    
    // Update progress
    if (achievement.id === "first_interview" || achievement.id === "interview_master") {
      achievement.progress = userStats.interviewSessions;
      unlocked = userStats.interviewSessions >= achievement.requirement;
    } else if (achievement.id === "resume_pro") {
      achievement.progress = userStats.resumesCreated;
      unlocked = userStats.resumesCreated >= achievement.requirement;
    } else if (achievement.id === "chatty") {
      achievement.progress = userStats.chatbotInteractions;
      unlocked = userStats.chatbotInteractions >= achievement.requirement;
    }
    
    // If achievement is unlocked, move it to unlocked achievements
    if (unlocked) {
      userAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now,
        icon: achievement.icon
      });
      
      // Add notification
      addNotification('success', 'Achievement Unlocked', 
        `Congratulations! You've earned the "${achievement.name}" badge.`,
        ['View Achievements']);
      
      // Remove from locked achievements
      return false;
    }
    
    // Keep in locked achievements
    return true;
  });
  
  // Save updated data
  saveUserDataToStorage();
}

// Update goals
function updateGoals() {
  const now = new Date().getTime();
  
  // Update each goal
  userGoals.forEach(goal => {
    let updated = false;
    
    if (goal.category === 'interview') {
      const newCurrent = Math.min(userStats.interviewSessions, goal.target);
      if (newCurrent > goal.current) {
        goal.current = newCurrent;
        updated = true;
      }
    } else if (goal.category === 'resume') {
      const newCurrent = Math.min(userStats.resumesCreated, goal.target);
      if (newCurrent > goal.current) {
        goal.current = newCurrent;
        updated = true;
      }
    } else if (goal.category === 'time') {
      const newCurrent = Math.min(Math.floor(userStats.totalPracticeTime / 60), goal.target);
      if (newCurrent > goal.current) {
        goal.current = newCurrent;
        updated = true;
      }
    }
    
    // Check if goal is completed
    if (updated && goal.current >= goal.target && !goal.completed) {
      goal.completed = true;
      goal.completedAt = now;
      
      // Add notification
      addNotification('success', 'Goal Completed', 
        `Congratulations! You've completed your goal: "${goal.title}".`,
        ['View Goals']);
    }
  });
  
  // Save updated data
  saveUserDataToStorage();
}

// Add notification
function addNotification(type, title, description, actions = ['Got it']) {
  const now = new Date().getTime();
  
  userNotifications.push({
    id: generateUniqueId(),
    type: type,
    title: title,
    description: description,
    timestamp: now,
    read: false,
    actions: actions
  });
  
  // Sort notifications by timestamp (newest first)
  userNotifications.sort((a, b) => b.timestamp - a.timestamp);
  
  // Limit to 20 notifications
  if (userNotifications.length > 20) {
    userNotifications = userNotifications.slice(0, 20);
  }
  
  // Save updated data
  saveUserDataToStorage();
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
  const notification = userNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveUserDataToStorage();
    return true;
  }
  return false;
}

// Add a new goal
function addNewGoal(title, category, target) {
  const now = new Date().getTime();
  
  // Create new goal
  const newGoal = {
    id: generateUniqueId(),
    title: title,
    category: category,
    target: target,
    current: 0,
    createdAt: now,
    completed: false,
    completedAt: null
  };
  
  // Set initial progress based on current stats
  if (category === 'interview') {
    newGoal.current = Math.min(userStats.interviewSessions, target);
  } else if (category === 'resume') {
    newGoal.current = Math.min(userStats.resumesCreated, target);
  } else if (category === 'time') {
    newGoal.current = Math.min(Math.floor(userStats.totalPracticeTime / 60), target);
  }
  
  // Check if already completed
  if (newGoal.current >= newGoal.target) {
    newGoal.completed = true;
    newGoal.completedAt = now;
  }
  
  // Add to goals
  userGoals.push(newGoal);
  
  // Save updated data
  saveUserDataToStorage();
  
  return newGoal;
}

// Get user activity data
function getUserActivityData(days = 30) {
  const now = new Date().getTime();
  const startDate = now - (days * 24 * 60 * 60 * 1000);
  
  // Filter activities by date range
  const filteredInterviews = userActivities.interviews.filter(i => i.timestamp >= startDate);
  const filteredResumes = userActivities.resumes.filter(r => r.timestamp >= startDate);
  const filteredChats = userActivities.chats.filter(c => c.timestamp >= startDate);
  const filteredLogins = userActivities.logins.filter(l => l.timestamp >= startDate);
  
  return {
    stats: userStats,
    activities: {
      interviews: filteredInterviews,
      resumes: filteredResumes,
      chats: filteredChats,
      logins: filteredLogins
    },
    goals: userGoals,
    achievements: userAchievements,
    lockedAchievements: lockedAchievements,
    notifications: userNotifications
  };
}

// Export user data as CSV
function exportUserData() {
  const data = getUserActivityData(365); // Get all data for the past year
  
  // Combine all activities
  const allActivities = [
    ...data.activities.interviews.map(a => ({ ...a, type: 'Interview' })),
    ...data.activities.resumes.map(a => ({ ...a, type: 'Resume' })),
    ...data.activities.chats.map(a => ({ ...a, type: 'Chat' })),
    ...data.activities.logins.map(a => ({ ...a, type: 'Login' }))
  ];
  
  // Sort by timestamp (newest first)
  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Type,Date,Duration (minutes),Details\n";
  
  allActivities.forEach(activity => {
    const date = new Date(activity.timestamp).toLocaleString();
    const details = JSON.stringify(activity.details).replace(/"/g, '""');
    csvContent += `${activity.type},${date},${activity.duration},"${details}"\n`;
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `intervu-activity-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}

// Generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Get activity counts by day for charting
function getActivityCountsByDay(days = 30) {
  const data = getUserActivityData(days);
  const now = new Date();
  const result = [];
  
  // Create array of dates
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Count activities for this date
    const interviews = data.activities.interviews.filter(a => 
      new Date(a.timestamp).toISOString().split('T')[0] === dateStr
    ).length;
    
    const resumes = data.activities.resumes.filter(a => 
      new Date(a.timestamp).toISOString().split('T')[0] === dateStr
    ).length;
    
    const chats = data.activities.chats.filter(a => 
      new Date(a.timestamp).toISOString().split('T')[0] === dateStr
    ).length;
    
    result.unshift({
      date: dateStr,
      interviews: interviews,
      resumes: resumes,
      chats: chats,
      total: interviews + resumes + chats
    });
  }
  
  return result;
}

// Get time spent by activity type
function getTimeSpentByActivityType(days = 30) {
  const data = getUserActivityData(days);
  
  // Calculate total duration for each activity type
  const interviewTime = data.activities.interviews.reduce((total, a) => total + a.duration, 0);
  const resumeTime = data.activities.resumes.reduce((total, a) => total + a.duration, 0);
  const chatTime = data.activities.chats.reduce((total, a) => total + a.duration, 0);
  
  return {
    interviews: interviewTime,
    resumes: resumeTime,
    chats: chatTime,
    total: interviewTime + resumeTime + chatTime
  };
}

// Format time in hours and minutes
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}

// Get recent activities for timeline
function getRecentActivities(limit = 10) {
  const data = getUserActivityData(30);
  
  // Combine all activities
  const allActivities = [
    ...data.activities.interviews.map(a => ({ ...a, type: 'interview' })),
    ...data.activities.resumes.map(a => ({ ...a, type: 'resume' })),
    ...data.activities.chats.map(a => ({ ...a, type: 'chat' })),
    ...data.activities.logins.map(a => ({ ...a, type: 'login' }))
  ];
  
  // Sort by timestamp (newest first)
  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  
  // Return limited number
  return allActivities.slice(0, limit);
}

// Calculate percentage change from previous period
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Get stats comparison with previous period
function getStatsComparison(days = 30) {
  const currentData = getUserActivityData(days);
  
  // Get data for previous period
  const previousStartDate = new Date();
  previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
  const previousEndDate = new Date();
  previousEndDate.setDate(previousEndDate.getDate() - days);
  
  // Count activities in previous period
  const previousInterviews = userActivities.interviews.filter(i => 
    i.timestamp >= previousStartDate.getTime() && i.timestamp < previousEndDate.getTime()
  ).length;
  
  const previousResumes = userActivities.resumes.filter(r => 
    r.timestamp >= previousStartDate.getTime() && r.timestamp < previousEndDate.getTime()
  ).length;
  
  const previousChats = userActivities.chats.filter(c => 
    c.timestamp >= previousStartDate.getTime() && c.timestamp < previousEndDate.getTime()
  ).length;
  
  // Calculate time spent in previous period
  const previousInterviewTime = userActivities.interviews
    .filter(i => i.timestamp >= previousStartDate.getTime() && i.timestamp < previousEndDate.getTime())
    .reduce((total, a) => total + a.duration, 0);
  
  const previousResumeTime = userActivities.resumes
    .filter(r => r.timestamp >= previousStartDate.getTime() && r.timestamp < previousEndDate.getTime())
    .reduce((total, a) => total + a.duration, 0);
  
  const previousChatTime = userActivities.chats
    .filter(c => c.timestamp >= previousStartDate.getTime() && c.timestamp < previousEndDate.getTime())
    .reduce((total, a) => total + a.duration, 0);
  
  const previousTotalTime = previousInterviewTime + previousResumeTime + previousChatTime;
  
  // Count activities in current period
  const currentInterviews = currentData.activities.interviews.length;
  const currentResumes = currentData.activities.resumes.length;
  const currentChats = currentData.activities.chats.length;
  
  // Calculate time spent in current period
  const currentInterviewTime = currentData.activities.interviews.reduce((total, a) => total + a.duration, 0);
  const currentResumeTime = currentData.activities.resumes.reduce((total, a) => total + a.duration, 0);
  const currentChatTime = currentData.activities.chats.reduce((total, a) => total + a.duration, 0);
  const currentTotalTime = currentInterviewTime + currentResumeTime + currentChatTime;
  
  // Calculate percentage changes
  return {
    interviews: {
      current: currentInterviews,
      previous: previousInterviews,
      change: calculatePercentageChange(currentInterviews, previousInterviews)
    },
    resumes: {
      current: currentResumes,
      previous: previousResumes,
      change: calculatePercentageChange(currentResumes, previousResumes)
    },
    chats: {
      current: currentChats,
      previous: previousChats,
      change: calculatePercentageChange(currentChats, previousChats)
    },
    timeSpent: {
      current: currentTotalTime,
      previous: previousTotalTime,
      change: calculatePercentageChange(currentTotalTime, previousTotalTime)
    }
  };
}