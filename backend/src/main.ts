import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import secureSession from "@fastify/secure-session";
import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(secureSession, {
    secret: process.env.SECRET || "verysecretkeydonttellanyonethankyouverymuch",
    salt: "lptlpghokdkxjiwu",
    cookie: {
      path: "/"
    }
  });

  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT || 5000, "0.0.0.0");
}
bootstrap();
