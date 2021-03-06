const mainContainer = document.getElementById("main-container");
const channelInput = document.getElementById("channel-input");
const channelForm = document.getElementById("channel-form");
const channelData = document.getElementById("channel-data");
const videoContainer = document.getElementById("video-container");
const videoList = document.getElementById("videoList");
const subscriptions = document.getElementById("subscriptions");
const subscriptionsContainer = document.getElementById(
  "subscriptions-container"
);
const main = document.getElementById("main");

var GoogleAuth;
var SCOPE =
  "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload";

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  var discoveryUrl =
    "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";
  gapi.client
    .init({
      apiKey: "AIzaSyCMgbcwlUdRdlohbLQKReG0MtDtNu9f7pE",
      clientId:
        "384795757441-1r3ui08t7vib6nrn369qn8d0efm71c31.apps.googleusercontent.com",
      discoveryDocs: [discoveryUrl],
      scope: SCOPE,
    })
    .then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      GoogleAuth.isSignedIn.listen(updateSigninStatus);
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();

      $("#sign-in-or-out-button").click(function () {
        handleAuthClick();
      });
      $("#revoke-access-button").click(function () {
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
      $("#sign-in-or-out-button").html("Sign out");
      $("#revoke-access-button").css("display", "inline-block");
      videoContainer.style.display = "block";
      channelData.style.display = "block";
      channelForm.style.display = "block";
      subscriptions.style.display = "block";
      videoList.style.display = "block";
    } else {
      $("#sign-in-or-out-button").html("Sign In/Authorize");
      $("#revoke-access-button").css("display", "none");
      videoContainer.style.display = "none";
      channelData.style.display = "none";
      channelForm.style.display = "none";
      subscriptions.style.display = "none";
      videoList.style.display = "none";
    }
  }

  function updateSigninStatus() {
    setSigninStatus();
  }
}

channelForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const channel = channelInput.value;
  getChannel(channel);
});

function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;
}

function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: "snippet,contentDetails,statistics",
      forUsername: channel,
    })
    .then((response) => {
      const channel = response.result.items[0];

      const output = `
        <ul class="collection">
          <li class="collection-item">Title: ${channel.snippet.title}</li>
          <li class="collection-item">ID: ${channel.id}</li>
          <li class="collection-item">Subscribers: ${numberWithCommas(
            channel.statistics.subscriberCount
          )}</li>
          <li class="collection-item">Views: ${numberWithCommas(
            channel.statistics.viewCount
          )}</li>
          <li class="collection-item">Videos: ${numberWithCommas(
            channel.statistics.videoCount
          )}
          </ul>
          <p>${channel.snippet.description}</p>
          <a class="btn btn-danger" target="-blank" href="https://youtube.com/channel/${
            channel.id
          }">Visit Channel</a>
         `;
      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      requestVideoPlaylist(playlistId);
    })
    .catch((err) => alert("No Channel by that name"));
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function requestVideoPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 10,
  };

  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute((response) => {
    const playListItems = response.result.items;
    let id = playListItems[0].snippet.resourceId.videoId;
    let videoplayer;
    let playlist = "";
    mainVid(id);
    resultsLoop(playListItems);

    function mainVid(id) {
      videoplayer = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen id="video-player"></iframe>`;
      videoContainer.innerHTML = videoplayer;
    }

    function resultsLoop(playListItems) {
      playListItems.forEach((item) => {
        const thumbnails = item.snippet.thumbnails.default.url;
        const description = item.snippet.description.substring(0, 100);
        const videoId = item.snippet.resourceId.videoId;

        playlist += `
          
                    <article data-key="${videoId}">
                  <img src="${thumbnails}" alt="image">  
                  <div class="details">
                    <p>${description}</p>
                    </div>
                    </article>
                  
         `;
      });
    }

    videoList.innerHTML = playlist;

    let article = document.getElementsByTagName("article");
    for (let i = 0; i < article.length; i++) {
      article[i].onclick = () => {
        mainVid(article[i].dataset.key);
      };
    }
  });
}

subscriptions.onclick = function () {
  gapi.client.youtube.subscriptions
    .list({
      part: "snippet",
      mine: "true",
      maxResults: 50,
    })
    .then((response) => {
      let subscribedChannels = response.result.items;

      const subscriptionsContainer = document.getElementById(
        "subscriptions-container"
      );
      let result = "";
      subscribedChannels.forEach((subscribe) => {
        const channelName = subscribe.snippet.title;
        const channelId = subscribe.snippet.resourceId.channelId;

        result += `<div class="list-group">
        <a href="https://www.youtube.com/channel/${channelId}" target="_blank" class="list-group-item list-group-item-action" aria-current="true">
        ${channelName}</a>`;
      });

      subscriptionsContainer.innerHTML = result;
    });
};
