const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const { getImageBuffer } = require('../helpers');
const { env, cloudinary } = require('../config/');
const { UPLOAD_LOCATION, SAMPLE_IMAGE } = require('../constants');

const getConfig = async (imageLocation, uploadLocation) => {
  try {
    let image;
    if (uploadLocation === UPLOAD_LOCATION.LOCAL) {
      image = fs.readFileSync(imageLocation);
    } else {
      image = await getImageBuffer(imageLocation);
    }

    const data = new FormData();
    data.append('Filedata', image, {
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
    let config;

    if (uploadLocation === UPLOAD_LOCATION.LOCAL) {
      const fileName = getFileName(url);
      const filePath = path.join(__dirname, '..', '..', 'public', 'images', fileName);
      config = await getConfig(filePath, uploadLocation);
      if (url !== SAMPLE_IMAGE) fs.unlinkSync(filePath);
    }

    if (uploadLocation === UPLOAD_LOCATION.CLOUDINARY) {
      config = await getConfig(url, uploadLocation);
      await cloudinary.uploader.destroy(getCloudinaryPublicId(url));
    }

    const response = await axios.request(config);

    return response.data.data.url;
  } catch (error) {
    throw new Error(error);
  }
};

const getCloudinaryPublicId = (url) => {
  return url.split('/').pop().split('.')[0];
};

const getFileName = (url) => {
  return url.split('/').pop();
};

module.exports = { uploadToTiktok };
