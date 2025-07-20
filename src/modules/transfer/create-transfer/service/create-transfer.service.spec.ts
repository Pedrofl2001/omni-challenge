import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransferService } from './create-transfer.service';
import { TransferRepository } from '../../transfer.repository';
import { UserRepository } from '../../../user/user.repository';
import { CreateTransferInput } from '../../dto/create-transfer.input';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock data
const validTransferInput: CreateTransferInput = {
  fromId: 'user1',
  toId: 'user2',
  amount: 100
};

const users = [
  { id: 'user1', username: 'user1', balance: 200, birthdate: '2000-01-01' },
  { id: 'user2', username: 'user2', balance: 50, birthdate: '2001-01-01' }
];

// Mock repositories
const mockTransferRepository = {
  create: jest.fn()
};

const mockUserRepository = {
  findMany: jest.fn(),
  update: jest.fn()
};

describe('CreateTransferService', () => {
  let service: CreateTransferService;
  let transferRepository: TransferRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransferService,
        {
          provide: TransferRepository,
          useValue: mockTransferRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CreateTransferService>(CreateTransferService);
    transferRepository = module.get<TransferRepository>(TransferRepository);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
    
    // Set up default mocks
    mockUserRepository.findMany.mockResolvedValue(users);
    mockUserRepository.update.mockResolvedValue({ id: 'user1' });
    mockTransferRepository.create.mockResolvedValue({ id: 'transfer1' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(transferRepository).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should successfully create a transfer with valid data', async () => {
    await service.execute(validTransferInput);

    expect(mockUserRepository.findMany).toHaveBeenCalledWith({
      where: { ids: [validTransferInput.fromId, validTransferInput.toId] }
    });
    expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
    expect(mockTransferRepository.create).toHaveBeenCalledWith(validTransferInput);
  });

  it('should throw NotFoundException when users are not found', async () => {
    mockUserRepository.findMany.mockResolvedValue([users[0]]); // Only one user found

    await expect(service.execute(validTransferInput)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findMany).toHaveBeenCalledWith({
      where: { ids: [validTransferInput.fromId, validTransferInput.toId] }
    });
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockTransferRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when insufficient balance', async () => {
    const poorUser = { ...users[0], balance: 50 };
    const usersWithPoorUser = [poorUser, users[1]];
    mockUserRepository.findMany.mockResolvedValue(usersWithPoorUser);

    await expect(service.execute(validTransferInput)).rejects.toThrow(BadRequestException);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockTransferRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository findMany errors gracefully', async () => {
    const repositoryError = new Error('Database connection failed');
    mockUserRepository.findMany.mockRejectedValue(repositoryError);

    await expect(service.execute(validTransferInput)).rejects.toThrow(repositoryError);
  });

  it('should handle repository update errors gracefully', async () => {
    const updateError = new Error('Update operation failed');
    mockUserRepository.update.mockRejectedValue(updateError);

    await expect(service.execute(validTransferInput)).rejects.toThrow(updateError);
  });

  it('should work with different user IDs', async () => {
    const differentUsersInput: CreateTransferInput = {
      fromId: 'user3',
      toId: 'user4',
      amount: 100
    };

    const differentUsers = [
      { id: 'user3', username: 'user3', balance: 300, birthdate: '2002-01-01' },
      { id: 'user4', username: 'user4', balance: 75, birthdate: '2003-01-01' }
    ];

    mockUserRepository.findMany.mockResolvedValue(differentUsers);

    await service.execute(differentUsersInput);

    expect(mockUserRepository.findMany).toHaveBeenCalledWith({
      where: { ids: ['user3', 'user4'] }
    });
    expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
  });

  it('should handle empty user arrays', async () => {
    mockUserRepository.findMany.mockResolvedValue([]);

    await expect(service.execute(validTransferInput)).rejects.toThrow(NotFoundException);
  });

  it('should handle null input', async () => {
    await expect(service.execute(null as any)).rejects.toThrow();
  });

  it('should handle undefined input', async () => {
    await expect(service.execute(undefined as any)).rejects.toThrow();
  });

  it('should handle partial input', async () => {
    const partialInput = { fromId: 'user1' } as CreateTransferInput;
    
    await expect(service.execute(partialInput)).rejects.toThrow();
  });

  it('should verify totalUsers constant is 2', async () => {
    // This test verifies the business logic constant
    await service.execute(validTransferInput);

    expect(mockUserRepository.findMany).toHaveBeenCalledWith({
      where: { ids: [validTransferInput.fromId, validTransferInput.toId] }
    });
  });
}); 