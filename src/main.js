var luffa = function () {
};

luffa.VERSION = '@@version';

window.luffa = luffa;
var h = virtualDom.h;
var diff = virtualDom.diff;
var patch = virtualDom.patch;
var render = virtualDom.create;

var parser = require('html2hscript');

luffa.diff = function (originDOM, changeDOM) {
  var result = virtualDom.VNode("div"),
    expected = virtualDom.VNode("div");

  parser(originDOM, function (err, hscript) {
    result = eval(hscript);
  });
  parser(changeDOM, function (err, hscript) {
    expected = eval(hscript);
  });

  return diff(result, expected);
};

luffa.handleProps = function (patch) {
  return patch.patch.className;
};

luffa.handleInsert = function (html) {
  return $(html).prop("outerHTML");
};

luffa.handleRemove = function (html) {
  return null;
};

luffa.handleVText = function (patch) {
  return patch.patch.text;
};

function createResult(patches, key) {
  var result = {};
  var TYPE = ['NONE', 'VTEXT', 'VNODE', 'WIDGET', 'PROPS', 'ORDER', 'INSERT', 'REMOVE', 'THUNK'];
  result.type = TYPE[patches[key].type];
  result.html = render(patches[key].patch);
  if (result.type === 'PROPS') {
    result.prop = luffa.handleProps(patches[key]);
  }
  if (result.type === 'INSERT') {
    result.prop = luffa.handleInsert(result.html);
  }
  if (result.type === 'REMOVE') {
    result.prop = luffa.handleRemove(result.html);
  }
  if (result.type === 'VTEXT') {
    result.prop = luffa.handleVText(patches[key]);
  }

  return result;
}

luffa.getDiffDom = function (patches) {
  var patchesKeys = Object.keys(patches);
  var results = [];
  for (var index in patchesKeys) {
    var patchIndex = patchesKeys[index];
    if (patchIndex !== 'a') {
      var subResult = [];
      var result;
      if (luffa.isArray(patches[patchIndex])) {
        var subKeys = Object.keys(patchIndex);
        for (var subKey in subKeys) {
          subResult.push(createResult(patches[patchIndex], subKey))
        }
        result = subResult;
      } else {
        result = createResult(patches, patchIndex);
      }
      results.push(result);
    }
  }
  return results;
}
;
