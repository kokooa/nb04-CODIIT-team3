/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 여기부터 복사해서 images 부분을 추가/수정하세요
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000", // 백엔드 포트 번호
        pathname: "/uploads/**", // 업로드 폴더 경로 허용
      },
    ],
  },
  // 👆 여기까지
};

module.exports = nextConfig;
