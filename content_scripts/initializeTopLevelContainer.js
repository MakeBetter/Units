// This is done in a separate file since it can't be done before (say in initializeNamespace.js) since
// _u.CONSTS is not available then

/* This is used as a container for elements created by this program that we add to the page's DOM. (Technically,
 this would apply only to elements that don't need to be in the render flow of the page. As of 8 Apr 2013, this
 includes all elements added by this extension). This allows keeping modifications to the DOM localized inside a
 single element. */
_u.$topLevelContainer = $('<div></div>').addClass(_u.CONSTS.class_unitsProjElem);

