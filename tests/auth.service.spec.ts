import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { mockDeep } from 'jest-mock-extended';
import type { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { HttpError } from '../src/utils/error-handler.js';

jest.unstable_mockModule('../src/common/prisma.js', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));
jest.unstable_mockModule('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
  compare: jest.fn(),
  hash: jest.fn(),
}));
jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prismaModule = await import('../src/common/prisma.js');
const prismaMock =
  prismaModule.default as unknown as DeepMockProxy<PrismaClient>;
const bcrypt = (await import('bcrypt')).default;
const jwt = (await import('jsonwebtoken')).default;
const { loginService } = await import('../src/services/auth-service.js');

describe('Auth Service', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    type: 'BUYER',
    name: 'Test Name',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test Name',
    type: 'BUYER',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userPoints: { points: 0, grade: 'Green' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginService', () => {
    it('로그인 성공 시 유저 정보와 토큰을 반환해야 한다', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      prismaMock.user.update.mockResolvedValue(mockSafeUser as any);

      const result = await loginService('test@example.com', 'password123');

      expect(result.accessToken).toBe('mock-token');
      expect(result.user).toEqual(mockSafeUser);
    });

    it('존재하지 않는 이메일일 경우 404 에러를 던져야 한다', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(loginService('wrong@email.com', 'pw')).rejects.toThrow(
        HttpError,
      );
    });
  });
});
