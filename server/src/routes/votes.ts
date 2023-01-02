import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user"
import authMiddleware from "../middlewares/auth"
import { User } from "../entities/User";
import Post from "../entities/Post";
import Votes from "../entities/Vote";
import { Comment } from "../entities/Comment";

const router = Router();

const vote = async (req:Request, res:Response) => {
    const { identifier, slug, commentIdentifier, value } = req.body

    // -1, 0, 1 값만 오는지 체크
    if(![1,0,-1].includes(value)){
        return res.status(400).json({ value: "-1, 0, 1 value만 가능"});
    }

    try {
        const user: User = res.locals.user;
        let post:Post | undefined 
        // = await Post.findOneByOrFail({identifier, slug});
        = await Post.findOneOrFail({
            where: {
                identifier, slug
            },
            relations: ["comments", "comments.votes","sub", "votes"]
        })
        let vote:Votes | undefined;
        let comment: Comment;
        console.log("투표할떄, post 호출-----------------");
        console.log(post);
        console.log("-----------------------------------")

        if(commentIdentifier){
            // 댓글 식별자가 있는 경우, 댓글 투표 처리
            comment = await Comment.findOneByOrFail({identifier: commentIdentifier});
            vote = await Votes.findOneBy({username: user.username ,commentId:comment.id});
        }else{
            // 포스트 투표처리
            vote = await Votes.findOneBy({username: user.username, postId:post.id});
        }

        if(!vote && value === 0 ){
            // vote이 없고 value가 0인 경우 오류 반환
            return res.status(404).json({error:"Vote을 찾을 수 없습니다."})
        } else if(!vote){
            vote = new Votes();
            vote.user = user;
            vote.value = value;

            // 게시물에 속한 vote or 댓글에 속한 vote
            if(comment) vote.comment = comment
            else vote.post = post;

            await vote.save();
        } else if(value ===0){
            // 투표 취소가 되는경우, 투표정보 삭제
            vote.remove();
        } else if(vote.value !== value) {
            vote.value = value;
            await vote.save();
        }

        // post 정보를 새로 갱신해서 전달
        // post = await Post.findOneOrFail({
        //     where: {
        //         identifier, slug
        //     },
        //     relations: ["comments", "comments.votes","sub", "votes"]
        // })

        post.setUserVote(user);
        post.comments.forEach(c => c.setUserVote(user));
        console.log("투표완료 후 post -------------------");
        console.log(post);
        console.log("------------------------------------")


        return res.json(post);

    } catch (error) {
        console.log(error);
        return res.status(500).json({error : "문제가 발생했습니다."})
        
    }
}

router.post("/", userMiddleware, authMiddleware, vote);

export default router;