const mainContainer = document.getElementById('main-container');
const channelInput = document.getElementById('channel-input');
const channelForm = document.getElementById('channel-form');
const channelData = document.getElementById('channel-data');
const videoPlayer = document.getElementById('video-player');
const videoContainer = document.getElementById('video-container');



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
      $('#revoke-access-button').click(function() {
        revokeAccess();
      });
      
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
          videoPlayer.style.display = 'block';
          videoContainer.style.display = 'block';
          channelData.style.display = 'block';
          channelForm.style.display = 'block';


        } else {
          $('#sign-in-or-out-button').html('Sign In/Authorize');
          $('#revoke-access-button').css('display', 'none');
          videoPlayer.style.display = 'none';
          videoContainer.style.display = 'none';
          channelData.style.display = 'none';
          channelForm.style.display = 'none';
        }
        
      }

      function updateSigninStatus() {
        setSigninStatus();
      }
    }


    channelForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const channel = channelInput.value;
      getChannel(channel);

    });

    function showChannelData(data){
      const channelData = document.getElementById('channel-data');
      channelData.innerHTML = data;
    }

    function getChannel(channel){
       gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
      })
      .then(response => {
        console.log(response);
        const channel = response.result.items[0];

        const output = `
        <ul class="collection">
          <li class="collection-item">Title: ${channel.snippet.title}</li>
          <li class="collection-item">ID: ${channel.id}</li>
          <li class="collection-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
          <li class="collection-item">Views: ${
            numberWithCommas(channel.statistics.viewCount)}</li>
          <li class="collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}
          </ul>
          <p>${channel.snippet.description}</p>
          <a class="btn btn-danger" target="-blank" href="https://youtube.com/channel/${channel.id}">Visit Channel</a>
          <button class="btn btn-danger">Subscribe</button>`;
          showChannelData(output);

          const playlistId = channel.contentDetails.relatedPlaylists.uploads;
          requestVideoPlaylist(playlistId);
      })
      .catch(err => alert('No Channel by that name'))
    }

    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

   

  function requestVideoPlaylist(playlistId){
    const requestOptions = {
      playlistId: playlistId,
      part: 'snippet',
      maxResults: 10
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response =>{
      console.log(response);

      const playListItems = response.result.items;
      if(playListItems){
        let output  = '<br><h4 style="text-align: center;">Latest Vidoes</h4>';

        playListItems.forEach(item =>{
          const videoId = item.snippet.resourceId.videoId;

          output += `
          <div class="col-12">
          <iframe width="210" height="118" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen"></iframe>
          </div>
         `;

        })

        videoContainer.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/r-yxNNO1EI8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen id="video-player"></iframe>'
          + '<div class="row">' + output;
      }else{
        videoContainer.innerHTML = 'No uploaded Videos'
      }
    })
  }
