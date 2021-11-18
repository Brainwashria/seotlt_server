const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const AdmZip = require('adm-zip');
const config = require('../config');

const getFileData = (req) => {
    return new Promise((resolve) => {
        const busboy = new Busboy({
            headers: req.headers, limits: {
                fileSize: 2 * 1024 * 1024
            }
        });
        busboy.on('file', async function (fieldname, file, filename, encoding, mimetype) {
            let buffer = ''
            file.setEncoding('base64');
            await new Promise(((resolve, reject) => {
                file.on('data', function (data) {
                    buffer += data
                }).on('end', function () {
                    resolve()
                });
            }))
            const fileSize = Buffer.from(buffer, 'base64').length
            const fileName = filename.split('.').slice(0, -1).join('.')
            const fileExtension = filename.split('.').pop();
            resolve({
                fileSize,
                fileName,
                fileExtension,
                buffer,
                originalFileName: filename
            })
        });
        req.pipe(busboy);
    })
}

router.post('/upload', async function (req, res, next) {
    try {
        const { fileSize, fileName, fileExtension, buffer, originalFileName } = await getFileData(req)
        const zip = new AdmZip();
        zip.addFile(originalFileName, Buffer.from(buffer, 'base64'));
        zip.writeZip(`${__dirname}/../uploads/${fileName}.zip`);
        res.send({
            fileInfo: {fileSize, fileName, fileExtension},
            link: `${config.SERVER_URL}/files/download/${fileName}.zip`
        });
    } catch (e) {
        res.status(500).send('Internal error');
    }
})

router.get('/download/:filename', function (req, res) {
    res.download(`./uploads/${req.params.filename}`)
})

module.exports = router;