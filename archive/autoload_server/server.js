const express = require('express');
const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');

const app = express();
const recipesDir = path.join(__dirname, 'recipes');

// Serve static files (for HTML, CSS, etc.)
app.use(express.static('public'));

app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/qr', express.static(path.join(__dirname, 'qr')));


// Function to recursively get all YAML files in a directory and its subdirectories
function getYamlFiles(dir) {
    let yamlFiles = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            yamlFiles = yamlFiles.concat(getYamlFiles(filePath)); // Recurse into subdirectory
        } else if (path.extname(file) === '.yaml') {
            yamlFiles.push(filePath.replace(recipesDir + path.sep, '')); // Store relative path
        }
    });

    return yamlFiles;
}

// API endpoint to get all recipe files, including those in subfolders
app.get('/api/recipes', (req, res) => {
    const yamlFiles = getYamlFiles(recipesDir);
    res.json(yamlFiles);
});

// API endpoint to get the content of a specific recipe file
app.get('/api/recipes/:file(*)', (req, res) => {
    const filePath = path.join(recipesDir, req.params.file);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        try {
            const yamlData = jsYaml.load(data);
            res.json(yamlData);
        } catch (e) {
            res.status(500).send('Error parsing YAML file');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
