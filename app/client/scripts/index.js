document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('sec-level') !== null) {
        let securityText = document.getElementById('sec-level').innerText;
        
        // get security level cookie
        let cookie = document.cookie.split(';').find(cookie => cookie.includes('security='));
        let securityLevel = cookie ? cookie.split('=')[1] : 'Low';
        securityText = securityText + " " + securityLevel;
        document.getElementById('sec-level').innerText = securityText;
    }

    if (document.getElementById('sec-form') !== null) {
        document.getElementById('sec-form').addEventListener('submit', function(event) {
            // prevet form from submitting normally
            event.preventDefault();

            let formData = new FormData(event.target);

            fetch('/security', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "Security Level": formData.get('Security Level')
                })
            }).then(response => {
                return response.text();
            }).then(data => {
                console.log(data); // response fromserver
            }).catch(e => {
                console.log('Error: ' + e.message);
            });
        });
    }
});

