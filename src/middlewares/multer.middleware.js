const multer = require('multer');
const httpStatus = require('http-status');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { ApiError } = require('../utils');
const { i18n, cloudinary } = require('../config');
const { MAX_FILE_SIZE, TYPES_IMAGE_ALLOWED, TYPES_AUDIO_ALLOWED } = require('../constants');

const ALLOWED_TYPES = [...TYPES_IMAGE_ALLOWED, ...TYPES_AUDIO_ALLOWED];

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: async (req, file) => {
      if (TYPES_IMAGE_ALLOWED.includes(file.mimetype)) {
        return 'image';
      }
      if (TYPES_AUDIO_ALLOWED.includes(file.mimetype)) {
        return 'video';
      }
      return 'raw';
    },
  },
  allowedFormats: ALLOWED_TYPES,
});

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  allowedFormats: ALLOWED_TYPES,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, i18n.translate('upload.unsupported')), false);
  }
};

const localUpload = multer({
  storage: localStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const cloudUpload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const upload = (fieldname) => (req, res, next) => {
  cloudUpload.single(fieldname)(req, res, (cloudErr) => {
    if (cloudErr) {
      localUpload.single(fieldname)(req, res, (localErr) => {
        if (localErr) {
          console.error('Local upload error:', localErr);
          return next(localErr);
        }
        return next();
      });
    } else {
      next();
    }
  });
};

module.exports = upload;
