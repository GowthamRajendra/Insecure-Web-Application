const userPostTemplate = document.querySelector("[data-post-template]");
const userPostContainer = document.getElementById("post-container");
const searchPostsBtn = document.getElementById("search-posts-btn");
const searchPostsBar = document.getElementById("search-posts-bar");
const loginForm = document.getElementById("loginform");
const profilePostContainer = document.getElementById("profile-post-container");
const loginNotification = document.getElementById('login-notif');
const registerForm = document.getElementById("registerform");
const postForm = document.getElementById("postform");
const postNotification = document.getElementById("post-notif");
const completedNotification = document.getElementById("completed-notif");

document.addEventListener('DOMContentLoaded', function() {
    if(userPostContainer) {
        getSearchedPosts();
    }

    if (profilePostContainer) {
        getProfilePosts();
    }

    checkIfCompleted();
});

if (postForm) {
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createPost();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    })
}

if (searchPostsBtn) {
    searchPostsBtn.addEventListener('click', getSearchedPosts);
}

async function checkIfCompleted() {
    let res = await fetch("/bug2/completed");
    let res_json = await res.json();

    if (res_json.completed) {
        completedNotification.innerText = res_json.msg;
        completedNotification.style = 'block'; 
    }
}

async function createPost() {
    let title = document.getElementById("post-title").value;
    let message = document.getElementById("post-message").value;

    let res = await fetch(`/bug2/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: 'follow',
        body: JSON.stringify({
            title: title,
            message: message
        })
    })
    .catch(err => console.error('Error:', err));
    console.log(res);
    
    let res_text = await res.text()
    .catch(err => console.error('Error:', err));
    console.log(res_text);
    
    // redirect on successful login
    if (res.redirected) {
        // console.log(`redirecting to: ${login_res.url}`);
        window.location.href = res.url;
    }
    // show errors in notification above login form
    else if (res.status === 401) {
        postNotification.innerText = res_text;
        postNotification.style = 'block'; 
    } 
}

function getSearchedPosts() { 
    if (searchPostsBar) {
        let searchValue = searchPostsBar.value;

        fetch(`/bug2/posts?search=${searchValue}`)
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            displaySearchedPosts(data);
        });
    }
}

function displaySearchedPosts(data) {
    userPostContainer.replaceChildren();

    data.forEach(entry => {
        const post = userPostTemplate.content.cloneNode(true).children[0]; 
        const username = post.querySelector("[data-username]");
        const title = post.querySelector("[data-title]");
        const message = post.querySelector("[data-message]");

        username.textContent = `@${entry.username}`;
        title.textContent = entry.title;
        message.textContent = entry.message;
        
        userPostContainer.append(post);
    });
}

function getProfilePosts() {
    fetch('/bug2/profile/posts')
    .then(res => res.json())
    .then(data => {
        // console.log(login_json);
        displayProfilePosts(data);
    });
}

function displayProfilePosts(data) {
    profilePostContainer.replaceChildren();

    const profileTitle = document.getElementById('profile-title');
    const profileSubtitle = document.getElementById('profile-subtitle');

    profileTitle.innerText = `${data[0].username}'s Profile`;
    profileSubtitle.innerText = `@${data[0].username}`;
    data.splice(0, 1); // remove first element because it is only for the profile header

    data.forEach(entry => {
        const post = userPostTemplate.content.cloneNode(true).children[0]; 
        const username = post.querySelector("[data-username]");
        const title = post.querySelector("[data-title]");
        const message = post.querySelector("[data-message]");
        const deleteBtn = post.querySelector("[data-delete-btn]");

        username.textContent = `@${entry.username}`;
        title.textContent = entry.title;
        message.textContent = entry.message;
        deleteBtn.value = entry.id;

        deleteBtn.addEventListener('click', function() {
            deleteProfilePost(this.value) // delete post from db
            // this.parentElement.parentElement.remove(); // remove post html
        })
        
        profilePostContainer.append(post);
    });
}

function deleteProfilePost(post_id) {
    fetch('/bug2/profile/delete-post', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: 'follow',
        body: JSON.stringify({
            post_id: post_id
        })
    })
    .then(_ => location.reload());
}

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let res = await fetch(`/bug2/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: 'follow',
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .catch(err => console.error('Error:', err));
    console.log(res);
    
    let res_text = await res.text()
    .catch(err => console.error('Error:', err));
    console.log(res_text);
    
    // redirect on successful login
    if (res.redirected) {
        // console.log(`redirecting to: ${login_res.url}`);
        window.location.href = res.url;
    }
    // show errors in notification above login form
    else if (res.status === 401) {
        loginNotification.innerText = res_text;
        loginNotification.style = 'block'; 
    }
}

async function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let res = await fetch(`/bug2/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: 'follow',
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .catch(err => console.error('Error:', err));
    console.log(res);
    
    let res_text = await res.text()
    .catch(err => console.error('Error:', err));
    console.log(res_text);
    
    // redirect on successful login
    if (res.redirected) {
        // console.log(`redirecting to: ${login_res.url}`);
        window.location.href = res.url;
    }
    // show errors in notification above login form
    else if (res.status === 401) {
        loginNotification.innerText = res_text;
        loginNotification.style = 'block'; 
    } 
}

