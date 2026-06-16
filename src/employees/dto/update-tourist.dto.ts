import { IsEmail, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTouristDto {
  @ApiPropertyOptional({ example: 'tourist_new@gmail.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @ApiPropertyOptional({ example: 'Johnathan Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name?: string;
}
