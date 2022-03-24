import React, {useState, useEffect, useCallback} from "react";
import {CameraControl} from '../components/CameraControl';
import {Canvas} from '../components/Canvas';
import {app, saveLayerAsPng, selectLayerByID, fs, action} from '../components/Utils';

export const CameraController = () => {

    const [shiftX, setShiftX] = useState(0);
    const [shiftY, setShiftY] = useState(0);
    const [depth, setDepth] = useState(0);
    const [resetFlag, setResetFlag] = useState(false);
    const [resetSliderFlag, setResetSliderFlag] = useState(false);

    const reset = useCallback(
        () => {
            setResetFlag(resetFlag => !resetFlag);
            setShiftX(0);
            setShiftY(0);
            setDepth(0);
        },
        [setResetFlag],
    );

    const resetSlider = useCallback(
        () => {
            setResetSliderFlag(resetSliderFlag => !resetSliderFlag);
            setShiftX(0);
            setShiftY(0);
            setDepth(0);
        },
        [setResetSliderFlag],
    );


    let listener = (e,d) => { 
        if((e === "save" && d.saveStage._value === "saveSucceeded")||
        (e === "select" && d._target[0]._ref === 'document')||
        (e === "open") ||
        (e === "make" && d.new && d.new._obj ==="document")){
            resetSlider();
        }
    }

    useEffect(()=>{
        action.addNotificationListener([
            {
                event: "save"
            },
            {
                event: "select"
            },
            {
                event: "open"
            },
            {
                event: "make"
            }
        ], listener);
        return ()=>{
            action.removeNotificationListener([
                {
                    event: "save"
                },
                {
                    event: "select"
                },
                {
                    event: "open"
                },
                {
                    event: "make"
                }
            ], listener);
        }
    },[])

    return (
        <>
        <Canvas shiftX={shiftX} shiftY={shiftY} depth={depth} reset={resetFlag} resetSlider={resetSliderFlag} />
        <CameraControl shiftX={shiftX} shiftY={shiftY} depth={depth} setShiftX={setShiftX} setShiftY={setShiftY} setDepth={setDepth} reset={reset}/>
        </>
    )
} 
