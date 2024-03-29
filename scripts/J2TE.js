var objectJSON;
var arrayKey;
var rowKey, columnKey;
var arrayData;
var rowData, columnData;
var index;

function importJSON() {
    //从文本域读取JSON
    let tempJSON = JSON.parse(document.getElementById('inputArea').value);
    //将JSON转换为JSONArray
    objectJSON = (tempJSON.constructor === Array) ? tempJSON : [tempJSON];
    for (let i in objectJSON) {
        if (i == '0')
            continue;
        for (j in objectJSON[0]) {
            fillJSON(objectJSON[0], objectJSON[i], j);
        }
    }
    getTable();
    return 0;
}

function importTSV() {
    let arrayTSV = [];
    let keyLine = -1; //定义键值行
    //从文本域读取TSV
    let tempTSV = document.getElementById('inputArea').value.split('\n');
    //将TSV分列
    for (let i in tempTSV) {
        if (tempTSV[i] == '') continue;
        arrayTSV[i] = tempTSV[i].split('\t');
        //获取分割行
        if (arrayTSV[i][0] == 'type') {
            keyLine = i * 1;
        }
    }
    let keyArray = [];
    for (let j = 0; j < arrayTSV[0].length; j++) {
        keyArray[j] = [];
        for (let i = keyLine - 2; i >= 0; i--) {
            if (arrayTSV[i][j] == '') {
                if ((arrayTSV[i + 1][j] != '')) {
                    arrayTSV[i][j] = arrayTSV[i][j - 1];
                }
            }
            if (arrayTSV[i][j] != '') keyArray[j][i] = arrayTSV[i][j];
        }
        if (arrayTSV[keyLine - 1][j] != '') keyArray[j].push(arrayTSV[keyLine - 1][j]);
    }
    objectJSON = [];
    let order = -1;
    let tempJSON = {};
    for (let i = arrayTSV.length - 1; i >= keyLine; i--) {
        let tempObject = {};
        for (let j = 0; j < arrayTSV[i].length; j++) {
            if (arrayTSV[i][j] != '') {
                tempObject = setData(keyArray[j], arrayTSV[i][j], tempObject);
            }
        }
        tempJSON = combineData(tempObject, tempJSON);
        if (!!tempJSON.id) {
            objectJSON.unshift(tempJSON);
            tempJSON = {};
        }
    }
    return 0;
    getTable();
}


function exportJSON() {
    document.getElementById('inputArea').value = JSON.stringify(objectJSON);
}

function getTable() {
    arrayKey = [
        []
    ];
    arrayData = [
        []
    ];
    rowKey = 0;
    columnKey = 0;
    getKeys(0, 0, '', objectJSON[0]);
    for (let i = 0; i < arrayKey[0].length; i++) {
        let sign = false;
        let count = 1;
        for (let j = arrayKey.length - 1; j > 0; j--) {
            if (arrayKey[j][i] === undefined) {
                if (sign)
                    break;
                arrayKey[j][i] = true;
                count = count + 1;
            } else {
                arrayKey[j][i] = arrayKey[j][i] + '/' + count;
                count = 1;
                sign = true;
            }
        }
    }
    for (let i = 1; i < arrayKey.length; i++) {
        let count = 1;
        for (let j = arrayKey[0].length - 1; j > 0; j--) {
            if (arrayKey[i][j] === undefined) {
                arrayKey[i][j] = false;
                count = count + 1;
            } else if (arrayKey[i][j] === true) {
                continue;
            } else {
                arrayKey[i][j] = arrayKey[i][j] + '/' + count;
                count = 1;
            }
        }
    }
    index = arrayKey[0][0].split('.').pop();
    index = index.split('/').shift();
    rowData = 0;
    for (let i in objectJSON) {
        columnData = 0;
        let temprow = rowData;
        getData(rowData, 0, objectJSON[i]);
    }
    arrayData.pop();
    for (let j = 0; j < arrayData[0].length; j++) {
        let count = 1;
        for (let i = arrayData.length - 1; i >= 0; i--) {
            if (arrayData[i][j] === undefined) {
                count = count + 1;
            } else {
                arrayData[i][j] = arrayData[i][j] + '/' + count;
                count = 1;
            }
        }
    }
    let key = '';
    let count = 0;
    for (let i = 0; i < arrayData.length; i++) {
        if (arrayData[i][0] === undefined) {
            count = count + 1;
        } else {
            key = arrayData[i][0];
            count = 0;
        }
        for (let j = 0; j < arrayKey[0].length; j++) {
            if (arrayData[i][j] === undefined) {
                continue;
            } else {
                arrayData[i][j] = arrayData[i][j] + '/' + key.split('/')[0] + arrayKey[0][j]
                    .replace('|', count);
            }
        }
    }

    let table = '<table><thead>';
    for (let i in arrayKey) {
        if (i == 0)
            continue;
        table = table + '<tr>';
        for (let j in arrayKey[i]) {
            if (arrayKey[i][j].constructor === Boolean)
                continue;
            let stringArray = arrayKey[i][j].split('/');
            table = table + '<th colspan=' + stringArray[2] + ' rowspan=' + stringArray[1] + '>' + stringArray[
                0] + '</th>';
        }
        table = table + '</tr>';
    }
    table = table + '<tr><th>type</th>';
    for (let i in arrayKey[0]) {
        if (i == 0) continue;
        table = table + '<th>' + arrayKey[0][i].split('/').pop() + '</th>';
    }
    table = table + '</tr></thead><tbody>';
    for (let i = 0; i < arrayData.length; i++) {
        table = table + '<tr>';
        for (let j = 0; j < arrayData[i].length; j++) {
            if (arrayData[i][j] === undefined)
                continue;
            let stringArray = arrayData[i][j].split('/');
            let id = stringArray[2].split('.').pop();
            let ifbiome = (id == 'biomes') ?
                ' style="width:400px;height:21px;word-break:break-all;overflow:auto;"' :
                '';
            let ifid = (id == index) ? ' class="index"' :
                '';
            let color = stringArray[0];
            let ifcolor = (id == 'color') ?
                (' style="background-color: #' + color.slice(4, 9) + color.slice(2, 3) + ';"') :
                '';
            table = table + '<td' + ifid + ' rowspan=' + stringArray[1] + ifcolor +
                ' onclick="showEdit(this.firstElementChild);" oncontextmenu="addArray(this.firstElementChild.id)"><div id=' +
                stringArray[2] +
                ' class=' +
                stringArray[3] + ifbiome +
                '>' +
                stringArray[0] + '</div></td>';
        }
        table = table + '</tr>';
    }
    table = table + '</tbody></table></br>';
    document.getElementById('table').innerHTML = table;
}

function testOutput() {
    alert(arrayKey[1].toString());
    alert(arrayKey[2].toString());
    alert(arrayKey[3].toString());
    alert(arrayKey[4].toString());
}

function getKeys(row, column, key, data) {
    let idata = data;
    let signArray = '';
    if (idata.constructor === Array) {
        idata = data[0];
        signArray = '.|';
    }
    if (typeof(idata) == 'object') {
        rowKey = rowKey + 1;
        if (rowKey + 1 > arrayKey.length) {
            arrayKey.push([]);
        }
        for (let i in idata) {
            arrayKey[rowKey][columnKey] = i;
            getKeys(rowKey, columnKey, key + signArray + '.' + i, idata[i]);
        }
        rowKey = rowKey - 1;
    } else {
        columnKey = columnKey + 1;
        arrayKey[0].push(key + '/' + typeof(idata));
    }
}

function getData(row, column, data) {
    let idata = data;
    if (idata.constructor === Array) {
        for (let i in idata) {
            columnData = column;
            getData(row + (i * 1), columnData, idata[i]);
        }
    } else if (idata.constructor === Object) {
        let j = 0;
        for (let i in idata) {
            if (i == 'biomes') {
                getData(row, columnData + j, idata[i].toString());
            } else {
                getData(row, columnData + j, idata[i]);
            }
        }

    } else {
        if (row >= rowData) {
            arrayData.push([]);
            rowData = row + 1;
        }
        arrayData[row][columnData] = idata;
        columnData = columnData + 1;
    }
}

function setData(keys, data, Object) {
    let {...tempData } = Object == undefined ? {} : Object;
    let key = keys.shift();
    if (keys.length == 0) {
        tempData[key] = data;
    } else {
        tempData[key] = setData(keys, data, tempData[key]);
    }
    return tempData;
}

function combineData(dataIn, data) {
    data = dataIn;
}

function showEdit(object) {
    let tmptext = object.innerHTML;
    object.innerHTML = '<textarea rows="3" cols="45" onblur="changeJson(\'' + object[index] + '\', this.value, \'' + object.className + '\')">' + tmptext + '</textarea>';
    object.style.height = '63px';
    object.firstElementChild.focus();
    object.parentNode.onclick = 'showEdit(this.firstElementChild);';
}

function changeJson(key, data, type) {
    let arrayKeys = key.split('.');
    for (let i in objectJSON) {
        if (objectJSON[i][index] == arrayKeys[0]) {
            arrayKeys.shift();
            let key = arrayKeys.pop();
            let tmpobj = {};
            tmpobj = getObject(arrayKeys, objectJSON[i]);
            let tmpdata = data.replace('\n', '');
            tmpobj[key] = (key == 'biomes') ? tmpdata.split(',') : (type == 'number' ? tmpdata * 1 : tmpdata);;
            break;
        }
    }
    exportJSON();
    getTable();
}

function getObject(keyArray, object) {
    if (keyArray.length == 0) {
        return object;
    }
    if (keyArray.length > 1) {
        let key = keyArray.shift();
        return getObject(keyArray, object[key]);
    } else {
        return object[keyArray[0]];
    }
}

function fillJSON(patternObject, fillObject, key) {
    if (fillObject[key] === undefined) {
        fillObject[key] = JSON.parse(JSON.stringify(patternObject[key]));
    } else if (fillObject[key].constructor === Object) {
        for (let x in patternObject[key]) {
            fillJSON(patternObject[key], fillObject[key], x);
        }
    } else if (fillObject[key].constructor === Array) {
        for (let x in fillObject[key]) {
            for (let y in patternObject[key][0]) {
                fillJSON(patternObject[key][0], fillObject[key][x], y);
            }
        }
    }
}

function addLine() {
    let tempJSON = JSON.stringify(objectJSON[0]);
    tempJSON = JSON.parse(tempJSON);
    tempJSON[index] = 'newIndex';
    objectJSON[objectJSON.length] = tempJSON;
    exportJSON();
    getTable();
}

function addArray(key) {
    let keyArray = key.split('.');
    for (let i in objectJSON) {
        let tempObj = objectJSON[i];
        if (tempObj[index] == keyArray[0]) {
            keyArray.shift();
            for (let x = keyArray.length - 1; x >= 0; x--) {
                if ((Math.pow(keyArray.pop(), 2) + 1) > 0) {
                    break;
                }
            }
            if (keyArray.length == 0) {
                alert('找不到可以增加的数组');
                break;
            }
            if (confirm('是否增加节点?' + tempObj[index] + '.' + keyArray.toString('.').replaceAll(',', '.') + '?')) {
                let tempJSON = {};
                let keyArray2 = keyArray.toString();
                let data = JSON.stringify(getObject(keyArray2.split(','), objectJSON[0])[0]);
                tempJSON = getObject(keyArray, tempObj);
                tempJSON.push(JSON.parse(data));
                break;
            }
        }
    }
    exportJSON();
    getTable();
}

function copy() {
    let div = document.getElementById('table').innerHTML;
    navigator.clipboard.writeText(div);
}