/*! jQuery v2.0.3 | (c) 2005, 2013 jQuery Foundation, Inc. | jquery.org/license
//@ sourceMappingURL=jquery-2.0.3.min.map
*/
(function(e,undefined){var t,n,r=typeof undefined,i=e.location,o=e.document,s=o.documentElement,a=e.jQuery,u=e.$,l={},c=[],p="2.0.3",f=c.concat,h=c.push,d=c.slice,g=c.indexOf,m=l.toString,y=l.hasOwnProperty,v=p.trim,x=function(e,n){return new x.fn.init(e,n,t)},b=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,w=/\S+/g,T=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,k=/^-ms-/,N=/-([\da-z])/gi,E=function(e,t){return t.toUpperCase()},S=function(){o.removeEventListener("DOMContentLoaded",S,!1),e.removeEventListener("load",S,!1),x.ready()};x.fn=x.prototype={jquery:p,constructor:x,init:function(e,t,n){var r,i;if(!e)return this;if("string"==typeof e){if(r="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:T.exec(e),!r||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof x?t[0]:t,x.merge(this,x.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:o,!0)),C.test(r[1])&&x.isPlainObject(t))for(r in t)x.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return i=o.getElementById(r[2]),i&&i.parentNode&&(this.length=1,this[0]=i),this.context=o,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):x.isFunction(e)?n.ready(e):(e.selector!==undefined&&(this.selector=e.selector,this.context=e.context),x.makeArray(e,this))},selector:"",length:0,toArray:function(){return d.call(this)},get:function(e){return null==e?this.toArray():0>e?this[this.length+e]:this[e]},pushStack:function(e){var t=x.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return x.each(this,e,t)},ready:function(e){return x.ready.promise().done(e),this},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(0>e?t:0);return this.pushStack(n>=0&&t>n?[this[n]]:[])},map:function(e){return this.pushStack(x.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:h,sort:[].sort,splice:[].splice},x.fn.init.prototype=x.fn,x.extend=x.fn.extend=function(){var e,t,n,r,i,o,s=arguments[0]||{},a=1,u=arguments.length,l=!1;for("boolean"==typeof s&&(l=s,s=arguments[1]||{},a=2),"object"==typeof s||x.isFunction(s)||(s={}),u===a&&(s=this,--a);u>a;a++)if(null!=(e=arguments[a]))for(t in e)n=s[t],r=e[t],s!==r&&(l&&r&&(x.isPlainObject(r)||(i=x.isArray(r)))?(i?(i=!1,o=n&&x.isArray(n)?n:[]):o=n&&x.isPlainObject(n)?n:{},s[t]=x.extend(l,o,r)):r!==undefined&&(s[t]=r));return s},x.extend({expando:"jQuery"+(p+Math.random()).replace(/\D/g,""),noConflict:function(t){return e.$===x&&(e.$=u),t&&e.jQuery===x&&(e.jQuery=a),x},isReady:!1,readyWait:1,holdReady:function(e){e?x.readyWait++:x.ready(!0)},ready:function(e){(e===!0?--x.readyWait:x.isReady)||(x.isReady=!0,e!==!0&&--x.readyWait>0||(n.resolveWith(o,[x]),x.fn.trigger&&x(o).trigger("ready").off("ready")))},isFunction:function(e){return"function"===x.type(e)},isArray:Array.isArray,isWindow:function(e){return null!=e&&e===e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[m.call(e)]||"object":typeof e},isPlainObject:function(e){if("object"!==x.type(e)||e.nodeType||x.isWindow(e))return!1;try{if(e.constructor&&!y.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(t){return!1}return!0},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw Error(e)},parseHTML:function(e,t,n){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(n=t,t=!1),t=t||o;var r=C.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=x.buildFragment([e],t,i),i&&x(i).remove(),x.merge([],r.childNodes))},parseJSON:JSON.parse,parseXML:function(e){var t,n;if(!e||"string"!=typeof e)return null;try{n=new DOMParser,t=n.parseFromString(e,"text/xml")}catch(r){t=undefined}return(!t||t.getElementsByTagName("parsererror").length)&&x.error("Invalid XML: "+e),t},noop:function(){},globalEval:function(e){var t,n=eval;e=x.trim(e),e&&(1===e.indexOf("use strict")?(t=o.createElement("script"),t.text=e,o.head.appendChild(t).parentNode.removeChild(t)):n(e))},camelCase:function(e){return e.replace(k,"ms-").replace(N,E)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,o=e.length,s=j(e);if(n){if(s){for(;o>i;i++)if(r=t.apply(e[i],n),r===!1)break}else for(i in e)if(r=t.apply(e[i],n),r===!1)break}else if(s){for(;o>i;i++)if(r=t.call(e[i],i,e[i]),r===!1)break}else for(i in e)if(r=t.call(e[i],i,e[i]),r===!1)break;return e},trim:function(e){return null==e?"":v.call(e)},makeArray:function(e,t){var n=t||[];return null!=e&&(j(Object(e))?x.merge(n,"string"==typeof e?[e]:e):h.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:g.call(t,e,n)},merge:function(e,t){var n=t.length,r=e.length,i=0;if("number"==typeof n)for(;n>i;i++)e[r++]=t[i];else while(t[i]!==undefined)e[r++]=t[i++];return e.length=r,e},grep:function(e,t,n){var r,i=[],o=0,s=e.length;for(n=!!n;s>o;o++)r=!!t(e[o],o),n!==r&&i.push(e[o]);return i},map:function(e,t,n){var r,i=0,o=e.length,s=j(e),a=[];if(s)for(;o>i;i++)r=t(e[i],i,n),null!=r&&(a[a.length]=r);else for(i in e)r=t(e[i],i,n),null!=r&&(a[a.length]=r);return f.apply([],a)},guid:1,proxy:function(e,t){var n,r,i;return"string"==typeof t&&(n=e[t],t=e,e=n),x.isFunction(e)?(r=d.call(arguments,2),i=function(){return e.apply(t||this,r.concat(d.call(arguments)))},i.guid=e.guid=e.guid||x.guid++,i):undefined},access:function(e,t,n,r,i,o,s){var a=0,u=e.length,l=null==n;if("object"===x.type(n)){i=!0;for(a in n)x.access(e,t,a,n[a],!0,o,s)}else if(r!==undefined&&(i=!0,x.isFunction(r)||(s=!0),l&&(s?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(x(e),n)})),t))for(;u>a;a++)t(e[a],n,s?r:r.call(e[a],a,t(e[a],n)));return i?e:l?t.call(e):u?t(e[0],n):o},now:Date.now,swap:function(e,t,n,r){var i,o,s={};for(o in t)s[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=s[o];return i}}),x.ready.promise=function(t){return n||(n=x.Deferred(),"complete"===o.readyState?setTimeout(x.ready):(o.addEventListener("DOMContentLoaded",S,!1),e.addEventListener("load",S,!1))),n.promise(t)},x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function j(e){var t=e.length,n=x.type(e);return x.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===n||"function"!==n&&(0===t||"number"==typeof t&&t>0&&t-1 in e)}t=x(o),function(e,undefined){var t,n,r,i,o,s,a,u,l,c,p,f,h,d,g,m,y,v="sizzle"+-new Date,b=e.document,w=0,T=0,C=st(),k=st(),N=st(),E=!1,S=function(e,t){return e===t?(E=!0,0):0},j=typeof undefined,D=1<<31,A={}.hasOwnProperty,L=[],q=L.pop,H=L.push,O=L.push,F=L.slice,P=L.indexOf||function(e){var t=0,n=this.length;for(;n>t;t++)if(this[t]===e)return t;return-1},R="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",W="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",$=W.replace("w","w#"),B="\\["+M+"*("+W+")"+M+"*(?:([*^$|!~]?=)"+M+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+$+")|)|)"+M+"*\\]",I=":("+W+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+B.replace(3,8)+")*)|.*)\\)|)",z=RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),_=RegExp("^"+M+"*,"+M+"*"),X=RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=RegExp(M+"*[+~]"),Y=RegExp("="+M+"*([^\\]'\"]*)"+M+"*\\]","g"),V=RegExp(I),G=RegExp("^"+$+"$"),J={ID:RegExp("^#("+W+")"),CLASS:RegExp("^\\.("+W+")"),TAG:RegExp("^("+W.replace("w","w*")+")"),ATTR:RegExp("^"+B),PSEUDO:RegExp("^"+I),CHILD:RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:RegExp("^(?:"+R+")$","i"),needsContext:RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/^[^{]+\{\s*\[native \w/,K=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Z=/^(?:input|select|textarea|button)$/i,et=/^h\d$/i,tt=/'|\\/g,nt=RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),rt=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:0>r?String.fromCharCode(r+65536):String.fromCharCode(55296|r>>10,56320|1023&r)};try{O.apply(L=F.call(b.childNodes),b.childNodes),L[b.childNodes.length].nodeType}catch(it){O={apply:L.length?function(e,t){H.apply(e,F.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function ot(e,t,r,i){var o,s,a,u,l,f,g,m,x,w;if((t?t.ownerDocument||t:b)!==p&&c(t),t=t||p,r=r||[],!e||"string"!=typeof e)return r;if(1!==(u=t.nodeType)&&9!==u)return[];if(h&&!i){if(o=K.exec(e))if(a=o[1]){if(9===u){if(s=t.getElementById(a),!s||!s.parentNode)return r;if(s.id===a)return r.push(s),r}else if(t.ownerDocument&&(s=t.ownerDocument.getElementById(a))&&y(t,s)&&s.id===a)return r.push(s),r}else{if(o[2])return O.apply(r,t.getElementsByTagName(e)),r;if((a=o[3])&&n.getElementsByClassName&&t.getElementsByClassName)return O.apply(r,t.getElementsByClassName(a)),r}if(n.qsa&&(!d||!d.test(e))){if(m=g=v,x=t,w=9===u&&e,1===u&&"object"!==t.nodeName.toLowerCase()){f=gt(e),(g=t.getAttribute("id"))?m=g.replace(tt,"\\$&"):t.setAttribute("id",m),m="[id='"+m+"'] ",l=f.length;while(l--)f[l]=m+mt(f[l]);x=U.test(e)&&t.parentNode||t,w=f.join(",")}if(w)try{return O.apply(r,x.querySelectorAll(w)),r}catch(T){}finally{g||t.removeAttribute("id")}}}return kt(e.replace(z,"$1"),t,r,i)}function st(){var e=[];function t(n,r){return e.push(n+=" ")>i.cacheLength&&delete t[e.shift()],t[n]=r}return t}function at(e){return e[v]=!0,e}function ut(e){var t=p.createElement("div");try{return!!e(t)}catch(n){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function lt(e,t){var n=e.split("|"),r=e.length;while(r--)i.attrHandle[n[r]]=t}function ct(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&(~t.sourceIndex||D)-(~e.sourceIndex||D);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function pt(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function ft(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function ht(e){return at(function(t){return t=+t,at(function(n,r){var i,o=e([],n.length,t),s=o.length;while(s--)n[i=o[s]]&&(n[i]=!(r[i]=n[i]))})})}s=ot.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},n=ot.support={},c=ot.setDocument=function(e){var t=e?e.ownerDocument||e:b,r=t.defaultView;return t!==p&&9===t.nodeType&&t.documentElement?(p=t,f=t.documentElement,h=!s(t),r&&r.attachEvent&&r!==r.top&&r.attachEvent("onbeforeunload",function(){c()}),n.attributes=ut(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=ut(function(e){return e.appendChild(t.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=ut(function(e){return e.innerHTML="<div class='a'></div><div class='a i'></div>",e.firstChild.className="i",2===e.getElementsByClassName("i").length}),n.getById=ut(function(e){return f.appendChild(e).id=v,!t.getElementsByName||!t.getElementsByName(v).length}),n.getById?(i.find.ID=function(e,t){if(typeof t.getElementById!==j&&h){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},i.filter.ID=function(e){var t=e.replace(nt,rt);return function(e){return e.getAttribute("id")===t}}):(delete i.find.ID,i.filter.ID=function(e){var t=e.replace(nt,rt);return function(e){var n=typeof e.getAttributeNode!==j&&e.getAttributeNode("id");return n&&n.value===t}}),i.find.TAG=n.getElementsByTagName?function(e,t){return typeof t.getElementsByTagName!==j?t.getElementsByTagName(e):undefined}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},i.find.CLASS=n.getElementsByClassName&&function(e,t){return typeof t.getElementsByClassName!==j&&h?t.getElementsByClassName(e):undefined},g=[],d=[],(n.qsa=Q.test(t.querySelectorAll))&&(ut(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||d.push("\\["+M+"*(?:value|"+R+")"),e.querySelectorAll(":checked").length||d.push(":checked")}),ut(function(e){var n=t.createElement("input");n.setAttribute("type","hidden"),e.appendChild(n).setAttribute("t",""),e.querySelectorAll("[t^='']").length&&d.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll(":enabled").length||d.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),d.push(",.*:")})),(n.matchesSelector=Q.test(m=f.webkitMatchesSelector||f.mozMatchesSelector||f.oMatchesSelector||f.msMatchesSelector))&&ut(function(e){n.disconnectedMatch=m.call(e,"div"),m.call(e,"[s!='']:x"),g.push("!=",I)}),d=d.length&&RegExp(d.join("|")),g=g.length&&RegExp(g.join("|")),y=Q.test(f.contains)||f.compareDocumentPosition?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},S=f.compareDocumentPosition?function(e,r){if(e===r)return E=!0,0;var i=r.compareDocumentPosition&&e.compareDocumentPosition&&e.compareDocumentPosition(r);return i?1&i||!n.sortDetached&&r.compareDocumentPosition(e)===i?e===t||y(b,e)?-1:r===t||y(b,r)?1:l?P.call(l,e)-P.call(l,r):0:4&i?-1:1:e.compareDocumentPosition?-1:1}:function(e,n){var r,i=0,o=e.parentNode,s=n.parentNode,a=[e],u=[n];if(e===n)return E=!0,0;if(!o||!s)return e===t?-1:n===t?1:o?-1:s?1:l?P.call(l,e)-P.call(l,n):0;if(o===s)return ct(e,n);r=e;while(r=r.parentNode)a.unshift(r);r=n;while(r=r.parentNode)u.unshift(r);while(a[i]===u[i])i++;return i?ct(a[i],u[i]):a[i]===b?-1:u[i]===b?1:0},t):p},ot.matches=function(e,t){return ot(e,null,null,t)},ot.matchesSelector=function(e,t){if((e.ownerDocument||e)!==p&&c(e),t=t.replace(Y,"='$1']"),!(!n.matchesSelector||!h||g&&g.test(t)||d&&d.test(t)))try{var r=m.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(i){}return ot(t,p,null,[e]).length>0},ot.contains=function(e,t){return(e.ownerDocument||e)!==p&&c(e),y(e,t)},ot.attr=function(e,t){(e.ownerDocument||e)!==p&&c(e);var r=i.attrHandle[t.toLowerCase()],o=r&&A.call(i.attrHandle,t.toLowerCase())?r(e,t,!h):undefined;return o===undefined?n.attributes||!h?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null:o},ot.error=function(e){throw Error("Syntax error, unrecognized expression: "+e)},ot.uniqueSort=function(e){var t,r=[],i=0,o=0;if(E=!n.detectDuplicates,l=!n.sortStable&&e.slice(0),e.sort(S),E){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1)}return e},o=ot.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=o(e)}else if(3===i||4===i)return e.nodeValue}else for(;t=e[r];r++)n+=o(t);return n},i=ot.selectors={cacheLength:50,createPseudo:at,match:J,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(nt,rt),e[3]=(e[4]||e[5]||"").replace(nt,rt),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||ot.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&ot.error(e[0]),e},PSEUDO:function(e){var t,n=!e[5]&&e[2];return J.CHILD.test(e[0])?null:(e[3]&&e[4]!==undefined?e[2]=e[4]:n&&V.test(n)&&(t=gt(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(nt,rt).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=C[e+" "];return t||(t=RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&C(e,function(e){return t.test("string"==typeof e.className&&e.className||typeof e.getAttribute!==j&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=ot.attr(r,e);return null==i?"!="===t:t?(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i+" ").indexOf(n)>-1:"|="===t?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),s="last"!==e.slice(-4),a="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,p,f,h,d,g=o!==s?"nextSibling":"previousSibling",m=t.parentNode,y=a&&t.nodeName.toLowerCase(),x=!u&&!a;if(m){if(o){while(g){p=t;while(p=p[g])if(a?p.nodeName.toLowerCase()===y:1===p.nodeType)return!1;d=g="only"===e&&!d&&"nextSibling"}return!0}if(d=[s?m.firstChild:m.lastChild],s&&x){c=m[v]||(m[v]={}),l=c[e]||[],h=l[0]===w&&l[1],f=l[0]===w&&l[2],p=h&&m.childNodes[h];while(p=++h&&p&&p[g]||(f=h=0)||d.pop())if(1===p.nodeType&&++f&&p===t){c[e]=[w,h,f];break}}else if(x&&(l=(t[v]||(t[v]={}))[e])&&l[0]===w)f=l[1];else while(p=++h&&p&&p[g]||(f=h=0)||d.pop())if((a?p.nodeName.toLowerCase()===y:1===p.nodeType)&&++f&&(x&&((p[v]||(p[v]={}))[e]=[w,f]),p===t))break;return f-=i,f===r||0===f%r&&f/r>=0}}},PSEUDO:function(e,t){var n,r=i.pseudos[e]||i.setFilters[e.toLowerCase()]||ot.error("unsupported pseudo: "+e);return r[v]?r(t):r.length>1?(n=[e,e,"",t],i.setFilters.hasOwnProperty(e.toLowerCase())?at(function(e,n){var i,o=r(e,t),s=o.length;while(s--)i=P.call(e,o[s]),e[i]=!(n[i]=o[s])}):function(e){return r(e,0,n)}):r}},pseudos:{not:at(function(e){var t=[],n=[],r=a(e.replace(z,"$1"));return r[v]?at(function(e,t,n,i){var o,s=r(e,null,i,[]),a=e.length;while(a--)(o=s[a])&&(e[a]=!(t[a]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),!n.pop()}}),has:at(function(e){return function(t){return ot(e,t).length>0}}),contains:at(function(e){return function(t){return(t.textContent||t.innerText||o(t)).indexOf(e)>-1}}),lang:at(function(e){return G.test(e||"")||ot.error("unsupported lang: "+e),e=e.replace(nt,rt).toLowerCase(),function(t){var n;do if(n=h?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===f},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeName>"@"||3===e.nodeType||4===e.nodeType)return!1;return!0},parent:function(e){return!i.pseudos.empty(e)},header:function(e){return et.test(e.nodeName)},input:function(e){return Z.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||t.toLowerCase()===e.type)},first:ht(function(){return[0]}),last:ht(function(e,t){return[t-1]}),eq:ht(function(e,t,n){return[0>n?n+t:n]}),even:ht(function(e,t){var n=0;for(;t>n;n+=2)e.push(n);return e}),odd:ht(function(e,t){var n=1;for(;t>n;n+=2)e.push(n);return e}),lt:ht(function(e,t,n){var r=0>n?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:ht(function(e,t,n){var r=0>n?n+t:n;for(;t>++r;)e.push(r);return e})}},i.pseudos.nth=i.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})i.pseudos[t]=pt(t);for(t in{submit:!0,reset:!0})i.pseudos[t]=ft(t);function dt(){}dt.prototype=i.filters=i.pseudos,i.setFilters=new dt;function gt(e,t){var n,r,o,s,a,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);a=e,u=[],l=i.preFilter;while(a){(!n||(r=_.exec(a)))&&(r&&(a=a.slice(r[0].length)||a),u.push(o=[])),n=!1,(r=X.exec(a))&&(n=r.shift(),o.push({value:n,type:r[0].replace(z," ")}),a=a.slice(n.length));for(s in i.filter)!(r=J[s].exec(a))||l[s]&&!(r=l[s](r))||(n=r.shift(),o.push({value:n,type:s,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?ot.error(e):k(e,u).slice(0)}function mt(e){var t=0,n=e.length,r="";for(;n>t;t++)r+=e[t].value;return r}function yt(e,t,n){var i=t.dir,o=n&&"parentNode"===i,s=T++;return t.first?function(t,n,r){while(t=t[i])if(1===t.nodeType||o)return e(t,n,r)}:function(t,n,a){var u,l,c,p=w+" "+s;if(a){while(t=t[i])if((1===t.nodeType||o)&&e(t,n,a))return!0}else while(t=t[i])if(1===t.nodeType||o)if(c=t[v]||(t[v]={}),(l=c[i])&&l[0]===p){if((u=l[1])===!0||u===r)return u===!0}else if(l=c[i]=[p],l[1]=e(t,n,a)||r,l[1]===!0)return!0}}function vt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function xt(e,t,n,r,i){var o,s=[],a=0,u=e.length,l=null!=t;for(;u>a;a++)(o=e[a])&&(!n||n(o,r,i))&&(s.push(o),l&&t.push(a));return s}function bt(e,t,n,r,i,o){return r&&!r[v]&&(r=bt(r)),i&&!i[v]&&(i=bt(i,o)),at(function(o,s,a,u){var l,c,p,f=[],h=[],d=s.length,g=o||Ct(t||"*",a.nodeType?[a]:a,[]),m=!e||!o&&t?g:xt(g,f,e,a,u),y=n?i||(o?e:d||r)?[]:s:m;if(n&&n(m,y,a,u),r){l=xt(y,h),r(l,[],a,u),c=l.length;while(c--)(p=l[c])&&(y[h[c]]=!(m[h[c]]=p))}if(o){if(i||e){if(i){l=[],c=y.length;while(c--)(p=y[c])&&l.push(m[c]=p);i(null,y=[],l,u)}c=y.length;while(c--)(p=y[c])&&(l=i?P.call(o,p):f[c])>-1&&(o[l]=!(s[l]=p))}}else y=xt(y===s?y.splice(d,y.length):y),i?i(null,s,y,u):O.apply(s,y)})}function wt(e){var t,n,r,o=e.length,s=i.relative[e[0].type],a=s||i.relative[" "],l=s?1:0,c=yt(function(e){return e===t},a,!0),p=yt(function(e){return P.call(t,e)>-1},a,!0),f=[function(e,n,r){return!s&&(r||n!==u)||((t=n).nodeType?c(e,n,r):p(e,n,r))}];for(;o>l;l++)if(n=i.relative[e[l].type])f=[yt(vt(f),n)];else{if(n=i.filter[e[l].type].apply(null,e[l].matches),n[v]){for(r=++l;o>r;r++)if(i.relative[e[r].type])break;return bt(l>1&&vt(f),l>1&&mt(e.slice(0,l-1).concat({value:" "===e[l-2].type?"*":""})).replace(z,"$1"),n,r>l&&wt(e.slice(l,r)),o>r&&wt(e=e.slice(r)),o>r&&mt(e))}f.push(n)}return vt(f)}function Tt(e,t){var n=0,o=t.length>0,s=e.length>0,a=function(a,l,c,f,h){var d,g,m,y=[],v=0,x="0",b=a&&[],T=null!=h,C=u,k=a||s&&i.find.TAG("*",h&&l.parentNode||l),N=w+=null==C?1:Math.random()||.1;for(T&&(u=l!==p&&l,r=n);null!=(d=k[x]);x++){if(s&&d){g=0;while(m=e[g++])if(m(d,l,c)){f.push(d);break}T&&(w=N,r=++n)}o&&((d=!m&&d)&&v--,a&&b.push(d))}if(v+=x,o&&x!==v){g=0;while(m=t[g++])m(b,y,l,c);if(a){if(v>0)while(x--)b[x]||y[x]||(y[x]=q.call(f));y=xt(y)}O.apply(f,y),T&&!a&&y.length>0&&v+t.length>1&&ot.uniqueSort(f)}return T&&(w=N,u=C),b};return o?at(a):a}a=ot.compile=function(e,t){var n,r=[],i=[],o=N[e+" "];if(!o){t||(t=gt(e)),n=t.length;while(n--)o=wt(t[n]),o[v]?r.push(o):i.push(o);o=N(e,Tt(i,r))}return o};function Ct(e,t,n){var r=0,i=t.length;for(;i>r;r++)ot(e,t[r],n);return n}function kt(e,t,r,o){var s,u,l,c,p,f=gt(e);if(!o&&1===f.length){if(u=f[0]=f[0].slice(0),u.length>2&&"ID"===(l=u[0]).type&&n.getById&&9===t.nodeType&&h&&i.relative[u[1].type]){if(t=(i.find.ID(l.matches[0].replace(nt,rt),t)||[])[0],!t)return r;e=e.slice(u.shift().value.length)}s=J.needsContext.test(e)?0:u.length;while(s--){if(l=u[s],i.relative[c=l.type])break;if((p=i.find[c])&&(o=p(l.matches[0].replace(nt,rt),U.test(u[0].type)&&t.parentNode||t))){if(u.splice(s,1),e=o.length&&mt(u),!e)return O.apply(r,o),r;break}}}return a(e,f)(o,t,!h,r,U.test(e)),r}n.sortStable=v.split("").sort(S).join("")===v,n.detectDuplicates=E,c(),n.sortDetached=ut(function(e){return 1&e.compareDocumentPosition(p.createElement("div"))}),ut(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||lt("type|href|height|width",function(e,t,n){return n?undefined:e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&ut(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||lt("value",function(e,t,n){return n||"input"!==e.nodeName.toLowerCase()?undefined:e.defaultValue}),ut(function(e){return null==e.getAttribute("disabled")})||lt(R,function(e,t,n){var r;return n?undefined:(r=e.getAttributeNode(t))&&r.specified?r.value:e[t]===!0?t.toLowerCase():null}),x.find=ot,x.expr=ot.selectors,x.expr[":"]=x.expr.pseudos,x.unique=ot.uniqueSort,x.text=ot.getText,x.isXMLDoc=ot.isXML,x.contains=ot.contains}(e);var D={};function A(e){var t=D[e]={};return x.each(e.match(w)||[],function(e,n){t[n]=!0}),t}x.Callbacks=function(e){e="string"==typeof e?D[e]||A(e):x.extend({},e);var t,n,r,i,o,s,a=[],u=!e.once&&[],l=function(p){for(t=e.memory&&p,n=!0,s=i||0,i=0,o=a.length,r=!0;a&&o>s;s++)if(a[s].apply(p[0],p[1])===!1&&e.stopOnFalse){t=!1;break}r=!1,a&&(u?u.length&&l(u.shift()):t?a=[]:c.disable())},c={add:function(){if(a){var n=a.length;(function s(t){x.each(t,function(t,n){var r=x.type(n);"function"===r?e.unique&&c.has(n)||a.push(n):n&&n.length&&"string"!==r&&s(n)})})(arguments),r?o=a.length:t&&(i=n,l(t))}return this},remove:function(){return a&&x.each(arguments,function(e,t){var n;while((n=x.inArray(t,a,n))>-1)a.splice(n,1),r&&(o>=n&&o--,s>=n&&s--)}),this},has:function(e){return e?x.inArray(e,a)>-1:!(!a||!a.length)},empty:function(){return a=[],o=0,this},disable:function(){return a=u=t=undefined,this},disabled:function(){return!a},lock:function(){return u=undefined,t||c.disable(),this},locked:function(){return!u},fireWith:function(e,t){return!a||n&&!u||(t=t||[],t=[e,t.slice?t.slice():t],r?u.push(t):l(t)),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!n}};return c},x.extend({Deferred:function(e){var t=[["resolve","done",x.Callbacks("once memory"),"resolved"],["reject","fail",x.Callbacks("once memory"),"rejected"],["notify","progress",x.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return x.Deferred(function(n){x.each(t,function(t,o){var s=o[0],a=x.isFunction(e[t])&&e[t];i[o[1]](function(){var e=a&&a.apply(this,arguments);e&&x.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===r?n.promise():this,a?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?x.extend(e,r):r}},i={};return r.pipe=r.then,x.each(t,function(e,o){var s=o[2],a=o[3];r[o[1]]=s.add,a&&s.add(function(){n=a},t[1^e][2].disable,t[2][2].lock),i[o[0]]=function(){return i[o[0]+"With"](this===i?r:this,arguments),this},i[o[0]+"With"]=s.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=d.call(arguments),r=n.length,i=1!==r||e&&x.isFunction(e.promise)?r:0,o=1===i?e:x.Deferred(),s=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?d.call(arguments):r,n===a?o.notifyWith(t,n):--i||o.resolveWith(t,n)}},a,u,l;if(r>1)for(a=Array(r),u=Array(r),l=Array(r);r>t;t++)n[t]&&x.isFunction(n[t].promise)?n[t].promise().done(s(t,l,n)).fail(o.reject).progress(s(t,u,a)):--i;return i||o.resolveWith(l,n),o.promise()}}),x.support=function(t){var n=o.createElement("input"),r=o.createDocumentFragment(),i=o.createElement("div"),s=o.createElement("select"),a=s.appendChild(o.createElement("option"));return n.type?(n.type="checkbox",t.checkOn=""!==n.value,t.optSelected=a.selected,t.reliableMarginRight=!0,t.boxSizingReliable=!0,t.pixelPosition=!1,n.checked=!0,t.noCloneChecked=n.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!a.disabled,n=o.createElement("input"),n.value="t",n.type="radio",t.radioValue="t"===n.value,n.setAttribute("checked","t"),n.setAttribute("name","t"),r.appendChild(n),t.checkClone=r.cloneNode(!0).cloneNode(!0).lastChild.checked,t.focusinBubbles="onfocusin"in e,i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",t.clearCloneStyle="content-box"===i.style.backgroundClip,x(function(){var n,r,s="padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",a=o.getElementsByTagName("body")[0];a&&(n=o.createElement("div"),n.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",a.appendChild(n).appendChild(i),i.innerHTML="",i.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",x.swap(a,null!=a.style.zoom?{zoom:1}:{},function(){t.boxSizing=4===i.offsetWidth}),e.getComputedStyle&&(t.pixelPosition="1%"!==(e.getComputedStyle(i,null)||{}).top,t.boxSizingReliable="4px"===(e.getComputedStyle(i,null)||{width:"4px"}).width,r=i.appendChild(o.createElement("div")),r.style.cssText=i.style.cssText=s,r.style.marginRight=r.style.width="0",i.style.width="1px",t.reliableMarginRight=!parseFloat((e.getComputedStyle(r,null)||{}).marginRight)),a.removeChild(n))}),t):t}({});var L,q,H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,O=/([A-Z])/g;function F(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=x.expando+Math.random()}F.uid=1,F.accepts=function(e){return e.nodeType?1===e.nodeType||9===e.nodeType:!0},F.prototype={key:function(e){if(!F.accepts(e))return 0;var t={},n=e[this.expando];if(!n){n=F.uid++;try{t[this.expando]={value:n},Object.defineProperties(e,t)}catch(r){t[this.expando]=n,x.extend(e,t)}}return this.cache[n]||(this.cache[n]={}),n},set:function(e,t,n){var r,i=this.key(e),o=this.cache[i];if("string"==typeof t)o[t]=n;else if(x.isEmptyObject(o))x.extend(this.cache[i],t);else for(r in t)o[r]=t[r];return o},get:function(e,t){var n=this.cache[this.key(e)];return t===undefined?n:n[t]},access:function(e,t,n){var r;return t===undefined||t&&"string"==typeof t&&n===undefined?(r=this.get(e,t),r!==undefined?r:this.get(e,x.camelCase(t))):(this.set(e,t,n),n!==undefined?n:t)},remove:function(e,t){var n,r,i,o=this.key(e),s=this.cache[o];if(t===undefined)this.cache[o]={};else{x.isArray(t)?r=t.concat(t.map(x.camelCase)):(i=x.camelCase(t),t in s?r=[t,i]:(r=i,r=r in s?[r]:r.match(w)||[])),n=r.length;while(n--)delete s[r[n]]}},hasData:function(e){return!x.isEmptyObject(this.cache[e[this.expando]]||{})},discard:function(e){e[this.expando]&&delete this.cache[e[this.expando]]}},L=new F,q=new F,x.extend({acceptData:F.accepts,hasData:function(e){return L.hasData(e)||q.hasData(e)},data:function(e,t,n){return L.access(e,t,n)},removeData:function(e,t){L.remove(e,t)},_data:function(e,t,n){return q.access(e,t,n)},_removeData:function(e,t){q.remove(e,t)}}),x.fn.extend({data:function(e,t){var n,r,i=this[0],o=0,s=null;if(e===undefined){if(this.length&&(s=L.get(i),1===i.nodeType&&!q.get(i,"hasDataAttrs"))){for(n=i.attributes;n.length>o;o++)r=n[o].name,0===r.indexOf("data-")&&(r=x.camelCase(r.slice(5)),P(i,r,s[r]));q.set(i,"hasDataAttrs",!0)}return s}return"object"==typeof e?this.each(function(){L.set(this,e)}):x.access(this,function(t){var n,r=x.camelCase(e);if(i&&t===undefined){if(n=L.get(i,e),n!==undefined)return n;if(n=L.get(i,r),n!==undefined)return n;if(n=P(i,r,undefined),n!==undefined)return n}else this.each(function(){var n=L.get(this,r);L.set(this,r,t),-1!==e.indexOf("-")&&n!==undefined&&L.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){L.remove(this,e)})}});function P(e,t,n){var r;if(n===undefined&&1===e.nodeType)if(r="data-"+t.replace(O,"-$1").toLowerCase(),n=e.getAttribute(r),"string"==typeof n){try{n="true"===n?!0:"false"===n?!1:"null"===n?null:+n+""===n?+n:H.test(n)?JSON.parse(n):n}catch(i){}L.set(e,t,n)}else n=undefined;return n}x.extend({queue:function(e,t,n){var r;return e?(t=(t||"fx")+"queue",r=q.get(e,t),n&&(!r||x.isArray(n)?r=q.access(e,t,x.makeArray(n)):r.push(n)),r||[]):undefined},dequeue:function(e,t){t=t||"fx";var n=x.queue(e,t),r=n.length,i=n.shift(),o=x._queueHooks(e,t),s=function(){x.dequeue(e,t)
};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,s,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return q.get(e,n)||q.access(e,n,{empty:x.Callbacks("once memory").add(function(){q.remove(e,[t+"queue",n])})})}}),x.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),n>arguments.length?x.queue(this[0],e):t===undefined?this:this.each(function(){var n=x.queue(this,e,t);x._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&x.dequeue(this,e)})},dequeue:function(e){return this.each(function(){x.dequeue(this,e)})},delay:function(e,t){return e=x.fx?x.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=x.Deferred(),o=this,s=this.length,a=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=undefined),e=e||"fx";while(s--)n=q.get(o[s],e+"queueHooks"),n&&n.empty&&(r++,n.empty.add(a));return a(),i.promise(t)}});var R,M,W=/[\t\r\n\f]/g,$=/\r/g,B=/^(?:input|select|textarea|button)$/i;x.fn.extend({attr:function(e,t){return x.access(this,x.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){x.removeAttr(this,e)})},prop:function(e,t){return x.access(this,x.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[x.propFix[e]||e]})},addClass:function(e){var t,n,r,i,o,s=0,a=this.length,u="string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).addClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):" ")){o=0;while(i=t[o++])0>r.indexOf(" "+i+" ")&&(r+=i+" ");n.className=x.trim(r)}return this},removeClass:function(e){var t,n,r,i,o,s=0,a=this.length,u=0===arguments.length||"string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).removeClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):"")){o=0;while(i=t[o++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");n.className=e?x.trim(r):""}return this},toggleClass:function(e,t){var n=typeof e;return"boolean"==typeof t&&"string"===n?t?this.addClass(e):this.removeClass(e):x.isFunction(e)?this.each(function(n){x(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if("string"===n){var t,i=0,o=x(this),s=e.match(w)||[];while(t=s[i++])o.hasClass(t)?o.removeClass(t):o.addClass(t)}else(n===r||"boolean"===n)&&(this.className&&q.set(this,"__className__",this.className),this.className=this.className||e===!1?"":q.get(this,"__className__")||"")})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;r>n;n++)if(1===this[n].nodeType&&(" "+this[n].className+" ").replace(W," ").indexOf(t)>=0)return!0;return!1},val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=x.isFunction(e),this.each(function(n){var i;1===this.nodeType&&(i=r?e.call(this,n,x(this).val()):e,null==i?i="":"number"==typeof i?i+="":x.isArray(i)&&(i=x.map(i,function(e){return null==e?"":e+""})),t=x.valHooks[this.type]||x.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&t.set(this,i,"value")!==undefined||(this.value=i))});if(i)return t=x.valHooks[i.type]||x.valHooks[i.nodeName.toLowerCase()],t&&"get"in t&&(n=t.get(i,"value"))!==undefined?n:(n=i.value,"string"==typeof n?n.replace($,""):null==n?"":n)}}}),x.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,o="select-one"===e.type||0>i,s=o?null:[],a=o?i+1:r.length,u=0>i?a:o?i:0;for(;a>u;u++)if(n=r[u],!(!n.selected&&u!==i||(x.support.optDisabled?n.disabled:null!==n.getAttribute("disabled"))||n.parentNode.disabled&&x.nodeName(n.parentNode,"optgroup"))){if(t=x(n).val(),o)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=x.makeArray(t),s=i.length;while(s--)r=i[s],(r.selected=x.inArray(x(r).val(),o)>=0)&&(n=!0);return n||(e.selectedIndex=-1),o}}},attr:function(e,t,n){var i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return typeof e.getAttribute===r?x.prop(e,t,n):(1===s&&x.isXMLDoc(e)||(t=t.toLowerCase(),i=x.attrHooks[t]||(x.expr.match.bool.test(t)?M:R)),n===undefined?i&&"get"in i&&null!==(o=i.get(e,t))?o:(o=x.find.attr(e,t),null==o?undefined:o):null!==n?i&&"set"in i&&(o=i.set(e,n,t))!==undefined?o:(e.setAttribute(t,n+""),n):(x.removeAttr(e,t),undefined))},removeAttr:function(e,t){var n,r,i=0,o=t&&t.match(w);if(o&&1===e.nodeType)while(n=o[i++])r=x.propFix[n]||n,x.expr.match.bool.test(n)&&(e[r]=!1),e.removeAttribute(n)},attrHooks:{type:{set:function(e,t){if(!x.support.radioValue&&"radio"===t&&x.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},propFix:{"for":"htmlFor","class":"className"},prop:function(e,t,n){var r,i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return o=1!==s||!x.isXMLDoc(e),o&&(t=x.propFix[t]||t,i=x.propHooks[t]),n!==undefined?i&&"set"in i&&(r=i.set(e,n,t))!==undefined?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){return e.hasAttribute("tabindex")||B.test(e.nodeName)||e.href?e.tabIndex:-1}}}}),M={set:function(e,t,n){return t===!1?x.removeAttr(e,n):e.setAttribute(n,n),n}},x.each(x.expr.match.bool.source.match(/\w+/g),function(e,t){var n=x.expr.attrHandle[t]||x.find.attr;x.expr.attrHandle[t]=function(e,t,r){var i=x.expr.attrHandle[t],o=r?undefined:(x.expr.attrHandle[t]=undefined)!=n(e,t,r)?t.toLowerCase():null;return x.expr.attrHandle[t]=i,o}}),x.support.optSelected||(x.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null}}),x.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){x.propFix[this.toLowerCase()]=this}),x.each(["radio","checkbox"],function(){x.valHooks[this]={set:function(e,t){return x.isArray(t)?e.checked=x.inArray(x(e).val(),t)>=0:undefined}},x.support.checkOn||(x.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var I=/^key/,z=/^(?:mouse|contextmenu)|click/,_=/^(?:focusinfocus|focusoutblur)$/,X=/^([^.]*)(?:\.(.+)|)$/;function U(){return!0}function Y(){return!1}function V(){try{return o.activeElement}catch(e){}}x.event={global:{},add:function(e,t,n,i,o){var s,a,u,l,c,p,f,h,d,g,m,y=q.get(e);if(y){n.handler&&(s=n,n=s.handler,o=s.selector),n.guid||(n.guid=x.guid++),(l=y.events)||(l=y.events={}),(a=y.handle)||(a=y.handle=function(e){return typeof x===r||e&&x.event.triggered===e.type?undefined:x.event.dispatch.apply(a.elem,arguments)},a.elem=e),t=(t||"").match(w)||[""],c=t.length;while(c--)u=X.exec(t[c])||[],d=m=u[1],g=(u[2]||"").split(".").sort(),d&&(f=x.event.special[d]||{},d=(o?f.delegateType:f.bindType)||d,f=x.event.special[d]||{},p=x.extend({type:d,origType:m,data:i,handler:n,guid:n.guid,selector:o,needsContext:o&&x.expr.match.needsContext.test(o),namespace:g.join(".")},s),(h=l[d])||(h=l[d]=[],h.delegateCount=0,f.setup&&f.setup.call(e,i,g,a)!==!1||e.addEventListener&&e.addEventListener(d,a,!1)),f.add&&(f.add.call(e,p),p.handler.guid||(p.handler.guid=n.guid)),o?h.splice(h.delegateCount++,0,p):h.push(p),x.event.global[d]=!0);e=null}},remove:function(e,t,n,r,i){var o,s,a,u,l,c,p,f,h,d,g,m=q.hasData(e)&&q.get(e);if(m&&(u=m.events)){t=(t||"").match(w)||[""],l=t.length;while(l--)if(a=X.exec(t[l])||[],h=g=a[1],d=(a[2]||"").split(".").sort(),h){p=x.event.special[h]||{},h=(r?p.delegateType:p.bindType)||h,f=u[h]||[],a=a[2]&&RegExp("(^|\\.)"+d.join("\\.(?:.*\\.|)")+"(\\.|$)"),s=o=f.length;while(o--)c=f[o],!i&&g!==c.origType||n&&n.guid!==c.guid||a&&!a.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(f.splice(o,1),c.selector&&f.delegateCount--,p.remove&&p.remove.call(e,c));s&&!f.length&&(p.teardown&&p.teardown.call(e,d,m.handle)!==!1||x.removeEvent(e,h,m.handle),delete u[h])}else for(h in u)x.event.remove(e,h+t[l],n,r,!0);x.isEmptyObject(u)&&(delete m.handle,q.remove(e,"events"))}},trigger:function(t,n,r,i){var s,a,u,l,c,p,f,h=[r||o],d=y.call(t,"type")?t.type:t,g=y.call(t,"namespace")?t.namespace.split("."):[];if(a=u=r=r||o,3!==r.nodeType&&8!==r.nodeType&&!_.test(d+x.event.triggered)&&(d.indexOf(".")>=0&&(g=d.split("."),d=g.shift(),g.sort()),c=0>d.indexOf(":")&&"on"+d,t=t[x.expando]?t:new x.Event(d,"object"==typeof t&&t),t.isTrigger=i?2:3,t.namespace=g.join("."),t.namespace_re=t.namespace?RegExp("(^|\\.)"+g.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=undefined,t.target||(t.target=r),n=null==n?[t]:x.makeArray(n,[t]),f=x.event.special[d]||{},i||!f.trigger||f.trigger.apply(r,n)!==!1)){if(!i&&!f.noBubble&&!x.isWindow(r)){for(l=f.delegateType||d,_.test(l+d)||(a=a.parentNode);a;a=a.parentNode)h.push(a),u=a;u===(r.ownerDocument||o)&&h.push(u.defaultView||u.parentWindow||e)}s=0;while((a=h[s++])&&!t.isPropagationStopped())t.type=s>1?l:f.bindType||d,p=(q.get(a,"events")||{})[t.type]&&q.get(a,"handle"),p&&p.apply(a,n),p=c&&a[c],p&&x.acceptData(a)&&p.apply&&p.apply(a,n)===!1&&t.preventDefault();return t.type=d,i||t.isDefaultPrevented()||f._default&&f._default.apply(h.pop(),n)!==!1||!x.acceptData(r)||c&&x.isFunction(r[d])&&!x.isWindow(r)&&(u=r[c],u&&(r[c]=null),x.event.triggered=d,r[d](),x.event.triggered=undefined,u&&(r[c]=u)),t.result}},dispatch:function(e){e=x.event.fix(e);var t,n,r,i,o,s=[],a=d.call(arguments),u=(q.get(this,"events")||{})[e.type]||[],l=x.event.special[e.type]||{};if(a[0]=e,e.delegateTarget=this,!l.preDispatch||l.preDispatch.call(this,e)!==!1){s=x.event.handlers.call(this,e,u),t=0;while((i=s[t++])&&!e.isPropagationStopped()){e.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!e.isImmediatePropagationStopped())(!e.namespace_re||e.namespace_re.test(o.namespace))&&(e.handleObj=o,e.data=o.data,r=((x.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,a),r!==undefined&&(e.result=r)===!1&&(e.preventDefault(),e.stopPropagation()))}return l.postDispatch&&l.postDispatch.call(this,e),e.result}},handlers:function(e,t){var n,r,i,o,s=[],a=t.delegateCount,u=e.target;if(a&&u.nodeType&&(!e.button||"click"!==e.type))for(;u!==this;u=u.parentNode||this)if(u.disabled!==!0||"click"!==e.type){for(r=[],n=0;a>n;n++)o=t[n],i=o.selector+" ",r[i]===undefined&&(r[i]=o.needsContext?x(i,this).index(u)>=0:x.find(i,this,null,[u]).length),r[i]&&r.push(o);r.length&&s.push({elem:u,handlers:r})}return t.length>a&&s.push({elem:this,handlers:t.slice(a)}),s},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,t){var n,r,i,s=t.button;return null==e.pageX&&null!=t.clientX&&(n=e.target.ownerDocument||o,r=n.documentElement,i=n.body,e.pageX=t.clientX+(r&&r.scrollLeft||i&&i.scrollLeft||0)-(r&&r.clientLeft||i&&i.clientLeft||0),e.pageY=t.clientY+(r&&r.scrollTop||i&&i.scrollTop||0)-(r&&r.clientTop||i&&i.clientTop||0)),e.which||s===undefined||(e.which=1&s?1:2&s?3:4&s?2:0),e}},fix:function(e){if(e[x.expando])return e;var t,n,r,i=e.type,s=e,a=this.fixHooks[i];a||(this.fixHooks[i]=a=z.test(i)?this.mouseHooks:I.test(i)?this.keyHooks:{}),r=a.props?this.props.concat(a.props):this.props,e=new x.Event(s),t=r.length;while(t--)n=r[t],e[n]=s[n];return e.target||(e.target=o),3===e.target.nodeType&&(e.target=e.target.parentNode),a.filter?a.filter(e,s):e},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==V()&&this.focus?(this.focus(),!1):undefined},delegateType:"focusin"},blur:{trigger:function(){return this===V()&&this.blur?(this.blur(),!1):undefined},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&x.nodeName(this,"input")?(this.click(),!1):undefined},_default:function(e){return x.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){e.result!==undefined&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=x.extend(new x.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?x.event.trigger(i,null,t):x.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},x.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)},x.Event=function(e,t){return this instanceof x.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.getPreventDefault&&e.getPreventDefault()?U:Y):this.type=e,t&&x.extend(this,t),this.timeStamp=e&&e.timeStamp||x.now(),this[x.expando]=!0,undefined):new x.Event(e,t)},x.Event.prototype={isDefaultPrevented:Y,isPropagationStopped:Y,isImmediatePropagationStopped:Y,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=U,e&&e.preventDefault&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=U,e&&e.stopPropagation&&e.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=U,this.stopPropagation()}},x.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){x.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return(!i||i!==r&&!x.contains(r,i))&&(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),x.support.focusinBubbles||x.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){x.event.simulate(t,e.target,x.event.fix(e),!0)};x.event.special[t]={setup:function(){0===n++&&o.addEventListener(e,r,!0)},teardown:function(){0===--n&&o.removeEventListener(e,r,!0)}}}),x.fn.extend({on:function(e,t,n,r,i){var o,s;if("object"==typeof e){"string"!=typeof t&&(n=n||t,t=undefined);for(s in e)this.on(s,t,n,e[s],i);return this}if(null==n&&null==r?(r=t,n=t=undefined):null==r&&("string"==typeof t?(r=n,n=undefined):(r=n,n=t,t=undefined)),r===!1)r=Y;else if(!r)return this;return 1===i&&(o=r,r=function(e){return x().off(e),o.apply(this,arguments)},r.guid=o.guid||(o.guid=x.guid++)),this.each(function(){x.event.add(this,e,r,n,t)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,x(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return(t===!1||"function"==typeof t)&&(n=t,t=undefined),n===!1&&(n=Y),this.each(function(){x.event.remove(this,e,n,t)})},trigger:function(e,t){return this.each(function(){x.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];return n?x.event.trigger(e,t,n,!0):undefined}});var G=/^.[^:#\[\.,]*$/,J=/^(?:parents|prev(?:Until|All))/,Q=x.expr.match.needsContext,K={children:!0,contents:!0,next:!0,prev:!0};x.fn.extend({find:function(e){var t,n=[],r=this,i=r.length;if("string"!=typeof e)return this.pushStack(x(e).filter(function(){for(t=0;i>t;t++)if(x.contains(r[t],this))return!0}));for(t=0;i>t;t++)x.find(e,r[t],n);return n=this.pushStack(i>1?x.unique(n):n),n.selector=this.selector?this.selector+" "+e:e,n},has:function(e){var t=x(e,this),n=t.length;return this.filter(function(){var e=0;for(;n>e;e++)if(x.contains(this,t[e]))return!0})},not:function(e){return this.pushStack(et(this,e||[],!0))},filter:function(e){return this.pushStack(et(this,e||[],!1))},is:function(e){return!!et(this,"string"==typeof e&&Q.test(e)?x(e):e||[],!1).length},closest:function(e,t){var n,r=0,i=this.length,o=[],s=Q.test(e)||"string"!=typeof e?x(e,t||this.context):0;for(;i>r;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(11>n.nodeType&&(s?s.index(n)>-1:1===n.nodeType&&x.find.matchesSelector(n,e))){n=o.push(n);break}return this.pushStack(o.length>1?x.unique(o):o)},index:function(e){return e?"string"==typeof e?g.call(x(e),this[0]):g.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){var n="string"==typeof e?x(e,t):x.makeArray(e&&e.nodeType?[e]:e),r=x.merge(this.get(),n);return this.pushStack(x.unique(r))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function Z(e,t){while((e=e[t])&&1!==e.nodeType);return e}x.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return x.dir(e,"parentNode")},parentsUntil:function(e,t,n){return x.dir(e,"parentNode",n)},next:function(e){return Z(e,"nextSibling")},prev:function(e){return Z(e,"previousSibling")},nextAll:function(e){return x.dir(e,"nextSibling")},prevAll:function(e){return x.dir(e,"previousSibling")},nextUntil:function(e,t,n){return x.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return x.dir(e,"previousSibling",n)},siblings:function(e){return x.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return x.sibling(e.firstChild)},contents:function(e){return e.contentDocument||x.merge([],e.childNodes)}},function(e,t){x.fn[e]=function(n,r){var i=x.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=x.filter(r,i)),this.length>1&&(K[e]||x.unique(i),J.test(e)&&i.reverse()),this.pushStack(i)}}),x.extend({filter:function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?x.find.matchesSelector(r,e)?[r]:[]:x.find.matches(e,x.grep(t,function(e){return 1===e.nodeType}))},dir:function(e,t,n){var r=[],i=n!==undefined;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&x(e).is(n))break;r.push(e)}return r},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n}});function et(e,t,n){if(x.isFunction(t))return x.grep(e,function(e,r){return!!t.call(e,r,e)!==n});if(t.nodeType)return x.grep(e,function(e){return e===t!==n});if("string"==typeof t){if(G.test(t))return x.filter(t,e,n);t=x.filter(t,e)}return x.grep(e,function(e){return g.call(t,e)>=0!==n})}var tt=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,nt=/<([\w:]+)/,rt=/<|&#?\w+;/,it=/<(?:script|style|link)/i,ot=/^(?:checkbox|radio)$/i,st=/checked\s*(?:[^=]|=\s*.checked.)/i,at=/^$|\/(?:java|ecma)script/i,ut=/^true\/(.*)/,lt=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ct={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ct.optgroup=ct.option,ct.tbody=ct.tfoot=ct.colgroup=ct.caption=ct.thead,ct.th=ct.td,x.fn.extend({text:function(e){return x.access(this,function(e){return e===undefined?x.text(this):this.empty().append((this[0]&&this[0].ownerDocument||o).createTextNode(e))},null,e,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=pt(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=pt(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=e?x.filter(e,this):this,i=0;for(;null!=(n=r[i]);i++)t||1!==n.nodeType||x.cleanData(mt(n)),n.parentNode&&(t&&x.contains(n.ownerDocument,n)&&dt(mt(n,"script")),n.parentNode.removeChild(n));return this},empty:function(){var e,t=0;for(;null!=(e=this[t]);t++)1===e.nodeType&&(x.cleanData(mt(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return x.clone(this,e,t)})},html:function(e){return x.access(this,function(e){var t=this[0]||{},n=0,r=this.length;if(e===undefined&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!it.test(e)&&!ct[(nt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(tt,"<$1></$2>");try{for(;r>n;n++)t=this[n]||{},1===t.nodeType&&(x.cleanData(mt(t,!1)),t.innerHTML=e);t=0}catch(i){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=x.map(this,function(e){return[e.nextSibling,e.parentNode]}),t=0;return this.domManip(arguments,function(n){var r=e[t++],i=e[t++];i&&(r&&r.parentNode!==i&&(r=this.nextSibling),x(this).remove(),i.insertBefore(n,r))},!0),t?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(e,t,n){e=f.apply([],e);var r,i,o,s,a,u,l=0,c=this.length,p=this,h=c-1,d=e[0],g=x.isFunction(d);if(g||!(1>=c||"string"!=typeof d||x.support.checkClone)&&st.test(d))return this.each(function(r){var i=p.eq(r);g&&(e[0]=d.call(this,r,i.html())),i.domManip(e,t,n)});if(c&&(r=x.buildFragment(e,this[0].ownerDocument,!1,!n&&this),i=r.firstChild,1===r.childNodes.length&&(r=i),i)){for(o=x.map(mt(r,"script"),ft),s=o.length;c>l;l++)a=r,l!==h&&(a=x.clone(a,!0,!0),s&&x.merge(o,mt(a,"script"))),t.call(this[l],a,l);if(s)for(u=o[o.length-1].ownerDocument,x.map(o,ht),l=0;s>l;l++)a=o[l],at.test(a.type||"")&&!q.access(a,"globalEval")&&x.contains(u,a)&&(a.src?x._evalUrl(a.src):x.globalEval(a.textContent.replace(lt,"")))}return this}}),x.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){x.fn[e]=function(e){var n,r=[],i=x(e),o=i.length-1,s=0;for(;o>=s;s++)n=s===o?this:this.clone(!0),x(i[s])[t](n),h.apply(r,n.get());return this.pushStack(r)}}),x.extend({clone:function(e,t,n){var r,i,o,s,a=e.cloneNode(!0),u=x.contains(e.ownerDocument,e);if(!(x.support.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||x.isXMLDoc(e)))for(s=mt(a),o=mt(e),r=0,i=o.length;i>r;r++)yt(o[r],s[r]);if(t)if(n)for(o=o||mt(e),s=s||mt(a),r=0,i=o.length;i>r;r++)gt(o[r],s[r]);else gt(e,a);return s=mt(a,"script"),s.length>0&&dt(s,!u&&mt(e,"script")),a},buildFragment:function(e,t,n,r){var i,o,s,a,u,l,c=0,p=e.length,f=t.createDocumentFragment(),h=[];for(;p>c;c++)if(i=e[c],i||0===i)if("object"===x.type(i))x.merge(h,i.nodeType?[i]:i);else if(rt.test(i)){o=o||f.appendChild(t.createElement("div")),s=(nt.exec(i)||["",""])[1].toLowerCase(),a=ct[s]||ct._default,o.innerHTML=a[1]+i.replace(tt,"<$1></$2>")+a[2],l=a[0];while(l--)o=o.lastChild;x.merge(h,o.childNodes),o=f.firstChild,o.textContent=""}else h.push(t.createTextNode(i));f.textContent="",c=0;while(i=h[c++])if((!r||-1===x.inArray(i,r))&&(u=x.contains(i.ownerDocument,i),o=mt(f.appendChild(i),"script"),u&&dt(o),n)){l=0;while(i=o[l++])at.test(i.type||"")&&n.push(i)}return f},cleanData:function(e){var t,n,r,i,o,s,a=x.event.special,u=0;for(;(n=e[u])!==undefined;u++){if(F.accepts(n)&&(o=n[q.expando],o&&(t=q.cache[o]))){if(r=Object.keys(t.events||{}),r.length)for(s=0;(i=r[s])!==undefined;s++)a[i]?x.event.remove(n,i):x.removeEvent(n,i,t.handle);q.cache[o]&&delete q.cache[o]}delete L.cache[n[L.expando]]}},_evalUrl:function(e){return x.ajax({url:e,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})}});function pt(e,t){return x.nodeName(e,"table")&&x.nodeName(1===t.nodeType?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function ft(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function ht(e){var t=ut.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function dt(e,t){var n=e.length,r=0;for(;n>r;r++)q.set(e[r],"globalEval",!t||q.get(t[r],"globalEval"))}function gt(e,t){var n,r,i,o,s,a,u,l;if(1===t.nodeType){if(q.hasData(e)&&(o=q.access(e),s=q.set(t,o),l=o.events)){delete s.handle,s.events={};for(i in l)for(n=0,r=l[i].length;r>n;n++)x.event.add(t,i,l[i][n])}L.hasData(e)&&(a=L.access(e),u=x.extend({},a),L.set(t,u))}}function mt(e,t){var n=e.getElementsByTagName?e.getElementsByTagName(t||"*"):e.querySelectorAll?e.querySelectorAll(t||"*"):[];return t===undefined||t&&x.nodeName(e,t)?x.merge([e],n):n}function yt(e,t){var n=t.nodeName.toLowerCase();"input"===n&&ot.test(e.type)?t.checked=e.checked:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}x.fn.extend({wrapAll:function(e){var t;return x.isFunction(e)?this.each(function(t){x(this).wrapAll(e.call(this,t))}):(this[0]&&(t=x(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this)},wrapInner:function(e){return x.isFunction(e)?this.each(function(t){x(this).wrapInner(e.call(this,t))}):this.each(function(){var t=x(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=x.isFunction(e);return this.each(function(n){x(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){x.nodeName(this,"body")||x(this).replaceWith(this.childNodes)}).end()}});var vt,xt,bt=/^(none|table(?!-c[ea]).+)/,wt=/^margin/,Tt=RegExp("^("+b+")(.*)$","i"),Ct=RegExp("^("+b+")(?!px)[a-z%]+$","i"),kt=RegExp("^([+-])=("+b+")","i"),Nt={BODY:"block"},Et={position:"absolute",visibility:"hidden",display:"block"},St={letterSpacing:0,fontWeight:400},jt=["Top","Right","Bottom","Left"],Dt=["Webkit","O","Moz","ms"];function At(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=Dt.length;while(i--)if(t=Dt[i]+n,t in e)return t;return r}function Lt(e,t){return e=t||e,"none"===x.css(e,"display")||!x.contains(e.ownerDocument,e)}function qt(t){return e.getComputedStyle(t,null)}function Ht(e,t){var n,r,i,o=[],s=0,a=e.length;for(;a>s;s++)r=e[s],r.style&&(o[s]=q.get(r,"olddisplay"),n=r.style.display,t?(o[s]||"none"!==n||(r.style.display=""),""===r.style.display&&Lt(r)&&(o[s]=q.access(r,"olddisplay",Rt(r.nodeName)))):o[s]||(i=Lt(r),(n&&"none"!==n||!i)&&q.set(r,"olddisplay",i?n:x.css(r,"display"))));for(s=0;a>s;s++)r=e[s],r.style&&(t&&"none"!==r.style.display&&""!==r.style.display||(r.style.display=t?o[s]||"":"none"));return e}x.fn.extend({css:function(e,t){return x.access(this,function(e,t,n){var r,i,o={},s=0;if(x.isArray(t)){for(r=qt(e),i=t.length;i>s;s++)o[t[s]]=x.css(e,t[s],!1,r);return o}return n!==undefined?x.style(e,t,n):x.css(e,t)},e,t,arguments.length>1)},show:function(){return Ht(this,!0)},hide:function(){return Ht(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){Lt(this)?x(this).show():x(this).hide()})}}),x.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=vt(e,"opacity");return""===n?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,s,a=x.camelCase(t),u=e.style;return t=x.cssProps[a]||(x.cssProps[a]=At(u,a)),s=x.cssHooks[t]||x.cssHooks[a],n===undefined?s&&"get"in s&&(i=s.get(e,!1,r))!==undefined?i:u[t]:(o=typeof n,"string"===o&&(i=kt.exec(n))&&(n=(i[1]+1)*i[2]+parseFloat(x.css(e,t)),o="number"),null==n||"number"===o&&isNaN(n)||("number"!==o||x.cssNumber[a]||(n+="px"),x.support.clearCloneStyle||""!==n||0!==t.indexOf("background")||(u[t]="inherit"),s&&"set"in s&&(n=s.set(e,n,r))===undefined||(u[t]=n)),undefined)}},css:function(e,t,n,r){var i,o,s,a=x.camelCase(t);return t=x.cssProps[a]||(x.cssProps[a]=At(e.style,a)),s=x.cssHooks[t]||x.cssHooks[a],s&&"get"in s&&(i=s.get(e,!0,n)),i===undefined&&(i=vt(e,t,r)),"normal"===i&&t in St&&(i=St[t]),""===n||n?(o=parseFloat(i),n===!0||x.isNumeric(o)?o||0:i):i}}),vt=function(e,t,n){var r,i,o,s=n||qt(e),a=s?s.getPropertyValue(t)||s[t]:undefined,u=e.style;return s&&(""!==a||x.contains(e.ownerDocument,e)||(a=x.style(e,t)),Ct.test(a)&&wt.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=s.width,u.width=r,u.minWidth=i,u.maxWidth=o)),a};function Ot(e,t,n){var r=Tt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function Ft(e,t,n,r,i){var o=n===(r?"border":"content")?4:"width"===t?1:0,s=0;for(;4>o;o+=2)"margin"===n&&(s+=x.css(e,n+jt[o],!0,i)),r?("content"===n&&(s-=x.css(e,"padding"+jt[o],!0,i)),"margin"!==n&&(s-=x.css(e,"border"+jt[o]+"Width",!0,i))):(s+=x.css(e,"padding"+jt[o],!0,i),"padding"!==n&&(s+=x.css(e,"border"+jt[o]+"Width",!0,i)));return s}function Pt(e,t,n){var r=!0,i="width"===t?e.offsetWidth:e.offsetHeight,o=qt(e),s=x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,o);if(0>=i||null==i){if(i=vt(e,t,o),(0>i||null==i)&&(i=e.style[t]),Ct.test(i))return i;r=s&&(x.support.boxSizingReliable||i===e.style[t]),i=parseFloat(i)||0}return i+Ft(e,t,n||(s?"border":"content"),r,o)+"px"}function Rt(e){var t=o,n=Nt[e];return n||(n=Mt(e,t),"none"!==n&&n||(xt=(xt||x("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(t.documentElement),t=(xt[0].contentWindow||xt[0].contentDocument).document,t.write("<!doctype html><html><body>"),t.close(),n=Mt(e,t),xt.detach()),Nt[e]=n),n}function Mt(e,t){var n=x(t.createElement(e)).appendTo(t.body),r=x.css(n[0],"display");return n.remove(),r}x.each(["height","width"],function(e,t){x.cssHooks[t]={get:function(e,n,r){return n?0===e.offsetWidth&&bt.test(x.css(e,"display"))?x.swap(e,Et,function(){return Pt(e,t,r)}):Pt(e,t,r):undefined},set:function(e,n,r){var i=r&&qt(e);return Ot(e,n,r?Ft(e,t,r,x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,i),i):0)}}}),x(function(){x.support.reliableMarginRight||(x.cssHooks.marginRight={get:function(e,t){return t?x.swap(e,{display:"inline-block"},vt,[e,"marginRight"]):undefined}}),!x.support.pixelPosition&&x.fn.position&&x.each(["top","left"],function(e,t){x.cssHooks[t]={get:function(e,n){return n?(n=vt(e,t),Ct.test(n)?x(e).position()[t]+"px":n):undefined}}})}),x.expr&&x.expr.filters&&(x.expr.filters.hidden=function(e){return 0>=e.offsetWidth&&0>=e.offsetHeight},x.expr.filters.visible=function(e){return!x.expr.filters.hidden(e)}),x.each({margin:"",padding:"",border:"Width"},function(e,t){x.cssHooks[e+t]={expand:function(n){var r=0,i={},o="string"==typeof n?n.split(" "):[n];for(;4>r;r++)i[e+jt[r]+t]=o[r]||o[r-2]||o[0];return i}},wt.test(e)||(x.cssHooks[e+t].set=Ot)});var Wt=/%20/g,$t=/\[\]$/,Bt=/\r?\n/g,It=/^(?:submit|button|image|reset|file)$/i,zt=/^(?:input|select|textarea|keygen)/i;x.fn.extend({serialize:function(){return x.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=x.prop(this,"elements");return e?x.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!x(this).is(":disabled")&&zt.test(this.nodeName)&&!It.test(e)&&(this.checked||!ot.test(e))}).map(function(e,t){var n=x(this).val();return null==n?null:x.isArray(n)?x.map(n,function(e){return{name:t.name,value:e.replace(Bt,"\r\n")}}):{name:t.name,value:n.replace(Bt,"\r\n")}}).get()}}),x.param=function(e,t){var n,r=[],i=function(e,t){t=x.isFunction(t)?t():null==t?"":t,r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(t===undefined&&(t=x.ajaxSettings&&x.ajaxSettings.traditional),x.isArray(e)||e.jquery&&!x.isPlainObject(e))x.each(e,function(){i(this.name,this.value)});else for(n in e)_t(n,e[n],t,i);return r.join("&").replace(Wt,"+")};function _t(e,t,n,r){var i;if(x.isArray(t))x.each(t,function(t,i){n||$t.test(e)?r(e,i):_t(e+"["+("object"==typeof i?t:"")+"]",i,n,r)});else if(n||"object"!==x.type(t))r(e,t);else for(i in t)_t(e+"["+i+"]",t[i],n,r)}x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){x.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),x.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)
},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}});var Xt,Ut,Yt=x.now(),Vt=/\?/,Gt=/#.*$/,Jt=/([?&])_=[^&]*/,Qt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Kt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Zt=/^(?:GET|HEAD)$/,en=/^\/\//,tn=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,nn=x.fn.load,rn={},on={},sn="*/".concat("*");try{Ut=i.href}catch(an){Ut=o.createElement("a"),Ut.href="",Ut=Ut.href}Xt=tn.exec(Ut.toLowerCase())||[];function un(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(w)||[];if(x.isFunction(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function ln(e,t,n,r){var i={},o=e===on;function s(a){var u;return i[a]=!0,x.each(e[a]||[],function(e,a){var l=a(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):undefined:(t.dataTypes.unshift(l),s(l),!1)}),u}return s(t.dataTypes[0])||!i["*"]&&s("*")}function cn(e,t){var n,r,i=x.ajaxSettings.flatOptions||{};for(n in t)t[n]!==undefined&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&x.extend(!0,e,r),e}x.fn.load=function(e,t,n){if("string"!=typeof e&&nn)return nn.apply(this,arguments);var r,i,o,s=this,a=e.indexOf(" ");return a>=0&&(r=e.slice(a),e=e.slice(0,a)),x.isFunction(t)?(n=t,t=undefined):t&&"object"==typeof t&&(i="POST"),s.length>0&&x.ajax({url:e,type:i,dataType:"html",data:t}).done(function(e){o=arguments,s.html(r?x("<div>").append(x.parseHTML(e)).find(r):e)}).complete(n&&function(e,t){s.each(n,o||[e.responseText,t,e])}),this},x.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){x.fn[t]=function(e){return this.on(t,e)}}),x.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Ut,type:"GET",isLocal:Kt.test(Xt[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":sn,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":x.parseJSON,"text xml":x.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?cn(cn(e,x.ajaxSettings),t):cn(x.ajaxSettings,e)},ajaxPrefilter:un(rn),ajaxTransport:un(on),ajax:function(e,t){"object"==typeof e&&(t=e,e=undefined),t=t||{};var n,r,i,o,s,a,u,l,c=x.ajaxSetup({},t),p=c.context||c,f=c.context&&(p.nodeType||p.jquery)?x(p):x.event,h=x.Deferred(),d=x.Callbacks("once memory"),g=c.statusCode||{},m={},y={},v=0,b="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(2===v){if(!o){o={};while(t=Qt.exec(i))o[t[1].toLowerCase()]=t[2]}t=o[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===v?i:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return v||(e=y[n]=y[n]||e,m[e]=t),this},overrideMimeType:function(e){return v||(c.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>v)for(t in e)g[t]=[g[t],e[t]];else T.always(e[T.status]);return this},abort:function(e){var t=e||b;return n&&n.abort(t),k(0,t),this}};if(h.promise(T).complete=d.add,T.success=T.done,T.error=T.fail,c.url=((e||c.url||Ut)+"").replace(Gt,"").replace(en,Xt[1]+"//"),c.type=t.method||t.type||c.method||c.type,c.dataTypes=x.trim(c.dataType||"*").toLowerCase().match(w)||[""],null==c.crossDomain&&(a=tn.exec(c.url.toLowerCase()),c.crossDomain=!(!a||a[1]===Xt[1]&&a[2]===Xt[2]&&(a[3]||("http:"===a[1]?"80":"443"))===(Xt[3]||("http:"===Xt[1]?"80":"443")))),c.data&&c.processData&&"string"!=typeof c.data&&(c.data=x.param(c.data,c.traditional)),ln(rn,c,t,T),2===v)return T;u=c.global,u&&0===x.active++&&x.event.trigger("ajaxStart"),c.type=c.type.toUpperCase(),c.hasContent=!Zt.test(c.type),r=c.url,c.hasContent||(c.data&&(r=c.url+=(Vt.test(r)?"&":"?")+c.data,delete c.data),c.cache===!1&&(c.url=Jt.test(r)?r.replace(Jt,"$1_="+Yt++):r+(Vt.test(r)?"&":"?")+"_="+Yt++)),c.ifModified&&(x.lastModified[r]&&T.setRequestHeader("If-Modified-Since",x.lastModified[r]),x.etag[r]&&T.setRequestHeader("If-None-Match",x.etag[r])),(c.data&&c.hasContent&&c.contentType!==!1||t.contentType)&&T.setRequestHeader("Content-Type",c.contentType),T.setRequestHeader("Accept",c.dataTypes[0]&&c.accepts[c.dataTypes[0]]?c.accepts[c.dataTypes[0]]+("*"!==c.dataTypes[0]?", "+sn+"; q=0.01":""):c.accepts["*"]);for(l in c.headers)T.setRequestHeader(l,c.headers[l]);if(c.beforeSend&&(c.beforeSend.call(p,T,c)===!1||2===v))return T.abort();b="abort";for(l in{success:1,error:1,complete:1})T[l](c[l]);if(n=ln(on,c,t,T)){T.readyState=1,u&&f.trigger("ajaxSend",[T,c]),c.async&&c.timeout>0&&(s=setTimeout(function(){T.abort("timeout")},c.timeout));try{v=1,n.send(m,k)}catch(C){if(!(2>v))throw C;k(-1,C)}}else k(-1,"No Transport");function k(e,t,o,a){var l,m,y,b,w,C=t;2!==v&&(v=2,s&&clearTimeout(s),n=undefined,i=a||"",T.readyState=e>0?4:0,l=e>=200&&300>e||304===e,o&&(b=pn(c,T,o)),b=fn(c,b,T,l),l?(c.ifModified&&(w=T.getResponseHeader("Last-Modified"),w&&(x.lastModified[r]=w),w=T.getResponseHeader("etag"),w&&(x.etag[r]=w)),204===e||"HEAD"===c.type?C="nocontent":304===e?C="notmodified":(C=b.state,m=b.data,y=b.error,l=!y)):(y=C,(e||!C)&&(C="error",0>e&&(e=0))),T.status=e,T.statusText=(t||C)+"",l?h.resolveWith(p,[m,C,T]):h.rejectWith(p,[T,C,y]),T.statusCode(g),g=undefined,u&&f.trigger(l?"ajaxSuccess":"ajaxError",[T,c,l?m:y]),d.fireWith(p,[T,C]),u&&(f.trigger("ajaxComplete",[T,c]),--x.active||x.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return x.get(e,t,n,"json")},getScript:function(e,t){return x.get(e,undefined,t,"script")}}),x.each(["get","post"],function(e,t){x[t]=function(e,n,r,i){return x.isFunction(n)&&(i=i||r,r=n,n=undefined),x.ajax({url:e,type:t,dataType:i,data:n,success:r})}});function pn(e,t,n){var r,i,o,s,a=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),r===undefined&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in a)if(a[i]&&a[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}s||(s=i)}o=o||s}return o?(o!==u[0]&&u.unshift(o),n[o]):undefined}function fn(e,t,n,r){var i,o,s,a,u,l={},c=e.dataTypes.slice();if(c[1])for(s in e.converters)l[s.toLowerCase()]=e.converters[s];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(s=l[u+" "+o]||l["* "+o],!s)for(i in l)if(a=i.split(" "),a[1]===o&&(s=l[u+" "+a[0]]||l["* "+a[0]])){s===!0?s=l[i]:l[i]!==!0&&(o=a[0],c.unshift(a[1]));break}if(s!==!0)if(s&&e["throws"])t=s(t);else try{t=s(t)}catch(p){return{state:"parsererror",error:s?p:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}x.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return x.globalEval(e),e}}}),x.ajaxPrefilter("script",function(e){e.cache===undefined&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),x.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(r,i){t=x("<script>").prop({async:!0,charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),o.head.appendChild(t[0])},abort:function(){n&&n()}}}});var hn=[],dn=/(=)\?(?=&|$)|\?\?/;x.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=hn.pop()||x.expando+"_"+Yt++;return this[e]=!0,e}}),x.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,s,a=t.jsonp!==!1&&(dn.test(t.url)?"url":"string"==typeof t.data&&!(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&dn.test(t.data)&&"data");return a||"jsonp"===t.dataTypes[0]?(i=t.jsonpCallback=x.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,a?t[a]=t[a].replace(dn,"$1"+i):t.jsonp!==!1&&(t.url+=(Vt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return s||x.error(i+" was not called"),s[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){s=arguments},r.always(function(){e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,hn.push(i)),s&&x.isFunction(o)&&o(s[0]),s=o=undefined}),"script"):undefined}),x.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(e){}};var gn=x.ajaxSettings.xhr(),mn={0:200,1223:204},yn=0,vn={};e.ActiveXObject&&x(e).on("unload",function(){for(var e in vn)vn[e]();vn=undefined}),x.support.cors=!!gn&&"withCredentials"in gn,x.support.ajax=gn=!!gn,x.ajaxTransport(function(e){var t;return x.support.cors||gn&&!e.crossDomain?{send:function(n,r){var i,o,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(i in e.xhrFields)s[i]=e.xhrFields[i];e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||n["X-Requested-With"]||(n["X-Requested-With"]="XMLHttpRequest");for(i in n)s.setRequestHeader(i,n[i]);t=function(e){return function(){t&&(delete vn[o],t=s.onload=s.onerror=null,"abort"===e?s.abort():"error"===e?r(s.status||404,s.statusText):r(mn[s.status]||s.status,s.statusText,"string"==typeof s.responseText?{text:s.responseText}:undefined,s.getAllResponseHeaders()))}},s.onload=t(),s.onerror=t("error"),t=vn[o=yn++]=t("abort"),s.send(e.hasContent&&e.data||null)},abort:function(){t&&t()}}:undefined});var xn,bn,wn=/^(?:toggle|show|hide)$/,Tn=RegExp("^(?:([+-])=|)("+b+")([a-z%]*)$","i"),Cn=/queueHooks$/,kn=[An],Nn={"*":[function(e,t){var n=this.createTween(e,t),r=n.cur(),i=Tn.exec(t),o=i&&i[3]||(x.cssNumber[e]?"":"px"),s=(x.cssNumber[e]||"px"!==o&&+r)&&Tn.exec(x.css(n.elem,e)),a=1,u=20;if(s&&s[3]!==o){o=o||s[3],i=i||[],s=+r||1;do a=a||".5",s/=a,x.style(n.elem,e,s+o);while(a!==(a=n.cur()/r)&&1!==a&&--u)}return i&&(s=n.start=+s||+r||0,n.unit=o,n.end=i[1]?s+(i[1]+1)*i[2]:+i[2]),n}]};function En(){return setTimeout(function(){xn=undefined}),xn=x.now()}function Sn(e,t,n){var r,i=(Nn[t]||[]).concat(Nn["*"]),o=0,s=i.length;for(;s>o;o++)if(r=i[o].call(n,t,e))return r}function jn(e,t,n){var r,i,o=0,s=kn.length,a=x.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;var t=xn||En(),n=Math.max(0,l.startTime+l.duration-t),r=n/l.duration||0,o=1-r,s=0,u=l.tweens.length;for(;u>s;s++)l.tweens[s].run(o);return a.notifyWith(e,[l,o,n]),1>o&&u?n:(a.resolveWith(e,[l]),!1)},l=a.promise({elem:e,props:x.extend({},t),opts:x.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:xn||En(),duration:n.duration,tweens:[],createTween:function(t,n){var r=x.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;r>n;n++)l.tweens[n].run(1);return t?a.resolveWith(e,[l,t]):a.rejectWith(e,[l,t]),this}}),c=l.props;for(Dn(c,l.opts.specialEasing);s>o;o++)if(r=kn[o].call(l,e,c,l.opts))return r;return x.map(c,Sn,l),x.isFunction(l.opts.start)&&l.opts.start.call(e,l),x.fx.timer(x.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always)}function Dn(e,t){var n,r,i,o,s;for(n in e)if(r=x.camelCase(n),i=t[r],o=e[n],x.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),s=x.cssHooks[r],s&&"expand"in s){o=s.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}x.Animation=x.extend(jn,{tweener:function(e,t){x.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;i>r;r++)n=e[r],Nn[n]=Nn[n]||[],Nn[n].unshift(t)},prefilter:function(e,t){t?kn.unshift(e):kn.push(e)}});function An(e,t,n){var r,i,o,s,a,u,l=this,c={},p=e.style,f=e.nodeType&&Lt(e),h=q.get(e,"fxshow");n.queue||(a=x._queueHooks(e,"fx"),null==a.unqueued&&(a.unqueued=0,u=a.empty.fire,a.empty.fire=function(){a.unqueued||u()}),a.unqueued++,l.always(function(){l.always(function(){a.unqueued--,x.queue(e,"fx").length||a.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(n.overflow=[p.overflow,p.overflowX,p.overflowY],"inline"===x.css(e,"display")&&"none"===x.css(e,"float")&&(p.display="inline-block")),n.overflow&&(p.overflow="hidden",l.always(function(){p.overflow=n.overflow[0],p.overflowX=n.overflow[1],p.overflowY=n.overflow[2]}));for(r in t)if(i=t[r],wn.exec(i)){if(delete t[r],o=o||"toggle"===i,i===(f?"hide":"show")){if("show"!==i||!h||h[r]===undefined)continue;f=!0}c[r]=h&&h[r]||x.style(e,r)}if(!x.isEmptyObject(c)){h?"hidden"in h&&(f=h.hidden):h=q.access(e,"fxshow",{}),o&&(h.hidden=!f),f?x(e).show():l.done(function(){x(e).hide()}),l.done(function(){var t;q.remove(e,"fxshow");for(t in c)x.style(e,t,c[t])});for(r in c)s=Sn(f?h[r]:0,r,l),r in h||(h[r]=s.start,f&&(s.end=s.start,s.start="width"===r||"height"===r?1:0))}}function Ln(e,t,n,r,i){return new Ln.prototype.init(e,t,n,r,i)}x.Tween=Ln,Ln.prototype={constructor:Ln,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(x.cssNumber[n]?"":"px")},cur:function(){var e=Ln.propHooks[this.prop];return e&&e.get?e.get(this):Ln.propHooks._default.get(this)},run:function(e){var t,n=Ln.propHooks[this.prop];return this.pos=t=this.options.duration?x.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Ln.propHooks._default.set(this),this}},Ln.prototype.init.prototype=Ln.prototype,Ln.propHooks={_default:{get:function(e){var t;return null==e.elem[e.prop]||e.elem.style&&null!=e.elem.style[e.prop]?(t=x.css(e.elem,e.prop,""),t&&"auto"!==t?t:0):e.elem[e.prop]},set:function(e){x.fx.step[e.prop]?x.fx.step[e.prop](e):e.elem.style&&(null!=e.elem.style[x.cssProps[e.prop]]||x.cssHooks[e.prop])?x.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},Ln.propHooks.scrollTop=Ln.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},x.each(["toggle","show","hide"],function(e,t){var n=x.fn[t];x.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(qn(t,!0),e,r,i)}}),x.fn.extend({fadeTo:function(e,t,n,r){return this.filter(Lt).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=x.isEmptyObject(e),o=x.speed(t,n,r),s=function(){var t=jn(this,x.extend({},e),o);(i||q.get(this,"finish"))&&t.stop(!0)};return s.finish=s,i||o.queue===!1?this.each(s):this.queue(o.queue,s)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=undefined),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=x.timers,s=q.get(this);if(i)s[i]&&s[i].stop&&r(s[i]);else for(i in s)s[i]&&s[i].stop&&Cn.test(i)&&r(s[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));(t||!n)&&x.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=q.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=x.timers,s=r?r.length:0;for(n.finish=!0,x.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;s>t;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}});function qn(e,t){var n,r={height:e},i=0;for(t=t?1:0;4>i;i+=2-t)n=jt[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}x.each({slideDown:qn("show"),slideUp:qn("hide"),slideToggle:qn("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){x.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),x.speed=function(e,t,n){var r=e&&"object"==typeof e?x.extend({},e):{complete:n||!n&&t||x.isFunction(e)&&e,duration:e,easing:n&&t||t&&!x.isFunction(t)&&t};return r.duration=x.fx.off?0:"number"==typeof r.duration?r.duration:r.duration in x.fx.speeds?x.fx.speeds[r.duration]:x.fx.speeds._default,(null==r.queue||r.queue===!0)&&(r.queue="fx"),r.old=r.complete,r.complete=function(){x.isFunction(r.old)&&r.old.call(this),r.queue&&x.dequeue(this,r.queue)},r},x.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},x.timers=[],x.fx=Ln.prototype.init,x.fx.tick=function(){var e,t=x.timers,n=0;for(xn=x.now();t.length>n;n++)e=t[n],e()||t[n]!==e||t.splice(n--,1);t.length||x.fx.stop(),xn=undefined},x.fx.timer=function(e){e()&&x.timers.push(e)&&x.fx.start()},x.fx.interval=13,x.fx.start=function(){bn||(bn=setInterval(x.fx.tick,x.fx.interval))},x.fx.stop=function(){clearInterval(bn),bn=null},x.fx.speeds={slow:600,fast:200,_default:400},x.fx.step={},x.expr&&x.expr.filters&&(x.expr.filters.animated=function(e){return x.grep(x.timers,function(t){return e===t.elem}).length}),x.fn.offset=function(e){if(arguments.length)return e===undefined?this:this.each(function(t){x.offset.setOffset(this,e,t)});var t,n,i=this[0],o={top:0,left:0},s=i&&i.ownerDocument;if(s)return t=s.documentElement,x.contains(t,i)?(typeof i.getBoundingClientRect!==r&&(o=i.getBoundingClientRect()),n=Hn(s),{top:o.top+n.pageYOffset-t.clientTop,left:o.left+n.pageXOffset-t.clientLeft}):o},x.offset={setOffset:function(e,t,n){var r,i,o,s,a,u,l,c=x.css(e,"position"),p=x(e),f={};"static"===c&&(e.style.position="relative"),a=p.offset(),o=x.css(e,"top"),u=x.css(e,"left"),l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1,l?(r=p.position(),s=r.top,i=r.left):(s=parseFloat(o)||0,i=parseFloat(u)||0),x.isFunction(t)&&(t=t.call(e,n,a)),null!=t.top&&(f.top=t.top-a.top+s),null!=t.left&&(f.left=t.left-a.left+i),"using"in t?t.using.call(e,f):p.css(f)}},x.fn.extend({position:function(){if(this[0]){var e,t,n=this[0],r={top:0,left:0};return"fixed"===x.css(n,"position")?t=n.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),x.nodeName(e[0],"html")||(r=e.offset()),r.top+=x.css(e[0],"borderTopWidth",!0),r.left+=x.css(e[0],"borderLeftWidth",!0)),{top:t.top-r.top-x.css(n,"marginTop",!0),left:t.left-r.left-x.css(n,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||s;while(e&&!x.nodeName(e,"html")&&"static"===x.css(e,"position"))e=e.offsetParent;return e||s})}}),x.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,n){var r="pageYOffset"===n;x.fn[t]=function(i){return x.access(this,function(t,i,o){var s=Hn(t);return o===undefined?s?s[n]:t[i]:(s?s.scrollTo(r?e.pageXOffset:o,r?o:e.pageYOffset):t[i]=o,undefined)},t,i,arguments.length,null)}});function Hn(e){return x.isWindow(e)?e:9===e.nodeType&&e.defaultView}x.each({Height:"height",Width:"width"},function(e,t){x.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){x.fn[r]=function(r,i){var o=arguments.length&&(n||"boolean"!=typeof r),s=n||(r===!0||i===!0?"margin":"border");return x.access(this,function(t,n,r){var i;return x.isWindow(t)?t.document.documentElement["client"+e]:9===t.nodeType?(i=t.documentElement,Math.max(t.body["scroll"+e],i["scroll"+e],t.body["offset"+e],i["offset"+e],i["client"+e])):r===undefined?x.css(t,n,s):x.style(t,n,r,s)},t,o?r:undefined,o,null)}})}),x.fn.size=function(){return this.length},x.fn.andSelf=x.fn.addBack,"object"==typeof module&&module&&"object"==typeof module.exports?module.exports=x:"function"==typeof define&&define.amd&&define("jquery",[],function(){return x}),"object"==typeof e&&"object"==typeof e.document&&(e.jQuery=e.$=x)})(window);
;// The following is just the dependencies from underscore.js 1.4.4(http://underscorejs.org/) that we need for the Events module from Backbone

(function() {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    // var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
    var
        // push             = ArrayProto.push,
        slice            = ArrayProto.slice;
        //concat           = ArrayProto.concat,
        //toString         = ObjProto.toString,
        //hasOwnProperty   = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
    var
        nativeForEach      = ArrayProto.forEach,
        // nativeMap          = ArrayProto.map,
        // nativeReduce       = ArrayProto.reduce,
        // nativeReduceRight  = ArrayProto.reduceRight,
        // nativeFilter       = ArrayProto.filter,
        // nativeEvery        = ArrayProto.every,
        // nativeSome         = ArrayProto.some,
        // nativeIndexOf      = ArrayProto.indexOf,
        // nativeLastIndexOf  = ArrayProto.lastIndexOf,
        // nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys;
        // nativeBind         = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    // if (typeof exports !== 'undefined') {
        //     if (typeof module !== 'undefined' && module.exports) {
        //         exports = module.exports = _;
        //     }
        //     exports._ = _;
    // } else {
        root._ = _;
    // }

    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys;
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function(func) {
        var ran = false, memo;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };
}).call(this);



;// A immediately invoking function wrapper around the *Events* module in Backbone.js 1.0.0.
// (https://github.com/documentcloud/backbone/blob/master/backbone.js)
// Instead of the Events object being assigned to Backbone.Events (as in the original), we
// simply assign it to window.BackboneEvents
//     Backbone.js 1.0.0

//     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

    // Create local references to array methods we'll want to use later.
    var array = [];
    // var push = array.push;
    var slice = array.slice;
    // var splice = array.splice;

    // Backbone.Events
    // ---------------

    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback
    // functions to an event; `trigger`-ing an event fires all callbacks in
    // succession.
    //
    //     var object = {};
    //     _.extend(object, Backbone.Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    var Events = window.BackboneEvents = {

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on: function(name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({callback: callback, context: context, ctx: context || this});
            return this;
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once: function(name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
            var self = this;
            var once = _.once(function() {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        },

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off: function(name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events = this._events[name]) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length) delete this._events[name];
                }
            }

            return this;
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function(name) {
            if (!this._events) return this;
            var args = slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening: function(obj, name, callback) {
            var listeners = this._listeners;
            if (!listeners) return this;
            var deleteListener = !name && !callback;
            if (typeof name === 'object') callback = this;
            if (obj) (listeners = {})[obj._listenerId] = obj;
            for (var id in listeners) {
                listeners[id].off(name, callback, this);
                if (deleteListener) delete this._listeners[id];
            }
            return this;
        }

    };

    // Regular expression used to split event strings.
    var eventSplitter = /\s+/;

    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    var eventsApi = function(obj, action, name, rest) {
        if (!name) return true;

        // Handle event maps.
        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }

        // Handle space separated event names.
        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };

    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    var triggerEvents = function(events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
        }
    };

    var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    _.each(listenMethods, function(implementation, method) {
        Events[method] = function(obj, name, callback) {
            var listeners = this._listeners || (this._listeners = {});
            var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
            listeners[id] = obj;
            if (typeof name === 'object') callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    });

})();;/*
 ----------------------------------------------------------------------------------
 NOTE (by Himanshu):
 This is a modified version of the mousetrap.js by Craig Campbell (http://craig.is/killing/mice).
 Several modifications have been made to allow specific things that were required for this project.
 They are called out in the comments using the text "[Modification for UnitsProj]". The original
 source code is available at mousetrap-original-reference_unused.js for comparison.

 A summary of the changes made:

 1. Change to add event handlers in capturing phase. For this, the call to addEventListener has been
 modified to set the 3rd param to true.

 2. Changed Mousetrap to allow multiple callbacks to be bound for the same hotkey/sequence. However,
 only one *actual* callback is allowed to execute, depending on the context etc. ("actual" here means
 as seen from the public interface for binding shortcuts provided by mod_keyboardLib.js (refer to it
 for details). For this, Mousetrap's callback triggering loops are modified to end upon encountering the first event
 with a the property `__handledByUnitsProj` set to true (this property is set by mod_keyboardLib.js)

 3. (Related to the previous point) Made changes to Mousetrap to ensure that callbacks bound using it
to the same keyboard shortcut execute in the order in which they were bound (This required specific
changes for "sequence" type shortcuts)

 4. Removed all instances of `_directMap`, `unbind`, `trigger` which are not needed and will no longer
work as expected

 5. Added methods _characterFromEvent and _eventModifiers to the public interface of the module. These are being used by mod_basicOptions.
 ----------------------------------------------------------------------------------
 */

/*global define:false */
/**
 * Copyright 2013 Craig Campbell ( on the original Mousetrap.js)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.3.3
 * @url craig.is/killing/mice
 */
(function() {

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del',
            91: 'meta',
            93: 'meta',
            224: 'meta'
        },

        /**
         * mapping for special characters so they can support
         *
         * this dictionary is only used incase you want to bind a
         * keyup or keydown event to one of these keys
         *
         * @type {Object}
         */
        _KEYCODE_MAP = {
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111 : '/',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: '\''
        },

        /**
         * this is a mapping of keys that require shift on a US keypad
         * back to the non shift equivelents
         *
         * this is so you can use keyup events with these keys
         *
         * note that this will only work reliably on US keyboards
         *
         * @type {Object}
         */
        _SHIFT_MAP = {
            '~': '`',
            '!': '1',
            '@': '2',
            '#': '3',
            '$': '4',
            '%': '5',
            '^': '6',
            '&': '7',
            '*': '8',
            '(': '9',
            ')': '0',
            '_': '-',
            '+': '=',
            ':': ';',
            '\"': '\'',
            '<': ',',
            '>': '.',
            '?': '/',
            '|': '\\'
        },

        /**
         * this is a list of special strings you can use to map
         * to modifier keys when you specify your keyboard shortcuts
         *
         * @type {Object}
         */
        _SPECIAL_ALIASES = {
            'option': 'alt',
            'command': 'meta',
            'return': 'enter',
            'escape': 'esc',
            'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
        },

        /**
         * variable to store the flipped version of _MAP from above
         * needed to check if we should use keypress or not when no action
         * is specified
         *
         * @type {Object|undefined}
         */
        _REVERSE_MAP,

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        _callbacks = {},

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        // [Modification for UnitsProj]
        // (Part of the implementation of point 4 in the summary of changes at the top, whereby all instances
        // of `_directMap`, `unbind`, `trigger` are to be removed)
        //_directMap = {},

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        _sequenceLevels = {},



        // [Modification for UnitsProj]
        // Variable to support multiple bindings for same keyboard sequence. Keeps count
        // of the number of bindings made for the same sequence. (As of now, the count
        // itself isn't required -- we only use this to find if the sequence being bound
        // is the same as another one previously bound). E.g: if "g a" (keydown) is bound
        // once and "g b" (keypress) is bound thrice this will look this:
        // {"g a:keydown": 1, "g b:keypress": 3}
        _sequenceCounts = {},

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        _resetTimer,

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        _ignoreNextKeyup = false,

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        _sequenceType = false;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = i;
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            // [Modification for UnitsProj]
            // Changed the third parameter in the call below from false to true.
            // This makes the library bind events in the capturing phase.
            object.addEventListener(type, callback, true);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * resets all sequence counters except for the ones passed in
     *
     * @param {Object} doNotReset
     * @returns void
     */
    function _resetSequences(doNotReset) {
        doNotReset = doNotReset || {};

        var activeSequences = false,
            key;

        for (key in _sequenceLevels) {
            if (doNotReset[key]) {
                activeSequences = true;
                continue;
            }
            _sequenceLevels[key] = 0;
        }

        if (!activeSequences) {
            _sequenceType = false;
        }
    }

    /**
     * finds all callbacks that match based on the keycode, modifiers,
     * and action
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event|Object} e
     * @param {boolean=} remove - should we remove any matches
     * @param {string=} combination
     * @returns {Array}
     */
    function _getMatches(character, modifiers, e, remove, combination) {
        var i,
            callback,
            matches = [],
            action = e.type;

        // if there are no events related to this keycode
        if (!_callbacks[character]) {
            return [];
        }

        // if a modifier key is coming up on its own we should allow it
        if (action == 'keyup' && _isModifier(character)) {
            modifiers = [character];
        }

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[character].length; ++i) {
            callback = _callbacks[character][i];

            // if this is a sequence but it is not at the right level
            // then move onto the next match
            if (callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                continue;
            }

            // if the action we are looking for doesn't match the action we got
            // then we should keep going
            if (action != callback.action) {
                continue;
            }

            // if this is a keypress event and the meta key and control key
            // are not pressed that means that we need to only look at the
            // character, otherwise check the modifiers as well
            //
            // chrome will not fire a keypress if meta or control is down
            // safari will fire a keypress if meta or meta+shift is down
            // firefox will fire a keypress if meta or control is down

            if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) ||
                _modifiersMatch(modifiers, callback.modifiers)) {

                // remove is used so if you change your mind and call bind a
                // second time with a new function the first one is overwritten
                if (remove && callback.combo == combination) {
                    _callbacks[character].splice(i, 1);
                }

                matches.push(callback);
            }
        }

        return matches;
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * actually calls the callback function
     *
     * if your callback function returns false this will use the jquery
     * convention - prevent default and stop propogation on the event
     *
     * @param {Function} callback
     * @param {Event} e
     * @returns void
     */
    function _fireCallback(callback, e, combo) {

        // if this event should not happen stop here
        if (Mousetrap.stopCallback(e, e.target || e.srcElement, combo)) {
            return;
        }

        if (callback(e, combo) === false) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            if (e.stopPropagation) {
                e.stopPropagation();
            }

            e.returnValue = false;
            e.cancelBubble = true;
        }
    }

    /**
     * handles a character key event
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event} e
     * @returns void
     */
    function _handleKey(character, modifiers, e) {
        var callbacks = _getMatches(character, modifiers, e),
            i,
            doNotReset = {},
            maxLevel = 0,
            processedSequenceCallback = false;

        // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
        for (i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].seq) {
                maxLevel = Math.max(maxLevel, callbacks[i].level);
            }
        }

        // loop through matching callbacks for this key event
        for (i = 0; i < callbacks.length; ++i) {

            // fire for all sequence callbacks
            // this is because if for example you have multiple sequences
            // bound such as "g i" and "g t" they both need to fire the
            // callback for matching g cause otherwise you can only ever
            // match the first one
            if (callbacks[i].seq) {

                // only fire callbacks for the maxLevel to prevent
                // subsequences from also firing
                //
                // for example 'a option b' should not cause 'option b' to fire
                // even though 'option b' is part of the other sequence
                //
                // any sequences that do not match here will be discarded
                // below by the _resetSequences call
                if (callbacks[i].level != maxLevel) {
                    continue;
                }

                processedSequenceCallback = true;

                // keep a list of which sequences were matches for later
                doNotReset[callbacks[i].seq] = 1;
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                // [Modification for UnitsProj]
                // Added the following if block
                if (e.__handledByUnitsProj) {
                    break;
                }
                continue;
            }

            // if there were no sequence matches but we are still here
            // that means this is a regular match so we should fire that
            if (!processedSequenceCallback && !_sequenceType) {
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                // [Modification for UnitsProj]
                // Added the following if block
                if (e.__handledByUnitsProj) {
                    break;
                }
            }
        }

        // if the key you pressed matches the type of sequence without
        // being a modifier (ie "keyup" or "keypress") then we should
        // reset all sequences that were not matched by this event
        //
        // this is so, for example, if you have the sequence "h a t" and you
        // type "h e a r t" it does not match.  in this case the "e" will
        // cause the sequence to reset
        //
        // modifier keys are ignored because you can have a sequence
        // that contains modifiers such as "enter ctrl+space" and in most
        // cases the modifier key will be pressed before the next key
        if (e.type == _sequenceType && !_isModifier(character)) {
            _resetSequences(doNotReset);
        }
    }

    /**
     * handles a keydown event
     *
     * @param {Event} e
     * @returns void
     */
    function _handleKeyEvent(e) {

        // normalize e.which for key events
        // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
        if (typeof e.which !== 'number') {
            e.which = e.keyCode;
        }

        var character = _characterFromEvent(e);

        // no character found then stop
        if (!character) {
            return;
        }

        if (e.type == 'keyup' && _ignoreNextKeyup == character) {
            _ignoreNextKeyup = false;
            return;
        }

        Mousetrap.handleKey(character, _eventModifiers(e), e);
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * called to set a 1 second timeout on the specified sequence
     *
     * this is so after each key press in the sequence you have 1 second
     * to press the next key before you have to start over
     *
     * @returns void
     */
    function _resetSequenceTimer() {
        clearTimeout(_resetTimer);
        _resetTimer = setTimeout(_resetSequences, 1000);
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * binds a key sequence to an event
     *
     * @param {string} combo - combo specified in bind call
     * @param {Array} keys
     * @param {Function} callback
     * @param {string=} action
     * @returns void
     */
    function _bindSequence(combo, keys, callback, action) {

        // start off by adding a sequence level record for this combination
        // and setting the level to 0
        _sequenceLevels[combo] = 0;

        // [Modification for UnitsProj]
        // Added this line:
        _sequenceCounts[combo+":"+action]? (_sequenceCounts[combo+":"+action]++): (_sequenceCounts[combo+":"+action] = 1);

        // if there is no action pick the best one for the first key
        // in the sequence
        if (!action) {
            action = _pickBestAction(keys[0], []);
        }

        /**
         * callback to increase the sequence level for this sequence and reset
         * all other sequences that were active
         *
         * @param {Event} e
         * @returns void
         */
        var _increaseSequence = function(e, seq_component_combo) {
                // [Modification for UnitsProj]
                // 1. Parameters added to the definition of the enclosing function
                // 2. Modified existing code as below (compare with mousetrap-original-for-reference.js)
                if (_u.mod_keyboardLib.shouldHandleShortcut(seq_component_combo, e.target)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    _sequenceType = action;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                }
                else {
                    _resetSequences();
                }

            },

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            _callbackAndReset = function(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            },
            i;

        // [Modification for UnitsProj]
        // Created an if-else block and moved the original code within the else block.
        // The if block ensures that if the same sequence was previously bound, we bind
        // the event for the last key only. This is required to keep the counts in
        // _sequenceLevels correct
        if (_sequenceCounts[combo+":"+action] >= 2) {
            _bindSingle(keys[keys.length-1], _callbackAndReset, action, combo, keys.length-1);
        }
        else {
            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            for (i = 0; i < keys.length; ++i) {
                _bindSingle(keys[i], i < keys.length - 1 ? _increaseSequence : _callbackAndReset, action, combo, i);
            }
        }
    }

    /**
     * binds a single keyboard combination
     *
     * @param {string} combination
     * @param {Function} callback
     * @param {string=} action
     * @param {string=} sequenceName - name of sequence if part of sequence
     * @param {number=} level - what part of the sequence the command is
     * @returns void
     */
    function _bindSingle(combination, callback, action, sequenceName, level) {

        // store a direct mapped reference for use with Mousetrap.trigger
        // [Modification for UnitsProj]
        // (Part of the implementation of point 4 in the summary of changes at the top, whereby all instances
        // of `_directMap`, `unbind`, `trigger` are to be removed)
        //_directMap[combination + ':' + action] = callback;

        // make sure multiple spaces in a row become a single space
        combination = combination.replace(/\s+/g, ' ');

        var sequence = combination.split(' '),
            i,
            key,
            keys,
            modifiers = [];

        // if this pattern is a sequence of keys then run through this method
        // to reprocess each pattern one key at a time
        if (sequence.length > 1) {
            _bindSequence(combination, sequence, callback, action);
            return;
        }

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = combination === '+' ? ['+'] : combination.split('+');

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        // make sure to initialize array if this is the first time
        // a callback is added for this key
        if (!_callbacks[key]) {
            _callbacks[key] = [];
        }

        // [Modification for UnitsProj]
        // Commented out the following line of code, which removed any callback previously
        // bound to the same key
        // _getMatches(key, modifiers, {type: action}, !sequenceName, combination);

        // add this call back to the array
        // if it is a sequence put it at the beginning
        // if not put it at the end
        //
        // this is important because the way these are processed expects
        // the sequence ones to come first
//        _callbacks[key][sequenceName ? 'unshift' : 'push']({
//            callback: callback,
//            modifiers: modifiers,
//            action: action,
//            seq: sequenceName,
//            level: level,
//            combo: combination
//        });

        // [Modification for UnitsProj:
        // Replaced code commented code above with the following code. Now sequence
        // related callbacks are still added before non-sequence ones, but they are
        // added after the previously added sequence ones. This ensures that callbacks
        // fire in the order in which they were bound, which is consistent with the
        // behavior for non-sequence bindings.]
        var callbackInfo = {
            callback: callback,
            modifiers: modifiers,
            action: action,
            seq: sequenceName,
            level: level,
            combo: combination
        };

        if (sequenceName) { // if its part of a sequence
            for (i = 0; i< _callbacks[key].length; i++) {
                if (!_callbacks[key][i].seq) {
                    break;
                }
            }
            _callbacks[key].splice(i, 0, callbackInfo);
        }
        else {
            _callbacks[key].push(callbackInfo);
        }

    }

    /**
     * binds multiple combinations to the same callback
     *
     * @param {Array} combinations
     * @param {Function} callback
     * @param {string|undefined} action
     * @returns void
     */
    function _bindMultiple(combinations, callback, action) {
        for (var i = 0; i < combinations.length; ++i) {
            _bindSingle(combinations[i], callback, action);
        }
    }

    // start!
    _addEvent(document, 'keypress', _handleKeyEvent);
    _addEvent(document, 'keydown', _handleKeyEvent);
    _addEvent(document, 'keyup', _handleKeyEvent);

    var Mousetrap = {

        /**
         * binds an event to mousetrap
         *
         * can be a single key, a combination of keys separated with +,
         * an array of keys, or a sequence of keys separated by spaces
         *
         * be sure to list the modifier keys first to make sure that the
         * correct key ends up getting bound (the last key in the pattern)
         *
         * @param {string|Array} keys
         * @param {Function} callback
         * @param {string=} action - 'keypress', 'keydown', or 'keyup'
         * @returns void
         */
        bind: function(keys, callback, action) {
            keys = keys instanceof Array ? keys : [keys];
            _bindMultiple(keys, callback, action);
            return this;
        },

        /**
         * unbinds an event to mousetrap
         *
         * the unbinding sets the callback function of the specified key combo
         * to an empty function and deletes the corresponding key in the
         * _directMap dict.
         *
         * TODO: actually remove this from the _callbacks dictionary instead
         * of binding an empty function
         *
         * the keycombo+action has to be exactly the same as
         * it was defined in the bind method
         *
         * @param {string|Array} keys
         * @param {string} action
         * @returns void
         */
        // [Modification for UnitsProj]
        // (Part of the implementation of point 4 in the summary of changes at the top, whereby all instances
        // of `_directMap`, `unbind`, `trigger` are to be removed)
//        unbind: function(keys, action) {
//            return Mousetrap.bind(keys, function() {}, action);
//        },

        /**
         * triggers an event that has already been bound
         *
         * @param {string} keys
         * @param {string=} action
         * @returns void
         */
        // [Modification for UnitsProj]
        // (Part of the implementation of point 4 in the summary of changes at the top, whereby all instances
        // of `_directMap`, `unbind`, `trigger` are to be removed)
//        trigger: function(keys, action) {
//            if (_directMap[keys + ':' + action]) {
//                _directMap[keys + ':' + action]({}, keys);
//            }
//            return this;
//        },

        /**
         * resets the library back to its initial state.  this is useful
         * if you want to clear out the current keyboard shortcuts and bind
         * new ones - for example if you switch to another page
         *
         * @returns void
         */
        reset: function() {
            _callbacks = {};
            // [Modification for UnitsProj]
            // Reset the following variable as well
            _sequenceCounts = {};

            // [Modification for UnitsProj]
            // (Part of the implementation of point 4 in the summary of changes at the top, whereby all instances
            // of `_directMap`, `unbind`, `trigger` are to be removed)
            //_directMap = {};
            return this;
        },

       /**
        * should we stop this event before firing off callbacks
        *
        * @param {Event} e
        * @param {Element} element
        * @return {boolean}
        */
        stopCallback: function(e, element) {

            // if the element has the class "mousetrap" then no need to stop
            if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                return false;
            }

            // stop for input, select, and textarea
            return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
        },

        /**
         * exposes _handleKey publicly so it can be overwritten by extensions
         */
        handleKey: _handleKey,

        characterFromEvent: _characterFromEvent, // [Modification for UnitsProj] Required by mod_basicOptions
        eventModifiers: _eventModifiers // [Modification for UnitsProj] Required by mod_basicOptions

    };

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(Mousetrap);
    }
}) ();
;// This is the first content script to load (see manifest.json for the order in which content scripts are loaded).
// It simply initializes the following object, which will serve as the top-level namespace for Units Project

var _u = {};
;// A basic pub-sub module. Any module which needs to publish/subscribe events should extend this module.
// Currently, it is simply a reference to (and a trivially basic facade for) the Backbone's `Events` module.
// (See vendor/backbone-events.js)

_u.mod_pubSub = window.BackboneEvents;;/*
 This module provides a way to have globally visible state shared between various modules. This is useful
 especially for cases like this:
 mod_B depends on mod_A. Data X owned by mod_B needs to be shared with mod_A. Simply exposing X as a
 property of mod_B (say mod_B.X) won't suffice since that would require mod_A to refer to mod_B as well,
 creating a circular dependency. (As in experiment in this project, we are sticking to avoiding circular
 dependencies)

 This module however doesn't depend on any other modules, so all of them can have this as a dependency and
 read/write properties to it.

 */

_u.mod_globals = (function() {
    "use strict";

    /*-- Public interface - various modules can directly read/write globally shared data as properties
     of thisModule (mod_globals) --*/
    var thisModule = {
        reset: reset,
        setup: setup,

        /*-- For reference, document below all properties set on mod_globals by various modules --*/

        // The following properties are set during the setup()
        pageHasUrlData: false,
        pageHasCUsSpecifier: false,

        // The following properties are directly set by various modules as and when required:

        // by mod_CUsMgr
        isCUSelected: false,
        numCUs_all: 0,  // count of all CUs
        numCUs_filtered: 0, // count of all CUs *minus* any CUs hidden by filtering

        // by mod_selectLink
        hintsEnabled: false // If true, mod_keyboardLib doesn't trigger any shortcuts
    };

    function reset() {
        var t = thisModule;
        t.pageHasUrlData = t.pageHasCUsSpecifier = t.isCUSelected = t.hintsEnabled = false;
        t.numCUs_all = t.numCUs_filtered = 0;
    }

    // called from mod_main
    function setup (settings) {
        reset();
        var expandedUrlData = settings.expandedUrlData;
        thisModule.pageHasUrlData = expandedUrlData? true: false;
        thisModule.pageHasCUsSpecifier = (expandedUrlData && expandedUrlData.CUs_specifier)? true: false;
    }

    return thisModule;
})();
;/**
 * Allows tracking of events set up by this extension (so that they be removed/reset when required)
 * For this,
 * 1) jQuery's `on` is overridden
 * 2) A wrapper `addEventListener` method is provided (like, in the case of jQuery's `on`, the the original DOM method
 * `addEventListener` isn't overwritten since it is shared with the webpage's DOM)
 */
_u.mod_domEvents = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = { // **Puts in a copy of Backbone's `Events` module**
        addEventListener: addEventListener,
        reset: reset
    };

    /*-- Module implementation --*/
    var addEventListener_eventHandlers = [],
        jQueryOn_eventHandlers = [];

    // Override jQuery's `on` function by a wrapper which allows tracking of the event bindings made by this extension
    // using $.on(). This should also work for $.click(), $.focus(), $.mouseover(), etc because these are shortcuts for
    // $.on()
    $.fn.on_original = $.fn.on;
    $.fn.on = function(/*args list intentionally left empty*/) {
        this.on_original.apply(this, arguments);
        jQueryOn_eventHandlers.push([this].concat(Array.prototype.slice.call(arguments)));
    };

    /**
     * This wrapper function should be used as an alternative to the DOM's native element.addEventListener
     * in order to track event handlers set up by this extension, so that they can be removed if required.
     * A technique similar to the overriding of jQuery's 'on' function cannot be used for this, because the DOM, including
     * its functions, are shared with current web page.
     *
     * !!!!
     * NOTE: Make sure to call this method from a module's setup() method only. Otherwise all handlers bound with this will
     * get reset when the content script is initialized.
     * @param target
     * @param event
     * @param handler
     * @param useCapture
     */
    function addEventListener(target, event, handler, useCapture) {
        target.addEventListener(event, handler, useCapture);
        addEventListener_eventHandlers.push(Array.prototype.slice.call(arguments));
    }


    // this function is not being defined as of now, since it serves no real pupose,
    // unless the TODO is implemented. A similar thing will have to be done for
    // $.fn.off
//    function removeEventListener(target, event, handler, useCapture) {
//        target.removeEventListener(event, handler, useCapture);
//        // TODO: remove from `addEventListener_eventHandlers`, the the entry corresponding to the
//        // event binding just removed. (strictly speaking, there should be no issue even if this
//        // isn't done, but it should be done to be just to be technically correct, and since
//        // some future code might depend on the contents of addEventListener_eventHandlers)
//    }


    /**
     * Removes all event handlers that were previously setup using the overridden `jQuery.on` and `addEventListener`
     * defined in this module
     */
    function reset() {

        var i, len, ehInfo, target;

        len = addEventListener_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = addEventListener_eventHandlers[i];
            target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.removeEventListener.apply(target, ehInfo);
        }
        addEventListener_eventHandlers = [];

        len = jQueryOn_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = jQueryOn_eventHandlers[i],
                target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.off.apply(target, ehInfo);
        }
        jQueryOn_eventHandlers = [];

    }

    return thisModule;

})(jQuery);


;/* JSHint config*/
/* global _u*/

/**
 * Common helper: This module contains generic helper functions are (potentially) useful to both the background scripts
 * and the content scripts. (Content script specific helper functions, i.e. ones which generally depend on the DOM, are
 * defined in mod_contentHelper.js)
 *
 * This module is meant to be a collection of miscellaneous helper functions, rather than a single
 * cohesive module with a particular role.
 */

_u.mod_commonHelper = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        makeImmutable: makeImmutable,
        executeWhenConditionMet: executeWhenConditionMet,
        stringifyFunctions: stringifyFunctions,
        destringifyFunctions: destringifyFunctions,
        stringifyRegexps_inSettings: stringifyRegexps_inSettings,
        stringifyJSONUnsupportedTypes_inSettings: stringifyJSONUnsupportedTypes_inSettings,
        destringifyJsonUnsupportedTypes_inSettings: destringifyJsonUnsupportedTypes_inSettings,
        getHostname: getHostname,
        isObject: isObject,
    };

    var regexKeys = ["urlRegexps", "urlRegexps_added", "urlRegexps_removed"];

    /**
     * Make the the specified object (deeply) immutable or "read-only", so that none of its properties (or
     * sub-properties) can be modified. The converted object is returned.
     * @param {object} obj Input object
     */
    function makeImmutable (obj) {
        if ((typeof obj === "object" && obj !== null) ||
            (Array.isArray? Array.isArray(obj): obj instanceof Array) ||
            (typeof obj === "function")) {

            Object.freeze(obj);

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    makeImmutable(obj[key]);
                }
            }
        }
        return obj;
    }

    /**
     * This function allows a passed function to be executed only after a specific condition is satisfied.
     * @param {function} functionToExecute The function to execute after a certain condition has been met
     * @param {function} testFunction This function should is a wrapper for the logic to test whether the condition for
     * functionToExecute has been met. It should return false till the condition is unmet, and true once it is met.
     * @param {int|undefined} timeOutMillisec Optional time out value. Default is 1 minute.
     *  If this value is zero or negative, functionToExecute won't be executed at all
     */
    function executeWhenConditionMet (functionToExecute, testFunction, timeOutMillisec) {
        if (typeof(timeOutMillisec) === "undefined") {
            timeOutMillisec = 60000; //1 min
        }

        if (testFunction()){
            functionToExecute();
        }
        else if (timeOutMillisec > 0){
            setTimeout(executeWhenConditionMet.bind(null, functionToExecute, testFunction, timeOutMillisec-50),50);
        }
        else {
            console.warn("UnitsProj: executeWhenConditionMet() timed out for function..:\n", functionToExecute, "\n... and testFunction:\n", testFunction);
        }
    }

    /***
     * Stringifies any property in the obj that is a function (including in the nested/inner objects within it).
     * (Functions must be stringified before they can be passed to the content script, because only JSON type messages are
     * allowed between the background and content scripts)
     * @param obj
     */
    function stringifyFunctions(obj) {

        // retruns the strigified version of the function passed
        var _stringifyFn = function(fn) {
            return "(" + fn.toString() + ")";
        };

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === "object") {
                    stringifyFunctions(obj[key]);
                }
                else if (typeof obj[key] === "function") {
                    obj[key] = _stringifyFn(obj[key]);
                }
            }
        }
    }

    /***
     * De-stringifies any property in the obj that is a stringfied function (including in the nested/inner objects within it).
     * @param obj
     */
    function destringifyFunctions(obj) {

        // Returns the de-stringifed version of the function passed. If something other than a stringified function is passed in,
        // it is returned back unmodified.
        var _destringifyFn = function(stringifiedFn) {
            var returnVal;
            try {
                returnVal = eval(stringifiedFn);
                if (typeof returnVal === "function") {
                    return returnVal;
                }
                else {
                    return stringifiedFn; // return the input back unmodified
                }
            } catch (e) {
                return stringifiedFn; // return the input back unmodified
            }
        };

        var stringifiedFn,
            initialSubstr = "(function"; // this would be the initial part of any function stringified by us.

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === "object") {
                    destringifyFunctions(obj[key]);
                }
                else if (typeof (stringifiedFn = obj[key]) === "string" &&
                    stringifiedFn.slice(0, initialSubstr.length) === initialSubstr) {
                    obj[key] = _destringifyFn(obj[key]);
                }
            }
        }
    }

    /***
     * Stringifies regular expressions in a settings object.
     * Stringify regular expressions at specific known locations in the settings object:
     * settingsObj.urlDataMap[{key}][{index}].urlRegexps
     * @param settingsObj
     */
    function stringifyRegexps_inSettings(settingsObj) {
        var stringifyRegexp_inUrlRegexpsParentObj = function(urlRegexpsParent) {
            var getStringifiedRegexp = function(regexp) {
                if (regexp && regexp instanceof RegExp) {
                    return regexp.source;
                }
            };

            if (!urlRegexpsParent) {
                return;
            }

            for (var i = 0, key; (key = regexKeys[i]); i++) {
                if (!urlRegexpsParent[key]) {
                    continue;
                }
                var urlRegexps = urlRegexpsParent[key],
                    regexStr;

                if (Array.isArray(urlRegexps)) {
                    for (var index in urlRegexps) {
                        if (urlRegexps.hasOwnProperty(index)) {
                            regexStr = getStringifiedRegexp(urlRegexps[index]);
                            if (regexStr) {
                                urlRegexps[index] = regexStr;
                            }
                        }
                    }
                }
                else {
                    regexStr = getStringifiedRegexp(urlRegexps);
                    if (regexStr) {
                        urlRegexpsParent[key] = regexStr;
                    }
                }
            }

        };

        if (!settingsObj) {
            return;
        }

        var urlDataMap = settingsObj.urlDataMap,
            urlData;

        for (var key in urlDataMap) {
            if (urlDataMap.hasOwnProperty(key)) {
                urlData = urlDataMap[key];

                if (Array.isArray(urlData)) {
                    for (var index in urlData) {
                        if (urlData.hasOwnProperty(index)) {
                            stringifyRegexp_inUrlRegexpsParentObj(urlData[index]);
                        }
                    }
                }
                else {
                    stringifyRegexp_inUrlRegexpsParentObj(urlData);
                }
            }
        }

        var disabledSites = settingsObj.disabledSites;
        stringifyRegexp_inUrlRegexpsParentObj(disabledSites);
    }

    /***
     * Destringifies regular expressions in a settings object.
     * Destringify regular expressions at specific known locations in the settings object:
     * settingsObj.urlDataMap[{key}][{index}].urlRegexps
     * @param settingsObj
     */
    function destringifyRegexps_inSettings (settingsObj) {
        var destringifyRegexp_inUrlRegexpsParentObj = function(urlRegexpsParent) {
            var getDestringifiedRegexp = function(regexpStr) {
                if (regexpStr && (regexpStr instanceof String || typeof regexpStr === "string")) {
                    return new RegExp(regexpStr);
                }
            };

            if (!urlRegexpsParent) {
                return ;
            }

            for (var i = 0, key; (key = regexKeys[i]); i++) {
                if (!urlRegexpsParent[key]) {
                    continue;
                }
                var urlRegexps = urlRegexpsParent[key],
                    regexp;

                if (Array.isArray(urlRegexps)) {
                    for (var index in urlRegexps) {
                        if (urlRegexps.hasOwnProperty(index)) {
                            regexp = getDestringifiedRegexp(urlRegexps[index]);
                            if (regexp) {
                                urlRegexps[index] = regexp;
                            }
                        }
                    }
                }
                else {
                    regexp = getDestringifiedRegexp(urlRegexps);
                    if (regexp) {
                        urlRegexpsParent[key] = regexp;
                    }
                }
            }
        };
        
        if (!settingsObj) {
            return;
        }

        var urlDataMap = settingsObj.urlDataMap,
            urlData;

        if (urlDataMap) {
            for (var key in urlDataMap) {
                if (urlDataMap.hasOwnProperty(key)) {
                    urlData = urlDataMap[key];
                    if (Array.isArray(urlData)) {
                        for (var index in urlData) {
                            if (urlData.hasOwnProperty(index)) {
                                destringifyRegexp_inUrlRegexpsParentObj(urlData[index]);
                            }
                        }
                    }
                    else {
                        destringifyRegexp_inUrlRegexpsParentObj(urlData);
                    }
                }
            }
        }

        var disabledSites = settingsObj.disabledSites;
        destringifyRegexp_inUrlRegexpsParentObj(disabledSites);
    }

    /***
     * Stringifies all the functions and regular expressions in a settings object (defaultSettings or userSettings)
     * @param {object} settingsObj
     */
    function stringifyJSONUnsupportedTypes_inSettings(settingsObj) {
        stringifyFunctions(settingsObj);
        stringifyRegexps_inSettings(settingsObj);
    }

    /***
     * De-stringifies all the functions and regular expressions in a settings object (defaultSettings or userSettings)
     * @param {object} settingsObj
     */
    function destringifyJsonUnsupportedTypes_inSettings(settingsObj) {
        destringifyFunctions(settingsObj);
        destringifyRegexps_inSettings(settingsObj);
    }

    function getHostname(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

    function isObject(object) {
        return (Object.prototype.toString.call(object) == "[object Object]");
    }

    return thisModule;
})(jQuery);
;_u.CONSTS = (function(mod_commonHelper){

    // properties defined in this object will be set as read-only properties of the global _u.CONSTS object
    var CONSTS = {

        /* -- Used by multiple modules -- */
        // This class should be applied to all elements added by this extension. This helps
        // distinguish elements added by UnitsProj from the other elements on the page.
        class_unitsProjElem: 'UnitsProj-elem',

        /* -- Used by mod_CUsMgr -- */
        class_CUOverlay : "CU-overlay",                     // class applied to all CU overlays
        class_CUSelectedOverlay : "CU-overlay-selected",    // class applied to overlay on a selected CU
        class_CUHoveredOverlay : "CU-overlay-hovered",      // class applied to overlay on a hovered CU
        // class applied to each of the 4 overlays covering the non-selected-CU part of the page
        class_nonCUPageOverlay: "non-CU-page-overlay",

        class_zenModeHidden: "UnitsProj-zen-mode-hidden", // class added to all elements made visible in the zen mode
        class_zenModeExcluded: "UnitsProj-zen-mode-excluded", // class added to all elements explicitly excluded in the zen mode
        class_zenModeVisible: "UnitsProj-zen-mode-visible", // class added to all elements hidden in the 'zen mode'
        class_zenModeActive: "UnitsProj-zen-mode-active", // class added to the body when zen mode is active

        // A selector for all elements that can receive the keyboard focus. Based on http://stackoverflow.com/a/7668761,
        // With the addition that a :visible has been added in each selector, instead of using a .filter(':visible')
        // AND we are filtering out elements with tabindex = -1 since we only require tab-able elements

        // NOTE: Removed 'iframe' and 'embed' in this selector. Although they are technically focusable, we don't need
        // them in the scenarios that this selector is used.
        focusablesSelector: 'a[href]:not(*[tabindex=-1]):visible, area[href]:not(*[tabindex=-1]):visible, ' +
            'input:not([disabled]):not(*[tabindex=-1]):visible, select:not([disabled]):not(*[tabindex=-1]):visible, ' +
            'textarea:not([disabled]):not(*[tabindex=-1]):visible, button:not([disabled]):not(*[tabindex=-1]):visible,' +
            '*[tabindex]:not(*[tabindex=-1]):visible, *[contenteditable]'

        };
    return mod_commonHelper.makeImmutable(CONSTS);
})(_u.mod_commonHelper);
;// This is done in a separate file since it can't be done before (say in initializeNamespace.js) since
// _u.CONSTS is not available then

/* This is used as a container for elements created by this program that we add to the page's DOM. (Technically,
 this would apply only to elements that don't need to be in the render flow of the page. As of 8 Apr 2013, this
 includes all elements added by this extension). This allows keeping modifications to the DOM localized inside a
 single element. */
_u.$topLevelContainer = $('<div></div>').addClass(_u.CONSTS.class_unitsProjElem);

;
// We use this over jQuery's animated scroll, since we have more control this way, and we don't have another
// jQuery dependency (plus, it seemed it would be fun to do!). Also (in limited testing) this seemed faster.

_u.mod_smoothScroll = (function() {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        smoothScroll: smoothScroll,
        isInProgress: isInProgress,
        endAtDestination: endAtDestination

    });

    // The variables below are related to the currently ongoing scroll animation.
    // Having them as globals (within the module)  allows step() to be defined as a global
    // function rather than an inner function of smoothScroll() (which means the function
    // object doesn't need to be created each time smoothScroll() is called)
    var element,                // element being scrolled
        scrollProp,             // the scroll property of the element to modify -- mostly 'scrollTop' or 'scrollLeft',
                                // but can be 'pageYOffset' or 'pageXOffset' if the element is `window`
        startPosition,          // scrollTop/scrollLeft position of the element at the time of animation beginning
        destination,            // final value of scrollTop/scrollLeft
        scrollingForward,       // true - if scroll direction is down/right; false - direction is rup/left
        speed,                  // speed of the current scroll animation (pixes/millisecs)
        inProgress,             // true if a scroll animation currently ongoing
        startTime,              // time the current animation was started
        maxDuration,            // max duration that this animation should end in
        onAnimationEnd,         // function to be called once the animation is over

        // This will later be set to one of: _setScrollProp, setPageYOffset, setPageXOffset
        // We do it this way for performance reasons (we want scrolling to be as smooth as possible)
        setScrollProp,
        _setScrollProp = function(value) {
            element[scrollProp] = value;
        },
        setPageYOffset = function(value) {
            window.scroll(window.pageXOffset, value);
        },
        setPageXOffset = function(value) {
            window.scroll(value, window.pageYOffset);
        },

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    /**
     * Smooth scrolls the specified element by setting it's 'scrollTop'/'scrollLeft' (or 'pageYOffset' or 'pageXOffset'
     * if the element is `window`) property to the `value` specified. If `isRelative` is passed as true, `value` is
     * treated as the "delta" between the current value and the desired destination.
     * over `duration` millisecs.
     * If this function is called again before the previous animation is over, the previous animation is
     * instantly ended at it's desired destination.
     * @param elemToScroll The element whose scroll-related property is to be changed in smooth increments
     * @param {string} scrollProperty Specifies which scroll property to modify -- 'mostly 'scrollTop' or 'scrollLeft',
     * but can be 'pageYOffset' or 'pageXOffset' if the element is `window`
     * @param value Destination scrollTop value at the end of animation
     * @param duration Duration of smooth scroll animation (millisecs)
     * @param {Function} [callback] Optional. Function to be called once the animation is over
     * @param {boolean} [isRelative] Optional. Is `value` to be treated as the "delta" between the current value and the
     * desired destination? If this is being passed, `callback` must be passed as `null` even if no callback is needed.
     */
    function smoothScroll(elemToScroll, scrollProperty, value, duration, callback, isRelative) {
        if (inProgress) {
            endAtDestination(); // instantly terminate any ongoing animation at final destination before starting a new one
        }

        // Chrome (Canary) complains about `scrollTop` being deprecated on body (while it's value seems to
        // always be 0 in firefox), and documentElement.scrollTop seems to not work reliably on chrome, so:
        if (elemToScroll === document.body || element === document.documentElement ||
            // we have this last condition so to enable `window` being passed with 'scrollTop' or 'scrollLeft'
            // (which is required to be done from mod_basicUtils.scroll())
            elemToScroll === window) {

            elemToScroll = window;
            if (scrollProperty === 'scrollTop'){
                scrollProperty = 'pageYOffset';
            }
            else if (scrollProperty === 'scrollLeft') {
                scrollProperty = 'pageXOffset';
            }
        }

        // if this was specified as window or changed to window by the code above
        if (elemToScroll === window)
            setScrollProp = scrollProperty === 'pageYOffset'? setPageYOffset: setPageXOffset;
        else
            setScrollProp = _setScrollProp;

        element = elemToScroll;
        scrollProp = scrollProperty;
        onAnimationEnd = callback;
        startPosition = element[scrollProperty];

        if (isRelative) {
            destination = startPosition + value;
        }
        else {
            destination = value;
        }

        if (destination > startPosition) {
            scrollingForward = true;
        }
        else if (destination < startPosition) {
            scrollingForward = false;
        }
        else {
            endAtDestination();
            return;
        }

        inProgress = true;
        // TODO: we are using the following instead of the commented out line below
        // as a temporary fix for issue #77 (GitHub). It may be reverted once Chrome
        // fixes the underlying issue (Also remove the line `now = Date.now();` in
        // step() function at that point
        startTime = Date.now();
//        startTime = performance.now();
        maxDuration = duration;

        var totalDisplacement = destination - startPosition;
        speed = totalDisplacement/duration; // pixels per millisec

        requestAnimationFrame(step, elemToScroll);
    }

    function endAtDestination() {
        setScrollProp(destination);
        inProgress = false;
        onAnimationEnd && onAnimationEnd();
    }

    // a single animation step
    function step(now) {
        // TODO: The following line has been added  as a temporary fix for issue
        // #77 (GitHub). It may be reverted once Chrome fixes the underlying issue
        // (Also make the related change in assigning `startTime` in the function
        // smoothScroll() at that point
        now = Date.now();
        var nextPosition = Math.round(startPosition + (now - startTime) * speed);
        if (scrollingForward? (nextPosition >= destination): (nextPosition <= destination) ||
            now - startTime >= maxDuration) {

            endAtDestination();
        }
        else {
            setScrollProp(nextPosition);
            requestAnimationFrame(step, element);
        }
    }

    function isInProgress() {
        return inProgress;
    }
    return thisModule;

})();;// JSHint Config
/* global CustomEvent */

/**
 * Content Script helper: This module contains helper functions are related to the content scripts i.e. generally ones
 * that depend on the DOM of the page. (Generic helper functions, which are not content script specific, are defined
 * in mod_commonHelper.js -- these may be shared between both the content and background scripts.
 *
 * This module is meant to be a collection of miscellaneous helper functions, rather than a single
 * cohesive module with a particular role.
 */

_u.mod_contentHelper = (function($, mod_commonHelper, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        rectContainsPoint: rectContainsPoint,
        elemContainsPoint: elemContainsPoint,
        elemAllowsSingleKeyShortcut: elemAllowsSingleKeyShortcut,
        elemAllowsTyping: elemAllowsTyping,
        suppressEvent: suppressEvent,
        ancestorElements: ancestorElements,
        closestCommonAncestor: closestCommonAncestor,
        isUnitsProjNode: isUnitsProjNode,
        isRtMouseButton: isRtMouseButton,
        filterOutUnneededMutations: filterOutUnneededMutations,
        getVisibleInnerText: getVisibleInnerText,
        dispatchMouseOver: dispatchMouseOver
    };

    /*-- Module implementation --*/

    // returns true/false depending on whether the HTML element `element` contains the specified point
    function elemContainsPoint(element, x, y) {
        var $element = $(element),
            offset = $element.offset();

        var x1 = offset.left,
            x2 = x1 + $element.outerWidth(),
            y1 = offset.top,
            y2 = y1 + $element.outerHeight();

        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    // returns true/false depending on whether `rect` (having keys top, left, width, height) contains the specified point
    function rectContainsPoint(rect, x, y) {
        var x1 = rect.left,
            x2 = x1 + rect.width,
            y1 = rect.top,
            y2 = y1 + rect.height;

        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    /**
     * Returns true when single key shortcuts can be invoked when the specified element has focus.
     * Exceptions are
     * 1) elements which allow typing text in them (including <select> element which allows
     * filtering)
     * 2) embedded elements (since they might have their own shortcuts, like in a game, flash player etc)
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function elemAllowsSingleKeyShortcut(element) {
        return !(elemAllowsTyping(element) || isEmbeddedElement(element));
    }

    /**
     * Does the specified element allow text to be typed on (when it has focus)
     * @param element
     * @returns {boolean}
     */
    function elemAllowsTyping(element) {
        var tagName_lowerCase = element.tagName.toLowerCase(),
            typeProp_lowerCase = element.type && element.type.toLowerCase(),

            editableInputTypes = ['text', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'password',
                'range', 'search', 'tel', 'time', 'url', 'week'];

        // if 'input' element with an unspecified type or an explicitly specified editable one
        if (tagName_lowerCase === 'input' && ( !typeProp_lowerCase || editableInputTypes.indexOf(typeProp_lowerCase) >= 0)) {

            return true;
        }

        if (tagName_lowerCase == 'textarea' || tagName_lowerCase == 'select') {
            return true;
        }

        if (element.isContentEditable) {
            return true;
        }

        // for everything else
        return false;
    }

    function isEmbeddedElement(element) {
        var nodeName = element.tagName.toLowerCase();
        return nodeName === "embed" || nodeName === "object";
    }

    function suppressEvent(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    /**
     * returns an array containing ancestor elements in document order
     * @param element
     * @return {Array of DOM elements}
     */
    function ancestorElements(element) {
        var ancestors = [];
        for (; element; element = element.parentElement) {
            ancestors.unshift(element);
        }
        return ancestors;
    }

    /** Returns that DOM element which is the closest common ancestor of the elements specified,
     * or null if no common ancestor exists.
     * @param {array|jQuery} elements Array of DOM elements OR a jQuery set of one of more elements
     * @return {HtmlElement}
     */
    function closestCommonAncestor(elements) {

        if(!elements || !elements.length) {
            return null;
        }

        if (elements.length ===1) {
            return elements[0];
        }

        // each element of this array will be an array containing the ancestors (in document order, i.e. topmost first) of
        // the element at the corresponding index in 'elements'
        var ancestorsArray = [],
            elementsLen = elements.length,
            ancestorsArrLen;

        for (var i = 0; i < elementsLen; ++i ) {
            ancestorsArray[i] = ancestorElements(elements[i]);
        }

        // check if all share the same topmost ancestor
        if (!arraysHaveSameElementAtSpecifiedIndex(ancestorsArray, 0)) {
            return null;  // no common ancestor
        }

        // This will hold the index of the element in 'elements' with the smallest number of ancestors (in other words,
        // the element that is highest in the DOM)
        var highestElementIndex = 0;


        ancestorsArrLen = ancestorsArray.length;

        for (i = 0; i < ancestorsArrLen; ++i) {
            if (ancestorsArray[i].length < ancestorsArray[highestElementIndex].length) {
                highestElementIndex = i;
            }
        }

        var ancestorArrayWithFewestElements = ancestorsArray[highestElementIndex]; // use this as the reference array
        var closestCommonAnstr = null,
            arrLen = ancestorArrayWithFewestElements.length;
        for (i = 0; i < arrLen; ++i) {
            if (arraysHaveSameElementAtSpecifiedIndex(ancestorsArray, i)) {
                closestCommonAnstr = ancestorArrayWithFewestElements[i];
            }
            else {
                break;
            }
        }

        return closestCommonAnstr;
    }

    // an array containing ancestor elements in document order
    function arraysHaveSameElementAtSpecifiedIndex(arrayOfArrays, index) {

        var refElement = arrayOfArrays[0][index],
        len = arrayOfArrays.length;

        for (var i = 1; i < len; ++i ) {
            if (arrayOfArrays[i][index] !== refElement) {
                return false;
            }

        }
        return true;
    }

    // gets the nearest containing (including itself) DOM Node that is a DOM Element
    function getNearestElement(node) {
        while(node) {
            if (node.nodeType === document.ELEMENT_NODE) {
                return node;
            }
            else {
                node = node.parentElement || node.parentNode;
            }
        }
    }

    /**
     * Checks if the specified DOM Node belongs to the UnitsProject
     * @param {Node} node
     * @returns {boolean}
     */
    function isUnitsProjNode(node) {
        var element = getNearestElement(node);
        if (!element) return false;

        return _u.$topLevelContainer[0].contains(element) || element.classList.contains(CONSTS.class_unitsProjElem) ||
            $(element).parents().hasClass(CONSTS.class_unitsProjElem);
    }

    // checks if the mouse event specified is for the right mouse button
    function isRtMouseButton(e) {
        // following right code mostly taken from http://www.quirksmode.org/js/events_properties.html
        var isRtButton;
//    if (!e) var e = window.event;
        if (e.which) isRtButton = (e.which == 3);
        else if (e.button) isRtButton = (e.button == 2);

        return isRtButton;
    }

    //filters out unneeded mutations (currently it only removes mutations related to UnitsProj elements)
    function filterOutUnneededMutations (mutations) {
        console.time("mutsFiltering");
        var len = mutations.length;
        for (var i = 0; i < len; ++i) {
            var mutation = mutations[i];
            if (canIgnoreMutation(mutation)) {
                mutations.splice(i, 1); // remove current mutation from the array
                --i;
                --len;
            }
        }
        console.timeEnd("mutsFiltering");
    }
    function canIgnoreMutation(mutationRecord) {
        if (isUnitsProjNode(mutationRecord.target)) {
            return true;
        }
//        if (mutationRecord.type === "childList" && canIgnoreAllChildlistNodes(mutationRecord.addedNodes) &&
//            canIgnoreAllChildlistNodes(mutationRecord.removedNodes)) {
//            return true;
//        }
        return false;
    }


    /**
     * Compute the visible inner text of an element.
     * Ignores element or its descendants if invisible (those with offsetHeight or offsetWidth = 0) when computing inner
     * text of the element.
     *
     * While the innerText property (supported by IE/ Webkit, not supported by Firefox) does take into account hidden
     * descendants, it misses cases where the elements are hidden using hacks such as "line-height = 0" or
     * "font-size = 0" (See #143. Links shared inside tweets on Twitter are using such hacks). Hence the need for this method.
     *
     * @param element
     * @returns {string} innerText
     */
    function getVisibleInnerText(element) {

        if (!element.offsetHeight || !element.offsetWidth) {
            return "";
        }

        var childNodes = element.childNodes;
        if (!childNodes.length) {
            return "";
        }

        var innerText = "",
            childNode, nodeType;

        for (var i = 0; i < childNodes.length; i++) {
            childNode = childNodes[i];
            nodeType = childNode.nodeType;

            // Text node
            if (nodeType === 3) {
                innerText += childNode.nodeValue;
            }

            // Element node
            else if (nodeType === 1) {
                innerText += getVisibleInnerText(childNode);
            }
        }

        return innerText;
    }

    /**
     * Dispatch mouseover event on an element
     * @param el
     */
    function dispatchMouseOver(el) {
        var event;

        // Although createEvent and initEvent are deprecated, we are continuing to use them because:
        // 1) Not all browsers yet support the alternative, CustomEvent constructor
        // 2) The mouseover issue on Quora (#25) seems to work better with this code than CustomEvent. :O (No idea why).
        event = document.createEvent('MouseEvents');
        event.initEvent('mouseover', true, false);

        el.dispatchEvent(event);
    }

//    function canIgnoreAllChildlistNodes(nodes) {
//        if (nodes && nodes.length) {
//            for (var i = 0; i < nodes.length; ++i) {
//                var node = nodes[i];
//                if(!isUnitsProjNode(node)) {
//                    return false;
//                }
//            }
//        }
//        return true;
//    }

    return thisModule;

})(jQuery, _u.mod_commonHelper, _u.CONSTS);
;/*
 Enables 2-D directional navigation for CUs, links (or any other elements)
 */

_u.mod_directionalNav = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        getClosest: getClosest,
        getPerpOverlap: getPerpOverlap,
        getAlignmentScore: getAlignmentScore
    };

    /**
     * This function enables 2D directional navigation for CUs, links etc. Given a reference element `refEl`,
     * this function returns the index of that element in the set `candidates` which is closest to `refEl` in
     * the `direction` specified (For convenience, `candidates` is allowed to include `refEl`; it will simply be
     * ignored as a candidate). If no suitable element is found, -1 is returned.
     * @param {HtmlElement|jQuery} refEl Reference element (or jQuery set, to accommodate CUs), i.e. the element
     * w.r.t. which the directional navigation is required to be done.
     * @param {Array} candidates Set of elements to consider (ALL members of this should of the same type as `refEl`).
     * As mentioned above, for convenience, `candidates` is allowed to include `refEl`; it will simply be ingored
     * as a candidate
     * @param {String} direction Direction; can be one of of 'up, 'down', 'left', 'right'
     * @param {Function} [getBoundingRect] Function to calculate bounding rects. *Needs* to be specified
     * as mod_CUMgr's `getBoundingRect` when using this function in the context of CUs, else should be left
     * unspecified, in which case we will use (a wrapper around) the DOM's native `getBoundingClientRect()`.
     * NOTE: Even though the DOM's `getBoundingClientRect()` calculates rects relative to the viewport while
     * mod_CUsMgr's `getBoundingRect()` calculates them relative to the document -- however, it doesn't matter
     * because we are only interested in the *relative* position of the various rects.
     * @param {Function} [areSame] Function to compare two CUs for equality. *Needs* to be specified when
     * calling this function in the context of CUs, else should be unspecified.
     */
    function getClosest(refEl, candidates, direction, getBoundingRect, areSame) {

        getBoundingRect || (getBoundingRect = _getBoundingRect);
        areSame || (areSame = _areSame);

        var
            ownRect = getBoundingRect(refEl),
            otherRect,

            // minimum directional distance between both sets of *corresponding* sides for an element to be considered a
            // match. E.g: if direction is 'up' or 'down', both the following should be higher than the value specified
            // by this variable:
            // 1) the vertical distance between the top sides of the elements
            // 2) the vertical distance between their bottom sides
            // (we consider this condition if actual "directional distance" between the two elements is negative, that
            // is they have "directional overlap".)
            minDirDistanceOfCorrespondingSides = 5,

            minPerpOverlap,   // a non-negative value, will be calculated later

            /* the following are "ideal" matches, i.e. elements with "perpendicular overlap" that is greater than
            `minPerpOverlap` (while lying to the correct side of the reference element directionally) */
            bestMatchIndex = -1,
            bestMatchDirDistance = Infinity,
            bestMatchAlignmentScore = -Infinity,
            bestMatchPerpOverlap = -Infinity,
//            bestMatchPerpDistBtwCenters = Infinity,

            /* the following are for "fallback" matches i.e . elements whose "perpendicular overlap" is less than
            `minPerpOverlap` (while lying to the correct side of the reference element directionally) */
            bestFallbackMatchIndex = -1,
            bestFallbackMatchDirDistance = Infinity,
            bestFallbackMatchAlignmentScore = -Infinity,
//            bestFallbackMatchPerpOverlap = -Infinity,
//            bestFallbackMatchPerpDistanceBtwCenters = Infinity,

            ownRectRight = ownRect.left + ownRect.width,
            ownRectBottom = ownRect.top + ownRect.height,
            ownRectPerpDimension;
//            perpDistanceBtwCenters,
//            ownRectPerpDimensionCenter;


        if  (direction === 'up' || direction === 'down') {
            ownRectPerpDimension = ownRect.width;
//            ownRectPerpDimensionCenter = ownRect.left + ownRectPerpDimension/2;
        }
        else {
            ownRectPerpDimension = ownRect.height;
//            ownRectPerpDimensionCenter = ownRect.top + ownRectPerpDimension/2;
        }

        var len = candidates.length;
        for (var i = 0; i < len; i++) {
            if (areSame(refEl, candidates[i]))
                continue;

            otherRect = getBoundingRect(candidates[i]);
            var
                perpOverlap = getPerpOverlap(ownRect, otherRect, direction),
                // "directional distance" - distance between elements along the direction specified. This will
                // usually be positive, and if not there is a directional overlap between the elements  
                dirDistance,
                alignmentScore = getAlignmentScore(ownRect, otherRect, direction),
                // directional distance between the leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                leadingEdgeDirDistance,
                // directional distance between the non-leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                nonLeadingEdgeDirDistance;

            if (direction === 'down' || direction === 'up') {
                var otherRectBottom = otherRect.top + otherRect.height;
                if (direction === 'down') {
                    dirDistance = otherRect.top - ownRectBottom;
                    leadingEdgeDirDistance = otherRectBottom - ownRectBottom;
                    nonLeadingEdgeDirDistance = otherRect.top - ownRect.top;
                }
                else {
                    dirDistance = ownRect.top - otherRectBottom;
                    leadingEdgeDirDistance = ownRect.top - otherRect.top;
                    nonLeadingEdgeDirDistance = ownRectBottom - otherRectBottom;
                }
                minPerpOverlap = 0.1 * Math.max(ownRectPerpDimension, otherRect.width);  // 10% of the larger dimension
//                perpDistanceBtwCenters = Math.abs(ownRectPerpDimensionCenter - (otherRect.left + otherRect.width/2));
            }
            else { // (direction === 'right' || direction === 'left')
                var otherRectRight = otherRect.left + otherRect.width;
                if (direction === 'right') {
                    dirDistance = otherRect.left - ownRectRight;
                    leadingEdgeDirDistance = otherRectRight - ownRectRight;
                    nonLeadingEdgeDirDistance = otherRect.left - ownRect.left;
                }
                else {
                    dirDistance = ownRect.left - otherRectRight;
                    leadingEdgeDirDistance = ownRect.left - otherRect.left;
                    nonLeadingEdgeDirDistance = ownRectRight - otherRectRight;
                }
                minPerpOverlap = 0.1 * Math.max(ownRectPerpDimension, otherRect.height);  // 10% of the larger dimension
//                perpDistanceBtwCenters = Math.abs(ownRectPerpDimensionCenter - (otherRect.top + otherRect.height/2));
            }

            var bufferSmall = 20,
                bufferLarge = 60;

            // This check allows us to includes any element that might be considered to lie
            // on the correct side of `refEl` based on the `direction` specified
            if ((dirDistance > 0 ||
                (Math.min(leadingEdgeDirDistance, nonLeadingEdgeDirDistance) >= minDirDistanceOfCorrespondingSides))) {

                // Condition for "ideal matches" (see comments near the top)
                // Note: Entering the outer condition once ensures that we will find an "ideal" match. That is, we
                // *will* enter the inner block where bestMatchIndex is assigned a value (based on the initial values
                // of bestMatchDirDistance and  bestMatchPerpOverlap)
                if (perpOverlap > minPerpOverlap) {
                    var dirDistToConsider = Math.max(0, dirDistance);
                    // below we keep track of the best match so far, which is *usually* the element with the lowest
                    // `dirDistToConsider`, but can be another element if it's `dirDistToConsider` is only slightly
                    // worse than the value for the best match while having a significantly better value for `alignmentScore`
                    if ((dirDistToConsider <= bestMatchDirDistance && alignmentScore > bestMatchAlignmentScore) ||
                        (dirDistToConsider < bestMatchDirDistance - bufferSmall) ||
                        (dirDistToConsider < bestMatchDirDistance + bufferSmall &&
                            alignmentScore > bestMatchAlignmentScore + bufferLarge)) {

                        bestMatchDirDistance = dirDistToConsider;
                        bestMatchPerpOverlap = perpOverlap;
                        bestMatchAlignmentScore = alignmentScore;
//                        bestMatchPerpDistBtwCenters = perpDistanceBtwCenters;
                        bestMatchIndex = i;
                    }
                }

                // "fallback matches" (see comments near the top)
                else if (bestMatchIndex === -1) {
                    if (alignmentScore > bestFallbackMatchAlignmentScore ||
                        alignmentScore === bestFallbackMatchAlignmentScore && dirDistance < bestFallbackMatchDirDistance) {

                        bestFallbackMatchAlignmentScore = alignmentScore;
                        bestFallbackMatchDirDistance = dirDistance;
                        bestFallbackMatchIndex = i;
                    }
                }
            }
        }
        return bestMatchIndex > -1? bestMatchIndex: bestFallbackMatchIndex;
    }

    // Returns the "perpendicular overlap" between the reference rect (`refRect`) and the `otherRect`, i.e.
    // *horizontal overlap* if the `direction` is up/down, and *vertical overlap* if the direction is left/right.
    // The higher the returned value, the more the perpendicular overlap. If the returned value is negative, there
    // is no perp overlap, and the rects are actually separated by a "perpendicular distance" equal to the magnitude of
    // the negative value.
    function getPerpOverlap(refRect, otherRect, direction) {
        var perpSum,        // sum of the rectangles' heights if direction is right/left, and widths if it is up/down.
            perpMaxDiff;    // Max diff between any two points in the two rects (measured perpendicular to the direction
                            // of movement). if this is less than `perpSum`, there is a "perpendicular overlap"

        if (direction === 'right' || direction === 'left') {
            perpSum = refRect.height + otherRect.height;
            perpMaxDiff = Math.max(refRect.top + refRect.height, otherRect.top + otherRect.height) -
                Math.min(refRect.top, otherRect.top);

        }
        else { // 'down' or 'up'
            perpSum = refRect.width + otherRect.width;
            perpMaxDiff = Math.max(refRect.left + refRect.width, otherRect.left + otherRect.width) -
                Math.min(refRect.left, otherRect.left);
        }

        return perpSum - perpMaxDiff; // higher the value, more the overlap
    }

    // Score indicating how much `otherRect` is aligned to `refRect` when moving from `refRect`
    // in the direction `direction`. It measures by how much refRect's mid-point is covered by
    // `otherRect` on *each* side of the mid-point (all measurements obviously in the dimension
    // perpendicular to `direction`). So, a score of 5 means that otherRect covers refRect's 
    // mid-point by 5px on *each* side. For this reason, the max. possible score is half of
    // ownRect's size (in the dimension perpendicular to `direction`).
    // If ownRect's mid-point isn't covered by any part of refRect, the score is -ve, and its 
    // magnitude is the distance of the mid-point from the nearest edge of refRect.
    // Note: The score isn't symmetric w.r.t the two rects.
    function getAlignmentScore(refRect, otherRect, direction) {
        // Note: all measurements etc below are for the dimension perpendicular to `direction`
        var refRectMid;
        if (direction === 'right' || direction === 'left') {
            refRectMid = refRect.top + refRect.height/2;
            var otherRectTop = otherRect.top,
                otherRectBottom = otherRectTop + otherRect.height;

            if (refRectMid >= otherRectTop && refRectMid <= otherRectBottom) {
                return Math.min(refRect.height/2, refRectMid - otherRectTop, otherRectBottom  - refRectMid); // +ve
            }
            else {
                return -Math.min(Math.abs(refRectMid - otherRectTop), Math.abs(refRectMid - otherRectBottom)); // -ve
            }
        }
        else { // 'down' or 'up'
            refRectMid = refRect.left + refRect.width/2;
            var otherRectLeft = otherRect.left,
                otherRectRight = otherRectLeft + otherRect.width;

            if (refRectMid >= otherRectLeft && refRectMid <= otherRectRight) {
                return Math.min(refRect.width/2, refRectMid - otherRectLeft, otherRectRight  - refRectMid); // +ve
            }
            else {
                return -Math.min(Math.abs(refRectMid - otherRectLeft), Math.abs(refRectMid - otherRectRight)); // -ve
            }
        }
    }

    // NOTE: since this uses getBoundingClientRect, the rect returned is relative to the viewport, but since
    // we're considering relative values only, it doesn't matter
    function _getBoundingRect(el) {
        return el.getBoundingClientRect();
    }

    function _areSame(a, b) {
        return a === b;
    }
    return thisModule;

})(jQuery);

;/**
 * A central "mutation observer" module. It runs various MutationObserver instances required by other module.
 * Among other things, having this as a central module makes it easy to disable/enable DOM mutation observing when needed.
 * Detects changes in the DOM/url and triggers events in response.
 *
 * Events triggered:
 * 'url-change' args passed: new-url, old-url
 * 'documentMuts_fallback' args passed: mutations
 * 'selectedCUTopLevelMuts' args passed: mutations
 * 'selectedCUDescendantsMuts' args passed: mutations
 *
 * Dependencies:
 * mod_chromeAltHack: (Just in order to determine whether the 'accesskey' attribute needs to be observed for
 * mutations, depending on whether mod_chromeAltHack is loaded.)
 */
_u.mod_mutationObserver = (function($, mod_chromeAltHack, mod_contentHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        enable: enable,
        disable: disable,
        enableFor_selectedCUAndDescendants: enableFor_selectedCUAndDescendants,
        enableFor_CUsAncestors: enableFor_CUsAncestors
    });

    /* NOTE: Throughout this file, mutation observer related variables have suffixes as follows:
    1. "fallback": This is for the "fallback" MO, which is applied to `document`. It exists to allow
    handling of mutations that are missed by the other, more specific, MOs. It also tracks url change.
    2. "selectedCUTopLevel": For the MO(s) on the selected CU's top-level element(s)
    3. "selectedCUDescendants": For the MOs on the descendants of the selected CU
    4. "CUsAncestors": For the MOs on all the ancestors of the selected CU/middle CU (in most cases,
    (most of) these ancestors will be shared by all the the CUs)


    /*-- Module implementation --*/
    var
        isEnabled,
        currentUrl = window.location.href,
        timemout_reenable,
        MutationObserver = window.MutationObserver ||window.WebKitMutationObserver || window.MozMutationObserver;


    var attrFilter = ['class', 'style', 'height', 'width', 'cols', 'colspan', 'rows', 'rowspan', 'shape', 'size'];
    // 'accesskey' required only for "chrome alt hack". It should be okay adding it to the entire list since the 'accesskey'
    // attribute hardly changes. (In mod_chromeAltHack we specifically check that an "attribute" mutation should be a 
    // mutation mutation in the 'accesskey' attr.
    mod_chromeAltHack && attrFilter.push('accesskey'); 

    var init_withSubtree = {
        childList: true,
        attributes:true,
        attributeFilter: attrFilter,
        characterData: true,
        subtree: true,
    };

    var init_withOUTSubtree = {
        childList: true,
        attributes:true,
        attributeFilter: attrFilter,
        characterData: true,
    };

    var MO_fallback = new MutationObserver(handler_fallback);
    var MOsArr_selectedCUTopLevel = [];
    var MOsArr_selectedCUDescendants = [];
    var MOsArr_CUsAncestors = [];

    var $selectedCU;
    var $CUsAncestors;

    // Enable observing of DOM mutations
    // NOTE: a function which wants to disable the mutation observer temporarily
    // before enabling it again, should make the call to enable() only if true was
    // returned from calling disable() (for example see how it's done in mod_CUsMgr.js)
    function enable() {
        isEnabled = true;
        clearTimeout(timemout_reenable);

        $selectedCU && enableFor_selectedCUAndDescendants();
        $CUsAncestors && enableFor_CUsAncestors();

        // Notes: Even to track (visual and state) changes to the set of CUs, we need to observe changes on the entire
        // *document* (as opposed to the common ancestor of the CUs). An example of why this is necessary: if an element
        // is added/resized near the top of the page, the position of the CUs would change.
        MO_fallback.observe(document, init_withSubtree);
    }

    /**
     * Disable observing of DOM mutations. Returns 'true' if mod_mutationObserver was disabled due
     * to this call, 'false' if it was already disabled.
     * @param {boolean} [allowLongDisable] Optional. If this is true, we don't automatically re-enable
     * after a specified period
     */
    function disable(allowLongDisable) {
        if (!isEnabled) {
            return false;   // already disabled, so return `false` to indicate that
        }
        else {
            if (!allowLongDisable) {
                var enableAgainPeriod = 30000; // millisecs
                clearTimeout(timemout_reenable); // just in case it is set
                timemout_reenable = setTimeout(function() {
                    console.warn('Mutation Observer was stopped ' + enableAgainPeriod + ' ms ago and not restarted. Is being re-enabled');
                    enable();
                }, enableAgainPeriod);
            }

            MO_fallback.disconnect();
            disableMOsInArray(MOsArr_CUsAncestors);
            disableMOsInArray(MOsArr_selectedCUDescendants);
            disableMOsInArray(MOsArr_selectedCUTopLevel);
            isEnabled = false;
            return true;    // to indicate that it mod_mutationObserver was disabled due to this call to disable()
        }
    }

    function handler_fallback(mutations) {
        // Call this on every mutation, because,in theory, JS code on a page can replace the body element with a new one at
        // any time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
        //ensureTopLevelContainerIsInDom();

        var newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            thisModule.trigger("url-change", newUrl, currentUrl);
            currentUrl = newUrl;
        }
        else {
            thisModule.trigger("documentMuts_fallback", mutations);
        }
    }

    function handler_selectedCUTopLevel(mutations) {
        thisModule.trigger("selectedCUTopLevelMuts", mutations);
    }
    function handler_selectedCUDescendants(mutations) {
        thisModule.trigger("selectedCUDescendantsMuts", mutations);
    }
    function handler_CUsAncestors(mutations) {
        thisModule.trigger("CUsAncestorsMuts", mutations);
    }

    // if $CU is passed use it to set $selectedCU, else use whatever $selectedCU is already set to
    function enableFor_selectedCUAndDescendants($CU) {
        if ($CU) {
            $selectedCU = $CU;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($selectedCU, handler_selectedCUTopLevel, init_withOUTSubtree, MOsArr_selectedCUTopLevel);
            enableMOsForSet_and_saveRefs($selectedCU.children(), handler_selectedCUDescendants, init_withSubtree, MOsArr_selectedCUDescendants);
        }
    }

    // if $ancestors is passed use it to set $CUsAncestors, else use whatever $CUsAncestors is already set to
    function enableFor_CUsAncestors($ancestors) {
        if ($ancestors) {
            $CUsAncestors = $ancestors;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($CUsAncestors, handler_CUsAncestors, init_withOUTSubtree, MOsArr_CUsAncestors);
        }
    }

    function disableMOsInArray(MOsArr) {
        for (var i = 0; i < MOsArr.length; i++) {
            MOsArr[i].disconnect();
        }

        // empties the original array (http://stackoverflow.com/questions/1232040)
        MOsArr.length = 0;
    }


    function enableMOsForSet_and_saveRefs($set, handler, init, array) {
        disableMOsInArray(array);

        var len = $set.length;
        for (var i = 0; i < len; i++) {
            var MO = new MutationObserver(handler);
            MO.observe($set[i], init);
            array.push(MO);
        }
    }

    // 1. filters out unneeded mutations (currently it only removes mutations related to UnitsProj elements)
    // 2. sets the state of `hasChildListMutation` correctly for this batch of mutations
    // 3. calls `handleRelevantMutations` if required
//    function processMutations(mutations) {
//        hasChildListMutation = false;
//
//        for (var i = 0; i < mutations.length; ++i) {
//            var mutation = mutations[i];
//            if (canIgnoreMutation(mutation)) {
//                mutations.splice(i, 1); // remove current mutation from the array
//                --i;
//            }
//            else if (mutation.type === "childList") {
//                hasChildListMutation = true;
//            }
//        }
//
//        // if there are mutations left still
//        if (mutations.length) {
//            handleRelevantMutations(mutations);
//        }
//    }

//    function canIgnoreMutation(mutationRecord) {
//        if (mod_contentHelper.isUnitsProjNode(mutationRecord.target)) {
//            return true;
//        }
//        if (mutationRecord.type === "childList" && canIgnoreAllChildlistNodes(mutationRecord.addedNodes) &&
//            canIgnoreAllChildlistNodes(mutationRecord.removedNodes)) {
//                return true;
//        }
//        return false;
//    }

//    function canIgnoreAllChildlistNodes(nodes) {
//        if (nodes && nodes.length) {
//            for (var i = 0; i < nodes.length; ++i) {
//                var node = nodes[i];
//                if(!mod_contentHelper.isUnitsProjNode(node)) {
//                    return false;
//                }
//            }
//        }
//        return true;
//    }

    // Currently commented out because it mostly likely serves no real use, while possibly impacting performance
    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
//    function ensureTopLevelContainerIsInDom() {
//        if (!document.body.contains(_u.$topLevelContainer[0])) {
////        console.log('appending $topLevelContainer to body');
//            _u.$topLevelContainer.appendTo(document.body);
//        }
//    }

    return thisModule;

})(jQuery, _u.mod_chromeAltHack, _u.mod_contentHelper);;/*
 A not on the "chrome Alt hack" used in this project.
 This "hack" is meant to allow shortcuts of the type 'Alt + <key>' to work (better) on Chrome in Windows.
 There are two problems with such shortcuts on Chrome in Windows/Linux.
 a) Windows only: they cause a beep/"ding" sound in chrome when invoked (even when the keyboard event is suppressed in
 the JS handler).
 (Ref: http://code.google.com/p/chromium/issues/detail?id=105500)k
 b) Since chrome implements the "accesskey" attribute as 'Alt + <key>' shortcuts, this can a conflict with shortcuts
 defined by the extension (even if the keyboard event is suppressed). In case of such a conflict both the conflicting
 actions -- the execution of extension's shortcut handler and focusing of the element with the conflicting accesskey --
 take place, which is undesirable.

 These issues are handled in the following ways:
 1) For each 'alt+<key' shortcut required by this extension, we insert an otherwise unused div (non focusable by into the dom
 for the sole purpose of setting its accesskey attribute to the key specified with alt in this shortcut.

 It also removes conflicting access-keys attributes in the DOM (because calling preventDefault or stopImmediatePropagation
 is unable to stop their action). Finally, it reinstates the removed access-key attributes when the extension is
 disabled temporarily.

 Note: this won't help with shortcuts like alt+shift+<key> etc, only of the type "alt+key"
 */

if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1 &&
    (navigator.appVersion.indexOf("Win")!=-1 || navigator.appVersion.indexOf("Linux")!=-1)) {
    _u.mod_chromeAltHack = (function($, mod_contentHelper, mod_mutationObserver, CONSTS) {
        "use strict";

       /*-- Public interface --*/
        var thisModule = $.extend({}, _u.mod_pubSub, {
            reset: reset, // Resets state AND *undoes* the hack including reinstating accessKey removed earlier
            applyHackForSpecifiedShortcuts: applyHackForSpecifiedShortcuts,
            removeAnyConflictingAccessKeyAttr: removeAnyConflictingAccessKeyAttr
        });

        /*-- Module implementation --*/
        /*-- Event bindings --*/
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onDomMutations);
        var
            // when the extension is disabled, this is used to reinstate the conflicting access key attributes
            // that were removed from the original DOM
            accesskeysRemoved = [],

            // array of <key>'s that are a part of alt+<key> type shortcuts; used to detect conflicts on DOM changes
            altShortcutKeys = [],

            class_dummyAccessKey = 'UnitsProj-dummyAccessKey',
            $topLevelContainer = _u.$topLevelContainer,
            class_unitsProjElem = CONSTS.class_unitsProjElem,

            // options for mutObs
            groupedMutations,
            timeout_mutations,
            lastMutationsHandledTime,
            // don't run mutation handler more than once per these many milliseconds. we specify a high value here
            // since accesskey are not expected to change frequently
            mutationGroupingInterval = 5000;

        // Resets state AND *undoes* the effect of the hack including reinstating accessKey removed earlier
        function reset() {

            // undo DOM changes due to hack...
            var len = accesskeysRemoved.length,
                data;
            for (var i = 0; i < len; i++) {
                data = accesskeysRemoved[i];
                $(data.element).attr('accesskey', data.accessKey); // reinstate the removed accesskeys
            }
            _u.$topLevelContainer.find('.' + class_dummyAccessKey).remove();

            // reset state for the future...
            accesskeysRemoved = [];
            altShortcutKeys = [];
            groupedMutations = [];
            lastMutationsHandledTime = 0;
            timeout_mutations = false;
        }

        /**
         * Applies the "chrome alt hack" (if required) to the page, based on array of keyboard shortcuts passed.
         * This involves two things:
         * 1) Inserting <div> elements with dummy accesskeys to disable the "ding" sound (see comments on top)
         * 2) Removing any conflicting accesskey attributes
         * These is meant to be called at the time of initializing the keyboard shortcuts for the current page.
         * @param {Array} shortcutsArr - array of strings, each of which specifies a keyboard shortcut
         */
        function applyHackForSpecifiedShortcuts(shortcutsArr) {

            var shortcutsLen = shortcutsArr.length;
            for (var i = 0; i < shortcutsLen; ++i) {
                var shortcut = shortcutsArr[i],
                    tokens =  shortcut.trim().split(/\s*\+\s*/),
                    keyAfterAlt;

                // this function is useful only when the following condition is true
                if (tokens && tokens.length == 2 && tokens[0].toLowerCase() === "alt") {

                    keyAfterAlt = tokens[1].toLowerCase();

                    if (altShortcutKeys.indexOf(keyAfterAlt) === -1) {
                        altShortcutKeys.push(keyAfterAlt);
                    }

                    removeAccessKey(keyAfterAlt, document);

                    if (!($topLevelContainer.find('[accesskey="' + keyAfterAlt+ '"]').length)) {

                        $topLevelContainer.append(
                            $('<div></div>')
                                .attr('accesskey', keyAfterAlt)
                                .addClass(class_dummyAccessKey)
                                .addClass(class_unitsProjElem)
                        );
                    }
                }
            }
        }

        /**
         * Removes any conflicting accesskey attributes that come into existence due to a DOM change, based on the
         * stored list of keyboard shortcuts active on the page. Groups closely separated mutations together for
         * performance.
         * @param mutations
         */
        function onDomMutations(mutations) {
//            mod_contentHelper.filterOutUnneededMutations(mutations); // removes mutations that aren't of interest

//            if (mutations.length) {
                groupedMutations = groupedMutations.concat(mutations);
                if (timeout_mutations === false) { // compare explicitly with false, which is how we reset it
                    // if timeout period is 0 or negative, will execute immediately (at the first opportunity after yielding)
                    timeout_mutations = setTimeout(_onDomMutations, mutationGroupingInterval - (Date.now() - lastMutationsHandledTime));
                }
//            }
        }
        function _onDomMutations() {
            console.time("chromeAltHack-muts");
            timeout_mutations = false;
            lastMutationsHandledTime = Date.now();
//            console.log('grouped _onDomMutations called');

            var mutationsLen = groupedMutations.length,
                mutationRecord,
                addedNodes,
                len;

            for (var i = 0; i < mutationsLen; ++i) {
                mutationRecord = groupedMutations[i];

                if ((addedNodes = mutationRecord.addedNodes) && (len = addedNodes.length)) {

                    for (var j = 0; j < len; ++j) {
                        var node = addedNodes[j];
                        if (node.nodeType === document.ELEMENT_NODE) {
                            removeAnyConflictingAccessKeyAttr(node);
                        }
                    }
                }

                if (mutationRecord.attributeName && mutationRecord.attributeName.toLowerCase() === 'accesskey') {
                    var accessKey = mutationRecord.target.getAttribute("accesskey");
                    accessKey = accessKey && accessKey.toLowerCase();
                    if (accessKey && altShortcutKeys.indexOf(accessKey) !== -1) {
                        mutationRecord.target.setAttribute('accesskey', '');

                    }
                }
            }
            groupedMutations = []; // reset
            console.timeEnd("chromeAltHack-muts");

        }

        /**
         * Removes  conflicting accesskeys from the specified element and all its children
         * @param element
         */
        function removeAnyConflictingAccessKeyAttr(element) {
            var altShortcutKeysLen = altShortcutKeys.length;
            for (var i = 0; i < altShortcutKeysLen; ++i) {
                removeAccessKey(altShortcutKeys[i], element);
            }
        }

        /**
         * Removes the specified accessKey attribute from the specified DOM element, and any descendants.
         * This is required because calling stopImmediatePropagation() or preventDefault() (in a conflicting keyboard
         * shortcut's handler does not prevent the accesskey attribute's function from taking place. So any focusable
         * elements with conflicting accesskey's on the page needs to have their acccesskey attribute removed.
         * @param accessKey
         * @param {HtmlElement} element The DOM element within which (including its subtree) a conflicting accesskey will be
         * removed.
         */
        function removeAccessKey(accessKey, element) {

            var $all =  $(element).find('[accesskey="' + accessKey+ '"]:not(.' +
                class_dummyAccessKey + ')');

            // we make this check since `document` doesn't have the setAttribute method
            if (element.setAttribute) {
                $all = $all.add(element);
            }

            $all.each(
                function(index, element) {
                    element.setAttribute('accesskey', '');
                    accesskeysRemoved.push({element: element, accessKey: accessKey});
//            console.log('accesskeysRemoved', accesskeysRemoved);
                }
            );
        }

        return thisModule;

    })(jQuery, _u.mod_contentHelper, _u.mod_mutationObserver, _u.CONSTS);
}

;// JSHint Config
/* global Mousetrap */

/*
 mod_keyboardLib

 This module provides a wrapper around, and extension to, the MouseTrap library for the rest of the module.
 If/when the MouseTrap library is replaced with something else, this is the only module that will have to be
 changed.

 The following extensions are made to the original Mousetrap library:
 1) Enable the use of 'space' key as a *special* modifier (used by mod_selectLink etc)
 2) Override Mousetrap.stopCallback according to our specific logic, which:
 i) allows shortcuts to be invoked even when on a text input element, as long as one of these keys is part of the
 shortcut: ctrl, alt, option, meta, and command
 ii) prevents shortcuts without one of the keys listed above from getting invoked ONLY within an text editable
 input element (see code for details), and NOT all input elements (which is mousetrap's default behavior)
 iii) Check that the shortcut being handled is not in `protectedWebpageShortcuts`
 3) Allowing alt+<key> type shortcuts to work well on Chrome+Windows (ref: mod_chromeAltHack)
 */

_u.mod_keyboardLib = (function(Mousetrap, mod_contentHelper, mod_globals, mod_domEvents, mod_chromeAltHack) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset:reset,
        setup: setup,
        bind: bind,
        shouldHandleShortcut: shouldHandleShortcut, // exposed publicly for Mousetrap library (mousetrap-modified.js)
        canUseSpaceAsModfier: canUseSpaceAsModfier,
        wasSpaceUsedAsModifier: wasSpaceUsedAsModifier,
        canIgnoreSpaceOnElement: canIgnoreSpaceOnElement
    });

    var protectedWebpageShortcuts,
        //    var protectedWebpageShortcuts_lowerCase,
        _canUseSpaceAsModifier,
        _wasSpaceUsedAsModifier = false,
        isSpaceDown = false;

    function setup(settings) {
        mod_domEvents.addEventListener(document, 'keydown', handlerToEnableSpaceAsModifier, true);
        mod_domEvents.addEventListener(document, 'keyup', handlerToEnableSpaceAsModifier, true);

        protectedWebpageShortcuts = settings.expandedUrlData && settings.expandedUrlData.protectedWebpageShortcuts;
//        protectedWebpageShortcuts_lowerCase = [];
//        for (var i = 0; i < protectedWebpageShortcuts.length; i++) {
//            protectedWebpageShortcuts_lowerCase[i] = protectedWebpageShortcuts[i].toLowerCase();
//        }

    }

    /**
     * The bind function maps an array of keyboard shortcuts to a handler. Before the handler is triggered for a
     * particular keyboard shortcut (and the the corresponding keyboard event suppressed), we call `shouldHandleShortcut`
     * to determine if the handler should be invoked. If multiple handlers are bound to the same shortcut, the first
     * one to successfully be handled will stop further propagation of the event, ensuring that only one handler
     * is invoked for a particular keyboard shortcut.
     *
     * @param {Array} shortcuts
     * @param {Function} handler
     * @param {Object|Function}[context] An object specifying the "context" for this shortcut to be applicable (refer:
     * isContextValid()). A function can also be specified -- the shortcut will be handled if the function
     * evaluates to true when the shortcut is invoked. If no `context` is specified, the shortcut is deemed valid in
     * any context.
     * @param {boolean} [dependsOnlyOnContext] If this is true, the function `canTreatAsShortcut` is not used to
     * determine whether or the shortcut should be invoked; only the supplied `context` is used to determine that.

     Further Notes:
     1) When handling a shortcut, we suppress further propagation of the event. This seems reasonable since if a
     shortcut has been invoked, nothing else should happen. (If required in the future, this behavior can be changed
     with an optional parameter. One particular example where event suppression is required is the Google search
     results page, where otherwise pressing keys results in corresponding text  getting typed into the search box.
     (In addition, Mousetrap (mousetrap-modified.js) has been changed to bind events in the capturing phase for this
     to work)
     2) Currently, each specified shortcut is bound on the 'keydown' event (while the corresponding 'keypress' and
     'keyup' events are handled are simply suppresed. This aids simplicity and consistency, but if found to be causing
     issues, can be re-thought.
     3) Binding is done for the capturing phase of the event (by modifying Mousetrap library)
     4) Owing to point 1), modules which have conflicting shortcuts should have their shortcuts bound in order of
     priority. TODO: give an example of this 
     */
    function bind(shortcuts, handler, context, dependsOnlyOnContext) {

        // If the shortcut is to be handled, suppresses event from propagation and returns 1. Else returns 0.
        // [returns 1/0 instead of true/false since returning `false` causes Mousetrap to suppress the event, which
        // causes problems with the 'keypress' and 'keydown' bindings (where this function is itself the callback)]
        var suppressPropagationIfHandling = function (e, shortcut) {
            if (shouldHandleShortcut(shortcut, e.target, context, dependsOnlyOnContext)) {
                mod_contentHelper.suppressEvent(e);
                return 1;
            }
            return 0;
        };

        Mousetrap.bind(shortcuts, function(e, shortcut) {
            if (suppressPropagationIfHandling(e, shortcut)) {
                e.__handledByUnitsProj = true;  // is checked within mousetrap-modified.js
                handler();
            }
        }, 'keydown');
        Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keypress');

        // NOTE: the following line has been commented out because if was preventing sequences
        // of the same letter (e.g.: 'f f') from functioning properly. (refer: github issue #72)
        //Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keyup');

        if (mod_chromeAltHack) {
            mod_chromeAltHack.applyHackForSpecifiedShortcuts(shortcuts);
        }
    }

    function reset() {
        protectedWebpageShortcuts = null;
        Mousetrap.reset();
    }

    // Returns true if the [space] key was pressed down with the focus being on an element on which
    // the [space] key can be ignored (refer: canIgnoreSpaceOnElement()), and the [space] key hasn't
    // been released since.
    function canUseSpaceAsModfier() {
        return _canUseSpaceAsModifier;
    }

    // On each space *keyup* event, the value returned by this can be probed to check whether
    // space was used as a modifier or as a regular key. More specifically, this returns true if
    // some other key was pressed while space was pressed down, false otherwise.
    // <technical-detail>
    // Also, for true to be returned, space keydown must have happened on an element where it can be
    // "ignored"; refer: canIgnoreSpaceOnElement()
    // </technical-detail>
    function wasSpaceUsedAsModifier() {
        return _wasSpaceUsedAsModifier;
    }

    function handlerToEnableSpaceAsModifier(e) {
        var keyCode = e.which || e.keyCode;
        // 32 - space
        if (keyCode === 32) {
            if (e.type === 'keydown') {
                _wasSpaceUsedAsModifier = false; // reset the value on space keydown
                isSpaceDown = true;
                if (canIgnoreSpaceOnElement(e.target)) {
                    _canUseSpaceAsModifier = true;
                    mod_contentHelper.suppressEvent(e);
                    thisModule.trigger('space-down-ignored');
                }
            }
            else { // 'keyup'
                _canUseSpaceAsModifier = false;
                isSpaceDown = false;
            }
        }
        // any other key than space
        else {
            if (e.type === 'keydown' && _canUseSpaceAsModifier) {
                _wasSpaceUsedAsModifier = true;
                thisModule.trigger('space-used-as-modifier');
            }
        }
    }

    // Checks if space can be "ignored" on an element (if so, we can suppress the space key event
    // and use space as a modifier on such elements)
    function canIgnoreSpaceOnElement(elem) {
        var $elem = $(elem);

        return !( elem.tagName.toLowerCase() === "input" ||
            !mod_contentHelper.elemAllowsSingleKeyShortcut(elem) ||
            $elem.is('[role=button]') ||
            // checks if the element or any of its ancestors is an HTML5 video element
            // (On youtube pages with HTML5 video, the classes "html5-video-player", and
            // "html5-video-container" exist on the immediate ancestors of the <video>
            // element. If the video is clicked, it the '.html5-video-player' element that
            // seems to have focus rather than the actual <video> element, so we check for
            // these classes as well)
            $elem.closest('video, .html5-video-player, .html5-video-container').length );
    }

    /**
     * Determines whether the invoked key/key combination (`shortcut`) should be handled as a shortcut
     * @param {string} shortcut String representation of keyboard shortcut invoked
     * @param targetElement
     * @param {Object|Function}[context] An object specifying the "context" for this shortcut to be applicable (refer:
     * isContextValid()). A function can also be specified -- the shortcut will be handled if the function
     * evaluates to true when the shortcut is invoked. If no `context` is specified, the shortcut is deemed valid in
     * any context.
     * @param {boolean} [dependsOnlyOnContext] If this is true, the function `canTreatAsShortcut` is not used to
     * determine whether or the shortcut should be invoked; only the supplied `context` is used to determine that.

     */
    function shouldHandleShortcut(shortcut, targetElement, context, dependsOnlyOnContext) {

        // don't treat the current key as shortcut if
        // 1) hints are enabled
        // 2) space is pressed down
        if (mod_globals.hintsEnabled || isSpaceDown) {
            return false;
        }

        // check `canTreatAsShortcut()` only if `dependsOnlyOnContext` is false/unspecified
        if (!dependsOnlyOnContext && !canTreatAsShortcut(shortcut, targetElement)) {
            return false;
        }
        if (protectedWebpageShortcuts && protectedWebpageShortcuts.length &&
            protectedWebpageShortcuts.indexOf(shortcut) >= 0 && isContextValid({pageUIHasFocus: true})) {
            return false;
        }
        if (typeof context === "object") {
            return isContextValid(context);
        }
        else if(typeof context === "function") {
            return context();
        }
        return true;
    }

    /**
     * Returns true if the invoked key/key-combination (`shortcut`), may be treated as a shortcut when the
     * specified element (`targetElement`) has focus. Cases which are exceptions (and return false) are:
     *  - `single key` (i.e. without modifier) on text/content-editable elements
     *  - <Shift> + <key> on text/content editable elements
     *  - [Enter] or [space] on *all* types of <input> elements + <select> element
     *
     *  Note: Compared to Mousetrap's default implementation of `stopCallback`, this function allows a much larger
     *  set of shortcuts to be usable (blocking specifically only the cases listed above), without causing any problems
     *  (that we know of yet)
     * @param shortcut
     * @param targetElement
     */
    function canTreatAsShortcut(shortcut, targetElement) {

        shortcut = shortcut.replace('control', 'ctrl').replace('option', 'alt');

        var shortcutKeys = shortcut.trim().split(/\s*\+\s*/);

        // Irrespective of the target element, we can return true,
        // if: at least one of 'ctrl', 'command' or 'meta' is part of the shortcut,
        // else if: both 'shift' and 'alt' are part of it (either 'shift' or 'alt',
        // by itself isn't enough, since they are used for typing uppercase and
        // accented letters as well)
        if (shortcutKeys.indexOf('ctrl') > -1 ||
            shortcutKeys.indexOf('meta') > -1 ||
            shortcutKeys.indexOf('command') > -1 ||
            (shortcutKeys.indexOf('shift') > -1 && shortcutKeys.indexOf('alt') > -1)) {

            return true;
        }

        // If shortcut is the single key [enter] or [space] and element is *any* input type or the select type,
        // don't treat is as a shortcut
        if (shortcut === 'return' || shortcut === 'enter' || shortcut === 'space') {
            var tagName_lowerCase = targetElement.tagName.toLowerCase();
            if (tagName_lowerCase === 'input' || tagName_lowerCase === 'select') {
                return false;
            }
        }

        return mod_contentHelper.elemAllowsSingleKeyShortcut(targetElement);
    }

    // Override this with a no-op; we use custom logic which allows more shortcuts to be used than Mousetrap.stopCallback's
    // default implementation + shortcuts be run depending on "context". (See `shouldHandleShortcut()`)
    Mousetrap.stopCallback = function(e, element, shortcut) {
        return false;
    };

    // Method inside `supportedContexts` have names corresponding to supported context properties
    // supported by isContextValid()
    var supportedContexts = {
        CUSelected: function() {
            return mod_globals.isCUSelected;
        },
        pageUIHasFocus: function () {
            return !mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        unitsProjUIHasFocus: function () {
            return mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        pageHasUrlData: function() {
            return mod_globals.pageHasUrlData;
        },
        pageHasCUsSpecifier: function() {
            return mod_globals.pageHasCUsSpecifier;
        },
        pageHasCUs: function() {
            return (mod_globals.numCUs_filtered > 0);
        },
    };

    /**
     * Returns true if all the conditions (specified as key/value pairs in the supplied `context` object)
     * are valid. Else false.
     * The list of context conditions is specified in `supportedContexts`
     * Examples of `context` object:
     * {CUSelected: true}, {CUSelected: false, pageUIHasFocus: true}, {unitsProjUIHasFocus: true}, etc
     * (Properties not specified in the `context` object are simply ignored)
     * @param context
     * @returns {boolean}
     */
    function isContextValid(context) {

        for (var prop in context) {
            if (context.hasOwnProperty(prop)) {
                if (context[prop] !== supportedContexts[prop]()) {
                    return false;
                }
            }
        }
        return true;
    }

    return thisModule;

})(Mousetrap, _u.mod_contentHelper, _u.mod_globals, _u.mod_domEvents, _u.mod_chromeAltHack);

;/**
 * This module implements the basic utility features this extension provides by to a page, like scrolling, 
 * going back/forward, etc
 */
_u.mod_basicPageUtils = (function($, mod_domEvents, mod_keyboardLib, mod_smoothScroll, mod_mutationObserver,
                                  mod_contentHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup,
        reset: reset,
        scroll: scroll,

        back: back,
        forward: forward,

        focusFirstTextInput: focusFirstTextInput,
        focusNextTextInput: focusNextTextInput,
        focusPrevTextInput: focusPrevTextInput,

        openLink: openLink,
        styleActiveElement: styleActiveElement,
        removeActiveElementStyle: removeActiveElementStyle
    });

    /*-- Module implementation --*/
    var miscSettings,
        lastInteractedElement, // the last element which received user interaction (click, mouse over, focus etc)
        $document = $(document),
        isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        overlap_pgUpPgDn = 100,
        smoothScroll = mod_smoothScroll.smoothScroll,

        // classes used when styling focused element
        class_focusedImage = "UnitsProj-focused-image",
        class_focusedLinkOrButton = "UnitsProj-focused-link-or-button",
        class_focusedLargeImage= "UnitsProj-focused-large-image";

    function reset() {
        removeActiveElementStyle();
    }

    function setup(settings) {
        reset();
        // NOTE: The 'click' event is triggered in response to invoking 'enter' or 'space' on an
        // "activate-able" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'focus', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'mouseover', setLastInteractedElement, true);

        miscSettings = settings.miscSettings;
        if (miscSettings.enhanceActiveElementVisibility) {
            mod_domEvents.addEventListener(document, 'focus', onFocus, true);
            mod_domEvents.addEventListener(document, 'blur', onBlur, true);
        }

        setupShortcuts(settings.pageNavigationShortcuts, settings.elementNavigationShortcuts, settings.CUsShortcuts);
    }

    function onBlur(e) {
        removeActiveElementStyle(e.target);
    }

    function onFocus() {
        setTimeout(styleActiveElement, 0); //yield first. we want to execute this method once the browser has
        // applied its default style for the focused element
    }
    
    function setupShortcuts(pageNavigationShortcuts, elementNavigationShortcuts, CUsShortcuts) {

        mod_keyboardLib.bind(pageNavigationShortcuts.topOfPage.kbdShortcuts,  function() {
            scroll("top");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.bottomOfPage.kbdShortcuts,  function() {
            scroll("bottom");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.pageUp.kbdShortcuts,  function() {
            scroll("pageUp");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.pageDown.kbdShortcuts,  function() {
            scroll("pageDown");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.back.kbdShortcuts, back);
        mod_keyboardLib.bind(pageNavigationShortcuts.forward.kbdShortcuts, forward);
        mod_keyboardLib.bind(elementNavigationShortcuts.open.kbdShortcuts, function() {
            openLink(document.activeElement);
        });
        mod_keyboardLib.bind(elementNavigationShortcuts.openInNewTab.kbdShortcuts, function() {
            openLink(document.activeElement, true); // open in new tab
        });
        mod_keyboardLib.bind(elementNavigationShortcuts.focusFirstTextInput.kbdShortcuts, focusFirstTextInput);
        mod_keyboardLib.bind(elementNavigationShortcuts.focusNextTextInput.kbdShortcuts, focusNextTextInput);
        mod_keyboardLib.bind(elementNavigationShortcuts.focusPrevTextInput.kbdShortcuts, focusPrevTextInput);

        var scrollDown = function() {
            scroll("down");
        };
        var scrollUp = function() {
            scroll("up");
        };
        var scrollRight = function() {
            scroll("right");
        };
        var scrollLeft = function() {
            scroll("left");
        };
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollDown.kbdShortcuts, scrollDown);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollUp.kbdShortcuts, scrollUp);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollRight.kbdShortcuts, scrollRight);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollLeft.kbdShortcuts, scrollLeft);
        // special shortcuts, these will get invoked only when the page has no CUs
        mod_keyboardLib.bind(CUsShortcuts.smartScrollDown.kbdShortcuts, scrollDown, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollUp.kbdShortcuts, scrollUp, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollRight.kbdShortcuts, scrollRight, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollLeft.kbdShortcuts, scrollLeft, {pageHasCUs: false});
    }

    // invokes the browser's 'back' action
    function back() {
        window.history.back();
    }
    // invokes the browser's 'forward' action
    function forward() {
        window.history.forward();
    }

    /**
     * Scroll the page as specified by `scrollType`
     * The function will actually scroll the innermost sensible element that can be scrolled further in the
     * appropriate direction. Very often that will end up being the document/window, but doesn't have to be.
     * E.g: If there is an child element that has focus and can be scrolled up, the first invocation of scroll("top")
     * will act on it, and the next one will act on a suitable ancestor (since the child can no longer be scrolled up)
     * @param {string} scrollType One of "up", "down", "left", "right", "pageUp", "pageDown", "top", "bottom"
     */
    function scroll(scrollType) {
        // call endAtDestination() first, so that the calculations below can be made relative to the
        // scrollTop position reached *after* any previous scrolling animation is completed. (this
        // helps keep the scrolling smooth by preventing "first-down-then-up" type movements)
        if (mod_smoothScroll.isInProgress()) {
            mod_smoothScroll.endAtDestination();
        }
        var elem,
            val,
            duration = 200; // millisecs
        switch(scrollType) {

            // NOTES:
            // 1) We pass `true` to some of the smoothScroll() calls below to indicate relative scroll
            // 2) If the element-to-scroll is `window`, we can still pass 'scrollTop'/'scrollLeft' (instead
            // of 'pageYOffset'/'pageXOffset') since smoothScroll() handles the scenario.

            case "down":
                smoothScroll(getElemToScroll('down'), 'scrollTop', miscSettings.pageScrollDelta, duration, null, true);
                break;
            case "up":
                smoothScroll(getElemToScroll('up'), 'scrollTop',  -miscSettings.pageScrollDelta, duration, null, true);
                break;
            case "right":
                smoothScroll(getElemToScroll('right'), 'scrollLeft',  miscSettings.pageScrollDelta, duration, null, true);
                break;
            case "left":
                smoothScroll(getElemToScroll('left'), 'scrollLeft', -miscSettings.pageScrollDelta, duration, null, true);
                break;
            case "pageDown":
                elem = getElemToScroll('down');
                val = elem === window?
                    window.innerHeight - overlap_pgUpPgDn:
                    Math.min(elem.clientHeight, window.innerHeight) - overlap_pgUpPgDn;
                smoothScroll(elem, 'scrollTop', val, duration, null, true);
                break;
            case "pageUp":
                elem = getElemToScroll('up');
                val = elem === window?
                    -(window.innerHeight - overlap_pgUpPgDn):
                    -(Math.min(elem.clientHeight, window.innerHeight) - overlap_pgUpPgDn);
                smoothScroll(elem, 'scrollTop', val, duration, null, true);
                break;
            case "top":
                smoothScroll(getElemToScroll('up'), 'scrollTop',  0, duration);
                break;
            case "bottom":
                elem = getElemToScroll('down');
                if (elem === window) {
                    var body = document.body,
                        $body = $(body);
                    val = Math.max(body.clientHeight, body.offsetHeight, body.scrollHeight, $body.innerHeight());
                }
                else {
                    val = elem.scrollHeight;
                }
                smoothScroll(elem, 'scrollTop',  val, duration);
                break;
        }
    }
    /**
     * Gets the most sensible element to scroll based on `direction` [by finding the innermost
     * element that can be scrolled in the direction specified. Consequently, it results in the
     * element getting scrolled 1px in the specified direction (unless the "element" was found
     * to be `window` itself). If this is undesired, this 1px scroll can be undone in the future.]
     * NOTE: We return `window` instead of body/documentElement/document because window seems to work
     * more reliably cross-browser for scrolling the "page" as a whole. (Refer to mod_smoothScroll.js
     * for more on that)
     */
    function getElemToScroll(direction) {
        var elem = lastInteractedElement || document.activeElement,
            oldVal, newVal;

        // the last 2 checks in the condition below are mostly redundant, but they present just in case
        // some in browser `document.activeElement` returns `documentElement` or `document` itself (when
        // no element on page has focus)
        while (elem && elem !== document.body &&
            elem !== document.documentElement && elem !== document) {

            switch (direction){
                case 'down':
                    oldVal = elem.scrollTop;
                    elem.scrollTop += 1;
                    newVal = elem.scrollTop;
                    break;

                case 'up':
                    oldVal = elem.scrollTop;
                    elem.scrollTop -= 1;
                    newVal = elem.scrollTop;
                    break;

                case 'right':
                    oldVal = elem.scrollLeft;
                    elem.scrollLeft += 1;
                    newVal= elem.scrollLeft;
                    break;

                case 'left':
                    oldVal = elem.scrollLeft;
                    elem.scrollLeft -= 1;
                    newVal= elem.scrollLeft;
                    break;
            }

            if (oldVal !== newVal) { // if scrolled
                return elem;
            }
            else {
                elem = elem.parentElement;
            }
        }
        return window;
    }

    function setLastInteractedElement(event) {
        lastInteractedElement = event.target;
    }

    // gets visible text-input elements on the page (*excluding* ones
    // added by UnitsProj)
    function $getVisibleTextInputElements() {
        var $textInput = $document.find('input[type=text], input:not([type]), textarea, [contenteditable=true]').
            filter(function() {
                var $this = $(this);
                if ( ($this.is(':visible') || $this.css('visiblity') === 'visible') &&
                    !mod_contentHelper.isUnitsProjNode(this) ) {

                    return true;
                }
            });
        return $textInput;
    }

    function focusFirstTextInput() {
        var $textInput = $getVisibleTextInputElements();
        $textInput.length && $textInput[0].focus();
    }
    function focusNextTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex++;
                if (targetIndex >= $textInput.length) {
                    targetIndex = 0;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }
    function focusPrevTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex--;
                if (targetIndex < 0) {
                    targetIndex = $textInput.length - 1;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }


    /**
     * Invokes a click (or ctrl/cmd+click) on the specified element.
     * @param {HtmlElement} element The DOM element on which a click (or ctrl/cmd+click) will be invoked. This is
     * generally a link, but can be any element, like a button etc
     * @param {boolean} newTab Specifying this as true invokes "ctrl+click" ("cmd+click" on Mac),
     * which has the effect of opening the link in a new tab (if the active element is a link)
 */
    function openLink(element, newTab) {
        if (newTab) {
            var ctrlClickEvent = document.createEvent("MouseEvents");

            // detecting OS based on:
            // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
            if (isMac) {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, false, false, false, true, 0, null); // cmd key set to true for mac
            }
            else {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, true, false, false, false, 0, null); // ctrl key set to true for non-macs
            }

            element.dispatchEvent(ctrlClickEvent);
        }
        else {
            element.click();
        }
    }

    // see _styleActiveElement
    function styleActiveElement(el) {
        var disabledHere = mod_mutationObserver.disable();
        _styleActiveElement(el);
        disabledHere && mod_mutationObserver.enable();
    }

    /**
     This function is used apply our custom "active element" style of an element. If it is being used to style
     * the active, no argument needs to be passed. But in other cases (like when called from the mod_selectLink.js),
     * specify the element you want to apply the styling to.
     * @param [el]
     */
    function _styleActiveElement(el) {
        el = el || document.activeElement;
        var $el = $(el);

        // Don't apply any Units-specific focus styles to element if it has tabindex = -1 and its outline-width is set to 0.
        // Examples of such elements: Gmail email container, and Twitter tweet container. They get focus by clicking on them,
        // and the Units outline style is rather distracting in these cases.
        if (el.tabIndex === -1 && parseInt($el.css("outline-width"), 10) === 0) {
            return;
        }

        // If it contains an image, show image-specific outline
        // TODO: Can put a better check to ensure that the element contains only ONE leaf child image/embed etc and no other
        // elements.
        var $img = $el.find('img');
        if ($el.is("a") && $img.length === 1) {
            $el.addClass(class_focusedImage);

            // for larger images, apply a thicker border with an offset.
            if ($img.height() > 50 || $img.width() > 50) {
                $el.addClass(class_focusedLargeImage);
            }
        }
        // Else if focused element is link or button
        else if ($el.is("a, button, input[type=button], [role=button]")) {
            $el
                .addClass(class_focusedLinkOrButton);
        }
        // for any other types of elements, no styles added.

        return;
    }

    function removeActiveElementStyle(element) {
        // *Note* The calls below for the disabling and enabling of the mutation
        // observer have been commented out as a fix for #151!
//        var disabledHere = mod_mutationObserver.disable();
        var el = element || document.activeElement;
        $(el)
            .removeClass(class_focusedImage)
            .removeClass(class_focusedLinkOrButton)
            .removeClass(class_focusedLargeImage);
//        disabledHere && mod_mutationObserver.enable();
    }

    return thisModule;
})(jQuery, _u.mod_domEvents,  _u.mod_keyboardLib, _u.mod_smoothScroll, _u.mod_mutationObserver,
        _u.mod_contentHelper);
;_u.mod_filterCUs = (function($, mod_mutationObserver, mod_contentHelper, mod_domEvents, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        isActive: isActive,
        applyFiltering: applyFiltering,
    });

    // *Events Raised*
    // "filter-text-change", "tab-on-filter-UI"

    var $UIContainer,
        $searchBox,
        class_unitsProjElem = CONSTS.class_unitsProjElem,
        timeout_typing,
        suppressEvent = mod_contentHelper.suppressEvent,
        $document = $(document),
        lastFilterText_lowerCase;
    
    // reset state
    function reset() {
        // the following two lines are conditional because otherwise they won't be valid till setup() is called once
        $searchBox && closeUI(); // to deactivate filtering if it was active
        $UIContainer && $UIContainer.remove();
        timeout_typing = null;
        lastFilterText_lowerCase = "";
    }

    function setup(settings) {
        if (! (settings.expandedUrlData && settings.expandedUrlData.CUs_specifier)) {
            return;     // this module is not setup if there is no CUs_specifier in the urlData
        }
        
        reset();
        $searchBox = $('<input id = "UnitsProj-filterUI-searchBox" type = "text">')
            .addClass("UnitsProj-reset-text-input")
            .addClass(class_unitsProjElem)
            .attr('tabindex', -1);

        var $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
            .addClass("UnitsProj-close-button")
            .addClass(class_unitsProjElem);

        var $message = $("<span id=filter-message>Press 'tab' to go to filtered units</span>");

        $UIContainer = $('<div id = "UnitsProj-filterUI-container">')
            .addClass(class_unitsProjElem)
            .append($searchBox)
            .append($closeButton)
            .append($message)
            .hide()     // to prevent the filtering UI from appearing when the page loads
            .appendTo(_u.$topLevelContainer);

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $searchBox[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown, true);

        $searchBox.on('input', onInput);
        $closeButton.on('click', closeUI);
        mod_keyboardLib.bind(settings.CUsShortcuts.filterCUs.kbdShortcuts, showUI, {pageHasCUsSpecifier: true});
    }

    function isActive() {
        return $UIContainer && $UIContainer.is(':visible') && getFilterText_lowerCase();
    }

    /**
     * Applies filtering to the CUs within the the passed array. Specifically, it applies the class
     * 'UnitsProj-HiddenByFiltering'  to CUs which do no match the text in the filtering search box.
     * Returns an array containing only the filtered CUs.
     * @param CUs_all
     * @param userInvoked Pass true to indicate that the user invoked the filtering (as opposed to dom-change etc).
     *
     * @returns {Array} Array of filtered CUs. If filtering was required, this this is a new array, which has a
     * subset of elements of `CUs_all`. Else, if no filtering if required (`CUs_all` is empty or the filtering text
     * is an empty string), it returns the same array `CUs_all`. (As per the assumption in mod_CUsMgr that when
     * no filtering is active it's variables `CUs_main` and `_CUs_all` point to the same array)
     */
    function applyFiltering(CUs_all, userInvoked) {
        var filterText_lowerCase = getFilterText_lowerCase();

        // if no filtering required
        if (!CUs_all.length || !filterText_lowerCase) {
            undoPrevFiltering();
            return CUs_all;
        }

        // ** --------- PRE FILTERING --------- **

        var disabledByMe = mod_mutationObserver.disable();
        var savedScrollPos;
        if (!userInvoked) {
            // save this because the call to .hide() below will change the scrollTop value, in mose cases making it zero
            savedScrollPos = window.pageYOffset;
        }
        else {
            savedScrollPos = 0;
        }
        $document.hide();


        // ** --------- FILTERING --------- **

        var CUs_filtered = [];
        var reuseLastFiltering = filterText_lowerCase.indexOf(lastFilterText_lowerCase) !== -1;
        lastFilterText_lowerCase = filterText_lowerCase;

        if (!reuseLastFiltering) {
            // undo all effects of the previous filtering
            undoPrevFiltering();
        }
        else {
            // remove highlighting (but don't undo other actions of previous filtering)
            removePrevHighlighting(); //TODO: this is need at the moment. can we avoid this?
        }

//      console.log('actual filtering taking place...');
        var CUsArrLen = CUs_all.length;
        for (var i = 0; i < CUsArrLen; ++i) {
            var $CU = CUs_all[i];
            if (reuseLastFiltering && $CU.hasClass('UnitsProj-HiddenByFiltering')) {
                continue;
            }
            if (highlightInCU($CU, filterText_lowerCase)) {
                $CU.removeClass('UnitsProj-HiddenByFiltering');
                CUs_filtered.push($CU);
            }
            else {
                $CU.addClass('UnitsProj-HiddenByFiltering');
            }
        }

        // ** --------- POST FILTERING --------- **
        $document.show();
        window.pageYOffset = savedScrollPos;
        disabledByMe && mod_mutationObserver.enable();

        return CUs_filtered;
    }

    function undoPrevFiltering() {
        removePrevHighlighting();
        $document.find('.UnitsProj-HiddenByFiltering').removeClass('UnitsProj-HiddenByFiltering');
    }

    // based on http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
    /* Main changes:
     1) Use of JS keyword 'with' (deprecated) was removed, and modifications made in accordance
     2) toLowercase() being instead of toUppercase, and also being calculated only once at the beginning.
     3) converted from jQuery plugin to a regular function; main since we want num of highlights made to be
     returned
     4) <removed> Only searches within visible elements. Since numHighlights is required by the calling function to
     detect if a CU should be counted as a match or not. Also helps with efficiency.
     5) Other minor optimizations
     6) Added comments
     */
    function highlightInCU($CU, pattern) {

        var numHighlighted = 0, // count of how many items were highlighted
            patternLowerCase = pattern && pattern.toLowerCase();

        /*
         Called recursively. Each time this function is called on a text node, it highlights the first instance of
         'pattern' found. Upon finding 'pattern', it returns after creating 3 nodes in place of the original text node --
         a span node for the highlighted pattern and two text nodes surrounding it.
         Returns true or false to indicate if highlight took place
         */
        var innerHighlight = function (node) {

            var highlighted = false;

            if (node.nodeType == 3) { // nodeType 3 - text node

                var pos = node.data.toLowerCase().indexOf(patternLowerCase);
                if (pos >= 0) {
                    var spannode = document.createElement('span');
                    spannode.className = 'UnitsProj-highlight';
                    var middlebit = node.splitText(pos);
                    // this line is required, even though the variable assigned to is unused
                    /*var endbit =*/ middlebit.splitText(patternLowerCase.length);
                    var middleclone = middlebit.cloneNode(true);
                    spannode.appendChild(middleclone);
                    middlebit.parentNode.replaceChild(spannode, middlebit);
                    highlighted = true;
                    ++numHighlighted;
                }
            }
            // nodeType 1 - element node
            else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {

                // var $node = $(node); // node is an element
                // if (!$node.is(':visible') || $node.css('visibility') === 'hidden') {
                //     return;
                // }

                for (var i = 0; i < node.childNodes.length; ++i) {
                    if (innerHighlight(node.childNodes[i])) {
                        ++i; // to move past the new span node created
                    }
                }
            }
            return highlighted;
        };

        if ($CU.length && patternLowerCase && patternLowerCase.length) {
            $CU.each(function() {
                innerHighlight(this);
            });
        }

        return numHighlighted;
    }

    function removePrevHighlighting () {
            var $set = $document.find(".UnitsProj-highlight");
            var len = $set.length;
            for (var i = 0; i < len; i++) {
                var el = $set[i];
                var parentNode = el.parentNode;

                parentNode.replaceChild(el.firstChild, el);
                parentNode.normalize();

            }
    }

    function onKeydown(e) {
        var code = e.which;
        if (code === 27) { // Esc
            closeUI();
        }
        else if (e.target === $searchBox[0] && !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)) {
            if (code === 13) { // Enter
                suppressEvent(e);
                triggerFilteringIfRequired();
            }
            else if (code === 9) { // Tab
                suppressEvent(e);
                triggerFilteringIfRequired();
                thisModule.trigger('tab-on-filter-UI');
            }
        }
    }

    function onInput() {
        // to allow search-as-you-type, while not executing the filtering related code till there is a brief pause in the typing
        clearTimeout(timeout_typing); // clears timeout if it is set
        timeout_typing = setTimeout (triggerFilteringIfRequired, 400);
    }

    function triggerFilteringIfRequired() {
        clearTimeout(timeout_typing); // clears timeout if it is set
        if (lastFilterText_lowerCase !== getFilterText_lowerCase()) {
            thisModule.trigger('filter-text-change');
        }
    }

    function getFilterText_lowerCase() {
        return $searchBox.val().toLowerCase();
    }

    function showUI() {
        var disabledByMe = mod_mutationObserver.disable();
        if(!$UIContainer.is(':visible')) {
            $searchBox.val('');
            $UIContainer.show();
            $searchBox.focus();
        }
        else {
            $searchBox.focus();
        }
        disabledByMe && mod_mutationObserver.enable();
    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_typing); // clears timeout if it is set
        $searchBox.val('').blur();
        $UIContainer.hide();
        undoPrevFiltering();
        lastFilterText_lowerCase = ""; // reset
        thisModule.trigger('filter-UI-close');
        disabledByMe && mod_mutationObserver.enable();
    }

    return thisModule;

})(jQuery, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_domEvents, _u.mod_keyboardLib, _u.CONSTS);
;// See _readme_module_template.js for module conventions


_u.mod_CUsMgr = (function($, mod_basicPageUtils, mod_domEvents, mod_keyboardLib, mod_mutationObserver, mod_filterCUs,
                          mod_help, mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_globals,
                          mod_directionalNav, mod_smoothScroll, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        $getSelectedCU: $getSelectedCU,
        updateCUsAndRelatedState: updateCUsAndRelatedState,
        getAllCUs: getAllCUs,
        updateCUOverlays: updateCUOverlays,
        selectNextCUOrScroll: selectNextCUOrScroll
    });

    /*-- Module implementation --*/

    /* NOTES
     1) Often the most important content of a webpage (i.e the actual *content* excluding the header, footer, side bars,
     adverts) is composed of a set of repeating units. We call such a unit a Content Unit (CU). E.g. on the Google Search
     results page, each search result is a CU. Each CU is a logical unit of content, attention and navigation/access.

     Often a CU corresponds to single DOM element, like a <div> (and its contents). But this isn't always the case, and
     a CU might consist of multiple top level DOM elements (e.g: pages on Hacker News, Urban Dictionary, etc). To cater
     to the most general case, this program represents a CU as a jQuery set consisting of one or more DOM elements.

     2) DOM elements that can receive focus are called the "focusables"

     3) In the comments, including JSDoc ones, the term "JQuery *set*" is used to mean a JQuery object that can contain
     *one or more* DOM elements; the term "JQuery *wrapper*" is used to denote one which is expected be a JQuery wrapper
     on a *single* DOM node.

     */

    var
        CUs_filtered = [], /* An array of jQuery sets. The array represents the *sequence* of CUs on the current page.
         Each constituent element (which is a jQuery set) represents the set of DOM elements that constitute a single
         CU for the current page.
         Most web pages will allow writing simple selectors such that each CU can be represented as a jQuery set
         consisting of a single DOM element.(Because these web pages group related logical entities in a single container,
         for which the selector can be specified.)
         However, some web pages (like news.ycombinator.com, wikipedia.org, etc) require writing selectors such each CU
         has to be represented as a jQuery set comprising of multiple DOM elements.
         (For more details, see the documentation on how to specify selectors for webpages.)

         Note: If the search feature has been invoked, this contains only the filtered CUs that are visible on the page.
         This helps keep things simple.
        */

        // the set of *all* CUs. NOTE: In most (but not all) cases, you would want to use `CUs_filtered` instead, so
        // please be careful.
        CUs_all = [],

        //container for elements created by this program that we add to the page's DOM.
        $topLevelContainer = _u.$topLevelContainer,

        class_unitsProjElem = CONSTS.class_unitsProjElem,  //class applied to all elements created by UnitsProj
        class_CUOverlay = CONSTS.class_CUOverlay,                    // class applied to CU overlays
        class_CUSelectedOverlay = CONSTS.class_CUSelectedOverlay,    // class applied to overlay on a selected CU
        class_CUHoveredOverlay = CONSTS.class_CUHoveredOverlay,      // class applied to overlay on a hovered-over CU
        // class applied to each of the 4 overlays covering the non-selected-CU part of the page
        class_nonCUPageOverlay = CONSTS.class_nonCUPageOverlay,

        selectedCUIndex  = -1, // Index of the selected CU in CUs_filtered
        hoveredCUIndex  = -1, // Index of the hovered CU in CUs_filtered

        // overlay for the selected CU
        $selectedCUOverlay,

        // overlay for the hovered-over CU.
        // **Note on the hovered-over CU overlay**:
        // This overlay is nice to have to help users select a CU using the mouse. However,
        // having this overlay visible at the same time as the selected CU overlay (even
        // though this one looks different) can be slightly confusing or distracting.
        // For this reason, we make this overlay disappear (i.e. call dehoverCU()) each time
        // a CU is selected. But, the overlay is shown again whenever the user moves the
        // mouse, which is exactly the point of it.
        $hoveredCUOverlay,

        // holds 4 overlays used to cover the non-selected-CU part of the page.
        // convention: these overlays exist in order as [top, bottom, left, right]
        nonCUPageOverlays = [],

        // default opacity for non-CU-page overlays, default should be a low'ish value
        defaultOpacity_nonCUPageOverlays = 0.05,
    // TODO: move the default opacity to settings (also should we allow different values for each "url pattern"?) +
    // maybe sites with larger CUs can have a higher value compared to sites with small CUs like HN, google search results etc.
        userSetOpacity_nonCUPageOverlays = defaultOpacity_nonCUPageOverlays,
        currentOpacity_nonCUPageOverlays,

        body,               // will hold reference to document.body (once that is available within setup())

        // cached jQuery objects
        $body, // will refer to $(body)
        $document = $(document),
        $window = $(window),

        rtMouseBtnDown,         // boolean holding the state of the right mouse button
//        ltMouseBtnDown,         // boolean holding the state of the left mouse button
        scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

        $lastSelectedCU = null,   // to store a reference to the last selected CU

        interval_updateCUsTillDomReady,
        CUsBeenFoundOnce,

//        $commonCUsAncestor, // closest common ancestor of the CUs

        lit_updateCUsEtc, // last invoked time ("lit") of updateCUsEtc_onMuts()
        timeout_updateCUs,
        
        // to enable "grouped" handing of mutations deemed non-essential (in heavy sites, a lot of dom mutations
        // are generated; handling all of them instantly slows down performance on heavy sites like facebook, esp.
        // when invoking filtering which often leads to the page fetching new content from the server continuously)  
        maxDelay_nonImportantMuts = 333,

        // This is checked for height changes on DOM mutations since that's a good indication that the CUs on the page 
        // have changed. We take this to be the element with the highest scrollHeight. Usually this is the body.
        mainContainer,
        mainContainer_prevScrollHeight,
        mainContainer_prevScrollWidth,

        // the following are set during setup(); most are sub-objects of expandedUrlData but we store global references
        // to avoid having to read them each time there a DOM change and things need to be redrawn etc.
        // NOTE: Make sure to reset these during reset()
        miscSettings,
        expandedUrlData,
        CUsSpecifier,
        CUsSelector,    // holds a value if CUs are specified directly using a selector
        mainElementSelector, // selector for main element of a CU, if specified
        headerSelector,
        CUStyleData,
        CUsShortcuts,

        lit_selectCU,    // last invoked time ("lit") for _selectCU()
        minInterval_selectCU = 70,

        timeout_onMouseMovePause,
        timeout_highlightCU,
        timeout_viewportChange,

        /* these are updated when the mouse moves */
        elemUnderMouse,
        mouseX, mouseY,             // relative to the *page*
        mouseScreenX, mouseScreenY, // relative to the *screen*

        // holds the bounding rect calculated for the last selected CU using getBoundingRect()
        // (does not include padding etc applied to the actual overlay drawn on the CU)
        lastSelectedCUBoundingRect;

    function reset() {
        // this condition ensures execution of the contained code doesn't happen the first time
        // reset() is called, at which point the various overlays won't exist
        if ($selectedCUOverlay) {
            $selectedCUOverlay.remove();
            $hoveredCUOverlay.remove();

            deselectCU();
            dehoverCU();

            for (var i = 0; i < nonCUPageOverlays.length; i++)
                nonCUPageOverlays[i].remove();

            nonCUPageOverlays = [];
        }

        // reset these references that are initialized during setup()
        miscSettings = expandedUrlData = CUsSpecifier = CUsSelector = mainElementSelector = headerSelector =
            CUStyleData = CUsShortcuts = null;

        CUs_filtered = CUs_all = [];   // these can point to the same array at this point
        mod_globals.isCUSelected = false;
        mod_globals.numCUs_all = mod_globals.numCUs_filtered = 0;

        lit_updateCUsEtc = lit_selectCU = 0;
        timeout_updateCUs = false;
        CUsBeenFoundOnce = false;
        lastSelectedCUBoundingRect = null;
        thisModule.stopListening();
        clearInterval(interval_updateCUsTillDomReady);
        resetScrollEventHandler();
    }

    function setup(settings) {
        if (! (settings.expandedUrlData && settings.expandedUrlData.CUs_specifier)) {
            return;     // this module is not setup if there is no CUs_specifier in the urlData
        }

        // wait for document.body to exist before proceeding further
        if (!document.body) {
            setTimeout(setup.bind(null, settings), 100);
            return;
        }

        reset();

        body = document.body;
        $body = $(body);
        mainContainer = document.body;  // assume this to be the body for

        var tmp;
        // assign from `settings` to global variables
        miscSettings = settings.miscSettings;
        expandedUrlData = settings.expandedUrlData;
        CUsSpecifier = expandedUrlData.CUs_specifier;
        CUsSelector = CUsSpecifier.selector;
        mainElementSelector = (tmp = expandedUrlData.CUs_SUs) && (tmp = tmp.std_mainEl) && tmp.selector;
        headerSelector = (tmp = expandedUrlData) && (tmp = tmp.page_SUs) && (tmp = tmp.std_header) && tmp.selector;
        CUStyleData = expandedUrlData.CUs_style;
        CUsShortcuts = settings.CUsShortcuts;

        $selectedCUOverlay = $createCUOverlay('selected');
        $hoveredCUOverlay = $createCUOverlay('hovered');

        for (var i = 0; i < 4; i++)
            nonCUPageOverlays[i] = $createCUOverlay('nonCUPageOverlay');

        setupEvents();
        
        if (mod_filterCUs) {
            thisModule.listenTo(mod_filterCUs, 'filter-text-change', onFilterTextChange);
            thisModule.listenTo(mod_filterCUs, 'tab-on-filter-UI', onTabOnFilterSearchBox);
            thisModule.listenTo(mod_filterCUs, 'filter-UI-close', onFilterUIClose);
        }
        
        // Before dom-ready there will be several dom-changes. If we updateCUs in response to
        // each of them, there is a flickering in the selected overlay. So we space calls to
        // update CUs initially, setting up handlers for dom mutations only once dom is ready.
        interval_updateCUsTillDomReady = setInterval(updateCUsAndRelatedState, 100);
        $(onDomReady);
    }

    function bindMutationEvents() {

        // NOTE: *Important* Keep in mind that the first mutation handler to execute that calls mod_mutationObserver.disable()
        // will prevent any queued mutation observer event in any other mutation observer from triggering.
        //TODO: check the order in which the various mutation events are
        // fired. Specifically, if the the 'fallback' event is fired
        // before or after the other events.

        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onMutations_fallback);
        
        // this event signifies mutations ONLY on the "top level" CU element(s). Since these aren't going
        // to occur too often, but might include the CU top level element being "hidden" etc, we handle 
        // them immediately.
        // Note: Since what we consider a CU (based on the selector etc), and what the actual "CU" for the 
        // page is might be slightly different (since one might be enclosed inside the other etc),
        // we can't rely too much on the distinction between 'selectedCUTopLevelMuts', 'selectedCUDescendantMuts' 
        // and 'CUsAncestorsMuts'. Hence as a fallback, they should all update the CUs state within a short period.
        // At the same time, we can treat slightly  differently with the hope that on most websites they
        // will indeed be distinct in the way we hope, thereby giving us a slight performance boost.
        thisModule.listenTo(mod_mutationObserver, 'selectedCUTopLevelMuts', onSelectedCUTopLevelMuts);
        thisModule.listenTo(mod_mutationObserver, 'CUsAncestorsMuts', handleBasedOnLastCUPosition);
        thisModule.listenTo(mod_mutationObserver, 'selectedCUDescendantsMuts', updateOverlays_and_delayedUpdateCUs);
    }

    function onDomReady() {
        clearInterval(interval_updateCUsTillDomReady);
        bindMutationEvents();
        updateCUsAndRelatedState();
        mainContainer  = getMainContainer();
    }

    // To be called during module initialization, to initialize global variables variables
    // that refer to the various overlays.
    // `type` should be one of  'selected', 'hovered', 'nonCUPageOverlay'
    function $createCUOverlay(type) {
        var $overlay = $('<div></div>').
            addClass(class_unitsProjElem).
            hide();

        if (type === 'selected' || type === 'hovered') {
            $overlay.addClass(class_CUOverlay).
                addClass(type === 'selected'? class_CUSelectedOverlay: class_CUHoveredOverlay);
        }
        else {
            $overlay.addClass(class_nonCUPageOverlay);
        }

        if (CUStyleData && CUStyleData.setOverlayZIndexHigh || type === 'nonCUPageOverlay') {
            // set it slightly less than than the highest z-index possible (2147483647),
            // so that it is less than the z-index of the help page etc
            $overlay.css('z-index', 2147483647-4);
        }
        return $overlay.appendTo($topLevelContainer);
    }

    function getMainContainer() {
        var _mainContainer;
        if (CUs_all.length) {
            var $CU = CUs_all[Math.floor(CUs_all.length/2)]; // use the middle CU
            var ancestors = $CU.parents().get(),
                max = -1,
                length = ancestors.length;

            for (var i = 0; i < length; i++) {
                var current = ancestors[i];
                if (current.scrollHeight > max) {
                    max = current.scrollHeight;
                    _mainContainer = current;
                }
            }
        }
        return _mainContainer || document.body;
    }

    function $getSelectedCU() {
        return CUs_filtered[selectedCUIndex];
    }

    function highlightSelectedCUBriefly_ifRequired() {
        if (CUStyleData && CUStyleData.highlightCUOnSelection) {
            highlightSelectedCUBriefly();
        }
    }

    function highlightSelectedCUBriefly() {
        clearTimeout(timeout_highlightCU);
        $selectedCUOverlay.addClass('highlighted-CU-overlay');
        timeout_highlightCU = setTimeout(function() {
            $selectedCUOverlay.removeClass('highlighted-CU-overlay');
        }, 500);
    }

    /**
     * Selects the CU specified.
     * @param {number|jQuery} CUOrItsIndex Specifies the CU. Should either be the JQuery object representing the CU
     * or its index in CUs_filtered
     * Can be an integer that specifies the index in CUs_filtered or a jQuery object representing the CU.
     * (While performance isn't a major concern here,) passing the index is preferable if it is already known,
     * otherwise the function will determine it itself (in order to set the selectedCUIndex variable).
     * @param {boolean} setFocus If true, the "main" element for this CU, if one is found, is
     * focused.
     * @param {boolean} [adjustScrolling] If true, document's scrolling is adjusted so that
     * all (or such much as is possible) of the selected CU is in the viewport. Defaults to false.
     * @param {string} [direction] The direction of movement specified by the user, if relevant.
     */
    function selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction) {
        var now = Date.now();
        if (now - lit_selectCU > minInterval_selectCU) {
            lit_selectCU = now;
            var disabledByMe = mod_mutationObserver.disable();
            _selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction);
            disabledByMe && mod_mutationObserver.enable();
        }
    }

    // only meant to be called from within selectCU()
    function _selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction) {
        var $CU,
            indexOf$CU; // index in CUs_filtered

        if (typeof CUOrItsIndex === "number") {
            indexOf$CU = CUOrItsIndex;
            $CU = CUs_filtered[indexOf$CU];
        }
        else {
            $CU = CUOrItsIndex;
            indexOf$CU = findCUInArray($CU, CUs_filtered);
        }

        deselectCU(); // before proceeding, deselect currently selected CU, if any
        dehoverCU(); // in keeping with the Note titled **Note on the hovered-over CU overlay**
        selectedCUIndex = indexOf$CU;
        mod_globals.isCUSelected = true;

        showSelectedOverlay($CU, true, true);
        highlightSelectedCUBriefly_ifRequired();

        mod_mutationObserver.enableFor_selectedCUAndDescendants($CU);

        $lastSelectedCU = $CU;

        if (adjustScrolling) {
            scrollCUIntoView($selectedCUOverlay, direction);
        }

        if (setFocus) {
            var savedScrollPos = window.pageYOffset; // body.scrollTop is deprecated in strict mode;
            focusMainElement($CU);
            window.pageYOffset = savedScrollPos;
        }

        if (miscSettings.increaseFontInSelectedCU && !$CU.data('fontIncreasedOnSelection')) {
            increaseFont($CU);
            $CU.data('fontIncreasedOnSelection', true);
        }

        var fn_onCUSelection, temp;
        if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUSelection) && (fn_onCUSelection = temp.fn)) {
            fn_onCUSelection($CU, document, $.extend(true, {}, expandedUrlData));
        }

        mouseoverInSelectedCU_ifRequired($CU);
    }

    /**
     * Deselects the currently selected CU, if no CU is specified, else deselects the specified one. Is normally meant
     * to be called *WITHOUT* supplying any argument. (however as a special case, updateCUsAndRelatedState() needs to call
     * it passing the CU.
     * @param [$CU]
     */
    function deselectCU($CU) {
        var disabledHere = mod_mutationObserver.disable();
        _deselectCU($CU);
        disabledHere && mod_mutationObserver.enable();
    }

    // only meant to be called from within deselectCU()
    function _deselectCU(_$CU) {
        var $CU = _$CU || CUs_filtered[selectedCUIndex];
        if (!$CU) {  // will be true the first time this is called from reset()
            return;
        }

        $selectedCUOverlay.hide();
        for (var i = 0; i < 4; i++)
            nonCUPageOverlays[i].hide();

        lastSelectedCUBoundingRect = null;
        selectedCUIndex = -1;
        mod_globals.isCUSelected = false;

        if ($CU.data('fontIncreasedOnSelection')) {
            decreaseFont($CU);
            $CU.data('fontIncreasedOnSelection', false);
        }

        var fn_onCUDeselection, temp;
        if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUDeselection) && (fn_onCUDeselection = temp.fn)) {
            fn_onCUDeselection($CU, document, $.extend(true, {}, expandedUrlData));
        }
    }

    // returns a jQuery set composed of all focusable DOM elements contained in the
    // jQuery set ($CU) passed
    function $getContainedFocusables($CU) {
        var $allElements = $CU.find('*').addBack();
        return $allElements.filter(CONSTS.focusablesSelector);
    }

    /**
     * Returns the "main" element in the specified $CU. This is determined using the "std_mainEl" SU specified in the expandedUrlData.
     * If no std_mainEl is specified, this function simply returns the first focusable element in the $CU
     *
     * @param $CU
     * @return {HtmlElement} Returns the "main" element, if one was found, else null.
     */
    function getMainElement($CU) {
        var $mainElement;
        mainElementSelector && ($mainElement = $CU.find(mainElementSelector));
        if ($mainElement && $mainElement.length) {
            return $mainElement[0];
        }

        // If main element not specified or found, then return the first focusable in the CU.
        var $containedFocusables = $getContainedFocusables($CU).filter(function() {
            return mod_contentHelper.elemAllowsSingleKeyShortcut(this);
        });
        if ($containedFocusables && $containedFocusables.length) {
            return $containedFocusables[0];
        }

        // NOTE: As a fix for #176, we don't explicitly check whether element found by $CU.find(mainElementSelector) is visible or not.
        // In the case where no mainElement was specified or found, we return the first 'visible' focusable, as returned
        // by $getContainedFocusables().

        return null;
    }

    // Focuses the "main" focusable element in a CU, if one can be found.
    // See function "getMainElement" for more details.
    function focusMainElement($CU) {
        var mainEl = getMainElement($CU);
        if (mainEl) {
//        $(mainEl).data('enclosingCUJustSelected', true);
            mainEl.focus();
        }
        else {
            document.activeElement.blur();
        }
    }

    // Shows (and updates) the selected CU overlay
    // `enforceRedraw` - optional; is passed as true when the page height/width changes
    // to enforce redrawing of the non-CU page overlays
    // `invokedOnCUSelection` optional - true indicates this call happened due to a CU-selection
    function showSelectedOverlay($CU, enforceRedraw, invokedOnCUSelection) {
        var boundingRect = getBoundingRect($CU);

        if (enforceRedraw ||
            // When `enforceRedraw` isn't true (as is usually the case), the following
            // check helps performance since _showOverlay() takes orders of magnitude
            // more time than getBoundingRect().
            // (This check isn't required for showHoveredOverlay()  because the
            // needless redrawing of the same selected overlay happens only due
            // to showSelectedOverlay() getting repeatedly called on dom mutations.
            // On the other hand, showHoveredOverlay() doesn't get invoked nearly
            // as frequently since the hovered overlay is usually not present, as
            // it gets removed on every selectCU() etc)
            !(lastSelectedCUBoundingRect &&
                boundingRect.top === lastSelectedCUBoundingRect.top &&
                boundingRect.left === lastSelectedCUBoundingRect.left &&
                boundingRect.width === lastSelectedCUBoundingRect.width &&
                boundingRect.height === lastSelectedCUBoundingRect.height)) {

            lastSelectedCUBoundingRect = boundingRect;
            _showOverlay('selected', boundingRect, invokedOnCUSelection);
        }
//        else {
//            console.log('call to _showOverlay() not needed');
//        }
    }

    // (`boundingRect` is optional; is passed by those functions where it has already
    // been determined there)
    function showHoveredOverlay($CU, boundingRect) {
        _showOverlay('hovered', boundingRect || getBoundingRect($CU));
    }

    //TODO: the `showOverlay()` and `_showOverlay()` functions should perhaps be renamed
    // to something more apt now that `_showNonCUPageOverlays()` from within

    /**
     * Code for showing selected/hovered overlays. Only meant to be
     * called from within showSelectedOverlay() or showHoveredOverlay()
     * @param type - 'selected' or 'hovered'
     * @param boundingRect bounding rectangle for the CU (not including padding/
     * style based on the urlData for the current page)
     * @param {boolean} [invokedOnCUSelection] optional - true indicates this call happened due to a CU-selection
     */
    function _showOverlay(type, boundingRect, invokedOnCUSelection) {
        var $overlay = (type === 'selected'? $selectedCUOverlay: $hoveredCUOverlay);

        var disabledHere = mod_mutationObserver.disable();
        $overlay.
            hide().
            css(boundingRect);  // position the overlay above the CU

        applyPaddingToCUOverlay($overlay);
        $overlay.show();
        if (type === 'selected') {
            _showNonCUPageOverlays(invokedOnCUSelection);
        }
        disabledHere && mod_mutationObserver.enable();
    }

    // Applies padding to the selected/hovered overlay based on CUs_style.overlayPadding,
    // if it is specified in the urlData for the current page
    function applyPaddingToCUOverlay($overlay) {
        var overlayPadding;

        if (CUStyleData && (overlayPadding = CUStyleData.overlayPadding)) {
            /*
             * Steps:
             * 1. Apply the specified padding to the overlay.
             * 2. Re-adjust the position (top, left) of the overlay taking into account the set top and left padding.
             * 3. Get the dimensions of the element including the padding. Lets call these values totalHeight and totalWidth.
             * 4. Set the padding of the overlay to 0.
             * 5. Set the height and width of the overlay to totalHeight and totalWidth.
             */

            /* Reason for this strangeness:
             * 1. We want to let users specify the overlay padding as is normally done in CSS.
             * 2. At the same time, we don't want the overlay to * actually * have any padding. For the corner markers
             * (that we insert inside the overlay) to stick to the corners of the overlay, it is best if the overlay does
             * not have any padding.
             */
            $overlay.css("padding", overlayPadding);

            $overlay.css("top", parseFloat($overlay.css("top")) -
                parseFloat($overlay.css("padding-top")));

            $overlay.css("left", parseFloat($overlay.css("left")) -
                parseFloat($overlay.css("padding-left")));

            // clientHeight/clientWidth seems to not work consistently unless the
            // element is in the DOM and visible (i.e NOT 'display: none')
            var overlayFinalHeight = $overlay.innerHeight(), //$overlay[0].clientHeight,
                overlayFinalWidth = $overlay.innerWidth(); //$overlay[0].clientWidth;

            $overlay.css("padding", 0);
            $overlay.height(overlayFinalHeight);
            $overlay.width(overlayFinalWidth);
        }
    }

    /**
     * Shows as hovered the CU specified using CUIndex
     * @param {number} CUIndex Specifies the index of the CU in the array CUs_filtered
     */
    function hoverCU(CUIndex) {
        var $CU = CUs_filtered[CUIndex];

        dehoverCU(); // first dehover currently hovered-over CU, if any
        hoveredCUIndex = CUIndex;
        showHoveredOverlay($CU);
    }

    /**
     * Dehovers the currently hovered (over) CU, if there is one
     */
    function dehoverCU() {
        var disabledHere = mod_mutationObserver.disable();
        $hoveredCUOverlay.hide();
        disabledHere && mod_mutationObserver.enable();
        hoveredCUIndex = -1;
    }

    function smartScrollUp() {
        selectNextCUOrScroll('up');
    }
    function smartScrollDown() {
        selectNextCUOrScroll('down');
    }
    function smartScrollRight() {
        selectNextCUOrScroll('right');
    }
    function smartScrollLeft() {
        selectNextCUOrScroll('left');
    }

    function selectCUUp() {
        selectNextCU('up');
    }
    function selectCUDown() {
        selectNextCU('down');
    }
    function selectCURight() {
        selectNextCU('right');
    }

    function selectCULeft() {
        selectNextCU('left');
    }

    /**
     * selects the next CU in the specified direction - 'up', 'down', 'left' or 'right' OR scrolls
     * the page in the specified direction, as appropriate
     */
    function selectNextCUOrScroll (direction) {
        _selectNextCUOrScroll(direction);
        highlightSelectedCUBriefly_ifRequired();
    }

    function _selectNextCUOrScroll(direction) {
        if (!CUs_filtered.length) {
            mod_basicPageUtils.scroll(direction);
            return;
        }

        var $selectedCU = CUs_filtered[selectedCUIndex];
        if ($selectedCU) {
            var nextIndex = mod_directionalNav.getClosest($selectedCU, CUs_filtered, direction,
                    getBoundingRect, areCUsSame),
                $nextCU = CUs_filtered[nextIndex];

            if ($nextCU && isAnyPartOfCUinViewport($nextCU)) {
                // NOTE: On a page with CUs, this is the HAPPY PATH, that the code branch
                // that would execute in in most cases
                selectCU(nextIndex, true, true, direction);
            }
            else if (isAnyPartOfCUinViewport($selectedCU)) {
                mod_basicPageUtils.scroll(direction);
            }
            // if the page has been scrolled to a position away from the selected CU...
            else {
                nextIndex = findFirstSensibleCUInViewport();
                $nextCU = CUs_filtered[nextIndex];

                // The following code is more complex than would seem necessary. But this is required in order to
                // handle well pages with grid/2-D type CU layout (including cases where there are gaps between
                // CUs on the page, meaning the CUs are not all stacked adjacent to each other)
                if ($nextCU) {
                    var perpOverlap = mod_directionalNav.getPerpOverlap(getBoundingRect($selectedCU),
                        getBoundingRect($nextCU), direction);

                    if (perpOverlap > 0) {
                        // we first check if the CU found by `findFirstSensibleCUInViewport` has a positive
                        // perp overlap rather than looking for the CU with the highest perpOverlap, because
                        // that works better, especially on sites with linear CUs like google search results page
                        selectCU(nextIndex, true, false, direction);
                    }
                    else {
                        // find CU in viewport with maximum "perpendicular overlap"
                        var highestPerpOverlap = -Infinity,
                            indexWithHighestPerpOverlap = -1;     // index in CUs_filtered
                        for (var i = 0; i < CUs_filtered.length; i++) {
                            var $CU = CUs_filtered[i];

                            // TODO: the following can be optimized for performance since we are
                            // checking for CUs in the viewport again instead of making use of the
                            // same check that had happened earlier. However, since this is not a
                            // commonly executing code path, it's not a priority
                            if (isAnyPartOfCUinViewport($CU)) {
                                perpOverlap = mod_directionalNav.getPerpOverlap(getBoundingRect($selectedCU),
                                    getBoundingRect($CU), direction);
                                if (perpOverlap > highestPerpOverlap) {
                                    highestPerpOverlap = perpOverlap;
                                    indexWithHighestPerpOverlap = i;
                                }
                            }
                        }
                        // the outer enclosing if-block [if ($nextCU) {}] ensures that `indexWithHighestPerpOverlap`
                        // will have a non-negative value
                        selectCU(indexWithHighestPerpOverlap, true, true, direction);
                        if (highestPerpOverlap < 0) {
                            highlightSelectedCUBriefly();
                        }
                    }
                }
                else {
                    mod_basicPageUtils.scroll(direction);
                }
            }
        }
        else {
            selectMostSensibleCU_withoutScrollingPage(true) || mod_basicPageUtils.scroll(direction);
        }
    }

    // selects the next CU in the direction specified (NOTE: in most cases, calling `selectNextCUOrScroll()`
    // might be better than calling this)
    function selectNextCU(direction) {
        var $selectedCU = CUs_filtered[selectedCUIndex],
            nextIndex;
        if ($selectedCU && (nextIndex = mod_directionalNav.getClosest($selectedCU, CUs_filtered, direction,
            getBoundingRect, areCUsSame)) > -1) {

            selectCU(nextIndex, true, true, direction);
        }
        else {
            selectMostSensibleCU_withoutScrollingPage(true);
        }
    }

    function selectFirst(setFocus, adjustScrolling) {
//        var len = CUs_filtered.length;
//        for (var i = 0; i < len; i++) {
//            if (!isCUInvisible(CUs_filtered[i])) {
//                selectCU(i, setFocus, adjustScrolling);
//                return;
//            }
//        }
        CUs_filtered.length && selectCU(0, setFocus, adjustScrolling);
    }
    function selectLast(setFocus, adjustScrolling) {
//        for (var i = CUs_filtered.length - 1; i >= 0; i--) {
//            if (!isCUInvisible(CUs_filtered[i])) {
//                selectCU(i, setFocus, adjustScrolling);
//                return;
//            }
//        }
        CUs_filtered.length && selectCU(CUs_filtered.length - 1, setFocus, adjustScrolling);
    }

    /**
     * Selects the most "sensible" CU, not based on directional user input. Returns true if one is
     * found, else false.
     * NOTE: this is called when there is applicable directional input, but we want to find a
     * "sensible" CU. For that reason  ensure that there is NO change in the change the scrolling
     * of the page due to a call to this.
     */
    function selectMostSensibleCU_withoutScrollingPage(setFocus) {
        var savedScrollPos = window.pageYOffset,
            returnVal;

        var lastSelectedCUIndex;
        if ( (lastSelectedCUIndex = findCUInArray($lastSelectedCU, CUs_filtered)) >=0 &&
            isAnyPartOfCUinViewport($lastSelectedCU)) {

            selectCU(lastSelectedCUIndex, setFocus, false);
            returnVal = true;
        }
        else {
            var i = findFirstSensibleCUInViewport();
            if (i > -1) {
                selectCU(i, setFocus, false);
                returnVal = true;
            }
            else {
                returnVal = false;
            }
        }

        // make sure the scroll position doesn't change due to the main element getting focus
        window.pageYOffset = savedScrollPos;
        return returnVal;
    }

    /**
     * Returns index (in CUs_filtered) of the first CU (looking in DOM order, for now) that
     * is contained *fully* in the viewport. If no such CU exists, returns the index of the
     * CU with the *largest area* in the viewport. Returns -1 if no CU is found in the viewport.
     * @returns {number}
     */
    function findFirstSensibleCUInViewport() {
        if (CUs_filtered && CUs_filtered.length) {
            var CUsArrLen = CUs_filtered.length,
                CUIndexWithMaxAreaInViewport = -1,
                maxArea = 0;

            for (var i = 0; i < CUsArrLen; ++i) {
                var $CU = CUs_filtered[i],
                    CUBoundingRect = getBoundingRect($CU);
                if (isCUFullyInViewport($CU, CUBoundingRect)) {
                    return i;
                }
                var area = getCUAreaInViewport($CU, CUBoundingRect);
                if (area > maxArea) {
                    maxArea = area;
                    CUIndexWithMaxAreaInViewport = i;
                }
            }
            // if not returned yet
            return CUIndexWithMaxAreaInViewport;
        }
    }

    // Returns the area of the part of the CU in the viewport (and 0 if no part of the
    // CU is in the viewport)
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function getCUAreaInViewport($CU, CUBoundingRect) {
        var boundingRect = CUBoundingRect || getBoundingRect($CU);

        if (isAnyPartOfCUinViewport($CU, boundingRect)) {
            var CUTop = boundingRect.top,
                CUBottom = CUTop + boundingRect.height,
                CULeft = boundingRect.left,
                CURight = CULeft + boundingRect.width,

                winTop = window.pageYOffset, //window.scrollY, //body.scrollTop,
                winBottom = winTop + window.innerHeight,
                winLeft = document.scrollLeft, // window.scrollX,
                winRight = winLeft + window.innerWidth;

            return ( (Math.min(winRight, CURight) - Math.max(winLeft, CULeft)) *
                (Math.min(winBottom, CUBottom) - Math.max(winTop, CUTop)) );
        }
        else
            return 0;
    }

    // Show overlays to cover the non-CU part of the page.
    // NOTE: This is only meant to be called from within
    // (the code flow of) showSelectedOverlay()
    function _showNonCUPageOverlays(invokedOnCUSelection) {
        // if invoked on CU selection, set opacity (if it needs to be changed) to the right value
        invokedOnCUSelection && setNonCUPageOverlaysOpacity(userSetOpacity_nonCUPageOverlays);

        var CUOffset = $selectedCUOverlay.offset(),
            CUOverlay = $selectedCUOverlay[0],

            // The following two variables can be set to *more* than the actual values (which should be
            // body.clientHeight and body.clientWidth) without causing any trouble, but NOT lesser).
            // [body.clientHeight doesn't get the correct value on Hacker News, and on twitter nothing
            // apart from body.scrollHeight returns the correct value including, it seems, jQuery's height()
            // and innerHeight()]
            bodyHeight = Math.max(body.clientHeight, body.offsetHeight, body.scrollHeight, $body.innerHeight()),
            bodyWidth = $body.innerWidth(),

            CUOverlayTop = CUOffset.top,
            CUOverlayLeft = CUOffset.left,
            CUOverlayRight = CUOverlayLeft + CUOverlay.offsetWidth,
            CUOverlayHeight = CUOverlay.offsetHeight,

            // margins from the edges of the body
            CUOverlayBottomMargin = bodyHeight - (CUOverlayTop + CUOverlayHeight),
            COOverlayRightMargin = bodyWidth - CUOverlayRight;


        //NOTE: we set top, left, width, height in each case below because that seems to work more reliably
        // than setting bottom (and perhaps right) which would have made calculations easier

        nonCUPageOverlays[0].css({
            top: 0 + "px",
            left: 0 + "px",
            width: bodyWidth + "px",
            height: CUOverlayTop + "px",
        }).show();

        // bottom
        nonCUPageOverlays[1].css({
            top: CUOverlayTop + CUOverlayHeight + "px",
            left: 0 + "px",
            width: bodyWidth + "px",
            height: CUOverlayBottomMargin + "px"
        }).show();

        // left
        nonCUPageOverlays[2].css({
            top: CUOverlayTop + "px",
            left: 0 + "px",
            width: CUOverlayLeft + "px",
            height: CUOverlayHeight + "px"
        }).show();

        // right
        nonCUPageOverlays[3].css({
            top: CUOverlayTop + "px",
            left: CUOverlayRight + "px",
            width: COOverlayRightMargin + "px",
            height: CUOverlayHeight + "px"
        }).show();
    }

    // To increase/decrease "spotlight" on the selected CU
    // `how` should be one of 'increase', 'decrease', 'default'
    function changeSpotlightOnSelecteCU(how) {
        var delta = 0.05;

        // we need to save `userSetOpacity_nonCUPageOverlays` before calling setNonCUPageOverlaysOpacity()
        if (how === 'increase')
            userSetOpacity_nonCUPageOverlays += delta;
        else if (how === 'decrease')
            userSetOpacity_nonCUPageOverlays -= delta;
        else
            userSetOpacity_nonCUPageOverlays = defaultOpacity_nonCUPageOverlays;

        if (userSetOpacity_nonCUPageOverlays < 0)
            userSetOpacity_nonCUPageOverlays = 0;
        if (userSetOpacity_nonCUPageOverlays > 1)
            userSetOpacity_nonCUPageOverlays = 1;

        setNonCUPageOverlaysOpacity(userSetOpacity_nonCUPageOverlays);
    }

    function setNonCUPageOverlaysOpacity(opacity) {
        if (opacity !== currentOpacity_nonCUPageOverlays) {
            var $nonCUOverlays = $('.' + class_nonCUPageOverlay);
            $nonCUOverlays.css('opacity', opacity);
            currentOpacity_nonCUPageOverlays = opacity;
        }
    }

    function onWindowScroll() {
        clearTimeout(timeout_viewportChange);
        timeout_viewportChange = setTimeout(_onWindowScrollPause, 100);
    }

    // called when there is a pause in the window's scrolling
    function _onWindowScrollPause() {
        var $selectedCU = CUs_filtered[selectedCUIndex];
        if ($selectedCU && isAnyPartOfCUinViewport($selectedCU)) {
            setNonCUPageOverlaysOpacity(userSetOpacity_nonCUPageOverlays);
        }
        else {
            setNonCUPageOverlaysOpacity(0);
        }
    }

    /**
     * If the specified element exists within a CU, the index of that CU in CUs_filtered is
     * returned, else -1 is returned.
     * @param {HtmlElement|jQuery} element DOM element or its jQuery wrapper
     * @return {number} If containing CU was found, its index, else -1
     */
    function getEnclosingCUIndex(element) {
        var $element = $(element),
            CUsArrLen = CUs_filtered.length;

        for (var i = 0; i < CUsArrLen; ++i) {
            if (CUs_filtered[i].is($element) || CUs_filtered[i].find($element).length) {
                return i;
            }
        }

        return -1;
    }

    function onTabOnFilterSearchBox() {
        if (CUs_filtered.length) {
            selectFirst(true, true);
        }
        else {
            var $focusables = $document.find(CONSTS.focusablesSelector);
            if ($focusables.length) {
                $focusables[0].focus();
            }
        }
    }

// Returns ALL the elements after the current one in the DOM (as opposed to jQuery's built in nextAll which retults only
// the next siblings.
// Returned object contains elements in document order
// TODO2: check if this is needed. Of if needed only in the one instance where its being used current, could be replaced
// by nextALLUntil(selector), which might be more efficient
    $.fn.nextALL = function(filter) {
        var $all = $('*'); // equivalent to $document.find('*')
        $all = $all.slice($all.index(this) + 1);
        if (filter)  {
            $all = $all.filter(filter);
        }
        return $all;
    };

    /**
     * This will find and return the index of the passed jQuery set ($CU) in the CUs_filtered. However, unlike JavaScript's
     * Array#indexOf() method, a match will be found even if the passed jQuery set is "equivalent" (i.e has the same
     * contents) to a member of the CUs array, even if they are not the *same* object.
     * Returns -1 if not found.
     * @param {jQuery} $CU
     * @param {Array} CUs
     * @param {number} [suggestedIndex] If provided, we match against this first (for better performance)
     * @returns {number} The index of $CU in CUs if found, else -1
     */
    function findCUInArray($CU, CUs, suggestedIndex)  {

        if (suggestedIndex && areCUsSame($CU, CUs[suggestedIndex])) {
            return suggestedIndex;
        }

        var len;

        if (CUs && (len = CUs.length)) {

            for (var i = 0; i < len; ++i) {
                if (areCUsSame($CU, CUs[i])) {
                    return i;
                }
            }
        }

        return -1;
    }

// returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
// instances where we use this function, the order of elements is always the document order)
    /**
     * returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
     * instances where we use this function, the order of elements is always the document order)
     * @param $1 A CU
     * @param $2 Another CU to compare with the first one.
     * @return {Boolean}
     */
    function areCUsSame($1, $2) {
        if ( ($1 === $2) ||
            // if both are empty or nonexistent, their "contents" are "same".
            (!$1 && (!$2 || !$2.length)) ||
            (!$2 && (!$1 || !$1.length)) ) {

            return true;
        }

        // we reach here if at least one of them exists and is non-empty, so...
        if ($1 && $1.length && $2 && $2.length ) {
            var length1 = $1.length,
                length2 = $2.length;

            if (length1 === length2) {

                for (var i = 0; i < length1; ++i) {
                    if ($1[i] !== $2[i]) { // if corresponding DOM elements are not the same
                        return false;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

// returns a bounding rectangle for $CU
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
// NOTE: the values for top and left are relative to the document
    function getBoundingRect($CU) {
        var elements = [];
        if (CUStyleData && CUStyleData.useInnerElementsToGetOverlaySize) {
            var allDescendants = $CU.find('*');

            if (allDescendants.length) {
                var $innermostDescendants = allDescendants.filter(function() {
                    if (!($(this).children().length)) {
                        return true;
                    }
                });
                elements = $innermostDescendants.get();
            }
            else {
                elements = $CU.get();
            }
        }
        else {
            elements = $CU.get();
        }
        return getBoundingRectForElements(elements);
    }

    function isElementVisible(el) {
//        var $el = $(el);
//        return $el.is(':visible') && $el.css('visibility') !== "hidden";
        // NOTE: using the jquery equivalent especially .is(':visible') was found to be much slower,
        return el.offsetHeight && el.offsetWidth &&
            document.defaultView.getComputedStyle(el).getPropertyValue("visibility") !== "hidden";
    }

// returns a bounding rectangle for the set (array) of DOM elements specified
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    function getBoundingRectForElements(elements) {
        if (!elements || !elements.length)
            return;

        var el, $el, offset;
        if (elements.length === 1) {
            el = elements[0];
            $el = $(el);
            offset = $el.offset();
            return {
                top: offset.top,
                left: offset.left,
                width: el.offsetWidth,
                height: el.offsetHeight,
            };
        }

        // x1, y1 => top-left. x2, y2 => bottom-right.
        // for the bounding rectangle:
        var x1 = Infinity,
            y1 = Infinity,
            x2 = -Infinity,
            y2 = -Infinity;

        var len = elements.length;
        for (var i = 0; i < len; i++) {
            el = elements[i];
            $el = $(el);
            var elPosition = el.style.position;

            // ignore elements that are out of normal flow or hidden/invisible
            if (elPosition === "fixed" || elPosition === "absolute" || /*|| elPosition === "relative"*/
                !isElementVisible(el)) {
                continue;
            }

            offset = $el.offset();

            // for the current element:
            var _x1, _y1, _x2, _y2;

            _x1 = offset.left;
            _y1 = offset.top;
            _x2 = _x1 + el.offsetWidth;
            _y2 = _y1 + el.offsetHeight;

            if (_x1 < x1)
                x1 = _x1;

            if (_y1 < y1)
                y1 = _y1;

            if (_x2 > x2)
                x2 = _x2;

            if (_y2 > y2)
                y2 = _y2;
        }

        // return an object with a format such that it can directly be passed to jQuery's css() function).
        return {
            top: y1,
            left:x1,
            width: x2-x1,
            height: y2-y1
        };
    }

    function smoothScroll(elementToScroll, scrollProperty, value, duration) {
        resetScrollEventHandler(); // to prevent continuous firing of handler during smooth scroll animation
        mod_smoothScroll.smoothScroll(elementToScroll, scrollProperty, value, duration, setupScrollEventHandler);
    }

    /**
     * Scrolls the  page to center the specified CU on it. Uses `direction` to decide how to
     * position an element that doesn't fit in the viewport, and to ensure that we don't scroll
     * opposite to the `direction` of movement specified by the user.
     * possible if the element is too large).
     * @param {jQuery} $CUOverlay
     * @param {string} [direction] The direction of movement specified by the user, if relevant.
     * *NOTE* If the `direction` is specified, it performs two important functions:
     * 1) We ensure that we do NOT scroll the page in the *opposite* to the specified direction.
     * For example if 'j' (down direction) is pressed, and centering the specified CU required
     * the page to be scrolled up, the scrolling won't take place.
     * 2) We use `direction` to decide which side of a large CU (that doesn't fit within the
     * viewport) should be aligned with the (corresponding side of) the viewport. For example,
     * scrolling downward into a new large CU, we would align it's top to the top of the page,
     * but had the scrolling been upward, we would align its bottom to the bottom of the page
     * -- and similarly for left/right movement.
     */
    function scrollCUIntoView($CUOverlay, direction) {

        var // for the window:
            winTop = window.pageYOffset,// body.scrollTop,
        // winHeight =$window.height(), // this doesn't seem to work correctly on news.ycombinator.com
            winHeight = window.innerHeight,
            winBottom = winTop + winHeight,
            winLeft = window.pageXOffset, // body.scrollLeft,
            winWidth = window.innerWidth,
            winRight = winLeft + winWidth,

        // for the element:
            elOffset = $CUOverlay.offset(),
            elTop = elOffset.top,
            elHeight = $CUOverlay.height(),
            elBottom = elTop + elHeight,
            elLeft = elOffset.left,
            elWidth = $CUOverlay.width(),
            elRight = elLeft + elWidth;

        var newWinTop, newWinLeft, // we will scroll the window to these values if required
            margin = 10,
            animationDuration;

        // adjust horizontally, if not fully within the viewport horizontally
        if (!(elLeft > winLeft && elRight < winRight)) {
            // based on equating the space to the element's left and right in the new window position
            newWinLeft = (elLeft + elRight - winWidth)/2;
            if (direction === 'right' && elLeft < newWinLeft + margin) {
                    newWinLeft = elLeft - margin;
            }
            // newWinLeft + winWidth = "newWinRight"
            else if (direction === 'left' && elRight > (newWinLeft + winWidth) - margin) {
                newWinLeft = elRight - winWidth + margin;
            }

            // ensure we scroll only if it's not opposite to `direction` (if specified)
            if (!direction || 
                (direction === 'right' && newWinLeft > winLeft) ||
                (direction === 'left' && newWinLeft < winLeft) ) {
                
                if (miscSettings.animatedCUScroll) {
                    animationDuration = Math.min(miscSettings.animatedCUScroll_MaxDuration,
                        Math.abs(newWinLeft-winLeft) / miscSettings.animatedCUScroll_Speed);

                    // TODO: if the animation for vertical scroll is required (see below), this
                    // animation will be terminated instantly. Instead, ideally, a diagonal, animation
                    // should take place. Low priority, given the rarity of horizontal scroll
                    smoothScroll(window, 'pageXOffset', newWinLeft, animationDuration);
                }
                else {
                    window.pageXOffset = newWinLeft;
                }
            }
        }

        var pageHeaderHeight = getUnusableSpaceAtTopDueToHeader();

        // if `verticallyCenterSelectedCU` is true, and direction isn't explicitly 'left' or 'right
        if ((miscSettings.verticallyCenterSelectedCU && direction !== 'left' && direction !== 'right') ||
        // OR if CU isn't fully contained in viewport *vertically*
            !(elTop > winTop + pageHeaderHeight + margin && elBottom < winBottom - margin)) {

            // *vertically* center the element based on this equation equating the space left in the (visible part of
            // the) viewport above the element to the space left below it:
            // elTop - (newWinTop + pageHeaderHeight) = newWinBottom - elBottom = newWinTop + winHeight - elBottom
            // (substituting (newWinTop + winHeight) for newWinBottom)
            newWinTop = (elTop + elBottom - winHeight - pageHeaderHeight)/2;

            newWinTop += 50; // now shift slightly upward to make it closer to the top than bottom; looks nicer

            if (direction === 'down' && elTop < newWinTop + pageHeaderHeight + margin ) {
                newWinTop = elTop - pageHeaderHeight - margin;
            }
            // newWinTop + winHeight = "newWinBottom"
            else if (direction === 'up' && elBottom > (newWinTop + winHeight) - margin) {
                newWinTop = elBottom - winHeight + margin;
            }

            // ensure we scroll only if it's not opposite to `direction` (if specified)
            if (!direction ||
                (direction === 'down' && newWinTop > winTop) ||
                (direction === 'up' && newWinTop < winTop) ) {

                if (miscSettings.animatedCUScroll) {
                    animationDuration = Math.min(miscSettings.animatedCUScroll_MaxDuration,
                        Math.abs(newWinTop-winTop) / miscSettings.animatedCUScroll_Speed);

                    smoothScroll(window, 'pageYOffset', newWinTop, animationDuration);
                }
                else {
                    window.pageYOffset = newWinTop;
                }
            }
        }
    }

    function getJQueryWrapper(x) {
        return $(x);
    }
   
    function onUpdatingCUs() {

        if (!document.contains(mainContainer)) {
            mainContainer  = getMainContainer();
        }
        mainContainer_prevScrollHeight = mainContainer.scrollHeight;
        mainContainer_prevScrollWidth = mainContainer.scrollWidth;

        if (CUs_all.length) {
            // Use the selected CU. If there isn't one, use the middle CU (it's okay if we miss out some ancestors, since
            // we have a fallback mutation observer as well)
            var $CU = CUs_filtered[selectedCUIndex] || CUs_all[Math.floor(CUs_all.length/2)];
            mod_mutationObserver.enableFor_CUsAncestors($CU.parents());
        }
    }

    // updates the selected and hovered-over CU overlays
    function updateCUOverlays() {
        updateSelectedOverlay();
        updateHoveredOverlay();
    }

    // If a selected CU exists, update the selected overlay
    function updateSelectedOverlay() {
        var $selectedCU = CUs_filtered[selectedCUIndex];
        $selectedCU && showSelectedOverlay($selectedCU);
    }

    // If a hovered-over CU exists
    // - if the  mouse pointer is still contained within the CU's current area, update the hovered-over overlay
    // - else dehoverCU()
    function updateHoveredOverlay() {
        var $hoveredCU = CUs_filtered[hoveredCUIndex];
        if ($hoveredCU) {
            var boundingRect = getBoundingRect($hoveredCU);
            if (mod_contentHelper.rectContainsPoint(boundingRect, mouseX, mouseY)) {
                showHoveredOverlay($hoveredCU, boundingRect); // update the overlay
            }
            else {
                dehoverCU();
            }
        }
    }

    function onFilterTextChange() {
        dehoverCU();
        deselectCU();
        CUs_filtered = mod_filterCUs.applyFiltering(CUs_all, true);
        miscSettings.selectCUOnLoad && selectFirst(false, false);
    }

    function onFilterUIClose() {
        var $CUToSelect = CUs_filtered[selectedCUIndex];
        dehoverCU();
        deselectCU();
        CUs_filtered = CUs_all;

        if ($CUToSelect) {
            var index = findCUInArray($CUToSelect, CUs_filtered);
            if (index >= 0) {
                // if filtering search box has been closed, focus should be set on the CU
                selectCU(index, true, true);
            }
        }
        else if (miscSettings.selectCUOnLoad){
            selectFirst(true, true);
        }
    }

    /**
     * Sets/updates the global variables CUs_filtered and CUs_all and other related state. Called once on dom-ready,
     * thereafter whenever the CUs need to be updated based on DOM changes
     */
    function updateCUsAndRelatedState() {
        var disabledByMe = mod_mutationObserver.disable();

        // remove zen mode class before calculating CUs because zen mode might hide
        // elements that would be CUs (this can especially happen just after the page loads)
        mod_globals.zenModeOn && $body.removeClass(CONSTS.class_zenModeActive);
        _updateCUsAndRelatedState();
        onUpdatingCUs();
        if (mod_globals.zenModeOn) {
            $body.addClass(CONSTS.class_zenModeActive);
            updateCUOverlays();
        }

        disabledByMe && mod_mutationObserver.enable();
    }

    // meant to be called by updateCUsAndRelatedState()
    function _updateCUsAndRelatedState() {
        // Save the currently selected CU, to reselect it, if it is still present in the CUs_filtered after the array is
        // updated. This needs to be done before calling deselectCU() and modifying CUs_filtered
        var $prevSelectedCU = CUs_filtered[selectedCUIndex],
            prevSelectedIndex = selectedCUIndex;

        // like above, for the hovered-over CU
        var $prevHoveredCU = CUs_filtered[hoveredCUIndex];

        // we don't call deselectCU() instead because we want to reserve that for actual CU deselections, instead
        // of calling it every time DOM changes. 
        selectedCUIndex = -1;

        CUs_filtered = CUs_all = getValidCUs();
        thisModule.trigger("CUs-all-change");

        if (mod_filterCUs.isActive()) {
            CUs_filtered = mod_filterCUs.applyFiltering(CUs_all, false);
        }

        mod_globals.numCUs_all = CUs_all.length;
        mod_globals.numCUs_filtered = CUs_filtered.length; // do this after filtering is applied

        // if this is the first time CUs were found...
        if (!CUsBeenFoundOnce && CUs_filtered.length) {
            CUsBeenFoundOnce = true;
            if ( miscSettings.selectCUOnLoad) {
                selectMostSensibleCU_withoutScrollingPage(true);
            }
            mainContainer  = getMainContainer();
        }

        // on updating the CUs after a dom-change:
        // if a CU was previously selected
        //  - if it still exists in CUs_filtered, it should remain selected
        //  - if it no longer exists in CUs_filtered
        //      - deselect it
        //      - if the option `selectCUOnLoad` is true, select a sensible CU,
        // if no CU was selected (perhaps the user pressed `Esc` earlier), don't select any CU, i.e. nothing needs to be done
        else if ($prevSelectedCU) {
            if (CUs_filtered && CUs_filtered.length) {
                var newSelectedCUIndex;

                    if ((newSelectedCUIndex = findCUInArray($prevSelectedCU, CUs_filtered, prevSelectedIndex)) >= 0) {
                        // we don't call selectCU() instead because we want to reserve that for actual CU selections,
                        // instead of calling it on (almost) every DOM change.
                        CUs_filtered[newSelectedCUIndex] = $prevSelectedCU;
                        selectedCUIndex = newSelectedCUIndex;
                        showSelectedOverlay($prevSelectedCU);    // to update the overlay in case of resize etc
                    }
                    else {
                        deselectCU($prevSelectedCU);
                        selectedCUIndex = -1;
                        if (miscSettings.selectCUOnLoad) {
                            selectMostSensibleCU_withoutScrollingPage(false);
                        }
                    }

            }
            else {
                deselectCU($prevSelectedCU);
            }
        }

        if ($prevHoveredCU) {
            var newHoveredCUIndex,
                boundingRect = getBoundingRect($prevHoveredCU);

            // if the previously hovered CU is still present in CUs_filtered AND the mouse pointer
            // is still contained within its bounding rect
            if (mod_contentHelper.rectContainsPoint(boundingRect, mouseX, mouseY) &&
                (newHoveredCUIndex = findCUInArray($prevHoveredCU, CUs_filtered, hoveredCUIndex)) >= 0) {

                // (to keep things consistent with the case of selected CU above,) we don't call
                // hoverCU() here, since we're just *updating* the hovered overlay, not responding
                // the user hovering over a *new* CU
                hoveredCUIndex = newHoveredCUIndex;
                showHoveredOverlay($prevHoveredCU, boundingRect);

            }
            else {
                dehoverCU();
            }
        }
    }

    function getValidCUs() {
        var CUsArr = _getAllCUs();
        processCUs(CUsArr);
        return CUsArr;
    }

    // Finds the set of all the CUs on the current page, and returns it as an array
    // NOTE: This is meant to be called only from within getValidCUs()
    function _getAllCUs() {

        var CUsArr,   // this will be hold the array to return
            firstSelector,
            lastSelector,
            centralElementSelector;

        if (CUsSelector) {
            CUsArr = $.map($(CUsSelector).get(), getJQueryWrapper);
        }
        else if ((centralElementSelector = CUsSpecifier.buildCUAround)){
            var  $container = $(mod_contentHelper.closestCommonAncestor($(centralElementSelector)));
            CUsArr = [];
            CUsArr.currentGroupingIndex = 0;
            buildCUsAroundCentralElement(centralElementSelector, $container, CUsArr);
        }
        else if ((firstSelector = CUsSpecifier.first) && (lastSelector = CUsSpecifier.last)) {

            CUsArr = [];
            var $firstsArray = $.map($(firstSelector).get(), getJQueryWrapper);

            // TODO: add a comment somewhere explaining how "first" and "last" work "smartly" (i.e. find the respective
            // ancestors first_ancestor and last_ancestor that are siblings and use those, selecting logically valid
            // entities.)
            if ($firstsArray.length) {
                var // these will correspond to CUsSpecifier.first and CUsSpecifier.last
                    $_first, $_last,

                //these will be the closest ancestors (self included) of $_first and $_last respectively, which are
                // siblings
                    $first, $last,

                    $closestCommonAncestor,
                    firstsArrLen = $firstsArray.length;

                var filterFirst = function(){
                    var $el = $(this);
                    return $el.is($_first) || $el.has($_first).length;
                };

                var filterLast = function(){
                    var $el = $(this);
                    return $el.is($_last) || $el.has($_last).length;
                };

                for (var i = 0; i < firstsArrLen; ++i) {
                    $_first = $firstsArray[i];
                    $_last = $_first.nextALL(lastSelector).first();

                    $closestCommonAncestor = $_first.parents().has($_last).first();

                    $first = $closestCommonAncestor.children().filter(filterFirst);
                    $last = $closestCommonAncestor.children().filter(filterLast);
                    CUsArr[i] = $first.add($first.nextUntil($last)).add($last);
                }
            }
        }

        // returning an empty array instead of undefined means accessing CUs_filtered[selectedCUIndex] (which
        // is done a lot) doesn't need to be prepended with a check against null in each case.
        return CUsArr || [];
    }

    // returns an array of CUs built around a "central element selector" (`buildCUAround` in urlDataMap)
    function buildCUsAroundCentralElement (centralElementSelector, $container, CUsArr) {

        //TODO: 1) rename child to sibling etc
        // 2) can `currentGroupingIndex` be named better?
        // 3) make more readable in general

        if (!$container || !$container.length) {
            return null;
        }

        if ($container.length > 1) {
            console.error("length of $container should not be more than 1");
        }

        var $siblings = $container.children();
        var siblingsLength = $siblings.length;

        if (siblingsLength) {

            var $currentSibling,
                firstCentralElementFound = false,
                num_centralElementsInCurrentSibling;

            for (var i = 0; i < siblingsLength; ++i) {
                $currentSibling = $siblings.eq(i);
                if ($currentSibling.is(centralElementSelector)) {
                    if (!firstCentralElementFound) {
                        firstCentralElementFound = true;
                    }
                    else {
                        ++CUsArr.currentGroupingIndex;
                    }
                    CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                }
                else if ((num_centralElementsInCurrentSibling = $currentSibling.find(centralElementSelector).length)) {
                    if (num_centralElementsInCurrentSibling === 1) {
                        if (!firstCentralElementFound) {
                            firstCentralElementFound = true;
                        }
                        else {
                            ++CUsArr.currentGroupingIndex;
                        }
                        CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                    }
                    else { // >= 2
                        if (!firstCentralElementFound) {
                            firstCentralElementFound = true;
                        }
                        else {
                            ++CUsArr.currentGroupingIndex;
                        }

                        buildCUsAroundCentralElement(centralElementSelector, $currentSibling, CUsArr);
                    }
                }
                else {
                    CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                }
            }
        }
        return CUsArr;
    }

    /* Returns true if all constituent elements of $CU1 are contained within (the constituents of) $CU2, false
     otherwise. (An element is considered to 'contain' itself and all its descendants)
     */
    function isCUContainedInAnother($CU1, $CU2) {

        var CU1Len = $CU1.length,
            CU2Len = $CU2.length;

        for (var i = 0; i < CU1Len; ++i) {

            var isThisConstituentContained = false; // assume

            for (var j = 0; j < CU2Len; ++j) {
                if ($CU2[j].contains($CU1[i])) {
                    isThisConstituentContained = true;
                    break;
                }
            }

            if (!isThisConstituentContained) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns true if $CU is not visible. It considers both
     * 1) whether it consumes any space in the layout
     * 2) the CSS 'visibility' property)
     * @param $CU
     * @returns {boolean|*}
     */
    function isCUInvisible($CU) {
        for (var i = 0; i < $CU.length; ++i) {
            var el = $CU.get(i);
            if (isElementVisible(el)) {
                return false;
            }
        }
        return true;
    }
//    function isCUInvisible($CU) {
//
//        // Returns true if all (top level) constituents of $CU have css 'visibility' style equal to "hidden"
//        var _isCUVisibilityHidden = function($CU) {
//            for (var i = 0; i < $CU.length; ++i) {
//                if ($CU.eq(i).css('visibility') !== "hidden") {
//                    return false;
//                }
//            }
//            return true;
//        };
//
//        return (!doesCUConsumeSpace($CU) && !$CU.hasClass('UnitsProj-HiddenByFiltering')) ||
//            _isCUVisibilityHidden($CU);
//    }
//
//    /***
//     * Returns true if $CU and all its children have height or width that is zero.
//     * Returns false if $CU or any of its children have a valid height/width (i.e. is(:visible)).
//     *
//     * Sometimes there are cases when $CU has no height or width, but its children do. For excluding a
//     * $CU, we make sure all its children are not visible.
//     * @param $CU
//     * @return {boolean}
//     */
//    function doesCUConsumeSpace($CU) {
//        if ($CU.is(':visible')) {
//            return true;    // if any (top level) element constituting the $CU is ':visible'
//        }
//
//        var allDescendants = $CU.find("*");
//
//        for (var i = 0; i < allDescendants.length; i++) {
//            var $element = allDescendants.eq(i);
//            if ($element.is(':visible')) {
//                return true;
//            }
//        }
//
//        return false;
//    }

    /**
     * process all CUs in CUsArr does the following
     1) remove any CU that is not visible in the DOM or is too small
     2) remove any CU that is fully contained within another
     */
    function processCUs(CUsArr) {

        if (!CUsArr || !CUsArr.length) {
            return;
        }

        var CUsArrLen = CUsArr.length,
            i;
        
        var removeCurrentCU = function() {
            CUsArr.splice(i, 1);
            --CUsArrLen;
            --i; 
        };

        for (i = 0; i < CUsArrLen; ++i) {
            var $CU = CUsArr[i];
            if (!$CU.hasClass('UnitsProj-HiddenByFiltering') && (isCUInvisible($CU) || isCUTooSmall($CU))) {
                removeCurrentCU();
                continue;
            }

            // reuse previously determined value if available (since CUs are re-determined on each DOM change)
            // (we don't do this for the visibility since that is something that might change. OTOH, a potential CU
            // found to be contained within another (and hence not deemed a CU) is something that isn't expected to change.
            var isContained = $CU.data('isContainedInAnother');
            if (isContained) {
                removeCurrentCU();
            }
            else if (isContained === false) {
                // nothing needs to be done if found to have been explicitly set to false
            }
            else {
                for (var j = 0; j < CUsArrLen; ++j) {

                    if (i === j) {
                        continue;
                    }

                    if (isCUContainedInAnother($CU, CUsArr[j])) {
                        removeCurrentCU();
                        $CU.data('isContainedInAnother', true);
                        break;
                    }
                    else {
                        $CU.data('isContainedInAnother', false);
                    }
                }
            }
        }
    }

    // helps ignore CUs that are too small (these are found on nytimes.com and some other websites)
    function isCUTooSmall($CU) {
        var rect = getBoundingRect($CU);
        return rect.width < 10 || rect.height < 10 || rect.width * rect.height < 400;
    }

    // Based on the header selector provided, this returns the *unusable space* at the top of the current view.
    // Only the part of the header below the view's top is considered. If there is more than one header found
    // we account for all of them.
    // If no header is found etc, 0 is returned;
    function getUnusableSpaceAtTopDueToHeader() {
        // ignore elements whose bottom is farther from the viewport top than this, because they are almost
        // certainly not header-like elements. This was done to check against the navigation pane that occurred
        // as a header on most tumblr blogs, but was placed as a footer on a certain blog. Refer issue #197.
        // In any case this is a sensible check to make on all pages
        var maxAllowedBottomFromTop = 300;

        if (!headerSelector) {
            return 0;
        }
        var $headers = $(headerSelector).filter(':visible'),
            headersLen = $headers.length,
            max = 0; // NOTE: start at 0, so don't consider anything above the viewport

        for (var i = 0; i < headersLen; ++i) {
            var rectBottomRelToViewport = $headers[i].getBoundingClientRect().bottom;
            if (rectBottomRelToViewport > max && rectBottomRelToViewport < maxAllowedBottomFromTop) {
                max = rectBottomRelToViewport;
            }
        }
        return max;
    }

    // handler for the mutation events triggered by the "fallback" mutation observer (defined in mod_mutationObserver.js)
    function onMutations_fallback() {

        if (mainContainer.scrollHeight !== mainContainer_prevScrollHeight ||
            mainContainer.scrollWidth !== mainContainer_prevScrollWidth) {

            mainContainer_prevScrollHeight = mainContainer.scrollHeight;
            mainContainer_prevScrollWidth = mainContainer.scrollWidth;

            var $selectedCU = CUs_filtered[selectedCUIndex];
            $selectedCU && showSelectedOverlay($selectedCU, true); // pass true to enforce redraw of non-CU page overlays
            handleBasedOnLastCUPosition();
        }

        else {
//            mod_contentHelper.filterOutUnneededMutations(mutations);
//        if (mutations.length) {
            delayed_updateCUsEtc_onMuts();
//        }
        }
    }

    function onSelectedCUTopLevelMuts() {
        // if selected CU has become invisible due to the mutations
        if (selectedCUIndex >= 0 && isCUInvisible(CUs_filtered[selectedCUIndex]) ) {
            updateCUsEtc_onMuts();
        }
        else {
            delayed_updateCUsEtc_onMuts();
        }
    }

    function updateOverlays_and_delayedUpdateCUs() {
        updateCUOverlays();
        delayed_updateCUsEtc_onMuts();
    }

    function handleBasedOnLastCUPosition() {
        if (isLastCUFullyInViewport()) {
            updateCUsEtc_onMuts(); // update CUs immediately in this case
        }
        else {
            updateOverlays_and_delayedUpdateCUs();
        }
    }

    // Calls `updateCUsEtc_onMuts` with a maximum delay of `maxDelay_nonImportantMuts`
    function delayed_updateCUsEtc_onMuts() {
        // compare explicitly with false, which is how we reset it
        if (timeout_updateCUs === false) {
            // In the following line, we restrict the minimum value of the timeout delay to
            // 0. This should not normally be required since negative delay is supposed to
            // have the same effect as a 0 delay. However, doing this fixes  #76 (Github).
            // This is mostly likely due to some quirk in Chrome.
            timeout_updateCUs = setTimeout(updateCUsEtc_onMuts, Math.max(0, maxDelay_nonImportantMuts -
                (Date.now() - lit_updateCUsEtc)));
        }
    }

    // updates CUs etc in response to a dom mutations
    function updateCUsEtc_onMuts() {
        if (timeout_updateCUs) {
            clearTimeout(timeout_updateCUs);
            timeout_updateCUs = false;    // reset
        }
        lit_updateCUsEtc = Date.now();
        updateCUsAndRelatedState();
    }

//    function setCommonCUsAncestor () {
//        if (!CUs_all || !CUs_all.length) {
//            $commonCUsAncestor = $body;  // body is chosen being a "safe" choice
//            return;
//        }
//        var topLevelCUElements = [],    // a collection of the top level elements of all CUs
//            CUsArrLen = CUs_all.length,
//            $CU;
//
//        for (var i = 0; i < CUsArrLen; ++i) {
//            $CU = CUs_all[i];
//            topLevelCUElements = topLevelCUElements.concat($CU.get());
//        }
//        $commonCUsAncestor = $(mod_contentHelper.closestCommonAncestor(topLevelCUElements));
//    }

    /**
     * Special handler for the escape key
     * On pressing Esc, deselect and dehover (without suppressing the event)
     */
    function onKeydown_Esc(e) {
        var code = e.which || e.keyCode,
            hasModifier = e.altKey || e.ctrlKey|| e.metaKey || e.shiftKey;

        if (code === 27 && !hasModifier) { // ESC
            deselectCU();
            dehoverCU();
        }
    }

// handler for whenever an element on the page receives focus
// (and thereby a handler for focus-change events)
    function onFocus(e) {
        var enclosingCUIndex = getEnclosingCUIndex(e.target);
        if (enclosingCUIndex >= 0 && enclosingCUIndex !== selectedCUIndex) {
            selectCU(enclosingCUIndex, false);
        }
    }

//    function onMouseWheel (e) {
//        // don't do this on macs for now. can make two finger scrolling problematic if the setting "tap to click"
//        // is on. (because then, then a two finger tap becomes right click.)
//        if (!isMac) {
//            if (rtMouseBtnDown) {
//                var wheelDirection = e.wheelDelta || e.wheelDeltaY || (-e.detail); // -ve will indicate down, +ve up
//                if (wheelDirection) {
//
//                    e.preventDefault();
//                    scrolledWithRtMouseBtn = true;
//
//                    if (wheelDirection < 0) {
//                        selectNext();
//                    }
//                    else  {
//                        selectPrev();
//                    }
//                }
//            }
//        }
//    }

    /* If the active element is already inside the selected CU, then do nothing.
     Else focus the main element of the selected CU.
     (This exists so that when a CU is selected using a mouse click, we can select its main element,
     if the mouse click itself did not lead to an element within the CU getting selected (like an input box)
     */
    function focusMainElelementInSelectedCU_ifRequired() {
        var activeEl = document.activeElement,
            indexOf_CUContainingActiveEl = getEnclosingCUIndex(activeEl);

        if (indexOf_CUContainingActiveEl !== selectedCUIndex) {
            var savedScrollPos = window.pageYOffset;
            focusMainElement(CUs_filtered[selectedCUIndex]);
            window.pageYOffset = savedScrollPos;
        }
    }

    /**
     * Dispatch mouseover (if specified in urlData) on particular element in the selected CU. The element selector (to
     * mouseover on) is specified in urlData.
     * @param $CU
     */
    function mouseoverInSelectedCU_ifRequired($CU) {
        var mouseoverOnCUSelection, mouseoverEl;
        if (CUsSpecifier && (mouseoverOnCUSelection = CUsSpecifier.mouseoverOnCUSelection)) {

            // If mouseoverOnCUSelection is explicitly set to true, then mouseover on $CU[0]
            if (mouseoverOnCUSelection === true) {
                mouseoverEl = $CU[0];
            }
            // Else, use mouseoverOnCUSelection as selector for the element (inside CU) to mouseover on
            else {
                mouseoverEl = $CU.find(mouseoverOnCUSelection)[0];
            }

            mouseoverEl && mod_contentHelper.dispatchMouseOver(mouseoverEl);
        }
    }

    function onLtMouseBtnDown(e) {
        // first update the following global variables
//        ltMouseBtnDown = true;

        // if clicked element is not part of UnitsProj's UI (i.e. we can assume it is part of the page),
        // select its enclosing CU (or deselect the selected CU if no enclosing CU is found).
        // This check is especially required to ensure selected CU does not get deselected when
        // closing the filtering UI using a mouse click.
        if (!mod_contentHelper.isUnitsProjNode(e.target)) {
            var indexToSelect;

            if (selectedCUIndex >= 0 && mod_contentHelper.elemContainsPoint($selectedCUOverlay, e.pageX, e.pageY)) {
                return;  // do nothing
            }
            else  if (hoveredCUIndex >= 0 && mod_contentHelper.elemContainsPoint($hoveredCUOverlay, e.pageX, e.pageY)) {
                indexToSelect = hoveredCUIndex;
            }
            else {
                indexToSelect = getEnclosingCUIndex(e.target);
            }

            if (indexToSelect >= 0) {
                selectCU(indexToSelect, false, false);

                // delay = 0 to yield execution, so that this executes after the click event is processed.
                // We need the clicked-on element to get focus before executing this.
                setTimeout(focusMainElelementInSelectedCU_ifRequired, 0);
            }
            else {
                deselectCU(); // since the user clicked at a point not lying inside any CU, deselect any selected CU
            }
        }
    }

    function onRtMouseBtnDown() {
        rtMouseBtnDown = true;
    }

    // TODO: describe this in documentation if the feature is deemed useful
    function onContextMenu(e) {

        if (scrolledWithRtMouseBtn) {
            e.preventDefault();
        }
    }

    function onMouseDown (e) {

        if (mod_contentHelper.isRtMouseButton(e)) {
            return onRtMouseBtnDown();
        }
        else {
            return onLtMouseBtnDown(e);
        }
    }

    function onMouseUp(e) {

        if (mod_contentHelper.isRtMouseButton(e)) {

            rtMouseBtnDown = false;

            setTimeout(function() {
                // use a small timeout so that we don't change value before onContextMenu runs
                scrolledWithRtMouseBtn = false;
            },100);
        }
//        else {
//            ltMouseBtnDown = false;
//        }
    }

    // function to be called once the user pauses mouse movement, and
    // hence likely actually *intends* to hover over an element
    function onMouseMovePause() {
        // Don't need to do anything if CU under the mouse already already has the hovered-over overlay
        // (OR if it has the selected overlay, in keeping with the Note titled **Note on the hovered-over
        // CU overlay**)
        if (hoveredCUIndex >= 0 && mod_contentHelper.elemContainsPoint($hoveredCUOverlay, mouseX, mouseY) ||
            selectedCUIndex >= 0 && mod_contentHelper.elemContainsPoint($selectedCUOverlay, mouseX, mouseY)) {
            return ;
        }

        var CUIndex = getEnclosingCUIndex(elemUnderMouse);
        if (CUIndex >= 0) {
            hoverCU(CUIndex);
        }
    }

    function onMouseMove(e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
        elemUnderMouse = e.target;

        // to check against inadvertent events that fire simply due to the page scroll
        if (e.screenX !== mouseScreenX || e.screenY !== mouseScreenY) {
            mouseScreenX = e.screenX;
            mouseScreenY = e.screenY;
            clearTimeout(timeout_onMouseMovePause);
            timeout_onMouseMovePause = setTimeout(onMouseMovePause, 100);
        }
    }

    function onMouseOut(e) {
        // upon any mouseout event, if a hovered overlay exists and the mouse pointer is found not be
        // contained within it, call dehover()
        // (NOTE: since the hovered overlay has pointer-events: none, we are unable to receive a
        // mouseout event on the hovered overlay itself. TODO: "pointer-events: stroke"; didn't
        // seem to allow doing that either -- documentation says SVG only, what does that mean?)
        if (hoveredCUIndex >= 0 &&
            !mod_contentHelper.elemContainsPoint($hoveredCUOverlay, e.pageX, e.pageY)) {

            dehoverCU();
        }
    }

    // Sets up binding for the tab key such that if a CU is selected, and there is no focused (active) element on
    // the page, the "main" element of the selected CU should get focused.
    function bindTabKey() {

        var isContextApplicable = function() {
            var activeEl = document.activeElement || document.body;
            return CUs_filtered[selectedCUIndex] && (activeEl === document.body);
        };

        mod_keyboardLib.bind(['tab', 'shift+tab'], function() {focusMainElement(CUs_filtered[selectedCUIndex]);},
            isContextApplicable);
    }

    function setupScrollEventHandler() {
       $window.on('scroll', onWindowScroll);
    }
    function resetScrollEventHandler() {
       $window.off('scroll', onWindowScroll);
    }

    function setupEvents() {
        bindTabKey();

        // To update CUs shortly after a 'click' (activation) event, to handle any possible dom changes etc.
        // This includes cases where we programmatically click a link (or action unit).
        // NOTE: Additionally, the 'click' event is triggered in response to invoking 'enter' or 'space' on a
        // an "activatable" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', function () {setTimeout(updateCUsAndRelatedState, 300);}, true);
        
        mod_domEvents.addEventListener(document, 'mousedown', onMouseDown, true);
        mod_domEvents.addEventListener(document, 'mouseup', onMouseUp, true);
        mod_domEvents.addEventListener(document, 'mousemove', onMouseMove, true);
        mod_domEvents.addEventListener(document, 'mouseout', onMouseOut, true);
        mod_domEvents.addEventListener(document, 'contextmenu', onContextMenu, true);

        // event handlers for scroll commented out for now. not that useful + might be a bad idea performance-wise
//        mod_domEvents.addEventListener(document, 'DOMMouseScroll', onMouseWheel, false); // for gecko
//        mod_domEvents.addEventListener(document, 'mousewheel', onMouseWheel, false);   // for webkit

        // Need to specify 'true' below (for capturing phase) for google search (boo!)
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_Esc, true);

       $window.on('resize', function() {
            updateSelectedOverlay();
            dehoverCU();
        });

        setupScrollEventHandler();

        // Specifying 'focus' as the event name below doesn't work if a filtering selector is not specified
        // However, 'focusin' behaves as expected in either case.
        $document.on('focusin', CONSTS.focusablesSelector, onFocus);

        setupShortcuts();
    }

    function setupShortcuts() {
        // the "if" condition below is redundant since this check is made when the CUsMgr module is being setup, but
        // it's being left here since it would be if useful this code was moved out of this module
        if (expandedUrlData && expandedUrlData.CUs_specifier) {
            mod_keyboardLib.bind(CUsShortcuts.smartScrollDown.kbdShortcuts, smartScrollDown, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollUp.kbdShortcuts, smartScrollUp, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollRight.kbdShortcuts, smartScrollRight, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollLeft.kbdShortcuts, smartScrollLeft, {pageHasCUs: true});

            mod_keyboardLib.bind(CUsShortcuts.selectCUDown.kbdShortcuts, selectCUDown, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCUUp.kbdShortcuts, selectCUUp, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCURight.kbdShortcuts, selectCURight, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCULeft.kbdShortcuts, selectCULeft, {pageHasCUs: true});

            mod_keyboardLib.bind(CUsShortcuts.selectFirstCU.kbdShortcuts, function() {
                selectFirst(true, true);
            }, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectLastCU.kbdShortcuts, function() {
                selectLast(true, true);
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['=', '+'], function() {
                changeSpotlightOnSelecteCU('increase');
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['-'], function() {
                changeSpotlightOnSelecteCU('decrease');
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['0'], function() {
                changeSpotlightOnSelecteCU('default');
            }, {pageHasCUs: true});

        }
    }

    function isLastCUFullyInViewport() {
        return ( CUs_filtered.length === 0) || isCUFullyInViewport(CUs_filtered[CUs_filtered.length-1]);
    }

    // returns true if any part of $CU is in the viewport, false otherwise.
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function isAnyPartOfCUinViewport($CU, CUBoundingRect) {
        var boundingRect = CUBoundingRect || getBoundingRect($CU),
            CUTop = boundingRect.top,
            CUBottom = CUTop + boundingRect.height,

            winTop = window.pageYOffset, // window.scrollY, //body.scrollTop,
            winBottom = winTop + window.innerHeight;

        return CUTop <= winBottom && CUBottom >= winTop;
    }

    // returns true if the specified CU is completely in the viewport, false otherwise
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function isCUFullyInViewport($CU, CUBoundingRect) {
        var boundingRect = CUBoundingRect || getBoundingRect($CU),
            CUTop = boundingRect.top,
            CUBottom = CUTop + boundingRect.height,
            winTop = window.pageYOffset, //window.scrollY, //body.scrollTop,
            winBottom = winTop + window.innerHeight;

        return CUTop >= winTop && CUBottom <= winBottom;
    }

    function changeFontSize($jQuerySet, isBeingIncreased) {
        if (!$jQuerySet || !$jQuerySet.length) {
            return;
        }

        for (var i = 0; i < $jQuerySet.length; i++) {
            var $el = $jQuerySet.eq(i);
            var font = $el.css('font-size');
            var numericVal = parseFloat(font);
            var CU = font.substring(numericVal.toString().length);

            var newNumericVal = isBeingIncreased?(numericVal+2): (numericVal-2);
            $el.css('font-size', newNumericVal+CU);

        }
    }
    function increaseFont($jQuerySet) {
        changeFontSize($jQuerySet, true);
    }

    function decreaseFont($jQuerySet) {
        changeFontSize($jQuerySet, false);
    }

    function getAllCUs() {
        return CUs_all;
    }

    return thisModule;

})(jQuery, _u.mod_basicPageUtils, _u.mod_domEvents, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.mod_filterCUs,
        _u.mod_help, _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_globals,
        _u.mod_directionalNav, _u.mod_smoothScroll, _u.CONSTS);



;// Allows downward scroll using space key, and upward scroll using either shift+space or the "thumb-modifier" key,
// i.e. the cmd key in Mac and alt key elsewhere.
// Scrolling is done CU-by-CU if the page has CUs, else normally.
// Cmd/Alt is a modifier key and Space is treated as a special modifier elsewhere in this
// extension. For this reason, we can use them for scrolling action only on *keyup*, if they
// were *not* used as modifiers.
// However, for quick repeated scrolling, the thumb-modifier/space key can be
// tapped twice in quick succession, without releasing it after pressing it down the second
// time.
_u.mod_easyScrollKeys = (function(mod_CUsMgr, mod_basicPageUtils, mod_keyboardLib, mod_domEvents) {

    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        isSpaceDown,
        isThumbModifierDown,
        isShiftDown,
        wasThumbModifierUsedAsModifier,
        interval_repeatedScroll,
        lastSpaceUpTime,
        lastThumbModifierUpTime,
        lastSpaceDownTime,
        lastThumbModifierDownTime,
        doubleTapPeriod = 400,
        now,
        // scroll/select CU on key-up only if the thumb modifier or space is held down for less than this time
        // (to reduce accidental triggering)
        maxKeyDownTime = 400;

    function setup() {
        lastSpaceUpTime = lastThumbModifierUpTime = lastSpaceDownTime = lastThumbModifierDownTime = 0;
        mod_domEvents.addEventListener(document, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode === 16) { // 16 - shift
                isShiftDown = true;
            }
//            // check if this is the "thumb" modifier key (93 - right cmd, 18 - alt)
//            else if (isMac? (keyCode === 93 || keyCode === 91): (keyCode === 18)) {
//                wasThumbModifierUsedAsModifier = false; // reset
//                isThumbModifierDown = true;
//                lastThumbModifierDownTime = now = Date.now();
//                if (interval_repeatedScroll === false && now - lastThumbModifierUpTime < doubleTapPeriod) {
//                    startRepeatedScroll('up');
//                }
//            }
//            // some other key pressed while thumb modifier is down
//            else if (isThumbModifierDown) {
//                wasThumbModifierUsedAsModifier = true;
//                endRepeatedScroll();
//            }
        }, true);

        mod_domEvents.addEventListener(document, 'keyup', function(e) {
            endRepeatedScroll();    // end any on-going repeated scroll
            var keyCode = e.which || e.keyCode;
            if (keyCode === 16) { // 16 - shift
                isShiftDown = false;
            }
            else if (keyCode === 32) { // 32 - space
                isSpaceDown = false;
                lastSpaceUpTime = now = Date.now();
                if (now - lastSpaceDownTime < maxKeyDownTime &&
                    mod_keyboardLib.canIgnoreSpaceOnElement(e.target) && !mod_keyboardLib.wasSpaceUsedAsModifier()) {

                    // select downward CU or scroll down if no CUs
                    mod_CUsMgr.selectNextCUOrScroll(isShiftDown? 'up': 'down');
                }
            }
            // check if this is the "thumb" modifier key (91, 93 - cmd, 18 - alt)
//            if (isMac? (keyCode === 93 || keyCode === 91): (keyCode === 18)) {
//                lastThumbModifierUpTime = now = Date.now();
//                isThumbModifierDown = false;
//                if (now - lastThumbModifierDownTime < maxKeyDownTime && !wasThumbModifierUsedAsModifier) {
//                    // select upward CU or scroll up if no CUs
//                    mod_CUsMgr.selectNextCUOrScroll('up');
//                }
//            }
        }, true);

        // we need to listen to this event since the space-keydown event is suppressed by the
        // keyboard library
        thisModule.listenTo(mod_keyboardLib, 'space-down-ignored', function() {
            if (!isSpaceDown) {
                isSpaceDown = true;
                lastSpaceDownTime =  now = Date.now();
                if (interval_repeatedScroll === false && now - lastSpaceUpTime < doubleTapPeriod) {
                    startRepeatedScroll(isShiftDown? 'up': 'down');
                }
            }
        });

        thisModule.listenTo(mod_keyboardLib, 'space-used-as-modifier', endRepeatedScroll);

//        // the following is required to fix the issue of inadvertent scroll-ups ups on the thumb-modifier
//        // key's keyup, when thumb modifier is involved in a keyboard shortcut (like cmd + <key>) to change
//        // tabs
//        chrome.runtime.onMessage.addListener(
//            function(request, sender, sendResponse) {
//                if (request.message === "tabActivated" || request.message === "tabDeactivated") {
//                    wasThumbModifierUsedAsModifier = true;
//                    endRepeatedScroll();
//                }
//            }
//        );
    }

    // starts a repeated scroll in the specified direction
    function startRepeatedScroll(direction) {
        endRepeatedScroll();
        interval_repeatedScroll = setInterval(function(){
            mod_CUsMgr.selectNextCUOrScroll(direction);
        }, 100);
    }

    // end any on-going repeated scroll started by startRepeatedScroll()
    function endRepeatedScroll() {
        clearInterval(interval_repeatedScroll);
        interval_repeatedScroll = false;
    }

    return thisModule;

})(_u.mod_CUsMgr, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_domEvents);

;/**
 * This module sets up shortcuts that are based on the urlData (specified in urlDataMap.js) -- both for CUs and the
 * overall page
 */
_u.mod_urlSpecificShortcuts = (function($, mod_keyboardLib, mod_CUsMgr, mod_commonHelper, mod_contentHelper){
    "use strict";

    var thisModule = {
        setup: setup
    };

    var expandedUrlData,
        $document = $(document);

    function setup(settings) {
        expandedUrlData = settings.expandedUrlData;

        if (expandedUrlData) {
            setupUrlDataShortcuts('CUs'); // shortcuts for CUs
            setupUrlDataShortcuts('page'); // shortcuts for the rest of the page
        }

    }


    /**
     * Sets up the shortcuts specified. Can be used to setup either page-specific or CU-specific shortcuts depending on
     * whether the 'scope' passed is "page" or 'CUs'.
     * @param scope
     */
    function setupUrlDataShortcuts(scope) {
        setupSUsShortcuts(scope);
        setupActionShortcuts(scope);
    }

    function setupSUsShortcuts(scope) {
        var SUs;
        if (scope === 'CUs') {
            SUs = expandedUrlData.CUs_SUs;
        }
        else {
            SUs = expandedUrlData.page_SUs;
        }
        if (SUs) {
            for (var key in SUs) {
                if (SUs.hasOwnProperty(key)) {
                    var SU = SUs[key],
                        selectors = SU.selector,
                        kbdShortcuts = SU.kbdShortcuts;

                    if (selectors && kbdShortcuts) {
                        mod_keyboardLib.bind(kbdShortcuts, accessSU.bind(null, selectors, scope),
                            scope === 'CUs'? {CUSelected: true}: undefined);
                    }
                }
            }
        }
    }

    function setupActionShortcuts(scope) {
        var actions;
        if (scope === 'CUs') {
            actions = expandedUrlData.CUs_actions;
        }
        else {
            actions = expandedUrlData.page_actions;
        }
        if (actions) {
            for (var key in actions) {
                if (actions.hasOwnProperty(key)) {
                    var action = actions[key],
                        fn = action.fn,
                        kbdShortcuts = action.kbdShortcuts;
                    if (typeof fn === "function" && kbdShortcuts) {
                        mod_keyboardLib.bind(kbdShortcuts, invokeAction.bind(null, fn, scope),
                            scope === 'CUs'? {CUSelected: true}: undefined);
                    }
                }
            }
        }
    }
    function invokeAction (fn, scope) {
        var $selectedCU = mod_CUsMgr.$getSelectedCU() ;
        if (scope === 'CUs' && !$selectedCU) {
            return;
        }
        var urlDataDeepCopy =  $.extend(true, {}, expandedUrlData);
        fn($selectedCU, document, urlDataDeepCopy);
    }

    /**
     *
     * @param selectors
     * @param {string} scope Can be either "page" or 'CUs'
     */
    function accessSU(selectors, scope) {
        var $scope;

        if (scope === 'CUs') {
            $scope =  mod_CUsMgr.$getSelectedCU() ;
        }
        else  {
            $scope = $document;
        }
        if ($scope) {
            if (typeof selectors === 'string' ) {
                selectors = [selectors];
            }
            (function invokeSequentialClicks (selectorsArr) {
                if (selectorsArr.length) {
                    mod_commonHelper.executeWhenConditionMet(
                        function() {

                            var el = $scope.find(selectorsArr[0]+':visible')[0]; // The ':visible' selector appended
                            // because of an issue on Quora. There were some invisible elements present in a CU which had
                            // the same class as the valid SU.

                            // We first mouseover on the element and then click.
                            // This is a fix for #25: On Quora, keyboard shortcuts are not working properly for some
                            // links. It works better if we give the mouseover event to the element before clicking it.

                            mod_contentHelper.dispatchMouseOver(el);
                            el.click();

                            selectorsArr.splice(0, 1);
                            invokeSequentialClicks(selectorsArr);
                        },
                        function() {
                            return $scope.find(selectorsArr[0]+':visible').length;
                        },
                        2000
                    );
                }
            })(selectors);
        }
    }

    return thisModule;

})(jQuery, _u.mod_keyboardLib, _u.mod_CUsMgr, _u.mod_commonHelper, _u.mod_contentHelper);
;
_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_directionalNav, mod_keyboardLib, mod_globals, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document),
        $window = $(window),
        class_unitsProjElem = CONSTS.class_unitsProjElem,
        class_hint = 'UnitsProj-hintLabel',                     // class for all hint labels
        class_hintVisible = 'UnitsProj-hintLabel-visible',      // class applied to make a hint label visible,
        hintsEnabled,
        hintInputStr_upperCase,

        // arrays of spans showing hints (dom elements)
        hintSpans_singleDigit = [],
        hintSpans_doubleDigit = [],
        timeout_removeHints,
        timeout_blurDummyTextbox,
        timeoutPeriod = 4000;

    // vars related to hint chars 
    var reducedSet = "jkdhglsurieytnvmbc",// easiest to press keys (roughly in order), exluding 'f'
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase();

    // This is used to group the all the hint label spans within a common parent
    var $hintsContainer = $("<div></div>")
        .addClass('UnitsProj-hintsContainer')
        .addClass(class_unitsProjElem)
        .hide()
        .appendTo(_u.$topLevelContainer);

    // "dummy" text box (based on css styling) used to get "match-char" input (input on this triggers onMatchCharInput(),
    // see it's documentation)
    var $dummyTextBox = $('<input type = "text">')
        .addClass(class_unitsProjElem)
        .addClass('UnitsProj-dummyInput')
        .attr('tabindex', -1)
        .hide()
        .appendTo(_u.$topLevelContainer);

    function reset() {
        removeHints();
    }

    function setup() {
        reset();
        mod_domEvents.addEventListener(document, 'keydown', onKeyDown, true);
        mod_domEvents.addEventListener($dummyTextBox[0], 'blur', onDummyTextBoxBlur, true);

        $dummyTextBox.on('input', onDummyTextBoxInput );
    }

    function onHintInput(character) {
        hintInputStr_upperCase += character.toUpperCase();

        var elem_exactMatch = null,
            partialMatches = [],
            $assignedHintSpans = $('.' + class_hintVisible);
            
        var len = $assignedHintSpans.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = $assignedHintSpans[i],
                elem = $(hintSpan).data('element');

            var elemHint_upperCase = hintSpan.innerText;
            if (elemHint_upperCase.substring(0, hintInputStr_upperCase.length) === hintInputStr_upperCase) {
                partialMatches.push(elem);
                if (elemHint_upperCase === hintInputStr_upperCase) {
                    elem_exactMatch = elem;
                    break;
                }
            }
            else {
                hintSpan.classList.remove(class_hintVisible);
            }
        }

        // exact match
        if (elem_exactMatch) {
            elem_exactMatch.focus();
            removeHints();
        }
        // no match
        else if (!partialMatches.length) {
            removeHints();
        }
        // partial match
        else {
            // reset the timeout
            clearTimeout(timeout_removeHints);
            timeout_removeHints = setTimeout(removeHints, timeoutPeriod);
        }
    }

    function removeHints() {
        $hintsContainer.hide();
        $('.' + class_hintVisible).removeClass(class_hintVisible);
        hintsEnabled = mod_globals.hintsEnabled = false;

        // event is unbound when hints are removed since there is no need to track the 'scroll' event continuously
        $window.off('resize scroll', onViewportChange);
        clearTimeout(timeout_removeHints);

    }
    
    function showHints($matchingElems) {
        // Call removeHints() for cases where showHints() is called consecutively
        // without removeHints() being called in between (clears existing
        // timeout + unbinds bound event + generally resets state)
        removeHints();
        _assignHints($matchingElems);
        $hintsContainer.show();

        hintInputStr_upperCase = "";
        hintsEnabled = mod_globals.hintsEnabled = true;

        $window.on('resize scroll', onViewportChange);
        timeout_removeHints = setTimeout(removeHints, timeoutPeriod);
    }

    function onViewportChange() {
        removeHints();
    }

    function onKeyDown(e) {
        var keyCode = e.which || e.keyCode || e.charCode;
        var target = e.target;

        // some (other) key pressed while [space] was already pressed down with the focus being
        // on a non-input type element
        if (keyCode !== 32 && mod_keyboardLib.canUseSpaceAsModfier()) { // 32 - space

            // if one of the arrow keys was pressed:
            // space+left OR space+shift+H
            if (keyCode === 37 || e.shiftKey && keyCode === 72) {
                selectNextFocusable('left');
                mod_contentHelper.suppressEvent(e);
            }
            // space+up OR space+shift+K
            else if (keyCode === 38 || e.shiftKey && keyCode === 75) {
                selectNextFocusable('up');
                mod_contentHelper.suppressEvent(e);
            }
            // space+right OR space+shift+L
            else if (keyCode === 39 || e.shiftKey && keyCode === 76) {
                selectNextFocusable('right');
                mod_contentHelper.suppressEvent(e);
            }
            // space+down OR space+shift+J
            else if (keyCode === 40 || e.shiftKey && keyCode === 74) {
                selectNextFocusable('down');
                mod_contentHelper.suppressEvent(e);
            }

            // some other NON-SHIFT key was pressed
            else if (keyCode != 16) {

                // Focus the dummy text box. And stop the event from propagating, but don't
                // prevent it's default action, so that it enters text into the text box.
                // This lets us give focus to the dummy text box just-in-time (i.e. when the
                // <char> is pressed after pressing space, and not at the keydown of space
                // itself. This is nicer for a couple of reasons:
                // 1) it doesn't take away focus from the active element till as late as
                // possible, and if the user decides to not press anything after pressing
                // space, the focus will remain where it was.
                // 2) this will be make it easier to implement in the future a feature where
                // if the user presses space without pressing anything else the document is
                // scrolled down by a page (like the default browser behavior which gets broken
                // due to this feature)
                focusDummyTextBoxAndRemoveHints();
                e.stopImmediatePropagation();
            }
        }
        // 'f' pressed. focus dummy text box so that the next char entered triggers onMatchCharInput
        else if (String.fromCharCode(keyCode).toLowerCase() === "f" &&
            !(e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) &&
            (mod_contentHelper.elemAllowsSingleKeyShortcut(target))) {

            mod_contentHelper.suppressEvent(e);
            focusDummyTextBoxAndRemoveHints();
            clearTimeout(timeout_blurDummyTextbox);
            timeout_blurDummyTextbox = setTimeout(function() {
                blurDummyTextBox();
            }, timeoutPeriod);
        }
        else if (hintsEnabled) {
            // These modifiers are not required (or expected) to be pressed, so exclude keydown events having them
            if (!(e.ctrlKey || e.altKey || e.metaKey)) {
                mod_contentHelper.suppressEvent(e);
                if (e.which === 27) { // 27 - Esc
                    removeHints();
                }
                else {
                    onHintInput(String.fromCharCode(e.which || e.keyCode));
                }
            }
        }
    }

    function focusDummyTextBoxAndRemoveHints() {
        $dummyTextBox.val('').show().focus();
        removeHints();
    }

    // We read input off of this dummy element to determine the actual character
    // entered by the user (as opposed to the key pressed down) even while binding
    // to the 'keydown' event for input rather than 'keypress' (refer: #144)
    function onDummyTextBoxInput () {
        var input = $dummyTextBox.val();
        input = input[input.length - 1]; // consider only the last char typed in case there is more than one
        var char_lowerCase = input.trim().toLowerCase(); // for case insensitive matching
        char_lowerCase && onMatchCharInput(char_lowerCase);
        blurDummyTextBox();
    }

    // This map allows us to determine the char that would be typed had
    // shift been pressed along with a key. This only works for the
    // standard US keyboard, but since it's required only for an optional
    // feature, it's ok.
    var stdUSKbdShiftMap = {
        '`': '~',
        '1': '!',
        '2': '@',
        '3': '#',
        '4': '$',
        '5': '%',
        '6': '^',
        '7': '&',
        '8': '*',
        '9': '(',
        '0': ')',
        '-': '_',
        '=': '+',
        '[': '{',
        ']': '}',
        '\\': '|',
        ';': ':',
        '\'': '"',
        ',': '<',
        '.': '.',
        '/': '?'
    };

    // Handler for when a "match-char" is input by the user
    // A match-char refers to a character typed to match
    // links starting with it, etc.
    function onMatchCharInput(matchChar_lowerCase) {
        removeHints();  // first remove any existing hints
        var $elemsInViewport = $getFocusablesInViewport(),
            $matchingElems;

        // space + '.' targets all links without any alphabetic text, considering only the innerText
        // and the element's 'value' (but ignoring the placeholder text, so that an element with nothing
        // but placeholder text *will* also get matched, for better usability]
        if (matchChar_lowerCase === '.') {
            $matchingElems = $elemsInViewport.filter(function() {
                var elemText = getElementText(this, true);  // true - placeholder text be ignored
                return !(elemText && elemText.match(/[a-zA-Z]/));
            });
        }

        // space + '/' targets all links
        else if (matchChar_lowerCase === '/') {
            $matchingElems = $elemsInViewport;
        }

        // space + <char> targets all links starting with <char>
        // Actually, for increased usability, this targets all links
        // whose first letter, digit or special symbol is <char>
        // E.g: a link with the text "-3 AAPL" (without the quotes) will be
        // matched if <char> is either 'a' (case insensitive), or '-', or '3']
        // Additionally, if the "match-char" corresponds to a key pressed without
        // shift, we also use for matching the char that would be typed if
        // shift had been pressed as well (based on `stdUSKbdShiftMap`)
        else {
            $matchingElems = $elemsInViewport.filter(function() {
                var text_lowerCase = getElementText(this).toLowerCase(),
                linkChars = [];

                /* TODO: need to support unicode letters, digits, symbols. JS regex
                   does not have unicode support built in. Useful resources at
                   http://stackoverflow.com/questions/280712/javascript-unicode
                   Close #147 when this is done
                 */
                var letter = text_lowerCase.match(/[a-z]/),
                    digit = text_lowerCase.match(/\d/),
                    symbol = text_lowerCase.match(/[^\da-z ]/); // not digit, a-z, or space

                letter && linkChars.push(letter[0]); // if there is a match, String.match returns an array
                digit && linkChars.push(digit[0]);
                symbol && linkChars.push(symbol[0]);

                // especially since we don't support unicode yet, it's useful to ensure that
                // the first character of the (trimmed) text is always included in linChars.
                // In any case, there is no harm even if it gets included twice.
                linkChars.push(text_lowerCase[0]);

                var matchChars = [matchChar_lowerCase],
                    shiftUpChar = stdUSKbdShiftMap[matchChar_lowerCase];
                
                shiftUpChar && matchChars.push(shiftUpChar);

                for (var i = 0; i < linkChars.length; i++) {
                    var char1 = linkChars[i];
                    for (var j = 0; j < matchChars.length; j++) {
                        var char2 = matchChars[j];
                        if (char1 === char2) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }

        if ($matchingElems.length) {
            if ($matchingElems.length === 1) {
                $matchingElems.focus();
            }
            else {
                showHints($matchingElems);
            }
        }
    }

    // meant to be called from within showHints()
    function _assignHints($matchingElems) {
        // generate the hint spans and put them in the DOM if not done yet
        if (!hintSpans_singleDigit.length) {
            generateHintSpansInDom();
        }

        $('.' + class_hintVisible).removeClass(class_hintVisible);

        var hintSpansToUse;
        hintSpansToUse = $matchingElems.length <= hintSpans_singleDigit.length?
            hintSpans_singleDigit: hintSpans_doubleDigit;

        // Note: If the extremely unlikely scenario that the current *viewport* has more matching links than
        // `hintSpans_doubleDigit.length`, we ignore links beyond that count, i.e. these links won't get a hint
        var len = Math.min($matchingElems.length, hintSpansToUse.length);
        for (var i = 0; i < len; i++) {
            var el = $matchingElems[i];
            var hintSpan = hintSpansToUse[i];
            hintSpan.classList.add(class_hintVisible);

            var viewportOffset = el.getBoundingClientRect();
            hintSpan.style.top = viewportOffset.top + "px";
            hintSpan.style.left = viewportOffset.left + Math.min(20, Math.round(el.offsetWidth/2)) + "px";
            $(hintSpan).data('element', el);
        }
    }

    // gets hints based on hintCharsStr
    function getHints(hintCharsStr) {
        var singleDigitHints = hintCharsStr.split(''),
            doubleDigitHints = [],
            len = singleDigitHints.length,
            count = -1;

        for (var i = 0; i < len; ++i) {
            for (var j = 0; j < len; ++j) {
                // [j] + [i] instead of [i] + [j] so that the the first character
                // of neighbouring double digit hints is scattered (which is nicer)
                doubleDigitHints[++count] = singleDigitHints[j] + singleDigitHints[i];
            }
        }
        return {singleDigit: singleDigitHints, doubleDigit: doubleDigitHints};
    }

    function generateHintSpansInDom() {
        var hints = getHints(hintCharsStr);

        hintSpans_singleDigit = getHintSpans(hints.singleDigit);
        hintSpans_doubleDigit = getHintSpans(hints.doubleDigit);

        $hintsContainer.empty();
        $hintsContainer.append(hintSpans_singleDigit);
        $hintsContainer.append(hintSpans_doubleDigit);
    }

    function getHintSpans(hintsArr) {
        var hintSpans = [];
        var len = hintsArr.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = document.createElement('span');
            hintSpan.innerText = hintsArr[i];
            hintSpan.classList.add(class_hint);
            hintSpans[i] = hintSpan;
        }
        return hintSpans;
    }

    // returns all link elements + other input-type elements
    function $getAllLinkLikeElems($scope) {
        $scope || ($scope = $document);
        return $scope.find(CONSTS.focusablesSelector);
    }

    function getElementText(el, ignorePlaceholderText) {
        var innerText = mod_contentHelper.getVisibleInnerText(el);

        return (
            innerText? innerText: (
                el.value? el.value:
                    (!ignorePlaceholderText && el.placeholder? el.placeholder: "")
                )
            ).trim();
    }

    function $getFocusablesInViewport() {
        return $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });
    }

    function isAnyPartOfElementInViewport(el) {
        var offset = $(el).offset();
        var top = offset.top;
        var left = offset.left;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        return (top < (window.scrollY + window.innerHeight)) &&     // elTop < winBottom
            ((top + height) > window.scrollY) &&                    // elBottom > winTop
            (left < (window.scrollX + window.innerWidth)) &&        // elLeft < winRight
            ((left + width) > window.scrollX);                      // elRight > winLeft
    }

    // note: this function will result in onDummyTextBoxBlur() getting called as well
    function blurDummyTextBox() {
        $dummyTextBox[0].blur();
        // in case the above doesn't work (on old browsers?)
        if (document.activeElement === $dummyTextBox[0]) {
            document.body.focus();
        }
    }

    function onDummyTextBoxBlur() {
        $dummyTextBox[0].value = '';
        clearTimeout(timeout_blurDummyTextbox);
    }

    function selectNextFocusable(direction) {
        var elems = $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this));
        });
        var activeEl = document.activeElement;
        // if active element is not in the viewport, focus first element in the viewport
        if (!activeEl || activeEl === document.body) {
            var len = elems.length;
            for (var i = 0; i < len; i++) {
                var elem = elems[i];
                if(isAnyPartOfElementInViewport(elems)) {
                    elem.focus();
                    return;
                }
            }
            elems[0].focus();
        }
        // this is the main flow of the method
        else {
            var index = mod_directionalNav.getClosest(activeEl, elems, direction);
            if (index > -1) {
                elems[index].focus();
            }
        }
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_directionalNav, _u.mod_keyboardLib, _u.mod_globals, _u.CONSTS);

;/**
 * Implements the zen mode. Hide everything on the page except CUs, zenMode whitelisted elements and UnitsProj elements when
 * invoked. Restore the page when mode is switched off.
 */
_u.mod_zenMode = (function($, mod_CUsMgr, mod_keyboardLib, mod_mutationObserver, mod_contentHelper, mod_commonHelper, mod_globals, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset, // reset the module (and disable it if applicable/required)
        setup: setup,   // (re) initialize the module
        toggle: toggle,
        start: start
    });

    var _isStarted, // true when zen mode is active/ started on a page
        _isStoppedByUser, // true if mode is explicitly stopped by user
        _isSupportedOnCurrentPage,// Is evaluated by checking the currently present DOM elements on page. Value is
        // updated on DOM change.

        class_visible = CONSTS.class_zenModeVisible,
        class_hidden = CONSTS.class_zenModeHidden,
        class_excluded = CONSTS.class_zenModeExcluded, // class for explicitly excluded elements inside whitelisted elements
        class_zenModeActive = CONSTS.class_zenModeActive, // class applied to body to indicate that zen mode is started
        class_unitsProjElem = CONSTS.class_unitsProjElem,

        expandedUrlData,

        zenModeAutoOn,
        mainContentSelector,
        mainContentSelector_exclude,
        $visibles, // jquery object containing list of elements that are made visible in zen mode
        $style_paddingTop, // style inserted into the page during zen mode to give a small padding-top in the body

        $document,
        $body;

    var $zenModeIndicator,// UI that indicates whether zen mode is available on a page, and if it is started
        id_zenModeIndicator = 'UnitsProj-zen-mode-indicator',
        $topLevelContainer = _u.$topLevelContainer,
        timeout_updateZenMode;

    /*-- Module implementation --*/
    function reset() {
        _isStarted && stop(); // Resets some global variables and removes any zen mode classes applied to page elements
        $zenModeIndicator && $zenModeIndicator.remove();
        thisModule.stopListening();

        zenModeAutoOn = false;

        _isStoppedByUser = false;
        _isSupportedOnCurrentPage = false;

        timeout_updateZenMode = false;
    }

    function setup(settings) {
        reset();

        expandedUrlData = settings.expandedUrlData;

        // Do not setup this module if there are no zen mode aware elements applicable for current URL
        var CUs_specifier = expandedUrlData && expandedUrlData.CUs_specifier,
            mainContentSpecifier = expandedUrlData && expandedUrlData.page_mainContent;


        if (!(CUs_specifier || mainContentSpecifier)) {
            return;     // don't setup this module if no zen mode aware elements are specified.
        }

        // Cached global variables
        $body = $('body');
        $document = $(document);
        zenModeAutoOn = settings.miscSettings && settings.miscSettings.zenModeAutoOn;

        if (mainContentSpecifier) {
            mainContentSelector = mainContentSpecifier.selector || mainContentSpecifier;
            mainContentSelector_exclude = mainContentSpecifier.exclude;
        }

        // Setup keyboard shortcut for this module
        var miscShortcuts = settings.miscShortcuts;
        mod_keyboardLib.bind(miscShortcuts.toggleZenMode.kbdShortcuts, toggle);

        // Setup indicator UI to be shown on the page when zen mode is supported.
        setupIndicatorUI();

        // On DOM mutation, update page for zen mode
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onDomMutations);

        // Update zen mode status the first time during setup.
        onDomMutations_updateZenModeStatus();

    }

    /**
     * Set up UI for indicating that zen mode is supported on a particular page. This UI also acts a button for toggling
     * zen mode.
     */
    function setupIndicatorUI() {

        $zenModeIndicator = $("<div><span>Z</span></div>");

        $zenModeIndicator
            .attr('id', id_zenModeIndicator)
            .addClass(class_unitsProjElem)
            .appendTo($topLevelContainer)
            .hide();

        // Handler for toggling zen mode on click
        $zenModeIndicator.click(toggle);
    }

    function start() {
        // if the module is not supported for this page, then do not start/stop the zen mode.
        if (!_isSupportedOnCurrentPage) {
            return;
        }

        // Start zen mode
        if (!_isStarted) {
            _isStarted = mod_globals.zenModeOn = true;
            _isStoppedByUser = false;

            applyZenMode();
            applyPaddingTopIfRequired();

        }
    }

    function stop(isStoppedByUser) {
        _isStarted = mod_globals.zenModeOn = false;
        _isStoppedByUser = isStoppedByUser;

        // This check exists because stop() gets called by reset() at setup when $body is not initialized yet.
        if ($body) {
            var disabledByMe = mod_mutationObserver.disable();

            var savedScrollPos = window.pageYOffset; // We lose the scroll position since we hide the body

            $body.hide(); // Hide the body before making a set of CSS changes together. It's much more efficient.

            // Make required CSS changes to stop zen mode.
            $body.removeClass(class_zenModeActive);
            $style_paddingTop && $style_paddingTop.remove();

            // NOTE: The following classes can be removed asynchronously if required for optimization (say with a timeout of 0).
            // Removing class_zenModeActive from body is enough to stop the zen mode visually (as perceived by the user).
            $("." + class_visible).removeClass(class_visible);
            $("." + class_hidden).removeClass(class_hidden);
            $("." + class_excluded).removeClass(class_excluded);

            $body.show();
            window.pageYOffset = savedScrollPos;

            disabledByMe && mod_mutationObserver.enable();

            mod_CUsMgr.updateCUOverlays();
        }

    }

    // public function
    function toggle() {
        if (_isStarted) {
            stop(true); // 'true' to indicate that zen mode was stopped explicitly by user.
        }
        else {
            start();
        }
    }

    /**
     * On DOM mutations, check if zen mode is still supported. Accordingly,
     * 1) Show/ hide the zen mode indicator UI on page
     * 2) Start/stop zen mode
     */
    function onDomMutations_updateZenModeStatus() {
        _isSupportedOnCurrentPage = mod_CUsMgr.getAllCUs().length || $document.find(mainContentSelector).length;

        if (!_isSupportedOnCurrentPage) {
            if ($zenModeIndicator[0].offsetHeight) {
                $zenModeIndicator.hide();
            }

            if (_isStarted) {
                stop();
            }

            return;
        }

        // Show if not currently present on page
        if (!$zenModeIndicator[0].offsetHeight) {
            $zenModeIndicator.show();
        }

        // Start zen mode automatically if zenModeAutoOn = true, and if zen mode was not explicitly stopped earlier
        // by the user.
        if (zenModeAutoOn && !_isStarted && !_isStoppedByUser) {
            start();
        }
    }

    function onDomMutations(mutations) {
        var groupingPeriod = _isStarted ? 500 : 2500; // Mutations grouping period varies depending on whether zen mode
        // is started or not.

        // If no new nodes were added to the page in these mutations, do nothing and return.
        var hasNodesAdded = function (mutation) {
            return mutation.addedNodes.length;
        };
        var filteredMutations = mutations.filter(hasNodesAdded);

        if (!filteredMutations.length) {
            return;
        }

        // compare explicitly with false, which is how we reset it
        if (timeout_updateZenMode === false) {
            timeout_updateZenMode = setTimeout(_onDomMutations, groupingPeriod);
        }
    }

    function _onDomMutations() {
        if (timeout_updateZenMode) {
            clearTimeout(timeout_updateZenMode);
            timeout_updateZenMode = false;    // reset
        }

        onDomMutations_updateZenModeStatus();

        if (_isStarted) {
            applyZenMode();
        }
    }

    function applyZenMode() {
        var disabledByMe = mod_mutationObserver.disable();
        _applyZenMode();
        disabledByMe && mod_mutationObserver.enable();

    }

    /***
     * Makes the required changes to the page to apply zen mode. 
     * 
     * $visibles: list of elements that need to be visible in zen mode.
     * 
     * 1) $visiblesAndAncestors: Create a list of all the $visibles and their ancestors. Apply class_visible to all
     * these elements.
     * 2) For all the siblings of all $visiblesAndAncestors, hide the sibling by applying class_hidden if they do not
     * have class_hidden set. Optimize this process.
     *
     * NOTE: TODO: Need to look into optimizing this method by selectively applying zen mode only on elements that were added
     * in the page. At the moment, we update the entire page for zen mode every time there is a mutation. We respond
     * to only those mutations where an element was added to the page, and these mutations are grouped by a certain time
     * interval (500 ms at the moment).
     *
     * @private
     */
    function _applyZenMode() {
        $("." + class_visible).removeClass(class_visible);
        $("." + class_excluded).removeClass(class_excluded);

        var $topLevelContainer = $(_u.$topLevelContainer),
            $mainContent = $(mainContentSelector),
            CUs_all = mod_CUsMgr.getAllCUs(),
            class_elementTraversed = "UnitsProj-element-traversed",
            $visiblesAndAncestors;

        // $visibles consists of CUs, zen mode whitelisted elements and elements added by UnitsProj.
        $visibles = $topLevelContainer.add($mainContent);
        CUs_all.forEach(function($CU) {
           $visibles = $visibles.add($CU);
        });

        $visiblesAndAncestors = $visibles.parents().andSelf();
        $visiblesAndAncestors.removeClass(class_hidden).addClass(class_visible);

        $.each($visiblesAndAncestors, function(index, parent) {
            var $parent = $(parent);

            $.each($parent.siblings(), function(index, sibling) {
                var $element = $(sibling);
                if ($element.hasClass(class_elementTraversed)) {
                    return;
                }

                $element.addClass(class_elementTraversed);

                if (!$element.hasClass(class_hidden) && !$element.hasClass(class_visible)) {
                      $element.addClass(class_hidden);
                }
            });
        });

        $("." + class_elementTraversed).removeClass(class_elementTraversed);
        $body.addClass(class_zenModeActive); // Note: In mod_CUsMgr, we add/remove this class from the body to hide/show
        // elements on page when updating CUs on DOM mutations.

        mainContentSelector_exclude && $visibles.find(mainContentSelector_exclude).addClass(class_excluded);

    }

    /**
     * Gives a small padding (for better readability) at the top of the page in zen mode.
     * Checks the offset top of the first element from the body and applies a padding-top to body appropriately.
     */
    function applyPaddingTopIfRequired() {
        var $firstVisibleElement = $visibles.eq(0), // assuming that the first element in document order is visually the
        // top-most element. For most pages, the assumption should hold.
            topPositionOfFirstElement = $firstVisibleElement.offset().top,
            requiredDistanceFromTop = 40,
            paddingTop = requiredDistanceFromTop - topPositionOfFirstElement;

        if (paddingTop > 0) {
            var class_paddingTop = 'UnitsProj-zen-mode-padding-top',
                paddingStyle = "." + class_paddingTop + "{padding-top:" +  paddingTop + "px !important;}";

            // Insert style for class_paddingTop into the page.
            $style_paddingTop = $('<style>' + paddingStyle + '</style>');
            $('html > head').append($style_paddingTop);

            $body.addClass(class_paddingTop); // NOTE: We only apply styles using classes (and not inline). This is because
            // applying the style inline would overwrite the existing inline style on the element (and we wouldn't then be
            // able to restore the original style easily).
        }
    }

    return thisModule;

})(jQuery, _u.mod_CUsMgr, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_commonHelper,
        _u.mod_globals, _u.CONSTS);
;// JSHint Config
/* exported settings */

var settings = {

    // Only exists as a placeholder (for reference). The property assigned in urlDataMap.js
    urlDataMap: null,

    /*
    Specifies sites on which the extension is partially or fully disabled.
    Patterns for matching urls can be specified using either the 'url pattern' format allowing '@' and '*' wildcards,
    or regexp objects where the aforementioned patterns don't suffice. Details about the 'url pattern' format can be found
    in the urlDataMap.js file.
    */
    disabledSites: {

        urlPatterns: ['www.reddit.com*', 'gmail.com*', 'mail.google.com*'], // Disabling Units because it might interfere
        urlRegexps: []
    },

    /*
    Specifies misc. options used by the program. Functions (in the content scripts) that use this object might also
    accept a 'options' object as argument. In addition to providing additional options for the function, the 'options'
    argument can also be to override any properties of the 'miscSettings' object (for that specific invocation)
    by providing different values for those properties.
    */
    miscSettings: {
        selectCUOnLoad: true, // whether the first CU should be selected when the page loads
        animatedCUScroll: true,
        animatedCUScroll_Speed: 1, // pixels per millisecond, can be a decimal
        animatedCUScroll_MaxDuration: 333, // milliseconds

        increaseFontInSelectedCU: false,

        // determines if while upward/downward CU selection, the CU should always be (vertically) centered or
        // only if it lies outside the view port
        verticallyCenterSelectedCU: true,

        // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
        sameCUScroll: true,

        pageScrollDelta: 250, // pixels to scroll on each key press

        enhanceActiveElementVisibility: true, // give special highlight to the active element on the page (if set to false,
        // the browser's default style will be applied.

        zenModeAutoOn: false // zen mode will be active on any page when the page first loads.
    },

    /*
    Note for specifying keyboard shortcuts (Applies to the following three objects, as well as other shortcuts
    specified in the urlData for a webpage):
    In addition to the usual modifier keys, 'space' can be used as (and will only work as) a modifier key.
    i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
    */

    /*
    Shortcuts related to navigating within a webpage
    */
    pageNavigationShortcuts: {
        scrollDown: {
            descr: "Scroll page down",
            kbdShortcuts: ['shift+j'],
            importanceHigh: true /* We use this flag in the Help UI to highlight 'important' labels */
        },
        scrollUp: {
            descr: "Scroll page up",
            kbdShortcuts: ['shift+k'],
            importanceHigh: true
        },
        scrollRight: {
            descr: "Scroll page right",
            kbdShortcuts: ['shift+l']
        },
        scrollLeft: {
            descr: "Scroll page left",
            kbdShortcuts: ['shift+h']
        },
        back: {
            descr: "Go back",
            kbdShortcuts: ['alt+h']
        },
        forward: {
            descr: "Go forward",
            kbdShortcuts: ['alt+l']
        },

        topOfPage: {
            descr: "Navigate: Top of page",
            kbdShortcuts: ['n t'],
            importanceHigh: true
        },
        bottomOfPage: {
            descr: "Navigate: Bottom of page",
            kbdShortcuts: ['n b']
        },
        pageUp: {
            descr: "Navigate: Up (fast scroll up)",
            kbdShortcuts: ['n u']
        },
        pageDown: {
            descr: "Navigate: Down (fast scroll down)",
            kbdShortcuts: ['n d']
        }
    },

    /*
    Shortcuts related to selecting or invoking elements in a page
    */
    elementNavigationShortcuts: {
        open: {
            descr: "Open/invoke selected item",
            // while 'enter' should work without having to specify it in the binding below, we specify it
            // explicitly since on some websites it might be bound as a shortcut for something else
            // (like on facebook it is bound to focus the comments textbox)
            kbdShortcuts: ['enter', 'shift+o']
        },
        openInNewTab: {
            descr: "Open selected link in new tab",
            kbdShortcuts: ['o'],
            importanceHigh: true
        },
        focusFirstTextInput: {
            descr: "Focus first text (input) box",
            kbdShortcuts: ['n i', 'alt+i'],
            importanceHigh: true
        },
        focusNextTextInput: {
            descr: "Focus next text box",
            kbdShortcuts: ['alt+o']
        },
        focusPrevTextInput: {
            descr: "Focus previous text box",
            kbdShortcuts: ['alt+shift+o']
        }
    },

    /*
    All other general page-level shortcuts that don't fall under pageNavigationShortcuts or elementNavigationShortcuts
     */
    miscShortcuts: {
        toggleZenMode: {
            descr: "Toggle zen mode",
            kbdShortcuts: ['z'],
            importanceHigh: true
        },
        toggleExtension: {
            descr: "Disable/enable Units on current page",
            kbdShortcuts: [','],
            importanceHigh: true
        },
        showHelp: {
            descr: "Show the help page",
            kbdShortcuts: ['alt+/'],
            importanceHigh: true
        }
    },

    /*
    Default shortcuts that need CUs to be defined on a page.
    * */
    CUsShortcuts: {
        // NOTE: since space is allowed as a modifier, it can only be used here in that capacity.
        // i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
        smartScrollDown: {
            descr: "Smart scroll down",
            kbdShortcuts: ['j'/*, 'down'*/],
            importanceHigh: true
        },
        smartScrollUp: {
            descr: "Smart scroll up",
            kbdShortcuts: ['k'/*, 'up'*/],
            importanceHigh: true
        },

        smartScrollRight: {
            descr: "Smart scroll right",
            kbdShortcuts: ['l'/*, 'right'*/]
        },
        smartScrollLeft: {
            descr: "Smart scroll left",
            kbdShortcuts: ['h'/*, 'left'*/]
        },
        selectCUDown: {
            descr: "Select next/down unit",
            kbdShortcuts: ['alt+shift+j'/*, 'down'*/]
        },
        selectCUUp: {
            descr: "Select prev/up unit",
            kbdShortcuts: ['alt+shift+k'/*, 'up'*/]
        },

        selectCURight: {
            descr: "Select right unit",
            kbdShortcuts: ['alt+shift+l'/*, 'right'*/]
        },
        selectCULeft: {
            descr: "Select left unit",
            kbdShortcuts: ['alt+shift+h'/*, 'left'*/]
        },

        selectFirstCU: {
            descr: "Select first unit",
            kbdShortcuts: ['^', 'alt+1']
        },
        selectLastCU: {
            descr: "Select last unit",
            kbdShortcuts: ['$', 'alt+9']
        },

        filterCUs: {
            descr: "Search and filter units ",
            kbdShortcuts: ['alt+f'],
            importanceHigh: true
        },

        // TODO: This shortcut is hardcoded in code at the moment.
        increaseSpotlight: {
            descr: "Increase spotlight on selected unit",
            kbdShortcuts: ["+"],
            importanceHigh: true
        }
    },

    /*
    Default values for the description and kbdShortcuts associated with the standard ("std_") SUs and actions
    defined in the urlData for a page. In most cases, the urlData will not specify values for these. However, if the
    urlData specifies any of these values for any of the "std_" items, they will be used instead.
    */
    valuesFor_stdUrlDataItems: {
        page: {
            std_searchField: {
                descr: "Focus search box",
                kbdShortcuts: ["/"]
            },
            std_header: {
                descr: "Focus (the first item on the) header",
                kbdShortcuts: ["alt+h"]
            },
            std_nextOrMore: {
                descr: "Show next or more content",
                kbdShortcuts: ["g down"]
            },
            std_comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            std_viewComments: {
                descr: "View comments",
                kbdShortcuts: ["g c"]
            },
            std_logout: {
                descr: "Logout",
                kbdShortcuts: ["q"]
            }
        },
        CUs: {
            std_main: {
                descr: ""
            },
            std_upvote: {
                descr: "Upvote (or 'like'/'+1'/etc).",
                kbdShortcuts: ["u"]
            },
            std_downvote: {
                descr: "Downvote (or '-1'/etc).",
                kbdShortcuts: ["d"]
            },
            std_share: {
                descr: "Share",
                kbdShortcuts: ["s"]
            },
            std_comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            std_viewComments: {
                descr: "View (more) comments",
                kbdShortcuts: ["v c"]
            },
            std_edit: {
                descr: "Edit",
                kbdShortcuts: ["e"]
            },
            std_profile: {
                descr: "Go to user profile",
                kbdShortcuts: ["p"]
            },
            std_sharedContent: {
                descr: "Open the shared content",
                kbdShortcuts: ["v s"]
            },
            std_toggleSelection: {
                descr: "toggleSelection",
                kbdShortcuts: ["x"]
            },
            std_seeMore: {
                descr: "See More",
                kbdShortcuts: ["m"]
            },
            std_star: {
                descr: "Star",
                kbdShortcuts: ["*"]
            }
        }
    },

    // as of now, all keys are meant to be lower case only.
    quickSearchSelectedText_data: {
        "g": "https://www.google.com/search?q=<<_serach_str_>>",
        "w": "http://en.wikipedia.org/w/index.php?search=<<_serach_str_>>",
        "m": "http://maps.google.com/maps?q=<<_serach_str_>>",
        "i": "http://www.imdb.com/find?q=<<_serach_str_>>&s=all"

    }
};

var urlData = {
    //'section' for units.io
    // '#posts .post' for blog.units.io
    CUs_specifier: "section, #posts .post"
};
_u.mod_commonHelper.stringifyFunctions(urlData);
expandUrlData(urlData);
settings.expandedUrlData = urlData;


// Converts any "shorthand" notations within the urlData to their "expanded" forms.
// Also adds default 'miniDesc' and 'kbdShortcuts' values, if not specified by SUs/actions defined in urlData
function expandUrlData(urlData) {

    // if key value at property 'key' in object 'obj' is a string, it is expanded to point to an object having a property
    // 'selector' that points to the string instead.
    var expandPropertyToObjIfString = function(obj, key) {
        var str;
        if (typeof (str = obj[key]) === "string") {
            obj[key] = {
                selector: str
            };
        }
    };

    // uses defaultSettings.valuesFor_stdUrlDataItems to supplement values in the SU/action (specified using the first two params)
    // 'scope' can be either "page" or "CUs"
    var supplementWithDefaultValues = function(SUorAction, SUorAction_Name, scope) {

        var temp;
        if (!SUorAction.kbdShortcuts && (temp = settings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
            SUorAction.kbdShortcuts = temp.kbdShortcuts;
        }
        if (!SUorAction.descr && (temp = settings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
            SUorAction.descr = temp.descr;
        }
    };

    // scope can be either "page" or "CUs"
    var expandSUsOrActions = function(SUsOrActions, scope) {
        if (typeof SUsOrActions === "object") {
            for (var SUorAction_Name in SUsOrActions) {
                expandPropertyToObjIfString(SUsOrActions, SUorAction_Name);
                supplementWithDefaultValues(SUsOrActions[SUorAction_Name], SUorAction_Name, scope);
            }
        }
    };

    expandPropertyToObjIfString(urlData, 'CUs_specifier');

    expandSUsOrActions(urlData.CUs_SUs, "CUs");
    expandSUsOrActions(urlData.CUs_actions, "CUs");

    expandSUsOrActions(urlData.page_SUs, "page");
    expandSUsOrActions(urlData.page_actions, "page");

}
;// See _readme_module_template.js for module conventions

/**
 * main module (mod_main.js) This is the main module which runs the extension by using the other modules
 */
(function($, mod_domEvents, mod_easyScrollKeys, mod_basicPageUtils, mod_CUsMgr, mod_urlSpecificShortcuts, mod_mutationObserver,
          mod_keyboardLib, mod_selectLink, mod_filterCUs, mod_zenMode, mod_help,
          mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_globals) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        // no public interface for the main module
    });

    /*-- Event bindings --*/
    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);

    var
        $topLevelContainer = _u.$topLevelContainer,

        miscShortcuts,
        CUsSpecifier,
        isDisabled_fromSettings = true, // assume true (disabled) till background script tells us otherwise

        // This should start off being `false` (till the user invokes toggleExtensionTemporarily() for the first time)
        // Note: Do NOT reset this in disableExtension() (or reset() for mod_main , if you make a function like that)
        isDisabled_temporarily = false,

        // mutation observer is disabled when the tab loses focus (unless filtering of CUs is active), and be
        // re-enabled when it gains focus
        isMutationObserverDisabled  = false,

        // modules that require setup() and/or reset() to be called during extension initialization and disabling
        // respectively. Generally, modules should be setup in relative order of priority of keyboard shortcuts
        // (this is the order in which they are listed in the array below), while reset() is called in the
        // opposite order
        modulesToSetup = [mod_domEvents, mod_keyboardLib, mod_globals, mod_chromeAltHack,
            // modules which define keyboard shortcuts are listed next, in order of priority
            mod_help, mod_selectLink, mod_easyScrollKeys, mod_basicPageUtils, mod_filterCUs, mod_zenMode,
            mod_urlSpecificShortcuts, mod_CUsMgr];

    /*-- Module implementation --*/

    function _onUrlChange(newUrl, currentUrl) {
        console.log("url changed from ", currentUrl, " to ", newUrl);
        reinitializeIfNotDisabledTemporarily();
    }

    // used to enable/disable the extension temporarily on the page -- it only affects the current run of the page,
    // i.e. no change is made to the user's settings for enabling/disabling that page)
    function toggleExtensionTemporarily() {
        if (isDisabled_temporarily) {
            isDisabled_temporarily = false;
            initializeExtension();
        }
        else {
            isDisabled_temporarily = true;
            disableExtension();

            document.activeElement.blur(); // focus the body.

            /* NOTE: This is temporary. We are focusing body because of the Github issue where Github's keyboard shortcuts do not
             work unless the focus is with document.body. This issue is not seen on any other site so far.

             When this issue is fixed on Github, we should remove this statement (because that is the right thing to do!)
             Until then, to invoke Github's shortcuts, one would need to temporarily disable the extension, invoke shortcuts,
             and then activate extension again. */
        }
    }

    // reset state and disable the extension
    function disableExtension() {
//        setExtensionIcon(false); // show "disabled" icon

        // The following loop disables all modules, calling their `reset` methods (in reverse order of their setup).
        // It also removes all bindings for dom events, including keyboard shortcuts (as a result of calling restul() on
        // `mod_keyboardLib` and `mod_domEvents`
        for (var i = modulesToSetup.length - 1; i >= 0; i--) {
            var module = modulesToSetup[i];
            module && module.reset && module.reset();
        }

        // do the following once mod_keyboardLib.reset() has been called (from the loop above)
        if (!isDisabled_fromSettings  && miscShortcuts) {
            mod_keyboardLib.bind(miscShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);
        }

        mod_mutationObserver.disable(true);

        $topLevelContainer.remove();

        CUsSpecifier = null;

    }

//    function setExtensionIcon(isEnabled) {
//        chrome.runtime.sendMessage({
//            message: 'setIcon',
//            isEnabled: isEnabled
//        });
//    }

    function reinitializeIfNotDisabledTemporarily() {
        !isDisabled_temporarily && initializeExtension();
    }

// (reset and re-)initialize the extension.
    function initializeExtension() {

        disableExtension(); // resets the state



                // assign references to module level variables
                miscShortcuts = settings.miscShortcuts;
                isDisabled_fromSettings = settings.isDisabled;
                CUsSpecifier = settings.expandedUrlData &&  settings.expandedUrlData.CUs_specifier;

                if (isDisabled_fromSettings) {
                    disableExtension();
                    // the following lines exist to cater to url changes in single page apps etc.
                    mod_mutationObserver.enable();
                    thisModule.stopListening(); // stop listening to all events from all modules...
                    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);// ...except 'url-change'
                    return;
                }

//                setExtensionIcon(true); // show "enabled" icon

                // destringify stringified functions before calling makeImmutable()
                settings.expandedUrlData && mod_commonHelper.destringifyFunctions(settings.expandedUrlData);
                mod_commonHelper.makeImmutable(settings);

                $topLevelContainer.appendTo(document.body);

                // do this before setting up other modules, so that it gets priority over shortcuts setup in them
                mod_keyboardLib.bind(miscShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);

                for (var i = 0; i < modulesToSetup.length; i++) {
                    var module = modulesToSetup[i];
                    module && module.setup && module.setup(settings);
                }

                mod_mutationObserver.enable();

                if (settings.miscSettings && settings.miscSettings.zenModeAutoOn) {
                    mod_zenMode.start();
                }
    }

    function isDisabled() {
        return isDisabled_fromSettings || isDisabled_temporarily;
    }

//    chrome.runtime.onMessage.addListener(
//        function(request, sender, sendResponse) {
//
//            // re-initialize the extension when background script informs of change in settings
//            if (request.message === 'settingsChanged') {
//                reinitializeIfNotDisabledTemporarily();
//            }
//
//            // respond with the enabled/ disabled status of the current URL, when asked for by the background script.
//            // This is used for setting the extension icon appropriately.
//            else if (request.message === "tabActivated") {
//                sendResponse(!isDisabled());
//                clearTimeout(timeout_onTabActivation);
//                timeout_onTabActivation = setTimeout(onTabActivation, 200);
//            }
//            else if (request.message === "tabDeactivated") {
//                clearTimeout(timeout_onTabActivation);
//                onTabDeactivation();
//            }
//            else if(request.message === "isContentScriptTemporarilyDisabled") {
//                sendResponse(isDisabled_temporarily);
//            }
//
//            else if(request.message === "toggleContentScriptTemporarily") {
//                toggleExtensionTemporarily();
//                sendResponse(isDisabled_temporarily);
//            }
//
//            else if(request.message === "showHelp") {
//                mod_help.showHelp();
//            }
//        }
//    );

    var timeout_onTabActivation;

    // triggers after the current tab got activated and remained active for a (very) brief period
    // (to prevent this from running for tabs that are briefly activated in the process
    // of moving through a bunch of tabs to reach a final one)
    function onTabActivation() {

        if (isMutationObserverDisabled) {
            isMutationObserverDisabled = false;
            mod_mutationObserver.enable();
            CUsSpecifier && mod_CUsMgr.updateCUsAndRelatedState();
            // since we had stopped observing mutations, we must check the entire document for
            // any conflicting access key attrs (if mod_chromeAltHack is being used)
            mod_chromeAltHack && mod_chromeAltHack.removeAnyConflictingAccessKeyAttr(document);
        }
    }

    function onTabDeactivation() {
        // disable mutation observer if the tab got deactivated AND didn't have CUs filtering ongoing
        if (!(mod_filterCUs && mod_filterCUs.isActive())) {
            mod_mutationObserver.disable(true);
            isMutationObserverDisabled = true;
        }
    }

//    function onWindowMessage(event, targetOrigin) {
//        var data = event.data;
////            isMessageOriginValid = (mod_commonHelper.getHostname(event.origin) === mod_commonHelper.getHostname(chrome.runtime.getURL("")));
//
//        if (!data/* ||  !isMessageOriginValid*/) {
//            return;
//        }
//
//        if (data.message === 'hideHelpUI') {
//            mod_help.hideHelp(); // hide the help iframe
//            window.focus(); // restore focus to the window.
//        }
//        else if (data.message === 'setHelpUIHeight') {
//            mod_help.positionHelpUI(data.height);
//        }
//        else if(data.message === 'doesPageHaveCUsSpecifier') {
//            var pageHasCUsSpecifier = mod_globals.pageHasCUsSpecifier;
//
//            var iframeHelp = document.getElementById("UnitsProj-iframe-help");
//            iframeHelp.contentWindow.postMessage({message: 'pageHasCUsSpecifier', value: pageHasCUsSpecifier}, '*');
//        }
//        return false;
//    }

    // Used to communicate with the Help UI iframe. This event does not need to be bound using mod_domEvents because we
    // don't need to remove it when extension is disabled.
//    window.addEventListener('message', onWindowMessage, false);

    // don't need to wait till dom-ready. allows faster starting up of the extension's features
    // (in certain sites at least. e.g. guardian.co.uk)
    // this should not cause any issues since we are handling dom changes anyway.
    (function initializeWhenReady (){
        if (!document.body) {
            setTimeout(initializeWhenReady, 100);
            return;
        }
        $topLevelContainer.appendTo(document.body);
        initializeExtension();
    })();   // ** Main flow begins here!! **


    //return thisModule; // not required for main module

})(jQuery, _u.mod_domEvents, _u.mod_easyScrollKeys, _u.mod_basicPageUtils, _u.mod_CUsMgr, _u.mod_urlSpecificShortcuts, _u.mod_mutationObserver,
        _u.mod_keyboardLib, _u.mod_selectLink, _u.mod_filterCUs, _u.mod_zenMode, _u.mod_help,
        _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_globals);
