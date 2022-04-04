const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.byToken = async function(token) {
  try {
    const payload = await jwt.verify(token, process.env.JWT)
    console.log('what is the payload: ', payload.id)
    // console.log(user)
    if(payload){
    const user = await User.findByPk(payload.id);
    return user;
    }

    const error = Error('bad credentials1');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials2');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username,
      password
    }
  });
  //const user = await dataValues
  //console.log(user)
  if(user){
    //const id = user.id
    const token = await jwt.sign( {id: user.id}, process.env.JWT );
    return {token}; 
  }
  const error = Error('bad credentials3');
  error.status = 401;
  throw error;
};

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};