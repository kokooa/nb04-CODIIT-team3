import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 파일이 저장될 폴더
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // 파일 중복 방지를 위해 타임스탬프 추가
    cb(null, `product_${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });
