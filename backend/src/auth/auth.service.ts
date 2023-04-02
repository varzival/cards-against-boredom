import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  validateAdmin(password: string) {
    return password === process.env.ADMIN_PW;
  }

  login(session: any) {
    session.set("role", "admin");
  }
}
