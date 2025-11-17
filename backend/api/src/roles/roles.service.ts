import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.rolesRepository.create({
      ...createRoleDto,
      isSystem: false,
    });

    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      order: { isSystem: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role has users
    const roleWithUsers = await this.rolesRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (roleWithUsers && roleWithUsers.users && roleWithUsers.users.length > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${roleWithUsers.users.length} user(s) are assigned to this role`,
      );
    }

    await this.rolesRepository.remove(role);
  }

  // Method to seed default system roles
  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Full system access',
        isSystem: true,
        permissions: { '*': true },
      },
      {
        name: 'moderator',
        description: 'Can view and manage users',
        isSystem: true,
        permissions: { 'users:read': true, 'users:list': true },
      },
      {
        name: 'user',
        description: 'Default user role',
        isSystem: true,
        permissions: { 'users:read:own': true },
      },
    ];

    for (const roleData of defaultRoles) {
      const exists = await this.findByName(roleData.name);
      if (!exists) {
        const role = this.rolesRepository.create(roleData);
        await this.rolesRepository.save(role);
      }
    }
  }
}
