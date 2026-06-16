import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autentikasi')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('employee/register')
  @ApiOperation({ summary: 'Mendaftarkan akun Pegawai baru' })
  @ApiResponse({ status: 201, description: 'Pegawai berhasil didaftarkan.' })
  @ApiResponse({ status: 409, description: 'Email pegawai sudah terdaftar.' })
  registerEmployee(@Body() registerEmployeeDto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(registerEmployeeDto);
  }

  @Post('employee/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login untuk Pegawai' })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, mengembalikan access token.',
  })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid.' })
  loginEmployee(@Body() loginDto: LoginDto) {
    return this.authService.loginEmployee(loginDto);
  }

  @Post('tourist/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login untuk Turis' })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, mengembalikan access token.',
  })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid.' })
  loginTourist(@Body() loginDto: LoginDto) {
    return this.authService.loginTourist(loginDto);
  }
}
