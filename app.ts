import express from 'express';
import { Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import cors from 'cors';
import './config/config';
import { corsOptions } from './config/cors';
import routes from './controllers/routes';

const app = express();
app.use(cors(corsOptions)); // application middleware
app.use(express.json());
app.use(routes);

app.use((err: Error, req: Request, res: Response) => { // Error handler application middleware 
    return (err instanceof ValidationError)
        ? res.status(err.statusCode).json(err)
        : res.status(500).json(err);
})

app.listen(process.env.PORT, () => {
    return console.log(`GenerAPI is listening at PORT ${process.env.PORT} :)`);
});