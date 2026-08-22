import 'dotenv/config';
import { PrismaClient, TransactionType } from '@prisma/client'; // 👈 Adicionado TransactionType
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs'; // 👈 Adicionado import do bcryptjs

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Categorias padrão que queremos cadastrar
const defaultCategories = [
  { name: 'Salário', icon: 'wallet', type: TransactionType.INCOME },
  { name: 'Investimentos', icon: 'trending-up', type: TransactionType.INCOME },
  { name: 'Alimentação', icon: 'utensils', type: TransactionType.EXPENSE },
  { name: 'Lazer', icon: 'gamepad-2', type: TransactionType.EXPENSE },
  { name: 'Transporte', icon: 'car', type: TransactionType.EXPENSE },
  { name: 'Moradia', icon: 'home', type: TransactionType.EXPENSE },
  { name: 'Saúde', icon: 'heart-pulse', type: TransactionType.EXPENSE },
];

async function main() {
  console.log('🌱 Iniciando o processo de Seed...');

  // 1. Criar ou buscar um usuário de testes/demonstração
  const passwordHash = await bcrypt.hash('123456', 8); // 👈 Usando bcrypt.hash

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@finance.com' },
    update: {
      phone: '11999999999',
      salary: 5000,
    },
    create: {
      name: 'Usuário Demo',
      email: 'demo@finance.com',
      password: passwordHash,
      phone: '11999999999',
      salary: 5000,
    },
  });
  console.log(`👤 Usuário Demo pronto: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Criar as categorias padrão
  for (const cat of defaultCategories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: cat.name, userId: demoUser.id },
    });

    if (existingCategory) {
      await prisma.category.update({
        where: { id: existingCategory.id },
        data: {
          icon: cat.icon,
          type: cat.type,
        },
      });
      continue;
    }

    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
        userId: demoUser.id,
      },
    });
  }

  console.log(`✅ ${defaultCategories.length} categorias cadastradas com sucesso!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });