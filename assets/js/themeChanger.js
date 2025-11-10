/**
 * Скрипт отслеживает измение цветовой темы панели.
 * Всего 4 цветовые темы, подобных темам Иллюстратора CC-2024.
 *
 * Алгоритм работы частично взят из популярного скрипта themeManager.js David Barranca (?)
 * https://www.davidebarranca.com/2014/02/html-panels-tips-6-integrating-topcoat-css/
 *
 * Прием смены цветовой схемы основан на применении css-переменных.
 * Такой способ гораздо проще, чем скрипт.
 * Иногда он используется в веб-разработке для смены темы сайта.
 * CSS-переменные заданы в файле assets/css/css-varColors
 *
 * @param {Object} csInterface - объект для управления функционалом панели
 */
function changeTheme(csInterface) {
 let appSkinInfo = csInterface.hostEnvironment.appSkinInfo;

 updateThemeWithAppSkinInfo(appSkinInfo);

 csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);

 /**
  * Update the theme with the AppSkinInfo retrieved from the host product.
  */
 function updateThemeWithAppSkinInfo(appSkinInfo) {
  let fontSize = appSkinInfo.baseFontSize;
  let appBgColor = appSkinInfo.panelBackgroundColor.color;
  let html = document.documentElement;

  let fontFam = appSkinInfo.baseFontFamily;

  console.log(appBgColor);

  html.style.fontSize = fontSize + 'px';

  if (appBgColor.red == 50) {
   html.setAttribute('data-theme', 'darker');
  } else if (appBgColor.red == 83) {
   html.setAttribute('data-theme', 'dark');
  } else if (appBgColor.red == 184) {
   html.setAttribute('data-theme', 'light');
  } else if (appBgColor.red == 240) {
   html.removeAttribute('data-theme');
  }
 }

 function onAppThemeColorChanged(event) {
  var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
  updateThemeWithAppSkinInfo(skinInfo);
 }
}
