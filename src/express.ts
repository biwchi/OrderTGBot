import "reflect-metadata";
import express, { Application, Handler } from "express";
import { controllers } from "./server/controllers";
import { MetadataKeys } from "./server/utils/metadata.keys";
import { IRouter } from "./server/utils/handlers.decorator";

class ExpressApplication {
  private readonly _instance: Application;

  get instance(): Application {
    return this._instance;
  }

  constructor() {
    this._instance = express();
    this._instance.use(express.json());

    this.registerRouters();
  }

  private registerRouters() {
    const info: Array<{ api: string; handler: string }> = [];

    controllers.forEach((controller) => {
      const constrollerInstance: { [handleName: string]: any } = controller.instance;
      const controllerClass = controller._class;

      const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
      const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

      const expressRouter = express.Router();

      routers.forEach(({ method, path, handlerName }) => {
        expressRouter[method](
          path,
          constrollerInstance[String(handlerName)].bind(constrollerInstance),
        );

        info.push({
          api: `${method.toLocaleUpperCase()} ${basePath + path}`,
          handler: `${controllerClass.name}.${String(handlerName)}`,
        });
      });

      this._instance.use(basePath, expressRouter);
    });

    console.table(info);
  }
}

export default new ExpressApplication();
