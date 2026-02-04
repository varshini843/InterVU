// script.js

// Language storage and loading
const languageSelect = document.getElementById('languageSelect');

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('selectedLanguage');
  if (savedLang) {
    languageSelect.value = savedLang;
    applyLanguage(savedLang);
  }
});

// Update language on selection change
languageSelect.addEventListener('change', () => {
  const selectedLang = languageSelect.value;
  localStorage.setItem('selectedLanguage', selectedLang);
  applyLanguage(selectedLang);
});

// Apply selected language (you can expand this function with real translations)
function applyLanguage(lang) {
  console.log(`Language changed to: ${lang}`);
  // Placeholder — replace this with actual translation logic if needed
}

// Typewriter effect
const headlineText = "Ace Every Interview with AI-Powered Precision";
let index = 0;
const speed = 70;

function typeWriter() {
  const headline = document.getElementById("headline");
  if (index < headlineText.length) {
    headline.innerHTML += headlineText.charAt(index);
    index++;
    setTimeout(typeWriter, speed);
  }
}

// Clear initial content to avoid flicker
document.getElementById("headline").innerHTML = "";
typeWriter();
