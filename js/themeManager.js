/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, document, CSInterface*/

/*
 Responsible for overwriting CSS at runtime according to CC app
 settings as defined by the end user.
 */

var themeManager = (function () {
  'use strict';

  /**
   * Convert the Color object to string in hexadecimal format;
   */
  function toHex(color, delta) {

    function computeValue(value, delta) {
      var computedValue = !isNaN(delta) ? value + delta : value;
      if (computedValue < 0) {
        computedValue = 0;
      } else if (computedValue > 255) {
        computedValue = 255;
      }

      computedValue = Math.floor(computedValue);

      computedValue = computedValue.toString(16);
      return computedValue.length === 1 ? '0' + computedValue : computedValue;
    }

    var hex = '';
    if (color) {
      hex =
        computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
    }
    return hex;
  }

  function reverseColor(color, delta) {
    return toHex({
                   red  : Math.abs(255 - color.red),
                   green: Math.abs(255 - color.green),
                   blue : Math.abs(255 - color.blue)
                 },
                 delta);
  }

  function addRule(stylesheetId, selector, rule) {
    var stylesheet = document.getElementById(stylesheetId);

    if (stylesheet) {
      stylesheet = stylesheet.sheet;
      if (stylesheet.addRule) {
        stylesheet.addRule(selector, rule);
      } else if (stylesheet.insertRule) {
        stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
      }
    }
  }

  /**
   * Update the theme with the AppSkinInfo retrieved from the host product.
   */
  function updateThemeWithAppSkinInfo(appSkinInfo) {

    var panelBgColor = appSkinInfo.panelBackgroundColor.color;
    var bgdColor = toHex(panelBgColor);

    var btnAdd       = document.getElementById('btn_addBtn'),
        btnReload    = document.getElementById('btn_reload'),
        btnSort      = document.getElementById('btn_prefs'),
        btnSource    = document.getElementById('btn_source'),
        btnScaleUp   = document.getElementById('btn_scale_up'),
        btnScaleDown = document.getElementById('btn_scale_down'),
        btnDefaults  = document.getElementById('btn_defaults');

    btnAdd.setAttribute('src', 'img/w_addBtn-01.png');
    btnReload.setAttribute('src', 'img/w_reload-01.png');
    btnSort.setAttribute('src', 'img/w_prefs-01.png');
    btnSource.setAttribute('src', 'img/w_jsx_source-01.png');
    btnScaleUp.setAttribute('src', 'img/w_scale-up-01.png');
    btnScaleDown.setAttribute('src', 'img/w_scale-down-01.png');
    btnDefaults.setAttribute('src', 'img/w_defaults-01.png');

    var darkBgdColor = toHex(panelBgColor, 60);

    var fontColor = 'F0F0F0';

    if (panelBgColor.red > 122) {
      fontColor = '000000';
      btnAdd.setAttribute('src', 'img/addBtn-01.png');
      btnReload.setAttribute('src', 'img/reload-01.png');
      btnSort.setAttribute('src', 'img/prefs-01.png');
      btnSource.setAttribute('src', 'img/jsx_source-01.png');
      btnScaleUp.setAttribute('src', 'img/scale-up-01.png');
      btnScaleDown.setAttribute('src', 'img/scale-down-01.png');
      btnDefaults.setAttribute('src', 'img/defaults-01.png');
    }

    var lightBgdColor = toHex(panelBgColor, -100);

    var styleId = 'hostStyle';

    addRule(styleId, '.hostElt', 'background-color:' + '#' + bgdColor);
    addRule(styleId, '.hostElt', 'font-size:' + appSkinInfo.baseFontSize + 'px;');
    addRule(styleId, '.hostElt', 'font-family:' + appSkinInfo.baseFontFamily);
    addRule(styleId, '.hostElt', 'color:' + '#' + fontColor);

    addRule(styleId, '.hostBgd', 'background-color:' + '#' + bgdColor);
    addRule(styleId, '.hostBgdDark', 'background-color: ' + '#' + darkBgdColor);
    addRule(styleId, '.hostBgdLight', 'background-color: ' + '#' + lightBgdColor);
    addRule(styleId, '.hostFontSize', 'font-size:' + appSkinInfo.baseFontSize + 'px;');
    addRule(styleId, '.hostFontFamily', 'font-family:' + appSkinInfo.baseFontFamily);
    addRule(styleId, '.hostFontColor', 'color:' + '#' + fontColor);

    addRule(styleId, '.hostFont', 'font-size:' + appSkinInfo.baseFontSize + 'px;');
    addRule(styleId, '.hostFont', 'font-family:' + appSkinInfo.baseFontFamily);
    addRule(styleId, '.hostFont', 'color:' + '#' + fontColor);

    addRule(styleId, '.hostButton', 'background-color:' + '#' + darkBgdColor);
    addRule(styleId, '.hostButton:hover', 'background-color:' + '#' + bgdColor);
    addRule(styleId, '.hostButton:active', 'background-color:' + '#' + darkBgdColor);
    addRule(styleId, '.hostButton', 'border-color:' + '#' + lightBgdColor);

    addRule(styleId, '.btn_serv', 'background-color:' + '#' + bgdColor);
    addRule(styleId, '.btn_serv:hover', 'background-color:' + '#' + darkBgdColor);
    addRule(styleId, '.btn_serv:active', 'background-color:' + '#' + bgdColor);
    addRule(styleId, '.btn_serv', 'border-color:' + '#' + lightBgdColor);

    addRule(styleId, '.btn:hover', 'opacity:' + '0.7');
    addRule(styleId, '.btn:active', 'opacity:' + '1');

  }

  function onAppThemeColorChanged(event) {
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    updateThemeWithAppSkinInfo(skinInfo);
  }

  function init() {

    var csInterface = new CSInterface();

    updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);

    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
  }

  return {
    init: init
  };

}());
