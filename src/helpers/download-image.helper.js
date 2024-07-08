const fs = require('fs');
const path = require('path');
const axios = require('axios');

const getFileExtension = (url) => {
  return url.split('.').pop();
};

const downloadImage = async (url) => {
  const tempDir = path.join(__dirname, '../../temp');
  const imagePath = path.join(tempDir, `temp.${getFileExtension(url)}`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const writer = fs.createWriteStream(imagePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(imagePath));
    writer.on('error', reject);
  });
};

module.exports = downloadImage;
