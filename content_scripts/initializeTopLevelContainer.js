// [We have a separate file  for this since this needs to run after module _u.CONSTS
// is available and before some of the other modules which make use of `_u.$topLevelContainer`
// (See the ordering of content script files in manifest.json)]

/* `_u.$topLevelContainer` defines an element which is used as a common container
 for  DOM elements that are are added to the page by us. (mod_main.js adds it to
 the DOM at an appropriate time). Using a common parent element allows us to cleanly
 separate elements added by us from the rest of the DOM.
 Note: We don't have to stick to this convention if there's a need
 to insert an element as a direct descendant of a specific page element.
 As of 2nd Feb 2015,however, we don't have any such elements.
 (An element like that should still use the `_u.CONSTS.class_unitsProjElem`
 class, which is used simply to indicate that the element belongs to UnitsProj)
*/
_u.$topLevelContainer = $('<div></div>').addClass(_u.CONSTS.class_unitsProjElem);

