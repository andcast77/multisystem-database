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
  await prisma.companyMember.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Datos limpiados correctamente')

  // ========================================
  // SEEDS WORKIFY
  // ========================================

  console.log('🏢 Creando datos de Workify...')

  // 1. Crear empresa (Shopflow + Workify activos)
  const company = await prisma.company.create({
    data: {
      name: 'Acme Inc.',
      workifyEnabled: true,
      shopflowEnabled: true,
    },
  })
  console.log(`✅ Empresa creada: ${company.name} (ID: ${company.id}) - Shopflow y Workify`)

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

  // 7. Crear usuarios: superusuario @multiflow + usuarios por empresa
  const hashedPassword = await bcrypt.hash('password123', 10)

  const superuser = await prisma.user.create({
    data: {
      email: 'admin@multiflow.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Multiflow',
      phone: '+1234500000',
      role: 'SUPERADMIN',
      isActive: true,
    },
  })

  const acmeGerente = await prisma.user.create({
    data: {
      email: 'gerente@acme.com',
      password: hashedPassword,
      firstName: 'Roberto',
      lastName: 'Acme',
      phone: '+1234567890',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const acmeVentas = await prisma.user.create({
    data: {
      email: 'ventas@acme.com',
      password: hashedPassword,
      firstName: 'Laura',
      lastName: 'Acme',
      phone: '+1234567891',
      role: 'USER',
      isActive: true,
    },
  })
  console.log(`✅ Usuarios creados: ${superuser.email}, ${acmeGerente.email}, ${acmeVentas.email}`)

  // Asignar owner Acme = superusuario; miembros = superuser + usuarios @acme.com
  await prisma.company.update({
    where: { id: company.id },
    data: { ownerUserId: superuser.id },
  })
  await prisma.companyMember.create({
    data: { userId: superuser.id, companyId: company.id, membershipRole: 'OWNER' },
  })
  await prisma.companyMember.create({
    data: { userId: acmeGerente.id, companyId: company.id, membershipRole: 'ADMIN' },
  })
  await prisma.companyMember.create({
    data: { userId: acmeVentas.id, companyId: company.id, membershipRole: 'USER' },
  })
  console.log('✅ Owner y CompanyMember Acme creados')

  // 8. Asignar roles a usuarios Acme
  await prisma.userRoleAssignment.create({
    data: { userId: acmeGerente.id, roleId: adminRole.id, companyId: company.id },
  })
  await prisma.userRoleAssignment.create({
    data: { userId: acmeVentas.id, roleId: employeeRole.id, companyId: company.id },
  })
  console.log('✅ Roles asignados a usuarios Acme')

  // 9. Crear empleados Acme (usuarios @acme.com)
  const employee1 = await prisma.employee.create({
    data: {
      companyId: company.id,
      departmentId: hrDepartment.id,
      positionId: managerPosition.id,
      userId: acmeGerente.id,
      firstName: 'Roberto',
      lastName: 'Acme',
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
      userId: acmeVentas.id,
      firstName: 'Laura',
      lastName: 'Acme',
      idNumber: '87654321',
      dateJoined: new Date('2024-02-01'),
      status: 'ACTIVE',
      gender: 'FEMALE',
    },
  })
  console.log(`✅ Empleados Acme creados: ${employee1.firstName} ${employee1.lastName}, ${employee2.firstName} ${employee2.lastName}`)

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

  // 1. Crear categorías Acme (distintas para debug)
  const electronicsCategory = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'Electrónica Acme',
      description: 'Productos electrónicos Acme Inc.',
    },
  })

  const clothingCategory = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'Ropa Acme',
      description: 'Ropa y accesorios Acme',
    },
  })

  const officeCategory = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'Oficina Acme',
      description: 'Material de oficina Acme',
    },
  })
  console.log(`✅ Categorías Acme: ${electronicsCategory.name}, ${clothingCategory.name}, ${officeCategory.name}`)

  // 2. Crear proveedores Acme
  const supplier1 = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'Tech Supplies Acme',
      email: 'contact@techsupplies-acme.com',
      phone: '+1234567890',
      address: '123 Tech Street, SF',
      city: 'San Francisco',
      state: 'CA',
      taxId: 'ACME-TAX-001',
      active: true,
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'Fashion Wholesale Acme',
      email: 'contact@fashion-acme.com',
      phone: '+1234567891',
      address: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      taxId: 'ACME-TAX-002',
      active: true,
    },
  })

  const supplier3 = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'Oficina Acme S.L.',
      email: 'pedidos@oficina-acme.com',
      phone: '+1234567895',
      address: '100 Office Park',
      city: 'Los Angeles',
      state: 'CA',
      taxId: 'ACME-TAX-003',
      active: true,
    },
  })
  console.log(`✅ Proveedores Acme: ${supplier1.name}, ${supplier2.name}, ${supplier3.name}`)

  // 3. Crear productos Acme (inventario distinto)
  const product1 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: 'Laptop Dell XPS 15 [Acme]',
      description: 'Laptop de alta gama - Acme',
      sku: 'ACME-LAP-001',
      barcode: '1234567890123',
      price: 1299.99,
      cost: 900.00,
      stock: 8,
      minStock: 5,
      maxStock: 50,
      categoryId: electronicsCategory.id,
      supplierId: supplier1.id,
      active: true,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: 'Camiseta Básica [Acme]',
      description: 'Camiseta algodón 100% - Acme',
      sku: 'ACME-TSH-001',
      barcode: '9876543210987',
      price: 19.99,
      cost: 10.00,
      stock: 45,
      minStock: 20,
      maxStock: 200,
      categoryId: clothingCategory.id,
      supplierId: supplier2.id,
      active: true,
    },
  })

  const product3 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: 'Monitor 24" [Acme]',
      description: 'Monitor Full HD - Acme',
      sku: 'ACME-MON-001',
      barcode: '1111222233334',
      price: 199.99,
      cost: 120.00,
      stock: 15,
      minStock: 5,
      maxStock: 40,
      categoryId: electronicsCategory.id,
      supplierId: supplier1.id,
      active: true,
    },
  })

  const product4 = await prisma.product.create({
    data: {
      companyId: company.id,
      name: 'Cuaderno A4 [Acme]',
      description: 'Cuaderno 100 hojas - Acme',
      sku: 'ACME-CUA-001',
      barcode: '2222333344445',
      price: 4.99,
      cost: 2.00,
      stock: 120,
      minStock: 30,
      maxStock: 300,
      categoryId: officeCategory.id,
      supplierId: supplier3.id,
      active: true,
    },
  })
  console.log(`✅ Productos Acme: ${product1.name}, ${product2.name}, ${product3.name}, ${product4.name}`)

  // 4. Crear clientes Acme
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'Juan Pérez (Acme)',
      email: 'juan.perez@cliente-acme.com',
      phone: '+1234567892',
      address: '789 Customer St, Acme',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'María García (Acme)',
      email: 'maria.garcia@cliente-acme.com',
      phone: '+1234567893',
      address: '321 Client Ave, Acme',
    },
  })

  const customer3 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'Pedro López (Acme)',
      email: 'pedro.lopez@cliente-acme.com',
      phone: '+1234567896',
      address: '555 Buyer Rd, Acme',
    },
  })
  console.log(`✅ Clientes Acme: ${customer1.name}, ${customer2.name}, ${customer3.name}`)

  // 5. Configuración de tienda Acme
  await prisma.storeConfig.create({
    data: {
      companyId: company.id,
      name: 'Tienda Principal Acme',
      address: '123 Main Street, Acme',
      phone: '+1234567894',
      email: 'tienda@acme.com',
      currency: 'USD',
      taxRate: 0.08,
      lowStockAlert: 10,
      invoicePrefix: 'ACME-INV-',
      invoiceNumber: 4,
      allowSalesWithoutStock: false,
    },
  })
  console.log('✅ Configuración de tienda Acme creada')

  // 6. Configuración de tickets Acme
  await prisma.ticketConfig.create({
    data: {
      companyId: company.id,
      ticketType: 'RECEIPT',
      header: 'Acme Inc. - Gracias por su compra',
      footer: 'Vuelva pronto a Acme',
      thermalWidth: 80,
      fontSize: 12,
      copies: 1,
      autoPrint: true,
    },
  })
  console.log('✅ Configuración de tickets Acme creada')

  // 7. Configuración de fidelidad Acme
  await prisma.loyaltyConfig.create({
    data: {
      companyId: company.id,
      pointsPerDollar: 1.00,
      redemptionRate: 0.01,
      pointsExpireMonths: 12,
      minPurchaseForPoints: 10.00,
      maxPointsPerPurchase: 1000,
      isActive: true,
    },
  })
  console.log('✅ Configuración de fidelidad Acme creada')

  // 8. Crear ventas Acme (varias, usuarios @acme.com)
  const sale1 = await prisma.sale.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      userId: acmeGerente.id,
      invoiceNumber: 'ACME-INV-0001',
      total: 1319.98,
      subtotal: 1219.98,
      tax: 100.00,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      items: {
        create: [
          { productId: product1.id, quantity: 1, price: 1299.99, subtotal: 1299.99 },
        ],
      },
    },
  })

  const sale2 = await prisma.sale.create({
    data: {
      companyId: company.id,
      customerId: customer2.id,
      userId: acmeVentas.id,
      invoiceNumber: 'ACME-INV-0002',
      total: 59.97,
      subtotal: 55.53,
      tax: 4.44,
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      items: {
        create: [
          { productId: product2.id, quantity: 2, price: 19.99, subtotal: 39.98 },
          { productId: product4.id, quantity: 3, price: 4.99, subtotal: 14.97 },
        ],
      },
    },
  })

  const sale3 = await prisma.sale.create({
    data: {
      companyId: company.id,
      customerId: customer3.id,
      userId: acmeGerente.id,
      invoiceNumber: 'ACME-INV-0003',
      total: 209.98,
      subtotal: 199.99,
      tax: 9.99,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      items: {
        create: [
          { productId: product3.id, quantity: 1, price: 199.99, subtotal: 199.99 },
        ],
      },
    },
  })
  console.log(`✅ Ventas Acme creadas: ${sale1.invoiceNumber}, ${sale2.invoiceNumber}, ${sale3.invoiceNumber}`)

  // 9. Puntos de fidelidad Acme
  await prisma.loyaltyPoint.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      saleId: sale1.id,
      points: 1320,
      type: 'EARNED',
      description: 'Puntos Acme - compra INV-0001',
    },
  })
  await prisma.loyaltyPoint.create({
    data: {
      companyId: company.id,
      customerId: customer2.id,
      saleId: sale2.id,
      points: 60,
      type: 'EARNED',
      description: 'Puntos Acme - compra INV-0002',
    },
  })
  console.log('✅ Puntos de fidelidad Acme creados')

  // 10. Preferencias de usuario Acme
  await prisma.userPreferences.create({
    data: { companyId: company.id, userId: acmeGerente.id, language: 'es' },
  })
  await prisma.userPreferences.create({
    data: { companyId: company.id, userId: acmeVentas.id, language: 'es' },
  })
  console.log('✅ Preferencias de usuario Acme creadas')

  // 11. Notificaciones Acme
  await prisma.notification.create({
    data: {
      companyId: company.id,
      userId: acmeGerente.id,
      type: 'INFO',
      priority: 'MEDIUM',
      title: 'Bienvenido a Acme Inc.',
      message: 'Sistema Acme - Electrónica y oficina',
      status: 'UNREAD',
    },
  })
  await prisma.notification.create({
    data: {
      companyId: company.id,
      userId: acmeVentas.id,
      type: 'INFO',
      priority: 'LOW',
      title: 'Ventas Acme',
      message: 'Panel de ventas Acme Inc.',
      status: 'UNREAD',
    },
  })
  console.log('✅ Notificaciones Acme creadas')

  // ========================================
  // SEGUNDA EMPRESA: Beta Corp.
  // ========================================

  console.log('🏢 Creando segunda empresa (Beta Corp.)...')

  const company2 = await prisma.company.create({
    data: {
      name: 'Beta Corp.',
      workifyEnabled: true,
      shopflowEnabled: true,
    },
  })
  console.log(`✅ Empresa creada: ${company2.name} (ID: ${company2.id}) - Shopflow y Workify`)

  // Usuarios Beta (@betacorp.com)
  const gerenteBeta = await prisma.user.create({
    data: {
      email: 'gerente@betacorp.com',
      password: hashedPassword,
      firstName: 'Carmen',
      lastName: 'Beta',
      phone: '+1987654320',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const ventasBeta = await prisma.user.create({
    data: {
      email: 'ventas@betacorp.com',
      password: hashedPassword,
      firstName: 'Diego',
      lastName: 'Beta',
      phone: '+1987654321',
      role: 'USER',
      isActive: true,
    },
  })
  console.log(`✅ Usuarios Beta creados: ${gerenteBeta.email}, ${ventasBeta.email}`)

  await prisma.company.update({
    where: { id: company2.id },
    data: { ownerUserId: superuser.id },
  })
  await prisma.companyMember.create({
    data: { userId: superuser.id, companyId: company2.id, membershipRole: 'OWNER' },
  })
  await prisma.companyMember.create({
    data: { userId: gerenteBeta.id, companyId: company2.id, membershipRole: 'ADMIN' },
  })
  await prisma.companyMember.create({
    data: { userId: ventasBeta.id, companyId: company2.id, membershipRole: 'USER' },
  })
  console.log('✅ Owner y CompanyMember Beta creados')

  // Workify: departamentos Beta
  const salesDepartment = await prisma.department.create({
    data: {
      name: 'Ventas',
      description: 'Departamento de ventas',
      companyId: company2.id,
    },
  })

  const operationsDepartment = await prisma.department.create({
    data: {
      name: 'Operaciones',
      description: 'Departamento de operaciones',
      companyId: company2.id,
    },
  })
  console.log(`✅ Departamentos Beta: ${salesDepartment.name}, ${operationsDepartment.name}`)

  const sellerPosition = await prisma.position.create({
    data: {
      name: 'Vendedor',
      description: 'Posición de ventas',
      departmentId: salesDepartment.id,
      salaryType: 'MONTH',
      baseSalary: 2800.00,
      overtimeType: 'MULTIPLIER',
      overtimeMultiplier: 1.5,
    },
  })

  const operatorPosition = await prisma.position.create({
    data: {
      name: 'Operador',
      description: 'Operador de almacén',
      departmentId: operationsDepartment.id,
      salaryType: 'MONTH',
      baseSalary: 2200.00,
      overtimeType: 'MULTIPLIER',
      overtimeMultiplier: 1.5,
    },
  })
  console.log(`✅ Posiciones Beta: ${sellerPosition.name}, ${operatorPosition.name}`)

  const adminRoleBeta = await prisma.role.create({
    data: {
      name: 'Admin Beta',
      description: 'Rol administrador Beta Corp.',
      companyId: company2.id,
    },
  })

  const employeeRoleBeta = await prisma.role.create({
    data: {
      name: 'Empleado Beta',
      description: 'Rol empleado Beta Corp.',
      companyId: company2.id,
    },
  })
  console.log(`✅ Roles Beta: ${adminRoleBeta.name}, ${employeeRoleBeta.name}`)

  const morningShiftBeta = await prisma.workShift.create({
    data: {
      name: 'Mañana Beta',
      description: 'Turno mañana Beta',
      startTime: '08:00',
      endTime: '16:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      tolerance: 15,
      isActive: true,
      isNightShift: false,
      companyId: company2.id,
    },
  })

  const afternoonShiftBeta = await prisma.workShift.create({
    data: {
      name: 'Tarde Beta',
      description: 'Turno tarde Beta',
      startTime: '14:00',
      endTime: '22:00',
      breakStart: '18:00',
      breakEnd: '19:00',
      tolerance: 15,
      isActive: true,
      isNightShift: false,
      companyId: company2.id,
    },
  })
  console.log(`✅ Turnos Beta: ${morningShiftBeta.name}, ${afternoonShiftBeta.name}`)

  const christmasHoliday = await prisma.holiday.create({
    data: {
      name: 'Navidad',
      date: new Date('2025-12-25'),
      isRecurring: true,
      companyId: company2.id,
    },
  })
  console.log(`✅ Día festivo Beta: ${christmasHoliday.name}`)

  await prisma.userRoleAssignment.create({
    data: { userId: gerenteBeta.id, roleId: adminRoleBeta.id, companyId: company2.id },
  })
  await prisma.userRoleAssignment.create({
    data: { userId: ventasBeta.id, roleId: employeeRoleBeta.id, companyId: company2.id },
  })
  console.log('✅ Roles asignados a usuarios Beta')

  const employee1Beta = await prisma.employee.create({
    data: {
      companyId: company2.id,
      departmentId: salesDepartment.id,
      positionId: sellerPosition.id,
      userId: gerenteBeta.id,
      firstName: 'Carmen',
      lastName: 'Beta',
      idNumber: '11112222',
      dateJoined: new Date('2024-03-01'),
      status: 'ACTIVE',
      gender: 'FEMALE',
    },
  })

  const employee2Beta = await prisma.employee.create({
    data: {
      companyId: company2.id,
      departmentId: operationsDepartment.id,
      positionId: operatorPosition.id,
      userId: ventasBeta.id,
      firstName: 'Diego',
      lastName: 'Beta',
      idNumber: '33334444',
      dateJoined: new Date('2024-04-01'),
      status: 'ACTIVE',
      gender: 'MALE',
    },
  })
  console.log(`✅ Empleados Beta creados: ${employee1Beta.firstName} ${employee1Beta.lastName}, ${employee2Beta.firstName} ${employee2Beta.lastName}`)

  await prisma.schedule.create({
    data: {
      employeeId: employee1Beta.id,
      workShiftId: morningShiftBeta.id,
      dayOfWeek: 1,
      startDate: new Date('2025-01-01'),
    },
  })
  console.log('✅ Horarios Beta creados')

  // Shopflow: categorías Beta (distintas para debug)
  const homeCategory = await prisma.category.create({
    data: {
      companyId: company2.id,
      name: 'Hogar Beta',
      description: 'Productos para el hogar - Beta Corp.',
    },
  })

  const sportsCategory = await prisma.category.create({
    data: {
      companyId: company2.id,
      name: 'Deportes Beta',
      description: 'Artículos deportivos Beta',
    },
  })

  const gardenCategory = await prisma.category.create({
    data: {
      companyId: company2.id,
      name: 'Jardín Beta',
      description: 'Jardinería y exterior Beta',
    },
  })
  console.log(`✅ Categorías Beta: ${homeCategory.name}, ${sportsCategory.name}, ${gardenCategory.name}`)

  const supplier1Beta = await prisma.supplier.create({
    data: {
      companyId: company2.id,
      name: 'Home Supplies Beta',
      email: 'contact@homesupplies-beta.com',
      phone: '+1987654321',
      address: '100 Home Ave, Beta',
      city: 'Chicago',
      state: 'IL',
      taxId: 'BETA-TAX-01',
      active: true,
    },
  })

  const supplier2Beta = await prisma.supplier.create({
    data: {
      companyId: company2.id,
      name: 'Sport Wholesale Beta',
      email: 'contact@sport-betacorp.com',
      phone: '+1987654322',
      address: '200 Sport Blvd',
      city: 'Miami',
      state: 'FL',
      taxId: 'BETA-TAX-02',
      active: true,
    },
  })

  const supplier3Beta = await prisma.supplier.create({
    data: {
      companyId: company2.id,
      name: 'Jardín Beta S.L.',
      email: 'pedidos@jardin-betacorp.com',
      phone: '+1987654326',
      address: '300 Garden Rd',
      city: 'Houston',
      state: 'TX',
      taxId: 'BETA-TAX-03',
      active: true,
    },
  })
  console.log(`✅ Proveedores Beta: ${supplier1Beta.name}, ${supplier2Beta.name}, ${supplier3Beta.name}`)

  const product1Beta = await prisma.product.create({
    data: {
      companyId: company2.id,
      name: 'Lámpara escritorio [Beta]',
      description: 'Lámpara LED regulable - Beta',
      sku: 'BETA-LAMP-001',
      barcode: '5000111222333',
      price: 49.99,
      cost: 25.00,
      stock: 28,
      minStock: 10,
      maxStock: 100,
      categoryId: homeCategory.id,
      supplierId: supplier1Beta.id,
      active: true,
    },
  })

  const product2Beta = await prisma.product.create({
    data: {
      companyId: company2.id,
      name: 'Balón fútbol [Beta]',
      description: 'Balón reglamentario Beta',
      sku: 'BETA-BALL-001',
      barcode: '5000444555666',
      price: 29.99,
      cost: 15.00,
      stock: 38,
      minStock: 15,
      maxStock: 150,
      categoryId: sportsCategory.id,
      supplierId: supplier2Beta.id,
      active: true,
    },
  })

  const product3Beta = await prisma.product.create({
    data: {
      companyId: company2.id,
      name: 'Mesa jardín [Beta]',
      description: 'Mesa exterior Beta',
      sku: 'BETA-MESA-001',
      barcode: '5000777888999',
      price: 89.99,
      cost: 45.00,
      stock: 12,
      minStock: 5,
      maxStock: 30,
      categoryId: gardenCategory.id,
      supplierId: supplier3Beta.id,
      active: true,
    },
  })

  const product4Beta = await prisma.product.create({
    data: {
      companyId: company2.id,
      name: 'Raqueta tenis [Beta]',
      description: 'Raqueta profesional Beta',
      sku: 'BETA-RAQ-001',
      barcode: '5000999000111',
      price: 79.99,
      cost: 40.00,
      stock: 18,
      minStock: 5,
      maxStock: 50,
      categoryId: sportsCategory.id,
      supplierId: supplier2Beta.id,
      active: true,
    },
  })
  console.log(`✅ Productos Beta: ${product1Beta.name}, ${product2Beta.name}, ${product3Beta.name}, ${product4Beta.name}`)

  const customer1Beta = await prisma.customer.create({
    data: {
      companyId: company2.id,
      name: 'Carlos López (Beta)',
      email: 'carlos.lopez@cliente-betacorp.com',
      phone: '+1987654323',
      address: '300 Buyer St, Beta',
    },
  })

  const customer2Beta = await prisma.customer.create({
    data: {
      companyId: company2.id,
      name: 'Ana Martínez (Beta)',
      email: 'ana.martinez@cliente-betacorp.com',
      phone: '+1987654324',
      address: '400 Client Rd, Beta',
    },
  })

  const customer3Beta = await prisma.customer.create({
    data: {
      companyId: company2.id,
      name: 'Luis Fernández (Beta)',
      email: 'luis.fernandez@cliente-betacorp.com',
      phone: '+1987654327',
      address: '600 Beta Ave',
    },
  })
  console.log(`✅ Clientes Beta: ${customer1Beta.name}, ${customer2Beta.name}, ${customer3Beta.name}`)

  await prisma.storeConfig.create({
    data: {
      companyId: company2.id,
      name: 'Tienda Principal Beta',
      address: '500 Beta Street, Beta Corp.',
      phone: '+1987654325',
      email: 'tienda@betacorp.com',
      currency: 'USD',
      taxRate: 0.08,
      lowStockAlert: 10,
      invoicePrefix: 'BETA-INV-',
      invoiceNumber: 4,
      allowSalesWithoutStock: false,
    },
  })
  console.log('✅ Configuración de tienda Beta creada')

  await prisma.ticketConfig.create({
    data: {
      companyId: company2.id,
      ticketType: 'RECEIPT',
      header: 'Beta Corp. - Gracias por su compra',
      footer: 'Vuelva pronto a Beta',
      thermalWidth: 80,
      fontSize: 12,
      copies: 1,
      autoPrint: true,
    },
  })
  console.log('✅ Configuración de tickets Beta creada')

  await prisma.loyaltyConfig.create({
    data: {
      companyId: company2.id,
      pointsPerDollar: 1.00,
      redemptionRate: 0.01,
      pointsExpireMonths: 12,
      minPurchaseForPoints: 10.00,
      maxPointsPerPurchase: 1000,
      isActive: true,
    },
  })
  console.log('✅ Configuración de fidelidad Beta creada')

  const sale1Beta = await prisma.sale.create({
    data: {
      companyId: company2.id,
      customerId: customer1Beta.id,
      userId: gerenteBeta.id,
      invoiceNumber: 'BETA-INV-0001',
      total: 53.99,
      subtotal: 49.99,
      tax: 4.00,
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      items: {
        create: [
          { productId: product1Beta.id, quantity: 1, price: 49.99, subtotal: 49.99 },
        ],
      },
    },
  })

  const sale2Beta = await prisma.sale.create({
    data: {
      companyId: company2.id,
      customerId: customer2Beta.id,
      userId: ventasBeta.id,
      invoiceNumber: 'BETA-INV-0002',
      total: 199.97,
      subtotal: 185.16,
      tax: 14.81,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      items: {
        create: [
          { productId: product3Beta.id, quantity: 1, price: 89.99, subtotal: 89.99 },
          { productId: product2Beta.id, quantity: 2, price: 29.99, subtotal: 59.98 },
        ],
      },
    },
  })

  const sale3Beta = await prisma.sale.create({
    data: {
      companyId: company2.id,
      customerId: customer3Beta.id,
      userId: gerenteBeta.id,
      invoiceNumber: 'BETA-INV-0003',
      total: 79.99,
      subtotal: 79.99,
      tax: 0,
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      items: {
        create: [
          { productId: product4Beta.id, quantity: 1, price: 79.99, subtotal: 79.99 },
        ],
      },
    },
  })
  console.log(`✅ Ventas Beta creadas: ${sale1Beta.invoiceNumber}, ${sale2Beta.invoiceNumber}, ${sale3Beta.invoiceNumber}`)

  await prisma.loyaltyPoint.create({
    data: {
      companyId: company2.id,
      customerId: customer1Beta.id,
      saleId: sale1Beta.id,
      points: 54,
      type: 'EARNED',
      description: 'Puntos Beta - compra BETA-INV-0001',
    },
  })
  await prisma.loyaltyPoint.create({
    data: {
      companyId: company2.id,
      customerId: customer2Beta.id,
      saleId: sale2Beta.id,
      points: 200,
      type: 'EARNED',
      description: 'Puntos Beta - compra BETA-INV-0002',
    },
  })
  console.log('✅ Puntos de fidelidad Beta creados')

  await prisma.userPreferences.create({
    data: { companyId: company2.id, userId: gerenteBeta.id, language: 'es' },
  })
  await prisma.userPreferences.create({
    data: { companyId: company2.id, userId: ventasBeta.id, language: 'es' },
  })
  console.log('✅ Preferencias de usuario Beta creadas')

  await prisma.notification.create({
    data: {
      companyId: company2.id,
      userId: gerenteBeta.id,
      type: 'INFO',
      priority: 'MEDIUM',
      title: 'Bienvenido a Beta Corp.',
      message: 'Sistema Beta - Hogar, deportes y jardín',
      status: 'UNREAD',
    },
  })
  await prisma.notification.create({
    data: {
      companyId: company2.id,
      userId: ventasBeta.id,
      type: 'INFO',
      priority: 'LOW',
      title: 'Ventas Beta',
      message: 'Panel de ventas Beta Corp.',
      status: 'UNREAD',
    },
  })
  console.log('✅ Notificaciones Beta creadas')

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
