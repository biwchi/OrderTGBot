import BaseContext from "./base-context";

import { OrderAddress, User } from "@prisma/client";
import { Scenes } from "telegraf";

export default interface SetupContext extends BaseContext {
  session: Scenes.WizardSession & {
    setupSession: {
      phoneNumber?: string;
      orderAddress?: OrderAddress;
      deliveryAddress?: string;
    };
    user: User;
  };

  scene: Scenes.SceneContextScene<SetupContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<SetupContext>;
}
