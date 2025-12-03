/* ****Variables globales usadas en toda la aplicación**** */
/* Estas variables necesitan ser globales porque varias funciones las usan */
let scene;         /* Escena 3D donde se colocan todos los objetos */
let camera;        /* Cámara desde la cual observamos la escena */
let renderer;      /* Motor WebGL que dibuja todo en pantalla */
let model;         /* Modelo 3D cargado (.glb) */
let controls;      /* OrbitControls para mover la cámara con el mouse */
let ambientLight;  /* Luz ambiente, ilumina todo por igual */


/* ****Función principal: inicializa todo el sistema de Three.js**** */
/* Se ejecuta cuando carga la página */
function initThreeJS() {

    /* Obtenemos el contenedor HTML donde se va a renderizar el modelo */
    const container = document.getElementById('viewer');

    /* Crear escena vacía */
    scene = new THREE.Scene();

    /* Establecer color de fondo del canvas */
    scene.background = new THREE.Color(0x2A0F3A);

    /* Crear una cámara en perspectiva (como los ojos humanos) */
    camera = new THREE.PerspectiveCamera(
        75, /* Campo de visión en grados */
        container.clientWidth / container.clientHeight, /* Relación ancho/alto */
        0.1, /* Distancia mínima visible */
        1000 /* Distancia máxima visible */
    );

    /* Posición inicial de la cámara */
    camera.position.set(5, 5, 5);

    /* Crear el renderer de WebGL */
    renderer = new THREE.WebGLRenderer({
        antialias: true /* Activar suavizado de bordes */
    });

    /* Ajustar el tamaño del canvas */
    renderer.setSize(container.clientWidth, container.clientHeight);

    /* Activar sombras en el motor WebGL */
    renderer.shadowMap.enabled = true;

    /* Limpiar contenido previo del contenedor HTML */
    container.innerHTML = "";

    /* Insertar el canvas dentro del viewer */
    container.appendChild(renderer.domElement);

    /* Añadir luces a la escena */
    addLights();

    /* Activar animación RGB en la luz ambiente */
    animatedRGB();

    /* Crear OrbitControls (rotación de cámara con el mouse) */
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;  /* Movimiento suave/inercia */
    controls.dampingFactor = 0.05;  /* Cantidad de amortiguación */
    controls.autoRotate = false;    /* Si fuera true, giraría solo */

    /* Cargar el modelo GLB */
    loadModel();

    /* Ajustar cámara cuando cambia el tamaño de ventana */
    window.addEventListener('resize', onWindowResize);

    /* Comenzar bucle infinito de dibujo */
    animate();
}


/* ****Añadir luces a la escena**** */
function addLights() {

    /* Luz ambiente: ilumina todo parejo */
    ambientLight = new THREE.AmbientLight(
        0xffffff, /* Color blanco */
        0.7       /* Intensidad */
    );
    scene.add(ambientLight);

    /* Luz direccional: como un sol */
    const directional = new THREE.DirectionalLight(
        0xffffff, /* Color blanco */
        1         /* Intensidad */
    );

    /* Posición de la luz direccional */
    directional.position.set(10, 10, 10);

    /* Activar sombras desde esta luz */
    directional.castShadow = true;

    /* Añadir a la escena */
    scene.add(directional);
}


/* ****Cargar el modelo 3D GLB y configurar sus materiales**** */

function loadModel() {

    /* Crear el cargador de formato GLB */
    const loader = new THREE.GLTFLoader();

    /* Ruta del modelo */
    const modelPath = "assets/model/setup_dev_listo_n.glb";

    /* Cargar el modelo */
    loader.load(
        modelPath,

        /* Si carga bien, entra aquí */
        function (gltf) {

            /* Extraer escena 3D del archivo */
            model = gltf.scene;

            /* Recorrer todos los objetos dentro del modelo */
            model.traverse(obj => {
                /* Sólo actuar sobre los objetos de tipo Mesh */
                if (obj.isMesh) {
                    obj.castShadow = true;   /* El objeto proyecta sombras */
                    obj.receiveShadow = true;/* El objeto recibe sombras */
                }
            });

            /* Agregar el modelo completo a la escena */
            scene.add(model);

            /* ****Reemplazar textura de pantalla con un video**** */

            /* Buscar dentro del modelo un objeto llamado "pantalla_monitor" */
            const pantalla = model.getObjectByName("pantalla_monitor");

            if (pantalla) {

                /* Crear un elemento <video> invisible en HTML */
                const video = document.createElement("video");

                video.src = "assets/video/demo.mp4"; /* Ruta del video */
                video.loop = true;                  /* Repetir video */
                video.muted = true;                 /* Necesario para autoplay */
                video.playsInline = true;           /* Compatibilidad móviles */
                video.autoplay = true;              /* Iniciar siempre */
                video.play();                       /* Comenzar reproducción */

                /* Crear textura a partir del video */
                const videoTex = new THREE.VideoTexture(video);

                /* Ajustar filtros para evitar pixelación */
                videoTex.minFilter = THREE.LinearFilter;
                videoTex.magFilter = THREE.LinearFilter;

                /* Rotar textura 90° para alinearla con UVs del modelo */
                videoTex.rotation = Math.PI / 2;

                /* Establecer centro de rotación de la textura */
                videoTex.center.set(0.5, 0.5);

                /* Invertir la pantalla horizontalmente si el video se ve al revés */
                pantalla.scale.x = -1;

                /* Desactivar la inversión vertical de la textura */
                videoTex.flipY = false;

                /* Asignar la textura tipo video como material del mesh */
                pantalla.material = new THREE.MeshBasicMaterial({
                    map: videoTex /* Textura aplicada */
                });

            } else {
                /* Si no se encuentra el mesh de la pantalla */
                console.warn("pantalla_monitor NO encontrada");
            }

            /* Centrar el modelo para que aparezca correctamente */
            centerModel();

            /* Animación de entrada del modelo */
            introAnimation();

            /* Ocultar texto de carga */
            hideLoading();
        },

        /* Progreso de carga del modelo GLB */
        function (xhr) {
            /* Porcentaje cargado */
            const percent = (xhr.loaded / xhr.total * 100).toFixed(1);
            updateLoading(percent);
        },

        /* Si ocurre un error al cargar */
        function (error) {
            console.error("Error cargando modelo:", error);
            showError("No se pudo cargar el modelo.");
        }
    );
}


/* ****Centrar el modelo y ajustar la cámara automáticamente**** */

function centerModel() {

    /* Crear una caja envolvente alrededor del modelo */
    const box = new THREE.Box3().setFromObject(model);

    /* Obtener el punto central del modelo */
    const center = box.getCenter(new THREE.Vector3());

    /* Obtener tamaño del modelo en X, Y y Z */
    const size = box.getSize(new THREE.Vector3());

    /* Ajustar posición para que toque el piso (eje Y) */
    model.position.y -= box.min.y;

    /* Calcular la dimensión máxima del modelo */
    const maxDim = Math.max(size.x, size.y, size.z);

    /* Distancia ideal para la cámara usando esa dimensión */
    const distance = maxDim * 0.19;

    /* Cambiar posición de la cámara */
    camera.position.set(distance, distance * 1.9, distance);

    /* Apuntar la cámara al centro del modelo */
    camera.lookAt(center);

    /* Ajustar punto objetivo de los controles */
    controls.target.copy(center);
    controls.update();
}


/* ****Animación de entrada (pop-in suave del modelo)**** */

function introAnimation() {
    if (!model) return;

    /* El modelo inicia muy pequeño y un poco más abajo */
    model.scale.set(0.001, 0.001, 0.001); /* Escala inicial tiny */
    model.position.y -= 2;                /* Empezar debajo del piso */

    let t = 0; /* Progreso de la animación */

    function step() {

        /* Mientras t no llegue a 1, seguimos animando */
        if (t < 1) {
            t += 0.02; /* Velocidad de animación */

            /* Función de suavizado tipo ease */
            const ease = t * t * (3 - 2 * t);

            /* Interpolar escala desde 0.001 hasta 1 */
            const s = THREE.MathUtils.lerp(0.001, 1, ease);
            model.scale.set(s, s, s);

            /* Interpolar posición vertical desde -2 hasta 0 */
            const y = THREE.MathUtils.lerp(-2, 0, ease);
            model.position.y = y;

            /* Llamar este mismo frame */
            requestAnimationFrame(step);
        }
    }

    /* Iniciar animación */
    step();
}


/* ****Bucle principal que dibuja la escena 60 veces por segundo**** */

function animate() {

    /* Solicita llamar a animate() de nuevo en el próximo frame */
    requestAnimationFrame(animate);

    /* Actualizar movimiento suave del mouse en OrbitControls */
    controls.update();

    /* Dibujar toda la escena desde el punto de vista de la cámara */
    renderer.render(scene, camera);
}


/* ****Adaptar tamaño de renderer y cámara al cambiar tamaño de ventana**** */

function onWindowResize() {
    const container = document.getElementById("viewer");

    /* Cambiar relación de aspecto (importante para evitar distorsiones) */
    camera.aspect = container.clientWidth / container.clientHeight;

    /* Aplicar cambios en la matriz de proyección */
    camera.updateProjectionMatrix();

    /* Ajustar tamaño del canvas al nuevo tamaño */
    renderer.setSize(container.clientWidth, container.clientHeight);
}


/* ****Funciones de interfaz relacionadas con el mensaje de carga**** */

function hideLoading() {
    const el = document.querySelector(".loading");
    if (el) el.style.display = "none"; /* Ocultar */
}

function updateLoading(p) {
    const el = document.querySelector(".loading");
    if (el) el.innerText = `Cargando modelo 3D... ${p}%`;
}

function showError(msg) {
    const el = document.querySelector(".loading");
    if (el) {
        el.innerText = msg;
        el.style.background = "#e74c3c"; /* rojo error */
        el.style.color = "#fff";
    }
}


/* ****Animación RGB continua aplicada a la luz ambiente**** */

let t = 0; /* Tiempo incremental que genera el efecto */

function animatedRGB() {

    /* Aumentar tiempo para generar ondas seno */
    t += 0.01;

    /* Calcular valores RGB en onda sinusoidal */
    const r = Math.sin(t) * 0.5 + 0.5;
    const g = Math.sin(t + 2) * 0.5 + 0.5;
    const b = Math.sin(t + 4) * 0.5 + 0.5;

    /* Si existe la luz ambiente, aplicar color dinámico */
    if (ambientLight) {
        ambientLight.color.setRGB(r, g, b);
    }

    /* Repetir animación en el siguiente frame */
    requestAnimationFrame(animatedRGB);
}


/* ****Función llamada por el botón "Recentrar vista"**** */

function recenterCamera() {
    if (!model) return;

    /* Obtener caja envolvente del modelo */
    const box = new THREE.Box3().setFromObject(model);

    /* Centro del modelo */
    const center = box.getCenter(new THREE.Vector3());

    /* Tamaño del modelo */
    const size = box.getSize(new THREE.Vector3());

    /* Calcular dimensión más grande */
    const maxDim = Math.max(size.x, size.y, size.z);

    /* Calcular distancia adecuada */
    const distance = maxDim * 0.19;

    /* Reposicionar cámara */
    camera.position.set(distance, distance * 1.9, distance);
    camera.lookAt(center);

    /* Actualizar controles */
    controls.target.copy(center);
    controls.update();
}
const modeBtn = document.getElementById("b-mode");

    // Cargar modo guardado
    if (localStorage.getItem("light-mode") === "true") {
        document.body.classList.add("light-mode");
        modeBtn.textContent = "Modo oscuro";
    }

    // Cambiar modo
    modeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        const isLight = document.body.classList.contains("light-mode");
        localStorage.setItem("light-mode", isLight);

        modeBtn.textContent = isLight ? "Modo oscuro" : "Modo claro";
    });



/* ****Iniciar todo cuando la página haya cargado completamente**** */
window.onload = initThreeJS;
