/**
 * Sans directive "use client" : importe par le layout serveur.
 */
export const THEME_KEY = "pd-theme";

/** Script inline execute dans <head> : evite le flash du mauvais theme au chargement. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
