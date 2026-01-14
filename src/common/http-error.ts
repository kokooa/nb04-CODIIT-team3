export class HttpError extends Error {
  constructor(
    message: string = '서버 오류가 발생했습니다.',
    public status: number = 500,
    public data?: any,
    public error?: string,
  ) {
    super(message);
  }
}
