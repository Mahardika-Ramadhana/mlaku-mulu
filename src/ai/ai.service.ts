import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'isi_dengan_api_key_gemini_anda') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'GEMINI_API_KEY kosong atau belum diisi. Menggunakan Mode Mock.',
      );
    }
  }

  async generateItinerary(
    destination: string,
    durationDays: number,
    preferences?: string,
  ): Promise<any> {
    if (!this.genAI) {
      this.logger.log('Menggunakan mock itinerary generator (API Key kosong).');
      return this.getMockItinerary(destination, durationDays, preferences);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const prompt = `Buat rencana perjalanan (itinerary) wisata ke "${destination}" selama ${durationDays} hari.
Preferensi aktivitas: ${preferences || 'bebas/umum'}.

Anda HARUS mengembalikan response dalam format JSON yang valid dengan struktur berikut:
{
  "city": "${destination}",
  "durationDays": ${durationDays},
  "preferences": "${preferences || 'bebas/umum'}",
  "itinerary": [
    {
      "day": 1,
      "activities": [
        "Aktivitas pagi beserta jamnya...",
        "Aktivitas siang beserta jamnya...",
        "Aktivitas sore/malam..."
      ]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error) {
      this.logger.error(
        'Gagal memanggil Gemini API, beralih ke Mock Fallback.',
        error,
      );
      return this.getMockItinerary(destination, durationDays, preferences);
    }
  }

  private getMockItinerary(
    destination: string,
    durationDays: number,
    preferences?: string,
  ) {
    const defaultActivities = [
      [
        '09:00 - Mengunjungi ikon wisata budaya terpopuler',
        '12:00 - Makan siang kuliner legendaris khas daerah',
        '15:00 - Bersantai di tempat alam atau taman kota terdekat',
        '19:00 - Makan malam romantis kuliner malam',
      ],
      [
        '09:00 - Petualangan alam dan spot foto estetik',
        '13:00 - Makan siang di restoran lokal rekomendasi warga',
        '16:00 - Berburu oleh-oleh unik khas setempat',
        '20:00 - Menikmati suasana kota malam hari',
      ],
      [
        '10:00 - Mengunjungi galeri seni / museum bersejarah',
        '13:00 - Makan siang hidangan tradisional otentik',
        '15:30 - Kelas edukasi / workshop kerajinan lokal',
        '18:30 - Nongkrong santai di kedai kopi populer setempat',
      ],
    ];

    const itinerary = Array.from({ length: durationDays }, (_, i) => {
      const activitiesIdx = i % defaultActivities.length;
      return {
        day: i + 1,
        activities: defaultActivities[activitiesIdx].map((activity) => {
          if (preferences) {
            return activity.replace(
              'ikon wisata budaya terpopuler',
              preferences,
            );
          }
          return activity;
        }),
      };
    });

    return {
      city: destination,
      durationDays,
      preferences: preferences || 'bebas/umum',
      itinerary,
      isMock: true,
    };
  }
}
