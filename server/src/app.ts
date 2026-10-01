import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // <--- THIS MUST BE ABOVE initializeAdmin!
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'ui-asset-mgt-super-secret-key';

// --- INITIALIZE DEFAULT ADMIN ---
async function initializeAdmin() {
  const adminExists = await prisma.user.findFirst({ where: { role: 'Admin' } });
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { email: 'admin@ui.edu.ng', password_hash: hash, role: 'Admin' }
    });
    console.log('✅ Default Admin Created -> Email: admin@ui.edu.ng | Pass: admin123');
  }
}
initializeAdmin();

// --- AUTHENTICATION (LOGIN) ROUTE ---
app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    // Look up the staff name if they are a staff member
    const staff = await prisma.staff.findUnique({ where: { email } });
    const name = staff ? staff.name : (user.role === 'Admin' ? 'System Admin' : 'Staff User');

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});



app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'UI Asset Management API is running.' });
});

// --- ASSET ROUTES ---
app.get('/api/assets', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    let whereClause: any = {};

    if (email) {
      const staff = await prisma.staff.findUnique({ where: { email: String(email) } });
      if (staff) {
        whereClause = { assigned_to: staff.id };
      }
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: { category: true, department: true }
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// --- CATEGORY ROUTES ---
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// --- CREATE ASSET ROUTE ---
app.post('/api/assets', async (req: Request, res: Response) => {
  try {
    const newAsset = await prisma.asset.create({
      data: req.body,
      include: { category: true, department: true }
    });
    res.status(201).json(newAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset. Make sure Asset ID is unique.' });
  }
});

// --- STAFF ROUTES ---
app.get('/api/staff', async (req: Request, res: Response) => {
  try {
    const staff = await prisma.staff.findMany({
      include: { department: true }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// --- DEPARTMENT ROUTES ---
app.get('/api/departments', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// --- STAFF POST ROUTE (With Automatic User Creation) ---
app.post('/api/staff', async (req: Request, res: Response) => {
  try {
    const { staff_id, name, email, department_id, position } = req.body;
    
    // 1. Create the physical Staff record
    const newStaff = await prisma.staff.create({
      data: { staff_id, name, email, department_id, position }
    });

    // 2. Automatically generate a User Login account (Default password: password123)
    const hash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: { email, password_hash: hash, role: 'Staff' }
    });

    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Failed to create staff:', error);
    res.status(500).json({ error: 'Failed to create staff record (Email may already exist)' });
  }
});

// --- DEPARTMENT POST ROUTE ---
app.post('/api/departments', async (req: Request, res: Response) => {
  try {
    const newDept = await prisma.department.create({
      data: req.body
    });
    res.status(201).json(newDept);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// --- MAINTENANCE ROUTES ---
app.get('/api/maintenance', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    let whereClause: any = {};

    if (email) {
      const staff = await prisma.staff.findUnique({ where: { email: String(email) } });
      if (staff) {
        whereClause = { asset: { assigned_to: staff.id } };
      }
    }

    const records = await prisma.maintenance.findMany({
      where: whereClause,
      include: { asset: true },
      orderBy: { reported_at: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
});

app.post('/api/maintenance', async (req: Request, res: Response) => {
  try {
    const { asset_id, problem, technician, cost } = req.body;
    
    // 1. Create the maintenance log
    const record = await prisma.maintenance.create({
      data: { 
        asset_id, 
        problem, 
        technician, 
        cost: cost ? parseFloat(cost) : null, 
        status: 'In Progress' 
      }
    });

    // 2. Automatically update the Asset's status to "Maintenance"
    await prisma.asset.update({
      where: { id: asset_id },
      data: { status: 'Maintenance' }
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log maintenance' });
  }
});


  // --- STAFF EDIT & DELETE ---
// --- STAFF EDIT ---
app.put('/api/staff/:id', async (req: Request, res: Response) => {
  try {
    const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedStaff = await prisma.staff.update({ 
      where: { id: staffId }, 
      data: req.body 
    });
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

// --- SMART STAFF DELETE (Releases Assets) ---
  app.delete('/api/staff/:id', async (req: Request, res: Response) => {
    try {
      const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      
      if (staff) {
        // 1. Free up any assets assigned to this staff member
        await prisma.asset.updateMany({
          where: { assigned_to: staffId },
          data: { assigned_to: null, status: 'Available' }
        });

        // 2. Close any active assignment history records
        await prisma.assignment.updateMany({
          where: { staff_id: staffId, ended_at: null },
          data: { ended_at: new Date() }
        });

        // 3. Delete the physical Staff record
        await prisma.staff.delete({ where: { id: staffId } });

        // 4. Delete their User login account so they can no longer log in
        await prisma.user.deleteMany({ where: { email: staff.email, role: 'Staff' } });
      }
      
      res.json({ message: 'Staff deleted, account removed, and assets successfully released.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete staff member.' });
    }
  });

  // --- DEPARTMENT EDIT & DELETE ---
  app.put('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const updatedDept = await prisma.department.update({ where: { id: String(req.params.id) }, data: req.body });
      res.json(updatedDept);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  app.delete('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      await prisma.department.delete({ where: { id: String(req.params.id) } });
      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: 'Cannot delete department. It contains assigned staff or assets.' });
    }
  });

// --- DASHBOARD & REPORTS ROUTES ---
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    let assetWhere: any = {};

    if (email) {
      const staff = await prisma.staff.findUnique({ where: { email: String(email) } });
      if (staff) {
        assetWhere = { assigned_to: staff.id };
      }
    }

    const total = await prisma.asset.count({ where: assetWhere });
    const inUse = await prisma.asset.count({ where: { ...assetWhere, status: 'In Use' } });
    const available = await prisma.asset.count({ where: { ...assetWhere, status: 'Available' } });
    const maintenance = await prisma.asset.count({ where: { ...assetWhere, status: 'Maintenance' } });

    const recentAssets = await prisma.asset.findMany({
      where: assetWhere,
      take: 5,
      orderBy: { id: 'desc' },
      include: { category: true, department: true }
    });

    const categories = await prisma.category.findMany();
    const chartData = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.asset.count({
          where: { ...assetWhere, category_id: cat.id }
        });
        return { name: cat.name, count };
      })
    );

    res.json({
      stats: { total, inUse, available, maintenance },
      recentAssets,
      chartData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


// --- ASSIGNMENT ROUTE ---

// Update an existing asset's details
app.put('/api/assets/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, category_id, department_id, location, condition, status } = req.body;

    const updatedAsset = await prisma.asset.update({
      where: { id: id },
      data: {
        name,
        // Convert empty strings from the frontend dropdowns to null for the database
        category_id: category_id === '' ? null : category_id,
        department_id: department_id === '' ? null : department_id,
        location,
        condition,
        status
      }
    });

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

app.post('/api/assets/:id/assign', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // Explicitly tell TypeScript this is a single string
    const { staff_id, department_id, location } = req.body;

    // 1. Close any currently active assignment for this asset by setting ended_at to right now
    await prisma.assignment.updateMany({
      where: { asset_id: id, ended_at: null },
      data: { ended_at: new Date() }
    });

    // 2. Create the new assignment history record
    const newAssignment = await prisma.assignment.create({
      data: {
        asset_id: id,
        staff_id: staff_id || null, // Optional if just assigned to a department
        department_id,
        location
      }
    });

    // 3. Update the actual Asset's current state to reflect its new home
    await prisma.asset.update({
      where: { id },
      data: {
        assigned_to: staff_id || null,
        department_id,
        location,
        status: 'In Use' // Automatically mark it as In Use
      }
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ error: 'Failed to assign asset' });
  }
});

// import path from 'path';


// --- DEPLOYMENT: SERVE FRONTEND ---
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Notice we removed the quotes around * and turned it into a RegEx /.*/
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
