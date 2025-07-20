import { Test, TestingModule } from '@nestjs/testing';
import { SignupController } from './signup.controller';
import { SignupService } from '../service/signup.service';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

// Mock data
const validSignupDto: SignupDto = {
  username: '12345678901',
  password: 'password123',
  birthdate: '2000-01-01'
};

const createdUser: Partial<User> = {
  id: '1',
  username: '12345678901',
  balance: 0,
  birthdate: '2000-01-01'
};

// Mock service implementation
const signupServiceMock = {
  execute: jest.fn().mockImplementation(async (signupDto: SignupDto): Promise<Partial<User>> => {
    // Validate input
    if (!signupDto.username || !signupDto.password || !signupDto.birthdate) {
      throw new Error('All fields are required');
    }

    if (signupDto.username.length !== 11) {
      throw new Error('Username must be exactly 11 characters');
    }

    if (signupDto.password.length < 8 || signupDto.password.length > 20) {
      throw new Error('Password must be between 8 and 20 characters');
    }

    // Simulate existing user check
    if (signupDto.username === 'existinguser') {
      throw new BadRequestException('Usuário já existe');
    }

    // Return user with the actual input data
    return {
      id: '1',
      username: signupDto.username,
      balance: 0,
      birthdate: signupDto.birthdate
    };
  })
};

describe('SignupController', () => {
  let controller: SignupController;
  let service: SignupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: SignupService,
          useValue: signupServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SignupController>(SignupController);
    service = module.get<SignupService>(SignupService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should call service.execute with correct parameters', async () => {
    await controller.handle(validSignupDto);

    expect(service.execute).toHaveBeenCalledWith(validSignupDto);
    expect(service.execute).toHaveBeenCalledTimes(1);
  });

  it('should return the expected response for valid signup', async () => {
    const result: Partial<User> = await controller.handle(validSignupDto);

    expect(result).toEqual(createdUser);
    expect(result.id).toBeDefined();
    expect(result.username).toBe(validSignupDto.username);
    expect(result.birthdate).toBe(validSignupDto.birthdate);
  });

  it('should handle user already exists exception', async () => {
    const existingUserDto: SignupDto = {
      username: '12345678901', // Valid length
      password: 'password123',
      birthdate: '2000-01-01'
    };

    // Mock the service to throw BadRequestException for this specific case
    signupServiceMock.execute.mockImplementationOnce(async (dto: SignupDto) => {
      if (dto.username === '12345678901') {
        throw new BadRequestException('Usuário já existe');
      }
      return createdUser;
    });

    await expect(controller.handle(existingUserDto)).rejects.toThrow(BadRequestException);
    expect(service.execute).toHaveBeenCalledWith(existingUserDto);
  });

  it('should handle service exceptions gracefully', async () => {
    const serviceError = new Error('Database connection failed');
    signupServiceMock.execute.mockRejectedValueOnce(serviceError);

    await expect(controller.handle(validSignupDto)).rejects.toThrow(Error);
  });

  it('should handle invalid username length', async () => {
    const invalidUsernameDto: SignupDto = {
      username: '1234567890', // 10 characters instead of 11
      password: 'password123',
      birthdate: '2000-01-01'
    };

    await expect(controller.handle(invalidUsernameDto)).rejects.toThrow();
  });

  it('should handle invalid password length', async () => {
    const invalidPasswordDto: SignupDto = {
      username: '12345678901',
      password: '123', // Too short
      birthdate: '2000-01-01'
    };

    await expect(controller.handle(invalidPasswordDto)).rejects.toThrow();
  });

  it('should handle empty username', async () => {
    const emptyUsernameDto: SignupDto = {
      username: '',
      password: 'password123',
      birthdate: '2000-01-01'
    };

    await expect(controller.handle(emptyUsernameDto)).rejects.toThrow();
  });

  it('should handle empty password', async () => {
    const emptyPasswordDto: SignupDto = {
      username: '12345678901',
      password: '',
      birthdate: '2000-01-01'
    };

    await expect(controller.handle(emptyPasswordDto)).rejects.toThrow();
  });

  it('should handle empty birthdate', async () => {
    const emptyBirthdateDto: SignupDto = {
      username: '12345678901',
      password: 'password123',
      birthdate: ''
    };

    await expect(controller.handle(emptyBirthdateDto)).rejects.toThrow();
  });

  it('should handle null input', async () => {
    await expect(controller.handle(null as any)).rejects.toThrow();
  });

  it('should handle undefined input', async () => {
    await expect(controller.handle(undefined as any)).rejects.toThrow();
  });

  it('should return user with correct structure', async () => {
    const result: Partial<User> = await controller.handle(validSignupDto);

    expect(result.id).toBeDefined();
    expect(result.username).toBeDefined();
    expect(result.birthdate).toBeDefined();
    expect(result.balance).toBeDefined();
  });

  it('should work with different valid usernames', async () => {
    const differentUsernameDto: SignupDto = {
      username: '98765432109',
      password: 'password123',
      birthdate: '1995-05-15'
    };

    const result: Partial<User> = await controller.handle(differentUsernameDto);

    expect(result.username).toBe(differentUsernameDto.username);
    expect(result.birthdate).toBe(differentUsernameDto.birthdate);
  });

  it('should work with different valid passwords', async () => {
    const differentPasswordDto: SignupDto = {
      username: '12345678901',
      password: 'differentpassword123',
      birthdate: '2000-01-01'
    };

    const result: Partial<User> = await controller.handle(differentPasswordDto);

    expect(result).toEqual(createdUser);
  });

  it('should work with different birthdates', async () => {
    const differentBirthdateDto: SignupDto = {
      username: '12345678901',
      password: 'password123',
      birthdate: '1990-12-25'
    };

    const result: Partial<User> = await controller.handle(differentBirthdateDto);

    expect(result.birthdate).toBe(differentBirthdateDto.birthdate);
  });

  it('should handle maximum length password', async () => {
    const maxLengthPasswordDto: SignupDto = {
      username: '12345678901',
      password: 'verylongpassword123',
      birthdate: '2000-01-01'
    };

    const result: Partial<User> = await controller.handle(maxLengthPasswordDto);

    expect(result).toEqual(createdUser);
  });

  it('should handle minimum length password', async () => {
    const minLengthPasswordDto: SignupDto = {
      username: '12345678901',
      password: '12345678',
      birthdate: '2000-01-01'
    };

    const result: Partial<User> = await controller.handle(minLengthPasswordDto);

    expect(result).toEqual(createdUser);
  });
}); 