// related to miscellaneous js functions and styles for the xxe page

document.addEventListener('DOMContentLoaded', function() {

    let cookie = document.cookie.split(';').find(cookie => cookie.includes('security='));
    let securityLevel = cookie ? cookie.split('=')[1] : 'Low';

    if (securityLevel === 'High') {
        // hide the secret submission form
        document.getElementById('secret-form').classList.add('is-hidden');
    }

    // show the file name when a file is selected
    const fileInput = document.querySelector(".file-input");
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            const fileName = document.querySelector(".file-name");
            fileName.textContent = fileInput.files[0].name;
        }
    };

    // from bulma documentation for modals

    // Functions to open and close a modal
    function openModal($el) {
        $el.classList.add('is-active');
    }

    function closeModal($el) {
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.modal-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        if(event.key === "Escape") {
            closeAllModals();
        }
    });

});