// related to actual implementation of the xxe attack

document.addEventListener('DOMContentLoaded', function() {

    fetch('/xxe/getBlogs', { 
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        let blogs = data.blogs;
        let blogElems = document.getElementById('blogs');
        blogs.forEach(blog => {
            let blogElem = createBlogElement(blog);
            blogElem.appendChild(document.createElement('hr'));
            blogElems.appendChild(blogElem);
        });
    }).catch(e => {
        console.log('Error: ' + e.message);
    });

    function createBlogElement(blog) {
        let blogElem = document.createElement('div');
        let titleElem = document.createElement('p');
        titleElem.appendChild(document.createTextNode(blog.title));
        titleElem.classList.add('title', 'is-3');
        blogElem.appendChild(titleElem);

        // only add the image if there is one
        if (blog.image != '') {
            let imageElem = document.createElement('img');

            let extension;

            // make another request to get the image
            fetch('/xxe/getBlogImage?image=' + blog.image, {
                method: 'GET',
            }).then(response => {
                // get extension of the image
                let contentType = response.headers.get('Content-Type');
                extension = contentType.substring(contentType.indexOf('/') + 1);

                if (extension == 'svg') {
                    return response.text();
                } else {
                    return response.blob();
                }
            }).then(data => {
                let url;
                if (extension == 'svg') {
                    url = 'data:image/svg+xml,' + encodeURIComponent(data);
                } else {
                    url = URL.createObjectURL(data);
                }
                imageElem.src = url;
            }).catch(e => {
                console.log('Error: ' + e.message);
            });

            imageElem.alt = blog.title;

            blogElem.appendChild(imageElem);
        }

        // store the author and date in a div
        let bylineElem = document.createElement('div');
        bylineElem.style.display = 'flex';
        bylineElem.style.justifyContent = 'space-between';

        let authorElem = document.createElement('p');
        authorElem.appendChild(document.createTextNode('By: ' + blog.author));

        let dateElem = document.createElement('p');
        dateElem.appendChild(document.createTextNode(blog.date));
        
        bylineElem.appendChild(authorElem);
        bylineElem.appendChild(dateElem);    
        blogElem.appendChild(bylineElem);

        let contentElem = document.createElement('p');
        contentElem.classList.add('subtitle', 'is-5');
        contentElem.appendChild(document.createTextNode(blog.content));
        blogElem.appendChild(contentElem);

        return blogElem;
    }

    // post new blog
    document.getElementById('blog-form').addEventListener('submit', function(event) {
        // prevet form from submitting normally
        event.preventDefault();

        let formData = new FormData(event.target);

        let title = formData.get('title');
        let author = formData.get('name');
        let content = formData.get('content');
        let image = formData.get('image');

        // get date and remove the day
        let dateObj = new Date().toDateString();
        let date = dateObj.substring(dateObj.indexOf(' ') + 1);
        console.log(date);

        if (title == '' || content == '') {
            // show help text if fields are empty
            let elems = document.getElementsByClassName('help-hide');
            for (let i = 0; i < elems.length; i++) {
                elems[i].classList.remove('is-hidden');
            }

            alert('Please add a title and content to the blog.');
            return;
        } // or if title/content is more than 70 characters
        else if (title.length > 70 || author.length > 70) {
            title = title.substring(0, 70);

            if (author.length > 70) {
                author = author.substring(0, 70);
            }
        }

        // change image name
        if (image.name != '') {
            let imageName = 'image-' + Date.now() + image.name.substring(image.name.lastIndexOf('.'));
            image = new File([image], imageName, {type: image.type});
        }

        let cookie = document.cookie.split(';').find(cookie => cookie.includes('security='));
        let securityLevel = cookie ? cookie.split('=')[1] : 'Low';

        // if the security level is low, send the blog as xml
        // otherwise send the blog as json
        // prevent user from editing xml in medium/high security
        let body;

        if (securityLevel == 'Low') {
            // convert blog to xml
            let blog = '<blog>';
            blog += '<image>' + image.name + '</image>';
            blog += '<title>' + title + '</title>';
            blog += '<content>' + content + '</content>';
            blog += '<author>' + author + '</author>';
            blog += '<date>' + date + '</date>';
            blog += '</blog>';
            
            body = { "blog": blog };
        } else {
            body = {
                "title": title,
                "content": content,
                "author": author,
                "date": date,
                "image": image.name
            };    
        }

        fetch('/xxe/postBlog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify(body)
        }).then(response => {
            return response.text();
        }).then(data => {
            console.log(data); // response fromserver
        }).catch(e => {
            console.log('Error: ' + e.message);
        });

        let newFormData = new FormData();
        newFormData.append('image', image);

        // send the image
        fetch('/xxe/postBlogImage', {
            method: 'POST',
            body: newFormData
        }).then(response => {
            return response.text();
        }).then(data => {
            console.log(data); // response fromserver

            // clear the form
            document.getElementById('blog-form').reset();

            // reload the page
            window.location.href = '/xxe';
        }).catch(e => {
            console.log('Error: ' + e.message);
        });

    });

    // submitting the secret
    document.getElementById('secret-form').addEventListener('submit', function(event) {
        // prevet form from submitting normally
        event.preventDefault();

        let formData = new FormData(event.target);

        let secret = formData.get('secret');

        fetch('/xxe/postSecret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({ "secret": secret })
        }).then(response => {
            return response.text();
        }).then(data => {
            let cookie = document.cookie.split(';').find(cookie => cookie.includes('security='));
            let securityLevel = cookie ? cookie.split('=')[1] : 'Low';
            let secretResponse = document.getElementById('secret-response');

            if (data == 'Correct') {
                secretResponse.textContent = 'Congratulations! You completed the challenge on ' + securityLevel + ' security.';                
            } else {
                secretResponse.textContent = 'Incorrect secret. Try again.';
            }

            document.getElementById('secret-form').reset();

            document.getElementById('modal-secret-submit').classList.add('is-active');
        }).catch(e => {
            console.log('Error: ' + e.message);
        });
    });

    document.getElementById('reset').addEventListener('click', function() {
        // make a request to reset the db
        fetch('/xxe/resetDatabase', {
            method: 'GET'
        }).then(response => {
            return response.text();
        }).then(data => {
            console.log(data); // response fromserver

            // reload the page
            window.location.href = '/xxe';
        }).catch(e => {
            console.log('Error: ' + e.message);
        });
    });

});