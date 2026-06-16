import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TouristsService {
  constructor(private prisma: PrismaService) {}

  async getMyTrips(touristId: string) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: touristId },
      include: {
        trips: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
    });

    if (!tourist) {
      throw new NotFoundException('Turis tidak ditemukan');
    }

    return tourist.trips.map((trip) => ({
      id: trip.id,
      tanggalMulaiPerjalanan: trip.startDate.toISOString(), // Dipastikan dalam format ISO (UTC)
      tanggalBerakhirPerjalanan: trip.endDate.toISOString(), // Dipastikan dalam format ISO (UTC)
      destinasiPerjalanan: trip.destination,
    }));
  }
}
