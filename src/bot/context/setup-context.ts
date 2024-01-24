import { OrderAddress } from "@prisma/client";
import { Context, Scenes } from "telegraf";

export default interface SetupContext extends Context {
  session: Scenes.WizardSession & {
    setupSession: {
      phoneNumber?: string;
      orderAddress?: OrderAddress;
      deliveryAddress?: string;
      isSetup?: boolean;
    };
  };

  scene: Scenes.SceneContextScene<SetupContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<SetupContext>;
}
