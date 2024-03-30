const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const git = simpleGit();
const rimraf = require('rimraf');
const { exec } = require('child_process');


function cloneRepo(user, repo, destination) {
    return new Promise(async (resolve, reject) => {
        // If the destination directory exists, delete it
        if (fs.existsSync(destination)) {
            rimraf.sync(destination);
        }

        const url = `https://github.com/${user}/${repo}.git`;
        try {
            await git.clone(url, destination);
            console.log('Repository cloned successfully!');
            resolve();
        } catch (err) {
            console.error('Error cloning repository:', err);
            reject(err);
        }
    });
}

function prependMetadataToMarkdownFiles(folder) {
    fs.readdir(folder, { withFileTypes: true }, (err, dirents) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        dirents.forEach((dirent) => {
            const res = path.resolve(folder, dirent.name);
            if (dirent.isDirectory()) {
                prependMetadataToMarkdownFiles(res);
            } else if (path.extname(dirent.name) === '.md') {
                let fileNameNoSpaces = path.basename(dirent.name, '.md').replace(/\s/g, '').replace(/[()]/g, '');
                let fileName = path.basename(dirent.name, '.md');
                // If the file is README.md, set the slug and title to be the name of the parent directory
                if (fileName.toLowerCase() === 'readme') {
                    const dirName = path.basename(folder);
                    fileNameNoSpaces = dirName;
                    fileName = dirName;
                }
                const data = `---\nslug: /${fileNameNoSpaces}\ntitle: ${fileName}\n---\n`;
                console.log(`Prepending metadata to file: ${fileName}.md`);
                fs.readFile(res, 'utf8', (err, fileContents) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }

                    fs.writeFile(res, data + fileContents, 'utf8', err => {
                        if (err) {
                            console.error('Error writing file:', err);
                        }
                    });
                });
            }
        });
    });
  }

function adjustImageTagsInMarkdownFiles(folder) {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((dirent) => {
        const res = path.resolve(folder, dirent.name);
        if (dirent.isDirectory()) {
            adjustImageTagsInMarkdownFiles(res);
        } else if (path.extname(dirent.name) === '.md') {
            try {
                const fileContents = fs.readFileSync(res, 'utf8');
                const newContents = fileContents.replace(/<img src="(.+?)"(.+?)>/g, '<img src={require(\'$1\').default}$2>');
                fs.writeFileSync(res, newContents, 'utf8');
            } catch (err) {
                console.error('Error reading or writing file:', err);
            }
        }
    });
}

function replaceStringsInMarkdownFiles(folder) {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((dirent) => {
        const res = path.resolve(folder, dirent.name);
        if (dirent.isDirectory()) {
            replaceStringsInMarkdownFiles(res);
        } else if (path.extname(dirent.name) === '.md') {
            try {
                let fileContents = fs.readFileSync(res, 'utf8');
                fileContents = fileContents.replace(/>\[!NOTE]/g, ':::info');
                fileContents = fileContents.replace(/>\[!IMPORTANT]/g, ':::danger');
                fileContents = fileContents.replace(/>\[!TIP]/g, ':::tip');
                fileContents = fileContents.replace(/<!-- MD028\/no-blanks-blockquote -->/g, ':::');
                fileContents = fileContents.replace(/>\[/g, '[');
                fs.writeFileSync(res, fileContents, 'utf8');
            } catch (err) {
                console.error('Error reading or writing file:', err);
            }
        }
    });
}

function appendToReadmeFiles(folder) {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((dirent) => {
        const res = path.resolve(folder, dirent.name);
        if (dirent.isDirectory()) {
            appendToReadmeFiles(res);
        } else if (dirent.name.toLowerCase() === 'readme.md') {
            const appendData = "\nimport DocCardList from '@theme/DocCardList';\n\n<DocCardList />\n";
            try {
                fs.appendFileSync(res, appendData, 'utf8');
            } catch (err) {
                console.error('Error writing file:', err);
            }
        }
    });
}


function moveFolders(folders, destination) {
    folders.forEach(folder => {
        exec(`cp ${folder} ${destination}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error moving folder: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`Error moving folder: ${stderr}`);
                return;
            }
            console.log(`Moved ${folder} to ${destination}`);
        });
    });
}

cloneRepo('ansperson', 'learning', './learning')
    .then(() => {
        prependMetadataToMarkdownFiles('./learning');
        adjustImageTagsInMarkdownFiles('./learning');
        replaceStringsInMarkdownFiles('./learning');
        appendToReadmeFiles('./learning');
        moveFolders(['./learning/azure'], './docs/');
    })
    .catch(err => console.error(err));
