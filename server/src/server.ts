import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source"
import authRoutes from "./routes/auth";
import subRoutes from './routes/subs';
import postRoutes from './routes/posts';
import voteRoutes from './routes/votes';
import userRoutes from './routes/users';


import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

const app = express(); // express() : express 모둘을 사용할 떄 최상위 함수! 상수로 가져와서 사용

//3000번 포트에서 오는 요청을 cors허용
const origin = process.env.ORIGIN;
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true
    })
)


// 사용할 미들웨어들 추가
app.use(express.json());
/**
 * express.json : request에서 json을 가져올 때, 해석해서 사용하기 위함
 */
app.use(morgan("dev"));
/**
 * morgan (로그)옵션 : dev, short, common, combined
 */
app.use(cookieParser());
/**
 * 프론트에서 전달하는 쿠키 사용!
 */

// .env파일 사용
dotenv.config();

// app.get의 url로 접속을 하면 해당 블록의 코드를 실행합니다.
app.get("/", (_, res) => res.send("running"));
app.use("/api/auth", authRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

// 브라우저에서 해당 경로 접근 가능하게 설정해줌
app.use(express.static("public"));

let port = 4000;
// app.listen의 포트로 접속하면 해당 블록의 코드를 실행합니다.
app.listen(port, async () => {
    console.log(`Server running at ${process.env.ORIGIN}`);

    // app구동 시 , db와 연결하기
    AppDataSource.initialize().then(() => {

        console.log("database initialized")
    }).catch(error => console.log(error))

});