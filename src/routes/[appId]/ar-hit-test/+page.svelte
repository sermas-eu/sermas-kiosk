<script lang="ts">
    import { browser } from "$app/environment";
    import { env } from "$env/dynamic/public";
    import { createToolkit } from "$lib";
    import { SermasToolkit } from "@sermas/toolkit";
    import { PlatformAppDto } from "@sermas/toolkit";
    import { onDestroy, onMount } from "svelte";
    import * as THREE from "three";
    import { ARButton } from "three/examples/jsm//webxr/ARButton";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

    let { data } = $props();

    let toolkit: SermasToolkit;
    let apps: PlatformAppDto[] = [];
    let objectsCount = 0;
    let maxVisibleObjects = 2;
    let container;
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let controller1: any, controller2: any;
    let controllerGrip1, controllerGrip2;

    let reticle: THREE.Mesh;

    let hitTestSource: any = null;
    let hitTestSourceRequested = false;

    let raycaster: THREE.Raycaster;

    const intersected: any = [];
    const tempMatrix = new THREE.Matrix4();

    let controls;
    let group: THREE.Group;

    function init() {
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

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        container.appendChild(renderer.domElement);

        document.body.appendChild(
            ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }),
        );

        // controllers
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener("selectstart", onSelectStart);
        controller1.addEventListener("selectend", onSelectEnd);
        controller1.addEventListener("select", onSelect);
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

        reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial(),
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);

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

        window.addEventListener("resize", onWindowResize);
    }

    //on tap screen
    function onSelect() {
        if (reticle.visible) {
            if (objectsCount < maxVisibleObjects) {
                const obj =
                    objectsCount === 0
                        ? new THREE.BoxGeometry(0.5, 0.5, 0.5).translate(
                              0,
                              0.1,
                              0,
                          )
                        : new THREE.ConeGeometry(0.2, 0.2, 64).translate(
                              0,
                              0.1,
                              0,
                          );
                const material = new THREE.MeshPhongMaterial({
                    color: 0xffffff * Math.random(),
                });
                const mesh = new THREE.Mesh(obj, material);
                reticle.matrix.decompose(
                    mesh.position,
                    mesh.quaternion,
                    mesh.scale,
                );
                mesh.scale.y = Math.random() * 2 + 1;
                group.add(mesh);
                objectsCount++;
            }
        } else {
            console.log("Point camera to a surface!");
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onSelectStart(event: any) {
        const controller = event.target;
        const intersections = getIntersections(controller);
        console.log("intersection on select start:", intersections);
        if (intersections.length > 0) {
            const intersection = intersections[0];
            const object: any = intersection.object;
            object.material.emissive.b = 1;
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
                console.log("drop with intersection");
            }
            const object: any = controller.userData.selected;
            object.material.emissive.b = 0;
            group.attach(object);
            controller.userData.selected = undefined;
        }
    }

    function getIntersections(controller: any) {
        controller.updateMatrixWorld();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return raycaster.intersectObjects(group.children, false);
    }

    function intersectObjects(controller: any) {
        if (controller.userData.selected !== undefined) return;
        const line = controller.getObjectByName("line");
        const intersections = getIntersections(controller);
        if (intersections.length > 0) {
            const intersection = intersections[0];
            const object = intersection.object;
            intersected.push(object);
            line.scale.z = intersection.distance;
        } else {
            line.scale.z = 5;
        }
    }

    function cleanIntersected() {
        while (intersected.length) {
            const object = intersected.pop();
            object.material.emissive.r = 0;
        }
    }

    function animate() {
        renderer.setAnimationLoop(render);
    }

    function render(timestamp: any, frame: any) {
        cleanIntersected();
        intersectObjects(controller1);
        intersectObjects(controller2);
        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();
            if (hitTestSourceRequested === false) {
                session
                    ?.requestReferenceSpace("viewer")
                    .then((referenceSpace: any) => {
                        session
                            ?.requestHitTestSource({ space: referenceSpace })
                            .then((source: any) => {
                                hitTestSource = source;
                            });
                    });
                session?.addEventListener("end", function () {
                    hitTestSourceRequested = false;
                    hitTestSource = null;
                });
                hitTestSourceRequested = true;
            }
            if (hitTestSource) {
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length) {
                    const hit = hitTestResults[0];
                    reticle.visible = true;
                    reticle.matrix.fromArray(
                        hit.getPose(referenceSpace).transform.matrix,
                    );
                } else {
                    reticle.visible = false;
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

<div id="description">Start AR and Point camera device against a surface.</div>

<style>
    #description {
        position: absolute;
        top: 10px;
        width: 100%;
        text-align: center;
        z-index: 100;
        display: block;
    }
    body {
        margin: 0;
        background-color: #000;
        color: #fff;
        font-family: Monospace;
        font-size: 13px;
        line-height: 24px;
        overscroll-behavior: none;
    }

    a {
        color: #ff0;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    button {
        cursor: pointer;
        text-transform: uppercase;
    }

    #info {
        position: absolute;
        top: 0px;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        text-align: center;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: none;
        z-index: 1; /* TODO Solve this in HTML */
    }

    a,
    button,
    input,
    select {
        pointer-events: auto;
    }

    .lil-gui {
        z-index: 2 !important; /* TODO Solve this in HTML */
    }

    @media all and (max-width: 640px) {
        .lil-gui.root {
            right: auto;
            top: auto;
            max-height: 50%;
            max-width: 80%;
            bottom: 0;
            left: 0;
        }
    }

    #overlay {
        position: absolute;
        font-size: 16px;
        z-index: 2;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.7);
    }

    #overlay button {
        background: transparent;
        border: 0;
        border: 1px solid rgb(255, 255, 255);
        border-radius: 4px;
        color: #ffffff;
        padding: 12px 18px;
        text-transform: uppercase;
        cursor: pointer;
    }

    #notSupported {
        width: 50%;
        margin: auto;
        background-color: #f00;
        margin-top: 20px;
        padding: 10px;
    }
</style>
