import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async createTourist(dto: CreateTouristDto) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    const existingTourist = await this.prisma.tourist.findUnique({
      where: { email: dto.email },
    });
    if (existingEmployee || existingTourist) {
      throw new ConflictException('Email sudah terdaftar di sistem');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const tourist = await this.prisma.tourist.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return {
      id: tourist.id,
      email: tourist.email,
      name: tourist.name,
      createdAt: tourist.createdAt,
    };
  }

  async updateTourist(id: string, dto: UpdateTouristDto) {
    const tourist = await this.prisma.tourist.findUnique({ where: { id } });
    if (!tourist) {
      throw new NotFoundException('Turis tidak ditemukan');
    }

    const updateData: {
      email?: string;
      name?: string;
      password?: string;
    } = {};

    if (dto.email) {
      const existingEmployee = await this.prisma.employee.findUnique({
        where: { email: dto.email },
      });
      const existingTourist = await this.prisma.tourist.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existingEmployee || existingTourist) {
        throw new ConflictException('Email sudah digunakan');
      }
      updateData.email = dto.email;
    }

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.tourist.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteTourist(id: string) {
    const tourist = await this.prisma.tourist.findUnique({ where: { id } });
    if (!tourist) {
      throw new NotFoundException('Turis tidak ditemukan');
    }

    await this.prisma.tourist.delete({ where: { id } });
    return {
      message: 'Turis berhasil dihapus beserta seluruh riwayat perjalanannya',
    };
  }

  async findAllTourists() {
    return this.prisma.tourist.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { trips: true },
        },
      },
    });
  }

  async addTripToTourist(touristId: string, dto: CreateTripDto) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: touristId },
    });
    if (!tourist) {
      throw new NotFoundException('Turis tidak ditemukan');
    }

    const trip = await this.prisma.trip.create({
      data: {
        touristId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        destination: dto.destination as Prisma.InputJsonValue,
      },
    });

    return trip;
  }

  async updateTrip(tripId: string, dto: UpdateTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Perjalanan tidak ditemukan');
    }

    const updateData: {
      startDate?: Date;
      endDate?: Date;
      destination?: Prisma.InputJsonValue;
    } = {};

    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }
    if (dto.destination !== undefined) {
      updateData.destination = dto.destination as Prisma.InputJsonValue;
    }

    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: updateData,
    });

    return updated;
  }

  async deleteTrip(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Perjalanan tidak ditemukan');
    }

    await this.prisma.trip.delete({ where: { id: tripId } });
    return { message: 'Perjalanan berhasil dihapus' };
  }
}
