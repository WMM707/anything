[README.md](https://github.com/user-attachments/files/24106242/README.md)
# Christmas Greeting Interactive Web Page

This project uses **Three.js** for 3D particle effects and **MediaPipe Hands** for hand tracking to create an interactive Christmas greeting.

## How to Run

Because this project uses the Camera API and ES Modules, it **cannot** be run by simply double-clicking `index.html`. It must be served via a local web server.

### Option 1: VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` and select "Open with Live Server".

### Option 2: Python Simple Server
1. Open a terminal in this directory.
2. Run: `python -m http.server`
3. Open your browser to `http://localhost:8000`.

## Controls

1. **Allow Camera Access** when prompted.
2. **Open Hand (Palm)**: Particles form the text "Merry Christmas 大王".
3. **Closed Hand (Fist)**: Particles form a 3D Christmas Tree.
4. **Move Hand Left/Right**: Rotates the Christmas Tree.

## Features
- **Particle Morphing**: Smooth transitions between text and tree shapes.
- **Hand Tracking**: Real-time gesture detection.
- **Atmosphere**: Falling snow and ambient pink dust particles.
- **Styles**: Metallic gold/silver text and traditional green/red/gold tree.
