# 🖥️ 3D Developer Portfolio — Blender + Three.js

This project is an **interactive 3D web portfolio** showcasing a developer setup modeled entirely in **Blender** and rendered in real time using **Three.js**.  
It combines 3D modeling, animation, and creative interaction — all inside the browser.

---

## 🔗 Quick Access

[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)  
[![Blender](https://img.shields.io/badge/Blender-F5792A?style=for-the-badge&logo=blender&logoColor=white)](https://www.blender.org/)  
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)  
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)](https://lenguajejs.com/javascript/)  

---

## 🎯 Project Overview

This web app loads a **3D room/desk setup** created from scratch in Blender, including:

- Desk, monitor, PC tower, lamp, chair and accessories  
- A functional computer screen that **plays a real video**  
- Soft lighting + RGB ambient animation  
- Smooth intro animation when the model appears  
- Interactive camera movement with OrbitControls  
- Background music  

The goal was to bring together **creative design + code**, demonstrating full control of:  
✔ 3D asset creation  
✔ Web   
✔ Scene lighting  
✔ Real-time rendering  
✔ JavaScript logic  

All of this without game engines — just the web.

---

## 🎨 Modeling (Blender)

The entire scene was modeled in **Blender**, a free and powerful 3D creation tool used for:

- Modeling  
- UV unwrapping  
- Texturing  
- Lighting  
- Exporting to `.glb` for web use  

I used basic and mid-level modeling techniques such as:

- Extrude  
- Bevel  
- Loop cuts  
- Shading smoothing  
- Object parenting  
- Scene optimization for export

The final result is a lightweight `.glb` file compatible with the browser.

---

## 💻 Development Environment

The project was coded with:

- **VS Code** for JavaScript + HTML + CSS  
- **Live Server** for local testing  
- **Three.js**   
- **OrbitControls and GLTFLoader modules**

Blender → GLB export → Imported into VS Code → Rendered with Three.js.

---

## 🌟 Key Features

### ✔ 1. Real-Time 3D Rendering  
The setup is displayed inside a WebGL canvas with lighting, shadows, and a draggable camera.

### ✔ 2. Animated Intro  
The model appears with a smooth scaling + elevation animation (`ease-in-out` style).

### ✔ 3. Monitor Video Playback  
A Three.js `VideoTexture` is used to display a real MP4 video inside the monitor mesh.

### ✔ 4. RGB Ambient Light  
An ambient light cycles through RGB colors automatically, giving the room a gaming atmosphere.

### ✔ 5. Responsive Camera Controls  
OrbitControls allow rotation, zoom, and smooth damping movement.

### ✔ 6. Background Music Buttons  
Two buttons let the user toggle relaxing background music.

---

## 📂 Project Structure
```txt
/
│── index.html
│── styles.css
│── script.js
│
├── assets/
│   ├── model/
│   │   └── setup_dev_listo_n.glb
│   ├── img/
│   │   └── Foto.jpg
│   ├── video/
│   │   └── demo.mp4
│   └── audio/
│       └── musica.mp3
```

## 🚀 How to Run the Project

1. Clone the repository:

```
https://github.com/Gadiel-Sosa/setup_web.git
```

2. Open the project in VS Code.

3. Run with Live Server:
```
npx live-server
```

4. Make sure the folder structure inside /assets matches the code.

5. Open index.html in your browser — and the 3D scene will load automatically.

