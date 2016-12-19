var NewContext = function(initObj){
	var language = initObj.Language;

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
		jqList.sortable().disableSelection();
		var onNewItem = null;
		var newItem = function(id,name){
			var html = "<li class='list-group-item'><span data-id='" +
				id + "' class='glyphicon glyphicon-wrench kBtnSpan'></span><span data-id='" +
				id + "' class='glyphicon glyphicon-remove kBtnSpan'></span><a href='#panel-" +
				id + "'>" +
				name + "</a></li>";
			var jq = $(html);

			jqList.append(jq);

			if(onNewItem){
				onNewItem(id,name);
			}
		};

		//btn new
		var jqBtnNew = $("#idBtnNewPanel");
		jqBtnNew.click(function(event) {
			//newItem(1,"234")
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
				}
			},
			New:function(id,name){
				newItem(id,name);
			},
		};
	};

	//
	var panelList = newPanelList();
	var panels = initObj.Panels;
	for (var i = 0; i < panels.length; i++) {
		var panel = panels[i];
		panelList.New(panel.Id,panel.Name);
	}
};