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

const nacionalidades = [
  "Afgana", "Albania", "Alemana", "Andorrana", "Angolesa", "Antiguano-Barbudana",
  "Árabe Emiratense", "Argentina", "Armenia", "Australiana", "Austríaca",
  "Azerbaiyana", "Bahameña", "Bareinita", "Bangladesí", "Barbadense",
  "Belga", "Beliceña", "Beninesa", "Bielorrusa", "Birmana", "Boliviana",
  "Bosnia-Herzegovinia", "Botsuanesa", "Brasileña", "Brunéi", "Búlgara",
  "Burkinesa", "Burundesa", "Butanesa", "Caboverdiana", "Camboyana",
  "Camerunesa", "Canadiense", "Catarí", "Centroafricana", "Chadiana",
  "Chilena", "China", "Chipriota", "Colombiana", "Comorense", "Congoleña",
  "Costarricense", "Croata", "Cubana", "Danesa", "Dominicana",
  "Ecuatoguineana", "Ecuatoriana", "Egipcia", "Emiratense", "Eritrea",
  "Eslovaca", "Eslovena", "Española", "Estadounidense", "Estonia",
  "Etíope", "Fiyiana", "Filipina", "Finlandesa", "Francesa", "Gabonesa",
  "Gambiana", "Georgiana", "Ghanesa", "Granadina", "Griega", "Guatemalteca",
  "Guineana", "Guineano-Bisauense", "Guyanesa", "Haitiana", "Hondureña",
  "Húngara", "India", "Indonesa", "Iraní", "Iraquí", "Irlandesa",
  "Islandesa", "Israelí", "Italiana", "Jamaicana", "Japonesa", "Jordana",
  "Kazaja", "Keniata", "Kirguís", "Kiribatiana", "Kuwaití", "Laosiana",
  "Lesotense", "Letona", "Liberiana", "Libia", "Liechtensteinesa",
  "Lituana", "Luxemburguesa", "Macedonia del Norte", "Madagascarense",
  "Malasia", "Malauiana", "Maldiviana", "Maliense", "Maltesa",
  "Marfileña", "Marroquí", "Mauriciana", "Mauritana", "Mexicana",
  "Micronesia", "Moldava", "Monegasca", "Mongola", "Montenegrina",
  "Mozambiqueña", "Namibia", "Nauruana", "Nepalesa", "Nicaragüense",
  "Nigerina", "Nigeriana", "Noruega", "Neozelandesa", "Omání",
  "Pakistaní", "Palauana", "Palestina", "Panameña", "Papú", "Paraguaya",
  "Peruana", "Polaca", "Portuguesa", "Ruandesa", "Rumana", "Rusa",
  "Samoana", "San Marinense", "Santalucense", "Santodomense",
  "Sao-Tomense", "Saudí", "Senegalesa", "Serbia", "Seychellense",
  "Sierraleonesa", "Singapurense", "Siria", "Somalí", "Ceilanesa",
  "Suazi", "Sudafricana", "Sudanesa", "Sudanesa del Sur", "Sueca",
  "Suiza", "Surinamesa", "Tayika", "Tanzana", "Tailandesa", "Timorense",
  "Togolesa", "Tongana", "Trinitense", "Tunecina", "Turca", "Turkmena",
  "Tuvaluana", "Ucraniana", "Ugandesa", "Uruguaya", "Uzbeka",
  "Vanuatense", "Venezolana", "Vietnamita", "Yemení", "Zambiana",
  "Zimbabuense",
];

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

  console.log("Seeding nacionalidades...");
  for (const name of nacionalidades) {
    await prisma.nacionalidad.upsert({
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
