import { Test, TestingModule } from "@nestjs/testing";
import { FindManyUsersController } from "./find-many-users.controller";
import { FindManyUsersService } from "../service/find-many-users.service";
import { FindManyUsersInput } from "../../dto/inputs/find-many-users.input";
import { FindManyUsersOutput } from "../../dto/outputs/find-many-users.output";

// Creating a reusable mock for the service
const mockFindManyUsersService = {
  execute: jest.fn(),
};

describe("FindManyUsersController", () => {
  let controller: FindManyUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindManyUsersController],
      providers: [
        {
          provide: FindManyUsersService,
          useValue: mockFindManyUsersService,
        },
      ],
    }).compile();

    controller = module.get<FindManyUsersController>(FindManyUsersController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call service.execute with provided query", async () => {
    const query: FindManyUsersInput = {
      ids: ["1", "2"],
      pagination: { skip: 0, take: 10 },
    };

    const mockResponse: FindManyUsersOutput = {
      users: [],
      hasNextPage: false,
      totalCount: 0,
    };

    mockFindManyUsersService.execute.mockResolvedValueOnce(mockResponse);

    await controller.handle(query);

    expect(mockFindManyUsersService.execute).toHaveBeenCalledWith(query);
  });

  it("should return the data returned by service.execute", async () => {
    const query: FindManyUsersInput = {
      ids: [],
      pagination: { skip: 0, take: 10 },
    };

    const mockUsers = [
      { id: "1", username: "john", balance: 100, birthdate: "2000-01-01" },
      { id: "2", username: "doe", balance: 200, birthdate: "2001-01-01" },
    ];

    const mockResponse: FindManyUsersOutput = {
      users: mockUsers,
      hasNextPage: false,
      totalCount: 2,
    };

    mockFindManyUsersService.execute.mockResolvedValueOnce(mockResponse);

    const result = await controller.handle(query);

    expect(result).toEqual(mockResponse);
  });

  it("should call service.execute exactly once per request", async () => {
    const query: FindManyUsersInput = {
      ids: [],
      pagination: { skip: 0, take: 10 },
    };

    const mockResponse: FindManyUsersOutput = {
      users: [],
      hasNextPage: false,
      totalCount: 0,
    };

    mockFindManyUsersService.execute.mockResolvedValueOnce(mockResponse);

    await controller.handle(query);

    expect(mockFindManyUsersService.execute).toHaveBeenCalledTimes(1);
  });

  it("should propagate errors thrown by the service", async () => {
    const query: FindManyUsersInput = {
      ids: [],
      pagination: { skip: 0, take: 10 },
    };

    const error = new Error("database error");
    mockFindManyUsersService.execute.mockRejectedValueOnce(error);

    await expect(controller.handle(query)).rejects.toThrow(error);
  });
});
