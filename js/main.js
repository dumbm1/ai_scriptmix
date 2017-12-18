/**
 * jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50
 * */
/**
 * global $, window, location, CSInterface, SystemPath, themeManager
 * */

(function () {
  'use strict';
  var csInterface = new CSInterface();

  init();

  function init() {

    themeManager.init();

    loadJSX('json2.js');

    var userData  = csInterface.getSystemPath(SystemPath.USER_DATA),
        store     = userData + '/LocalStore/ai_scriptmix/',
        storeCfg  = store + 'cfg/',
        storeImg  = store + 'img/',
        storeJsx  = store + 'jsx/',
        btnsList  = storeCfg + 'btns_List.txt',
        btnsNames = [],

        divBtns   = document.getElementById('btns'),
        i;

    // load the buttons names from file
    csInterface.evalScript('readlnBtnsList()', function (result) {
      if (result.length == 0) return;
      btnsNames = JSON.parse(result);

      for (i = 0; i < btnsNames.length; i++) {
        addBtnToInterface(btnsNames[i]);
      }
    });

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
    /*$("#btn_killCEP").click(function () {
     /!*new CSInterface().requestOpenExtension('com.wk.ai_scriptmix.dialog');
     new CSInterface().closeExtension();*!/
     });*/

    $('#btn_source').click(function () {
      csInterface.evalScript('openFolder("' + store + '")');
    });

    /** * * * * * * * * * * * *
     * * * jsxSet library * * *
     * * * * * * * * * * * * **/

    function addBtnToInterface(btnName) {
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

      divBtns.appendChild(btn);
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
    
