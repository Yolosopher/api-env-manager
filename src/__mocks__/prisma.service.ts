export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add other methods as needed
  },
  // Mock other models as needed
};
