import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const specialities = [
  "Odontología general",
  "Periodoncia",
  "Ortodoncia",
  "Odontopediatría",
  "Endodoncia",
  "Patología oral",
  "Prostodoncia",
  "Operatoria dental y estética",
  "Implantología dental",
  "Cirugía maxilofacial",
];

const provincias = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const obrasSociales = ["OSFA", "PAMI Veteranos"];

async function main() {
  console.log("Seeding specialities...");
  for (const name of specialities) {
    await prisma.speciality.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding provincias...");
  for (const name of provincias) {
    await prisma.provincia.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding obras sociales...");
  for (const name of obrasSociales) {
    await prisma.obraSocial.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
