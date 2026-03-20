const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const auth = require('./routes/auth');
const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');



const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// trust proxy
app.set('trust proxy', 1);

// Middlewares
app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,//10 mins
  max: 100
});
app.use(limiter);

app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());



app.set('query parser', 'extended');

// DB
connectDB();

// routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/bookings', bookings);

// setup server
const PORT = process.env.PORT || 5000;

// swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Campground Booking API',
      version: '1.0.0',
      description: 'REST API for campground booking system with user authentication and role-based access'
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication. Include in Authorization header as: Bearer <token>'
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.get('/api-docs', (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>

        <script>
          window.onload = () => {
            SwaggerUIBundle({
              url: window.location.origin + '/api-docs.json',
              dom_id: '#swagger-ui'
            });
          };
        </script>
      </body>
    </html>
  `);
});

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocs);
});


if (require.main === module) {
  const server = app.listen(
    PORT,
    console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT)
  );

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

module.exports = app;
