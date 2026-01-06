// jest.config.cjs
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // 1. ESM 모드 프리셋 사용
  preset: 'ts-jest/presets/default-esm',

  testEnvironment: 'node',

  // 2. .ts 파일도 ESM으로 처리하도록 명시 (이게 없으면 SyntaxError가 날 수 있음)
  extensionsToTreatAsEsm: ['.ts'],

  // 3. import 경로에서 .js 확장자를 무시하고 매핑
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // 4. 변환 설정
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // ts-jest에게 ESM 모드라고 알림
      },
    ],
  },
};
