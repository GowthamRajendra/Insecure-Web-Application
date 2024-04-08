// change name later
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const libxmljs = require('libxmljs2');
const fs = require('fs');

const router = express.Router();
const app = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'images'));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cookieParser());

router.get('/', (req, res) => {
    // if there is no security cookie, set it to low
    if (!req.cookies.security) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    res.sendFile(path.join(__dirname, '../../../client/pages/xxe.html'));
});

router.get('/getBlogs', (req, res) => {
    // if the security level is low, allow xinclude and xxe attacks
    let xinclude = true;
    let noent = true;

    // if the security level is medium, prevent xxe attacks
    // if the security level is high, prevent xinclude and xxe attacks
    // not necessary since these checks are done when posting the blog but just to be sure
    if (req.cookies.security == 'High') {
        xinclude = false;
        noent = false;
    } else if (req.cookies.security == 'Medium') {
        noent = false;
    }

    // read the xml file
    fs.readFile(path.join(__dirname, 'blogs.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // parse the xml file
        const xmlDoc = libxmljs.parseXmlString(data, {xinclude: xinclude, noent : noent, noblanks: true, } );
        // get the child nodes of the root element. i.e. the blogs
        let blogs = xmlDoc.root().childNodes().toString(); 
    
        // remove commas from the string
        blogs = blogs.replace(/,/g, '');

        // wrap the blogs in a root element to parse it
        blogs = '<blogs>' + blogs + '</blogs>';

        // parse the xml file
        const xmlDoc2 = libxmljs.parseXmlString(blogs, {xinclude: xinclude, noent : noent, noblanks: true, } );
        const children = xmlDoc2.root().childNodes(); // child nodes of the root element

        let xmlJson = {"blogs": []};

        // convert the xml to json
        for (let i = 0; i < children.length; i++) {
            let blog = children[i];
            let blogChildren = blog.childNodes();
            let blogJson = {};

            for (let j = 0; j < blogChildren.length; j++) {
                let element = blogChildren[j];
                blogJson[element.name()] = element.text();
            }

            xmlJson.blogs.push(blogJson);
        }

        res.send(xmlJson);
    });
});

router.get('/getBlogImage', (req, res) => {
    // get the image name
    let image = req.query.image;
    let imagePath = path.join(__dirname, "images", image);
    // read the image file
    fs.readFile(imagePath, (err, data) => { 
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // get the image type
        let type = path.extname(image);

        // set the content type
        res.setHeader('Content-Type', 'image/' + type.substring(1));

        // send the image
        res.send(data);
    });
});

router.post('/postBlog', (req, res) => {

    let blog;

    // if the security level is low
    // allow xxe and xinclude attacks
    let xinclude = true;
    let noent = true;

    // if the security level is low
    if (req.cookies.security == 'Low') {
        // get the xml blog
        blog = req.body.blog;
    } else {
        // get the json blog
        blog = '<blog>';
        blog += '<image>' + req.body.image + '</image>';
        blog += '<title>' + req.body.title + '</title>';
        blog += '<content>' + req.body.content + '</content>';
        blog += '<author>' + req.body.author + '</author>';
        blog += '<date>' + req.body.date + '</date>';
        blog += '</blog>';

        // in medium security, prevent xxe attacks
        // in high security, prevent xxe and xinclude attacks
        if (req.cookies.security == 'Medium') {
            noent = false;
        } else if (req.cookies.security == 'High') {
            xinclude = false;
            noent = false;
        }
    }

    // open xml file
    fs.readFile(path.join(__dirname, 'blogs.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // parse the xml file
        const xmlDoc = libxmljs.parseXmlString(data, {xinclude: xinclude, noent : noent, noblanks: true, } );
        const root = xmlDoc.root(); // root element

        let newBlog;
        // create a new blog element
        try {
            newBlog = libxmljs.parseXmlString(blog, {xinclude: xinclude, noent : noent, noblanks: true, });
        } catch (err) {
            console.error(err);
            res.status(400).send('Invalid blog');
            return;
        }

        // this is an absolutely insane way to do this 
        // but i had to do it this way because
        // trying to add the entity to the xml file directly was not working
        // it is the only simple way to justify the 'bad developer' using xml entities

        // if the author is empty, replace it with an entity
        if (newBlog.get('author').text() == '') {
            // create new xml with the entity and author 
            const authorWithEntity = libxmljs.parseXmlString(
                '<!DOCTYPE foo [<!ENTITY author "Anonymous">]><author>&author;</author>', 
                {xinclude: true, noent : true, noblanks: true, });

            // replace author node from the new blog with the author with entity node 
            newBlog.get('author').remove();
            newBlog.root().addChild(authorWithEntity.root());
        }

        // this is just for convenience because injecting an xinclude requires a nested element
        // something like 
        // <foo xmlns:xi="http://www.w3.org/2001/XInclude">
        //      <xi:include parse="text" href="file:///etc/passwd"/>
        // </foo>
        // where <xi:include> is replaced with the contents of etc/passwd
        // since this is an xml element, it will show up as [object Object] on the blog page
        // so i just remove the 'foo' element and replace it with the text of the xi:include element
        // after the xinclude has been parsed and the contents of the etc/passwd have been added to the xml
        // so the user can see the contents of the file on the blog page instead of just on burpsuite

        // this process would have been easier if this library's namespace() function worked

        let namespace = "http://www.w3.org/2001/XInclude";
        let allElements = newBlog.root().childNodes();

        for (let element of allElements) {
            for (let child of element.childNodes()) {
                if (child.toString().includes(namespace)){
                    // replace element with the text of the child
                    element.text(child.text());
                    child.remove();
                    break;
                }
            }
        }

        // add the new blog to the root element
        root.addChild(newBlog.root());

        // write the new xml to the file
        fs.writeFile(path.join(__dirname, 'blogs.xml'), xmlDoc.toString(), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            } 

            res.send('Blog posted successfully: ' + newBlog.toString());
        });
    });    
});

router.post('/postBlogImage', upload.single('image'), (req, res) => {
    let xinclude = true;
    let noent = true;

    // if the security level is high, prevent xinclude and xxe attacks
    // not necessary since xml wont be parsed in high security but just to be sure
    if (req.cookies.security == 'High') {
        xinclude = false;
        noent = false;
    }

    // get the image
    let image = req.file;
    // console.log(image);
    if (!image) {
        res.status(400).send('No image found');
        return;
    }

    // it doesnt make sense to parse an svg file
    // but i did it for the sake of the bug
    // in high security, the svg file will not be parsed

    if (image.mimetype == 'image/svg+xml' && req.cookies.security != 'High') {
        fs.readFile(path.join(__dirname, 'images', image.originalname), 'utf-8', (err, data) => {
        
            let xmlDoc;

            try {
                xmlDoc = libxmljs.parseXmlString(data, {xinclude: xinclude, noent : noent, noblanks: true, } );
            } catch (err) {  
                console.error(err);
                res.status(400).send('Invalid xml.');
                return;
            }

            fs.writeFile(path.join(__dirname, 'images', image.originalname), xmlDoc.toString(), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                } 
    
                res.send('Image uploaded successfully: ');
            });
        });
    } else {
        res.send('Image uploaded successfully');
    }  
});

router.post('/postSecret', (req, res) => {
    // get the secret
    let secret = req.body.secret;

    // open the txt file 
    fs.readFile(path.join(__dirname, 'secret.txt'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (data == secret) {
            res.send('Correct');
        } else {
            res.send('Incorrect');
        }
    });

});

router.get('/resetDatabase', (req, res) => {
    // delete images 
    fs.readFile(path.join(__dirname, 'blogs-backup.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const xmlDoc = libxmljs.parseXmlString(data);
        const allElements = xmlDoc.root().childNodes();

        // get all the images in the backup xml
        let images = [];
        for (let element of allElements) {
            if (element.toString().includes('image')) {
                for (let child of element.childNodes()) {
                    if (child.name() == 'image') {
                        images.push(child.text());
                    }
                }
            }
        }

        // get all the images in the images folder
        fs.readdir(path.join(__dirname, 'images'), (err, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // delete images not in the backup xml
            for (let file of files) {
                if (!images.includes(file)) {
                    fs.unlink(path.join(__dirname, 'images', file), (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                    });
                }
            }
        });
    });


    // read backup xml file
    fs.readFile(path.join(__dirname, 'blogs-backup.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // write the backup xml to the main xml file
        fs.writeFile(path.join(__dirname, 'blogs.xml'), data, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.send('Database reset successfully');
        });
    });
});

module.exports = router;