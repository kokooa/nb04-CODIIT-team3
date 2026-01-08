import multer from 'multer';
import path from 'path';
import fs from 'fs';

try {
  fs.readdirSync('uploads');
} catch (error) {
  // console.log('uploads 폴더가 없어 자동으로 생성합니다.');
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        uniqueSuffix +
        path.extname(file.originalname),
    );
  },
});

export const upload = multer({ storage });

export function buildFileUrl(filePath: string | null): string | null {
  if (!filePath) {
    return null;
  }
  // filePath가 이미 전체 URL인 경우 그대로 반환
  if (filePath.startsWith('http')) {
    return filePath;
  }
  // 환경 변수에서 API 기본 URL을 가져와 전체 URL 구성
  return `${process.env.API_BASE_URL}${filePath}`;
}
