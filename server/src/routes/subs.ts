import {Request, Response, Router} from "express";
import jwt from 'jsonwebtoken';
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"
import { isEmpty } from "class-validator";
import { AppDataSource } from '../data-source'
import Sub from "../entities/Sub";
import { User } from "../entities/User";
import Post from "../entities/Post";
import { NextFunction } from "express-serve-static-core";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helpers";
import { fstat, unlinkSync } from "fs";


const getSub = async (req:Request, res:Response)=>{
    const name = req.params.name;
    console.log("name:",name)
    try{
        const sub = await Sub.findOneByOrFail({name}); 

        // 포스트를 생성한 후에 해당 sub에 속하는 포스트 정보들을 넣어주기
        const posts = await Post.find({
            where: {subName: sub.name},
            order: {createdAt:"DESC"},
            relations : ["comments", "votes"],
        })
        sub.posts = posts;
        
        // 투표정보
        if(res.locals.user){
            sub.posts.forEach((p)=>p.setUserVote(res.locals.user));
        }
        // console.log("sub", sub);

        return res.json(sub)
    }catch(error){
        console.log(error);
        return res.status(404).json({error:"커뮤니티를 찾을 수 없습니다."})
    }

}

const createSub = async (req: Request, res:Response, next) => {
    const {name, title, description} = req.body;

    /**************
     *  유저, 인증 프로세스는 많은 핸들러에서 필요로 하는 프로세스 이기 때문에, 미들웨어로 분리해서 사용! => 재사용성!
     *  - User Middleware
     *  - Auth Middleware 
     ***************/
    try{
        let errors: any = {};
        if(isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if(isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

        // query Builder를 이용하여, 데이터를 select 해올거임
        const sub = await AppDataSource
                        .getRepository(Sub)
                        .createQueryBuilder("sub")
                        .where("lower(sub.name) = :name", {name: name.toLowerCase()})
                        .getOne();

        if(sub) errors.name = "서브가 이미 존재합니다."
        if(Object.keys(errors).length>0){
            throw errors;
        }

    }catch(error){
        console.log(error);
        return res.status(500).json({error:"문제가 발생했습니다."})
    }

    try{
        const user: User = res.locals.user;

        const sub = new Sub();
        sub.name = name;
        sub.title = title;
        sub.description = description;
        sub.user = user;

        await sub.save();
        return res.json(sub);
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"sub 생성중 문제가 발생했습니다."})
    }
};

const topSubs = async (_:Request, res: Response)=>{
    try{
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource
        .createQueryBuilder()
        .select(`s.title, s.name,${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`)
        .from(Sub, "s")
        .leftJoin(Post, "p",`s.name = p."subName"`)
        .groupBy('s.title, s.name, "imageUrl"')
        .orderBy(`"postCount"`, "DESC")
        .limit(5)
        .execute();
        return res.json(subs);
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"문제발생"});
    }
}

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user;

    try{
        const sub =await Sub.findOneOrFail({ where: {name: req.params.name} });
        // req.params.name <- path에있는 파라미터 (/:name)

        if(sub.username !== user.username) {
            return res.status(403).json({ error: "이 커뮤니티를 소유하고 있지 않습니다."});
        }

        res.locals.sub = sub;
        return next();
    }catch (error){
        console.log(error);
        return res.status(500).json({error:"문제가 발생했습니다."});
    }
}

// multer모듈 설치 
const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",       // 저장할 위치
        filename: (_,file,callback) => {    // 저장할 이름
            const name = makeId(15);    // 임의로 이름 + 확장자
            callback(null, name + path.extname(file.originalname)); // imangename + .png
        },
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" ) {
            callback(null, true);
        }else{
            callback(new Error("이미지가 아닙니다."));
        }
    },
})

const uploadSubImage = async (req: Request, res: Response)=>{
    const sub: Sub = res.locals.sub;
    try{
        const type = req.body.type;


        // 파일 유형 지정치 않았을 시에는 업로드된 파일 삭제
        if(type !== "image" && type !== "banner"){
            if(!req.file?.path){
                // 실제 파일패스도 유효하지 않으면, 바로 에러 전달
                return res.status(400).json({error:"잘못된 유형"});
            }

            // multer에 의 해 캡슐화 된 파일 객체에는 파일 경로가 있기 때문에,
            // dirname/pwd가 자동으로 추가됨
            // 이미업로드된 파일을 삭제시켜줌!!
            unlinkSync(req.file.path);
            return res.status(400).json({error:"잘못된 유형"})

        }

        let oldImageUrn: string="";
        if(type ==="image"){
            //사용중인 Urn을 저장합니다. (이전 파일을 아래서 삭제하기위해서)
            oldImageUrn = sub.imageUrn || "";

            // 새로운 파일 이름을 Urn으로 넣어주 ㅂ니다.
            sub.imageUrn = req.file?.filename || "";
        }else if(type ==="banner"){
            oldImageUrn = sub.bannerUrn || "";
            sub.bannerUrn = req.file?.filename || "";
        }
        await sub.save();

        // 사용하지 않는 이미지 파일 삭제
        if(oldImageUrn !== ""){
            //데이터베이스는 파일 이름일 뿐이므로 개체 경로 접두사를 직접 추가해야 합니다.
            // Linux 및 Windows와 호환
            const fullFilaName = path.resolve(process.cwd(), "public","images", oldImageUrn);
            unlinkSync(fullFilaName);
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({error:"Something went wrong"});
    }
}


const router = Router();

router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware,  createSub);
router.get("/sub/topSubs", topSubs);
router.post(
    "/:name/upload",
    userMiddleware,
    authMiddleware,
    ownSub,
    upload.single("file"),
    uploadSubImage
)

export default router;