import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmployeeDto {
  @ApiProperty({ example: 'employee@mlakumulu.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiProperty({ example: 'Budi Pegawai' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;
}
