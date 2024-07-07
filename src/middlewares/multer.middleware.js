const multer = require('multer');
const httpStatus = require('http-status');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { ApiError } = require('../utils');
const { i18n, cloudinary } = require('../config');
const { MAX_FILE_SIZE, TYPES_IMAGE_ALLOWED } = require('../constants');

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: TYPES_IMAGE_ALLOWED,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (TYPES_IMAGE_ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, i18n.translate('upload.unsupported')), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
