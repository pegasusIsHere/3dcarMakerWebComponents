function loadHTML(baseUrl, htmlRelativeUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    return fetch(htmlUrl).then((response) => response.text());
}

function getBaseURL() {
    return new URL('.', import.meta.url).href;
}

class carDesigner extends HTMLElement {
    constructor() {
        super();
        // Attaching shadow root without assigning it directly
        this.attachShadow({ mode: 'open' });
        this.baseURL = getBaseURL();
        
    }
    
    async connectedCallback() {
        console.log("connected")
        const STYLE = `<link rel="stylesheet" href="${this.baseURL + 'style.css'}">`;
        const HTML = await loadHTML(this.baseURL, 'index.html');
        // console.log(loadHTML())
        // Insert HTML and Canvas into Shadow DOM
        this.shadowRoot.innerHTML = `${STYLE}${HTML}`;
        this.animationGroup = null; // To store the animation group of the model
        this.mytag = "ayoubhofr"
        
        // Ensure #render element exists
        this.canvas = this.shadowRoot.querySelector('#render');
        if (!this.canvas) {
            console.error("Canvas element with ID 'render' not found in the loaded HTML.");
            return;
        }

        // Initialize the Babylon scene
        this.create3DVisualization();

    }

    // import animted model
    async importModels(scene, camera) {
        let car = null;
        let rimDesign1 = [];
        let rimDesign2 = [];
        // Utility function to load a model
        const loadModel = async (modelPath) => {
            return new Promise((resolve, reject) => {
                BABYLON.SceneLoader.ImportMesh("", modelPath, "", scene, (newMeshes) => {
                    resolve(newMeshes);
                }, null, (scene, message) => {
                    reject(`Failed to load model at ${modelPath}: ${message}`);
                });
            });
        };
    
        // Load the car model without rims
        try {
    
            const carModelPath = new URL('models/car_with_no_rim.glb', this.baseURL).href;
            const carMeshes = await loadModel(carModelPath);
    
            car = carMeshes[0]; // Assuming the main car mesh is the first one
            // change car color




            car.position = new BABYLON.Vector3(0, 0, 0);
            // car.scaling = new BABYLON.Vector3(1, 1, 1);
    
            // Optionally set the camera target
            // camera.target = car.position;
    
            console.log(`Car loaded: ${car.name}`);
        } catch (error) {
            console.error(error);
            return;
        }
    
        // Load the rim variations
        try {
            const rimPath = new URL('models/rim.glb', this.baseURL).href;
            const rimMeshes = await loadModel(rimPath);


            rimMeshes.forEach((mesh) => {
                console.log(mesh.name)
                if (mesh.name.includes("rim1")) {
                    // Parent the rim to the car for automatic transformation inheritance
                    // mesh.parent = car;
                    mesh.setEnabled(false)
                    rimDesign1.push(mesh);
                }
                if(mesh.name.includes("rim2")){
                    // mesh.parent = car;
                    mesh.setEnabled(false)
                    rimDesign2.push(mesh);
                }
            });

            rimDesign1.forEach(rim => { 
                rim.setEnabled(true);
            }
            )
            
            console.log(`Rims loaded: ${rimDesign1.length} variations found`);
        } catch (error) {
            console.error(error);
            return;
        }
    
        // Add buttons for rim switching
            const btn1 = this.shadowRoot.querySelector('#btn1');
            const btn2 = this.shadowRoot.querySelector('#btn2');
            console.log(btn1, btn2)
            if (btn1 && btn2) {
                btn1.addEventListener("click", () => {
                    if (rimDesign1[0]) {
                        rimDesign1.forEach(rim => {  
                            rim.setEnabled(false);
                        })
                        rimDesign2.forEach(rim => {
                            rim.setEnabled(true);
                        })
                    }
                });
        
                btn2.addEventListener("click", () => {
                    if (rimDesign2[0]) {
                        rimDesign2.forEach(rim => {
                            rim.setEnabled(false);
                        })
                        rimDesign1.forEach(rim => {
                            rim.setEnabled(true);
                        })
                    }
                });
            } else {
                console.error("Buttons btn1 or btn2 not found in the DOM.");
            }
            
    }
    

    create3DVisualization() {
        const engine = new BABYLON.Engine(this.canvas, true);
        const scene = new BABYLON.Scene(engine);

        // Set up free camera


        const camera = new BABYLON.FreeCamera("Camera",  new BABYLON.Vector3(0, 5, -5), scene);
        camera.attachControl(this.canvas, true);

        // Lighting
        const hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.5;

        // Ground
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 80, height: 80 }, scene);


        // Rotation animation for the camera
        // scene.onBeforeRenderObservable.add(() => {
        //     camera.alpha += 0.01;
        // });

        // Run the render loop
        this.importModels(scene,camera)
        engine.runRenderLoop(() => {
            scene.render();
        });

    }


    


}

customElements.define('car-designer', carDesigner);
