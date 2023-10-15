const expect = require("@playwright/test").expect;

async function loginLogout(page) {
  let r = (Math.random() + 1).toString(36).substring(7);
  const name = "tester" + r;
  await page.goto("https://cab.varzival.eu/");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Los!" }).click();
  expect(
    await page.getByRole("heading", { name: "Warte... Lobby füllt sich..." })
  ).toBeVisible();
  expect(await page.getByLabel("Name")).not.toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();

  //await page.waitForTimeout(2000);

  //expect(await page.getByRole("button", { name: "Logout" })).not.toBeVisible();
  //expect(await page.getByLabel("Name")).toBeVisible();
  /*expect(
    await page.getByRole("heading", { name: "Warte... Lobby füllt sich..." })
  ).not.toBeVisible();*/
}

module.exports = { loginLogout };
