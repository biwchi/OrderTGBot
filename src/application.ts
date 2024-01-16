import express, { Application as ExpressApplication, Handler } from "express";
import "reflect-metadata";
import { menuControllers } from "./menu/controllers";
import { MetadataKeys } from "./utils/metadata.keys";
import { IRouter } from "./utils/handlers.decorator";
import { Controllers } from "./types";

class Application {
  private readonly _instance: ExpressApplication;

  get instance(): ExpressApplication {
    return this._instance;
  }

  constructor() {
    this._instance = express();
    this._instance.use(express.json());

    this.registerRouters();
  }

  private registerRouters() {
    this.mapRouters(menuControllers);
  }

  private mapRouters(controlles: Controllers) {
    const info: Array<{ api: string; handler: string }> = [];

    controlles.forEach((controller) => {
      const constrollerInstance: { [handleName: string]: Handler } = controller.instance;
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

export default new Application();
