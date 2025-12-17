declare namespace Express {
  interface User {
    id: string;
    email: string;
    type: UserRole;
  }

  interface Request {
    user?: User;
  }
}
