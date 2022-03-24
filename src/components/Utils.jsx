
export const batchPlay = require("photoshop").action.batchPlay;
export const fs = require("uxp").storage.localFileSystem;
export const uxp =  require('uxp');
export const action = require('photoshop').action;
export const app = require('photoshop').app;
export const core = require('photoshop').core;

/*require('photoshop').app.eventNotifier = (event, descriptor) => {
    console.log(event, JSON.stringify(descriptor, null, ' '));
 }
*/

export const selectLayerByID = async (layerID, layerName) => {
    const actionObject = [
      {
        _obj: 'select',
        _target: [
          {
            _ref: 'layer',
            _name: layerName,
          },
        ],
        makeVisible: false,
        layerID: [layerID],
        _options: {
           dialogOptions: "dontDisplay"
        }
      }
    ];
    await action.batchPlay(actionObject, {
        synchronousExecution: true,
        modalBehavior: "execute"
     });
  };

export async function saveLayerAsPng(layer, saveFolder) {
    const { _id, name } = layer;
    await core.executeAsModal( async () => {
        let fileName = "img "+_id+".png";
        await selectLayerByID(_id, name);
        const exportCommand = {
            _obj: 'exportSelectionAsFileTypePressed',
            _target: { _ref: 'layer', _enum: 'ordinal', _value: 'targetEnum' },
            fileType: 'png',
            quality: 32,
            metadata: 0,
            destFolder: saveFolder.nativePath,
            sRGB: true,
            openWindow: false,
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
        await action.batchPlay([exportCommand], { modalBehavior: 'execute', synchronousExecution: true });
    },{ commandName: `Export ${layer.name} Layer As PNG` });
}