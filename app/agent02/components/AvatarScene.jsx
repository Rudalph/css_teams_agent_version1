"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function AvatarScene({ vrmRef }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.5, 2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);

        // Load VRM
        const loader = new GLTFLoader();
        loader.load(
            "/avatar.vrm",
            (gltf) => {
                VRM.from(gltf).then((vrm) => {
                    scene.add(vrm.scene);
                    vrmRef.current = vrm;
                    vrm.scene.rotation.y = Math.PI;

                    const humanoid = vrm.humanoid;
                    const setBone = (boneName, rotation) => {
                        try {
                            const bone = humanoid.getBoneNode(boneName);
                            if (bone) bone.rotation.set(rotation.x, rotation.y, rotation.z);
                        } catch {}
                    };

                    // Keep hands down slightly away from body
                    setBone('leftUpperArm', { x: 0, y: 0, z: Math.PI / 2 - 0.2 });
                    setBone('rightUpperArm', { x: 0, y: 0, z: -Math.PI / 2 + 0.2 });

                    // Eye blinking every 3 seconds
                    setInterval(() => {
                        if (!vrm) return;
                        vrm.blendShapeProxy.setValue("Blink_L", 1);
                        vrm.blendShapeProxy.setValue("Blink_R", 1);
                        vrm.blendShapeProxy.update();

                        setTimeout(() => {
                            vrm.blendShapeProxy.setValue("Blink_L", 0);
                            vrm.blendShapeProxy.setValue("Blink_R", 0);
                            vrm.blendShapeProxy.update();
                        }, 200);
                    }, 3000);
                });
            },
            (progress) => console.log(`Loading VRM... ${(progress.loaded / progress.total) * 100}%`),
            (error) => console.error(error)
        );

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [vrmRef]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
