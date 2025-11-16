/**
 * jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50
 * */
/**
 * global $, window, location, CSInterface, SystemPath, themeManager
 * */

(function () {
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

  var userData = csInterface.getSystemPath(SystemPath.USER_DATA),
   store = userData + '/LocalStore/ai_scriptmix/',
   storeCfg = store + 'cfg/',
   storeImg = store + 'img/',
   storeJsx = store + 'jsx/',
   btnsNames = [],
   divBtns = document.getElementById('btns'),
   i,
   BTN_DEFAULT_WIDTH = 20,
   BTN_MIN_WIDTH = 1,
   BTN_MAX_WIDTH = 60;

  // load the buttons names from file
  loadButtons();
  document.querySelector('html').onselectstart = () => false;

  /**
   * SERVICE BUTTONS HANDLERS
   * */
  document.querySelector('#btn_addBtn').addEventListener('click', () => {
   csInterface.evalScript('addBtnToStore("' + store + '" )',
    function (result) {
     if (result.length != 0) {
      addBtnToInterface(result);
     }
    });
  });

  document.querySelector('#btn_prefs').addEventListener('click', () => {
   csInterface.evalScript('changePrefs("' + storeCfg + '" )',
    function (result) {
     if (result.length == 0) return;
     reloadPanel();
    });
  });

  document.querySelector('#btn_source').addEventListener('click', () => {
   csInterface.evalScript('openFolder("' + store + '")');
  });

  document.querySelector('#btn_scale_up').addEventListener('click', () => {

   let btns = document.querySelectorAll('.btn');
   let btnWidth = btns[0].style.width;
   btnWidth = parseFloat(btnWidth) + 1;
   if (btnWidth > BTN_MAX_WIDTH) btnWidth = BTN_MAX_WIDTH;

   btns.forEach((btn, i) => {
    btn.style.width = btnWidth + 'px';
    btn.style.height = btnWidth + 'px';
   });

   csInterface.evalScript('writeIni(' + JSON.stringify(btnWidth) + ')');
  });

  document.querySelector('#btn_scale_down').addEventListener('click', () => {

   let btns = document.querySelectorAll('.btn');
   let btnWidth = btns[0].style.width;
   btnWidth = parseFloat(btnWidth) - 1;
   if (btnWidth < BTN_MIN_WIDTH) btnWidth = BTN_MIN_WIDTH;

   btns.forEach((btn, i) => {
    btn.style.width = btnWidth + 'px';
    btn.style.height = btnWidth + 'px';
   });

   csInterface.evalScript('writeIni(' + JSON.stringify(btnWidth) + ')');
  });

  document.querySelector('#btn_defaults').addEventListener('click', () => {
   document.querySelectorAll('.btn').forEach(btn => {
    btn.style.width = BTN_DEFAULT_WIDTH + 'px';
    btn.style.height = BTN_DEFAULT_WIDTH + 'px';
   });

   csInterface.evalScript('writeIni(' + JSON.stringify(BTN_DEFAULT_WIDTH) + ')');
  });

  document.querySelector('#btn_reload').addEventListener('click', () => {
   reloadPanel();
  });

  /** * * * * * * * * * * * *
   * * * jsxSet library * * *
   * * * * * * * * * * * * **/

  function addBtnToInterface(btnName) {

   csInterface.evalScript('readIni()', function (res) {
    if (!res) res = BTN_DEFAULT_WIDTH;
    var btnW = +res;

    if (btnName.length == 0) return;
    var btn = document.createElement('input');
    btn.setAttribute('type', 'image');
    btn.setAttribute('class', 'btn');
    btn.setAttribute('src', storeImg + btnName + '.png');
    btn.setAttribute('title', btnName);
    btn.setAttribute('name', btnName);
    btn.setAttribute('id', 'btn_' + btnName);

    btn.addEventListener('click', function () {
     csInterface.evalScript('$.evalFile("' + storeJsx + btnName + '.jsx' + '")');
    });

    btn.oncontextmenu = function (e) {
     if (!e.shiftKey || !e.altKey) return false;
     var delName = this.name,
      btnToDel = document.getElementById('btn_' + btnName),
      confirmDel = confirm('Delete script: ' + delName + '?');
     if (confirmDel) {
      csInterface.evalScript('delBtnFromStore("' + delName + '" )', function (result) {
       btnToDel.remove();
      });
     }
     return false;
    };

    /* btn =*/
    divBtns.appendChild(btn);

    document.querySelector('#' + 'btn_' + btnName).style.width = btnW + 'px';
    document.querySelector('#' + 'btn_' + btnName).style.height = btnW + 'px';

   });
  }

  function loadButtons() {
   csInterface.evalScript('readlnBtnsList()', function (result) {
    if (result.match(/error/i)) {
     recursCount++;
     if (recursCount >= MAX_RECURS_COUNT) return false;
     loadButtons();
    }
    btnsNames = JSON.parse(result);

    for (i = 0; i < btnsNames.length; i++) {
     addBtnToInterface(btnsNames[i]);
    }
    csInterface.evalScript('readIni()', function (res) {
     if (!res) res = BTN_DEFAULT_WIDTH;
     var btnW = +res;
     if (btnW > BTN_MAX_WIDTH) btnW = BTN_MAX_WIDTH;
     if (btnW < BTN_MIN_WIDTH) btnW = BTN_MIN_WIDTH;

     var btns = document.querySelectorAll('.btn');
     btns.forEach(btn => {
      btn.style.width = btnW + 'px';
      btn.style.height = btnW + 'px';
     });

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
}());
