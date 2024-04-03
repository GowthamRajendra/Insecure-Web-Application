document.addEventListener('DOMContentLoaded', function() {

    fetch('/xxe/getBlogs', { 
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        // console.log(data);
        // blogs get turned into an array of objects under the key 'blog'
        // probably because xml allows multiple elements with the same name
        // but json does not so it puts them in an array with that name
        // each blog is now part of the array 
        let blogs = data.blogs.blog; 
        console.log(blogs);
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
        contentElem.appendChild(document.createTextNode(blog.content));
        contentElem.style.fontSize = '1.5rem';
        blogElem.appendChild(contentElem);

        return blogElem;
    }

    // show the file name when a file is selected
    const fileInput = document.querySelector(".file-input");
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            const fileName = document.querySelector(".file-name");
            fileName.textContent = fileInput.files[0].name;
        }
    };

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
        }

        // change image name
        let imageName = 'image-' + Date.now() + image.name.substring(image.name.lastIndexOf('.'));
        image = new File([image], imageName, {type: image.type});

        // convert blog to xml
        let blog = '<blog>';
        blog += '<image>' + image.name + '</image>';
        blog += '<title>' + title + '</title>';
        blog += '<content>' + content + '</content>';
        blog += '<author>' + author + '</author>';
        blog += '<date>' + date + '</date>';
        blog += '</blog>';

        fetch('/xxe/postBlog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({
                "blog": blog,
            })
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

            // reload the page
            window.location.reload();
        }).catch(e => {
            console.log('Error: ' + e.message);
        });

    });

});