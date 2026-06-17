import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TouristsService } from './tourists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AiService } from '../ai/ai.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';

interface RequestUser {
  id: string;
  email: string;
  role: 'employee' | 'tourist';
  name: string;
}

@ApiTags('Turis (Tourist Operations)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tourist')
@Controller('tourists')
export class TouristsController {
  constructor(
    private readonly touristsService: TouristsService,
    private readonly aiService: AiService,
  ) {}

  @Get('my-trips')
  @ApiOperation({ summary: 'Melihat riwayat perjalanan diri sendiri' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil riwayat perjalanan.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-123' },
          tanggalMulaiPerjalanan: {
            type: 'string',
            example: '2026-06-20T10:00:00.000Z',
          },
          tanggalBerakhirPerjalanan: {
            type: 'string',
            example: '2026-06-25T18:00:00.000Z',
          },
          destinasiPerjalanan: {
            oneOf: [
              { type: 'string', example: 'Bali, Indonesia' },
              {
                type: 'object',
                example: { city: 'Bali', country: 'Indonesia' },
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada.',
  })
  @ApiResponse({ status: 403, description: 'Bukan seorang turis.' })
  getMyTrips(@CurrentUser() user: RequestUser) {
    return this.touristsService.getMyTrips(user.id);
  }

  @Post('ai/generate-itinerary')
  @ApiOperation({
    summary: 'Membuat rekomendasi jadwal perjalanan otomatis berbasis AI',
  })
  @ApiResponse({
    status: 201,
    description: 'Rencana perjalanan AI berhasil digenerate.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada.',
  })
  @ApiResponse({ status: 403, description: 'Bukan seorang turis.' })
  generateItinerary(@Body() dto: GenerateItineraryDto) {
    return this.aiService.generateItinerary(
      dto.destination,
      dto.durationDays,
      dto.preferences,
    );
  }
}
