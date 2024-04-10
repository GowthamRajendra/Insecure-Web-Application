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


