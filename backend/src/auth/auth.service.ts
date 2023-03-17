import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  validateAdmin(password: string) {
    //return password === process.env.ADMIN_PASS;
    return password === "password";
  }

  login(session: any) {
    session.set("role", "admin");
  }
}
