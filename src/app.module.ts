import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { TouristsModule } from './tourists/tourists.module';

@Module({
  imports: [PrismaModule, AuthModule, EmployeesModule, TouristsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
