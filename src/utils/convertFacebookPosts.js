const fs = require('fs');
const path = require('path');

const { unzip } = require('../helpers');
const { cloudinary } = require('../config');
const { FACEBOOK_FILE_PATH } = require('../constants');

const uploadImage = async (imagePath) => {
  const result = await cloudinary.uploader.upload(imagePath);
  return result.secure_url;
};

const convertFacebookPosts = async (zipPath) => {
  const extractedPath = await unzip(zipPath);
  const filePath = path.join(extractedPath, FACEBOOK_FILE_PATH);

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const posts = [];

  await Promise.all(
    data.map(async (post) => {
      const media = post.attachments[0].data[0].media;
      if (media) {
        const imagePath = `${extractedPath}\\${media.uri}`.replace(/\//g, '\\');
        const imageUrl = await uploadImage(imagePath);
        const createdAt = new Date(media.creation_timestamp * 1000);
        posts.push({
          image: imageUrl,
          content: media.description,
          createdAt,
        });
      }
    }),
  );

  fs.rmSync(extractedPath, { recursive: true });

  return posts;
};

module.exports = convertFacebookPosts;
