import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { User } from "../entities/User";

export default async (req:Request, res: Response, next: NextFunction)=>{

    try{
        console.log("User 미들웨어")
        // 1. Sub을 생성할 수 있는 유저인지 체크를 위해 유저 정보 가져오기 (요청에서 보내주는 토큰을 이용)
        const token = req.cookies.token;
        if(!token) return next();
    
        const {username}: any = jwt.verify(token, process.env.JWT_SECRET );
    
        const user = await User.findOneBy({username});
        console.log("user",user)
    
        // 2. 유저정보가 없다면 throw error
        if(!user) throw new Error("Unauthenticated");

        // 3. 유저정보를 res.local.user에 넣어줌! -> 다른 곳에서 res에서 꺼내서 사용!
        res.locals.user = user;
        return next();
    }catch(err){
        console.log(err);
        return res.status(400).json({eroror : "Something went wrong"})

    }
    
}