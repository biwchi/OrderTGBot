import { Composer, Scenes } from "telegraf";
import { ScenesId } from "../../scenes";
import { TGContext } from "../../../bot";
import { getOrderAddressesKeyboard } from '../../utils/keybords';

const selectOrderAddress = new Composer();

selectOrderAddress.on("text", async (ctx) => {
  const addressesButtons = await getOrderAddressesKeyboard()
  ctx.reply("Выберите точку", addressesButtons)
})

const setup = new Scenes.WizardScene<TGContext>(ScenesId.SETUP, selectOrderAddress);

export default setup