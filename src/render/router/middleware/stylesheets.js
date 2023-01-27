/**
 * Define our route selectable stylesheets
 *
 * @type {Object}
 */
const stylesheets = {
    main:
      "@/render/assets/css/animationCommon.css",
  };
  
  const cssElement = document.getElementById("stylesheet");
  
  /**
   * Set the default fallback stylesheet
   * @type {[type]}
   */
  const defaultStylesheet = stylesheets.public;
  
  export default function stylesheet(to, from, next) {
    if (to.meta.stylesheet !== from.meta.stylesheet) {
      cssElement.href = stylesheets[to.meta.stylesheet] || defaultStylesheet;
    }
  
    return next();
  }