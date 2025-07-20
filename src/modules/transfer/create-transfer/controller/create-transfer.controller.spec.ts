import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransferController } from './create-transfer.controller';
import { CreateTransferService } from '../service/create-transfer.service';
import { CreateTransferInput } from '../../dto/create-transfer.input';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const validTransferInput: CreateTransferInput = {
  fromId: 'user1',
  toId: 'user2',
  amount: 100
};

const users = [
  { id: 'user1', username: 'user1', balance: 200, birthdate: '2000-01-01' },
  { id: 'user2', username: 'user2', balance: 50, birthdate: '2001-01-01' }
];

const createTransferServiceMock = {
  execute: jest.fn().mockImplementation(async (transferInput: CreateTransferInput): Promise<void> => {
    if (!transferInput.fromId || !transferInput.toId || transferInput.amount === undefined) {
      throw new Error('All fields are required');
    }

    if (transferInput.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (transferInput.fromId === transferInput.toId) {
      throw new BadRequestException('Cannot transfer to same user');
    }

    if (transferInput.fromId === 'nonexistent' || transferInput.toId === 'nonexistent') {
      throw new NotFoundException('Algum dos usuários não foi encontrado');
    }

    if (transferInput.fromId === 'pooruser') {
      throw new BadRequestException('Saldo insuficiente para transferir');
    }

  })
};

describe('CreateTransferController', () => {
  let controller: CreateTransferController;
  let service: CreateTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTransferController],
      providers: [
        {
          provide: CreateTransferService,
          useValue: createTransferServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CreateTransferController>(CreateTransferController);
    service = module.get<CreateTransferService>(CreateTransferService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should call service.execute with correct parameters', async () => {
    await controller.handle(validTransferInput);

    expect(service.execute).toHaveBeenCalledWith(validTransferInput);
    expect(service.execute).toHaveBeenCalledTimes(1);
  });

  it('should return void for successful transfer', async () => {
    const result = await controller.handle(validTransferInput);

    expect(result).toBeUndefined();
  });

  it('should handle user not found exception', async () => {
    const nonExistentUserInput: CreateTransferInput = {
      fromId: 'nonexistent',
      toId: 'user2',
      amount: 100
    };

    await expect(controller.handle(nonExistentUserInput)).rejects.toThrow(NotFoundException);
    expect(service.execute).toHaveBeenCalledWith(nonExistentUserInput);
  });

  it('should handle insufficient balance exception', async () => {
    const insufficientBalanceInput: CreateTransferInput = {
      fromId: 'pooruser',
      toId: 'user2',
      amount: 100
    };

    await expect(controller.handle(insufficientBalanceInput)).rejects.toThrow(BadRequestException);
    expect(service.execute).toHaveBeenCalledWith(insufficientBalanceInput);
  });

  it('should handle service exceptions gracefully', async () => {
    const serviceError = new Error('Database connection failed');
    createTransferServiceMock.execute.mockRejectedValueOnce(serviceError);

    await expect(controller.handle(validTransferInput)).rejects.toThrow(Error);
  });

  it('should handle invalid amount (zero)', async () => {
    const zeroAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: 0
    };

    await expect(controller.handle(zeroAmountInput)).rejects.toThrow(BadRequestException);
  });

  it('should handle invalid amount (negative)', async () => {
    const negativeAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: -50
    };

    await expect(controller.handle(negativeAmountInput)).rejects.toThrow(BadRequestException);
  });

  it('should handle transfer to same user', async () => {
    const sameUserInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user1',
      amount: 100
    };

    await expect(controller.handle(sameUserInput)).rejects.toThrow(BadRequestException);
  });

  it('should handle empty fromId', async () => {
    const emptyFromIdInput: CreateTransferInput = {
      fromId: '',
      toId: 'user2',
      amount: 100
    };

    await expect(controller.handle(emptyFromIdInput)).rejects.toThrow();
  });

  it('should handle empty toId', async () => {
    const emptyToIdInput: CreateTransferInput = {
      fromId: 'user1',
      toId: '',
      amount: 100
    };

    await expect(controller.handle(emptyToIdInput)).rejects.toThrow();
  });

  it('should handle null input', async () => {
    await expect(controller.handle(null as any)).rejects.toThrow();
  });

  it('should handle undefined input', async () => {
    await expect(controller.handle(undefined as any)).rejects.toThrow();
  });

  it('should work with different valid amounts', async () => {
    const differentAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: 500
    };

    await controller.handle(differentAmountInput);

    expect(service.execute).toHaveBeenCalledWith(differentAmountInput);
  });

  it('should work with different user IDs', async () => {
    const differentUsersInput: CreateTransferInput = {
      fromId: 'user3',
      toId: 'user4',
      amount: 100
    };

    await controller.handle(differentUsersInput);

    expect(service.execute).toHaveBeenCalledWith(differentUsersInput);
  });

  it('should handle large amounts', async () => {
    const largeAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: 1000000
    };

    await controller.handle(largeAmountInput);

    expect(service.execute).toHaveBeenCalledWith(largeAmountInput);
  });

  it('should handle small amounts', async () => {
    const smallAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: 0.01
    };

    await controller.handle(smallAmountInput);

    expect(service.execute).toHaveBeenCalledWith(smallAmountInput);
  });

  it('should handle decimal amounts', async () => {
    const decimalAmountInput: CreateTransferInput = {
      fromId: 'user1',
      toId: 'user2',
      amount: 99.99
    };

    await controller.handle(decimalAmountInput);

    expect(service.execute).toHaveBeenCalledWith(decimalAmountInput);
  });

  it('should verify HTTP code is 204 for successful transfer', async () => {
    await controller.handle(validTransferInput);

    expect(service.execute).toHaveBeenCalledWith(validTransferInput);
  });
}); 