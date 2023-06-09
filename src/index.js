import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import mainRoute from './routes/index.js'
import { config } from './config/envConfig.js';
import session from 'express-session';
import { createHash } from'./utils/bcrypt.js';
import errorHandler from './middlewares/errorHandler.js';
import compression from 'express-compression';
import cors from 'cors';
import { addLogger } from './middlewares/logger.js';

const app = express();

const corsOptions = {
    origin: config.nodeEnv == 'development' ? 'http://localhost:8080/' : 'https://my.web.com',
    optionsSuccessStatus: 200
}

app.use(addLogger);
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({
    secret: createHash('secretoConHashRandom'),
    resave: false,
    saveUninitialized: false
}));

app.engine('.hbs', engine({ extname: '.hbs', defaultLayout: 'main.hbs' }));
app.set('view engine', '.hbs');

// Routes

app.use('/', mainRoute);
app.use(errorHandler);

const server = app.listen(config.port, () => console.log(`Server running on port: ${config.port}`));
server.on('error', error => console.log(error));

mongoose.connect(config.mongooseApiKey)
    .then(res => console.log('Database connected'))
    .catch(error => {
        console.log("Cannot connect to database: " + error);
        process.exit();
    });