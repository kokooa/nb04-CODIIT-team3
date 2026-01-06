import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
} from '@jest/globals';

jest.unstable_mockModule('../src/services/user-service.js', () => ({
  __esModule: true,
  signupService: jest.fn(),
  updateUserService: jest.fn(),
  getUserService: jest.fn(),
  unregisterService: jest.fn(),
  getUserPointService: jest.fn(),
}));

const userService = await import('../src/services/user-service.js');
const { signup, updateUser, getMyPointInfo } =
  await import('../src/controllers/user-controller.js');
const { HttpError } = await import('../src/utils/error-handler.js');

describe('User Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('유효한 요청이 오면 201 상태코드와 유저 정보를 반환해야 한다', async () => {
      req.body = {
        type: 'BUYER',
        name: 'test',
        email: 't@t.com',
        password: 'pw',
      };
      (userService.signupService as jest.Mock).mockResolvedValue({
        id: '1',
        email: 't@t.com',
      });

      await signup(req, res, next);

      expect(userService.signupService).toHaveBeenCalledWith(
        'BUYER',
        'test',
        't@t.com',
        'pw',
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateUser', () => {
    it('인증된 유저가 정보를 수정하면 200을 반환해야 한다', async () => {
      req.user.id = 'user-id';
      req.body = { name: 'new name', currentPassword: 'pw' };

      (userService.updateUserService as jest.Mock).mockResolvedValue({
        id: 'user-id',
        name: 'new name',
      });

      await updateUser(req, res, next);

      expect(userService.updateUserService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMyPointInfo', () => {
    it('포인트 조회 성공 시 200과 데이터를 반환해야 한다', async () => {
      req.user.id = 'user-id';
      const mockPointData = { userSummary: { points: 100 } };
      (userService.getUserPointService as jest.Mock).mockResolvedValue(
        mockPointData,
      );

      await getMyPointInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockPointData,
      });
    });
  });
});
