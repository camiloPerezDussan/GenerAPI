import express from 'express';
import { Request, Response } from 'express';
import { base64ToSwaggerObject } from '../middlewares/swagger';
import { zipHeaders } from '../middlewares/reponse-headers';
import { FolderManager } from '../commons/folder-manager';
import { Swagger } from '../commons/swagger';
import { Quarkus } from '../generators/quarkus-generator';

const app = express();

/** agregar middleware para validar los datos requeridas del swagger ingresado */
app.post('/quarkus/generate', base64ToSwaggerObject, zipHeaders, async (req: Request, res: Response) => {
    const swagger: Swagger = req.body.data.swagger
    const manager = new FolderManager(`./outputs/${swagger.getTitle()}`);
    const quarkus: Quarkus = new Quarkus(swagger, req.body.data.package, manager);
    await quarkus.make()
    res.send(manager.zipFolder());
});

export = app;