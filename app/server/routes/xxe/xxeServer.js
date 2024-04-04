// change name later
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const xml2js = require('xml2js');
const { XMLParser } = require('fast-xml-parser');
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
    let xinclude = true;
    let noent = true;

    if (req.cookies.security == 'High') {
        xinclude = false;
        noent = false;
    }

    // read the xml file
    fs.readFile(path.join(__dirname, 'blogs.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // console.log(data);

        // parse the xml file
        const xmlDoc = libxmljs.parseXmlString(data, {xinclude: xinclude, noent : noent, noblanks: true, } );
        // get the child nodes of the root element. i.e. the blogs
        let blogs = xmlDoc.root().childNodes().toString(); 
    
        // remove commas from the string
        blogs = blogs.replace(/,/g, '');

        // wrap the blogs in a root element to parse it
        blogs = '<blogs>' + blogs + '</blogs>';

        // parse the xml file
        xml2js.parseString(blogs, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error. Could not parse the xml file.');
                return;
            }
            
            res.send(result);
        });
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

        if (req.cookies.security == 'High') {
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
                {xinclude: xinclude, noent : noent, noblanks: true, });

            // replace author node from the new blog with the author with entity node 
            newBlog.get('author').remove();
            newBlog.root().addChild(authorWithEntity.root());
        }

        console.log(newBlog.toString());

        let namespaces = { xi: "http://www.w3.org/2001/XInclude" };
        let allElements = newBlog.find('//*');

        for (let element of allElements) {
            console.log(element);
            if (element.namespace() && element.namespace().href() === namespaces.xi) {
                console.log('found xi element');
                element.remove();
                break;
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

    if (req.cookies.security == 'High') {
        xinclude = false;
        noent = false;
    }

    // get the image
    let image = req.file;
    console.log(image);
    if (!image) {
        res.status(400).send('No image found');
        return;
    }

    console.log(image.mimetype);

    // it doesnt make sense to parse an svg file
    // but i did it for the sake of the bug

    if (image.mimetype == 'image/svg+xml') {
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
    
                res.send('Image uploaded successfully: ' + xmlDoc.toString());
            });
        });
    } else {
        res.send('Image uploaded successfully');
    }  
});

module.exports = router;