import express from 'express';
import { base64ToSwagger, swaggerToJSON } from '../middlewares/swagger';
import { zipHeaders } from '../middlewares/reponse-headers';
import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';
import { Quarkus } from '../generators/quarkus';
import { Request, Response } from 'express';

const app = express();

/** agregar middleware para validar los datos requeridas del swagger ingresado */
app.post('/quarkus/generate', base64ToSwagger, swaggerToJSON, zipHeaders, async (req: Request, res: Response) => {
    const swagger = new Swagger(req.body.data.swagger);
    const manager = new FolderManager(`./outputs/${swagger.getTitle()}`);
    manager.removeFolder();
    const quarkus: Quarkus = new Quarkus(swagger, req.body.data.package, manager);
    await quarkus.make()
        .catch((err: Error) => { throw err });
    const response: Buffer = manager.zipFolder();
    manager.removeFolder();
    res.send(response);
});

export = app;