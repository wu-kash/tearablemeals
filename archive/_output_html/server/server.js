const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const directoryPath = path.join(__dirname, 'recipes'); // Folder containing YAML files

// Serve the static HTML files
app.use(express.static(__dirname));

// Endpoint to get the list of YAML files
app.get('/list-recipes', (req, res) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        const yamlFiles = files.filter(file => file.endsWith('.yaml'));
        res.json(yamlFiles);
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
