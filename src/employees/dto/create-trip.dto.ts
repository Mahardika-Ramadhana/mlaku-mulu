import { IsNotEmpty, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({
    example: '2026-06-20T10:00:00Z',
    description: 'Tanggal mulai perjalanan dalam format UTC (ISO 8601)',
  })
  @IsISO8601({}, { message: 'Format tanggal mulai harus ISO 8601 (UTC)' })
  @IsNotEmpty({ message: 'Tanggal mulai tidak boleh kosong' })
  startDate: string;

  @ApiProperty({
    example: '2026-06-25T18:00:00Z',
    description: 'Tanggal berakhir perjalanan dalam format UTC (ISO 8601)',
  })
  @IsISO8601({}, { message: 'Format tanggal berakhir harus ISO 8601 (UTC)' })
  @IsNotEmpty({ message: 'Tanggal berakhir tidak boleh kosong' })
  endDate: string;

  @ApiProperty({
    example: 'Bali, Indonesia',
    description:
      'Destinasi perjalanan (bisa berupa string atau JSON object/array)',
  })
  @IsNotEmpty({ message: 'Destinasi tidak boleh kosong' })
  destination: unknown;
}
