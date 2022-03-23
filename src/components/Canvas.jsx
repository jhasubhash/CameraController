
import React , { useState, useEffect, useRef } from "react";
import {app, saveLayerAsPng, selectLayerByID, fs} from './Utils';
import './Canvas.css';


let lastDepth = 0;
let lastShiftY = 0;
let lastShiftX = 0;


export const Canvas = (props) => {

    const [imageGenerated, setImageGenerated] = useState(false);
    const [docHeight, setDocHeight] = useState(0);
    const [docWidth, setDocWidth] = useState(0);
    const [dimensionMap, setDimensionMap] = useState(() => new Map());
    const [layerData, setLayerData] = useState([]);

    let aspect = docHeight/ docWidth;
    let previewWidth = 300;
    let previewHeight = aspect * previewWidth;
    let shiftX = props.shiftX;
    let shiftY = props.shiftY;
    let depth = props.depth;


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
            console.log(previewHeight);
            console.log(docHeight);
            newMap[layer._id] = layer.bounds;
            newMap[layer._id].top *= previewHeight/docHeight;
            newMap[layer._id].bottom *= previewHeight/docHeight;
            newMap[layer._id].left *= previewWidth/docWidth;
            newMap[layer._id].right *= previewWidth/docWidth;
            console.log(newMap[layer._id]);
        }
       // console.log(newMap);
        setDimensionMap(newMap);
    }

    const generatePNGs = async () => {
        let saveFolder = await fs.getDataFolder();
        for (const layer of app.activeDocument.layers) {
            await saveLayerAsPng(layer, saveFolder)
            console.log("png generater for "+layer.name);
        }
        setImageGenerated(true);
    }

     useEffect(() => {
        populateDimensionMap();
        return () => {
        }
    },[docHeight, docWidth])

    useEffect(()=>{
        console.log("regenerater pngs");
        populateLayerData();
        generatePNGs();
    },[props.reset])

    useEffect(() => {
        populateLayerData();
        setDocData();
        populateDimensionMap();
        generatePNGs();
        return () => {
        }
    },[])

    const getLayerImgSrc = (fileName) => {
        let filepath = "plugin-data://PluginData//"+fileName+".png?"+Date.now();
        //console.log(filepath);
        return filepath;
    }

    const isDimensionValid = (id) => {
        return dimensionMap[id];
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
    </div>
     );
}
