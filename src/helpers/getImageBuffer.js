const axios = require('axios');

const getImageBuffer = async (url) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data, 'binary');
    return buffer;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = getImageBuffer;
