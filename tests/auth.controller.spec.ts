import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
} from '@jest/globals';

jest.unstable_mockModule('../src/services/auth-service.js', () => ({
  __esModule: true,
  loginService: jest.fn(),
  reloadService: jest.fn(),
  logoutService: jest.fn(),
}));

const authService = await import('../src/services/auth-service.js');
const { login, logout } = await import('../src/controllers/auth-controller.js');
const { HttpError } = await import('../src/utils/error-handler.js');

describe('Auth Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('login Controller', () => {
    it('성공 시 201 상태코드와 쿠키, 토큰을 반환해야 한다', async () => {
      req.body = { email: 'test@test.com', password: 'pw' };
      const mockServiceResult = {
        user: {
          id: '1',
          email: 'test@test.com',
          name: '테스터',
          type: 'BUYER',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          userPoints: {
            points: 0,
            grade: 'Green',
          },
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (authService.loginService as jest.Mock).mockResolvedValue(
        mockServiceResult,
      );

      // When
      await login(req, res, next);

      // Then
      expect(authService.loginService).toHaveBeenCalledWith(
        'test@test.com',
        'pw',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: expect.any(Object),
        accessToken: 'access-token',
      });
    });

    it('이메일이나 비밀번호가 없으면 400 에러를 next로 전달해야 한다', async () => {
      req.body = { email: '' };

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    it('서비스에서 에러 발생 시 next로 전달해야 한다', async () => {
      req.body = { email: 'test', password: 'pw' };
      const error = new HttpError('서비스 에러', 500);

      (authService.loginService as jest.Mock).mockRejectedValue(error);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout Controller', () => {
    it('로그인 된 유저가 요청 시 성공적으로 로그아웃하고 200을 반환해야 한다', async () => {
      req.user.id = 'user-id';
      (authService.logoutService as jest.Mock).mockResolvedValue(undefined);

      await logout(req, res, next);

      expect(authService.logoutService).toHaveBeenCalledWith('user-id');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
