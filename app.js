const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const logger = require('morgan');
const models = require('./models/index');
const exphbs  = require('express-handlebars');
const appRouter = require('./app/routes/appRoutes');
const appSocket = require('./app/socket/appSocket');

const db = require('./models');
global.db = db;

var app = express();

// db connection
models.sequelize.sync().then(() =>{
  console.log("DB 연결 성공");
}).catch(err => {
  console.log("DB 연결 실패",err);
});

// view engine setup
app.engine('.handlebars', exphbs({
  extname : '.handlebars',
  defaultLayout: 'main',
  layoutsDir : __dirname +'/views/layouts/',
  partialsDir: __dirname +'/views/partials/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session 설정
app.use(session({
  httpOnly: true,	//자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
  secure: true,	//https 환경에서만 session 정보를 주고받도록처리
  secret: 'secret key',	//암호화하는 데 쓰일 키
  resave: false,	//세션을 언제나 저장할지 설정함
  saveUninitialized: true,	//세션이 저장되기 전 uninitialized 상태로 미리 만들어 저장
  cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
    httpOnly: true,
    Secure: true
  },
  store: new FileStore()
}));

appRouter(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
