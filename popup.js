let dictionary = [];

// Load default dictionary from CSV when extension loads
fetch('default.csv')
  .then(response => response.text())
  .then(data => {
    dictionary = data.split(',').map(word => word.trim());
  })
  .catch(error => console.error('Error loading default dictionary:', error));

document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('startSearch');
  const stopButton = document.getElementById('stopSearch');
  const fileInput = document.getElementById('dictionary');
  
  startButton.addEventListener('click', startSearching);
  stopButton.addEventListener('click', stopSearching);
  fileInput.addEventListener('change', handleFileUpload);
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const words = e.target.result.split('\n')
        .map(line => {
          const parts = line.split(',');
          return parts[1] ? parts[1].trim() : null;
        })
        .filter(word => word && word !== 'Word');
      chrome.storage.local.set({ customDictionary: words });
    };
    reader.readAsText(file);
  }
}

function startSearching() {
  const refreshTime = document.getElementById('refreshTime').value;
  const searchCount = document.getElementById('searchCount').value;
  
  chrome.runtime.sendMessage({
    action: 'startSearch',
    refreshTime: parseInt(refreshTime),
    searchCount: parseInt(searchCount)
  });
}

function stopSearching() {
  chrome.runtime.sendMessage({ action: 'stopSearch' });
} 