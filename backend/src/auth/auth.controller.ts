import { Body, Controller, Post, Session } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body, @Session() session: any) {
    console.log(body);
    console.log("SESSION BEFORE", session);
    if (this.authService.validateAdmin(body.password)) {
      this.authService.login(session);
      console.log("SESSION AFTER", session);
      return "success";
    }
  }
}
