import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ajuste conforme necessário
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Infinity, // Define sem limite para o tamanho do arquivo
  },
});

export default upload;