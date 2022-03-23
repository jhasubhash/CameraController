import React , { useState, useEffect, useRef } from "react";
import {app, saveLayerAsPng, selectLayerByID, fs} from './Utils';
import { WC } from "./WC.jsx";
import './CameraControl.css';

export const CameraControl = (props) => {
    const cameraDepthRef = useRef(null);
    const cameraShiftXRef = useRef(null);
    const cameraShiftYRef = useRef(null);

    useEffect(() => {
        return () => {
        }
    },[])

    const updateCamera = (evt) => {
        const target = evt.target;
        const part = target.getAttribute("data-part");

        switch (part) {
            case "X":
                props.setShiftX(target.value);
                break;
            case "Y":
                props.setShiftY(target.value);
                break;
            case "D":
                props.setDepth(target.value);
                break;
            default:
                break;
        }
    }

    return ( <>
        <div style={{width:'100%'}}>
        <WC onInput={updateCamera}>
            <div className="depth-slider">
                <sp-slider ref={cameraDepthRef} show-value="false" data-part="D" value={props.depth} min={0} max={100}>
                    <sp-label slot="label">Scene Depth</sp-label>
                </sp-slider>
            </div>
            <div className="shift-x-slider">
                <sp-slider ref={cameraShiftXRef} show-value="false" data-part="X" value={props.shiftX} min={-100} max={100}>
                    <sp-label slot="label">Horizontal Camera Shift</sp-label>
                </sp-slider>
            </div>
            <div className="shift-y-slider">
                <sp-slider ref={cameraShiftYRef} show-value="false" data-part="Y" value={props.shiftY} min={-100} max={100}>
                    <sp-label slot="label">Vertical Camera Shift</sp-label>
                </sp-slider>
            </div>
        </WC>
            <sp-button onClick={props.reset}>Reset</sp-button>
        </div>
    </> );
}