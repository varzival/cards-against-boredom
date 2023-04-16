import { Model } from "mongoose";

export interface IBaseService<CreateDTO, UpdateDTO, Type> {
  create: (CreateDTO) => Promise<Type>;
  findAll: (perPage: number, page: number) => Promise<Array<Type>>;
  findOne: (id: string) => Promise<Type>;
  update: (id: string, UpdateDTO) => Promise<Type>;
  remove: (id: string) => Promise<any>;
}

abstract class BaseService<CreateDTO, UpdateDTO, Type>
  implements IBaseService<CreateDTO, UpdateDTO, Type>
{
  constructor(private model: Model<Type>) {}

  async create(createDto: CreateDTO): Promise<Type> {
    return this.model.create(createDto);
  }

  async findAll(perPage: number = 0, page: number = 0): Promise<Array<Type>> {
    let query = this.model.find({}).sort({ _id: -1 });

    if (perPage) {
      query = query.limit(perPage).skip(perPage * page);
    }

    return query.exec();
  }

  async findOne(id: string): Promise<Type> {
    return this.model.findById(id).exec();
  }

  async update(id: string, updateDto: UpdateDTO): Promise<any> {
    return await this.model.findByIdAndUpdate(id, updateDto, {
      new: true
    });
  }

  async remove(id: string): Promise<any> {
    return await this.model.deleteOne({ _id: id }).exec();
  }
}

export default BaseService;
