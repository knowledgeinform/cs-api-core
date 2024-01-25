const express = require('express');
const { formidable } = require('formidable');
const FileSaver = require('file-saver')
const fs = require('fs')
const jsZip = require('jszip')
const path = require('path')

const app = express();

app.get('/', (req, res) => {
    res.send(`
    <h2>With <code>"express"</code> npm package</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

app.post('/api/upload', (req, res, body, next) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        // console.log(fields)
        // console.log()
        jsZip.loadAsync(fs.readFileSync(files.someExpressFiles[0].filepath)).then( (zip) => {
            Object.keys(zip.files).forEach( async (filename) => {
                // console.log(filename)
                zip.files[filename].async('string').then( (fileData) => {
                    filename = filename.replace('config/config/','config/')
                    var dir = path.dirname(filename)
                    var fname = path.basename(filename)
                    console.log(dir)
                    console.log(fname)
                    // console.log(filename)
                    console.log(fileData) // These are your file contents      
                })
            })
        })
        // fs.writeFileSync('config.zip', )
        // FileSaver.saveAs(files.someExpressFiles[0], 'config.zip')
        res.json({ fields, files });
    });
});

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});