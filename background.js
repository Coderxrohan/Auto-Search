let searchInterval;
let currentSearchCount = 0;
let maxSearchCount = 0;
let dictionary = [];
let currentTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startSearch') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      currentTabId = tab.id;
      startAutomatedSearch(message.refreshTime, message.searchCount);
    });
  } else if (message.action === 'stopSearch') {
    stopAutomatedSearch();
  }
});

async function startAutomatedSearch(refreshTime, searchCount) {
  stopAutomatedSearch();
  
  maxSearchCount = searchCount;
  currentSearchCount = 0;
  
  try {
    const response = await fetch('default.csv');
    const data = await response.text();
    dictionary = data.split('\n')
      .map(line => {
        const parts = line.split(',');
        return parts[1] ? parts[1].trim() : null;
      })
      .filter(word => word && word !== 'Word');
  } catch (error) {
    console.error('Error loading dictionary:', error);
    return;
  }

  searchInterval = setInterval(performSearch, refreshTime * 1000);
  performSearch();
}

function stopAutomatedSearch() {
  if (searchInterval) {
    clearInterval(searchInterval);
    searchInterval = null;
  }
  currentSearchCount = 0;
  currentTabId = null;
}

function getRandomWord() {
  return dictionary[Math.floor(Math.random() * dictionary.length)];
}

async function performSearch() {
  if (currentSearchCount >= maxSearchCount || !currentTabId) {
    stopAutomatedSearch();
    return;
  }
  
  try {
    const tab = await chrome.tabs.get(currentTabId);
    if (tab) {
      const word = getRandomWord();
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(word)}`;
      console.log('Searching for:', word);
      
      await chrome.tabs.update(currentTabId, { url: searchUrl });
      currentSearchCount++;
    } else {
      stopAutomatedSearch();
    }
  } catch (error) {
    console.error('Tab no longer exists:', error);
    stopAutomatedSearch();
  }
} 