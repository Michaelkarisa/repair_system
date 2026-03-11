import {
  mockTickets,
  mockCustomers,
  mockInvoices,
  mockTeamMembers,
  type Ticket,
  type Customer,
  type Invoice,
  type TeamMember,
} from "./mock-data";

// Simulate network delay
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// TICKETS API
export async function fetchTickets(filters?: {
  status?: string;
  search?: string;
}) {
  await delay(400);

  let tickets = [...mockTickets].sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  if (filters?.status && filters.status !== "all") {
    tickets = tickets.filter((t) => t.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(search) ||
        t.deviceModel.toLowerCase().includes(search) ||
        mockCustomers
          .find((c) => c.id === t.customerId)
          ?.name.toLowerCase()
          .includes(search)
    );
  }

  return tickets;
}

export async function fetchTicketById(id: string) {
  await delay(300);

  const ticket = mockTickets.find((t) => t.id === id);
  if (!ticket) throw new Error("Ticket not found");

  return ticket;
}

export async function fetchTicketByCode(code: string) {
  await delay(300);

  const ticket = mockTickets.find((t) => t.ticketNumber === code);
  if (!ticket) throw new Error("Ticket not found");

  return ticket;
}

export async function fetchRecentTickets(limit: number = 10) {
  await delay(300);

  return mockTickets
    .sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )
    .slice(0, limit);
}

export async function fetchTicketStats() {
  await delay(300);

  const stats = {
    openTickets: mockTickets.filter((t) => t.status !== "completed").length,
    waitingParts: mockTickets.filter((t) => t.status === "waiting-parts")
      .length,
    readyForPickup: mockTickets.filter((t) => t.status === "ready").length,
    overdue: mockTickets.filter((t) => {
      const dueDate = new Date(t.estimatedDate);
      const today = new Date();
      return t.status !== "completed" && dueDate < today;
    }).length,
  };

  return stats;
}

// CUSTOMERS API
export async function fetchCustomers(filters?: { search?: string }) {
  await delay(300);

  let customers = [...mockCustomers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search)
    );
  }

  return customers;
}

export async function fetchCustomerById(id: string) {
  await delay(300);

  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");

  const customerTickets = mockTickets.filter((t) => t.customerId === id);

  return {
    ...customer,
    ticketsCount: customerTickets.length,
    recentTickets: customerTickets.slice(0, 5),
  };
}

// INVOICES API
export async function fetchInvoices(filters?: {
  status?: string;
  search?: string;
}) {
  await delay(300);

  let invoices = [...mockInvoices].sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  if (filters?.status && filters.status !== "all") {
    invoices = invoices.filter((i) => i.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    invoices = invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(search) ||
        mockCustomers
          .find((c) => c.id === i.customerId)
          ?.name.toLowerCase()
          .includes(search)
    );
  }

  return invoices;
}

export async function fetchInvoiceById(id: string) {
  await delay(300);

  const invoice = mockInvoices.find((i) => i.id === id);
  if (!invoice) throw new Error("Invoice not found");

  const customer = mockCustomers.find((c) => c.id === invoice.customerId);

  return {
    ...invoice,
    customer,
  };
}

// TEAM API
export async function fetchTeamMembers() {
  await delay(200);

  return mockTeamMembers;
}

export async function fetchTeamMemberById(id: string) {
  await delay(200);

  const member = mockTeamMembers.find((m) => m.id === id);
  if (!member) throw new Error("Team member not found");

  return member;
}

// DASHBOARD DATA
export async function fetchDashboardData() {
  await delay(500);

  const stats = await fetchTicketStats();
  const recentTickets = await fetchRecentTickets(5);

  return {
    stats,
    recentTickets,
  };
}
