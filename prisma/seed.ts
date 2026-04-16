import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Housing",
  "Transportation",
  "Healthcare",
  "Utilities",
  "Personal Care",
  "Personal Spendings",
  "Groceries",
  "Dining",
  "Leisure",
  "Offerings",
  "Studies",
  "Education",
  "Entertainment",
  "Travel",
  "Insurance",
  "Subscriptions",
  "Clothing",
  "Gifts",
  "Other",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mybudget.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const adminName = process.env.ADMIN_NAME || "Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${existingAdmin.email}`);
  }

  // Create a demo user with sample expenses
  const demoEmail = "demo@mybudget.local";
  const existingDemo = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  let demoUser = existingDemo;

  if (!existingDemo) {
    const hashedPassword = await bcrypt.hash("Demo@123456", 12);
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo User",
        password: hashedPassword,
        role: Role.USER,
        emailVerified: true,
      },
    });
    console.log(`✅ Demo user created: ${demoUser.email}`);
  }

  if (demoUser) {
    const expenseCount = await prisma.expense.count({
      where: { userId: demoUser.id },
    });

    if (expenseCount === 0) {
      const now = new Date();
      const year = now.getFullYear();
      const sampleExpenses = generateSampleExpenses(demoUser.id, year);
      await prisma.expense.createMany({ data: sampleExpenses });
      console.log(`✅ ${sampleExpenses.length} sample expenses created for demo user`);
    }
  }

  console.log("✅ Seeding complete!");
  console.log("\n📋 Default credentials:");
  console.log(`   Admin: ${process.env.ADMIN_EMAIL || "admin@mybudget.local"} / ${process.env.ADMIN_PASSWORD || "Admin@123456"}`);
  console.log(`   Demo:  demo@mybudget.local / Demo@123456`);
}

function generateSampleExpenses(userId: string, year: number) {
  const expenses = [];

  const monthlyData = [
    // Jan
    { month: 0, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 0, category: "Groceries", vendor: "Whole Foods", amount: 320.5 },
    { month: 0, category: "Utilities", vendor: "Electric Company", amount: 95.2 },
    { month: 0, category: "Transportation", vendor: "Gas Station", amount: 60 },
    { month: 0, category: "Dining", vendor: "Local Restaurant", amount: 85 },
    { month: 0, category: "Healthcare", vendor: "Pharmacy", amount: 45 },
    { month: 0, category: "Subscriptions", vendor: "Netflix", amount: 15.99 },
    { month: 0, category: "Subscriptions", vendor: "Spotify", amount: 9.99 },
    // Feb
    { month: 1, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 1, category: "Groceries", vendor: "Trader Joe's", amount: 290 },
    { month: 1, category: "Utilities", vendor: "Electric Company", amount: 88.5 },
    { month: 1, category: "Transportation", vendor: "Gas Station", amount: 55 },
    { month: 1, category: "Dining", vendor: "Pizza Place", amount: 45 },
    { month: 1, category: "Leisure", vendor: "Cinema", amount: 30 },
    { month: 1, category: "Offerings", vendor: "Church", amount: 100 },
    // Mar
    { month: 2, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 2, category: "Groceries", vendor: "Whole Foods", amount: 345 },
    { month: 2, category: "Utilities", vendor: "Electric Company", amount: 78.3 },
    { month: 2, category: "Transportation", vendor: "Car Maintenance", amount: 250 },
    { month: 2, category: "Personal Care", vendor: "Salon", amount: 65 },
    { month: 2, category: "Clothing", vendor: "H&M", amount: 120 },
    { month: 2, category: "Dining", vendor: "Sushi Restaurant", amount: 95 },
    // Apr
    { month: 3, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 3, category: "Groceries", vendor: "Costco", amount: 380 },
    { month: 3, category: "Utilities", vendor: "Electric Company", amount: 72 },
    { month: 3, category: "Transportation", vendor: "Gas Station", amount: 58 },
    { month: 3, category: "Education", vendor: "Online Course", amount: 49.99 },
    { month: 3, category: "Leisure", vendor: "Books", amount: 35 },
    // May
    { month: 4, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 4, category: "Groceries", vendor: "Trader Joe's", amount: 310 },
    { month: 4, category: "Utilities", vendor: "Electric Company", amount: 69.5 },
    { month: 4, category: "Transportation", vendor: "Gas Station", amount: 62 },
    { month: 4, category: "Travel", vendor: "Hotel", amount: 350 },
    { month: 4, category: "Dining", vendor: "Airport Restaurant", amount: 55 },
    // Jun
    { month: 5, category: "Housing", vendor: "Rent", amount: 1500 },
    { month: 5, category: "Groceries", vendor: "Whole Foods", amount: 295 },
    { month: 5, category: "Utilities", vendor: "Electric Company", amount: 95 },
    { month: 5, category: "Personal Spendings", vendor: "Amazon", amount: 145 },
    { month: 5, category: "Leisure", vendor: "Concert Tickets", amount: 120 },
    { month: 5, category: "Offerings", vendor: "Charity", amount: 50 },
  ];

  for (const item of monthlyData) {
    const day = Math.floor(Math.random() * 28) + 1;
    expenses.push({
      date: new Date(year, item.month, day),
      category: item.category,
      vendor: item.vendor,
      amount: item.amount,
      notes: null,
      userId,
    });
  }

  return expenses;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
