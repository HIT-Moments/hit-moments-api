const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const unzip = async (zipPath) => {
  const folderName = zipPath.split(path.sep).pop().split('.')[0];
  const extractedPath = path.join(__dirname, '..', '..', 'uploads', `${folderName}`);
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractedPath }))
    .promise();
  fs.unlinkSync(zipPath);
  return extractedPath;
};

module.exports = unzip;
