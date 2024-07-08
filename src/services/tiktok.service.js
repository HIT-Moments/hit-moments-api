const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const { getImageBuffer } = require('../helpers');
const { env, cloudinary } = require('../config/');
const { UPLOAD_LOCATION } = require('../constants');

const getConfig = async (url, uploadLocation) => {
  try {
    let buffer;
    if (uploadLocation === UPLOAD_LOCATION.LOCAL) {
      const filePath = path.join(__dirname, '..', '..', url);
      buffer = fs.readFileSync(filePath);
    } else {
      buffer = await getImageBuffer(url);
    }

    const data = new FormData();
    data.append('Filedata', buffer, {
      filename: 'image.png',
      contentType: 'image/png',
    });

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
  } catch (error) {
    throw new Error(error);
  }
};

const uploadToTiktok = async (url, uploadLocation = 'sample') => {
  try {
    const config = await getConfig(url, uploadLocation);
    const response = await axios.request(config);
    if (uploadLocation === UPLOAD_LOCATION.LOCAL) {
      fs.unlinkSync(url);
    }
    if (uploadLocation === UPLOAD_LOCATION.CLOUDINARY) {
      await cloudinary.uploader.destroy(getCloudinaryPublicId(url));
    }
    return response.data.data.url;
  } catch (error) {
    throw new Error(error);
  }
};

const getCloudinaryPublicId = (url) => {
  return url.split('/').pop().split('.')[0];
};

module.exports = { uploadToTiktok };
