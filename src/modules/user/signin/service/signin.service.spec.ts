import { Test, TestingModule } from '@nestjs/testing';
import { SigninService } from './signin.service';
import { UserRepository } from '../../user.repository';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from 'src/modules/auth/dto/signin.dto';
import { SigninOutput } from '../../dto/outputs/signin.output';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

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

const mockUserRepository = {
  findOne: jest.fn()
};

const mockJwtService = {
  sign: jest.fn()
};

describe('SigninService', () => {
  let service: SigninService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<SigninService>(SigninService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
    
    mockJwtService.sign.mockReturnValue('jwt-token-here');
    process.env.JWT_EXPIRES_IN = '1h';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should successfully authenticate user with valid credentials', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result: SigninOutput = await service.execute(validSigninDto);

    expect(result).toEqual(validSigninOutput);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(validSigninDto.username);
    expect(bcrypt.compare).toHaveBeenCalledWith(validSigninDto.password, validUser.password);
    expect(mockJwtService.sign).toHaveBeenCalledWith({ username: validSigninDto.username });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.execute(validSigninDto)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(validSigninDto.username);
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.execute(validSigninDto)).rejects.toThrow(UnauthorizedException);
    expect(bcrypt.compare).toHaveBeenCalledWith(validSigninDto.password, validUser.password);
  });

  it('should create JWT token with correct payload', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.execute(validSigninDto);

    expect(mockJwtService.sign).toHaveBeenCalledWith({ username: validSigninDto.username });
  });

  it('should return correct expiresIn from environment variable', async () => {
    process.env.JWT_EXPIRES_IN = '2h';
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result: SigninOutput = await service.execute(validSigninDto);

    expect(result.expiresIn).toBe('2h');
  });

  it('should handle repository errors gracefully', async () => {
    const repositoryError = new Error('Database connection failed');
    mockUserRepository.findOne.mockRejectedValue(repositoryError);

    await expect(service.execute(validSigninDto)).rejects.toThrow(repositoryError);
  });

  it('should handle bcrypt errors gracefully', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

    await expect(service.execute(validSigninDto)).rejects.toThrow();
  });

  it('should handle JWT service errors gracefully', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockImplementation(() => {
      throw new Error('JWT signing failed');
    });

    await expect(service.execute(validSigninDto)).rejects.toThrow();
  });

  it('should work with different usernames', async () => {
    const differentUser = { ...validUser, username: 'differentuser' };
    const differentDto = { ...validSigninDto, username: 'differentuser' };
    
    mockUserRepository.findOne.mockResolvedValue(differentUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result: SigninOutput = await service.execute(differentDto);

    expect(result).toEqual(validSigninOutput);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith('differentuser');
  });

  it('should work with different passwords', async () => {
    const differentPassword = 'differentpassword123';
    const differentDto = { ...validSigninDto, password: differentPassword };
    
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result: SigninOutput = await service.execute(differentDto);

    expect(result).toEqual(validSigninOutput);
    expect(bcrypt.compare).toHaveBeenCalledWith(differentPassword, validUser.password);
  });

  it('should handle empty username', async () => {
    const emptyUsernameDto = { ...validSigninDto, username: '' };
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.execute(emptyUsernameDto)).rejects.toThrow(NotFoundException);
  });

  it('should handle empty password', async () => {
    const emptyPasswordDto = { ...validSigninDto, password: '' };
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.execute(emptyPasswordDto)).rejects.toThrow(UnauthorizedException);
  });

  it('should verify bcrypt comparison is called with correct parameters', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.execute(validSigninDto);

    expect(bcrypt.compare).toHaveBeenCalledWith(validSigninDto.password, validUser.password);
  });

  it('should return token and expiresIn in correct format', async () => {
    mockUserRepository.findOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result: SigninOutput = await service.execute(validSigninDto);

    expect(typeof result.token).toBe('string');
    expect(typeof result.expiresIn).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
    expect(result.expiresIn.length).toBeGreaterThan(0);
  });
}); 