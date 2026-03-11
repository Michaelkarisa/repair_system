export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  imeiSerial: string;
  issueDescription: string;
  conditionNotes: string;
  status: "received" | "diagnosing" | "waiting-parts" | "repairing" | "ready" | "completed";
  createdDate: string;
  estimatedDate: string;
  completedDate?: string;
  technicianId: string;
  depositAmount: number;
  estimatedCost: number;
  finalCost?: number;
  labor: number;
  parts: number;
  balance: number;
  warranty?: {
    enabled: boolean;
    expiryDate: string;
  };
  notes: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  tickets: string[];
  lastRepair?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  ticketId?: string;
  amount: number;
  status: "paid" | "unpaid";
  createdDate: string;
  dueDate: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  tickets: number;
}

export const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    name: "John Davis",
    phone: "+1-555-0101",
    email: "john.davis@email.com",
    address: "123 Main St, New York, NY 10001",
    tickets: ["TK-001", "TK-002"],
    lastRepair: "2025-12-20",
  },
  {
    id: "cust-002",
    name: "Sarah Wilson",
    phone: "+1-555-0102",
    email: "sarah.wilson@email.com",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    tickets: ["TK-003"],
    lastRepair: "2025-12-15",
  },
  {
    id: "cust-003",
    name: "Michael Chen",
    phone: "+1-555-0103",
    email: "m.chen@email.com",
    address: "789 Pine Rd, Chicago, IL 60601",
    tickets: ["TK-004", "TK-005"],
    lastRepair: "2025-12-10",
  },
  {
    id: "cust-004",
    name: "Emily Rodriguez",
    phone: "+1-555-0104",
    email: "emily.r@email.com",
    address: "321 Elm St, Houston, TX 77001",
    tickets: ["TK-006"],
    lastRepair: "2025-12-05",
  },
  {
    id: "cust-005",
    name: "David Thompson",
    phone: "+1-555-0105",
    email: "d.thompson@email.com",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    tickets: ["TK-007", "TK-008"],
    lastRepair: "2025-11-30",
  },
  {
    id: "cust-006",
    name: "Jessica Martinez",
    phone: "+1-555-0106",
    email: "j.martinez@email.com",
    address: "987 Birch Ln, Miami, FL 33101",
    tickets: ["TK-009"],
    lastRepair: "2025-11-25",
  },
  {
    id: "cust-007",
    name: "Robert Anderson",
    phone: "+1-555-0107",
    email: "r.anderson@email.com",
    address: "147 Spruce Way, Seattle, WA 98101",
    tickets: ["TK-010"],
    lastRepair: "2025-11-20",
  },
  {
    id: "cust-008",
    name: "Amanda Garcia",
    phone: "+1-555-0108",
    email: "amanda.g@email.com",
    address: "258 Ash Pl, Denver, CO 80202",
    tickets: ["TK-011"],
    lastRepair: "2025-11-15",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "ticket-001",
    ticketNumber: "TK-001",
    customerId: "cust-001",
    deviceType: "iPhone",
    deviceBrand: "Apple",
    deviceModel: "iPhone 15 Pro",
    imeiSerial: "359066123456789",
    issueDescription: "Screen cracked, unresponsive touch",
    conditionNotes: "Cosmetic damage on back, internal damage suspected",
    status: "completed",
    createdDate: "2025-12-20",
    estimatedDate: "2025-12-22",
    completedDate: "2025-12-22",
    technicianId: "tech-001",
    depositAmount: 100,
    estimatedCost: 350,
    finalCost: 380,
    labor: 150,
    parts: 230,
    balance: 280,
    warranty: { enabled: true, expiryDate: "2026-12-22" },
    notes: [
      "Customer approved replacement screen",
      "Screen replaced, device tested successfully",
    ],
  },
  {
    id: "ticket-002",
    ticketNumber: "TK-002",
    customerId: "cust-001",
    deviceType: "MacBook",
    deviceBrand: "Apple",
    deviceModel: "MacBook Pro 16",
    imeiSerial: "C02RQ6K0Q6R8",
    issueDescription: "Keyboard not working properly",
    conditionNotes: "Multiple keys unresponsive",
    status: "ready",
    createdDate: "2025-12-18",
    estimatedDate: "2025-12-24",
    technicianId: "tech-002",
    depositAmount: 150,
    estimatedCost: 280,
    labor: 120,
    parts: 160,
    balance: 130,
    warranty: { enabled: true, expiryDate: "2026-12-24" },
    notes: ["Keyboard module replaced", "Awaiting customer pickup"],
  },
  {
    id: "ticket-003",
    ticketNumber: "TK-003",
    customerId: "cust-002",
    deviceType: "Samsung Galaxy",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S24",
    imeiSerial: "359065123456789",
    issueDescription: "Battery drains quickly",
    conditionNotes: "Device won't hold charge for more than 2 hours",
    status: "repairing",
    createdDate: "2025-12-15",
    estimatedDate: "2025-12-25",
    technicianId: "tech-001",
    depositAmount: 75,
    estimatedCost: 150,
    labor: 50,
    parts: 100,
    balance: 75,
    warranty: { enabled: false, expiryDate: "" },
    notes: ["Battery diagnostic completed", "Battery replacement in progress"],
  },
  {
    id: "ticket-004",
    ticketNumber: "TK-004",
    customerId: "cust-003",
    deviceType: "iPad",
    deviceBrand: "Apple",
    deviceModel: "iPad Pro 12.9",
    imeiSerial: "A1670",
    issueDescription: "Charging port damaged",
    conditionNotes: "Device won't charge via USB-C port",
    status: "waiting-parts",
    createdDate: "2025-12-10",
    estimatedDate: "2025-12-28",
    technicianId: "tech-003",
    depositAmount: 100,
    estimatedCost: 220,
    labor: 80,
    parts: 140,
    balance: 120,
    warranty: { enabled: true, expiryDate: "2026-12-28" },
    notes: [
      "Port replacement part ordered",
      "Part arrived, awaiting installation",
    ],
  },
  {
    id: "ticket-005",
    ticketNumber: "TK-005",
    customerId: "cust-003",
    deviceType: "AirPods",
    deviceBrand: "Apple",
    deviceModel: "AirPods Pro",
    imeiSerial: "2XPG2438NQKM5",
    issueDescription: "Right earbud not charging",
    conditionNotes: "Charging case works, one earbud doesn't respond",
    status: "diagnosing",
    createdDate: "2025-12-11",
    estimatedDate: "2025-12-21",
    technicianId: "tech-002",
    depositAmount: 50,
    estimatedCost: 180,
    labor: 0,
    parts: 180,
    balance: 130,
    warranty: { enabled: false, expiryDate: "" },
    notes: ["Diagnostic test in progress", "Testing charging contacts"],
  },
  {
    id: "ticket-006",
    ticketNumber: "TK-006",
    customerId: "cust-004",
    deviceType: "Google Pixel",
    deviceBrand: "Google",
    deviceModel: "Pixel 8 Pro",
    imeiSerial: "359067123456789",
    issueDescription: "Water damage, won't turn on",
    conditionNotes: "Liquid detected inside device",
    status: "received",
    createdDate: "2025-12-05",
    estimatedDate: "2026-01-02",
    technicianId: "tech-001",
    depositAmount: 200,
    estimatedCost: 450,
    labor: 150,
    parts: 300,
    balance: 250,
    warranty: { enabled: false, expiryDate: "" },
    notes: ["Device received and documented", "Awaiting parts and technician availability"],
  },
  {
    id: "ticket-007",
    ticketNumber: "TK-007",
    customerId: "cust-005",
    deviceType: "Laptop",
    deviceBrand: "Dell",
    deviceModel: "XPS 15",
    imeiSerial: "DELL123456789",
    issueDescription: "Hard drive failure",
    conditionNotes: "Device shows hard drive error on startup",
    status: "completed",
    createdDate: "2025-11-30",
    estimatedDate: "2025-12-10",
    completedDate: "2025-12-10",
    technicianId: "tech-003",
    depositAmount: 150,
    estimatedCost: 400,
    finalCost: 420,
    labor: 100,
    parts: 320,
    balance: 270,
    warranty: { enabled: true, expiryDate: "2026-12-10" },
    notes: ["Hard drive replaced with SSD", "Operating system reinstalled", "Device tested successfully"],
  },
  {
    id: "ticket-008",
    ticketNumber: "TK-008",
    customerId: "cust-005",
    deviceType: "Monitor",
    deviceBrand: "LG",
    deviceModel: "27UP550",
    imeiSerial: "LG789456123",
    issueDescription: "Display flickering",
    conditionNotes: "Screen flickers intermittently",
    status: "ready",
    createdDate: "2025-11-28",
    estimatedDate: "2025-12-15",
    technicianId: "tech-002",
    depositAmount: 50,
    estimatedCost: 180,
    labor: 60,
    parts: 120,
    balance: 130,
    warranty: { enabled: true, expiryDate: "2026-12-15" },
    notes: ["Display panel replaced", "Tested and working properly"],
  },
  {
    id: "ticket-009",
    ticketNumber: "TK-009",
    customerId: "cust-006",
    deviceType: "Nintendo Switch",
    deviceBrand: "Nintendo",
    deviceModel: "Switch OLED",
    imeiSerial: "NSW123456789",
    issueDescription: "Joy-Con drifting",
    conditionNotes: "Left Joy-Con has analog stick drift",
    status: "repairing",
    createdDate: "2025-11-25",
    estimatedDate: "2025-12-20",
    technicianId: "tech-001",
    depositAmount: 60,
    estimatedCost: 120,
    labor: 40,
    parts: 80,
    balance: 60,
    warranty: { enabled: false, expiryDate: "" },
    notes: ["Joy-Con disassembled", "Analog stick replacement in progress"],
  },
  {
    id: "ticket-010",
    ticketNumber: "TK-010",
    customerId: "cust-007",
    deviceType: "Headphones",
    deviceBrand: "Sony",
    deviceModel: "WH-1000XM5",
    imeiSerial: "SNY456789123",
    issueDescription: "No sound in left ear",
    conditionNotes: "Right side works, left side completely silent",
    status: "diagnosing",
    createdDate: "2025-11-20",
    estimatedDate: "2025-12-10",
    technicianId: "tech-003",
    depositAmount: 40,
    estimatedCost: 95,
    labor: 30,
    parts: 65,
    balance: 55,
    warranty: { enabled: false, expiryDate: "" },
    notes: ["Testing audio circuits", "Identifying fault location"],
  },
  {
    id: "ticket-011",
    ticketNumber: "TK-011",
    customerId: "cust-008",
    deviceType: "Smartwatch",
    deviceBrand: "Apple",
    deviceModel: "Apple Watch Series 9",
    imeiSerial: "AWS987654321",
    issueDescription: "Screen unresponsive",
    conditionNotes: "Touch screen doesn't respond to input",
    status: "waiting-parts",
    createdDate: "2025-11-15",
    estimatedDate: "2025-12-05",
    technicianId: "tech-002",
    depositAmount: 80,
    estimatedCost: 250,
    labor: 80,
    parts: 170,
    balance: 170,
    warranty: { enabled: true, expiryDate: "2026-12-05" },
    notes: ["Display replacement part on order", "Awaiting parts arrival"],
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2025-001",
    customerId: "cust-001",
    ticketId: "ticket-001",
    amount: 380,
    status: "paid",
    createdDate: "2025-12-22",
    dueDate: "2025-12-29",
    lineItems: [
      { description: "Screen Replacement", quantity: 1, unitPrice: 230, total: 230 },
      { description: "Labor", quantity: 1, unitPrice: 150, total: 150 },
    ],
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2025-002",
    customerId: "cust-002",
    ticketId: "ticket-003",
    amount: 150,
    status: "unpaid",
    createdDate: "2025-12-15",
    dueDate: "2025-12-25",
    lineItems: [
      { description: "Battery Replacement", quantity: 1, unitPrice: 100, total: 100 },
      { description: "Labor", quantity: 1, unitPrice: 50, total: 50 },
    ],
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2025-003",
    customerId: "cust-003",
    ticketId: "ticket-004",
    amount: 220,
    status: "unpaid",
    createdDate: "2025-12-10",
    dueDate: "2025-12-28",
    lineItems: [
      { description: "USB-C Port Replacement", quantity: 1, unitPrice: 140, total: 140 },
      { description: "Labor", quantity: 1, unitPrice: 80, total: 80 },
    ],
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2025-004",
    customerId: "cust-005",
    ticketId: "ticket-007",
    amount: 420,
    status: "paid",
    createdDate: "2025-12-10",
    dueDate: "2025-12-20",
    lineItems: [
      { description: "SSD Replacement", quantity: 1, unitPrice: 320, total: 320 },
      { description: "Labor & OS Installation", quantity: 1, unitPrice: 100, total: 100 },
    ],
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2025-005",
    customerId: "cust-001",
    ticketId: "ticket-002",
    amount: 280,
    status: "unpaid",
    createdDate: "2025-12-24",
    dueDate: "2026-01-03",
    lineItems: [
      { description: "Keyboard Module Replacement", quantity: 1, unitPrice: 160, total: 160 },
      { description: "Labor", quantity: 1, unitPrice: 120, total: 120 },
    ],
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: "tech-001",
    name: "Alex Johnson",
    email: "alex.j@infernorepair.com",
    role: "Senior Technician",
    tickets: 12,
  },
  {
    id: "tech-002",
    name: "Maria Garcia",
    email: "maria.g@infernorepair.com",
    role: "Technician",
    tickets: 8,
  },
  {
    id: "tech-003",
    name: "James Lee",
    email: "james.l@infernorepair.com",
    role: "Technician",
    tickets: 6,
  },
];
