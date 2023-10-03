import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

interface AuthBody {
  password: string;
  name: string;
  uniqueId: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post("login")
  async login(@Body() body: AuthBody, @Session() session: any) {
    if (
      this.authService.validateAdmin(body.password) &&
      body.name &&
      body.uniqueId
    ) {
      this.authService.login(session);
      await this.usersService.setUserAdmin(body.name, body.uniqueId);
      return "success";
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(AdminGuard)
  @Get("is_admin")
  async is_admin() {
    return true;
  }
}
