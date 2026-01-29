import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import bcrypt from 'bcryptjs'

// Configurar Neon para usar WebSocket en Node.js
neonConfig.webSocketConstructor = ws

// Crear cliente Prisma con adaptador Neon para seeds
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function main() {
  console.log('🌱 Iniciando seed de la base de datos unificada...')

  // Limpiar todas las tablas en orden correcto (respetando relaciones)
  console.log('🧹 Limpiando datos existentes...')
  
  // Limpiar en orden inverso de dependencias
  await prisma.actionHistory.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.loyaltyPoint.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.inventoryTransfer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.userPreferences.deleteMany()
  await prisma.ticketConfig.deleteMany()
  await prisma.storeConfig.deleteMany()
  await prisma.loyaltyConfig.deleteMany()
  
  // Workify
  await prisma.userRoleAssignment.deleteMany()
  await prisma.userPermission.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.license.deleteMany()
  await prisma.payroll.deleteMany()
  await prisma.payrollRule.deleteMany()
  await prisma.document.deleteMany()
  await prisma.specialDayAssignment.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.timeEntry.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.holiday.deleteMany()
  await prisma.workShift.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
  await prisma.role.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.integrationLog.deleteMany()
  await prisma.report.deleteMany()
  await prisma.translation.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Datos limpiados correctamente')

  // ========================================
  // SEEDS WORKIFY
  // ========================================

  console.log('🏢 Creando datos de Workify...')

  // 1. Crear empresa
  const company = await prisma.company.create({
    data: {
      name: 'Acme Inc.',
    },
  })
  console.log(`✅ Empresa creada: ${company.name} (ID: ${company.id})`)

  // 2. Crear departamentos
  const hrDepartment = await prisma.department.create({
    data: {
      name: 'Recursos Humanos',
      description: 'Departamento de recursos humanos',
      companyId: company.id,
    },
  })

  const itDepartment = await prisma.department.create({
    data: {
      name: 'Tecnología',
      description: 'Departamento de tecnología',
      companyId: company.id,
    },
  })
  console.log(`✅ Departamentos creados: ${hrDepartment.name}, ${itDepartment.name}`)

  // 3. Crear posiciones
  const managerPosition = await prisma.position.create({
    data: {
      name: 'Gerente',
      description: 'Posición gerencial',
      departmentId: hrDepartment.id,
      salaryType: 'MONTH',
      baseSalary: 5000.00,
      overtimeType: 'MULTIPLIER',
      overtimeMultiplier: 1.5,
    },
  })

  const developerPosition = await prisma.position.create({
    data: {
      name: 'Desarrollador',
      description: 'Desarrollador de software',
      departmentId: itDepartment.id,
      salaryType: 'MONTH',
      baseSalary: 3000.00,
      overtimeType: 'MULTIPLIER',
      overtimeMultiplier: 1.5,
    },
  })
  console.log(`✅ Posiciones creadas: ${managerPosition.name}, ${developerPosition.name}`)

  // 4. Crear roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrador',
      description: 'Rol de administrador',
      companyId: company.id,
    },
  })

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Empleado',
      description: 'Rol de empleado',
      companyId: company.id,
    },
  })
  console.log(`✅ Roles creados: ${adminRole.name}, ${employeeRole.name}`)

  // 5. Crear turnos de trabajo
  const morningShift = await prisma.workShift.create({
    data: {
      name: 'Turno Mañana',
      description: 'Horario estándar de oficina',
      startTime: '08:00',
      endTime: '16:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      tolerance: 15,
      isActive: true,
      isNightShift: false,
      companyId: company.id,
    },
  })

  const afternoonShift = await prisma.workShift.create({
    data: {
      name: 'Turno Tarde',
      description: 'Horario de tarde',
      startTime: '14:00',
      endTime: '22:00',
      breakStart: '18:00',
      breakEnd: '19:00',
      tolerance: 15,
      isActive: true,
      isNightShift: false,
      companyId: company.id,
    },
  })
  console.log(`✅ Turnos creados: ${morningShift.name}, ${afternoonShift.name}`)

  // 6. Crear días festivos
  const newYearHoliday = await prisma.holiday.create({
    data: {
      name: 'Año Nuevo',
      date: new Date('2025-01-01'),
      isRecurring: true,
      companyId: company.id,
    },
  })
  console.log(`✅ Día festivo creado: ${newYearHoliday.name}`)

  // 7. Crear usuarios
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'SUPERADMIN',
      isActive: true,
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@acme.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      phone: '+1234567891',
      role: 'USER',
      isActive: true,
    },
  })
  console.log(`✅ Usuarios creados: ${adminUser.email}, ${regularUser.email}`)

  // 8. Asignar roles a usuarios
  await prisma.userRoleAssignment.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
      companyId: company.id,
    },
  })

  await prisma.userRoleAssignment.create({
    data: {
      userId: regularUser.id,
      roleId: employeeRole.id,
      companyId: company.id,
    },
  })
  console.log('✅ Roles asignados a usuarios')

  // 9. Crear empleados
  const employee1 = await prisma.employee.create({
    data: {
      companyId: company.id,
      departmentId: hrDepartment.id,
      positionId: managerPosition.id,
      userId: adminUser.id,
      firstName: 'John',
      lastName: 'Doe',
      idNumber: '12345678',
      dateJoined: new Date('2024-01-15'),
      status: 'ACTIVE',
      gender: 'MALE',
    },
  })

  const employee2 = await prisma.employee.create({
    data: {
      companyId: company.id,
      departmentId: itDepartment.id,
      positionId: developerPosition.id,
      userId: regularUser.id,
      firstName: 'Jane',
      lastName: 'Smith',
      idNumber: '87654321',
      dateJoined: new Date('2024-02-01'),
      status: 'ACTIVE',
      gender: 'FEMALE',
    },
  })
  console.log(`✅ Empleados creados: ${employee1.firstName} ${employee1.lastName}, ${employee2.firstName} ${employee2.lastName}`)

  // 10. Crear horarios
  await prisma.schedule.create({
    data: {
      employeeId: employee1.id,
      workShiftId: morningShift.id,
      dayOfWeek: 1, // Lunes
      startDate: new Date('2025-01-01'),
    },
  })
  console.log('✅ Horarios creados')

  // ========================================
  // SEEDS SHOPFLOW
  // ========================================

  console.log('🛒 Creando datos de Shopflow...')

  // 1. Crear categorías
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electrónica',
      description: 'Productos electrónicos',
    },
  })

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Ropa',
      description: 'Ropa y accesorios',
    },
  })
  console.log(`✅ Categorías creadas: ${electronicsCategory.name}, ${clothingCategory.name}`)

  // 2. Crear proveedores
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Tech Supplies Inc.',
      email: 'contact@techsupplies.com',
      phone: '+1234567890',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      taxId: 'TAX123456',
      active: true,
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Fashion Wholesale',
      email: 'contact@fashionwholesale.com',
      phone: '+1234567891',
      address: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      taxId: 'TAX789012',
      active: true,
    },
  })
  console.log(`✅ Proveedores creados: ${supplier1.name}, ${supplier2.name}`)

  // 3. Crear productos
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop Dell XPS 15',
      description: 'Laptop de alta gama',
      sku: 'LAP-DELL-XPS15',
      barcode: '1234567890123',
      price: 1299.99,
      cost: 900.00,
      stock: 10,
      minStock: 5,
      maxStock: 50,
      categoryId: electronicsCategory.id,
      supplierId: supplier1.id,
      active: true,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Camiseta Básica',
      description: 'Camiseta de algodón 100%',
      sku: 'TSH-BASIC-001',
      barcode: '9876543210987',
      price: 19.99,
      cost: 10.00,
      stock: 50,
      minStock: 20,
      maxStock: 200,
      categoryId: clothingCategory.id,
      supplierId: supplier2.id,
      active: true,
    },
  })
  console.log(`✅ Productos creados: ${product1.name}, ${product2.name}`)

  // 4. Crear clientes
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+1234567892',
      address: '789 Customer St',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      phone: '+1234567893',
      address: '321 Client Ave',
    },
  })
  console.log(`✅ Clientes creados: ${customer1.name}, ${customer2.name}`)

  // 5. Crear configuración de tienda
  await prisma.storeConfig.create({
    data: {
      name: 'Tienda Principal',
      address: '123 Main Street',
      phone: '+1234567894',
      email: 'store@example.com',
      currency: 'USD',
      taxRate: 0.08,
      lowStockAlert: 10,
      invoicePrefix: 'INV-',
      invoiceNumber: 1,
      allowSalesWithoutStock: false,
    },
  })
  console.log('✅ Configuración de tienda creada')

  // 6. Crear configuración de tickets
  await prisma.ticketConfig.create({
    data: {
      ticketType: 'RECEIPT',
      header: 'Gracias por su compra',
      footer: 'Vuelva pronto',
      thermalWidth: 80,
      fontSize: 12,
      copies: 1,
      autoPrint: true,
    },
  })
  console.log('✅ Configuración de tickets creada')

  // 7. Crear configuración de fidelidad
  await prisma.loyaltyConfig.create({
    data: {
      pointsPerDollar: 1.00,
      redemptionRate: 0.01,
      pointsExpireMonths: 12,
      minPurchaseForPoints: 10.00,
      maxPointsPerPurchase: 1000,
      isActive: true,
    },
  })
  console.log('✅ Configuración de fidelidad creada')

  // 8. Crear venta de ejemplo
  const sale = await prisma.sale.create({
    data: {
      customerId: customer1.id,
      userId: adminUser.id,
      invoiceNumber: 'INV-0001',
      total: 1319.98,
      subtotal: 1219.98,
      tax: 100.00,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 1299.99,
            subtotal: 1299.99,
          },
        ],
      },
    },
  })
  console.log(`✅ Venta creada: ${sale.invoiceNumber}`)

  // 9. Crear puntos de fidelidad
  await prisma.loyaltyPoint.create({
    data: {
      customerId: customer1.id,
      saleId: sale.id,
      points: 1319,
      type: 'EARNED',
      description: 'Puntos ganados por compra',
    },
  })
  console.log('✅ Puntos de fidelidad creados')

  // 10. Crear preferencias de usuario
  await prisma.userPreferences.create({
    data: {
      userId: adminUser.id,
      language: 'es',
    },
  })
  console.log('✅ Preferencias de usuario creadas')

  // 11. Crear notificación de ejemplo
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      type: 'INFO',
      priority: 'MEDIUM',
      title: 'Bienvenido',
      message: 'Bienvenido al sistema unificado',
      status: 'UNREAD',
    },
  })
  console.log('✅ Notificación creada')

  console.log('✅ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
