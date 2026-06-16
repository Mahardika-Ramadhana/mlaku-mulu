import { IsOptional, IsISO8601, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: '2026-06-21T10:00:00Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'Format tanggal mulai harus ISO 8601 (UTC)' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-26T18:00:00Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'Format tanggal berakhir harus ISO 8601 (UTC)' })
  endDate?: string;

  @ApiPropertyOptional({ example: 'Lombok, Indonesia' })
  @IsOptional()
  @IsNotEmpty({ message: 'Destinasi tidak boleh kosong' })
  destination?: unknown;
}
