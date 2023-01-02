import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"

const mapErrors = (errors: Object[]) => {
    return errors.reduce((prev : any, err: any)=>{
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev;
    },{})
}

const me = async (_: Request, res:Response)=>{
    return res.json(res.locals.user);
}
const register = async (req: Request, res:Response) => {
    const { email, username, password } = req.body;
    console.log(email, username, password);

    try{
        let errors : any = {};

        // 이메일과 유저 이름이 이미 저장 사용되고 있 있는 것인지 확인
        const emailUser = await User.findOneBy({email});
        const usernameUser = await User.findOneBy({ username});

        // 이미 있다면 errors 객체에 넣어줌
        if(emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다."
        if(usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다."

        // 에러가 있다면 return으로 에러를 reponse로 보내줌.
        if(Object.keys(errors).length>0){
            return res.status(400).json(errors)
        }

        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password;

        // 엔티티에 정해 놓은 조건으로 user 데이터의 유효성 검사를 해줌
        errors = await validate(user);

        if(errors.length>0) return res.status(400).json(mapErrors(errors));

        //유저정보르 user 테이블에 저장
        await user.save()

        return res.json(user);
    }catch(error){
        console.error(error);
        return res.status(500).json({error});
    }   

};

const login = async (req: Request, res:Response) => {
    const { username, password} = req.body;

    try{
        let errors: any ={};
        // 공백이면, 에러를 프론트로 보내주기
        if(isEmpty(username)) errors.username = "사용자 이름은 비워둘 수 없습니다.";
        if(isEmpty(password)) errors.password = "비밀번호는  비워둘 수 없습니다.";
        if(Object.keys(errors).length>0){
            return res.status(400).json(errors);
        }

        // 디비에서 유저찾기
        const user = await User.findOneBy({username});
    
        // 유저가 없다면 에러보내기
        if(!user) return res.status(404).json({username : "사용자 이름이 등록되지 않았습니다."})

        // 유저가 있다면 비밀번호 비교하기
        const passwordMatches = await bcrypt.compare(password, user.password);

        // 비밀번확 다르다면 에러보내기
        if(!passwordMatches) return res.status(401).json({password:"비밀번호가 잘못되었습니다."});
        // 비밀번호가 맞다면 토큰 생성
        // jwt.sign({토큰에 넣어줄 정보}, 비밀텍스트 -> env로저장 )
        const token = jwt.sign({username}, process.env.JWT_SECRET);

        // 쿠키 저장
        // 이걸위해 creditioanl? 설정한거엇음!
        /** 쿠키의 이름과 값은 항상 인코딩 해야함, 쿠키 하나가 차지하는용량은  최대 4KB 까지이고, 사이트당 약 20여개 사용, (브라우저에 따라 차이)*/
        res.set("Set-Cookie", cookie.serialize("token",token,{
            // 쿠키에대한 옵션을 설정해줘야 브라우저 쿠키에 저장이됨!!
            // https://ko.javascript.info/cookie
            // 클라이언트 측 스크립트가 쿠키를 사용할 수 없게함, document.cookie를 통해 쿠키를 볼 수도 없고, 조작할 수도 없음.
            httpOnly: true,
            secure: process.env.NODE_ENV ==="production",   // https연결에서만 쿠키를 사용 할 수 있게 함 , 우리는 http이기때문에,, 운영환경에서만
            sameSite: "strict",     // 외부사이트에서 욫어이 일어날 때, 브라우저가 쿠키를 보내지 못하도록 막아줌! XSRF공격을 막는데 유용
            maxAge: 60*60*24*7,
            path:"/"
        }));
        
        return res.json({user,token})
    }catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
}


const logout = async (_:Request, res: Response)=>{
    res.set(
        "Set-Cookie",
        cookie.serialize("token","", {
            httpOnly: true,
            secure: process.env.NODE_ENV ==="production",
            sameSite: "strict",
            expires: new Date(0), // 토큰 만료시켜버림
            path: "/"
        })
    );

    res.status(200).json({success:true})
};


// express의 router 모듈사용
const router = Router();
// 요청이왔을때 register 핸들러로 이동 
router.post("/register", register);
router.post("/login",login);
router.post("/logout", userMiddleware, authMiddleware, logout);
router.get("/me", userMiddleware, authMiddleware, me);

// 생성한 router를 entry파일에 임포트
export default router;
