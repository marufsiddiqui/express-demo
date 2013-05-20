
/*
 * GET users listing.
 */

var checkUser = function (params) {
  return params.username === 'maruf' && params.password === 'maruf123'
};

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function (req, res) {
    res.render('login', {
      title: 'Login'
    });
};

exports.postLogin = function (req, res) {
  if (checkUser(req.body)) {
    res.send({
      username : req.body.username,
      password: req.body.password
    });
  } else {
    res.redirect('/login');
  }

};