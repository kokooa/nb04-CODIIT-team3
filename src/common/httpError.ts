export class HttpError extends Error {
  status: number;
  message: string;
  data: any;

  constructor(message: string, data?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
