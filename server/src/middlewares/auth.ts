import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { User } from "../entities/User";

export default async (req:Request, res: Response, next: NextFunction)=>{
    console.log("auth 미들웨어")
    try{
        const user:User | undefined = res.locals.user;
        if(!user) throw new Error("Unauthenticated");
    
        return next();

    }catch(err){
        console.log(err);
        return res.status(401).json({eroror : "Unauthenticated"})

    }
    
}