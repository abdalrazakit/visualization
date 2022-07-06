import React from 'react';
import {InitForm} from "../helpers/InitForm";
import {clearDataBase,startGenerate,  Item, startGenerateLogicaly} from "../helpers/generateData"



function Generate() {
    const {
        generatingState,
        setGeneratingState,
        formData,
        setFormData,
        handleChange,
        setErrorMessages,
        renderErrorMessage
    } = InitForm();

    const doClean= async event => {
       await clearDataBase();
    }
    const doGenerate = async event => {
        setGeneratingState(1);
        console.log(formData.type + formData.Component_min)
        if (formData.type == 'Random')
        {
            let component = new Item("Component", 1 ,5);
            let keeper = new Item("Keeper", 1, 5);
            let marketPlace = new Item("Marketplace", 1 ,5);
            let exeManager = new Item("ExecutionManager", 1 ,5);
            let nodeExecutor = new Item('NodeExecutor', 1 ,5);
            let assetManager = new Item('AssetManager', 1 ,5);
            let searchEngine = new Item("SearchEngine",1 ,5);
            let numOfDays= Math.round(Math.random()*10);
            await startGenerate(numOfDays,component,keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine)
        }
        else if(formData.type=='Ranges') {
            //alert(Object.entries(formData))
            let component = new Item("Component", formData.Component_min, formData.Component_max);
            let keeper = new Item("Keeper", formData.Keeper_min, formData.Keeper_max);
            let marketPlace = new Item("Marketplace", formData.Marketplace_min, formData.Marketplace_max);
            let exeManager = new Item("ExecutionManager", formData.ExecutionManager_min, formData.ExecutionManager_max);
            let nodeExecutor = new Item('NodeExecutor', formData.NodeExecutor_min, formData.NodeExecutor_max);
            let assetManager = new Item('AssetManager', formData.AssetManager_min, formData.AssetManager_max);
            let searchEngine = new Item("SearchEngine", formData.SearchEngine_min, formData.SearchEngine_max);
            let numOfDays= formData.DaysNumber
            await startGenerate(numOfDays,component,keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine)
        }else
             if (formData.type=='Logicly')
             {
                 let component = new Item("Component", formData.NumOfComponent);
                 let numOfKeeper4Component=Math.round( formData.NumOfKeeper/formData.NumOfComponent);
                 let keeper = new Item("Keeper", numOfKeeper4Component);
                 let numOfMarketplace4Keeper=Math.round( formData.NumOfMarketplace/formData.NumOfKeeper);
                 let marketPlace = new Item("Marketplace", numOfMarketplace4Keeper);

                 let exeManager = new Item("ExecutionManager", Math.round(formData.NumOfExecutionManager/formData.NumOfMarketplace));
                 let nodeExecutor = new Item('NodeExecutor', Math.round(formData.NumOfNodeExecutor/formData.NumOfExecutionManager));
                 let assetManager = new Item('AssetManager', Math.round(formData.NumOfAssetManager/formData.NumOfNodeExecutor));
                 let searchEngine = new Item("SearchEngine", Math.round(formData.NumOfSearchEngine/formData.NumOfKeeper));
                 let numOfDays= formData.DaysNumber
                 await startGenerate(numOfDays,component,keeper,marketPlace,exeManager,nodeExecutor,assetManager,searchEngine,formData.NumOfAdd,formData.NumOfDelete,formData.NumOfEdit)
             }
        setTimeout(() => {
            setGeneratingState(2);
            setFormData({reset: true})
            setErrorMessages({ name: "name", message: "test error message" });
        }, 1000)
    }

    return (
        <div className="wrapper">
            <h1>This is the Generate</h1>
            {generatingState == 1 && <div>Generating ...</div>}
            {generatingState == 2 && <div>Generating Done</div>}

            <div >
                <fieldset>
                    <label>
                        <p>Select Type</p>
                        <select name="type" onChange={handleChange} value={formData.type || ''}>
                            <option value=""></option>
                            <option value="Random">Random</option>
                            <option value="Ranges">Ranges</option>
                            <option value="Logicly">Logicly</option>
                        </select>
                    </label>
                </fieldset>
                {formData.type == 'Ranges' && <fieldset disabled={false}>
                    <div className="input-container">
                        <label>Components: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="Component_min" onChange={handleChange} step="1"
                               value={formData.Component_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="Component_max" onChange={handleChange} step="1"
                               value={formData.Component_max || ''}/>
                    </div>
                    <div className="input-container">
                        <label>Keepers: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="Keeper_min" onChange={handleChange} step="1"
                               value={formData.Keeper_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="Keeper_max" onChange={handleChange} step="1"
                               value={formData.Keeper_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>Marketplaces: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="Marketplace_min" onChange={handleChange} step="1"
                               value={formData.Marketplace_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="Marketplace_max" onChange={handleChange} step="1"
                               value={formData.Marketplace_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>ExecutionManagers: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="ExecutionManager_min" onChange={handleChange} step="1"
                               value={formData.ExecutionManager_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="ExecutionManager_max" onChange={handleChange} step="1"
                               value={formData.ExecutionManager_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>NodeExecutors: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="NodeExecutor_min" onChange={handleChange} step="1"
                               value={formData.NodeExecutor_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="NodeExecutor_max" onChange={handleChange} step="1"
                               value={formData.NodeExecutor_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>AssetManagers: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="AssetManager_min" onChange={handleChange} step="1"
                               value={formData.AssetManager_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="AssetManager_max" onChange={handleChange} step="1"
                               value={formData.AssetManager_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>SearchEngines: </label>
                    </div>

                    <div className="input-container">
                        <label>Min: </label>
                        <input type="number" name="SearchEngine_min" onChange={handleChange} step="1"
                               value={formData.SearchEngine_min || ''}/>
                        <label>Max: </label>
                        <input type="number" name="SearchEngine_max" onChange={handleChange} step="1"
                               value={formData.SearchEngine_max || ''}/>
                    </div>

                    <div className="input-container">
                        <label>Number of days: </label>
                    </div>

                    <div className="input-container">
                        <input type="number" name="DaysNumber" onChange={handleChange} step="1"
                               value={formData.DaysNumber || ''}/>
                    </div>
                </fieldset>}
                {formData.type == 'Logicly'&&  <fieldset disabled={false}>
                    <div className="input-container">
                        <label>Components: </label>
                        <input type="number" name="NumOfComponent" onChange={handleChange} step="1"
                               value={formData.NumOfComponent || ''}/>
                    </div>

                    <div className="input-container">
                        <label>Keepers: </label>
                        <input type="number" name="NumOfKeeper" onChange={handleChange} step="1"
                               value={formData.NumOfKeeper || ''}/>
                    </div>


                    <div className="input-container">
                        <label>Marketplaces: </label>
                        <input type="number" name="NumOfMarketplace" onChange={handleChange} step="1"
                               value={formData.NumOfMarketplace || ''}/>
                    </div>

                    <div className="input-container">
                        <label>ExecutionManagers: </label>
                        <input type="number" name="NumOfExecutionManager" onChange={handleChange} step="1"
                               value={formData.NumOfExecutionManager || ''}/>
                    </div>

                    <div className="input-container">
                        <label>NodeExecutors: </label>
                        <input type="number" name="NumOfNodeExecutor" onChange={handleChange} step="1"
                               value={formData.NumOfNodeExecutor || ''}/>
                    </div>

                    <div className="input-container">
                        <label>AssetManagers: </label>
                        <input type="number" name="NumOfAssetManager" onChange={handleChange} step="1"
                               value={formData.NumOfAssetManager || ''}/>
                    </div>

                    <div className="input-container">
                        <label>SearchEngines: </label>
                        <input type="number" name="NumOfSearchEngine" onChange={handleChange} step="1"
                               value={formData.NumOfSearchEngine || ''}/>
                    </div>

                    <div className="input-container">
                        <label>Number of days: </label>
                        <input type="number" name="DaysNumber" onChange={handleChange} step="1"
                               value={formData.DaysNumber || ''}/>
                    </div>
                    <div className="input-container">
                        <label>Add: </label>
                        <input type="number" name="NumOfAdd" onChange={handleChange} step="1"
                               value={formData.NumOfAdd || ''}/>
                        <label>Delete: </label>
                        <input type="number" name="NumOfDelete" onChange={handleChange} step="1"
                               value={formData.NumOfDelete || ''}/>
                        <label>Edit: </label>
                        <input type="number" name="NumOfEdit" onChange={handleChange} step="1"
                               value={formData.NumOfEdit || ''}/>
                    </div>

                </fieldset>}
                <button type="button" onClick={doGenerate} disabled={generatingState == 1}>Generate</button>
                <button type="button" onClick={doClean} disabled={false}>Clean DataBase</button>
            </div>
        </div>
    );
}

export default Generate;