var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

var uri = "neo4j://localhost:7687"
var user = "neo4j"
var password = "0000"


const neo4j = require('neo4j-driver')
console.log("debug", "heeeeey")
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
try{
  session = driver.session()
  session.writeTransaction(tx => {
    let streamResult = tx.run("match (a:MASHA) create (hello:world)-[:hey]->(masha:roma) return a")
    streamResult.subscribe({
      onNext: function (record) {
        // On receipt of RECORD
        for (var i in record) {
          console.log(i)
          console.log(record[i])
        }
      },
      onCompleted: function () {
        var summary = streamResult.summarize()
        // Print number of nodes created
        console.log('')
        console.log(summary.updateStatistics.nodesCreated())
      },
      onError: function (error) {
        console.log(error)
      }
    })

  })
} catch (a){}
const personName = 'Alice'



// on application exit:
 //driver.close()

module.exports = app;

