//@target illustrator
var storePath = Folder.userData + '/LocalStore/ai_scriptmix/',
    store     = new Folder(storePath),
    storeCfg  = new Folder(storePath + '/cfg/'),
    storeImg  = new Folder(storePath + '/img/'),
    storeJsx  = new Folder(storePath + '/jsx/'),
    btnsList  = storeCfg + '/btns_List.txt';

if (!store.exists) store.create();
if (!storeCfg.exists) storeCfg.create();
if (!storeImg.exists) storeImg.create();
if (!storeJsx.exists) storeJsx.create();

function addBtnToStore() {

  var resultName = '',
      sourseJsx, targJsx,
      soursePng, targPng;

  var w          = new Window('dialog', 'Add script button'),
      pn         = w.add('panel'),
      gr_addJsx  = pn.add('group'),
      gr_addPng  = pn.add('group'),
      gr_stdBtns = w.add('group'),

      btn_addJsx = gr_addJsx.add('button', undefined, 'Add jsx-script'),
      txt_addJsx = gr_addJsx.add('edittext'),

      btn_addPng = gr_addPng.add('button', undefined, 'Add png-image'),
      txt_addPng = gr_addPng.add('edittext'),

      btn_ok     = gr_stdBtns.add('button', undefined, 'Ok'),
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
    var f         = new File(btnsList),
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

function delBtnFromStore(delName) {

  var f         = new File(btnsList),
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
function readlnBtnsList() {

  var result = [],
      f      = new File(btnsList);

  if (!f.exists) return result;

  f.open('r');

  while (!f.eof) {
    result.push(f.readln());
  }
  f.close();

  //return result;
  return JSON.stringify(result);
}

function writelnBtnsList(arr) {

  arr = arr || [];
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


function changePrefs() { // !!! this function used in main.js

  var btnsNames = [],
      f         = new File(btnsList);
  f.open('r');
  while (!f.eof) {
    btnsNames.push(f.readln());
  }
  f.close();

  var w          = new Window('dialog', 'Rearrange buttons'),
      list       = w.add('listbox', undefined, btnsNames, {multiselect: true}),
      grUpDown   = w.add('group'),
      up         = grUpDown.add('button', undefined, 'Up'),
      down       = grUpDown.add('button', undefined, 'Down'),
      grOkCancel = w.add('group'),
      ok         = grOkCancel.add('button', undefined, 'OK')/*,
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

    var iniName              = 'ai_scriptmix',
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
  var str     = 'Ups...',
      iniFile = _addIni();

  iniFile.open('r');
  str = iniFile.read();
  iniFile.close();

  return str;

  function _addIni() {

    var iniName              = 'ai_scriptmix',
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
  var iniName              = 'ai_scriptmix',
      localStoreFolderPath = Folder.userData + '/LocalStore/',
      iniFolder            = new Folder(localStoreFolderPath + iniName),
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
