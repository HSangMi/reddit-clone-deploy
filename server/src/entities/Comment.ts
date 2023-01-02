import { Exclude, Expose } from "class-transformer";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { makeId } from "../utils/helpers";
import BaseEntity from "./Entity"
import Post from "./Post";
import { User } from "./User";
import Votes from "./Vote";

@Entity("comments")
export class Comment extends BaseEntity{

    @Index()
    @Column()
    identifier: string;

    @Column()
    body: string;

    @Column()
    username: string;

    @ManyToOne(()=>User)
    @JoinColumn({name:"username", referencedColumnName:"username"})
    user: User;

    @Column()
    postId: number;

    @ManyToOne(()=>Post, (post)=> post.comments, {nullable:false})
    post: Post;

    @Exclude()
    @OneToMany(()=> Votes, (Vote)=> Vote.comment)
    votes: Votes[];

    protected userVote: number;

    setUserVote(user: User){
        // 해당 댓글에대한 사용자의 vote value 가져옴
        const index = this.votes?.findIndex((v)=> v.username===user.username);
        this.userVote = index > -1? this.votes[index].value : 0;
    }

    @Expose() get voteScore(): number{
        const initialValue = 0
        return this.votes?.reduce((previousValue, currentObject)=>
            previousValue + (currentObject.value || 0), initialValue);
    }

    @BeforeInsert()
    makeId(){
        this.identifier = makeId(8);
    }
}