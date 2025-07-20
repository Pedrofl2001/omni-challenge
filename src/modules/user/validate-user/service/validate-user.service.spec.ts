import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserService } from './validate-user.service';
import { UserRepository } from '../../user.repository';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { User } from '../../entities/user.entity';

const mockUser: Partial<User> = {
  id: '1',
  username: 'testuser',
  balance: 100,
  birthdate: '2000-01-01',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('ValidateUserService', () => {
  let service: ValidateUserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ValidateUserService>(ValidateUserService);
    repository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    it('should return user data when valid payload is provided', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith(payload.username);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', async () => {
      const payload: JwtPayload = { username: 'nonexistentuser' };
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith(payload.username);
      expect(result).toBeNull();
    });

    it('should handle different usernames correctly', async () => {
      const differentUser = { ...mockUser, username: 'differentuser' };
      const payload: JwtPayload = { username: 'differentuser' };
      mockUserRepository.findOne.mockResolvedValue(differentUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith('differentuser');
      expect(result).toEqual(differentUser);
    });

    it('should handle empty username', async () => {
      const payload: JwtPayload = { username: '' };
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith('');
      expect(result).toBeNull();
    });

    it('should handle user with minimal data', async () => {
      const minimalUser = {
        id: '2',
        username: 'minimaluser',
      };
      const payload: JwtPayload = { username: 'minimaluser' };
      mockUserRepository.findOne.mockResolvedValue(minimalUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith('minimaluser');
      expect(result).toEqual(minimalUser);
    });

    it('should handle user with complete data', async () => {
      const completeUser: Partial<User> = {
        id: '3',
        username: 'completeuser',
        password: 'hashedpassword',
        balance: 500,
        birthdate: '1995-05-15',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-12-01'),
      };
      const payload: JwtPayload = { username: 'completeuser' };
      mockUserRepository.findOne.mockResolvedValue(completeUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith('completeuser');
      expect(result).toEqual(completeUser);
    });

    it('should throw an error if repository.findOne fails', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      const error = new Error('Database connection failed');
      mockUserRepository.findOne.mockRejectedValue(error);

      await expect(service.execute(payload)).rejects.toThrow('Database connection failed');
      expect(repository.findOne).toHaveBeenCalledWith(payload.username);
    });

    it('should handle repository timeout errors', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      const timeoutError = new Error('Query timeout');
      mockUserRepository.findOne.mockRejectedValue(timeoutError);

      await expect(service.execute(payload)).rejects.toThrow('Query timeout');
    });

    it('should handle repository connection errors', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      const connectionError = new Error('Connection refused');
      mockUserRepository.findOne.mockRejectedValue(connectionError);

      await expect(service.execute(payload)).rejects.toThrow('Connection refused');
    });

    it('should verify repository method is called with correct parameters', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith('testuser');
    });

    it('should return user data in correct format', async () => {
      const payload: JwtPayload = { username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.execute(payload);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('birthdate');
      expect(typeof result.id).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(typeof result.balance).toBe('number');
      expect(typeof result.birthdate).toBe('string');
    });

    it('should handle special characters in username', async () => {
      const specialUser = { ...mockUser, username: 'user@domain.com' };
      const payload: JwtPayload = { username: 'user@domain.com' };
      mockUserRepository.findOne.mockResolvedValue(specialUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith('user@domain.com');
      expect(result).toEqual(specialUser);
    });

    it('should handle long usernames', async () => {
      const longUsername = 'a'.repeat(100);
      const longUser = { ...mockUser, username: longUsername };
      const payload: JwtPayload = { username: longUsername };
      mockUserRepository.findOne.mockResolvedValue(longUser);

      const result = await service.execute(payload);

      expect(repository.findOne).toHaveBeenCalledWith(longUsername);
      expect(result).toEqual(longUser);
    });
  });
});
