var express = require('express');
var cors = require('cors')
var querystring = require('querystring');
var request = require('request')
var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())

var client_id = ''
var client_secret = ''
var redirect_uri = 'http://localhost:3000/callback'

app.get('/login', function(req, res){
  // res.send('login')
  // res.redirect('http://globo.com')
  var scopes = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scopes,
      redirect_uri: redirect_uri
    })
  )
  // res.redirect('https://accounts.spotify.com/authorize' +
  // '?response_type=code' +
  // '&client_id=' + my_client_id +
  // (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  // '&redirect_uri=' + encodeURIComponent(redirect_uri));
})

app.get('/callback', function(req, res){
  var code = req.query.code || null;
  var state = req.query.state || null;
  var error = req.query.error || null;

  if (!error && code) {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    }
    request.post(authOptions, function(error, response, body){
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token  = body.refresh_token
            console.log(body)
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        request.get(options, function(error, response, body) {
          console.log(body);
        });
        res.redirect('/?' +
          querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
          })
        )
      }
    })
  }
})

app.get('/', function(req, res){
  res.send('oi')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});