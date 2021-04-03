import "reflect-metadata";
require("dotenv-safe").config();
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import cors from "cors";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { helloResolver } from "./resolvers/hello";
import { PostResvoler } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

//import { sendEmail } from "./utils/sendEmail";
//rerun
const main = async () => {
  //database connectivity using mikroorm
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    //synchronize creates tables auto without migrations, useful for development
    // synchronize: true,
    entities: [User, Post, Updoot],
  });
  //await conn.runMigrations();

  //server connectivity
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  //await Post.delete({});
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,

      store: new RedisStore({
        client: redis, //lets the session know we are using redis
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", //protecting csrf
        secure: __prod__, //cookie only work in https, should or could be true in production,  but set to false in dev
        domain: __prod__ ? "falconapi.net" : undefined, //check or setup domain for cookie
      },
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, PostResvoler, UserResolver],
      validate: false,
    }),
    //context is a special object accessible to all resolvers
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  //const posts = await Post.find();
  // console.log(posts);

  app.listen(parseInt(process.env.PORT), () =>
    console.log("server running on localhost:4000")
  );
};

main().catch((err) => {
  console.error(err);
});
