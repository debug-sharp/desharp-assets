Desharp = (function(
	desharpStr,		cookieStr,			divStr,			spanStr,		mouseStr,			scrollTopStr,
	scrollLeftStr,	cookieDelimiterStr,	widthStr,		heightStr,		onStr,				getElementsByTagNameStr, 
	classNameStr,	lengthStr,			innerHTMLStr,	styleStr,		substrStr,			substringStr,
	splitStr,		replaceStr,			pageXStr,		pageYStr,		srcElementStr,		targetStr,
	joinStr,		pushStr, 			underScoreStr,	emptyStr,		semicolonStr,		attachEventStr,
	bodyStr,		topStr,				leftStr,		arrayStr,		classStr,			downStr,
	moveStr,		upStr,				undefinedStr,	innerWidthStr,	innerHeightStr,		documentElementStr,	
	clientWidthStr,	clientHeightStr,	prototypeStr,	offsetWidthStr,	offsetHeightStr,	objectStr,
	barStr,			windowsStr,			offsetLeftStr,	offsetTopStr,	rightStr,			bottomStr,
	hiddenStr,		nodeNameStr,		parentNodeStr,	toLowerCaseStr,	overStr,			currentStr,
	outStr,			clickStr,			outerWidthStr,	outerHeightStr, getInstanceStr,		resizeStr,
	closeStr,		onbeforeunloadStr,	resizeToStr,	invisibleStr,	settingsKeyStr,		refreshTimeLimitStr,
	keyupStr,		pxStr,				spaceStr,		quotStr,
	win,			doc,				locStore,		navigatorUserAgent,FALSE,			TRUE,				NULL
) {
	var desharpStrLower = desharpStr[toLowerCaseStr]();
    var Desharp = function () {
        if (Desharp._instance) return;
        var scope = this||{};
		scope.BarsElm = {};
		scope.ContElm = {};
		scope.PositionsAndSizes = [0, 0, 0, 0];
		scope._moveCoords = [0, 0];
		scope._settingsRaw = Helpers.GetRawSettingsValue();
		scope._settings = Helpers.GetSettings(scope._settingsRaw);
		scope._barsMouseDown = FALSE;
		scope._defaultWindowsSizes = {};
		scope._bars = [];
		scope._barsWithWindows = [];
		scope._iconsCfg = {};
		scope._innerWindows = {};
		scope._focusedBoxedWindowKey = emptyStr;
		scope._windowsSettingsStr = emptyStr;
		scope._unboxedWindow = {};
    };
    Desharp[getInstanceStr] = function () {
		if (!Desharp._instance) Desharp._instance = new Desharp();
		return Desharp._instance;
	};
    Desharp[settingsKeyStr] = desharpStr;
    Desharp[refreshTimeLimitStr] = 15; // seconds
	Desharp._instance = NULL;
	Desharp._barItemNameCounter = 0;
    Desharp.OPENED_CSS_CLASS = " opened";
    Desharp.CLICK_CSS_CLASS_BEGIN = "click click-";
    Desharp.DUMP_CSS_CLASS_BEGIN = "dump dump-";
    Desharp.HTML_CODE_CSS_CLASS = "html-code";
    Desharp[prototypeStr] = {
		"BarIcons": function (iconsCfg) {
			this._iconsCfg = iconsCfg;
			return this;
		},
		"DefaultWindowsSizes": function (defaultWindowsSizes) {
			this._defaultWindowsSizes = defaultWindowsSizes;
			return this;
		},
		"AddBar": function (barItemsCfg) {
			var scope = this||{},
				newBarCollection = {},
				newBarCollectionIndex = scope._bars[lengthStr],
				nameStr = "name",
				barItemName = nameStr+(Desharp._barItemNameCounter++),
				contentArr = [],
				cfg;
			newBarCollection[barItemName] = new BarItem(
				scope, newBarCollectionIndex, barItemName, 
				newBarCollectionIndex > 0 ? "redirect" : "DESHARP", 
				[classStr, "title"], 0, emptyStr, []
			);
			for (var i = 0, l = barItemsCfg[lengthStr]; i < l; i += 1) {
				cfg = barItemsCfg[i];
				barItemName = cfg["name"] || nameStr+(Desharp._barItemNameCounter++);
				newBarCollection[barItemName] = new BarItem(
					// desharp, barIndex, itemName, title, icon, mode, content, settings
					scope,
					newBarCollectionIndex,
					barItemName, 
					cfg["title"] || emptyStr, 
					scope._iconsCfg[barItemName] || [],
					typeof(cfg["mode"]) != undefinedStr ? cfg["mode"] : 2,
					cfg["content"] || emptyStr,
					scope._getWindowsSettings(newBarCollectionIndex, barItemName)
				);
			}
			scope._bars.push(newBarCollection);
            return scope;
        },
		"RenderBars": function () {
			var scope = this;
            if (doc[bodyStr] == NULL) {
                Helpers.AddEvent(win, "load", function () {
                	scope._initBar();
                });
            } else {
            	scope._initBar();
            }
            return scope;
        },
		RenderWindow: function (index, name, contentStr) {
			//window.trace = window.opener.trace;
        	var scope = this || {},
				unboxedWindow = scope._unboxedWindow;
        	if (unboxedWindow instanceof BarItem) {
        		unboxedWindow.RefreshWindow();
        	} else {
				scope._unboxedWindow = (new BarItem(
					// desharp, barIndex, itemName, title, icon, mode, content, settings
					scope, index, name, emptyStr, [], 2, contentStr, scope._getWindowsSettings(index, name)
				)).InitWindow();
        	}
        },
		"CloseBars": function () {
			this.CloseHandler()
		},
		StoreWindowSettings: function (barIndex, barItemName, settingsValues, write) {
			this.StoreWindowSettingsLocal(barIndex, barItemName, settingsValues, write);
		},
		CloseUnboxedWindowAfterLimit: function (closeBtnCall) {
			this._unboxedWindow.CloseUnboxedWindowAfterLimitLocal(closeBtnCall);
		},
		BarItemUnboxedWindowClosed: function (barIndex, barItemName, settingsValues) {
			var scope = this || {},
				barItems = scope._bars[barIndex] || [],
				barItem = barItems[barItemName];
			if (barItem) barItem.UnboxedWindowClosed(settingsValues);
		},
		StoreWindowSettingsLocal: function (barIndex, barItemName, settingsValues, write) {
			// var windowsSettings = [{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]},{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]}];
			var scope = this || {},
				windowsSettings = [],
				barSettings = {},
				newRawSettingsValue = Helpers.GetRawSettingsValue();
			// if there was any settings change - by another window for example - load settings again
			if (scope._settingsRaw != newRawSettingsValue) {
				scope._settingsRaw = newRawSettingsValue;
				scope._settings = Helpers.GetSettings(newRawSettingsValue);
			};
			// get settings windows section
			windowsSettings = scope._settings[windowsStr] || [];
			// if there is no record under called bar index -  create a new place
			if (!windowsSettings[barIndex] && typeof (windowsSettings[barIndex]) == undefinedStr) {
				windowsSettings[barIndex] = {};
			};
			// put new window setting values
			windowsSettings[barIndex][barItemName] = settingsValues || [];
			// put windows section (only for cases when new windows settings section was created before)
			scope._settings[windowsStr] = windowsSettings;
			if (write) scope._storeSettings(TRUE);
		},
        RegisterBoxedWindow: function (barIndex, itemName, winElm) {
			this._innerWindows[itemName + underScoreStr + barIndex] = winElm;
		},
		SetBoxedWindowToFront: function (barIndex, itemName) {
            var scope = this||{}, 
				key = itemName + underScoreStr + barIndex;
			if (scope._focusedBoxedWindowKey == key) return;
			if (scope._focusedBoxedWindowKey) {
				Helpers.RemoveClass(
					scope._innerWindows[scope._focusedBoxedWindowKey], currentStr
				);
			}
			Helpers.AddClass(
				scope._innerWindows[key], currentStr
			);
			scope._focusedBoxedWindowKey = key;
		},
		CloseHandler: function () {
			var scope = this || {};
			Helpers.AddClass(scope.ContElm, hiddenStr);
			scope._windowBeforeUnloadHandler(TRUE);
		},
		_initBar: function () {
			var scope = this;
			scope._initBarContAndPanelWindows();
			scope._initBarPositions();
			scope._initBarMovingEvents();
			scope._initWindowEvents();
			setTimeout(function () {
				Helpers.RemoveClass(scope.ContElm, invisibleStr)
			});
		},
		_getWindowsSettings: function (barIndex, barItemName) {
			// var windowsSettings = [{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]},{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]}];
			var scope = this||{},
				windowsSettings = scope._settings[windowsStr] || [],
				barSettings = {},
				result = [],
				windowDefaultSizes = [];
			if (windowsSettings[barIndex] && Helpers.TypeOf(windowsSettings[barIndex]) == objectStr) {
				barSettings = windowsSettings[barIndex];
				if (barSettings[barItemName] && Helpers.TypeOf(barSettings[barItemName]) == arrayStr) {
					result = barSettings[barItemName];
				}
			}
			if (!result[lengthStr]) {
				windowDefaultSizes = scope._defaultWindowsSizes[barItemName] || [300,200];
				result = [0, 0, windowDefaultSizes[0], windowDefaultSizes[1], 0];
            };
			return result;
		},
		_initBarContAndPanelWindows: function () {
			var scope = this,
				bars = scope._bars,
				barsSettingsSection = scope._settings[barStr],
				barsSettingsSection = barsSettingsSection ? barsSettingsSection.slice(0) : [],
				bar, barItem, barsElm, barElm, contElm;
			if (bars[0]) {
				bars[0][closeStr] = new BarItem(
					scope, 0, closeStr, "\u00D7", [classStr, closeStr], 1, function () { scope.CloseHandler(); }, []
				);
			}
			contElm = Helpers.CreateElm(divStr, invisibleStr, desharpStrLower);
			barsElm = Helpers.CreateElm(divStr, "bars");
			for (var i = 0, l = bars[lengthStr]; i < l; i += 1) {
				barElm = Helpers.CreateElm(divStr, "bar" + (i == 0 ? currentStr : emptyStr));
				bar = bars[i];
				for (var itemName in bar) {
					barItem = bar[itemName].InitBar();
					Helpers.Append(barElm, barItem.BarElm);
					if (barItem.WinElm) {
						if (barItem.WinElm[nodeNameStr] && barItem.WinElm[nodeNameStr][toLowerCaseStr]() == divStr) {
							Helpers.Append(contElm, barItem.WinElm);
						}
						scope._barsWithWindows.push(barItem);
					}
				}
				barElm = Helpers.Append(barsElm, barElm);
			}
			setTimeout(function(){
				scope._settings[barStr] = barsSettingsSection;
			});
            barsElm = Helpers.Append(contElm, barsElm);
			contElm = Helpers.Append(doc[bodyStr], contElm);
			scope.PositionsAndSizes[2] = barsElm[offsetWidthStr];
			scope.PositionsAndSizes[3] = barsElm[offsetHeightStr];
			for (i = 0, l = scope._barsWithWindows[lengthStr]; i < l; i += 1) {
				scope._barsWithWindows[i].BarElmAppended();
			}
            scope.BarsElm = barsElm;
            scope.ContElm = contElm;
		},
		_initBarPositions: function () {
			var scope = this,
				barsElm = scope.BarsElm,
				positions = scope._settings[barStr] || [0,0];
			scope.PositionsAndSizes[0] = positions[0];
			scope.PositionsAndSizes[1] = positions[1];
			Helpers.StyleElmProp(barsElm[styleStr], rightStr, positions[0]);
			Helpers.StyleElmProp(barsElm[styleStr], bottomStr, positions[1]);
		},
		_initBarMovingEvents: function () {
			var scope = this,
				addEventFn = Helpers.AddEvent,
				barsElm = scope.BarsElm;
			addEventFn(barsElm, mouseStr + downStr, function (e) {
				var viewPort = Helpers.GetViewPortSizes(win),
					offsetLeftTop = Helpers.GetElementLeftTopOffset(barsElm, viewPort);
				scope._barsMouseDown = TRUE;
				scope._moveCoords = [e[pageXStr], e[pageYStr]];
				scope.PositionsAndSizes[0] = viewPort[0] - (barsElm[offsetWidthStr] + offsetLeftTop[0]);
				scope.PositionsAndSizes[1] = viewPort[1] - (barsElm[offsetHeightStr] + offsetLeftTop[1]);
			});
			Helpers.AddDocumentMouseMoveHandler(function (e) {
				if (!scope._barsMouseDown) return;
				var viewPort = Helpers.GetViewPortSizes(win),
					x = scope.PositionsAndSizes[0] + (scope._moveCoords[0] - e[pageXStr]),
					y = scope.PositionsAndSizes[1] + (scope._moveCoords[1] - e[pageYStr]),
					xMax = viewPort[0] - barsElm[offsetWidthStr],
					yMax = viewPort[1] - barsElm[offsetHeightStr];
				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (x >= xMax) x = xMax - 1;
				if (y >= yMax) y = yMax;
				Helpers.StyleElmProp(barsElm[styleStr], rightStr, x);
				Helpers.StyleElmProp(barsElm[styleStr], bottomStr, y);
			});
			addEventFn(barsElm, mouseStr + upStr, function (e) {
				var viewPort = Helpers.GetViewPortSizes(win),
					barsElm = scope.BarsElm,
                    offsetLeftTop = Helpers.GetElementLeftTopOffset(barsElm, viewPort);
				scope._barsMouseDown = FALSE;
				scope.PositionsAndSizes[0] = viewPort[0] - (barsElm[offsetWidthStr] + offsetLeftTop[0]);
				scope.PositionsAndSizes[1] = viewPort[1] - (barsElm[offsetHeightStr] + offsetLeftTop[1]);
				scope._storeSettings(FALSE);
			});
		},
		_initWindowEvents: function () {
			var scope = this;
			Helpers.AddEvent(win, resizeStr, function () {
				scope._windowResizeHandler();
			});
			win[onbeforeunloadStr] = function () {
				scope._windowBeforeUnloadHandler(FALSE);
			};
		},
		_windowResizeHandler: function () {
			var scope = this || {},
				viewPort = Helpers.GetViewPortSizes(win);
			for (i = 0, l = scope._barsWithWindows[lengthStr]; i < l; i += 1) {
				scope._barsWithWindows[i].WindowResizeHandler(viewPort);
			}
			scope._storeSettings(TRUE);
		},
		_windowBeforeUnloadHandler: function (closeBtnCall) {
			// close all unboxed windows
			var scope = this || {};
			for (var i = 0, l = scope._barsWithWindows[lengthStr]; i < l; i += 1) {
				scope._barsWithWindows[i].CloseUnboxedWindow(closeBtnCall);
			}
		},
		_storeSettings: function (windowSettingsChange) {
			var scope = this||{};
			if (windowSettingsChange || !scope._windowsSettingsStr) {
				scope._windowsSettingsStr = Helpers.StringifyWindowsSettings(scope._settings[windowsStr]);
			}
			Helpers.SaveSettings(
				"{"
					+ barStr + ":[" + scope.PositionsAndSizes.join(",") + "],"
					+ windowsStr + ":" + scope._windowsSettingsStr
				+ "}"
			);
		}
    };
    var BarItem = function (desharp, barIndex, itemName, title, icon, mode, content, settings) {
    	var scope = this||{};
		scope.WinElm = NULL;
		scope.BarElm = NULL;
		scope.Title = title;
		scope._desharp = desharp;
		scope._barIndex = barIndex;
		scope._itemName = itemName;
		scope._icon = icon;
		scope._mode = mode;
		scope._content = content;
		scope._settings = settings;
		scope._barBtnMouseOver = FALSE;
		scope._windowMouseOver = FALSE;
        scope._headMouseDown = FALSE;
        scope._cornerResizerMouseDown = FALSE;
		scope._leftResizerMouseDown = FALSE;
		scope._bottomResizerMouseDown = FALSE;
        scope._moveAndResizeSizes = [0, 0, 0, 0];
        scope._clickSpans = {};
        scope._dumpDivs = {};
        scope._closingOriginWindowProcess = FALSE;
        scope._closingOriginWindowTimeout = 0;
        scope._screenContentDisplayed = FALSE;
    };
    BarItem.Resizing = {
    	status: FALSE,
    	barItem: NULL,
		resizerIndex: 0
    };
    BarItem[prototypeStr] = {
    	InitBar: function () {
    		var scope = this || {};
    		scope._initBarElm();
    		if (scope._mode == 3) {
    			scope._initBarScreenContent();
    		} else if (scope._mode == 2) {
    			if (scope._settings[4] > 1) {
    				Helpers.AddClass(scope.BarElm, currentStr);
    				if (!scope._initBarUnboxedWindow()) {
    					scope._settings[4] = 1;
    					scope
							._initBarBoxedWindowElmsAndEvents()
							._initContent()
							._openFirstLevelItems();
    				}
    			} else {
    				scope
						._initBarBoxedWindowElmsAndEvents()
						._initContent()
						._openFirstLevelItems();
    			}
    		}
			return scope;
		},
		InitWindow: function () {
			return this
				._initWindowElms()
				._initWindowEvents()
				._initContent()
				._openFirstLevelItems();
		},
		RefreshWindow: function () {
			var scope = this || {};
			if (Helpers.Chrome || Helpers.Safari) clearInterval(scope._closingOriginWindowTimeout);
			return scope
				._initWindowElms()
				._initContent()
				._openFirstLevelItems();
		},
		BarElmAppended: function () {
			var scope = this || {},
				settings = scope._settings,
				addClassFn = Helpers.AddClass,
				removeClassFn = Helpers.RemoveClass,
				winElm = scope.WinElm;
			if (scope._mode == 2 && settings[4] < 2) {
				scope._headSize = scope._head[offsetHeightStr];
				if (!settings[4]) {
					addClassFn(winElm, hiddenStr);
				} else {
					scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
					scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
				}
				removeClassFn(winElm, invisibleStr);
			} else if (scope._mode == 3) {
				scope._initBarScreenContentHandleCallstackTable();
				if (!scope._screenContentDisplayed) addClassFn(winElm, hiddenStr);
				removeClassFn(winElm, invisibleStr);
			}
		},
		UnboxedWindowClosed: function (settingsValues) {
			var scope = this || {};
			Helpers.RemoveClass(scope.BarElm, currentStr);
			scope._settings = settingsValues;
			scope
				._initBarBoxedWindowElmsAndEvents()
				._initContent()
				._openFirstLevelItems();
			Helpers.Append(scope._desharp.ContElm, scope.WinElm);
			scope.BarElmAppended();
		},
		WindowResizeHandler: function (viewPort) {
			var scope = this || {};
			if (scope._mode == 2 && scope._settings[4] == 1) {
				scope._correctBoxedWindowToVisiblePositionsAndSizes(viewPort);
				scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, scope._settings, FALSE);
			} else if (scope._mode == 3) {
				if (scope._screenContentDisplayed) scope._initBarScreenContentHandleCallstackTable();
			}
		},
		CloseUnboxedWindow: function (closeBtnCall) {
			var scope = this || {};
			if (scope._settings[4] == 2) {
				scope.WinElm[desharpStr][getInstanceStr]().CloseUnboxedWindowAfterLimit(closeBtnCall);
			}
		},
		CloseUnboxedWindowAfterLimitLocal: function (closeBtnCall) {
			var scope = this || {};
			scope._closingOriginWindowProcess = TRUE;
			if ((Helpers.Chrome || Helpers.Safari) && !closeBtnCall) {
				scope._closingOriginWindowTimeout = setTimeout(function () {
					win.close();
				}, Desharp[refreshTimeLimitStr] * 1000);
			} else {
				win.close();
			}
		},
		_initBarElm: function () {
			var scope = this,
				elmFn = Helpers.CreateElm,
				addEventFn = Helpers.AddEvent,
				iconSettings = scope._icon,
				barElmAdditionalCls = emptyStr, barElmCls = emptyStr, 
				barIconCode = emptyStr, barElm;
			if (iconSettings[0]) {
				if (iconSettings[0] == classStr) {
					barElmAdditionalCls = "css-icon " + iconSettings[1];
				} else if (iconSettings[0] == "code") {
					barElmAdditionalCls = "code-icon";
					barIconCode = iconSettings[1];
				}
			}
			if (scope._settings[4] == 1) barElmAdditionalCls += currentStr;
			if (scope._mode) {
				barElm = elmFn(divStr, "btn " + barElmAdditionalCls);
				if (scope._mode == 3) {
					addEventFn(barElm, clickStr, function () {
						scope._barBtnMouseClickHandlerShowOrHideScreenContent(!scope._screenContentDisplayed);
					});
					addEventFn(win, keyupStr, function (e) {
						if (e.keyCode == 27 && scope._screenContentDisplayed) { // ESC
							scope._barBtnMouseClickHandlerShowOrHideScreenContent(FALSE);
						};
					});
				} else if (scope._mode == 2) {
					addEventFn(barElm, mouseStr + overStr, function (e) {
						scope._barBtnMouseOverHandler(e);
					});
					addEventFn(barElm, mouseStr + outStr, function (e) {
						scope._barBtnMouseOutHandler(e);
					});
					addEventFn(barElm, clickStr, function (e) {
						scope._barBtnMouseClickHandlerPinOrShowOrHideWindow(e);
					});
				} else {
					addEventFn(barElm, clickStr, function (e) {
						scope._content(e);
					});
				}
			} else {
				barElm = elmFn(divStr, "item " + barElmAdditionalCls);
			}
			barElm[innerHTMLStr] = barIconCode + scope.Title;
			scope.BarElm = barElm;
			return scope;
		},
		_initBarScreenContent: function () {
			var scope = this || {},
				elmFn = Helpers.CreateElm,
				appendFn = Helpers.Append,
				displayContentDirectly = FALSE,
				winElm;
			if (Helpers.IndexOf(scope._content, '>Catched: no') > -1) displayContentDirectly = TRUE;
			winElm = elmFn(divStr, "screen " + invisibleStr);
			winElm[innerHTMLStr] = scope._content;
			scope.WinElm = winElm;
			if (displayContentDirectly) Helpers.AddClass(scope.BarElm, currentStr);
			scope._screenContentDisplayed = displayContentDirectly;
		},
		_initBarScreenContentHandleCallstackTable: function () {
			var winElm = this.WinElm,
				tableElms = winElm[getElementsByTagNameStr]("table"),
				indexOf = Helpers.IndexOf,
				tableElm = {},
				tableElmWidth = 0,
				trElms = [],
				trElm = {},
				tdElms = [],
				tdElm = {},
				tdWidth = 0,
				nowrapClass = "nowrap",
				iMethodElm = {};
			for (var i = 0, l = tableElms[lengthStr]; i < l; i += 1) {
				tableElm = tableElms[i];
				if (indexOf(tableElm[parentNodeStr][parentNodeStr][parentNodeStr][classNameStr], "callstack") > -1) {
					Helpers.RemoveClass(tableElm, nowrapClass);
					tableElmWidth = tableElm[offsetWidthStr];
					trElms = tableElm[getElementsByTagNameStr]("tr");
					for (var j = 0, k = trElms[lengthStr]; j < k; j += 1) {
						trElm = trElms[j];
						tdElms = trElm[getElementsByTagNameStr]("td");
						tdWidth = tableElmWidth - (tdElms[0][offsetWidthStr] + tdElms[1][offsetWidthStr] + 10);
						tdElms[2][styleStr][widthStr] = tdWidth + pxStr;
					};
					Helpers.AddClass(tableElm, spaceStr + nowrapClass);
					break;
				}
			}
		},
		_initBarBoxedWindowElmsAndEvents: function () {
			var scope = this||{};
			scope._initBarBoxedWindowElms();
			scope._desharp.RegisterBoxedWindow(scope._barIndex, scope._itemName, scope.WinElm);
			scope._initBarBoxedWindowEvents();
			return scope;
		},
		_initBarBoxedWindowElms: function () {
			var scope = this||{},
				elmFn = Helpers.CreateElm,
				appendFn = Helpers.Append,
				addEventFn = Helpers.AddEvent,
				winElm, head, _close, unbox, body, inner,
				cornerResizer, leftResizer, bottomResizer;
			
			winElm = elmFn(divStr, "win " + scope._itemName + spaceStr + invisibleStr);
			inner = elmFn(divStr, "inner");
			head = elmFn(divStr, "head");
			_close = elmFn(divStr, closeStr);
			unbox = elmFn(divStr, "unbox");
			body = elmFn(divStr, bodyStr);
			cornerResizer = elmFn(divStr, "corner");
			leftResizer = elmFn(divStr, "left");
			bottomResizer = elmFn(divStr, "bottom");
			
			head[innerHTMLStr] = scope.Title;
			body[innerHTMLStr] = scope._content;
			
			_close = appendFn(head, _close);
			unbox = appendFn(head, unbox);
			head = appendFn(inner, head);
			body = appendFn(inner, body);
			inner = appendFn(winElm, inner);
			leftResizer = appendFn(winElm, leftResizer);
			bottomResizer = appendFn(winElm, bottomResizer);
			cornerResizer = appendFn(winElm, cornerResizer);
			
			scope.WinElm = winElm;
			scope._close = _close;
			scope._unbox = unbox;
			scope._head = head;
			scope._body = body;
			scope._inner = inner;
			scope._cornerResizer = cornerResizer;
			scope._leftResizer = leftResizer;
			scope._bottomResizer = bottomResizer;
		},
		_initBarBoxedWindowEvents: function () {
			var scope = this || {},
				addEventFn = Helpers.AddEvent,
				addMouseMoveEvent = Helpers.AddDocumentMouseMoveHandler,
				headElm = scope._head,
				cornerResizer = scope._cornerResizer,
				leftResizer = scope._leftResizer,
				bottomResizer = scope._bottomResizer,
				settings = scope._settings,
				mouseUpStr = mouseStr + upStr,
				mouseDownStr = mouseStr + downStr;
			
			// mouse over inner window brings current window into front between inner windows
			addEventFn(scope.WinElm, mouseStr + overStr, function (e) {
				if (!BarItem._resizing) {
					scope._windowMouseOver = TRUE;
					scope._desharp.SetBoxedWindowToFront(scope._barIndex, scope._itemName);
				}
            });
			addEventFn(scope.WinElm, mouseStr + outStr, function (e) {
				scope._windowMouseOver = FALSE;
                scope._hideUnpinnedWindowIfNecessary();
            });
				
			// boxed window head moving
			addEventFn(headElm, mouseDownStr, function (e) {
                scope._headMouseDown = TRUE;
				scope._pinBoxedWindow();
				scope._moveAndResizeSizes = [ // mouse x, mouse y, window right, window bottom
					e[pageXStr], e[pageYStr], 
					settings[0], settings[1] 
				];
            });
			addMouseMoveEvent(function (e) {
				if (!scope._headMouseDown) return;
				var moveAndResizeSizes = scope._moveAndResizeSizes;
				settings[0] = moveAndResizeSizes[2] + (moveAndResizeSizes[0] - e[pageXStr]);
				settings[1] = moveAndResizeSizes[3] + (moveAndResizeSizes[1] - e[pageYStr]);
				scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
			});
			addEventFn(headElm, mouseUpStr, function () {
                scope._headMouseDown = FALSE;
                scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, settings, TRUE);
            });
			
			// boxed window corner resizing
			addEventFn(cornerResizer, mouseDownStr, function (e) {
				scope._barBoxedWindowSetUpResizingStaticinfo(0);
                scope._cornerResizerMouseDown = TRUE;
				scope._pinBoxedWindow();
                scope._moveAndResizeSizes = [ // mouse x, mouse y, window width, window height
					e[pageXStr], e[pageYStr], 
					settings[2], settings[3] 
				];
				// style window temporary by top and left coordinates
				scope._styleBoxedWindowSetLeftTopPositions();
            });
            addMouseMoveEvent(function (e) {
				if (!scope._cornerResizerMouseDown) return;
				var moveAndResizeSizes = scope._moveAndResizeSizes;
				settings[2] = moveAndResizeSizes[2] - (moveAndResizeSizes[0] - e[pageXStr]);
				settings[3] = moveAndResizeSizes[3] - (moveAndResizeSizes[1] - e[pageYStr]);
				scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
			});
			
			// boxed window left resizing
            addEventFn(leftResizer, mouseDownStr, function (e) {
            	scope._barBoxedWindowSetUpResizingStaticinfo(1);
                scope._leftResizerMouseDown = TRUE;
                scope._pinBoxedWindow();
                scope._moveAndResizeSizes[0] = e[pageXStr]; // mouse x
                scope._moveAndResizeSizes[2] = settings[2]; // window width
				// style window temporary by top and left coordinates
				scope._styleBoxedWindowSetLeftTopPositions();
            });
            addMouseMoveEvent(function (e) {
				if (!scope._leftResizerMouseDown) return;
				var moveAndResizeSizes = scope._moveAndResizeSizes;
				settings[2] = moveAndResizeSizes[2] - (moveAndResizeSizes[0] - e[pageXStr]);
				scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
			});
			
			// boxed window bottom resizing
            addEventFn(bottomResizer, mouseDownStr, function (e) {
            	scope._barBoxedWindowSetUpResizingStaticinfo(2);
                scope._bottomResizerMouseDown = TRUE;
                scope._pinBoxedWindow();
                scope._moveAndResizeSizes[1] = e[pageYStr]; // mouse y
                scope._moveAndResizeSizes[3] = settings[3]; // window height
				// style window temporary by top and left coordinates
				scope._styleBoxedWindowSetLeftTopPositions();
            });
            addMouseMoveEvent(function (e) {
				if (!scope._bottomResizerMouseDown) return;
				var moveAndResizeSizes = scope._moveAndResizeSizes;
				settings[3] = moveAndResizeSizes[3] - (moveAndResizeSizes[1] - e[pageYStr]);
				scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
			});
			
			// global window mouse up
            addEventFn(doc, mouseUpStr, function (e) {
            	var resizing = BarItem.Resizing;
            	if (resizing.status) {
            		resizing.barItem._barBoxedWindowResizerMouseUpHandler(resizing.resizerIndex);
            		resizing.status = FALSE;
            	}
            });

			// boxed window body content dump click
            addEventFn(scope._body, clickStr, function (e) {
                scope._bodyClickHandler(e[targetStr]);
            });

			// unbox and close
			addEventFn(scope._close, clickStr, function () {
				scope._unpinBoxedWindow();
				Helpers.AddClass(scope.WinElm, hiddenStr);
				scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, settings, TRUE);
            });
			addEventFn(scope._unbox, clickStr, function () {
				scope._innerWindowUnboxHandler();
            });
		},
		_initBarUnboxedWindow: function () {
			var scope = this || {},
				settings = scope._settings,
				width = settings[2],
				height = settings[3],
				topPanelsHeightAndLeftMargin = Helpers.GetWindowTopPanelsHeightAndLeftMargin(win),
				leftAndRightWindowMargins = topPanelsHeightAndLeftMargin[1] * 2,
				windowOpenOrConnectionResult = 0;
			settings[2] -= leftAndRightWindowMargins;
			settings[3] -= leftAndRightWindowMargins + 50 /* 50 - approximate height of browser window head and address line */;
			windowOpenOrConnectionResult = scope._initBarUnboxedWindowOpenOrConnectToExisting.apply(scope, scope._settings);
			if (windowOpenOrConnectionResult > -1) {
				if (!windowOpenOrConnectionResult) scope._initBarUnboxedWindowWriteFirstTimeBaseContent();
				scope._initBarUnboxedWindowExecutionCall();
				scope._correntNewWindowSizeAfterOpening(width, height);
				return TRUE;
			} else {
				return FALSE;
			}
		},
		_initBarUnboxedWindowOpenOrConnectToExisting: function (left, top, width, height) {
			var scope = this || {},
				settings = scope._settings,
				target = (
					underScoreStr + desharpStrLower +
					underScoreStr + scope._barIndex +
					underScoreStr + scope._itemName
				)[toLowerCaseStr]();
			scope.WinElm = win["open"](
				emptyStr,
				target,
				"left=" + left + ",top=" + top + ",width=" + width + ",height=" + height
				+ ",menubar=no,toolbar=no,location=no,personalbar=no,status=no,resizable=yes,scrollbars=yes"
			);
			//scope.WinElm.name = target;
			// return 1 if openedWindow.Desharp instance exists, 0 if not and -1 if not opened
			if (!scope.WinElm) return -1;
			return typeof (scope.WinElm[desharpStr]) != undefinedStr ? 1 : 0;
		},
		_initBarUnboxedWindowWriteFirstTimeBaseContent: function () {
			var scope = this || {},
				unboxedDoc = scope.WinElm["document"],
				wrapNode = Helpers.WrapNode;
			unboxedDoc["write"](
				"<!DOCTYPE html>"
				+wrapNode(
					"html",
					wrapNode(
						"head",
						"<meta charset="+quotStr+"utf-8"+quotStr+"/>"
						+wrapNode("title", scope.Title)
						+wrapNode("script", Helpers.GetRunningCodeJsDeclaration())
						+wrapNode("style", Helpers.GetDesharpStyleDeclaration())
					)
					+wrapNode(
						"body", emptyStr, "desharp-unbox-win " + scope._itemName
					)
				)
			);
		},
		_initBarUnboxedWindowExecutionCall: function () {
			var scope = this || {};
			scope.WinElm[desharpStr][getInstanceStr]().RenderWindow(
				scope._barIndex, scope._itemName, scope._content
			);
		},
		_barBoxedWindowSetUpResizingStaticinfo: function (resizerIndex) {
			var scope = this || {},
				resizing = BarItem.Resizing;
			resizing.status = TRUE;
			resizing.barItem = scope;
			resizing.resizerIndex = resizerIndex;
			scope._desharp.SetBoxedWindowToFront(scope._barIndex, scope._itemName);
		},
		_barBoxedWindowResizerMouseUpHandler: function (index) {
			var scope = this || {},
				winElm = scope.WinElm,
				settings = scope._settings;
			BarItem.Resizing.status = FALSE;
			scope._cornerResizerMouseDown = FALSE;
			scope._leftResizerMouseDown = FALSE;
			scope._bottomResizerMouseDown = FALSE;
			if (index < 2) settings[0] = -(winElm[offsetLeftStr] + winElm[offsetWidthStr]);
			if (index != 1) settings[1] = -(winElm[offsetTopStr] + winElm[offsetHeightStr]);
			if (index == 1) settings[2] = winElm[offsetWidthStr];
			if (index == 2) settings[3] = winElm[offsetHeightStr];
			scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
			scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, settings, TRUE);
		},
		_initWindowElms: function () {
			var scope = this || {},
				docBody = doc[bodyStr];
			// clear any previous content and replace with new
			docBody[innerHTMLStr] = scope._content;
			scope._body = docBody;
			return scope;
		},
		_initWindowEvents: function () {
			var scope = this,
				addEvent = Helpers.AddEvent;
			// body content dump click
			addEvent(doc[bodyStr], clickStr, function (e) {
				scope._bodyClickHandler(e[targetStr]);
			});
			// window moves
			if (Helpers.OldIe) {
				doc["onfocusin"] = function () {
					scope._storeUnboxedWindowSettings(FALSE);
				};
				doc["onfocusout"] = function () {
					scope._storeUnboxedWindowSettings(FALSE);
				};
			} else {
				addEvent(win, "focus", function () {
					scope._storeUnboxedWindowSettings(FALSE);
				});
				addEvent(win, "blur", function () {
					scope._storeUnboxedWindowSettings(FALSE);
				});
			};
			// window resizes
			addEvent(win, resizeStr, function () {
				scope._storeUnboxedWindowSettings(FALSE);
			});
			// window closing
			addEvent(win, keyupStr, function (e) {
				if (e.keyCode == 27) { // ESC
					scope._storeUnboxedWindowSettings(TRUE);
				};
			});
			win[onbeforeunloadStr] = function (e) {
				scope._storeUnboxedWindowSettings(TRUE);
			};
			return scope;
		},
		_barBtnMouseOverHandler: function (e) {
			var scope = this||{},
				viewPort = [], 
				settings = scope._settings,
				offsetLeftTop = [],
				eventTarget, barsElm;
			scope._barBtnMouseOver = TRUE;
			if (!settings[4]) {
				//not pinned window
				viewPort = Helpers.GetViewPortSizes(win);
				eventTarget = e[targetStr];
				eventTarget = eventTarget[nodeNameStr][toLowerCaseStr]() == "img" ? eventTarget[parentNodeStr] : eventTarget;
				barsElm = scope._desharp.BarsElm;
				offsetLeftTop = Helpers.GetElementLeftTopOffset(barsElm, viewPort);
				settings[0] = viewPort[0] - (offsetLeftTop[0] + eventTarget[offsetLeftStr] + eventTarget[offsetWidthStr]);
				settings[1] = viewPort[1] - offsetLeftTop[1];
				scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
				scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
				Helpers.RemoveClass(scope.WinElm, hiddenStr);
			}
		},
		_barBtnMouseOutHandler: function (e) {
			var scope = this||{};
			scope._barBtnMouseOver = FALSE;
			scope._hideUnpinnedWindowIfNecessary();
		},
		_barBtnMouseClickHandlerPinOrShowOrHideWindow: function (e) {
			var scope = this || {},
				settings = scope._settings,
				windowMode = settings[4];
			// unpin or hide window
			if (!windowMode) {
				scope._barBtnMouseOverHandler(e);
				scope._pinBoxedWindow();
				settings[0] += 20;
				settings[1] += 20;
				scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
				scope._correctBoxedWindowToVisiblePositionsAndSizes(Helpers.GetViewPortSizes(win));
			} else if (windowMode == 1) {
				scope._unpinBoxedWindow();
				Helpers.AddClass(scope.WinElm, hiddenStr);
			} else if (windowMode == 2) {
				Helpers.RemoveClass(scope.BarElm, currentStr);
				settings[4] = 0;
				var oldWindow = scope.WinElm;
				setTimeout(function () {
					oldWindow[closeStr]();
				});
				scope
					._initBarBoxedWindowElmsAndEvents()
					._initContent()
					._openFirstLevelItems();
				Helpers.Append(scope._desharp.ContElm, scope.WinElm);
				scope.BarElmAppended();
			}
			scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, settings, TRUE);
		},
		_barBtnMouseClickHandlerShowOrHideScreenContent: function (showContent) {
			var scope = this || {},
				removeClsFn = Helpers.RemoveClass,
				addClsFn = Helpers.AddClass,
				winElm = scope.WinElm,
				barElm = scope.BarElm,
				docBody = doc[bodyStr],
				desharpScreenCls = desharpStrLower + '-screen';
			if (showContent) {
				removeClsFn(winElm, hiddenStr);
				addClsFn(barElm, currentStr);
				addClsFn(docBody, desharpScreenCls);
			} else {
				addClsFn(winElm, hiddenStr);
				removeClsFn(barElm, currentStr);
				removeClsFn(docBody, desharpScreenCls);
			}
			scope._screenContentDisplayed = showContent;
		},
		_innerWindowUnboxHandler: function () {
			var scope = this,
				desharpInstance = scope._desharp,
				settings = scope._settings,
				winElm = scope.WinElm,
				width = settings[2],
				height = settings[3],
				viewPort = Helpers.GetViewPortSizes(win),
				leftTopOffset = Helpers.GetElementLeftTopOffset(winElm, viewPort),
				windowPosition = Helpers.GetWindowPositions(),
				topPanelsHeightAndLeftMargin = Helpers.GetWindowTopPanelsHeightAndLeftMargin(win),
				windowLeftOrRightMargin = topPanelsHeightAndLeftMargin[1],
				windowTopPanelsHeight = topPanelsHeightAndLeftMargin[0],
				windowOpenOrConnectionResult = 0,
				oldSettings = [settings[0], settings[1], settings[2], settings[3], settings[4]];
			settings[0] = windowPosition[0] + windowLeftOrRightMargin + leftTopOffset[0];
			settings[1] = windowPosition[1] + windowTopPanelsHeight + leftTopOffset[1];
			settings[2] -= 2 * windowLeftOrRightMargin;
			settings[3] -= (2 * windowLeftOrRightMargin) + 50 /* 50 - approximate height of browser window head and address line */;
			settings[4] = 2;
			desharpInstance.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, settings, TRUE);
			windowOpenOrConnectionResult = scope._initBarUnboxedWindowOpenOrConnectToExisting.apply(scope, settings);
			if (windowOpenOrConnectionResult > -1) {
				desharpInstance.ContElm["removeChild"](winElm);
				if (!windowOpenOrConnectionResult) scope._initBarUnboxedWindowWriteFirstTimeBaseContent();
				scope._initBarUnboxedWindowExecutionCall();
				scope._correntNewWindowSizeAfterOpening(width, height);
			} else {
				desharpInstance.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, oldSettings, TRUE);
			}
		},
		_pinBoxedWindow: function () {
			var scope = this || {};
			scope._settings[4] = 1;
			Helpers.AddClass(scope.BarElm, currentStr);
		},
		_unpinBoxedWindow: function () {
			var scope = this || {};
			scope._settings[4] = 0;
			Helpers.RemoveClass(scope.BarElm, currentStr);
		},
		_correctBoxedWindowToVisiblePositionsAndSizes: function (viewPort) {
			var scope = this || {},
				settings = scope._settings,
                offsetLeftTop = Helpers.GetElementLeftTopOffset(scope.WinElm, viewPort),
				settingsStr = settings.join(",");
			if (offsetLeftTop[0] < 0) {
				settings[0] -= Math.abs(offsetLeftTop[0]);
				offsetLeftTop[0] = 0;
			}
			if (offsetLeftTop[1] < 0) {
				settings[1] -= Math.abs(offsetLeftTop[1]);
				offsetLeftTop[1] = 0;
			}
			if (offsetLeftTop[0] + settings[2] > viewPort[0]) {
				settings[2] = viewPort[0] - offsetLeftTop[0];
				settings[0] = 0;
			}
			if (offsetLeftTop[1] + settings[3] > viewPort[1]) {
				settings[3] = viewPort[1] - offsetLeftTop[1];
				settings[1] = 0;
			}
			if (settingsStr != settings.join(",")) {
				scope._styleBoxedWindowSetSizes(settings[2], settings[3]);
				scope._styleBoxedWindowSetRightBottomPositions(settings[0], settings[1]);
			}
		},
        _hideUnpinnedWindowIfNecessary: function () {
			var scope = this;
			if (!scope._settings[4]) {
				setTimeout(function(){
					if (!scope._barBtnMouseOver && !scope._windowMouseOver) Helpers.AddClass(scope.WinElm, hiddenStr);
				}, 200);
			}
		},
		_styleBoxedWindowSetSizes: function (w, h) {
			var scope = this || {},
                winStyle = scope.WinElm[styleStr],
                bodyStyle = scope._body[styleStr],
				styleFn = Helpers.StyleElmProp;
            styleFn(winStyle, widthStr, w);
            styleFn(winStyle, heightStr, h);
            styleFn(scope._inner[styleStr], heightStr, h);
            styleFn(scope._head[styleStr], widthStr, w - 0 + 2);
            styleFn(bodyStyle, widthStr, w - 8);
            styleFn(bodyStyle, heightStr, h - 8 - scope._headSize);
			return scope;
		},
		_styleBoxedWindowSetRightBottomPositions: function (right, bottom) {
			var scope = this||{},
				winElm = scope.WinElm,
				winStyle = winElm[styleStr],
				styleFn = Helpers.StyleElmProp;
			styleFn(winStyle, rightStr, right);
			styleFn(winStyle, bottomStr, bottom);
			styleFn(winStyle, leftStr, emptyStr);
			styleFn(winStyle, topStr, emptyStr);
		},
		_styleBoxedWindowSetLeftTopPositions: function () {
			var scope = this||{},
				winElm = scope.WinElm,
				winStyle = winElm[styleStr],
				styleFn = Helpers.StyleElmProp;
			styleFn(winStyle, leftStr, winElm[offsetLeftStr]);
			styleFn(winStyle, topStr, winElm[offsetTopStr]);
			styleFn(winStyle, rightStr, emptyStr);
			styleFn(winStyle, bottomStr, emptyStr);
		},
		_initContent: function () {
            var scope = this || {},
				elms = [],
				indexOf = Helpers.IndexOf,
				elm = {},
				cls = emptyStr,
				clsPos = 0,
                divKey = emptyStr,
				classIdFn = scope._getClickOrDumpEmlClassId,
				clsBegin = Desharp.CLICK_CSS_CLASS_BEGIN,
				htmlCodeCls = Desharp.HTML_CODE_CSS_CLASS;
            if (scope._mode < 2) return scope;
            scope._clickSpans = {};
            scope._dumpDivs = {};
			elms = scope._body[getElementsByTagNameStr](spanStr)
            for (var i = 0, l = elms[lengthStr]; i < l; i += 1) {
                elm = elms[i];
                cls = elm[classNameStr];
                clsPos = indexOf(cls, clsBegin);
                if (clsPos > -1) {
                    scope._clickSpans[classIdFn(elm, cls, clsPos, clsBegin)] = elm;
                }/* else if (indexOf(cls, htmlCodeCls) > -1) {
                    elm[innerHTMLStr] = elm[innerHTMLStr][replaceStr](/&/g, "&amp;")[replaceStr](/</g, "&lt;")[replaceStr](/>/g, "&gt;");
                }*/
            };
            elms = scope._body[getElementsByTagNameStr](divStr);
            clsBegin = Desharp.DUMP_CSS_CLASS_BEGIN;
            for (var i = 0, l = elms[lengthStr]; i < l; i += 1) {
                elm = elms[i];
                cls = elm[classNameStr];
                clsPos = indexOf(cls, clsBegin);
                if (clsPos > -1) {
                    divKey = classIdFn(elm, cls, clsPos, clsBegin);
                    if (typeof (scope._dumpDivs[divKey]) == undefinedStr) {
                        scope._dumpDivs[divKey] = [elm];
                    } else {
                        scope._dumpDivs[divKey][pushStr](elm);
                    }
                }
            };
			return scope;
		},
		_storeUnboxedWindowSettings: function (closingCall) {
			var scope = this || {},
				barIndex = scope._barIndex, 
				itemName = scope._itemName,
				sizes = Helpers.GetWindowOuterSizes(win),
				positions = Helpers.GetWindowPositions(),
				settings = scope._settings,
				winOpener = win["opener"],
				openerExist = winOpener && winOpener[desharpStr],
				desharp;

			settings[0] = positions[0];	// left
			settings[1] = positions[1];	// top
			settings[2] = sizes[0];		// width
			settings[3] = sizes[1];		// height

			// if opener window object no longer exists and you are closing debug unboxed window
			// do not store closed state, because this case is usually some forgotten unboxed window in background
			if (openerExist && closingCall && !scope._closingOriginWindowProcess) settings[4] = 0;

			if (openerExist) {
				desharp = winOpener[desharpStr][getInstanceStr]();
				desharp.StoreWindowSettings(barIndex, itemName, settings, TRUE);
				if (closingCall) desharp.BarItemUnboxedWindowClosed(barIndex, itemName, settings);
			} else {
				scope._desharp.StoreWindowSettingsLocal(barIndex, itemName, settings, TRUE);
			}
		},
        _openFirstLevelItems: function () {
            var scope = this||{},
				elm = {},
				firstDivs = [],
				firstSpans = [],
				clickClsBegin = Desharp.CLICK_CSS_CLASS_BEGIN;
            if (scope._mode < 2) return scope;
            Helpers.ForEachNode(scope._body, divStr, function (elm) {
            	firstDivs[pushStr](elm);
            });
            if (firstDivs[lengthStr] > 8) return;
            for (i = 0, l = firstDivs[lengthStr]; i < l; i += 1) {
                firstSpans = firstDivs[i][getElementsByTagNameStr](spanStr);
                for (var j = 0, k = firstSpans[lengthStr]; j < k; j += 1) {
                    elm = firstSpans[j];
                    if (Helpers.IndexOf(elm[classNameStr], clickClsBegin) > 0) {
                        scope._bodyClickHandler(elm);
                        break;
                    }
                }
            }
			return scope;
        },
        _getClickOrDumpEmlClassId: function (elm, cls, clsPos, clsBegin) {
            cls = cls[substrStr](clsPos);
            clsPos = Helpers.IndexOf(cls, spaceStr, clsBegin[lengthStr]);
            return cls[substrStr](clsBegin[lengthStr], (clsPos > -1 ? clsPos : cls[lengthStr]) - clsBegin[lengthStr]);
        },
        _bodyClickHandler: function (srcElm) {
            var scope = this || {},
				cls = srcElm[classNameStr],
				clsBegin = Desharp.CLICK_CSS_CLASS_BEGIN,
				indexOf = Helpers.IndexOf,
				clsPos = indexOf(cls, clsBegin),
				dumpElms = [],
				dumpElm = {};
            if (clsPos > -1) {
                dumpElms = scope._dumpDivs[scope._getClickOrDumpEmlClassId(srcElm, cls, clsPos, clsBegin)];
                clsBegin = Desharp.OPENED_CSS_CLASS;
                if (indexOf(cls, clsBegin) > -1) {
                    Helpers.RemoveClass(srcElm, clsBegin)
                } else {
					Helpers.AddClass(srcElm, clsBegin)
                }
                for (var i = 0, l = dumpElms[lengthStr]; i < l; i += 1) {
                    dumpElm = dumpElms[i];
                    if (dumpElm) {
                        cls = dumpElm[classNameStr];
                        if (indexOf(cls, clsBegin) > -1) {
							Helpers.RemoveClass(dumpElm, clsBegin)
                        } else {
							Helpers.AddClass(dumpElm, clsBegin)
                        }
                    }
                }
            }
        },
        _correntNewWindowSizeAfterOpening: function (width, height) {
        	var scope = this;
			if (Helpers.Chrome) {
        		setTimeout(function () {
        			scope.WinElm[resizeToStr](width, height);
        			scope._desharp.StoreWindowSettingsLocal(scope._barIndex, scope._itemName, scope._settings, TRUE);
        		});
			}
        }
    };
    var Helpers = {
		// MSIE 5-8
    	OldIe: FALSE,
		// MSIE 9-11
    	NewIE: FALSE,
    	// Edge 20+
    	Edge: FALSE,
    	// Opera 8.0+
    	Opera: FALSE,
    	// Firefox 1.0+
    	Firefox: FALSE,
    	// Safari 3.0+ "[object HTMLElementConstructor]" 
    	Safari: FALSE,
    	// Chrome 1+
    	Chrome: FALSE,
    	_initBrowsers: function () {
    		var chromeStr = "chrome",
				safariStr = "safari",
				oprStr = "opr";
    		if (/MSIE [5-8]/gi.test(navigatorUserAgent)) {
    			Helpers.OldIe = TRUE;
    		} else if (/Trident\//g.test(navigatorUserAgent)) {
    			Helpers.NewIe = TRUE;
    		} else if ((!!win[oprStr] && !!win[oprStr]["addons"]) || !!win["opera"] || Helpers.IndexOf(navigatorUserAgent, " OPR/") >= 0) {
    			Helpers.Opera = TRUE;
    		} else if (typeof InstallTrigger !== undefinedStr) {
    			Helpers.Firefox = TRUE;
    		} else if (
				/constructor/i.test(win["HTMLElement"]) ||
				(function (p) {
					return p.toString() === "[object SafariRemoteNotification]";
    			})(!win[safariStr] || win[safariStr]["pushNotification"])
			) {
				Helpers.Safari = TRUE;
    		} else if (!!win[chromeStr] && !!win[chromeStr]["webstore"]) {
    			Helpers.Chrome = TRUE;
    		} else if (!!win["StyleMedia"]) {
    			Helpers.Edge = TRUE;
    		}
    	},
    	_docMouseMoveHandlers: [],
    	_runningCodeBody: arguments.callee,
    	_runningCodeArgs: [].slice.apply(arguments),
    	AddClass: function (elm, cls) {
    		elm[classNameStr] = elm[classNameStr] + cls;
    	},
    	RemoveClass: function (elm, cls) {
    		while (Helpers.IndexOf(elm[classNameStr], cls) > -1)
    			elm[classNameStr] = elm[classNameStr][replaceStr](cls, emptyStr);
    	},
    	AddEvent: function (elm, eventName, handler) {
    		var key = emptyStr,
				preHandler = function (e) {
					//var prevented = FALSE;
					e = e || win["event"];
					/*if (!e[preventDefaultStr]) {
						e[preventDefaultStr] = function () {
							prevented = TRUE;
						};
					}*/
					e[targetStr] = Helpers._getEventSourceElm(e);
					Helpers._correctEventCoords(e);
					handler.call(elm, e);
					//if (prevented) return FALSE;
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
    	AddDocumentMouseMoveHandler: function (handler) {
    		if (!Helpers._docMouseMoveHandlers[lengthStr]) {
    			Helpers.AddEvent(doc, mouseStr + moveStr, function (e) {
    				var moveHandlers = Helpers._docMouseMoveHandlers;
    				for (var i = 0, l = moveHandlers[lengthStr]; i < l; i += 1) {
    					moveHandlers[i](e);
    				}
    			});
    		}
    		Helpers._docMouseMoveHandlers.push(handler);
    	},
    	StyleElmProp: function (styleObj, propName, propValue) {
    		if (this.OldIe) {
    			styleObj[propName] = propValue;
    		} else {
    			styleObj[propName] = (propValue+emptyStr)[lengthStr] > 0 ? propValue + pxStr : emptyStr;
    		}
    	},
    	WrapNode: function (nodeName, innerHtml, cssClass) {
    		cssClass = cssClass ? " class="+quotStr + cssClass + quotStr : emptyStr;
    		return "<"+nodeName+cssClass+">"+innerHtml+"<\/"+nodeName+">"
    	},
    	ForEachNode: function (elmsCont, nodeName, handler) {
    		var firstElements = elmsCont["childNodes"],
        		elm = {};
    		for (var i = 0, j = 0, l = firstElements[lengthStr]; i < l; i += 1) {
    			elm = firstElements[i];
    			if (elm[nodeNameStr][toLowerCaseStr]() == nodeName) handler(elm, j++);
    		}
    	},
    	Trim: function (a, b) {
    		var c, d = 0, e = 0, indexOf = this.IndexOf;
    		a += emptyStr;
    		if (b) {
    			b += emptyStr;
    			c = b[replaceStr](/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, "$1");
    		} else {
    			c = " \n\r\t\u000c\u000b\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
    		}
    		d = a[lengthStr];
    		for (e = 0; e < d; e++) {
    			if (indexOf(c, a.charAt(e)) === -1) {
    				a = a[substringStr](e);
    				break;
    			}
    		}
    		d = a[lengthStr];
    		for (e = d - 1; e >= 0; e--) {
    			if (indexOf(c, a.charAt(e)) === -1) {
    				a = a[substringStr](0, e + 1);
    				break;
    			}
    		}
    		return indexOf(c, a.charAt(0)) === -1 ? a : emptyStr;
    	},
    	CreateElm: function (name, cls, id) {
    		var elm = doc["createElement"](name);
    		if (cls) elm[classNameStr] = cls;
    		if (id) elm["id"] = id;
    		return elm;
    	},
    	Append: function (parent, child) {
    		if (this.OldIe) {
    			return parent.insertAdjacentElement("beforeEnd", child);
    		} else {
    			return parent.appendChild(child);
    		}
    	},
    	IndexOf: function (str, substr, index) {
    		return str.indexOf(substr, index || 0);
    	},
    	GetSettings: function (rawValue) {
    		var value = {};
    		if (rawValue) {
    			try {
    				value = new Function("return " + rawValue)();
    			} catch (e) {}
    		}
    		return value;
    	},
    	GetRawSettingsValue: function () {
    		var rawValue = emptyStr,
				settingsKey = Desharp[settingsKeyStr];
    		if (locStore) {
    			rawValue = locStore[settingsKey];
    		} else {
    			rawValue = this.GetCookie(settingsKey);
    		}
    		return rawValue;
    	},
    	SaveSettings: function (settingsStr) {
    		var settingsKey = Desharp[settingsKeyStr];
    		if (locStore) {
    			locStore[settingsKey] = settingsStr;
    		} else {
    			this.SetCookie(settingsKey, settingsStr);
    		}
    	},
    	GetCookie: function (name) {
    		var scope = this || {},
				resultCookie = emptyStr,
                docCookieStr = doc[cookieStr],
                docCookieStrArr = docCookieStr[splitStr](semicolonStr),
				indexOf = scope.IndexOf,
                docCookieStrItem = emptyStr;
    		for (var i = 0, l = docCookieStrArr[lengthStr]; i < l; i++) {
    			docCookieStrItem = scope.Trim(docCookieStrArr[i]);
    			if (
					indexOf(docCookieStrItem, "expires") === 0 || 
					indexOf(docCookieStrItem, "path") === 0 || 
					indexOf(docCookieStrItem, "domain") === 0 || 
					indexOf(docCookieStrItem, "max-age") === 0 || 
					indexOf(docCookieStrItem, "secure") === 0
				) {
    				docCookieStrArr[i] = docCookieStrItem;
    			} else if (i > 0) {
    				docCookieStrArr[i] = cookieDelimiterStr + docCookieStrItem;
    			}
    		}
    		docCookieStr = docCookieStrArr[joinStr]("; ");
    		docCookieStrArr = docCookieStr[splitStr](cookieDelimiterStr);
    		for (var i = 0, l = docCookieStrArr[lengthStr]; i < l; i++) {
    			docCookieStrItem = scope.Trim(docCookieStrArr[i]);
    			if (indexOf(docCookieStrItem, name) === 0) {
    				resultCookie = docCookieStrArr[i];
    				break;
    			}
    		}
    		if (indexOf(resultCookie, semicolonStr) > -1) {
    			resultCookie = resultCookie[substrStr](0, indexOf(resultCookie, semicolonStr));
    		}
    		resultCookie = resultCookie[substrStr](indexOf(resultCookie, "=") + 1);
    		resultCookie = scope.Trim(decodeURIComponent(resultCookie));
    		return resultCookie;
    	},
    	SetCookie: function (name, value, exdays) {
    		var exdate = new Date(),
                newCookieRawValue = emptyStr,
                explDomain = [],
                domain = emptyStr,
				hostname = location["hostname"];
    		exdays = exdays || 365;
    		exdate.setDate(exdate.getDate() + exdays);
    		newCookieRawValue = name + "=" + encodeURIComponent(value);
    		newCookieRawValue += "; path=/";
    		/* use only for multiple domains in third level */
    		explDomain = hostname[splitStr](".");
    		if (explDomain[lengthStr] == 3) {
    			explDomain[0] = emptyStr;
    			domain = explDomain[joinStr](".");
    			newCookieRawValue += "; domain=" + domain;
    		} else {
    			newCookieRawValue += "; domain=" + hostname;
    		}
    		if (exdays) {
    			newCookieRawValue += "; expires=" + exdate.toUTCString();
    		}
    		doc[cookieStr] = newCookieRawValue;
    	},
    	TypeOf: function (obj) {
    		var s = {}.toString.apply(obj);
    		return s.substr(8, s[lengthStr] - 9)
    	},
    	GetViewPortSizes: function (winParam) {
    		var w = 0, h = 0, docLocal, docElm, body;
    		if (typeof (winParam[innerWidthStr]) != undefinedStr) {
    			w = winParam[innerWidthStr];
    			h = winParam[innerHeightStr]
    		} else {
    			docLocal = winParam["document"];
    			docElm = docLocal[documentElementStr];
    			if (
					typeof (docElm) != undefinedStr &&
					typeof (docElm[clientWidthStr]) != undefinedStr &&
					docElm[clientWidthStr] != 0
				) {
    				w = docElm[clientWidthStr];
    				h = docElm[clientHeightStr]
    			} else {
    				body = docLocal[bodyStr];
    				w = body[clientWidthStr];
    				h = body[clientHeightStr]
    			}
    		}
    		return [w, h];
    	},
    	GetWindowOuterSizes: function (winParam) {
    		var w = 0, h = 0, docLocal, docElm, body;
    		if (winParam[outerWidthStr] && winParam[outerHeightStr]) {
    			w = winParam[outerWidthStr];
    			h = winParam[outerHeightStr]
    		} else {
    			docLocal = winParam["document"];
    			docElm = docLocal[documentElementStr];
    			if (
					typeof (docElm) != undefinedStr &&
					typeof (docElm[offsetWidthStr]) != undefinedStr &&
					docElm[offsetWidthStr] != 0
				) {
    				w = docElm[offsetWidthStr];
    				h = docElm[offsetHeightStr]
    			} else {
    				body = docLocal[bodyStr];
    				w = body[offsetWidthStr];
    				h = body[offsetHeightStr]
    			}
    		}
    		return [w, h];
    	},
    	GetWindowPositions: function () {
    		var screenXStr = "screenX";
    		if (typeof (win[screenXStr]) != undefinedStr) {
    			return [win[screenXStr], win["screenY"]];
    		} else {
    			return [win["screenLeft"], win["screenTop"]];
    		}
    	},
    	GetElementLeftTopOffset: function (elm, viewPort) {
    		var offsetLeft = elm[offsetLeftStr],
				offsetTop = elm[offsetTopStr];
    		// mostly MSIE8 compatible view:
    		if (offsetLeft < 0) offsetLeft = viewPort[0] - Math.abs(offsetLeft);
    		if (offsetTop < 0) offsetTop = viewPort[1] - Math.abs(offsetTop);
    		return [offsetLeft, offsetTop];
    	},
    	StringifyWindowsSettings: function (windowsSettings) {
    		if (this.TypeOf(windowsSettings) != arrayStr) return "[]";
    		var windowSettings = {},
				result = [], 
				item = [];
    		for (var i = 0, l = windowsSettings[lengthStr]; i < l; i += 1) {
    			windowSettings = windowsSettings[i];
    			item = [];
    			for (var key in windowSettings) {
    				item.push(key+":["+windowSettings[key].join(",")+"]")
    			}
    			result.push("{"+item.join(",")+"}")
    		}
    		// [{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]},{dumps:[x,y,w,h,openMode],session:[x,y,w,h,openMode]}]
    		return "["+result.join(",")+"]"
    	},
    	GetRunningCodeJsDeclaration: function () {
    		var appArgs = this._runningCodeArgs;
    		return "var " + desharpStr + "=(" + this._runningCodeBody.toString() + ")(" + quotStr
				+ appArgs.slice(0, appArgs[lengthStr] - 8).join(quotStr + "," + quotStr)
				+ quotStr + ","+quotStr+"\\u0022"+quotStr+",window,document,window.localStorage,navigator.userAgent,false,true,null);";
    	},
    	GetDesharpStyleDeclaration: function () {
    		var styles = doc[getElementsByTagNameStr]("style"),
    			styleContent = emptyStr,
    			result = emptyStr,
				char = String.fromCharCode,
				cssClass = char(35) + desharpStrLower,
    			importCssPos = 0,
				locHref = location.href,
    			lastSlashPos = 0;
    		for (var i = 0, l = styles[lengthStr]; i < l; i += 1) {
    			styleContent = styles[i][innerHTMLStr];
    			if (Helpers.IndexOf(styleContent, cssClass) > -1) {
					// only for development:
    				importCssPos = Helpers.IndexOf(styleContent, char(64) + "import url(")
    				if (importCssPos > -1) {
    					lastSlashPos = locHref.lastIndexOf("/");
    					if (lastSlashPos > -1) locHref = locHref.substr(0, lastSlashPos + 1);
    					styleContent = styleContent.substr(0, importCssPos + 12) + 
							locHref + styleContent.substr(importCssPos + 12)
    				}
					// 
    				result = styleContent;
    				break
    			}
    		}
    		return result;
    	},
    	GetWindowTopPanelsHeightAndLeftMargin: function (winParam) {
    		var viewPort = Helpers.GetViewPortSizes(winParam),
				leftTopOffset = Helpers.GetElementLeftTopOffset(winParam, viewPort),
				windowOuterSizes = Helpers.GetWindowOuterSizes(winParam),
				windowLeftOrRightMargin = Math.round((windowOuterSizes[0] - viewPort[0]) / 2),
				windowTopPanelsHeight = windowOuterSizes[1] - windowLeftOrRightMargin - viewPort[1];
    		return [windowTopPanelsHeight, windowLeftOrRightMargin];
    	},
		_getEventSourceElm: function (e) {
            var result = e[targetStr] ? e[targetStr] : (e[srcElementStr] ? e[srcElementStr] : NULL);
            if (result.nodeType == 3) result = result.parentNode; // Safari bug by clicking on text node
            return result;
        },
        _correctEventCoords: function (e) {
            if (this.OldIe) {
                var docElm = doc[documentElementStr],
					docBody = doc[bodyStr],
					docScrolls = [];
                if (docElm && docElm[scrollTopStr]) {
                    docScrolls = [
						docElm[scrollLeftStr],
						docElm[scrollTopStr]
                    ];
                } else {
                    docScrolls = [
						docBody[scrollLeftStr],
						docBody[scrollTopStr]
                    ];
                }
                e[pageXStr] = e["clientX"] + docScrolls[0];
                e[pageYStr] = e["clientY"] + docScrolls[1];
            }
        }
    };
    Helpers._initBrowsers();
	return Desharp;
}).apply(
	{},(
		"Desharp|cookie|div|span|mouse|scrollTop|" +
		"scrollLeft|__JS_COOKIE_DELIMITER__|width|height|on|getElementsByTagName|"+
		"className|length|innerHTML|style|substr|substring|"+
		"split|replace|pageX|pageY|srcElement|target|"+
		"join|push|_||;|attachEvent|"+
		"body|top|left|Array|class|down|"+
		"move|up|undefined|innerWidth|innerHeight|documentElement|"+
		"clientWidth|clientHeight|prototype|offsetWidth|offsetHeight|Object|"+
		"bar|windows|offsetLeft|offsetTop|right|bottom|"+
		" hidden|nodeName|parentNode|toLowerCase|over| current|"+
		"out|click|outerWidth|outerHeight|GetInstance|resize|"+
		"close|onbeforeunload|resizeTo|invisible|SETTINGS_KEY|"+
		"REFRESH_TIME_LIMIT|keyup|px| |" + String.fromCharCode(34)
	).split("|").concat([window,document,window.localStorage,navigator.userAgent,false,true,null])
);