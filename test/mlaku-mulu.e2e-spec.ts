/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Biro Perjalanan Mlaku-Mulu (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let employeeToken: string;
  let touristToken: string;
  let touristId: string;
  let tripId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Clean database before tests
    await prisma.trip.deleteMany({});
    await prisma.tourist.deleteMany({});
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    // Clean database after tests
    await prisma.trip.deleteMany({});
    await prisma.tourist.deleteMany({});
    await prisma.employee.deleteMany({});
    await app.close();
  });

  describe('Autentikasi Pegawai', () => {
    it('harus bisa mendaftarkan pegawai baru (POST /api/auth/employee/register)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/employee/register')
        .send({
          email: 'test_pegawai@mlakumulu.com',
          password: 'password123',
          name: 'Pegawai Test',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test_pegawai@mlakumulu.com');
          expect(res.body.name).toBe('Pegawai Test');
        });
    });

    it('harus bisa login sebagai pegawai (POST /api/auth/employee/login)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/employee/login')
        .send({
          email: 'test_pegawai@mlakumulu.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user.role).toBe('employee');
          employeeToken = res.body.accessToken;
        });
    });

    it('harus gagal login pegawai jika password salah', () => {
      return request(app.getHttpServer())
        .post('/api/auth/employee/login')
        .send({
          email: 'test_pegawai@mlakumulu.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Manajemen Turis oleh Pegawai', () => {
    it('harus bisa menambahkan turis baru (POST /api/employees/tourists)', () => {
      return request(app.getHttpServer())
        .post('/api/employees/tourists')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          email: 'turis1@gmail.com',
          password: 'password123',
          name: 'John Doe',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('turis1@gmail.com');
          touristId = res.body.id;
        });
    });

    it('harus gagal tambah turis jika tanpa token pegawai', () => {
      return request(app.getHttpServer())
        .post('/api/employees/tourists')
        .send({
          email: 'turis2@gmail.com',
          password: 'password123',
          name: 'Jane Doe',
        })
        .expect(401);
    });

    it('harus bisa mengambil semua daftar turis (GET /api/employees/tourists)', () => {
      return request(app.getHttpServer())
        .get('/api/employees/tourists')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].email).toBe('turis1@gmail.com');
        });
    });
  });

  describe('Autentikasi Turis', () => {
    it('harus bisa login sebagai turis (POST /api/auth/tourist/login)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/tourist/login')
        .send({
          email: 'turis1@gmail.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user.role).toBe('tourist');
          touristToken = res.body.accessToken;
        });
    });
  });

  describe('Riwayat Perjalanan Turis', () => {
    it('harus mengembalikan riwayat perjalanan kosong di awal (GET /api/tourists/my-trips)', () => {
      return request(app.getHttpServer())
        .get('/api/tourists/my-trips')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('pegawai harus bisa menambahkan perjalanan baru untuk turis (POST /api/employees/tourists/:id/trips)', () => {
      return request(app.getHttpServer())
        .post(`/api/employees/tourists/${touristId}/trips`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: '2026-07-01T10:00:00Z',
          endDate: '2026-07-05T18:00:00Z',
          destination: 'Bali, Indonesia',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.destination).toBe('Bali, Indonesia');
          tripId = res.body.id;
        });
    });

    it('turis harus bisa melihat riwayat perjalanannya sendiri (GET /api/tourists/my-trips)', () => {
      return request(app.getHttpServer())
        .get('/api/tourists/my-trips')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(1);
          expect(res.body[0].id).toBe(tripId);
          expect(res.body[0].tanggalMulaiPerjalanan).toContain(
            '2026-07-01T10:00:00',
          );
          expect(res.body[0].destinasiPerjalanan).toBe('Bali, Indonesia');
        });
    });

    it('turis tidak boleh mengakses endpoint pegawai (GET /api/employees/tourists)', () => {
      return request(app.getHttpServer())
        .get('/api/employees/tourists')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(403);
    });
  });

  describe('Modifikasi data oleh Pegawai', () => {
    it('pegawai harus bisa mengedit perjalanan turis (PUT /api/employees/trips/:tripId)', () => {
      return request(app.getHttpServer())
        .put(`/api/employees/trips/${tripId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          destination: { city: 'Denpasar', island: 'Bali' },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.destination).toEqual({
            city: 'Denpasar',
            island: 'Bali',
          });
        });
    });

    it('turis harus melihat data perjalanan yang diperbarui (GET /api/tourists/my-trips)', () => {
      return request(app.getHttpServer())
        .get('/api/tourists/my-trips')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body[0].destinasiPerjalanan).toEqual({
            city: 'Denpasar',
            island: 'Bali',
          });
        });
    });

    it('pegawai harus bisa menghapus perjalanan turis (DELETE /api/employees/trips/:tripId)', () => {
      return request(app.getHttpServer())
        .delete(`/api/employees/trips/${tripId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);
    });

    it('turis harus melihat riwayat kosong setelah dihapus (GET /api/tourists/my-trips)', () => {
      return request(app.getHttpServer())
        .get('/api/tourists/my-trips')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('Fitur Tambahan - AI Travel Planner & Dashboard (e2e)', () => {
    it('turis harus bisa membuat rencana perjalanan otomatis via AI (POST /api/tourists/ai/generate-itinerary)', () => {
      return request(app.getHttpServer())
        .post('/api/tourists/ai/generate-itinerary')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          destination: 'Bandung',
          durationDays: 2,
          preferences: 'Kopi dan pemandangan alam',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('city', 'Bandung');
          expect(res.body).toHaveProperty('durationDays', 2);
          expect(res.body).toHaveProperty('itinerary');
          expect(res.body.itinerary.length).toBe(2);
        });
    });

    it('pegawai harus bisa membuat trip untuk turis menggunakan AI (POST /api/employees/tourists/:id/ai-trip)', () => {
      return request(app.getHttpServer())
        .post(`/api/employees/tourists/${touristId}/ai-trip`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: '2026-07-01T08:00:00Z',
          destination: 'Lombok',
          durationDays: 3,
          preferences: 'Pantai dan diving',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('touristId', touristId);
          expect(res.body).toHaveProperty('destination');
          expect(res.body.destination).toHaveProperty('city', 'Lombok');
        });
    });

    it('pegawai harus bisa mengakses data statistik dashboard (GET /api/employees/dashboard)', () => {
      return request(app.getHttpServer())
        .get('/api/employees/dashboard')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('overview');
          expect(res.body.overview).toHaveProperty('totalTourists');
          expect(res.body.overview).toHaveProperty('totalTrips');
          expect(res.body).toHaveProperty('tripStatus');
          expect(res.body).toHaveProperty('popularDestinations');
          expect(res.body).toHaveProperty('touristRegistrationTrend');
        });
    });

    it('turis tidak boleh mengakses dashboard pegawai (GET /api/employees/dashboard)', () => {
      return request(app.getHttpServer())
        .get('/api/employees/dashboard')
        .set('Authorization', `Bearer ${touristToken}`)
        .expect(403);
    });
  });
});
