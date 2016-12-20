var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	var mainTitleName = "king document build";

	//爲 KindEditor 增加擴展
	KindEditor.plugin('mypreview', function(K) {
		var name = 'mypreview';
		var editor = this;

		editor.clickToolbar(name, function() {
			var k_ctx = editor._k_ctx;
			var html = editor.html();
			k_ctx.ShowPreview(html);
		});
	});
	KindEditor.plugin('mysave', function(K) {
		var name = 'mysave';
		var editor = this;

		editor.clickToolbar(name, function() {
			var k_ctx = editor._k_ctx;
			var html = editor.html();
			k_ctx.Save(html);
		});
	});
	KindEditor.lang({
		mypreview:language["preview"],
		mysave:language["save section"],
	});

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
					url: '/Panel/AjaxRename',
					type: 'POST',
					dataType: 'json',
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
			//event
			jq.find('.glyphicon-wrench').click(function(event) {
				modalInput.Show(language["input chapter"],name,function(modal,val){
					modal.Hide();
					ajaxRename(val);					
				});
			});
			jq.find('.glyphicon-remove').click(function(event) {
				alert(id + " remove");
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
		var html = "<div class='panel panel-default'><a name='panel-" +
			id + "'></a><div class='panel-heading'><span class='glyphicon glyphicon-minus kBtnSpan kBtnMenuHide'></span><span class='glyphicon glyphicon-sort-by-attributes kBtnSpan kBtnMenuSort'></span><span class='kPanelName'>" +
			 name + "</span></div><div class='panel-body'><div class='kPanelHide' style='display: none;'>" + 
			 language["data is hide"] + "</div>" + "<div class='kPanelBody'><div class='kPanelBodyView'>" +
			 language["wait init data"] + "</div><div class='kSectionNode'><span class='glyphicon glyphicon-plus kBtnSpan kBtnAddSection'></span></div></div></div></div>";
		var jq = $(html);
		jqView.append(jq);

		var jqName = jq.find('.kPanelName:first');

		var jqHide = jq.find('.kPanelHide:first');
		var jqBody = jq.find('.kPanelBody:first');
		var jqBodyView = jqBody.find('.kPanelBodyView:first');

		var jqAddSection = jq.find('.kBtnAddSection:first');
		jqAddSection.hide();

		//sections
		var _sections = {};
		var newSection = function(id,name,oldVal){
			var jqView = jqBodyView;
			var html = "<div>" +
					"<h4 class='kSectionTitle'>" +
						"<span class='glyphicon glyphicon-minus kBtnSpan'></span>" + 
						"<span class='glyphicon glyphicon-wrench kBtnSpan'></span>" + 
						"<span class='glyphicon glyphicon-remove kBtnSpan'></span>" + 
						name +
					"</h4>" + 
					"<div class='kSectionHide'>" + language["data is hide"] + "</div>" +
					"<div class='kSectionBody'>" + 
						"<div class='kSectionViewHide'><span class='glyphicon glyphicon-wrench kBtnSpan'></span></div>" +
						"<div class='kSectionView'></div>" +
						"<div class='kSectionEdit'><textarea class='kEditor'></textarea></div>" +
					"</div>" +
				"</div>";

			var jq = $(html);
			var jqHide = jq.find('.kSectionHide:first');
			var jqShow = jq.find('.kSectionBody:first');

			var jqSectionHide = jq.find('.kSectionViewHide:first');
			var jqSectionView = jq.find('.kSectionView:first');
			var jqSectionEdit = jq.find('.kSectionEdit:first');
			jqView.append(jq);
			var newObj = {
				ShowPreview:function(html){
					jqSectionEdit.hide();
					jqSectionView.html(html);
					jqSectionHide.show();
					jqSectionView.show();
				},
				Save:function(html){
					if(oldVal == html){
						modal.Show(language["warning.title"],language["data not need save"]);
						return;
					}
					$.ajax({
						url: '/Section/AjaxSave',
						type: 'POST',
						dataType: 'json',
						data: {id:id,val:html},
					})
					.done(function(result) {
						if(result.Code == 0){
							oldVal = html;
							modal.Show(mainTitleName,language["data save ok"]);
						}else{
							modal.Show(language["err.title"],result.Emsg);
						}
					})
					.fail(function() {
						modal.Show(language["err.title"],language["err net"]);
					});
				},
			};
			var jqText = jqSectionEdit.find('.kEditor');
			if(oldVal || oldVal == ""){
				jqText.val(oldVal);
			}
			var editor = KindEditor.create(jqText, {
				resizeType:1,
				width:'100%',
				items:[
					'mysave',
					'|', 'mypreview','source', 
					'|', 'undo', 'redo', /*'|', 'preview', 'print', 'template',*/ 
					'|', 'code', 
					'|', 'cut','copy', 'paste',
					'plainpaste', /*'wordpaste',*/
					'|', 'justifyleft', 'justifycenter', 'justifyright',
					'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
					'superscript', 'clearhtml', 'quickformat', 'selectall', 
					'|', 'fullscreen',
					'/',
					'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
					'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', 
					'|', 'image', 'multiimage',/*'flash', 'media',*/ 'insertfile', 'table', /*'hr', */'emoticons', /*'baidumap', 'pagebreak',
					'anchor',*/ 'link', 'unlink', /*'|', 'about'*/
				],
			});
			editor._k_ctx = newObj;
			if(oldVal || oldVal == ""){
				newObj.ShowPreview(oldVal);
			}else{
				oldVal = "";
			}

			//event
			jq.find('.glyphicon-minus:first').click(function(event) {
				jqHide.toggle("fast");
				jqShow.toggle("fast");
			});
			jqSectionHide.find('.glyphicon-wrench:first').click(function(event) {
				jqSectionHide.hide();
				jqSectionView.html('');
				jqSectionView.hide();
				jqSectionEdit.show();
			});
		};
		//init
		(function(id){
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
		})(id);

		//event
		jq.find('.kBtnMenuHide:first').click(function(event) {
			jqHide.toggle("fast");
			jqBody.toggle("fast");
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

	//init panel
	var panels = initObj.Panels;
	for (var i = 0; i < panels.length; i++) {
		var panel = panels[i];
		panelList.New(panel.Id,panel.Name);
	}

};