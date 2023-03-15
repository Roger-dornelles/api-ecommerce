import multer from 'multer';

const allowed = ['image/jpg', 'image/jpeg', 'image/png'];
export const uploadImages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images');
    },
    filename: (req, file, cb) => {
      let randomName = Math.floor(Math.floor(1.2) * 9999);
      cb(null, `${randomName + Date.now()}.jpg`);
    },
  }),
  fileFilter: (req, file, cb) => {
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fieldSize: 10000000 },
});
