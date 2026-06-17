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
import { AiService } from '../ai/ai.service';
import { CreateAiTripDto } from './dto/create-ai-trip.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

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

  async addAiTripToTourist(touristId: string, dto: CreateAiTripDto) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: touristId },
    });
    if (!tourist) {
      throw new NotFoundException('Turis tidak ditemukan');
    }

    // 1. Generate Rencana Perjalanan menggunakan AI
    const itinerary: unknown = await this.aiService.generateItinerary(
      dto.destination,
      dto.durationDays,
      dto.preferences,
    );

    // 2. Hitung tanggal berakhir berdasarkan durasi hari
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + dto.durationDays);

    // 3. Simpan trip ke database
    const trip = await this.prisma.trip.create({
      data: {
        touristId,
        startDate,
        endDate,
        destination: itinerary as Prisma.InputJsonValue,
      },
    });

    return trip;
  }

  async getDashboardStats() {
    const now = new Date();

    // 1. Hitung total turis dan total perjalanan
    const totalTourists = await this.prisma.tourist.count();
    const totalTrips = await this.prisma.trip.count();

    // 2. Status perjalanan (Active, Upcoming, Completed)
    const activeTrips = await this.prisma.trip.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const upcomingTrips = await this.prisma.trip.count({
      where: {
        startDate: { gt: now },
      },
    });

    const completedTrips = await this.prisma.trip.count({
      where: {
        endDate: { lt: now },
      },
    });

    // 3. Cari 5 destinasi paling populer
    const trips = await this.prisma.trip.findMany({
      select: { destination: true },
    });

    const destinationCounts: Record<string, number> = {};
    for (const trip of trips) {
      let destName = '';
      const dest = trip.destination;

      if (typeof dest === 'string') {
        destName = dest;
      } else if (dest && typeof dest === 'object' && !Array.isArray(dest)) {
        const d = dest as {
          city?: string;
          country?: string;
          city_name?: string;
        };
        if (d.city) {
          destName = d.city + (d.country ? `, ${d.country}` : '');
        } else if (d.city_name) {
          destName = d.city_name;
        } else {
          destName = JSON.stringify(dest);
        }
      }

      destName = destName.trim();
      if (destName) {
        destinationCounts[destName] = (destinationCounts[destName] || 0) + 1;
      }
    }

    const popularDestinations = Object.entries(destinationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Tren pendaftaran turis baru (6 bulan terakhir)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const newTourists = await this.prisma.tourist.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });

    const monthlyStats: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      monthlyStats[label] = 0;
    }

    for (const t of newTourists) {
      const label = t.createdAt.toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      if (monthlyStats[label] !== undefined) {
        monthlyStats[label]++;
      }
    }

    const touristRegistrationTrend = Object.entries(monthlyStats).map(
      ([month, count]) => ({
        month,
        count,
      }),
    );

    return {
      overview: {
        totalTourists,
        totalTrips,
      },
      tripStatus: {
        active: activeTrips,
        upcoming: upcomingTrips,
        completed: completedTrips,
      },
      popularDestinations,
      touristRegistrationTrend,
    };
  }
}
