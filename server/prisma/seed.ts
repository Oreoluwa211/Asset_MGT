import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting University of Ibadan Prototype Seeding...');

  // 1. Safely wipe transactional data (history, assignments, maintenance, assets)
  // We keep Departments, Categories, and Staff/Users intact.
  console.log('🧹 Clearing old prototype transactional data...');
  await prisma.maintenance.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.deleteMany();

  // 2. Define 20 Realistic UI Departments & Faculties
  const departmentsList = [
    { name: 'Computer Science', faculty: 'Science' },
    { name: 'Mathematics', faculty: 'Science' },
    { name: 'Physics', faculty: 'Science' },
    { name: 'Chemistry', faculty: 'Science' },
    { name: 'Microbiology', faculty: 'Science' },
    { name: 'Electrical Engineering', faculty: 'Technology' },
    { name: 'Mechanical Engineering', faculty: 'Technology' },
    { name: 'Civil Engineering', faculty: 'Technology' },
    { name: 'Medicine & Surgery', faculty: 'Clinical Sciences' },
    { name: 'Nursing', faculty: 'Clinical Sciences' },
    { name: 'Pharmacy', faculty: 'Pharmacy' },
    { name: 'Law', faculty: 'Law' },
    { name: 'Economics', faculty: 'Social Sciences' },
    { name: 'Political Science', faculty: 'Social Sciences' },
    { name: 'Sociology', faculty: 'Social Sciences' },
    { name: 'History', faculty: 'Arts' },
    { name: 'English', faculty: 'Arts' },
    { name: 'Theatre Arts', faculty: 'Arts' },
    { name: 'Registry', faculty: 'Administration' },
    { name: 'Bursary', faculty: 'Administration' }
  ];

  console.log('🏢 Upserting 20 Departments...');
  const deptMap: Record<string, string> = {};
  for (const dept of departmentsList) {
    const existingDepartment = await prisma.department.findFirst({
      where: { name: dept.name }
    });
    const record = existingDepartment ?? await prisma.department.create({ data: dept });
    deptMap[dept.name] = record.id;
  }

  // 3. Define Asset Categories
  const categoriesList = ['Computer', 'Furniture', 'Peripherals', 'Communication', 'Laboratory', 'Vehicle', 'Office Equipment'];
  console.log('📁 Upserting Categories...');
  const catMap: Record<string, string> = {};
  for (const cat of categoriesList) {
    const record = await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat }
    });
    catMap[cat] = record.id;
  }

  // 4. Generate 40 Realistic Assets
  console.log('💻 Generating 40 Realistic Assets...');
  const assetsToCreate = [
    // ICT & Computers
    { id: 'UIB-ICT-001', name: 'Dell Optiplex 7090 Desktop', cat: 'Computer', dept: 'Computer Science', loc: 'Lab A', status: 'Available' },
    { id: 'UIB-ICT-002', name: 'MacBook Pro M2 16"', cat: 'Computer', dept: 'Computer Science', loc: 'HOD Office', status: 'In Use' },
    { id: 'UIB-ICT-003', name: 'HP ProLiant DL380 Server', cat: 'Computer', dept: 'Computer Science', loc: 'Server Room', status: 'In Use' },
    { id: 'UIB-ICT-004', name: 'Lenovo ThinkPad X1', cat: 'Computer', dept: 'Registry', loc: 'Admin Block', status: 'In Use' },
    { id: 'UIB-ICT-005', name: 'Dell Latitude 5420', cat: 'Computer', dept: 'Economics', loc: 'Staff Room 2', status: 'Maintenance' },
    { id: 'UIB-ICT-006', name: 'iMac 24"', cat: 'Computer', dept: 'Theatre Arts', loc: 'Editing Studio', status: 'Available' },
    { id: 'UIB-ICT-007', name: 'HP EliteBook 840', cat: 'Computer', dept: 'Law', loc: 'Law Library', status: 'In Use' },
    { id: 'UIB-ICT-008', name: 'APC Smart-UPS 3000VA', cat: 'Peripherals', dept: 'Computer Science', loc: 'Server Room', status: 'In Use' },
    
    // Laboratory Equipment
    { id: 'UIB-LAB-001', name: 'Olympus CX23 Microscope', cat: 'Laboratory', dept: 'Microbiology', loc: 'Undergrad Lab', status: 'Available' },
    { id: 'UIB-LAB-002', name: 'Thermo Fisher Centrifuge', cat: 'Laboratory', dept: 'Chemistry', loc: 'Research Lab', status: 'In Use' },
    { id: 'UIB-LAB-003', name: 'Agilent Spectrophotometer', cat: 'Laboratory', dept: 'Chemistry', loc: 'Analytical Lab', status: 'Maintenance' },
    { id: 'UIB-LAB-004', name: 'Autoclave Sterilizer', cat: 'Laboratory', dept: 'Medicine & Surgery', loc: 'Clinical Lab', status: 'In Use' },
    { id: 'UIB-LAB-005', name: 'Oscilloscope 100MHz', cat: 'Laboratory', dept: 'Electrical Engineering', loc: 'Circuits Lab', status: 'Available' },
    { id: 'UIB-LAB-006', name: 'Universal Testing Machine', cat: 'Laboratory', dept: 'Mechanical Engineering', loc: 'Materials Lab', status: 'In Use' },
    { id: 'UIB-LAB-007', name: 'Concrete Mixer', cat: 'Laboratory', dept: 'Civil Engineering', loc: 'Heavy Structures Lab', status: 'Available' },
    { id: 'UIB-LAB-008', name: 'PCR Thermocycler', cat: 'Laboratory', dept: 'Microbiology', loc: 'Genetics Lab', status: 'In Use' },
    
    // Furniture
    { id: 'UIB-FUR-001', name: 'Mahogany Executive Desk', cat: 'Furniture', dept: 'Registry', loc: 'VC Office', status: 'In Use' },
    { id: 'UIB-FUR-002', name: 'Ergonomic Mesh Chair', cat: 'Furniture', dept: 'Computer Science', loc: 'Staff Room', status: 'Available' },
    { id: 'UIB-FUR-003', name: 'Conference Table (12-Seater)', cat: 'Furniture', dept: 'Law', loc: 'Boardroom', status: 'In Use' },
    { id: 'UIB-FUR-004', name: 'Steel Filing Cabinet', cat: 'Furniture', dept: 'Bursary', loc: 'Records Room', status: 'Available' },
    { id: 'UIB-FUR-005', name: 'Whiteboard (Magnetic) 120x90', cat: 'Furniture', dept: 'Mathematics', loc: 'Room 101', status: 'In Use' },
    { id: 'UIB-FUR-006', name: 'Lectern/Podium', cat: 'Furniture', dept: 'English', loc: 'Lecture Theater 1', status: 'In Use' },
    { id: 'UIB-FUR-007', name: 'L-Shaped Office Workstation', cat: 'Furniture', dept: 'Pharmacy', loc: 'Admin Office', status: 'Available' },
    { id: 'UIB-FUR-008', name: 'Library Shelving Unit', cat: 'Furniture', dept: 'History', loc: 'Department Library', status: 'In Use' },

    // Vehicles
    { id: 'UIB-VEH-001', name: 'Toyota Hilux 4x4', cat: 'Vehicle', dept: 'Registry', loc: 'Motor Pool', status: 'In Use' },
    { id: 'UIB-VEH-002', name: 'Toyota Coaster Bus (30 Seater)', cat: 'Vehicle', dept: 'Medicine & Surgery', loc: 'UCH Park', status: 'Maintenance' },
    { id: 'UIB-VEH-003', name: 'Ford Transit Van', cat: 'Vehicle', dept: 'Bursary', loc: 'Admin Carpark', status: 'Available' },
    { id: 'UIB-VEH-004', name: 'Honda Civic (Official Car)', cat: 'Vehicle', dept: 'Law', loc: 'Dean Office', status: 'In Use' },

    // Office Equipment & Communication
    { id: 'UIB-OFF-001', name: 'Canon imageRUNNER Copier', cat: 'Office Equipment', dept: 'Registry', loc: 'Printing Room', status: 'In Use' },
    { id: 'UIB-OFF-002', name: 'Epson L3110 Printer', cat: 'Office Equipment', dept: 'Political Science', loc: 'General Office', status: 'Available' },
    { id: 'UIB-OFF-003', name: 'Panasonic PBX Intercom', cat: 'Communication', dept: 'Registry', loc: 'Reception', status: 'In Use' },
    { id: 'UIB-OFF-004', name: 'Sony 4K Projector', cat: 'Peripherals', dept: 'Sociology', loc: 'Main Hall', status: 'Available' },
    { id: 'UIB-OFF-005', name: 'Shure Wireless Microphone System', cat: 'Communication', dept: 'Theatre Arts', loc: 'Auditorium', status: 'In Use' },
    { id: 'UIB-OFF-006', name: 'Cisco 2960 Switch', cat: 'Communication', dept: 'Computer Science', loc: 'Network Closet', status: 'In Use' },
    { id: 'UIB-OFF-007', name: 'Paper Shredder (Heavy Duty)', cat: 'Office Equipment', dept: 'Bursary', loc: 'Finance Office', status: 'Maintenance' },
    { id: 'UIB-OFF-008', name: 'Digital Fingerprint Scanner', cat: 'Peripherals', dept: 'Registry', loc: 'Gatehouse', status: 'In Use' },
    
    // Mixed Remaining
    { id: 'UIB-MIX-001', name: 'Smart Interactive Display 65"', cat: 'Peripherals', dept: 'Medicine & Surgery', loc: 'Seminar Room', status: 'Available' },
    { id: 'UIB-MIX-002', name: 'Ubiquiti UniFi AP', cat: 'Communication', dept: 'Physics', loc: 'Lab Corridor', status: 'In Use' },
    { id: 'UIB-MIX-003', name: '3D Printer (Creality)', cat: 'Laboratory', dept: 'Mechanical Engineering', loc: 'Design Studio', status: 'In Use' },
    { id: 'UIB-MIX-004', name: 'Industrial Air Conditioner 2HP', cat: 'Office Equipment', dept: 'Computer Science', loc: 'Server Room', status: 'Maintenance' },
  ];

  for (const asset of assetsToCreate) {
    await prisma.asset.create({
      data: {
        asset_id: asset.id,
        name: asset.name,
        category_id: catMap[asset.cat],
        department_id: deptMap[asset.dept],
        location: asset.loc,
        status: asset.status,
        condition: 'Good'
      }
    });
  }

  console.log('✅ Prototype database seeded successfully with 20 Departments and 40 Assets!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });