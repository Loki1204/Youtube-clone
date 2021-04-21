const loginBtn = document.getElementById('sign-in-or-out-button');

var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload';
  
  function handleClientLoad() {
    
    gapi.load('client:auth2', initClient);
  }

  function initClient() {
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';
    gapi.client.init({
        'apiKey': 'AIzaSyCMgbcwlUdRdlohbLQKReG0MtDtNu9f7pE',
        'clientId': '384795757441-1r3ui08t7vib6nrn369qn8d0efm71c31.apps.googleusercontent.com',
        'discoveryDocs': [discoveryUrl],
        'scope': SCOPE
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      GoogleAuth.isSignedIn.listen(updateSigninStatus);
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();
      
      $('#sign-in-or-out-button').click(function() {
        handleAuthClick();
      })
      
    });
      
    
      function handleAuthClick() {
        if (GoogleAuth.isSignedIn.get()) {
          GoogleAuth.signOut();
        } else {
          GoogleAuth.signIn();
        }
      }

      function revokeAccess() {
        GoogleAuth.disconnect();
      }

      function setSigninStatus() {
        var user = GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(SCOPE);
        if (isAuthorized) {
          $('#sign-in-or-out-button').html('Sign out');
          $('#revoke-access-button').css('display', 'inline-block');
          $('#auth-status').html('You are currently signed in and have granted ' +
              'access to this app.');
        } else {
          $('#sign-in-or-out-button').html('Sign In/Authorize');
          $('#revoke-access-button').css('display', 'none');
          $('#auth-status').html('You have not authorized this app or you are ' +
              'signed out.');
        }
        
      }

      function updateSigninStatus() {
        setSigninStatus();
      }
    }
