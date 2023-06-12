import express from 'express';
import quarkus from './quarkus-controller';

const app = express();
app.use(quarkus);
export = app;