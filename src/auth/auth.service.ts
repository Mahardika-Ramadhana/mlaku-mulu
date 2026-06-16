import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerEmployee(dto: RegisterEmployeeDto) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (existingEmployee) {
      throw new ConflictException('Email pegawai sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const employee = await this.prisma.employee.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return {
      message: 'Pegawai berhasil didaftarkan',
      id: employee.id,
      email: employee.email,
      name: employee.name,
    };
  }

  async loginEmployee(dto: LoginDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (!employee) {
      throw new UnauthorizedException(
        'Kredensial tidak valid (Email atau Password salah)',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      employee.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Kredensial tidak valid (Email atau Password salah)',
      );
    }

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: 'employee',
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: 'employee',
      },
    };
  }

  async loginTourist(dto: LoginDto) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { email: dto.email },
    });
    if (!tourist) {
      throw new UnauthorizedException(
        'Kredensial tidak valid (Email atau Password salah)',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      tourist.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Kredensial tidak valid (Email atau Password salah)',
      );
    }

    const payload = { sub: tourist.id, email: tourist.email, role: 'tourist' };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: tourist.id,
        email: tourist.email,
        name: tourist.name,
        role: 'tourist',
      },
    };
  }
}
