"use client";

import React, { useRef } from "react";
import AvatarScene from "./components/AvatarScene";
import SpeechInput from "./components/SpeechInput";

export default function Page() {
    const vrmRef = useRef(null);

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <div style={{ width: "100%", height: "80%" }}>
                <AvatarScene vrmRef={vrmRef} />
            </div>
            <SpeechInput vrmRef={vrmRef} />
        </div>
    );
}
