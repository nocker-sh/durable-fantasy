# Source of the creature models

The models and animations in this folder come from Mesh2Motion (https://github.com/Mesh2Motion/mesh2motion-app, `static/assets/`, commit ec0669b). Their art assets — 3D models, rigs and animations — are dedicated to the public domain under CC0 1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/).

- spider/model.glb, walk.glb, idle.glb: `spider/model.glb`, `spider/animations/walk.glb`, `spider/animations/idle.glb`
- snake/model.glb, walk.glb, idle.glb: `snake/model.glb`, `snake/animations/sidewinding.glb`, `snake/animations/idle.glb`
- trex/model.glb, walk.glb, idle.glb: `kaiju/variations/trex.glb`, `kaiju/animations/walk.glb`, `kaiju/animations/idle.glb`

The files are copied unchanged. The game uses only their bones and animation clips: it hangs its own plain blocks on the bones and does not draw the models' skins.
