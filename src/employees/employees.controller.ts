import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateAiTripDto } from './dto/create-ai-trip.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Pegawai (Employee Operations)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employee')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Mendapatkan statistik ringkasan dan analisis dashboard pegawai',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil statistik dashboard.',
  })
  getDashboardStats() {
    return this.employeesService.getDashboardStats();
  }

  @Get('tourists')
  @ApiOperation({ summary: 'Mendapatkan daftar semua turis' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar turis.' })
  findAllTourists() {
    return this.employeesService.findAllTourists();
  }

  @Post('tourists')
  @ApiOperation({ summary: 'Menambahkan turis baru' })
  @ApiResponse({ status: 201, description: 'Turis berhasil dibuat.' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar.' })
  createTourist(@Body() createTouristDto: CreateTouristDto) {
    return this.employeesService.createTourist(createTouristDto);
  }

  @Put('tourists/:id')
  @ApiOperation({ summary: 'Mengubah data turis' })
  @ApiResponse({ status: 200, description: 'Data turis berhasil diperbarui.' })
  @ApiResponse({ status: 404, description: 'Turis tidak ditemukan.' })
  updateTourist(
    @Param('id') id: string,
    @Body() updateTouristDto: UpdateTouristDto,
  ) {
    return this.employeesService.updateTourist(id, updateTouristDto);
  }

  @Delete('tourists/:id')
  @ApiOperation({
    summary: 'Menghapus data turis beserta semua riwayat perjalanannya',
  })
  @ApiResponse({ status: 200, description: 'Turis berhasil dihapus.' })
  @ApiResponse({ status: 404, description: 'Turis tidak ditemukan.' })
  deleteTourist(@Param('id') id: string) {
    return this.employeesService.deleteTourist(id);
  }

  @Post('tourists/:id/trips')
  @ApiOperation({
    summary: 'Menambahkan perjalanan (Trip) baru untuk turis tertentu',
  })
  @ApiResponse({ status: 201, description: 'Perjalanan berhasil ditambahkan.' })
  @ApiResponse({ status: 404, description: 'Turis tidak ditemukan.' })
  addTripToTourist(
    @Param('id') id: string,
    @Body() createTripDto: CreateTripDto,
  ) {
    return this.employeesService.addTripToTourist(id, createTripDto);
  }

  @Put('trips/:tripId')
  @ApiOperation({ summary: 'Mengubah data perjalanan turis' })
  @ApiResponse({
    status: 200,
    description: 'Data perjalanan berhasil diperbarui.',
  })
  @ApiResponse({ status: 404, description: 'Perjalanan tidak ditemukan.' })
  updateTrip(
    @Param('tripId') tripId: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.employeesService.updateTrip(tripId, updateTripDto);
  }

  @Delete('trips/:tripId')
  @ApiOperation({ summary: 'Menghapus data perjalanan turis' })
  @ApiResponse({ status: 200, description: 'Perjalanan berhasil dihapus.' })
  @ApiResponse({ status: 404, description: 'Perjalanan tidak ditemukan.' })
  deleteTrip(@Param('tripId') tripId: string) {
    return this.employeesService.deleteTrip(tripId);
  }

  @Post('tourists/:id/ai-trip')
  @ApiOperation({
    summary:
      'Membuat perjalanan (Trip) untuk turis tertentu dengan rencana berbasis AI',
  })
  @ApiResponse({
    status: 201,
    description: 'Trip berbasis AI berhasil ditambahkan.',
  })
  @ApiResponse({ status: 404, description: 'Turis tidak ditemukan.' })
  addAiTripToTourist(
    @Param('id') id: string,
    @Body() createAiTripDto: CreateAiTripDto,
  ) {
    return this.employeesService.addAiTripToTourist(id, createAiTripDto);
  }
}
