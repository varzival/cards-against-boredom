import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { AuthService } from "./auth.service";

@WebSocketGateway()
export class AuthGateway {
  constructor(private authService: AuthService) {}

  @SubscribeMessage("login")
  handleMessage(client: any, password: string): string {
    if (this.authService.validateAdmin(password)) {
      return "valid";
    } else {
      return "invalid";
    }
  }
}
