document.addEventListener('DOMContentLoaded', function() {
    console.log('Bug 3');
});

function handleClick() {
    var textarea = document.getElementById('myTextarea');

    var text = textarea.value;
    alert('Feedback received: ' + text);
}

function changeDifficulty() {
    var select = document.getElementById('difficulty');
    var value = select.value;
    if (value) {
      window.location = value;
    }
}


