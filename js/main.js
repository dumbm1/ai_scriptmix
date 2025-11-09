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
      recursCount      = 0;

  var csInterface = new CSInterface();
  init();

  function init() {


    themeManager.init();

    loadJSX('json2.js');

    var userData          = csInterface.getSystemPath(SystemPath.USER_DATA),
        store             = userData + '/LocalStore/ai_scriptmix/',
        storeCfg          = store + 'cfg/',
        storeImg          = store + 'img/',
        storeJsx          = store + 'jsx/',
        btnsNames         = [],
        divBtns           = document.getElementById('btns'),
        i,
        BTN_DEFAULT_WIDTH = 15,
        BTN_MIN_WIDTH     = 1,
        BTN_MAX_WIDTH     = 60;

    // load the buttons names from file
    loadButtons();
    document.querySelector('html').onselectstart = () => false;


    /**
     * SERVICE BUTTONS HANDLERS
     * */
    $('#btn_addBtn').click(function () {
      csInterface.evalScript('addBtnToStore("' + store + '" )',
                             function (result) {
                               if (result.length != 0) {
                                 addBtnToInterface(result);
                               }
                             });
    });
    $('#btn_prefs').click(function () {
      csInterface.evalScript('changePrefs("' + storeCfg + '" )',
                             function (result) {
                               if (result.length == 0) return;
                               reloadPanel();
                             });
    });
    $('#btn_reload').click(function () {
      reloadPanel();
    });
    $('#btn_source').click(function () {
      csInterface.evalScript('openFolder("' + store + '")');
    });
    $('#btn_scale_up').click(function () {
      var btnW = $('.btn').width();
      btnW++;
      if (btnW > BTN_MAX_WIDTH) btnW = BTN_MAX_WIDTH;
      $('.btn').width(btnW);
      $('.btn').height(btnW);
      csInterface.evalScript('writeIni(' + JSON.stringify(btnW) + ')');
    });
    $('#btn_scale_down').click(function () {
      var btnW = $('.btn').width();
      btnW--;
      if (btnW < BTN_MIN_WIDTH) btnW = BTN_MIN_WIDTH;
      $('.btn').width(btnW);
      $('.btn').height(btnW);
      csInterface.evalScript('writeIni(' + JSON.stringify(btnW) + ')');
    });
    $('#btn_defaults').click(function () {
      $('.btn').width(BTN_DEFAULT_WIDTH);
      $('.btn').height(BTN_DEFAULT_WIDTH);
      csInterface.evalScript('writeIni(' + JSON.stringify(BTN_DEFAULT_WIDTH) + ')');
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

        btn.oncontextmenu = function () {
          var delName    = this.name,
              btnToDel   = document.getElementById('btn_' + btnName),
              confirmDel = confirm('Delete script: ' + delName + '?');
          if (confirmDel) {
            csInterface.evalScript('delBtnFromStore("' + delName + '" )', function (result) {
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
}());
    
