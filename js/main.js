/**
 * jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50
 * */
/**
 * global $, window, location, CSInterface, SystemPath, themeManager
 * */
main();

function main() {
    'use strict';
    // jsx function realnBtnsList sometimes fail
    // for that reason function (loadButtons) is run recursively
    var MAX_RECURS_COUNT = 5,
        recursCount = 0;

    var csInterface = new CSInterface();
    init();

    function init() {


        themeManager.init();

        loadJSX('json2.js');

        var userDataPath = csInterface.getSystemPath(SystemPath.USER_DATA),
            storePath = userDataPath + '/LocalStore/ai_scriptmix/',
            storeCfg = storePath + 'cfg/',
            storeImg = storePath + 'img/',
            storeJsx = storePath + 'jsx/',
            btnsList = storeCfg + '/btns_List.txt';

        var storeObj = {
            userDataPath: userDataPath,
            storePath: storePath,
            storeCfg: storeCfg,
            storeImg: storeImg,
            storeJsx: storeJsx,
            btnsList: btnsList
        }

        var btnsNames = [],
            divBtns = document.getElementById('btns'),
            i,
            BTN_DEFAULT_WIDTH = 15,
            BTN_MIN_WIDTH = 1,
            BTN_MAX_WIDTH = 60;

        // load the buttons names from file
        loadButtons();

        jQuery.fn.extend({
            disableSelection: function () {
                this.each(function () {
                    this.onselectstart = function () {
                        return false;
                    };
                });
            }
        });
        $("body").disableSelection();

        /**
         * SERVICE BUTTONS HANDLERS
         * */
        $('#btn_addBtn').click(function () {
            csInterface.evalScript(addBtnToStore.toString() + ';addBtnToStore("' + storeObj.storePath + '" )',
                function (result) {
                    if (result.length != 0) {
                        addBtnToInterface(result);
                    }
                });
        });
        $('#btn_prefs').click(function () {
            csInterface.evalScript(changePrefs.toString() + ';changePrefs("' + storeObj.storeCfg + '" )',
                function (result) {
                    if (result.length == 0) return;
                    reloadPanel();
                });
        });
        $('#btn_source').click(function () {
            csInterface.evalScript(openFolder.toString() + ';openFolder("' + storeObj.storePath + '")');
        });
        $('#btn_scale_up').click(function () {
            var btnW = $('.btn').width();
            btnW++;
            if (btnW > BTN_MAX_WIDTH) btnW = BTN_MAX_WIDTH;
            $('.btn').width(btnW);
            $('.btn').height(btnW);
            csInterface.evalScript(writeIni.toString() + ';writeIni(' + JSON.stringify(btnW) + ')');
        });
        $('#btn_scale_down').click(function () {
            var btnW = $('.btn').width();
            btnW--;
            if (btnW < BTN_MIN_WIDTH) btnW = BTN_MIN_WIDTH;
            $('.btn').width(btnW);
            $('.btn').height(btnW);
            csInterface.evalScript(writeIni.toString() + ';writeIni(' + JSON.stringify(btnW) + ')');
        });
        $('#btn_defaults').click(function () {
            $('.btn').width(BTN_DEFAULT_WIDTH);
            $('.btn').height(BTN_DEFAULT_WIDTH);
            csInterface.evalScript(writeIni.toString() + ';writeIni(' + JSON.stringify(BTN_DEFAULT_WIDTH) + ')');
        });
        document.querySelector('#btn_reload').addEventListener('click', () => {
            property: reloadPanel()
        });

        /** * * * * * * * * * * * *
         * * * jsxSet library * * *
         * * * * * * * * * * * * **/

        function addBtnToInterface(btnName) {

            csInterface.evalScript(readIni.toString() + ';readIni()', function (res) {
                if (!res) res = BTN_DEFAULT_WIDTH;
                var btnW = +res;

                if (btnName.length == 0) return;
                var btn = document.createElement('input');
                btn.setAttribute('type', 'image');
                btn.setAttribute('class', 'btn');
                btn.setAttribute('src', storeObj.storeImg + btnName + '.png');
                btn.setAttribute('title', btnName);
                btn.setAttribute('name', btnName);
                btn.setAttribute('id', 'btn_' + btnName);

                btn.addEventListener('click', function () {
                    csInterface.evalScript('$.evalFile("' + storeObj.storeJsx + btnName + '.jsx' + '")');
                });

                btn.oncontextmenu = function () {
                    var delName = this.name,
                        btnToDel = document.getElementById('btn_' + btnName),
                        confirmDel = confirm('Delete script: ' + delName + '?');
                    if (confirmDel) {
                        csInterface.evalScript(delBtnFromStore.toString() + ';delBtnFromStore("' + delName + '" )', function (result) {
                            btnToDel.remove();
                        });
                    }
                    return false;
                };

                btn = divBtns.appendChild(btn);

                $('#' + 'btn_' + btnName).width(btnW);
                $('#' + 'btn_' + btnName).height(btnW);

            });
        }

        function loadButtons() {
            csInterface.evalScript(readlnBtnsList.toString() + ';readlnBtnsList()', function (result) {
                console.log(result);
                if (result.match(/error/i)) {
                    recursCount++;
                    if (recursCount >= MAX_RECURS_COUNT) return false;
                    loadButtons();
                }
                // btnsNames = JSON.parse(result);

                btnsNames = JSON.parse(result);

                for (i = 0; i < btnsNames.length; i++) {
                    addBtnToInterface(btnsNames[i]);
                }
                csInterface.evalScript(readIni.toString() + ';readIni()', function (res) {
                    if (!res) res = BTN_DEFAULT_WIDTH;
                    var btnW = +res;
                    if (btnW > BTN_MAX_WIDTH) btnW = BTN_MAX_WIDTH;
                    if (btnW < BTN_MIN_WIDTH) btnW = BTN_MIN_WIDTH;
                    $('.btn').width(btnW);
                    $('.btn').height(btnW);
                });

            });
            return true;
        }
    }

    /** * * * * * * * * * *
     * * * NATIVE LIB * * *
     * * * * * * * * * * **/
    // Reloads extension panel
    function reloadPanel() {
        location.reload();
    }

    function loadJSX(fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/jsx/';
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
}

///////////////////////
/*********************/
/**
 * Adobe Extend Script functions
 * */

function addStore(storeObj) {

    var storePath = storeObj.storePath,
        store = new Folder(storePath),
        storeCfg = new Folder(storeObj.storeCfg),
        storeImg = new Folder(storeObj.storeImg),
        storeJsx = new Folder(storeObj.storeJsx);

    if (!store.exists) store.create();
    if (!storeCfg.exists) storeCfg.create();
    if (!storeImg.exists) storeImg.create();
    if (!storeJsx.exists) storeJsx.create();
}

function addBtnToStore(storeObj) {
    var store = new Folder(storePath),
        btnsList = storeObj.btnsList;

    var resultName = '',
        sourseJsx, targJsx,
        soursePng, targPng;

    var w = new Window('dialog', 'Add script button'),
        pn = w.add('panel'),
        gr_addJsx = pn.add('group'),
        gr_addPng = pn.add('group'),
        gr_stdBtns = w.add('group'),

        btn_addJsx = gr_addJsx.add('button', undefined, 'Add jsx-script'),
        txt_addJsx = gr_addJsx.add('edittext'),

        btn_addPng = gr_addPng.add('button', undefined, 'Add png-image'),
        txt_addPng = gr_addPng.add('edittext'),

        btn_ok = gr_stdBtns.add('button', undefined, 'Ok'),
        btn_cancel = gr_stdBtns.add('button', undefined, 'Cancel');

    txt_addJsx.characters = txt_addPng.characters = 30;
    btn_addPng.preferredSize.width = btn_addJsx.preferredSize.width = 110;

    btn_addPng.onClick = function () {
        soursePng = File.openDialog('Select a png-image file', 'PNG files:*.png', false);
        txt_addPng.text = soursePng.fsName;
    };

    btn_addJsx.onClick = function () {
        sourseJsx = File.openDialog('Select a jsx-script file', 'JSX files:*.jsx', false);
        txt_addJsx.text = sourseJsx.fsName;
    };

    btn_ok.onClick = function () {
        resultName = (sourseJsx.name).slice(0, -4);

        sourseJsx.copy(store + '/jsx/' + resultName + '_.jsx');
        targJsx = new File(store + '/jsx/' + resultName + '_.jsx');
        try {
            (new File(store + '/jsx/' + resultName + '.jsx')).remove();
        } catch (e) {
        }
        targJsx.rename(resultName + '.jsx');

        soursePng.copy(store + '/img/' + resultName + '_.png');
        targPng = new File(store + '/img/' + resultName + '_.png');
        try {
            (new File(store + '/img/' + resultName + '.png')).remove();
        } catch (e) {
        }
        targPng.rename(resultName + '.png');

        var btnsNames = [];
        var f = new File(btnsList),
            btnsNames = [];

        f.open('r');
        while (!f.eof) {
            btnsNames.push(f.readln());
        }
        f.close();

        btnsNames.push(resultName);

        f.open('w');
        for (var i = 0; i < btnsNames.length; i++) {
            f.writeln(btnsNames[i]);
        }
        f.close();

        w.close();
    };

    w.show();

    return resultName;
}

function delBtnFromStore(delName, storeObj) {
    var btnsList = storeObj.btnsList,
        storeImg = new Folder(storeObj.storeImg),
        storeJsx = new Folder(storeObj.storeJsx);

    var f = new File(btnsList),
        btnsNames = [],
        i;

    (new File(storeImg + '/' + delName + '.png')).remove();
    (new File(storeJsx + '/' + delName + '.jsx')).remove();

    f.open('r');
    while (!f.eof) {
        btnsNames.push(f.readln());
    }
    f.close();

    for (var i = 0; i < btnsNames.length; i++) {
        if (btnsNames[i] == delName) {
            btnsNames.splice(i, 1);
            break;
        }
    }

    f.open('w');
    for (var i = 0; i < btnsNames.length; i++) {
        f.writeln(btnsNames[i]);
    }
    f.close();
}

/**
 * THE FILE OPERATIONS FOR MAIN.JS
 * */
function readlnBtnsList(storeObj) {
    var btnsList = storeObj.btnsList;
    var result = [],
        f = new File(btnsList);

    if (!f.exists) return result;

    f.open('r');

    while (!f.eof) {
        result.push(f.readln());
    }
    f.close();

    //return result;
    // return JSON.stringify(result);
    return result;
}

function writelnBtnsList(arr, storeObj) {
    var btnsList = storeObj.btnsList;
    var arr = arr || [];
    var f = new File(btnsList);
    f.open('w');
    for (var i = 0; i < arr.length; i++) {
        f.writeln(arr[i]);
    }
    f.close();
}

function openFolder(path) {
    var folder = new Folder(path);
    folder.execute();
}

/**
 * OTHER
 * */

function killCEP() {
    /**
     * make bat-file that kill all system processes CEPHTMLEngine.exe
     */
    _execFile(
        Folder.temp.absoluteURI + '/' + 'tasks_kill.bat',
        'taskkill /IM CEPHTMLEngine.exe /f'
    );

    /**
     * make new file by full path, write to disk with some file contenr, execute file
     *
     * @param {String} filePath - FULL path (include file-extension)
     * @param {String} fileContent - content to new file
     */
    function _execFile(filePath, fileContent) {
        var f = new File(filePath);
        f.open('e');
        f.write(fileContent);
        f.close();
        f.execute();
    }
}

function changePrefs(storeObj) { // !!! this function used in main.js
    var btnsList = storeObj.btnsList;

    var btnsNames = [],
        f = new File(btnsList);
    f.open('r');
    while (!f.eof) {
        btnsNames.push(f.readln());
    }
    f.close();

    var w = new Window('dialog', 'Rearrange buttons'),
        list = w.add('listbox', undefined, btnsNames, {multiselect: true}),
        grUpDown = w.add('group'),
        up = grUpDown.add('button', undefined, 'Up'),
        down = grUpDown.add('button', undefined, 'Down'),
        grOkCancel = w.add('group'),
        ok = grOkCancel.add('button', undefined, 'OK')/*,
       cancel     = grOkCancel.add('button', undefined, 'Cancel')*/;

    ok.onClick = function () {
        var arr = [];

        for (var i = 0; i < list.items.length; i++) {
            arr.push(list.items[i]);
        }

        var f = new File(btnsList);
        f.open('w');
        for (var i = 0; i < arr.length; i++) {
            f.writeln(arr[i]);
        }
        f.close();

        w.close();
    };

    up.onClick = function () {
        var first = list.selection[0].index;
        if (first == 0 || !contiguous(list.selection)) return;
        var last = first + list.selection.length;
        for (var i = first; i < last; i++) {
            swap(list.items [i - 1], list.items [i]);
        }
        list.selection = null;
        for (var i = first - 1; i < last - 1; i++) {
            list.selection = i;
        }
    };

    down.onClick = function () {
        var last = list.selection.pop().index;
        if (last == list.items.length - 1 || !contiguous(list.selection)) return;
        var first = list.selection[0].index;
        for (var i = last; i >= first; i--) {
            swap(list.items [i + 1], list.items [i]);
        }
        list.selection = null;
        for (var i = first + 1; i <= last + 1; i++) {
            list.selection = i;
        }
    };

    function contiguous(sel) {
        return sel.length == (sel[sel.length - 1].index - sel[0].index + 1);
    }

    function swap(x, y) {
        var temp = x.text;
        x.text = y.text;
        y.text = temp;
    }

    w.show();
}

//=== SAVE ===
function writeIni(jsonStr) {

    var iniFile = _addIni();
    var f = _writeIni(JSON.stringify(jsonStr));

    return f.fullName;

    function _addIni() {

        var iniName = 'ai_scriptmix',
            localStoreFolderPath = Folder.userData + '/LocalStore/',
            iniFolder,
            iniFile;

        iniFolder = new Folder(localStoreFolderPath + iniName);
        iniFolder.exists == false ? iniFolder.create() : '';
        iniFile = new File(iniFolder + '/' + iniName + '.ini');

        return iniFile;
    }

    function _writeIni(str) {
        if (iniFile.exists) {
            var iniFullName = iniFile.fullName;
            iniFile.remove();
            iniFile = new File(iniFullName);
        }

        iniFile.open('e');
        iniFile.writeln(str);
        iniFile.close();

        return iniFile;
    }
}

function readIni() {
    var str = 'Ups...',
        iniFile = _addIni();

    iniFile.open('r');
    str = iniFile.read();
    iniFile.close();

    return str;

    function _addIni() {

        var iniName = 'ai_scriptmix',
            localStoreFolderPath = Folder.userData + '/LocalStore/',
            iniFolder,
            iniFile;

        iniFolder = new Folder(localStoreFolderPath + iniName);
        iniFolder.exists == false ? iniFolder.create() : '';
        iniFile = new File(iniFolder + '/' + iniName + '.ini');

        return iniFile;
    }
}

function delIni() {
    var iniName = 'ai_scriptmix',
        localStoreFolderPath = Folder.userData + '/LocalStore/',
        iniFolder = new Folder(localStoreFolderPath + iniName),
        iniFile;

    if (!iniFolder.exists) {
        return;
    }
    iniFile = new File(iniFolder + '/' + iniName + '.ini');
    if (!iniFile.exists) {
        return;
    }
    iniFile.remove();
    // iniFolder.remove();

    return true;
}
