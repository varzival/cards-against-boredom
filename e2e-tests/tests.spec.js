import { test } from "@playwright/test";
import { loginLogout } from "./testFunctions";

test("login/logout test", ({ page }) => loginLogout(page));
