import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'
import * as compression from 'compression'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

const PORT = parseInt(process.env.PORT, 10) || 4000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // register all plugins and extension
  app.enableCors({ origin: '*' })
  app.useGlobalPipes(new ValidationPipe({}))
  app.enableVersioning({ type: VersioningType.URI })
  app.use(helmet())
  app.use(compression())

  const config = new DocumentBuilder()
    .setTitle('Catalisa API')
    .setDescription('Test Application')
    .setVersion('v1')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(PORT, () => {
    console.log(`🚀 Application running at port ${PORT}`)
  })
}

bootstrap()
