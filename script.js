const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');


var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';
  
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

      loginBtn.onclick = handleAuthClick;
      logoutBtn.onclick = handleAuthClick;
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
            loginBtn.style.display = 'none'
            logoutBtn.style.display = 'block'
        } else {
          loginBtn.style.display = 'blcok'
          logoutBtn.style.display = 'none'
        }
      }

      function updateSigninStatus() {
        setSigninStatus();
      }
    }
