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

interface AuthBody {
  password: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: AuthBody, @Session() session: any) {
    if (this.authService.validateAdmin(body.password)) {
      this.authService.login(session);
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
