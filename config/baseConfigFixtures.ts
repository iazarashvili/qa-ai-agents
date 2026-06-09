import { test as base } from "@playwright/test";
import { BasePage } from "../pages/basePage";
import { NavigationPage } from "../pages/sport-page-header/navigationPage";

type Fixtures = {
  basePage: BasePage;
  navigationPage: NavigationPage;
};

export const test = base.extend<Fixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },
});
