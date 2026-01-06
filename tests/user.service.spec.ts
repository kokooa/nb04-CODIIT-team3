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
    hash: jest.fn(),
    compare: jest.fn(),
  },
  hash: jest.fn(),
  compare: jest.fn(),
}));

const prismaModule = await import('../src/common/prisma.js');
const prismaMock =
  prismaModule.default as unknown as DeepMockProxy<PrismaClient>;
const bcrypt = (await import('bcrypt')).default;
const { signupService, getUserPointService } =
  await import('../src/services/user-service.js');

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signupService', () => {
    it('중복된 유저가 없으면 회원가입에 성공해야 한다', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@test.com',
        name: 'tester',
        type: 'BUYER',
        createdAt: new Date(),
      };

      prismaMock.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const result = await signupService(
        'BUYER',
        'tester',
        'test@test.com',
        'password',
      );

      expect(prismaMock.user.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('이미 존재하는 이메일이면 409 에러를 던져야 한다', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 'existing' } as any);

      await expect(
        signupService('BUYER', 'tester', 'exist@test.com', 'pw'),
      ).rejects.toThrow(new HttpError('이미 존재하는 유저입니다.', 409));
    });
  });

  describe('getUserPointService', () => {
    it('포인트 정보가 없으면 기본값(Green, 0점)을 반환해야 한다', async () => {
      prismaMock.userPoint.findUnique.mockResolvedValue(null);

      const result = await getUserPointService('user-id');

      expect(result.userSummary.currentGrade).toBe('Green');
      expect(result.userSummary.currentPoint).toBe(0);
    });
  });
});
