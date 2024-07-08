const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const { env, cloudinary } = require('../config/');
const { downloadImage } = require('../helpers');

const getConfig = (filePath) => {
  let data = new FormData();
  data.append('Filedata', fs.createReadStream(filePath));
  return {
    method: 'post',
    maxBodyLength: Infinity,
    url: env.tiktok.url,
    headers: {
      cookie: env.tiktok.cookie,
      'x-csrftoken': env.tiktok.token,
      ...data.getHeaders(),
    },
    data: data,
  };
};

const uploadToTiktok = async (url) => {
  const sampleFilePath = path.join(__dirname, '../../temp/sample.png');
  let config = getConfig(sampleFilePath);

  const sampleResponse = await axios.request(config);

  if (sampleResponse.data.code !== 0) {
    throw new Error('Failed to upload image to TikTok');
  }

  const filePath = await downloadImage(url);
  config = getConfig(filePath);

  const response = await axios.request(config);

  fs.unlinkSync(filePath);

  await cloudinary.uploader.destroy(getCloudinaryPublicId(url));

  return response.data.data.url;
};

const getCloudinaryPublicId = (url) => {
  return url.split('/').pop().split('.')[0];
};

module.exports = { uploadToTiktok };
