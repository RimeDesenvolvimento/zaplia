import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface PartnerTokenPayload {
  id: string;
  email: string;
  nome: string;
  type: string;
  iat: number;
  exp: number;
}

const isPartnerAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, email, nome, type } = decoded as PartnerTokenPayload;
    
    // Verificar se é um token de parceiro
    if (type !== "partner") {
      throw new AppError("Invalid partner token", 403);
    }
    
    req.user = {
      id,
      email,
      nome,
      type
    };
  } catch (err) {
    throw new AppError("Invalid token. We'll try to assign a new one on next request", 403);
  }

  return next();
};

export default isPartnerAuth;
