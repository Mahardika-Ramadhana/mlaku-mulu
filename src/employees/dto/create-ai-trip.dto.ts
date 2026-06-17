import {
  IsNotEmpty,
  IsISO8601,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiTripDto {
  @ApiProperty({
    example: '2026-06-20T10:00:00Z',
    description: 'Tanggal mulai perjalanan dalam format UTC (ISO 8601)',
  })
  @IsISO8601({}, { message: 'Format tanggal mulai harus ISO 8601 (UTC)' })
  @IsNotEmpty({ message: 'Tanggal mulai tidak boleh kosong' })
  startDate: string;

  @ApiProperty({
    example: 'Yogyakarta',
    description: 'Kota destinasi perjalanan',
  })
  @IsString({ message: 'Destinasi harus berupa string' })
  @IsNotEmpty({ message: 'Destinasi tidak boleh kosong' })
  destination: string;

  @ApiProperty({
    example: 3,
    description: 'Durasi perjalanan dalam hari',
  })
  @IsNumber({}, { message: 'Durasi harus berupa angka' })
  @Min(1, { message: 'Durasi minimal 1 hari' })
  @Max(30, { message: 'Durasi maksimal 30 hari' })
  durationDays: number;

  @ApiProperty({
    example: 'Sejarah, budaya, dan kuliner',
    description: 'Preferensi aktivitas',
    required: false,
  })
  @IsString({ message: 'Preferensi harus berupa string' })
  @IsOptional()
  preferences?: string;
}
