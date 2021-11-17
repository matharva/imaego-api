require('dotenv/config');
const express = require('express');
const app = express();
const moment = require('moment-timezone');
const morgan = require('morgan');
const path = require('path');
const db = require('./connection');
const CustomError = require('./bin/custom/error');
const bodyParser = require('body-parser');

db.authenticate()
  .then(async () => {
    await db.sync();
    console.log('Database is connected...');
  })
  .catch((err) => {
    console.log(`Database Error :${err}`);
  });

//******* Associations ******\\
const User = require('./bin/models/user');
const Tokens = require('./bin/models/tokens');
const Otp = require('./bin/models/otp');
const Talent = require('./bin/models/talent');
const Blog = require('./bin/models/blog');
const Images = require('./bin/models/images');
const Social = require('./bin/models/social');
const Relation = require('./bin/models/relation');
const Homepage = require('./bin/models/homepage');

User.hasMany(Tokens, { onDelete: 'cascade', foreignKey: 'user_id' });
User.hasMany(Otp, { onDelete: 'cascade', foreignKey: 'user_id' });
Talent.hasMany(Images, { onDelete: 'cascade', foreignKey: 'talent_id' });
Blog.hasMany(Images, { onDelete: 'cascade', foreignKey: 'blog_id' });
Talent.hasMany(Social, { onDelete: 'cascade', foreignKey: 'talent_id' });
Talent.hasMany(Relation, { onDelete: 'cascade', foreignKey: 'talent_id' });
Images.hasMany(Relation, { onDelete: 'cascade', foreignKey: 'image_id' });
Blog.hasMany(Relation, { onDelete: 'cascade', foreignKey: 'blog_id' });
Images.hasMany(Homepage, { onDelete: 'cascade', foreignKey: 'image_id' });

Tokens.belongsTo(User, { foreignKey: 'user_id' });
Otp.belongsTo(User, { foreignKey: 'user_id' });
Images.belongsTo(Talent, { foreignKey: 'talent_id' });
Images.belongsTo(Blog, { foreignKey: 'blog_id' });
Social.belongsTo(Talent, { foreignKey: 'talent_id' });
Relation.belongsTo(Talent, { foreignKey: 'talent_id' });
Relation.belongsTo(Images, { foreignKey: 'image_id' });
Relation.belongsTo(Blog, { foreignKey: 'blog_id' });
Homepage.belongsTo(Images, { foreignKey: 'image_id' });

//******* SETTING CORS HEADER *******\\
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

//******* HIDING EXPRESS *******\\
app.set('x-powered-by', false);
app.use(function (req, res, next) {
  res.header('Efforts', ':)');
  next();
});

//******* MIDDLEWARES *******\\
app.use(
  morgan(function (tokens, req, res) {
    let dates = moment.tz(Date.now(), 'Asia/Kolkata').toString().split(' ');
    return [
      req.headers.ip,
      dates[2] + dates[1].toUpperCase() + dates[3].slice(-2),
      dates[4],
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  })
);
app.use(express.json());
app.use(express.urlencoded());
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));
// app.use(require('body-parser').json({ limit: '100mb' }));

//******* IMPORTING THE ROUTES *******\\
const adminRoutes = require('./bin/routes/admin');
const blogRoutes = require('./bin/routes/blog');
const talentRoutes = require('./bin/routes/talent');
const imageRoutes = require('./bin/routes/image');
const homepageRoutes = require('./bin/routes/homepage');

//******* USING THE ROUTES *******\\
app.use('/admin', adminRoutes);
app.use('/blog', blogRoutes);
app.use('/talent', talentRoutes);
app.use('/images', imageRoutes);
app.use('/homepage', homepageRoutes);
app.get('/getPage', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

//******* ERROR HANDLING *******\\
app.use((req, res, next) => {
  const error = new CustomError(
    'Not Found!',
    `Uh oh! the path you are trying to reach we can't find it, we've checked each an every corner!`,
    404
  );
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.code || 500).json({
    error: true,
    details: error,
  });
});

module.exports = app;
