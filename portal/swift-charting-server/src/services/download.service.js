const fs = require('fs');
const path = require('path');
const { staticPath } = require('../config/config');
const mime = require('mime-types');

const download = async (req, res) => {
    const { fileName, base64, downloadFile } = req.query || {};
    const filePath = path.resolve(staticPath + '/' + fileName);
    const mimeType = mime.lookup(filePath);

    try {
        const stats = await fs.promises.stat(filePath);
        const fileSize = stats.size;
        const { range } = req.headers || {};

        if (base64) {
            const data = await fs.promises.readFile(filePath);
            const base64Data = data.toString('base64');
            if(res){
            res.json({ base64: base64Data });
            }
            return base64Data;
        }

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': mimeType,
            };

            res.writeHead(206, headers);
            file.pipe(res);
        } else {
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': mimeType,
            };
            // if (downloadFile) {
                headers['Content-Disposition'] = 'attachment; filename=' + fileName;
            // }

            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (err) {
        res.writeHead(404);
        res.end('File not found');
    }
}

module.exports = {
    download,
}
