import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  async validateAdmin(password: string) {
    //return password === process.env.ADMIN_PASS;
    return password === "password";
  }

  async login(session: any) {
    session.set("role", "admin");
  }
}
