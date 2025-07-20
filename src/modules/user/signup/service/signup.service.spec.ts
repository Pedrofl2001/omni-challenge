import { Test, TestingModule } from '@nestjs/testing';
import { SignupService } from './signup.service';
import { UserRepository } from 'src/modules/user/user.repository';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

// Mock data
const validSignupDto: SignupDto = {
  username: '12345678901',
  password: 'password123',
  birthdate: '2000-01-01'
};

const existingUser: Partial<User> = {
  id: '1',
  username: '12345678901',
  password: '$2b$10$hashedpassword',
  balance: 100,
  birthdate: '2000-01-01'
};

const createdUser: Partial<User> = {
  id: '2',
  username: '98765432109',
  balance: 0,
  birthdate: '1995-05-15'
};

// Mock repositories
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn()
};

describe('SignupService', () => {
  let service: SignupService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SignupService>(SignupService);
    userRepository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
    
    // Set up default mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should successfully create a new user with valid data', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(validSignupDto);

    expect(result).toEqual(createdUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(validSignupDto.username);
    expect(bcrypt.hash).toHaveBeenCalledWith(validSignupDto.password, 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      ...validSignupDto,
      password: '$2b$10$hashedpassword'
    });
  });

  it('should throw BadRequestException when user already exists', async () => {
    mockUserRepository.findOne.mockResolvedValue(existingUser);

    await expect(service.execute(validSignupDto)).rejects.toThrow(BadRequestException);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(validSignupDto.username);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should hash password with correct salt rounds', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    await service.execute(validSignupDto);

    expect(bcrypt.hash).toHaveBeenCalledWith(validSignupDto.password, 10);
  });

  it('should pass hashed password to repository create method', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    await service.execute(validSignupDto);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: validSignupDto.username,
      password: '$2b$10$hashedpassword',
      birthdate: validSignupDto.birthdate
    });
  });

  it('should handle repository findOne errors gracefully', async () => {
    const repositoryError = new Error('Database connection failed');
    mockUserRepository.findOne.mockRejectedValue(repositoryError);

    await expect(service.execute(validSignupDto)).rejects.toThrow(repositoryError);
  });

  it('should handle bcrypt hash errors gracefully', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

    await expect(service.execute(validSignupDto)).rejects.toThrow();
  });

  it('should handle repository create errors gracefully', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const createError = new Error('Create operation failed');
    mockUserRepository.create.mockRejectedValue(createError);

    await expect(service.execute(validSignupDto)).rejects.toThrow(createError);
  });

  it('should work with different usernames', async () => {
    const differentUsernameDto: SignupDto = {
      username: '98765432109',
      password: 'password123',
      birthdate: '1995-05-15'
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(differentUsernameDto);

    expect(result).toEqual(createdUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith('98765432109');
  });

  it('should work with different passwords', async () => {
    const differentPasswordDto: SignupDto = {
      username: '12345678901',
      password: 'differentpassword123',
      birthdate: '2000-01-01'
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    await service.execute(differentPasswordDto);

    expect(bcrypt.hash).toHaveBeenCalledWith('differentpassword123', 10);
  });

  it('should work with different birthdates', async () => {
    const differentBirthdateDto: SignupDto = {
      username: '12345678901',
      password: 'password123',
      birthdate: '1990-12-25'
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    await service.execute(differentBirthdateDto);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: '12345678901',
      password: '$2b$10$hashedpassword',
      birthdate: '1990-12-25'
    });
  });

  it('should handle empty username', async () => {
    const emptyUsernameDto: SignupDto = {
      username: '',
      password: 'password123',
      birthdate: '2000-01-01'
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(emptyUsernameDto);

    expect(result).toEqual(createdUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith('');
  });

  it('should handle empty password', async () => {
    const emptyPasswordDto: SignupDto = {
      username: '12345678901',
      password: '',
      birthdate: '2000-01-01'
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(emptyPasswordDto);

    expect(result).toEqual(createdUser);
    expect(bcrypt.hash).toHaveBeenCalledWith('', 10);
  });

  it('should handle empty birthdate', async () => {
    const emptyBirthdateDto: SignupDto = {
      username: '12345678901',
      password: 'password123',
      birthdate: ''
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(emptyBirthdateDto);

    expect(result).toEqual(createdUser);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: '12345678901',
      password: '$2b$10$hashedpassword',
      birthdate: ''
    });
  });

  it('should return user with correct structure', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(validSignupDto);

    expect(result.id).toBeDefined();
    expect(result.username).toBeDefined();
    expect(result.birthdate).toBeDefined();
  });

  it('should handle null input', async () => {
    await expect(service.execute(null as any)).rejects.toThrow();
  });

  it('should handle undefined input', async () => {
    await expect(service.execute(undefined as any)).rejects.toThrow();
  });

  it('should handle partial input', async () => {
    const partialDto = { username: '12345678901' } as SignupDto;
    
    mockUserRepository.findOne.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result: Partial<User> = await service.execute(partialDto);

    expect(result).toEqual(createdUser);
  });
}); 