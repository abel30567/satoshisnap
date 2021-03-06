var attnCounter = 0;
var eyeCounter = 0;
var lost = false;
var firstPlay = true;

var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var faceDec = false;
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    // height: '390',
    // width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
    // playerVars: {
    //   'autoplay': 0, 
    //   'controls': 0,
    //   'showinfo': 0,
    //   'listType': 'playlist',
    //   'list': '<YOURPLAYLISTID>'
    // }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // let player = event.target;

  // player.loadPlaylist('PLAlosoTOSU3zHRLG67G8h6BAVxp62Y6Za', 0, 'hd720');
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
  // WINNING
  // WINNING // WINNING // WINNING // WINNING// WINNING // WINNING // WINNING // WINNING

  if (event.data == YT.PlayerState.ENDED && !lost && faceDec === true) {
    var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+'/play/';
    var data = {};
    document.getElementById('startButton').style.zIndex = '1000';
    document.getElementById('playStatus').innerHTML = "Congrats you won 210 Satoshis! Click to play again";
    $.ajax({
      type: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
      },
      data: JSON.stringify(data),
      contentType: 'application/json',
        url: url,           
          success: function(data) {
            console.log('success');
          }
    });
    player.stopVideo();
  }
  
  if (event.data == YT.PlayerState.PLAYING) {
    console.log('playing video')
    document.getElementById('startButton').style.zIndex = '-1';
  } 
  else if (event.data == YT.PlayerState.PAUSED) {
    document.getElementById('startButton').style.zIndex = '1000';
  }
}

function playVideo() {
 // player.playVideo();
 if (detector && !detector.isRunning) {
    $('#logs').html('');
    detector.start();
    document.getElementById('playStatus').innerHTML = "Satoshi Snap node needs to sync. Please wait...";
  } else if (detector && detector.isRunning) {
    
    player.nextVideo();
    attnCounter = 0;
    eyeCounter = 0;
    lost = false;
    firstPlay = true;
  }

}

function playerLost() {
  player.stopVideo();
  document.getElementById('startButton').style.zIndex = '1000';
  document.getElementById('playStatus').innerHTML = "You smiled! Click to play again.";

  // if (detector && detector.isRunning) {
  //   detector.removeEventListener();
  //   detector.stop();
  // }
}

function retryWebcamAccess() {
  document.getElementById('startButton').style.display = 'block';
  document.getElementById('startButton').style.zIndex = '1000';
  document.getElementById('playStatus').innerHTML = "Satoshi Snap needs access to your webcam. Please refresh the page and try again.";
}


// ###############################################################################################
// ###############################################################################################
// ############################DETECT!############################################################
// ###############################################################################################
// ###############################################################################################

// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
let divRoot = $('#affdex_elements')[0];
let width = 640;
let height = 480;
let faceMode = affdex.FaceDetectorMode.LARGE_FACES;
// Construct a CameraDetector and specify the image width / height and face detector mode.
let detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
//   detector.detectAllEmotions();
//   detector.detectAllExpressions();
//  detector.detectAllEmojis();
//   detector.detectAllAppearance();
	  detector.detectExpressions.smile = true;
	  detector.detectEmotions.joy = true;
	  detector.detectExpressions.eyeClosure = true;
	  detector.detectExpressions.attention = true;


// Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener('onInitializeSuccess', () => {
        log('#logs', "The detector reports initialized");
        //Display canvas instead of video feed because we want to draw the feature points on it
        $("#face_video_canvas").css("display", "none");
        $("#face_video").css("display", "none");
      });

function log(node_name, msg) {
  $(node_name).append('<span>' + msg + '</span><br />');
}

// function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $('#logs').html('');
    detector.start();
  }
  log('#logs', 'GET READY!');
}

// function executes when the Stop button is pushed.
function onStop() {
  log('#logs', 'Clicked the stop button');
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }
}

      //function executes when the Reset button is pushed.
      function onReset() {
  log('#logs', 'Clicked the reset button');
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html('');
  }
}

      //Add a callback to notify when camera access is allowed
      detector.addEventListener('onWebcamConnectSuccess', () => {
        log('#logs', "SET");
      });

// Add a callback to notify when camera access is denied
detector.addEventListener('onWebcamConnectFailure', () => {
        log('#logs', "webcam denied");
        console.log("Webcam access denied");
        retryWebcamAccess();
      });

// Add a callback to notify when detector is stopped
detector.addEventListener('onStopSuccess', () => {
        log('#logs', "The detector reports stopped");
        $("#results").html("");
      });

// Add a callback to receive the results from processing an image.
// The faces object contains the list of the faces detected in an image.
// Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener('onImageResultsSuccess', (faces, image, timestamp) => {
        
        if (lost) {
          player.stopVideo(); // next video
          return;
        }
        // MAGIC HAPPENS HERE
        var joy = null;
        var attention = null;
        var eyeClosure = null;
        

        var joyAlert = false;

        if (firstPlay) {
          player.playVideo();
          firstPlay = false;
        }

        if (faces.length === 1) {
            // These are Numbers
            faceDec = true;
            joy = faces[0].emotions.joy;
            attention = faces[0].expressions.attention;
            eyeClosure = faces[0].expressions.eyeClosure;

            if (joy > 50) {
                lost = true;
                joy = 0;
                playerLost();
            } 
            if (attention < 40) {
                attnCounter += 1;
                // setInterval(console.log('attnCounter' + attnCounter), 50000);
            }
            else if (attention > 41) {
                attnCounter = 0;
            }
            if (eyeClosure > 80) {
                eyeCounter += 1;
                // setInterval(console.log('eyeCounter:' + eyeCounter), 50000);
            }
            else if (eyeClosure < 70) {
                eyeCounter = 0;
            }

            if (attnCounter > 50) {
                alert('LOOK AT SCREEN!!!');
                attnCounter = 0;
            }
            if (eyeCounter > 50) {
                alert('OPEN YOUR EYES!!!');
                eyeCounter = 0;
            }
        }
        
    
        $('#results').html("");
        log('#results', "Timestamp: " + timestamp.toFixed(2));
        log('#results', "Number of faces found: " + faces.length);
        if (faces.length > 0) {
          log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
          log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
            return val.toFixed ? Number(val.toFixed(0)) : val;
          }));
          log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
            return val.toFixed ? Number(val.toFixed(0)) : val;
          }));
        //   log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
        //   drawFeaturePoints(image, faces[0].featurePoints);
        }
		
      });

//   //Draw the detected facial feature points on the image
//   function drawFeaturePoints(img, featurePoints) {
//     var contxt = $('#face_video_canvas')[0].getContext('2d');

//     var hRatio = contxt.canvas.width / img.width;
//     var vRatio = contxt.canvas.height / img.height;
//     var ratio = Math.min(hRatio, vRatio);

//     contxt.strokeStyle = "#FFFFFF";
//     for (var id in featurePoints) {
//       contxt.beginPath();
//       contxt.arc(featurePoints[id].x,
//         featurePoints[id].y, 2, 0, 2 * Math.PI);
//       contxt.stroke();

//     }
//   }

// ]]> 
