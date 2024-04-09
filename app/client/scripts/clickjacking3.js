const devtools = { isOpen: false };
const threshold = 160;

window.addEventListener('resize', () => {
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  if (widthThreshold || heightThreshold) {
    if (!devtools.isOpen) {
      devtools.isOpen = true;
      window.location.href = '../pages/index.html';
    }
  } else {
    devtools.isOpen = false;
  }
});

window.addEventListener('keydown', function(event) {
    // Check if 'Ctrl+Shift+C' was pressed
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      console.log('Ctrl+Shift+C was pressed but it was disabled.');
    }
    // Check if 'Ctrl+Shift+J' was pressed
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        console.log('Ctrl+Shift+J was pressed but it was disabled.');
      }
    // Check if 'Ctrl+Shift+I' was pressed
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      console.log('Ctrl+Shift+I was pressed but it was disabled.');
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const body = document.getElementsByTagName("body")[0];
    const iframeContainer = document.createElement("div");

    iframeContainer.id = "runtime";
    const iframe = document.createElement("background");
    iframe.src = "../pages/clickjacking_levels/clickjacking_low.html";
    
    iframeContainer.appendChild(iframe);
    body.appendChild(iframeContainer);
});

function handleClick() {
    const textarea = document.getElementById('myTextarea');

    const text = textarea.value;
    alert('Feedback received: ' + text);
}


