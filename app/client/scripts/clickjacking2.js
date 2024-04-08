document.addEventListener("DOMContentLoaded", function() {
    var body = document.getElementsByTagName("body")[0];
    var iframeContainer = document.createElement("div");
    iframeContainer.id = "runtime";
    var iframe = document.createElement("background");
    iframe.src = "https://example.com"; // Set the iframe source
    iframeContainer.appendChild(iframe);
    body.appendChild(iframeContainer);
  });

function handleClick() {
    var textarea = document.getElementById('myTextarea');

    var text = textarea.value;
    alert('Feedback received: ' + text);
  }


