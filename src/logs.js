Desharp = (function (
	clickStr,			openedStr,			bodyStr,		divStr,			initializedStr,	controlStr,
	undefinedStr,		idStr,				callstackStr,	tableStr,		titleStr,		trStr,
	fileStr,			tdStr,				lineStr,		methodStr,		bStr,			requestIdStr,
	idHeadingStr,		causedByTypeStr,	commaSpaceStr,	aStr,			msgStr,			editorValueStr,
	ampStr,				equalStr,			editorStr,		desharpDumpStr,	dumpBlockStr,	headStr,
	htmlCodeStr,		dumpStr,			getElementsByTagNameStr,pushStr,substrStr,		spanStr,
	recordStr,			parentNodeStr,		childNodesStr,	exceptionStr,	innerHtmlStr,	uniqueIdStr,
	attachEventStr,		toLowerCaseStr,		replaceStr,		nodeNameStr,	srcElementStr,	targetStr,
	onStr,				headersStr,			classNameStr,	lengthStr,		pxStr,			spaceStr,		
	emptyStr,			quotStr,			win,			doc,			TRUE,			FALSE,			NULL
) {
	var Desharp = function () {
		var scope = this || {};
		scope._initEvents();
		scope._clickSpans = {};
		scope._dumpDivs = {};
	};
	Desharp._instance = null;
	Desharp.GetInstance = function () {
		if (!Desharp._instance) Desharp._instance = new Desharp();
		return Desharp._instance;
	};
	Desharp.prototype = {
		_initEvents: function () {
			// do not use any document.body.onclick, or document.onload or 
			// document.onreadystatechange, because this html document should 
			// be very very very long and it's not good to wait for whole 
			// document load to do something, becaouse you can by window.onclick.
			// window.onclick is possible to call before anything has been rendered or not rendered yet
			var scope = this;
			Helpers.AddEvent(win, clickStr, function (e) {
				scope._windowClickHandler(e);
			});
		},
		_windowClickHandler: function (e) {
			var scope = this || {},
				uid = emptyStr,
				hasClass = Helpers.HasClass,
				logRecordElmResult = scope._tryToSearchLogRecordElm(e[targetStr]),
				recordElm = logRecordElmResult.recordElm,
				exceptionRecordType = hasClass(recordElm, exceptionStr),
				recordIsOpened = hasClass(recordElm, openedStr);
			if (recordElm && logRecordElmResult.controlClick) {
				uid = hasClass(recordElm, initializedStr)
					? Helpers.GetElmUniqueId(recordElm)
					: scope._initLogRecordElm(recordElm, exceptionRecordType);
				exceptionRecordType
					? scope._openCloseRecordElmException(recordElm, recordIsOpened)
					: scope._openCloseRecordElmValue(recordElm, recordIsOpened, uid);
				recordIsOpened
					? Helpers.RemoveClass(recordElm, openedStr)
					: Helpers.AddClass(recordElm, openedStr);
			}
		},
		_initLogRecordElm: function (recordElm, exceptionRecordType) {
			var scope = this || {},
				uid = Helpers.GetElmUniqueId(recordElm),
				jsonData = scope._getRecordJsonData(recordElm),
				append = Helpers.Append;
			if (exceptionRecordType) {
				scope._initLogRecordElmException(uid, recordElm, jsonData);
			} else {
				scope._initLogRecordElmValue(uid, recordElm, jsonData);
			}
			append(recordElm, scope._createCallstackTable(jsonData[callstackStr]));
			if (typeof(jsonData[headersStr]) != undefinedStr) append(recordElm, scope._createHeadersTable(jsonData[headersStr]));
			Helpers.AddClass(recordElm, initializedStr);
			return uid;
		},
		_initLogRecordElmException: function (uid, recordElm, jsonData) {
			var scope = this || {};
			Helpers.Append(recordElm, scope._createExceptionHeadBlock(recordElm, jsonData));
		},
		_initLogRecordElmValue: function (uid, recordElm, jsonData) {
			var scope = this || {},
				firstChild = Helpers.FirstChildByClassAndNodeName,
				desharpDumpElm = NULL,
				dumpClickableElmsAndTargets = [];
			Helpers.Append(recordElm, scope._createDumpBlock());
			desharpDumpElm = firstChild(firstChild(recordElm, controlStr), desharpDumpStr);
			dumpClickableElmsAndTargets = scope._getDumpClickableElmsAndTargets(desharpDumpElm);
			scope._clickSpans[uid] = dumpClickableElmsAndTargets[0];
			scope._dumpDivs[uid] = dumpClickableElmsAndTargets[1];
			Helpers.AddEvent(desharpDumpElm, clickStr, function (e) {
				scope._desharpDumpClickHandler(uid, e[targetStr]);
			});
		},
		_openCloseRecordElmException: function (recordElm, recordIsOpened) {
			var firstChild = Helpers.FirstChildByClassAndNodeName,
				sourceContCls = recordIsOpened ? headStr : controlStr,
				targetContCls = recordIsOpened ? controlStr : headStr,
				sourceElmName = recordIsOpened ? aStr : divStr,
				targetElmName = recordIsOpened ? divStr : aStr,
				msgElm = firstChild(firstChild(recordElm, sourceContCls), msgStr, sourceElmName),
				targetContElm = firstChild(firstChild(recordElm, targetContCls), msgStr, targetElmName);
			Helpers.Append(targetContElm, msgElm["lastChild"]);
		},
		_openCloseRecordElmValue: function (recordElm, recordIsOpened, uid) {
			var firstChild = Helpers.FirstChildByClassAndNodeName,
				desharpDumpElm = NULL,
				sourceContCls = recordIsOpened ? dumpBlockStr : controlStr,
				targetContCls = recordIsOpened ? controlStr : dumpBlockStr,
				sourceContElm = firstChild(recordElm, sourceContCls),
				dumpElm = firstChild(sourceContElm, desharpDumpStr),
				targetContElm = firstChild(recordElm, targetContCls);
			Helpers.Append(targetContElm, dumpElm);
			desharpDumpElm = firstChild(targetContElm, desharpDumpStr);
			this._openCloseDesharpDumpFirstLevel(uid, desharpDumpElm, recordIsOpened);
		},
		_getDumpClickableElmsAndTargets: function (desharpDumpElm) {
			var scope = this || {},
				elms = [],
				elm = {},
                divKey = emptyStr,
				hasClass = Helpers.HasClass,
				classIdFn = scope._getClickOrDumpEmlClassId,
				clickSpans = {},
				dumpDivs = {};
			elms = desharpDumpElm[getElementsByTagNameStr](spanStr)
			for (var i = 0, l = elms[lengthStr]; i < l; i += 1) {
				elm = elms[i];
				if (hasClass(elm, clickStr)) {
					clickSpans[classIdFn(elm, clickStr)] = elm;
				}
			};
			elms = desharpDumpElm[getElementsByTagNameStr](divStr);
			for (var i = 0, l = elms[lengthStr]; i < l; i += 1) {
				elm = elms[i];
				if (hasClass(elm, dumpStr)) {
					divKey = classIdFn(elm, dumpStr);
					if (typeof(dumpDivs[divKey]) == undefinedStr) {
						dumpDivs[divKey] = [elm];
					} else {
						dumpDivs[divKey][pushStr](elm);
					}
				}
			};
			return [clickSpans, dumpDivs];
		},
		_getClickOrDumpEmlClassId: function (elm, cls) {
			var indexOf = Helpers.IndexOf,
				fullCls = cls + spaceStr + cls + "-",
				elmCls = elm[classNameStr],
				pos = indexOf(elmCls, fullCls);
			cls = elmCls[substrStr](pos);
			pos = indexOf(cls, spaceStr, fullCls[lengthStr]);
			return cls[substrStr](fullCls[lengthStr], (pos > -1 ? pos : cls[lengthStr]) - fullCls[lengthStr]);
		},
		_openCloseDesharpDumpFirstLevel: function (uid, desharpDumpElm, recordIsOpened) {
			var scope = this || {},
				hasClass = Helpers.HasClass,
				firstSpans = desharpDumpElm[getElementsByTagNameStr](spanStr),
				firstSpan = {};
			for (var i = 0, l = firstSpans[lengthStr]; i < l; i += 1) {
				firstSpan = firstSpans[i];
				if (hasClass(firstSpan, clickStr)) {
					if (recordIsOpened) if (!hasClass(firstSpan, openedStr)) break;
					scope._desharpDumpClickHandler(uid, firstSpan);
					break;
				}
			}
			return scope;
		},
		_desharpDumpClickHandler: function (uid, srcElm) {
			var scope = this || {},
				hasClass = Helpers.HasClass,
				removeClass = Helpers.RemoveClass,
				addClass = Helpers.AddClass,
				dumpElms = [],
				dumpElm = {};
			if (hasClass(srcElm, clickStr)) {
				dumpElms = scope._dumpDivs[uid][scope._getClickOrDumpEmlClassId(srcElm, clickStr)];
				hasClass(srcElm, openedStr)
					? removeClass(srcElm, openedStr)
					: addClass(srcElm, openedStr);
				for (var i = 0, l = dumpElms[lengthStr]; i < l; i += 1) {
					dumpElm = dumpElms[i];
					if (dumpElm) {
						hasClass(dumpElm, openedStr)
							? removeClass(dumpElm, openedStr)
							: addClass(dumpElm, openedStr);
					}
				}
			}
		},
		_createExceptionHeadBlock: function (recordElm, jsonData) {
			var result = Helpers.CreateElm(headStr),
				wrapNode = Helpers.WrapNode,
				firstChild = Helpers.FirstChildByClassAndNodeName,
				controlElm = firstChild(recordElm, controlStr),
				msgElm = firstChild(controlElm, msgStr),
				msgText = msgElm[innerHtmlStr],
				headUpInfo = ["Process" + idHeadingStr + jsonData["processId"]],
				headDownInfo = [],
				href = "https://www.google.com/search?sourceid=desharp&gws_rd=us&q=";
			if (typeof(jsonData[requestIdStr]) != undefinedStr) headUpInfo[pushStr]("Request" + idHeadingStr + jsonData[requestIdStr]);
			headUpInfo[pushStr]("Thread" + idHeadingStr + jsonData["threadId"]);
			if (typeof (jsonData[causedByTypeStr]) != undefinedStr) {
				headDownInfo[pushStr]("Caused By: " + jsonData[causedByTypeStr] + " (" + jsonData["causedByHash"] + ")");
			}
			if (msgText[lengthStr] < 1024) href += msgText[replaceStr](/ /g, "+");
			result[innerHtmlStr] = wrapNode(
				headUpInfo.join(commaSpaceStr), idStr
			) + wrapNode(
				spaceStr, msgStr, aStr, { "href": href, "target": "_blank" }
			) + (headDownInfo[lengthStr] > 0 ? wrapNode(
				headDownInfo.join(commaSpaceStr), "info"
			) : emptyStr);
			return result;
		},
		_createDumpBlock: function () {
			var result = Helpers.CreateElm(dumpBlockStr);
			result[innerHtmlStr] = Helpers.WrapNode("Dump:", titleStr, bStr);
			return result;
		},
		_createCallstackTable: function (callstackData) {
			var result = Helpers.CreateElm(tableStr + spaceStr + callstackStr),
				wrapNode = Helpers.WrapNode,
				callstackItem = {},
				file = [],
				fileCellContent = emptyStr,
				tableRows = emptyStr;
			for (var i = 0, l = callstackData[lengthStr]; i < l; i++) {
				callstackItem = callstackData[i];
				file = callstackItem[fileStr] || [];
				line = callstackItem[lineStr] || "?";
				fileCellContent = file[lengthStr] > 1 ? wrapNode(file[1], emptyStr, aStr, {
					"href": editorStr + "://open/?" + fileStr + equalStr + encodeURIComponent(file[0]) + ampStr + lineStr + equalStr + line + ampStr + editorStr + equalStr + editorValueStr
				}) : emptyStr;
				tableRows += wrapNode(
					wrapNode(
						fileCellContent, fileStr, tdStr
					) + wrapNode(
						line, lineStr, tdStr
					) + wrapNode(
						callstackItem[methodStr].replace(/\./g, "&" + String.fromCharCode(35) + "8203;."), methodStr, tdStr
					),
					file[lengthStr] > 0 ? "known" : emptyStr,
					trStr
				);
			}
			result[innerHtmlStr] = wrapNode("Call stack:", titleStr, bStr)
				+ wrapNode(wrapNode(wrapNode(tableRows, emptyStr, tableStr)), "calls");
			return result;
		},
		_createHeadersTable: function (headers) {
			var result = Helpers.CreateElm(tableStr),
				wrapNode = Helpers.WrapNode,
				tableRows = emptyStr;
			for (var key in headers) {
				tableRows += wrapNode(
					wrapNode(
						key, emptyStr, tdStr
					) + wrapNode(
						headers[key], emptyStr, tdStr
					),
					emptyStr,
					trStr
				);
			}
			result[innerHtmlStr] = wrapNode("HTTP Headers:", titleStr, bStr)
				+ wrapNode(wrapNode(tableRows, emptyStr, tableStr), "data");
			return result;
		},
		_getRecordJsonData: function (recordElm) {
			var dataElm = Helpers.FirstChildByClassAndNodeName(recordElm, "json-data"),
				rawData = dataElm[innerHtmlStr][replaceStr](/[\r\n]/g, emptyStr),
				result = NULL;
			try {
				result = new Function("return "+rawData)();
			} catch (e) {
			}
			return result;
		},
		_tryToSearchLogRecordElm: function (targetElm) {
			var currentElm = targetElm,
				isElm = Helpers.IsElm,
				hasClass = Helpers.HasClass,
				result = {
					recordElm: NULL,
					controlClick: FALSE
				}
			while (true) {
				if (isElm(currentElm, bodyStr)) break;
				if (isElm(currentElm, divStr)) {
					if (hasClass(currentElm, controlStr) && hasClass(currentElm[parentNodeStr], recordStr)) {
						result.controlClick = TRUE;
						result.recordElm = currentElm[parentNodeStr];
						break;
					}
					if (hasClass(currentElm, recordStr)) {
						result.recordElm = currentElm;
						break;
					}
				}
				currentElm = currentElm[parentNodeStr];
			};
			return result;
		}
	};
	var Helpers = {
		OldIe: /MSIE [5-8]/gi.test(navigator["userAgent"]),
		_uniqueIdsCounter: 0,
		AddClass: function (elm, cls) {
			elm[classNameStr] = elm[classNameStr] + spaceStr + cls;
		},
		RemoveClass: function (elm, cls) {
			var elmCls = spaceStr + elm[classNameStr] + spaceStr,
				cls = spaceStr + cls + spaceStr;
			while (Helpers.IndexOf(elmCls, cls) > -1)
				elmCls = elmCls[replaceStr](cls, emptyStr);
			elm[classNameStr] = elmCls[replaceStr](/\s+/, spaceStr);
		},
		HasClass: function (elm, cls) {
			if (!elm) return FALSE;
			return Helpers.IndexOf(
				spaceStr + elm[classNameStr] + spaceStr,
				spaceStr + cls + spaceStr
			) > -1;
		},
		IsElm: function (elm, nodeName) {
			return elm[nodeNameStr][toLowerCaseStr]() == nodeName;
		},
		FirstChildByClassAndNodeName: function (parentElm, cls, nodeName) {
			var result = NULL,
				childNodes = parentElm[childNodesStr],
				isElm = Helpers.IsElm,
				hasClass = Helpers.HasClass,
				nodeName = nodeName || divStr,
				node;
			for (var i = 0, l = childNodes[lengthStr]; i < l; i += 1) {
				node = childNodes[i];
				if (isElm(node, nodeName) && hasClass(node, cls)) {
					result = node;
					break;
				}
			}
			return result;
		},
		ChildrenByClassAndNodeName: function (parentElm, cls, nodeName) {
			var result = [];
			Helpers.ForEachNode(parentElm, nodeName || divStr, function (child, i) {
				if (Helpers.HasClass(child, cls)) result[pushStr](child);
			});
			return result;
		},
		AddEvent: function (elm, eventName, handler) {
			var key = emptyStr,
				preHandler = function (e) {
					e = e || win["event"];
					e[targetStr] = Helpers._getEventSourceElm(e);
					handler.call(elm, e);
				};
			if (Helpers.OldIe) {
				elm[attachEventStr](onStr + eventName, preHandler);
				win[attachEventStr](onStr + "unload", function () {
					elm.detachEvent(onStr + eventName, preHandler);
				});
			} else {
				elm.addEventListener(eventName, preHandler);
			}
		},
		StyleElmProp: function (styleObj, propName, propValue) {
			if (Helpers.OldIe) {
				styleObj[propName] = propValue;
			} else {
				styleObj[propName] = (propValue + emptyStr)[lengthStr] > 0 ? propValue + pxStr : emptyStr;
			}
		},
		WrapNode: function (innerHtml, cssClass, nodeName, attrs) {
			var attrsStr = emptyStr,
				nodeName = nodeName || divStr,
				attrs = attrs || {};
			if (cssClass) attrs["class"] = cssClass;
			for (var key in attrs || {}) {
				attrsStr += spaceStr + key + equalStr + quotStr + attrs[key] + quotStr;
			}
			return "<" + nodeName + attrsStr + ">" + innerHtml + "<\/" + nodeName + ">"
		},
		ForEachNode: function (elmsCont, nodeName, handler) {
			var firstElements = elmsCont[childNodesStr],
        		elm = {};
			for (var i = 0, j = 0, l = firstElements[lengthStr]; i < l; i += 1) {
				elm = firstElements[i];
				if (elm[nodeNameStr][toLowerCaseStr]() == nodeName) handler(elm, j++);
			}
		},
		CreateElm: function (cls, elmName, id) {
			var elm = doc["createElement"](elmName || divStr);
			if (cls) elm[classNameStr] = cls;
			if (id) elm[idStr] = id;
			return elm;
		},
		Append: function (parent, child) {
			if (Helpers.OldIe) {
				return parent["insertAdjacentElement"]("beforeEnd", child);
			} else {
				return parent["appendChild"](child);
			}
		},
		IndexOf: function (str, substr, index) {
			return str.indexOf(substr, index || 0);
		},
		GetElmUniqueId: function (elm) {
			if (typeof (elm[uniqueIdStr]) == undefinedStr) {
				elm[uniqueIdStr] = idStr + this._uniqueIdsCounter++;
			}
			return elm[uniqueIdStr];
		},
		_getEventSourceElm: function (e) {
			var result = e[targetStr] ? e[targetStr] : (e[srcElementStr] ? e[srcElementStr] : NULL);
			if (result["nodeType"] == 3) result = result[parentNodeStr]; // Safari bug by clicking on text node
			return result;
		}
	};
	Desharp.GetInstance();
	return Desharp;
}).apply(
	{}, (
		"click|opened|body|div|initialized|control|" +
		"undefined|id|callstack|table|title|tr|" +
		"file|td|line|method|b|requestId|" +
		" ID: |causedByType|, |a|msg|__LINK_EDITOR__|" +
		"&amp;|=|editor|desharp-dump|dump-block|head|" +
		"html-code|dump|getElementsByTagName|push|substr|span|" +
		"record|parentNode|childNodes|exception|innerHTML|uniqueID|" +
		"attachEvent|toLowerCase|replace|nodeName|srcElement|target|" +
		"on|headers|className|length|px| ||" + String.fromCharCode(34)
	).split("|").concat([window,document,true,false,null])
);