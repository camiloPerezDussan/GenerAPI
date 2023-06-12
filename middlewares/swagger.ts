import { Request, Response, NextFunction } from 'express';
import yaml from 'js-yaml';
import base64 from 'base-64';
import { Swagger } from '../commons/swagger';

const base64ToSwaggerObject = (req: Request, res: Response, next: NextFunction) => {
    req.body.data.swagger = new Swagger(yaml.load(base64.decode(req.body.data.swagger)));
    next();
}

export {
    base64ToSwaggerObject
}