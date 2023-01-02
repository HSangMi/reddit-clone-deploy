import { instanceToPlain } from "class-transformer";
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class Entity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    //classTransformer에서 제공
    toJSON(){
        return instanceToPlain(this);
    }

}