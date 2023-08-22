import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import spotify from './spotify.ts';

const app = express();

app.use(express.static('dist'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

import api from './api.ts';
import { notFound, errorHandler } from './middlewares/errors.middleware.ts';

app.use('/api', api);
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is running on port ${process.env.PORT || 5000}`);
});