"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function TalkingAvatar() {
    const mountRef = useRef(null);
    const [text, setText] = useState("");
    const vrmRef = useRef(null);

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
                            if (bone) {
                                bone.rotation.set(rotation.x, rotation.y, rotation.z);
                                return true;
                            }
                        } catch (error) {
                            console.warn(`Could not set ${boneName}:`, error);
                        }
                        return false;
                    };

                    // Alternative: Slightly less than 90 degrees rotation
                    setBone('leftUpperArm', { x: 0, y: 0, z: Math.PI / 2 - 0.2 });    // Left arm slightly away from body
                    setBone('rightUpperArm', { x: 0, y: 0, z: -Math.PI / 2 + 0.2 });   // Right arm slightly away from body

                    setBone('leftLowerArm', { x: 0, y: 0, z: 0 });
                    setBone('rightLowerArm', { x: 0, y: 0, z: 0 });

                    setBone('leftHand', { x: 0, y: 0, z: 0 });
                    setBone('rightHand', { x: 0, y: 0, z: 0 });



                    // Start eye blinking every 3 seconds
                    setInterval(() => {
                        if (!vrm) return;
                        vrm.blendShapeProxy.setValue("Blink_L", 1);
                        vrm.blendShapeProxy.setValue("Blink_R", 1);
                        vrm.blendShapeProxy.update();

                        setTimeout(() => {
                            vrm.blendShapeProxy.setValue("Blink_L", 0);
                            vrm.blendShapeProxy.setValue("Blink_R", 0);
                            vrm.blendShapeProxy.update();
                        }, 200); // blink duration 0.2s
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
    }, []);



    const handleSpeak = () => {
    if (!vrmRef.current) return;
    const vrm = vrmRef.current;
    let mouthOpen = false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    // Select a female voice
    const voices = window.speechSynthesis.getVoices();
    let femaleVoices = voices.filter(voice =>
        voice.name.toLowerCase().includes("zira") ||   // Windows
        voice.name.toLowerCase().includes("samantha")  // Mac
    );
    if (femaleVoices.length > 0) utterance.voice = femaleVoices[0];


    utterance.onstart = () => {
    const visemes = ["A", "I", "U", "E", "O"]; // multiple mouth shapes
    const interval = setInterval(() => {
        if (!vrm) return clearInterval(interval);

        // Pick a random viseme for natural movement
        const viseme = visemes[Math.floor(Math.random() * visemes.length)];

        // Reset all visemes first
        visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));

        // Set the current viseme
        vrm.blendShapeProxy.setValue(viseme, 1);
        vrm.blendShapeProxy.update();
    }, 120); // update every 120ms for smoother motion

    utterance.onend = () => {
        // Reset all visemes to 0 when speech ends
        visemes.forEach(v => vrm.blendShapeProxy.setValue(v, 0));
        vrm.blendShapeProxy.update();
        clearInterval(interval);
    };
};

speechSynthesis.speak(utterance);

};



    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <div ref={mountRef} style={{ width: "100%", height: "80%" }} />
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type something..."
                    style={{ width: "300px", padding: "8px", fontSize: "16px" }}
                />
                <button
                    onClick={handleSpeak}
                    style={{ marginLeft: "10px", padding: "8px 16px", fontSize: "16px" }}
                >
                    Speak
                </button>
            </div>
        </div>
    );
}
