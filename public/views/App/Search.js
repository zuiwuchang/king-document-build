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
	//modal.Show(1,2)

	//tree
	var newTree = function(){
		var _enable = true;
		var isEnable = function(){
			return _enable;
		};
		var enable = function(ok){
			if(ok){
				_enable = true;
			}else{
				_enable = false;
			}
		};

		

		var jq = $("#idTagTree");
		var icon = "/public/js/jstree/themes/default/throbber.gif";
		
		jq.hide().jstree({
			plugins : [
				"conditionalselect",
				//"contextmenu",
				"sort",
			],
			conditionalselect:function(){
				this.deselect_all(true);
				return true;
			},
			sort:function(l, r){
				var nodeL = this.get_node(l);
				var nodeR = this.get_node(r);
				return nodeL.data.Sort > nodeR.data.Sort?1:-1;
			},
			core:{
				check_callback : true,
				data:initObj.Data,
			},
		}).on("ready.jstree",function(){
			$(this).show();
		});
	};
	newTree();
};