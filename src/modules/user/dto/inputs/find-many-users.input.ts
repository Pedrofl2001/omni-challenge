import { IsArray, IsObject, IsOptional, IsString } from "class-validator";

export class FindManyUsersInput {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsObject()
  pagination?: {
    skip: number;
    take: number;
  };
}