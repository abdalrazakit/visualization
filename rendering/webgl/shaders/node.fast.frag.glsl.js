(()=>{"use strict";var r={d:(e,n)=>{for(var o in n)r.o(n,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(r,e)=>Object.prototype.hasOwnProperty.call(r,e),r:r=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})}},e={};r.r(e),r.d(e,{default:()=>n});const n="precision mediump float;\r\n\r\nvarying vec4 v_color;\r\nvarying float v_border;\r\n\r\nconst float radius = 0.5;\r\nconst vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);\r\n\r\nvoid main(void) {\r\n  vec2 m = gl_PointCoord - vec2(0.5, 0.5);\r\n  float dist = radius - length(m);\r\n\r\n  float t = 0.0;\r\n  if (dist > v_border)\r\n    t = 1.0;\r\n  else if (dist > 0.0)\r\n    t = dist / v_border;\r\n\r\n  gl_FragColor = mix(transparent, v_color, t);\r\n}\r\n";module.exports=e})();