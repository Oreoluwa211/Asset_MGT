import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with University of Ibadan mock data...');

  // 1. Create Departments
  const deptCS = await prisma.department.create({
    data: { name: 'Computer Science', faculty: 'Faculty of Science' }
  });
  const deptRegistry = await prisma.department.create({
    data: { name: 'Registry', faculty: 'Administration' }
  });

  // 2. Create Categories
  const catComputer = await prisma.category.create({ data: { name: 'Computer' } });
  const catPrinter = await prisma.category.create({ data: { name: 'Printer' } });
  const catFurniture = await prisma.category.create({ data: { name: 'Furniture' } });
  const catCommunication  = await prisma.category.create({ data: { name: 'Communication' } });
  const catPeripherals = await prisma.category.create({ data: { name: 'Peripherals' } });

  // 3. Create Staff
  const staff1 = await prisma.staff.create({
    data: {
      staff_id: 'UI-STF-001',
      name: 'Dr. O. Adeyemi',
      email: 'o.adeyemi@ui.edu.ng',
      department_id: deptCS.id,
      position: 'Senior Lecturer'
    }
  });

  // 4. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      asset_id: 'UIB-ICT-0001',
      name: 'Dell Latitude 5420',
      category_id: catComputer.id,
      serial_number: 'DL-5420-XYZ',
      department_id: deptCS.id,
      assigned_to: staff1.id,
      location: 'Room 204, CS Dept',
      condition: 'Good',
      status: 'In Use'
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });