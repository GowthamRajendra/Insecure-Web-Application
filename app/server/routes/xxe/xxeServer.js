// change name later
const express = require('express');
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

router.get('/', (req, res) => {
    // if there is no security cookie, set it to low
    if (!req.cookies.security) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    res.sendFile(path.join(__dirname, '../../../client/pages/xxe.html'));
});

router.get('/getBlogs', (req, res) => {
    // read the xml file
    fs.readFile(path.join(__dirname, 'blogs.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // console.log(data);

        // parse the xml file
        const xmlDoc = libxmljs.parseXmlString(data, {xinclude: true, noent : true, noblanks: true, } );
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
    // get the xml blog
    let blog = req.body.blog;

    // open xml file
    fs.readFile(path.join(__dirname, 'blogs.xml'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // parse the xml file
        const xmlDoc = libxmljs.parseXmlString(data, {xinclude: true, noent : true, noblanks: true, } );
        const root = xmlDoc.root(); // root element

        // create a new blog element
        const newBlog = libxmljs.parseXmlString(blog, {xinclude: true, noent : true, noblanks: true, });

        // this is an absolutely insane way to do this 
        // but i had to do it this way because
        // trying to add the entity to the xml file directly was not working
        // it is the only simple way to justify the 'developer' using xml entities

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

        // add the new blog to the root element
        root.addChild(newBlog.root());

        // write the new xml to the file
        fs.writeFile(path.join(__dirname, 'blogs.xml'), xmlDoc.toString(), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            } 

            res.send('Blog posted successfully');
        });
    });    
});

router.post('/postBlogImage', upload.single('image'), (req, res) => {
    // get the image
    let image = req.file;
    console.log(image);
    if (!image) {
        res.status(400).send('No image found');
        return;
    }

    res.send('Image uploaded successfully');
});

module.exports = router;