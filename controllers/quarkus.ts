import express from 'express';
import { base64ToSwagger, swaggerToJSON } from '../middlewares/swagger';
import { zipHeaders } from '../middlewares/reponse-headers';
import { FolderManager } from '../commons/folder-manager';
import { Quarkus } from '../make-api/quarkus';
import { Request, Response } from 'express';

const app = express();

// agregar middleware para validar los datos requeridas del swagger ingresado
app.post('/quarkus/generate', base64ToSwagger, swaggerToJSON, zipHeaders, async (req: Request, res: Response) => {
    const manager = new FolderManager(`./outputs/${req.body.data.swagger.info.title}`);
    manager.removeFolder();
    const quarkus: Quarkus = new Quarkus(req);
    await quarkus.makeQuarkusProject()
    .catch((err: Error) => { throw err });
    const response: Buffer = manager.zipFolder();
    manager.removeFolder();
    res.send(response);
});

export = app;