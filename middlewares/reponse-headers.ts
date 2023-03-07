import { Request, Response, NextFunction } from 'express';

const zipHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${req.body.data.swagger.info.title}.zip`);
    next();
} 

export {
    zipHeaders
}