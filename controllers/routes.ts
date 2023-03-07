import express from 'express';
import quarkus from './quarkus';

const app = express();
app.use(quarkus);
export = app;