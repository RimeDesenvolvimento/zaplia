declare namespace Express {
  export interface Request {
    user: { 
      id: string; 
      profile?: string; 
      companyId?: number;
      email?: string;
      nome?: string;
      type?: string;
    };
  }
}

