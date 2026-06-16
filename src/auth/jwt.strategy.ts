import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DecodedToken {
  sub: string;
  email: string;
  role: 'employee' | 'tourist';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-change-in-prod',
    });
  }

  async validate(payload: DecodedToken) {
    const { sub, role } = payload;
    if (!role) {
      throw new UnauthorizedException('Token tidak memiliki informasi role');
    }

    if (role === 'employee') {
      const employee = await this.prisma.employee.findUnique({
        where: { id: sub },
      });
      if (!employee) {
        throw new UnauthorizedException('Pegawai tidak ditemukan');
      }
      return {
        id: employee.id,
        email: employee.email,
        role: 'employee',
        name: employee.name,
      };
    } else if (role === 'tourist') {
      const tourist = await this.prisma.tourist.findUnique({
        where: { id: sub },
      });
      if (!tourist) {
        throw new UnauthorizedException('Turis tidak ditemukan');
      }
      return {
        id: tourist.id,
        email: tourist.email,
        role: 'tourist',
        name: tourist.name,
      };
    }

    throw new UnauthorizedException('Role tidak valid');
  }
}
