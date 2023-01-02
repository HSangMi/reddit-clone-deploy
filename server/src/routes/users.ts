import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import userMiddleware from "../middlewares/user";
import Post from "../entities/Post";
import { Comment } from "../entities/Comment";

const getUserData = async (req: Request, res: Response) => {
  try {
    // 유저 정보 가져오기
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      select: ["username", "createdAt"],
    });

    // 유저가 쓴 포스트 정보 가져오기
    const posts = await Post.find({
      where: { username: user.username },
      relations: ["comments", "votes", "sub"],  // votes 스코어를 계산하기위해, comments, votes까지 릴레이션으로 가져옴
    });

    // 유저가 쓴 댓글 정보 가져오기
    const comments = await Comment.find({
      where: { username: user.username },
      relations: ["post"],
    });

    // 로그인된 유저르 가져와서 voteScore 계산
    if (res.locals.user) {
      const { user } = res.locals;
      posts.forEach((p) => p.setUserVote(user));
      comments.forEach((c) => c.setUserVote(user));
    }

    let userData: any[] = [];

    // toJSON : spread operator로 데이터를 복사할 때, 클래스로 되어있으면, 복사를 못해주기 때문에, toJSON 으로 전달
    posts.forEach((p) => userData.push({ type: "Post", ...p.toJSON() })); 
    comments.forEach((c) => userData.push({ type: "Comment", ...c.toJSON() }));

    // 최신 정보가 먼저 오게 순서 정렬
    userData.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    return res.json({ user, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();
router.get("/:username", userMiddleware, getUserData);

export default router;
