import { Test, TestingModule } from '@nestjs/testing';
import { SigninController } from './signin.controller';
import { SigninService } from '../service/signin.service';
import { SigninDto } from 'src/modules/auth/dto/signin.dto';
import { SigninOutput } from '../../dto/outputs/signin.output';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// Mock data
const validSigninDto: SigninDto = {
  username: 'testuser',
  password: 'testpassword123'
};

const validUser = {
  id: '1',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  balance: 100,
  birthdate: '2000-01-01'
};

const validSigninOutput: SigninOutput = {
  token: 'jwt-token-here',
  expiresIn: '1h'
};

// Mock service implementation
const signinServiceMock = {
  execute: jest.fn().mockImplementation(async (signinDto: SigninDto): Promise<SigninOutput> => {
    // Validate input
    if (!signinDto.username || !signinDto.password) {
      throw new Error('Username and password are required');
    }

    if (signinDto.username !== validUser.username) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (signinDto.password !== 'testpassword123') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return validSigninOutput;
  })
};

describe('SigninController', () => {
  let controller: SigninController;
  let service: SigninService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigninController],
      providers: [
        {
          provide: SigninService,
          useValue: signinServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SigninController>(SigninController);
    service = module.get<SigninService>(SigninService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should call service.execute with correct parameters', async () => {
    await controller.handle(validSigninDto);

    expect(service.execute).toHaveBeenCalledWith(validSigninDto);
    expect(service.execute).toHaveBeenCalledTimes(1);
  });

  it('should return the expected response for valid credentials', async () => {
    const result: SigninOutput = await controller.handle(validSigninDto);

    expect(result).toEqual(validSigninOutput);
    expect(result.token).toBeDefined();
    expect(result.expiresIn).toBeDefined();
  });

  it('should handle user not found exception', async () => {
    const invalidUserDto: SigninDto = {
      username: 'nonexistentuser',
      password: 'testpassword123'
    };

    await expect(controller.handle(invalidUserDto)).rejects.toThrow(NotFoundException);
    expect(service.execute).toHaveBeenCalledWith(invalidUserDto);
  });

  it('should handle invalid credentials exception', async () => {
    const invalidPasswordDto: SigninDto = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    await expect(controller.handle(invalidPasswordDto)).rejects.toThrow(UnauthorizedException);
    expect(service.execute).toHaveBeenCalledWith(invalidPasswordDto);
  });

  it('should handle service exceptions gracefully', async () => {
    const serviceError = new Error('Database connection failed');
    signinServiceMock.execute.mockRejectedValueOnce(serviceError);

    await expect(controller.handle(validSigninDto)).rejects.toThrow(Error);
  });

  it('should handle empty username', async () => {
    const emptyUsernameDto: SigninDto = {
      username: '',
      password: 'testpassword123'
    };

    await expect(controller.handle(emptyUsernameDto)).rejects.toThrow();
  });

  it('should handle empty password', async () => {
    const emptyPasswordDto: SigninDto = {
      username: 'testuser',
      password: ''
    };

    await expect(controller.handle(emptyPasswordDto)).rejects.toThrow();
  });

  it('should handle null input', async () => {
    await expect(controller.handle(null as any)).rejects.toThrow();
  });

  it('should handle undefined input', async () => {
    await expect(controller.handle(undefined as any)).rejects.toThrow();
  });

  it('should return token with correct structure', async () => {
    const result: SigninOutput = await controller.handle(validSigninDto);

    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('should return expiresIn with correct structure', async () => {
    const result: SigninOutput = await controller.handle(validSigninDto);

    expect(typeof result.expiresIn).toBe('string');
    expect(result.expiresIn.length).toBeGreaterThan(0);
  });
}); 