import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        // 초 단위 숫자로 처리 (타입 에러 X)
        expiresIn: process.env.JWT_EXPIRES_IN
          ? Number(process.env.JWT_EXPIRES_IN)
          : 60 * 60 * 24, // 기본값 1일
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
