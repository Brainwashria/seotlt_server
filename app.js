const express = require("express");
const app = express();
const files = require('./routes/files');
const cors = require('cors');
const config = require('./config');
const fs = require('fs');

fs.mkdirSync(`${__dirname}/uploads`, { recursive: true })

app.use(cors());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use('/files', files);

app.listen(config.SERVER_PORT, () => {
    console.log(`Server started on port: ${config.SERVER_PORT}`);
})