<script lang="ts">
    import { browser } from "$app/environment";
    import { env } from "$env/dynamic/public";
    import { createToolkit } from "$lib";
    import { SermasToolkit } from "@sermas/toolkit";
    import { onDestroy, onMount } from "svelte";
    import * as THREE from "three";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import { XRButton } from "three/examples/jsm/webxr/XRButton";
    import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
    // import backpack from '$lib/assets/models/backpack.glb';
    // import scissors from '$lib/assets/models/scissors.glb';
    import qrcode1 from "$lib/assets/images/qrcode1.png";
    import qrcode2 from "$lib/assets/images/qrcode2.png";
    import { PlatformAppDto } from "@sermas/toolkit";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

    export let data;

    let toolkit: SermasToolkit;
    let apps: PlatformAppDto[] = [];
    let container;
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let controller1: THREE.XRTargetRaySpace,
        controller2: THREE.XRTargetRaySpace;
    let controllerGrip1, controllerGrip2;
    let positionMesh1 = false,
        positionMesh2 = false;
    let mesh1: THREE.Object3D, mesh2: THREE.Object3D;
    let framePositioning1 = 0,
        framePositioning2 = 0; // maybe can be deleted
    const framesForInitialPositioning = 10000000000000000; // maybe can deleted

    let raycaster: THREE.Raycaster;

    const intersected: any = [];
    const tempMatrix = new THREE.Matrix4();
    // const modelsPath = [ './static/backpack.glb', './static/scissors.glb' ];

    let controls;
    let group: THREE.Group;

    async function init() {
        container = document.createElement("div");
        document.body.appendChild(container);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080);

        camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            10,
        );
        camera.position.set(0, 1.6, 3);

        controls = new OrbitControls(camera, container);
        controls.target.set(0, 1.6, 0);
        controls.update();

        const floorGeometry = new THREE.PlaneGeometry(6, 6);
        const floorMaterial = new THREE.ShadowMaterial({
            opacity: 0.25,
            blending: THREE.CustomBlending,
            transparent: false,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        scene.add(new THREE.HemisphereLight(0xbcbcbc, 0xa5a5a5, 3));

        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(0, 6, 0);
        light.castShadow = true;
        light.shadow.camera.top = 3;
        light.shadow.camera.bottom = -3;
        light.shadow.camera.right = 3;
        light.shadow.camera.left = -3;
        light.shadow.mapSize.set(4096, 4096);
        scene.add(light);

        group = new THREE.Group();
        scene.add(group);

        //

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        container.appendChild(renderer.domElement);

        const loader = new GLTFLoader();

        loader.load(
            // modelsPath[ 1 ],
            "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
            (gltf) => {
                mesh1 = gltf.scene;
                mesh1.visible = false;
                mesh1.matrixAutoUpdate = false;
                mesh1.name = "mesh-draggable";
                scene.add(mesh1);
                group.add(mesh1);
                console.log("mesh1: ", mesh1);
            },
            function (xhr) {},
            function (error) {
                console.log(error);
            },
        );

        loader.load(
            //modelsPath[ 0 ],
            "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
            (gltf) => {
                mesh2 = gltf.scene;
                mesh2.visible = false;
                mesh2.matrixAutoUpdate = false;
                mesh2.name = "mesh-droppable";
                scene.add(mesh2);
                group.add(mesh2);
                console.log("mesh2: ", mesh2);
            },
            function (xhr) {},
            function (error) {
                console.log(error);
            },
        );

        const qr1 = document.getElementById("qr1");
        const qr1Bitmap = await createImageBitmap(qr1);

        const qr2 = document.getElementById("qr2");
        const qr2Bitmap = await createImageBitmap(qr2);

        document.body.appendChild(
            XRButton.createButton(renderer, {
                requiredFeatures: ["image-tracking"], // notice a new required feature
                trackedImages: [
                    {
                        image: qr1Bitmap, // tell webxr this is the image target we want to track
                        widthInMeters: 2.0, // in meters what the size of the PRINTED image in the real world
                    },
                    {
                        image: qr2Bitmap, // tell webxr this is the image target we want to track
                        widthInMeters: 2.0, // in meters what the size of the PRINTED image in the real world
                    },
                ],
                //this is for the mobile debug
                optionalFeatures: [
                    "dom-overlay",
                    "dom-overlay-for-handheld-ar",
                ],
                domOverlay: {
                    root: document.body,
                },
            }),
        );

        // controllers

        controller1 = renderer.xr.getController(0);
        controller1.addEventListener("selectstart", onSelectStart);
        controller1.addEventListener("selectend", onSelectEnd);
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener("selectstart", onSelectStart);
        controller2.addEventListener("selectend", onSelectEnd);
        scene.add(controller2);

        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1),
        );
        scene.add(controllerGrip1);

        controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
            controllerModelFactory.createControllerModel(controllerGrip2),
        );
        scene.add(controllerGrip2);

        //

        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
        ]);

        const line = new THREE.Line(geometry);
        line.name = "line";
        line.scale.z = 5;

        controller1.add(line.clone());
        controller2.add(line.clone());

        raycaster = new THREE.Raycaster();

        //

        window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onSelectStart(event: any) {
        const controller = event.target;
        const intersections = getIntersections(controller);
        if (intersections.length > 0) {
            const intersection = intersections[0];
            const object = intersection.object;
            //object.material.emissive.b = 1;
            console.log("draggable object selected", object);
            controller.attach(object);
            controller.userData.selected = object;
        }
        controller.userData.targetRayMode = event.data.targetRayMode;
    }

    function onSelectEnd(event: any) {
        const controller = event.target;
        if (controller.userData.selected !== undefined) {
            const intersections = getIntersections(controller);
            if (intersections.length > 0) {
                const intersection = intersections[0];
                const object = intersection.object;
                console.log("drop in object:", object);
            }
            const object = controller.userData.selected;
            // object.material.emissive.b = 0;
            group.attach(object);
            controller.userData.selected = undefined;
        }
    }

    function getIntersections(controller: THREE.XRTargetRaySpace) {
        controller.updateMatrixWorld();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return raycaster.intersectObjects(group.children, true);
    }

    // function intersectObjects( controller ) {

    // // Do not highlight in mobile-ar

    // if ( controller.userData.targetRayMode === 'screen' ) return;

    // // Do not highlight when already selected

    // if ( controller.userData.selected !== undefined ) return;

    // const line = controller.getObjectByName( 'line' );
    // const intersections = getIntersections( controller );

    // if ( intersections.length > 0 ) {

    //     const intersection = intersections[ 0 ];

    //     const object = intersection.object;
    //     //object.material.emissive.r = 1;
    //     intersected.push( object );

    //     line.scale.z = intersection.distance;

    // } else {

    //     line.scale.z = 5;

    // }

    // }

    function cleanIntersected() {
        while (intersected.length) {
            const object = intersected.pop();
            //object.material.emissive.r = 0;
        }
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render(t, frame) {
        cleanIntersected();

        //  intersectObjects( controller1 );
        //  intersectObjects( controller2 );

        if (frame) {
            const results = frame.getImageTrackingResults(); //checking if there are any images we track
            //if we have more than one image the results are an array
            for (const result of results) {
                // The result's index is the image's position in the trackedImages array specified at session creation
                const imageIndex = result.index;

                // Get the pose of the image relative to a reference space.
                const referenceSpace = renderer.xr.getReferenceSpace();
                const pose = frame.getPose(result.imageSpace, referenceSpace);

                //checking the state of the tracking
                const state = result.trackingState;
                if (state == "tracked") {
                    // update the mesh when the image target is found
                    if (imageIndex === 0) {
                        if (
                            !positionMesh1 ||
                            framePositioning1 <= framesForInitialPositioning
                        ) {
                            //console.log( 'positioning mesh1..' );
                            positionMesh1 = true;
                            framePositioning1++;
                            mesh1.visible = true;
                            mesh1.matrix.fromArray(pose.transform.matrix);
                        }
                    } else {
                        if (
                            !positionMesh2 ||
                            framePositioning2 <= framesForInitialPositioning
                        ) {
                            //console.log( 'positioning mesh2..' );
                            positionMesh2 = true;
                            framePositioning2++;
                            mesh2.visible = true;
                            mesh2.matrix.fromArray(pose.transform.matrix);
                        }
                    }
                } else if (state == "emulated") {
                    if (imageIndex === 0) {
                        mesh1.visible = false;
                        positionMesh1 = false;
                        framePositioning1 = 0;
                    } else {
                        mesh2.visible = false;
                        positionMesh2 = false;
                        framePositioning2 = 0;
                    }
                }
            }
        }
        renderer.render(scene, camera);
    }

    onMount(async () => {
        if (!browser) return;
        toolkit = createToolkit({
            moduleId: "avatar",
        });

        apps = (await toolkit.getApi().getApps()) || [];
        apps = apps.filter((app) => app.appId !== "data-collection");

        init();
        animate();
    });

    onDestroy(() => {
        if (!browser) return;
    });
</script>

<img id="qr1" src={qrcode1} alt="qr1" style="display: none;" />
<img id="qr2" src={qrcode2} alt="qr2" style="display: none;" />

<style>
    @import "./main.css";
</style>
