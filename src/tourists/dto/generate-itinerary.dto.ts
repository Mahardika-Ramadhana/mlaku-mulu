import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateItineraryDto {
  @ApiProperty({
    example: 'Yogyakarta',
    description: 'Kota atau wilayah destinasi perjalanan',
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
    example: 'Kuliner tradisional, sejarah, dan pantai',
    description: 'Preferensi atau tema aktivitas liburan',
    required: false,
  })
  @IsString({ message: 'Preferensi harus berupa string' })
  @IsOptional()
  preferences?: string;
}
