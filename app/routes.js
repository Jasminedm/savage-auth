module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('datab').find({user: req.user.local.email}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            dataResult: result
          })
        })
    });
    app.get('/definiPage', isLoggedIn, function(req, res) {
      db.collection('datab').find({user: req.user.local.email}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('definiPage.ejs', {
          user : req.user,
          dataResult: result
        })
      })
  });

  app.get('/definiPageGo', async (req, res) => { 
    
})
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/sub', (req, res) => {
      db.collection('datab').findOne({user: req.user.local.email, word: req.body.userI}, (err, result) => {
        if (err) return console.log(err)
        if(result){
      res.render('definiPageGo.ejs', {
        dataResult : result,
        user: req.user
      })
    }else{
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${req.body.userI}`) 
    .then((res) => res.json())
    .then((data) => {
      let wordResult = data[0]["meanings"][0]['definitions'][0]['definition']
      db.collection('datab').save({user: req.user.local.email, word: req.body.userI, definition: wordResult 
      }, (err, result) => {
        console.log(wordResult)
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(307, '/sub')
    
    })
    })
    }
      })
      
    })
    
    

    

    app.put('/messages', (req, res) => {
      console.log(req.body)
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    // app.put('/thumbdown', (req, res) => {
    //   db.collection('messages')
    //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    //     $set: {
    //       thumbDown:req.body.thumbDown + 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

    app.delete('/messages', (req, res) => {
      db.collection('datab').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
