var express = require('express');
var router = express.Router();

let aggregated = require('../public/aggregated')

let neo4j = require('neo4j-driver')
var uri = "neo4j://localhost:7687"
var user = "neo4j"
var password = "0000"
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
session = driver.session()

async function getBd(){
  let result = await session.run(
      'MATCH (a) RETURN a'
  )
  console.log(result)
}

async function getClients(){
  let users = []
  let result = await session.run(
      'MATCH (a:USER) RETURN a'
  )
  for (let i in result.records){
    users.push(result.records[i].get(0).properties)
  }
  return users
}

async function getScooters(){
  let scooters = []
  let result = await session.run(
      'MATCH (a:SCOOTER) RETURN a'
  )
  for (let i in result.records){
    scooters.push(result.records[i].get(0).properties)
  }
  return scooters
}

async function getWarehouses(){
  let warehouses = []
  let result = await session.run(
      'MATCH (a:WAREHOUSE) RETURN a'
  )
  for (let i in result.records){
    warehouses.push(result.records[i].get(0).properties)
  }
  return warehouses
}

async function getTrips(){
  let trips = []
  let result = await session.run(
      'MATCH (a:TRIP) RETURN a'
  )
  for (let i in result.records){
    trips.push(result.records[i].get(0).properties)
  }
  return trips
}

async function getUnloadingAreas(){
  let unloading_areas = []
  let result = await session.run(
      'MATCH (a:UNLOADING_AREA) RETURN a'
  )
  for (let i in result.records){
    unloading_areas.push(result.records[i].get(0).properties)
  }
  return unloading_areas
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let cookies = req.cookies;
  if (!cookies.type) {
    res.render('login_page', {title: 'Login'});
  } else {
    res.redirect('/main')
  }
});

router.get('/main', (req, res) => {
  let type = req.cookies.type;
  if (type) {
    res.render('main_page', {title: "Main", type: type});
  } else {
    res.redirect('/');
  }
});

router.get('/tariffs', (req, res) => {
  res.render('tariffs', {title: 'Tarrifs'})
});

router.get('/rules', (req, res) => {
  res.render('rules', {title: 'Rules'})
});

router.get('/dbs', async (req, res) => {
  let users = await getClients()
  let scooters = await getScooters()
  let warehouses = await getWarehouses()
  let unloading_areas = await getUnloadingAreas()
  console.log(warehouses, unloading_areas)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('dbs', {title: 'Data Bases', users: users, scooters: scooters, warehouses: warehouses, unloading_area: unloading_areas})
  } else if (type === 'user') {
    res.redirect('/main');
  } else {
    res.redirect('/')
  }
});

router.get('/enterLogin', async (req, res) => {
  let user_type = 'no'
  let user_id = ''
  let logins = await getClients()
  //типа запрос к бд
  let login = req.query.login;
  let password = req.query.password;
  console.log(login, password)
  for (let i in logins){
    if (logins[i].login === login && logins[i].password === password){
      user_type = logins[i].type;
      user_id = logins[i].phone;
      break;
    }
  }
  //конец запроса

  res.cookie("type", user_type);
  res.cookie("user id", user_id);
  console.log(user_type)
  if (user_type === 'admin' || user_type === 'user'){
    res.redirect('/main')
  } else {
    var alert = require('alert');
    alert('Incorrect login or password');
    res.redirect('/')
  }
})

router.get('/aggregated', (req, res) => {
  let type = req.cookies.type;
  if (type === 'admin') {
    console.log("var = ", req.query.variant);
    let variant = req.query.variant;
    if (variant === '0'){
      let keys = Object.keys(aggregated[0][0])
      res.render('table', {title: 'Пользователи, которые больше всего ломают самокаты', keys: keys, data: aggregated[0]})
    } else if (variant === '1') {
      let keys = Object.keys(aggregated[1][0])
      res.render('table', {title: 'Пользователи, у которых давно не было поздок', keys: keys, data: aggregated[1]})
    } else {
      let keys = Object.keys(aggregated[2][0])
      res.render('table', {title: 'Самые далекие от складов самокаты', keys: keys, data: aggregated[2]})
    }
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/clients', async (req, res) => {
  let users = await getClients()
  //getBd()
  let keys = Object.keys(users[0])
  console.log(keys)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Пользователи', keys: keys, data: users});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
  //отделить клиентов от админов? Нужно ли выводить пароли?
});

router.get('/scooters', async (req, res) => {
  let scooters = await getScooters()
  console.log(scooters)
  let keys = Object.keys(scooters[0])
  console.log(keys)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Самокаты', keys: keys, data: scooters});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/warehouses', async (req, res) => {
  let warehouses = await getWarehouses()
  let keys = Object.keys(warehouses[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Склады', keys: keys, data: warehouses});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/unloading_area', async (req, res) => {
  let unloading_areas = await getUnloadingAreas()
  let keys = Object.keys(unloading_areas[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Площадки выгрузки', keys: keys, data: unloading_areas});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/trips', async (req, res) => {
  let trips = await getTrips()
  let keys = Object.keys(trips[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Площадки выгрузки', keys: keys, data: trips});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/exit', (req, res) => {
  res.clearCookie('type');
  res.clearCookie('user id');
  res.redirect('/')
});

async function attachedToScooters(scooter){
  let attachedToScooters = []
  let result = await session.run(
      'Match(t:SCOOTER{number: $number}) Match p=(n:TECH_CARD)-[:TALKS_ABOUT]-(t) with n, collect(nodes(p)) as listOflistOfnodes unwind listOflistOfnodes as list unwind list as element return collect(distinct element) as distinctNodes;',
      {number: scooter}
  )

  attachedToScooters.push(result.records[0].get(0)[0].properties)
  attachedToScooters.push(result.records[0].get(0)[1].properties)
  return attachedToScooters
}

async function attachedToUser(user){

}

router.get('/free-choice', async (req, res) => {
  console.log("query:\n", req.query)
  if (req.query.scooters)
    for (let i in req.query.scooters){
      let scooters = await attachedToScooters(req.query.scooters[i])
      console.log(scooters)
    }
  if (req.query.users)
    console.log(req.query.users)
  if (req.query.warehouses)
    console.log(req.query.warehouses[0].number)
  if (req.query.unloading_areas)
    console.log(req.query.unloading_areas[0].number)
  res.redirect('/dbs')
});

module.exports = router;
