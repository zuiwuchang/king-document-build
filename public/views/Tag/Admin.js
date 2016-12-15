var NewContext = function(initObj){
	var language = initObj.Language;

	//msg
	var MESSAGE_SUCCESS		= 0;
	var MESSAGE_INFO		= 1;
	var MESSAGE_WARNING	= 2;
	var MESSAGE_DANGER		= 3;
	var jqViewMsg = $("#idViewMsg");
	var showMsg = function(msg,n){
		var html = "<div class='alert ";
		if(n == MESSAGE_INFO){
			html += "alert-info";
		}else if(n == MESSAGE_WARNING){
			html += "alert-warning";
		}else if(n == MESSAGE_DANGER){
			html += "alert-danger";
		}else{
			html += "alert-success";
		}
		html += "' role='alert'>"  + 
			msg + "</div>";
		jqViewMsg.html(html);
		jqViewMsg.show("fast");
	};
	var hideMsg = function(){
		jqViewMsg.hide("fast");
	};
	//
	var newModalParent = function(){
		var ID_NONE = -1;
		var jqBtn = $("#idBtnModal");
		var jqWait = $("#idModalParentWait");
		var jqTree = $("#idModalParentTree");

		return {
			Show:function(data){
				jqBtn.click();
				var pid = -1;
				jqWait.show();
				jqTree.hide();

				jqTree.destroy();
				jqTree.
			},
		};
	};
	var modalParent = newModalParent();

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

		var jq = $("#idTree");
		var icon = "/public/js/jstree/themes/default/throbber.gif";
		var getCanParent = function(id){
			var arrs = [];

			return arrs;
		};
		jq.jstree({
			plugins : [ 
				"contextmenu",
				"sort",
			],
			contextmenu:{
				items:function(node){
					if(!isEnable()){
						return;
					}

					var tree = jq.jstree(true);
					var id = node.id;

					var createItem = {
						label:language["create"],
						icon:"/public/img/add_16px.ico",
						action: function (obj) { 
							if(!isEnable()){
								return;
							}
							enable(false);
							tree.set_icon(node,icon);
							hideMsg();
							var name = language["new tag"];
							$.ajax({
								url: '/Tag/AjaxCreate',
								type: 'POST',
								dataType: 'json',
								data: {
									pid:id,
									name:name,
								},
							})
							.done(function(result) {
								if(0 == result.Code){
									var newNode = tree.create_node(node,{
										id:result.Value,
										parent:id,
										text:name,
									});
									tree.edit(newNode);
								}else{
									showMsg(result.Emsg,MESSAGE_DANGER);
								}
							})
							.fail(function() {
								showMsg(language["err net"],MESSAGE_DANGER);
							})
							.always(function() {
								tree.set_icon(node);
								enable(true);
							});
						},
					};
					if(id == 0){
						return {create:createItem};
					}

					return {
						create:createItem,
						edit:{
							label:language["edit"],
							icon:"/public/img/why_16px.ico",
							"separator_before": true,
							"separator_after": false,
							action: function (obj) {
								if(!isEnable()){
									return;
								}
								tree.edit(node);
							},
						},
						move:{
							label:language["move"],
							icon:"/public/img/info_16px.ico",
							"separator_before": true,
							"separator_after": false,
							action: function (obj) {
								if(!isEnable()){
									return;
								}
								var arrs = getCanParent(id);
								modalParent.Show(arrs,function(id){
									//ajax
								});
							},
						},
						erase:{
							label:language["erase"],
							icon:"/public/img/close_16px.ico",
							"separator_before": true,
							"separator_after": false,
							action: function (obj) { 
								if(!isEnable()){
									return;
								}
							},
						},
					};
				},
			},
			core:{
				check_callback : true,
				data:initObj.Data,
			},
		}).on("rename_node.jstree",function(e,obj){
			var tree = jq.jstree(true);

			var node = obj.node;
			var text = obj.text;
			var old = obj.old;
			if(text == old){
				return;
			}

			if(!isEnable()){
				tree.set_text(node,old);
				return;
			}

			//
			enable(false);
			tree.set_icon(node,icon);
			hideMsg();
			var id = node.id;
			$.ajax({
				url: '/Tag/AjaxRename',
				type: 'POST',
				dataType: 'json',
				data: {
					id:id,
					name:text,
				},
			})
			.done(function(result) {
				if(0 != result.Code){
					showMsg(result.Emsg,MESSAGE_DANGER);
					tree.set_text(node,old);
				}
			})
			.fail(function() {
				showMsg(language["err net"],MESSAGE_DANGER);
				tree.set_text(node,old);
			})
			.always(function() {
				tree.set_icon(node);
				enable(true);
			});
		});
		/*$("#idBtn").click(function(event) {
			var tree = jq.jstree(true);
			var node = tree.get_node('1');
			tree.set_text(node,"123")
		});*/
		return {

		};
	};
	newTree();

	return {
	};
};