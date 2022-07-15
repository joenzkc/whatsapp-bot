import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.NODE_PORT || 8080, () =>
    console.log('NestJS running on port ', process.env.NODE_PORT),
  );
}
bootstrap();
