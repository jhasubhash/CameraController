import React, {useState} from "react";
import {CameraControl} from '../components/CameraControl';
import {Canvas} from '../components/Canvas';

export const CameraController = () => {

    const [shiftX, setShiftX] = useState(0);
    const [shiftY, setShiftY] = useState(0);
    const [depth, setDepth] = useState(0);
    const [resetFlag, setResetFlag] = useState(false);

    const reset = ()=> {
        setResetFlag(!resetFlag);
        setShiftX(0);
        setShiftY(0);
        setDepth(0);
    }

    return (
        <>
        <Canvas shiftX={shiftX} shiftY={shiftY} depth={depth} reset={resetFlag}/>
        <CameraControl shiftX={shiftX} shiftY={shiftY} depth={depth} setShiftX={setShiftX} setShiftY={setShiftY} setDepth={setDepth} reset={reset}/>
        </>
    )
} 
