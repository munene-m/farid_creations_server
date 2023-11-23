declare global {
  namespace Express {
    interface Request {
      admin: {};
      token: string;
    }
  }
}

export {};
