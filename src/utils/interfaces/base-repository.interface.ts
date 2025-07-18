
export interface BaseRepositoryInterface<T> {
  findOne(id: number | string): Promise<Partial<T>>;
  findMany(params: {
    pagination?: { skip: number; take: number };
    where?: Object;
  }): Promise<Partial<T>[]>;
  count(where?: Object): Promise<number>;
  create(data: Object): Promise<Partial<T>>;
  update(id: number | string, data: Object): Promise<Partial<T>>;
  delete(id: number | string): Promise<boolean>;
}
