var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	var mainTitleName = "king document build";

	//key bar
	var KeyBars = [
		{
			"bar":"bar",
			
			"pre":{
				"l":"<pre class='k-pre'>",
				"r":"</pre>",
				"text":"XXXXXX",
			},
			"div":{
				"l":"<div>",
				"r":"</div>",
				"text":"XXXXXX",
			},
			"p":{
				"l":"<p>",
				"r":"</p>",
				"text":"XXXXXX",
			},
		},	
		{
			"tab":"	",
			"br":"<br>",
			"strong":{
				"l":"<strong>",
				"r":"</strong>",
				"text":"XXXXXX",
			},
			"a":{
				"l":"<a href='XXXXXX' target='_blank'>",
				"r":"</a>",
				"text":"XXXXXX",
			},
		},
		{
			"span":{
				"l":"<span>",
				"r":"</span>",
				"text":"XXXXXX",
			},
			"ol":{
				"l":"<ol>",
				"r":"</ol>",
				"text":"XXXXXX",
			},
			"ul":{
				"l":"<ul>",
				"r":"</ul>",
				"text":"XXXXXX",
			},
			"li":{
				"l":"<li>",
				"r":"</li>",
				"text":"XXXXXX",
			},
		},
	];
	var KeyBar = {
	};
	for (var i = 0; i < KeyBars.length; i++) {
		var keys = KeyBars[i];
		for(var key in keys){
			KeyBar[key] = keys[key];
		}
	}

	//排序框
	//子節點 排序框
	var newModalSort = function(){
		var jqBtn = $("#idBtnSort");
		var jqBody = $("#idModalSortBody");
		jqBody.sortable().disableSelection();

		var jqSure = $("#idModalSortSure");
		var jqCancel = $("#idModalSortCancel");
		var onOk = null;
		var oldArrs = null;
		jqSure.click(function(event) {
			jqCancel.click();
			if(!onOk){
				return;
			}

			var newArrs = [];
			var modify = false;
			jqBody.children('li').each(function(index, el) {
				var id = $(el).data('id');

				newArrs.push(id);

				if(!modify && id != oldArrs[index].Id){
					modify = true;
				}
			});

			if(modify){
				onOk(newArrs);
			}
		});
		return {
			Show:function(arrs,callback){
				oldArrs = arrs;
				onOk = callback;

				var html = "";
				for (var i = 0; i < arrs.length; i++) {
					var node = arrs[i];
					html += "<li class='list-group-item' data-id='" + 
						node.Id + "'>" + 
						node.Name + "</li>";
				}

				jqBody.html(html);
				jqBtn.click();
			},
		}
	};
	var modalSort = newModalSort();
	//輸入 框
	var newModalInput = function(){
		var jqBtnShow = $("#idBtnModalInput");
		var jqTitle = $("#idModalInputTitle");
		var jqBody = $("#idModalInputBody");

		var jqSure = $("#idModalInputSure");
		var jqCancel = $("#idModalInputCancel");
		var onOk = null;
		var newObj = {
			Show:function(title,text,callback){
				if(callback){
					onOk = callback;
				}

				jqTitle.html(title);
				jqBody.val(text);
				jqBtnShow.click();
				setTimeout(function(){
					jqBody.select().focus();
				},200);
			},
			Hide:function(){
				jqCancel.click();
			},
		};
		var actionSure = function(){
			if(onOk){
				var val = jqBody.val();
				onOk(newObj,val);
			}else{
				jqCancel.click();
			}
		}
		jqSure.click(function(event) {
			actionSure();
		});
		jqBody.keydown(function(event) {
			if(event.keyCode == 13){
				actionSure();
			}
		});
		return newObj;
	};
	var modalInput = newModalInput();

	//input Textarea
	var newModalTextarea = function(){
		var jqBtnShow = $("#idBtnModalTextarea");
		var jqTitle = $("#idModalTextareaTitle");
		var jqBody = $("#idModalTextareaBody");

		var jqSure = $("#idModalTextareaSure");
		var jqCancel = $("#idModalTextareaCancel");
		var onOk = null;
		var newObj = {
			Show:function(title,text,callback){
				if(callback){
					onOk = callback;
				}

				jqTitle.html(title);
				jqBody.val(text);
				jqBtnShow.click();
				setTimeout(function(){
					jqBody.select().focus();
				},200);
			},
			Hide:function(){
				jqCancel.click();
			},
			Reset:function(){
				jqBody.val('');
			},
		};
		var actionSure = function(){
			if(onOk){
				var val = jqBody.val();
				onOk(newObj,val);
			}else{
				jqCancel.click();
			}
		}
		jqSure.click(function(event) {
			actionSure();
		});
		return newObj;
	};
	var modalTextarea = newModalTextarea();

	//消息 對話框
	var newModalMsg = function(){
		var jqBtnShow = $("#idBtnModalMsg");
		var jqTitle = $("#idModalMsgTitle");
		var jqBody = $("#idModalMsgBody");

		var jqSure = $("#idModalMsgSure");
		var jqCancel = $("#idModalMsgCancel");
		var onOk = null;
		var newObj = {
			Show:function(title,text,callback){
				if(callback){
					onOk = callback;
				}

				jqTitle.html(title);
				jqBody.html(text);

				jqBtnShow.click();
			},
			Hide:function(){
				jqCancel.click();
			},
		};
		jqSure.click(function(event) {
			if(onOk){
				onOk(newObj);
			}else{
				jqCancel.click();
			}
		});
		return newObj;
	};
	var modal = newModalMsg();
	
	var ui = kingui;
	var newMsg = function(id){
		var onOk = null;
		var newObj = {
			Hide:function(){
				msg.Hide();
			},
			Show:function(title,text,callback){
				onOk = callback;
				msg.Show(title,text);
			},
		};
		var msg = ui.NewMsg({
			Id:id,
			Btns:[
				{
					Name:language["Sure"],
					Callback:function(){
						if(onOk){
							onOk.bind(newObj)();
						}else{
							this.Hide();
						}
					},
				},
				{
					Name:language["Cancel"],
				},
			],
		});
		return newObj;
	};
	var msgid = 1;
	var modalError = newMsg(msgid++);
	

	//html 轉義
	var escapeHtml = function(html){
		var elem = document.createElement('div')
		var txt = document.createTextNode(html)
		elem.appendChild(txt)
		return elem.innerHTML;
	}
	// 将实体转回为HTML
	var unescapeHtml = function(str) {
		var elem = document.createElement('div')
		elem.innerHTML = str
		return elem.innerText || elem.textContent;
	}
	//html 轉義 對話框
	//消息 對話框
	var newModalHtml = function(){
		var jqBtnShow = $("#idBtnModalHtml");
		var jqBtnCode = $("#idModalHtmlBtnCode");
		var jqBtnGo = $("#idModalHtmlBtnOk");

		var jqBody = $("#idModalHtmlBody");
		var jqVal = $("#idModalHtmlVal");
		jqBtnGo.click(function(event) {
			var val = jqBody.val();
			val = escapeHtml(val);
			jqVal.val(val);
		});
		jqBtnCode.click(function(event) {
			var val = jqBody.val();
			val = escapeHtml(val);
			jqVal.val("<pre class='prettyprint linenums'>" + val + "</pre>");
		});
		return {
			Show:function(){
				jqBody.val('');
				jqVal.val('');
				jqBtnShow.click();

				setTimeout(function(){
					jqBody.select().focus();
				},200);
			},
		};
	};
	var modalHtml = newModalHtml();
	//modalHtml.Show();

	var K = initObj.K;
	/*
	//擴展 kindeditor
	KindEditor.plugin('mycode', function(K) {
		var editor = this;
		var name = 'mycode';
		// 点击图标时执行
		editor.clickToolbar(name, function() {
			modalTextarea.Show(language["input code"],"",function(modal,val){
				modal.Hide();
				//val = $.trim(val);
				if(val != ""){
					val = "<pre class='prettyprint linenums'>" + escapeHtml(val) +"</pre>";
					editor.insertHtml(val);
				}
			});
		});
	});
	KindEditor.lang({
		mycode:language["insert code"],
	});
	*/

	//top list
	var newPanelList = function(){
		var _enable = true;
		var enable = function(ok){
			if(ok){
				_enable = true;
			}else{
				_enable = false;
			}
		};
		var isDisable = function(){
			return !_enable;
		};

		//show hide
		var jqBtnToggle = $("#idBtnToggle");
		var jqHide = $("#idBodyHide");
		var jqView = $("#idBodyView");
		jqBtnToggle.click(function(event) {
			jqHide.toggle("fast");
			jqView.toggle("jqView");
		});

		//list view
		var jqList = $("#idListPanel");
		var _sorts = [];
		var resetSort = function(){
			var map = {};
			jqList.children('li').each(function(index, el) {
				var jq = $(el);
				var id = jq.attr('id');
				map[id] = jq;
			});
			for (var i = 0; i < _sorts.length; i++) {
				var id = _sorts[i];
				var jq = map[id];
				jqList.append(jq);
			}
		};
		jqList.sortable({
			update:function(e,ui){
				if(isDisable()){
					return false;
				}

				var sorts = jqList.sortable("toArray");
				var str = sorts.join('-');
				enable(false);
				$.ajax({
					url: '/Panel/AjaxSort',
					type: 'POST',
					dataType: 'json',
					data: {sort:str},
				}).done(function(result) {
					if(result.Code == 0){
						_sorts = sorts;
					}else{
						resetSort();
						modal.Show(language["err.title"],result.Emsg);
					}
				}).fail(function() {
					resetSort();
					modal.Show(language["err.title"],language["err net"]);
				}).always(function() {
					enable(true);
				});
			},
		}).disableSelection();
		var onNewItem = null;
		var onRename = null;
		var onRemove = null;
		var newItem = function(id,name){
			_sorts.push(id);

			var html = "<li class='list-group-item' id='" +
				id + "'><span data-id='" +
				id + "' class='glyphicon glyphicon-wrench kBtnSpan'></span><span data-id='" +
				id + "' class='glyphicon glyphicon-remove kBtnSpan'></span><a href='#panel-" +
				id + "'>" +
				name + "</a></li>";
			var jq = $(html);
			var jqA = jq.find('a:first');

			jqList.append(jq);

			if(onNewItem){
				onNewItem(id,name);
			}

			//改名
			var ajaxRename = function(val){
				if(val == name){
					return;
				}
				if(isDisable()){
					return;
				}

				enable(false);
				$.ajax({
					url:'/Panel/AjaxRename',
					type:'POST',
					dataType:'json',
					data: {id:id,name:val},
				}).done(function(result) {
					if(result.Code == 0){
						name = val;
						jqA.text(name);
						if(onRename){
							onRename(id,name);
						}
					}else{
						modal.Show(language["err.title"],result.Emsg);
					}
				}).fail(function() {
					modal.Show(language["err.title"],language["err net"]);
				}).always(function() {
					enable(true);
				});
			};
			//刪除
			var doRemove = function(id){
				if(onRemove){
					onRemove(id,name);
				}
				jq.remove();
			};
			var ajaxRemove = function(id){
				if(isDisable()){
					return;
				}

				enable(false);
				$.ajax({
					url: '/Panel/AjaxRemove',
					type: 'POST',
					dataType: 'json',
					data: {id:id},
				}).done(function(result) {
					if(result.Code == 0){
						doRemove(id);
					}else{
						modalError.Show(language["err.title"],result.Emsg);
					}
				}).fail(function() {
					modalError.Show(language["err.title"],language["err net"]);
				}).always(function() {
					enable(true);
				});
			};
			//event
			jq.find('.glyphicon-wrench').click(function(event) {
				modalInput.Show(language["input chapter"],name,function(modal,val){
					modal.Hide();
					ajaxRename(val);					
				});
			});
			jq.find('.glyphicon-remove').click(function(event) {
				var title = language["panel erase"] + " - " + name + "<br>" + language["sure?"];
				modal.Show(language["msg warning"],title,function(modal){
					modal.Hide();
					ajaxRemove(id);	
				});
			});
		};

		//btn new
		var jqBtnNew = $("#idBtnNewPanel");
		jqBtnNew.click(function(event) {
			if(isDisable()){
				return;
			}

			enable(false);
			var name = language["new panel"];
			var chapter = initObj.Chapter.Id;
			$.ajax({
				url: '/Panel/AjaxNew',
				type: 'POST',
				dataType: 'json',
				data: {chapter:chapter,name:name},
			}).done(function(result) {
				if(result.Code == 0){
					newItem(result.Value,name);
				}else{
					modal.Show(language["err.title"],result.Emsg);
				}
			}).fail(function() {
				modal.Show(language["err.title"],language["err net"]);
			}).always(function() {
				enable(true);
			});
			
		});


		return {
			Bind:function(name,callback){
				if(name == "item.new"){
					onNewItem = callback;
				}else if(name == "item.rename"){
					onRename = callback;
				}else if(name == "item.remove"){
					onRemove = callback;
				}
			},
			New:function(id,name){
				newItem(id,name);
			},
		};
	};
	var newPanelView = function(id,name){
		//private
		var DATA_NONE	= 0;	//數據未初始化
		var DATA_OK		= 1;	//可以修改數據
		var DATA_WAIT		= 2;	//等待數據修改
		var _status = DATA_NONE;
		var isDataOk = function(){
			return _status == DATA_OK;
		};
		var isDataNo = function(){
			return _status != DATA_OK;
		}
		var setDataOk = function(){
			_status = DATA_OK;
		};
		var setDataWait = function(){
			_status = DATA_WAIT;
		};


		//jq
		var jqView = $("#idPanelsView");
		var html = "<div class='panel panel-default'>" + 
				"<a name='panel-" + id + "'></a>" + 
				"<div class='panel-heading'>" + 
					"<span class='glyphicon glyphicon-asterisk kBtnSpan kBtnTop'></span>" + 
					"<span class='glyphicon glyphicon-minus kBtnSpan kBtnMenuHide'></span>" + 
					"<span class='glyphicon glyphicon-sort-by-attributes kBtnSpan kBtnMenuSort'></span>" + 
					"<span class='kPanelName'>" + name + "</span>" + 
				"</div>" + 
				"<div class='panel-body'>" + 
					"<div class='kPanelHide' style='display: none;'>" + language["data is hide"] + "</div>" + 
					"<div class='kPanelBody'>" + 
						"<div class='kPanelBodyView'>" + language["wait init data"] + "</div>" + 
						"<div class='kSectionNode'>" + 
							"<span class='glyphicon glyphicon-plus kBtnSpan kBtnAddSection'></span>" + 
						"</div>" +
					"</div>" +
				"</div>" + 
			"</div>";
		var jq = $(html);
		jqView.append(jq);

		var jqName = jq.find('.kPanelName:first');

		var jqHide = jq.find('.kPanelHide:first');
		var jqBody = jq.find('.kPanelBody:first');
		var jqBodyView = jqBody.find('.kPanelBodyView:first');

		var jqAddSection = jq.find('.kBtnAddSection:first');
		jqAddSection.hide();

		//sections
		var _sections = [];
		var newSection = function(id,name,oldVal){
			var sectionInfo = {
				Id:id,
				Name:name,
			};
			_sections.push(sectionInfo);
			var sectionId= "king-section-" + id;
			var jqView = jqBodyView;
			var html = [];
			html.push("<div id='" + sectionId + "'>" +
					"<h4 class='kSectionTitle'>" +
						"<span class='glyphicon glyphicon-minus kBtnSpan'></span>" + 
						"<span class='glyphicon glyphicon-wrench kBtnSpan'></span>" + 
						"<span class='glyphicon glyphicon-remove kBtnSpan'></span>" + 
						"<span class='kTitleName'>" + name + "</span>" +
					"</h4>" + 
					"<div class='kSectionHide'>" + language["data is hide"] + "</div>" +
					"<div class='kSectionBody'>" + 
						"<div class='kSectionViewStatus'>" + 
							"<span class='glyphicon glyphicon-wrench kBtnSpan'></span>" +
							"<span class='glyphicon glyphicon-save kBtnSpan'></span>" +
							"<span class='kSectionSaveStatus'>" + language["section ok"] + "</span>" + 
							"<br>" +
							"<span class='glyphicon glyphicon-registration-mark kBtnSpan'></span>" + 
							"<span class='glyphicon glyphicon-copyright-mark kBtnSpan'></span>" + 
							"<span class='glyphicon glyphicon-picture kBtnSpan'></span>" +
							"<span class='glyphicon glyphicon-file kBtnSpan'></span>" +
							"&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-collapse-down kBtnSpan'></span>" +
							"<div class='KKeySidebarView'><table class='table'>");
							for (var i = 0; i < KeyBars.length; i++) {
								
								html.push("<tr>");
							
								var keys = KeyBars[i];
								for(var key in keys){
									if(key == "bar"){
										html.push("<td><a href='#" + key + "' class='glyphicon glyphicon-plus-sign'></a></td>");
									}else{
										html.push("<td><a href='#" + key + "'>" + key + "</a></td>");
									}
								}
								html.push("</tr>");
							}
							html.push("</table></div>" +
						"</div>" +
						"<div class='kSectionView' style='display:none;'></div>" +
						"<div class='kSectionEdit'><textarea class='kEditor' wrap='off'></textarea></div>" +
					"</div>" +
				"</div>");

			var jq = $(html.join(""));
			var jqTitle = jq.find('.kSectionTitle:first');
			var jqName = jqTitle.find('.kTitleName:first');

			var jqHide = jq.find('.kSectionHide:first');
			var jqShow = jq.find('.kSectionBody:first');

			var jqSectionStatus = jq.find('.kSectionViewStatus:first');
			var jqSectionView = jq.find('.kSectionView:first');
			var jqSectionEdit = jq.find('.kSectionEdit:first');
			jqView.append(jq);

			var jqSectionSaveStatus = jqSectionStatus.find('.kSectionSaveStatus:first');
			var newObj = {
				ShowPreview:function(html){
					jqSectionEdit.hide();
					jqSectionView.html(html);
					jqSectionView.show();
					prettyPrint();
				},
				Save:function(html){
					if(oldVal == html){
						modal.Show(language["warning.title"],language["data not need save"]);
						return;
					}
					var ctx = this;
					$.ajax({
						url: '/Section/AjaxSave',
						type: 'POST',
						dataType: 'json',
						data: {id:id,val:html},
					})
					.done(function(result) {
						if(result.Code == 0){
							oldVal = html;
							ctx.UpdateStatus();
						}else{
							modal.Show(language["err.title"],result.Emsg);
						}
					})
					.fail(function() {
						modal.Show(language["err.title"],language["err net"]);
					});
				},
				UpdateStatus:function(html){
					if(html || html == "" ){
						if(html == oldVal){
							jqSectionSaveStatus.text(language["section ok"]);
						}else{
							jqSectionSaveStatus.text(language["section no"]);
						}
					}else{
						jqSectionSaveStatus.text(language["section ok"]);
					}
				},
			};
			var jqText = jqSectionEdit.find('.kEditor');
			if(oldVal || oldVal == ""){
				jqText.val(oldVal);
			}
			
			var kEditor = K.editor({ 
				uploadJson : '/Files/Upload?id=' + id,
				fileManagerJson : '/Files/Find?id=' + id,
				allowFileManager : true ,
			}); 
			var editor = (function(){
				return {
					html:function(){
						return jqText.val();
					},
					push:function(html){
						jqText.val(jqText.val() + html);
						jqText.focus();
					},
					insert:function(obj){
						var doc = jqText.get()[0];
						var start = doc.selectionStart;
						var end = doc.selectionEnd;
						var val = doc.value;
						if(typeof(obj) == "object"){
							var middle = val.substring(start,end);
							if(middle == ""){
								middle = obj.text;
							}
							doc.value = val.substring(0,start) + 
								obj.l +
									middle + 
								obj.r + 
								val.substring(end,val.length);

							doc.selectionStart = doc.selectionEnd = obj.l.length + obj.r.length + start + middle.length;
						}else{
							doc.value = val.substring(0,start) + obj + val.substring(end,val.length);
							doc.selectionStart = doc.selectionEnd = obj.length + start;
						}
						jqText.focus();
					},
				};
			})();
			jqText.keyup(function(event) {
				var html = editor.html();
				newObj.UpdateStatus(html);
			}).change(function(event) {
				var html = editor.html();
				newObj.UpdateStatus(html);
			});
			
			if(oldVal || oldVal == ""){
				newObj.ShowPreview(oldVal);
			}else{
				oldVal = "";
			}

			var ajaxRename = function(val){
				if(name == val){
					return;
				}
				if(!isDataOk()){
					return;
				}

				setDataWait();
				$.ajax({
					url: '/Section/AjaxRename',
					type: 'POST',
					dataType: 'json',
					data: {id:id,name:val},
				}).done(function(result) {
					if(result.Code == 0){
						name = val;
						jqName.text(name);
						sectionInfo.Name = name;
					}else{
						modal.Show(language["err.title"],result.Emsg);
					}
				}).fail(function() {
					modal.Show(language["err.title"],language["err net"]);
				}).always(function() {
					setDataOk();
				});
			};
			var ajaxRemove = function(val){
				if(!isDataOk()){
					return;
				}

				setDataWait();
				$.ajax({
					url: '/Section/AjaxRemove',
					type: 'POST',
					dataType: 'json',
					data: {id:id},
				}).done(function(result) {
					if(result.Code == 0){
						jqView.find('#' + sectionId).remove();
						var arrs = [];
						for (var i = 0; i < _sections.length; i++) {
							if(_sections[i].Id != id){
								arrs.push(_sections[i]);
							}
						}
						_sections = arrs;
					}else{
						modalError.Show(language["err.title"],result.Emsg);
					}
				}).fail(function() {
					modalError.Show(language["err.title"],language["err net"]);
				}).always(function() {
					setDataOk();
				});
			};
			//event
			jqTitle.find('.glyphicon-minus:first').click(function(event) {
				jqHide.toggle("fast");
				jqShow.toggle("fast");
			});

			jqTitle.find('.glyphicon-wrench:first').click(function(event) {
				modalInput.Show(language["input section"],name,function(modal,val){
					modal.Hide();
					ajaxRename(val);					
				});
			});
			jqTitle.find('.glyphicon-remove:first').click(function(event) {
				var title = language["chapter erase"] + " - " + name + "<br>" + language["sure?"];
				modal.Show(language["msg warning"],title,function(modal){
					modal.Hide();
					ajaxRemove(id);	
				});
			});
			
			jqSectionStatus.find('.glyphicon-wrench:first').click(function(event) {
				if(jqSectionEdit.is(":visible")){
					var html = editor.html();
					newObj.ShowPreview(html);
				}else{
					jqSectionView.html('');
					jqSectionView.hide();
					jqSectionEdit.show();
					//editorHeight(editor);
				}
			});
			jqSectionStatus.find('.glyphicon-registration-mark:first').click(function(event) {
				modalHtml.Show();
			});
			jqSectionStatus.find('.glyphicon-copyright-mark:first').click(function(event) {
				modalTextarea.Show(language["input code"],"",function(modal,val){
				modal.Hide();
				//val = $.trim(val);
				if(val != ""){
					val = "\n<pre class='prettyprint linenums'>" + escapeHtml(val) +"</pre>";
					editor.push(val);

					html = editor.html();
					jqSectionView.html(html);
					newObj.UpdateStatus(html);
					prettyPrint();
				}
			});
			});
			jqSectionStatus.find('.glyphicon-save:first').click(function(event) {
				var html = editor.html();
				newObj.Save(html);
			});
			jqSectionStatus.find('.glyphicon-picture:first').click(function(event) {
				kEditor.loadPlugin('image', function() {
					kEditor.plugin.imageDialog({
						clickFn:function(url, title, width, height, border, align) {  

							var html = "\n<img src='" + url + "'>";
							editor.push(html);
							kEditor.hideDialog();  

							html = editor.html();
							jqSectionView.html(html);
							newObj.UpdateStatus(html);
						},
					});
				});
			});
			jqSectionStatus.find('.glyphicon-file:first').click(function(event) {
				kEditor.loadPlugin('insertfile', function() {
					kEditor.plugin.fileDialog({
						clickFn:function(url, title) { 
							var html = "\n<a href='" + url + "' target='_blank'>" + title + "</a>";
							editor.push(html);
							kEditor.hideDialog();
							
							html = editor.html();
							jqSectionView.html(html);
							newObj.UpdateStatus(html);
						},
					});
				});
			});
			var jqKeyBar = jqSectionStatus.find('.glyphicon-collapse-down:first');
			var jqBarView = jqSectionStatus.find('.KKeySidebarView:first');
			jqKeyBar.click(function(event) {
				if(jqBarView.is(':visible')){
					jqBarView.hide('fast');
					jqKeyBar.attr('class', 'glyphicon glyphicon-collapse-down kBtnSpan');
				}else{
					jqBarView.show('fast');
					jqKeyBar.attr('class', 'glyphicon glyphicon-collapse-up kBtnSpan');
				}
			});
			var insertVal = function(val){
				if(!val){
					return;
				}
				editor.insert(val);
				var html = editor.html();
				jqSectionView.html(html);
				newObj.UpdateStatus(html);
			};
			var _barNo = false;
			jqSectionStatus.find('a').click(function(event) {
				var cmd = $(this).attr('href');
				cmd = cmd.substring(1);
				if(cmd=="bar"){
					if(_barNo){
						_barNo = false;
						$(this).attr('class', 'glyphicon glyphicon-plus-sign');
					}else{
						_barNo = true;
						$(this).attr('class', 'glyphicon glyphicon-minus-sign');
					}

					return false;
				}
				var val = KeyBar[cmd];
				if(val){
					insertVal(val)
					if(_barNo){
						jqBarView.hide('fast');
						jqKeyBar.attr('class', 'glyphicon glyphicon-collapse-down kBtnSpan');
					}
				}
				return false;
			});
		};
		//init
		var initData = function(id){
			_sections = [];
			//init ok
			$.ajax({
				url: '/Section/AjaxFind',
				type: 'POST',
				dataType: 'json',
				data: {panel:id},
			})
			.done(function(result) {
				if(result.Code == 0){
					jqBodyView.html("");
					var arrs = result.Data;
					if(arrs){
						for (var i = 0; i < arrs.length; i++) {
							var obj = arrs[i];
							newSection(obj.Id,obj.Name,obj.Str);
						}	
					}
					jqAddSection.show();
					setDataOk();
				}else{
					jqBodyView.html(result.Emsg);
				}
			})
			.fail(function() {
				jqBodyView.html(language["err net"]);
			});
		};
		initData(id);

		//event
		jq.find('.kBtnTop:first').click(function(event) {
			location.href="#top";
		});
		jq.find('.kBtnMenuHide:first').click(function(event) {
			jqHide.toggle("fast");
			jqBody.toggle("fast");
		});
		jq.find('.kBtnMenuSort:first').click(function(event) {
			if(!isDataOk() || _sections.length == 0){
				return;
			}
			modalSort.Show(_sections,function(arrs){
				if(!isDataOk()){
					return;
				}

				var updateSort = function(){
					jqBodyView.html(language["wait init data"]);
					initData(id);
				};
				
				setDataWait();
				var sort = arrs.join("-");
				$.ajax({
					url: '/Section/AjaxSort',
					type: 'POST',
					dataType: 'json',
					data: {
						sort:sort,
					},
				})
				.done(function(result) {
					if(0 == result.Code){
						updateSort();	
					}else{
						modal.Show(language["err.title"],result.Emsg);
					}
				})
				.fail(function() {
					modal.Show(language["err.title"],language["err net"]);
				})
				.always(function() {
					setDataOk();
				});

			});
		});
		jqAddSection.click(function(event) {
			if(isDataNo()){
				return;
			}
			var name = language["new section"];
			setDataWait();
			$.ajax({
				url: '/Section/AjaxNew',
				type: 'POST',
				dataType: 'json',
				data: {panel:id,name:name},
			}).done(function(result) {
				if(result.Code == 0){
					newSection(result.Value,name);
				}else{
					modal.Show(language["err.title"],result.Emsg);
				}
			}).fail(function() {
				modal.Show(language["err.title"],language["err net"]);
			}).always(function() {
				setDataOk();
			});
		});
		return {
			Rename:function(name){
				jqName.text(name);
			},
			Remove:function(){
				jq.remove();
			},
		};
	};
	//panel list
	var panelList = newPanelList();
	var panelsView = {};
	panelList.Bind("item.new",function(id,name){
		panelsView[id] = newPanelView(id,name);
	});
	panelList.Bind("item.rename",function(id,name){
		panelsView[id].Rename(name);
	});
	panelList.Bind("item.remove",function(id,name){
		panelsView[id].Remove();
		delete panelsView[id];
	});

	//init panel
	var panels = initObj.Panels;
	for (var i = 0; i < panels.length; i++) {
		var panel = panels[i];
		panelList.New(panel.Id,panel.Name);
	}
};