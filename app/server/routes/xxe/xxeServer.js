// change name later
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const xml2js = require('xml2js');
const { XMLParser } = require('fast-xml-parser');
const libxmljs = require('libxmljs2');
const fs = require('fs');
const router = express.Router();

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
    console.log(imagePath);
    // read the image file
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.send(data);
    });
});

module.exports = router;