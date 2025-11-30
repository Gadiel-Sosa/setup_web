// Variables globales
let scene, camera, renderer, model, controls, ambientLight;

// Inicializar Three.js
function initThreeJS() {
    const container = document.getElementById('viewer');

    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2A0F3A);

    // Crear cámara
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5);

    // Crear renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Añadir luces
    addLights();
    animatedRGB();   // arrancar efecto RGB en la luz ambiente

    // Controles sin auto-rotate
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    // Cargar modelo
    loadModel();

    // Resize
    window.addEventListener('resize', onWindowResize);

    // Bucle principal
    animate();
}

// Añadir luces
function addLights() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(10, 10, 10);
    directional.castShadow = true;
    scene.add(directional);
}

// Cargar modelo GLB
function loadModel() {
    const loader = new THREE.GLTFLoader();
    const modelPath = "assets/model/setup_dev_listo_n.glb";

    loader.load(
        modelPath,
        function (gltf) {
            model = gltf.scene;

            // Activar sombras
            model.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            scene.add(model);

            // VIDEO EN LA PANTALLA
            const pantalla = model.getObjectByName("pantalla_monitor");

            if (pantalla) {
                console.log("Pantalla encontrada ✔");

                const video = document.createElement("video");
                video.src = "assets/video/demo.mp4";
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.autoplay = true;
                video.play();

                const videoTex = new THREE.VideoTexture(video);
                videoTex.minFilter = THREE.LinearFilter;
                videoTex.magFilter = THREE.LinearFilter;

                // ajustes que ya usabas
                videoTex.rotation = Math.PI / 2;
                videoTex.center.set(0.5, 0.5);
                pantalla.scale.x = -1;
                videoTex.flipY = false;

                pantalla.material = new THREE.MeshBasicMaterial({
                    map: videoTex
                });
            } else {
                console.warn("pantalla_monitor NO encontrada");
            }

            // Centrar modelo y animación de entrada
            centerModel();
            introAnimation();

            hideLoading();
        },

        // progreso
        function (xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(1);
            updateLoading(percent);
        },

        function (error) {
            console.error("Error cargando modelo:", error);
            showError("No se pudo cargar el modelo.");
        }
    );
}

// Centrar el modelo y ajustar cámara
function centerModel() {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // poner el modelo sobre el "piso"
    model.position.y -= box.min.y;

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 0.19; // que no sea 0

    camera.position.set(distance, distance * 1.9, distance);
    camera.lookAt(center);

    controls.target.copy(center);
    controls.update();
}

// Animación de entrada del modelo (pop-in suave)
function introAnimation() {
    if (!model) return;

    model.scale.set(0.001, 0.001, 0.001);  // empieza muy pequeño
    model.position.y -= 2;                 // empieza más abajo

    let t = 0;
    function step() {
        if (t < 1) {
            t += 0.02;
            const ease = t * t * (3 - 2 * t); // suavizado

            const s = THREE.MathUtils.lerp(0.001, 1, ease);
            model.scale.set(s, s, s);

            const y = THREE.MathUtils.lerp(-2, 0, ease);
            model.position.y = y;

            requestAnimationFrame(step);
        }
    }
    step();
}

// Bucle de render
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Resize
function onWindowResize() {
    const container = document.getElementById("viewer");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// UI load
function hideLoading() {
    const el = document.querySelector(".loading");
    if (el) el.style.display = "none";
}

function updateLoading(p) {
    const el = document.querySelector(".loading");
    if (el) el.innerText = `Cargando modelo 3D... ${p}%`;
}

function showError(msg) {
    const el = document.querySelector(".loading");
    if (el) {
        el.innerText = msg;
        el.style.background = "#e74c3c";
        el.style.color = "#fff";
    }
}

// RGB dinámico en la luz ambiente
let t = 0;
function animatedRGB() {
    t += 0.01;
    const r = Math.sin(t) * 0.5 + 0.5;
    const g = Math.sin(t + 2) * 0.5 + 0.5;
    const b = Math.sin(t + 4) * 0.5 + 0.5;
    if (ambientLight) {
        ambientLight.color.setRGB(r, g, b);
    }
    requestAnimationFrame(animatedRGB);
}
function recenterCamera() {
    if (!model) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 0.19;

    camera.position.set(distance, distance * 1.9, distance);
    camera.lookAt(center);

    controls.target.copy(center);
    controls.update();
}


// Iniciar
window.onload = initThreeJS;
