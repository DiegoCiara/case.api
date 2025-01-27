import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
    cb(null, 'uploads/'); // Adjust as necessary
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Infinity,
  },
});

export default upload;
