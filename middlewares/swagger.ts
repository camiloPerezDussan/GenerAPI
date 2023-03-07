import { Request, Response, NextFunction } from 'express';
import yaml from 'js-yaml';
import base64 from 'base-64';

const base64ToSwagger = (req: Request, res: Response, next: NextFunction) => {
    const doc =  base64.decode(req.body.data.swagger);
    req.body.data.swagger = doc;
    next();
}

const swaggerToJSON = (req: Request, res: Response, next: NextFunction) => {
    const doc =  yaml.load(req.body.data.swagger);
        req.body.data.swagger = doc;
    next();
}

export {
    base64ToSwagger,
    swaggerToJSON
}