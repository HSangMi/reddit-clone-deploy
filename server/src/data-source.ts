import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'postgres',
    synchronize: true, // 서버 실행 시, 실제 db와 동기화함. (운영환경에선 false!)
    logging: false,
    entities: [
      //User : 한개씩 넣어줘도됨
      'src/entities/**/*.ts',
    ],
    migrations: [],
    subscribers: [],
})
