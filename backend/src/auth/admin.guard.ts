import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { CanActivate } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const session = req.session;
    return session.get("role") === "admin";
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
