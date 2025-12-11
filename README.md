[index.html](https://github.com/user-attachments/files/24106215/index.html)
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merry Christmas Interactive</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #000;
            font-family: sans-serif;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        #video-container {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 160px;
            height: 120px;
            z-index: 2;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 10px;
            overflow: hidden;
            transform: scaleX(-1); /* Mirror the video */
        }
        video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            z-index: 10;
            pointer-events: none;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div id="loading">Loading Magic...</div>
    <div id="canvas-container"></div>
    <div id="video-container">
        <video id="input_video" playsinline webkit-playsinline></video>
    </div>

    <!-- MediaPipe Hands -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>

    <!-- Three.js and Logic -->
    <script type="module" src="script.js"></script>
</body>
</html>
