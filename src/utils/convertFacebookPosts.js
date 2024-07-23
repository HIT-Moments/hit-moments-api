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
  try {
    const extractedPath = await unzip(zipPath);
    const filePath = path.join(extractedPath, FACEBOOK_FILE_PATH);

    await verifyFileExists(filePath);

    const data = await readFileAsJSON(filePath);
    const posts = await processFacebookPosts(data, extractedPath);

    await removeDirectory(extractedPath);

    return posts;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to convert Facebook posts');
  }
};

const verifyFileExists = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist');
  }
};

const readFileAsJSON = async (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data;
};

const processFacebookPosts = async (data, extractedPath) => {
  const posts = [];
  await Promise.all(
    data.map(async (post) => {
      const media = post.attachments[0]?.data[0]?.media;
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
  return posts;
};

const removeDirectory = async (directoryPath) => {
  fs.rmdirSync(directoryPath, { recursive: true, force: true });
};

module.exports = convertFacebookPosts;
