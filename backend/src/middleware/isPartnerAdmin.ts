import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import Partner from "../models/Partner";
import User from "../models/User";
import AppError from "../errors/AppError";

interface TokenPayload {
  id: string;
  type: "partner" | "user";
  iat: number;
  exp: number;
}

const isPartnerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, type } = decoded as TokenPayload;

    if (type === "partner") {
      // Verificar se é partner válido
      const partner = await Partner.findByPk(id);
      if (!partner) {
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }

      req.user = {
        id: partner.id.toString(),
        email: partner.email,
        nome: partner.nome,
        type: "partner"
      };
    } else if (type === "user") {
      // Verificar se é usuário admin
      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }

      if (user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      req.user = {
        id: user.id.toString(),
        email: user.email,
        nome: user.name,
        type: "user",
        profile: user.profile
      };
    } else {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    return next();
  } catch (err) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};

export default isPartnerAdmin;
