declare namespace Express {
  interface User {
    id: number;
    email: string;
    type: UserRole;
  }

  interface Request {
    user?: User;
  }
}
