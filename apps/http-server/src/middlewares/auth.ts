import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authMiddleware(req:Request, res:Response, next:NextFunction) {
  const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const token  = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    const decoded = jwt.verify(token, "secretkey")
    if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
    }
    //@ts-ignore
    req.userId = decoded.userId;
    next();
}
