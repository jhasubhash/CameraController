
import React , { useState, useEffect, useRef } from "react";
import {app, saveLayerAsPng, selectLayerByID, fs, action} from './Utils';
import './Canvas.css';


let lastDepth = 0;
let lastShiftY = 0;
let lastShiftX = 0;


export const Canvas = (props) => {

    const [imageGenerated, setImageGenerated] = useState(false);
    const [docHeight, setDocHeight] = useState(1);
    const [docWidth, setDocWidth] = useState(1);
    const [dimensionMap, setDimensionMap] = useState(() => new Map());
    const [layerData, setLayerData] = useState([]);
    const [previewWidth, setPreviewWidth] = useState(300);
    const [previewHeight, setPreviewHeight] = useState((docHeight/ docWidth) * previewWidth);

    let shiftX = props.shiftX;
    let shiftY = props.shiftY;
    let depth = props.depth;

    useEffect(()=>{
        setPreviewHeight((docHeight/ docWidth) * previewWidth);
    },[docHeight,docWidth])

    const setDocData = () => {
        setDocHeight(app.activeDocument.height);
        setDocWidth(app.activeDocument.width);
    }

    const populateLayerData = () => {
        let newLayerData = [];
        app.activeDocument.layers.forEach(layer => {
            newLayerData.push({
                _id : layer._id,
                name : layer.name,
                bounds : {
                    left : layer.bounds.left,
                    right : layer.bounds.right,
                    top : layer.bounds.top,
                    bottom : layer.bounds.bottom
                }
            })
        });
        setLayerData(newLayerData);
    }

    useEffect(() => {
        let d = 1;
        let diff = shiftX- lastShiftX;
        lastShiftX = shiftX;
        let nmap = new Map();
        layerData.slice().reverse().forEach(layer => {
            nmap[layer._id] = {
                top: dimensionMap[layer._id]? dimensionMap[layer._id].top : layer.bounds.top,
                left: dimensionMap[layer._id]?dimensionMap[layer._id].left - d* diff : layer.bounds.left,
                bottom: dimensionMap[layer._id]?dimensionMap[layer._id].bottom : layer.bounds.bottom,
                right: dimensionMap[layer._id]?dimensionMap[layer._id].right - d* diff : layer.bounds.right
            }
            d += 1;
        });
        setDimensionMap(nmap);
    },[shiftX])

    useEffect(() => {
        let d = 1;
        let diff = shiftY- lastShiftY;
        lastShiftY = shiftY;
        let nmap = new Map();
        layerData.slice().reverse().forEach(layer => {
            nmap[layer._id] = {
                top: dimensionMap[layer._id]? dimensionMap[layer._id].top + d* diff: layer.bounds.top,
                left: dimensionMap[layer._id]?dimensionMap[layer._id].left  : layer.bounds.left,
                bottom: dimensionMap[layer._id]?dimensionMap[layer._id].bottom + d* diff : layer.bounds.bottom,
                right: dimensionMap[layer._id]?dimensionMap[layer._id].right  : layer.bounds.right
            }
            d += 1;
        });
        setDimensionMap(nmap);
    },[shiftY])

    useEffect(() => {
        let d = 0;
        let diff = depth - lastDepth;
        lastDepth = depth;
        let nmap = new Map();
        layerData.forEach(layer => {
            nmap[layer._id] = {
                top: dimensionMap[layer._id]? dimensionMap[layer._id].top + d: layer.bounds.top,
                left: dimensionMap[layer._id]?dimensionMap[layer._id].left + d  : layer.bounds.left,
                bottom: dimensionMap[layer._id]?dimensionMap[layer._id].bottom - d : layer.bounds.bottom,
                right: dimensionMap[layer._id]?dimensionMap[layer._id].right  -d : layer.bounds.right
            }
            d += diff;
        });
        setDimensionMap(nmap);
    },[depth])


    const populateDimensionMap = () => {
        let newMap = new Map();
        for (const layer of layerData) {
            newMap[layer._id] = layer.bounds;
            newMap[layer._id].top *= previewHeight/docHeight;
            newMap[layer._id].bottom *= previewHeight/docHeight;
            newMap[layer._id].left *= previewWidth/docWidth;
            newMap[layer._id].right *= previewWidth/docWidth;
        }
        setDimensionMap(newMap);
    }

    const generatePNGs = async () => {
        let saveFolder = await fs.getDataFolder();
        let enteries = await saveFolder.getEntries();
        for(let idx=0; idx< enteries.length; idx++){
            await enteries[idx].delete();
        }
        for (const layer of layerData) {
            await saveLayerAsPng(layer, saveFolder)
            await new Promise(r => setTimeout(r, 100));
        }
        setImageGenerated(true);
    }

    useEffect(() => {
        populateDimensionMap();
        return () => {
        }
    },[docHeight, docWidth, layerData])

    useEffect(()=>{
        setImageGenerated(false);
        setDocData();
        populateLayerData();
        generatePNGs();
    },[props.reset])

    useEffect(()=>{
        setImageGenerated(false);
        setDocData();
        populateLayerData();
    },[props.resetSlider])

    useEffect(() => {
        setImageGenerated(false);
        setDocData();
        populateLayerData();
        populateDimensionMap();
        //generatePNGs();
        return () => {
        }
    },[])

    const getLayerImgSrc = (fileName) => {
        let filepath = "plugin-data://PluginData//"+fileName+".png?"+Date.now();
        return filepath;
    }

    const loadScene = () => {
        generatePNGs();
    }

    return ( 
        <div className="view-container">
        {imageGenerated && layerData.map((layer,id) => (
        <div className="layer-img-container" 
        key={id}>
            <div className="layer-img">
            <div style={{ 
                position: 'relative',
                width:previewWidth,
                height:previewHeight
            }}>
            <img data-index={id}  
                style={{
                    'position': 'relative',
                    "zIndex":(layerData.length-id),
                    "left" : dimensionMap[layer._id] ? dimensionMap[layer._id].left : 0,
                    "top" : dimensionMap[layer._id] ? dimensionMap[layer._id].top : 0
                }} 
                src={getLayerImgSrc(layer.name)} 
                width={dimensionMap[layer._id] ? (dimensionMap[layer._id].right - dimensionMap[layer._id].left) : 0} 
                height={dimensionMap[layer._id] ? (dimensionMap[layer._id].bottom -  dimensionMap[layer._id].top) : 0}
            />
            </div>
        </div>
        </div>
        ))}
        {!imageGenerated && 
        <div className="reset-button">
        <sp-button onClick={loadScene}>Load Scene</sp-button>
        </div>
        }
    </div>
     );
}
