document.addEventListener('DOMContentLoaded', function() {

    fetch('/xxe/getBlogs', { 
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        // console.log(data);
        // blogs get turned into an array of objects under the key 'blog'
        // each blog is now part of the array 
        let blogs = data.blogs.blog; 
        console.log(blogs);
        let blogElems = document.getElementById('blogs');
        blogs.forEach(blog => {
            let blogElem = createBlogElement(blog);
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

        let imageElem = document.createElement('img');
        
        fetch('/xxe/getBlogImage?image=' + blog.image).then(response => {
            return response.blob();
        }).then(blob => {
            let url = URL.createObjectURL(blob);
            imageElem.src = url;
        }).catch(e => {
            console.log('Error: ' + e.message);
        });

        imageElem.alt = blog.title;
        blogElem.appendChild(imageElem);

        let contentElem = document.createElement('p');
        contentElem.appendChild(document.createTextNode(blog.content));
        blogElem.appendChild(contentElem);

        return blogElem;
    }

});