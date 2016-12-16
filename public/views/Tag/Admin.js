var NewContext = function(initObj){
	var language = initObj.Language;
	var TREE_ROOT_ID = '0';
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
	

	//
	var newModalParent = function(){
		var ID_NONE = -1;
		var jqBtn = $("#idBtnModal");
		var jqWait = $("#idModalParentWait");
		var jqTree = $("#idModalParentTree");

		var jaSure = $("#idModalParentSure");
		var jaCancel = $("#idModalParentCancel");
		var onOk = null;
		jaSure.click(function(event) {
			if(onOk){
				var tree = jqTree.jstree(true);
				if(tree){
					var id = tree.get_selected();
					id = id[0];
					if(id && id != ""){
						onOk(id);
						jaCancel.click();
					}else{
						modal.Show(language["err err"],language["err no set pid"]);
					}
				}
			}
		});

		return {
			Show:function(data,callback){
				if(callback){
					onOk = callback;
				}

				jqBtn.click();
				var pid = -1;
				jqWait.show();
				jqTree.hide();

				var tree = jqTree.jstree(true);
				if(tree){
					tree.destroy();
				}
				jqTree.jstree({
					plugins : [ 
						"sort",
						"conditionalselect",
					],
					conditionalselect:function(){
						this.deselect_all(true);
						return true;
					},
					core:{
						data:data,
					},
				}).on("ready.jstree",function(){
					jqWait.hide();
					jqTree.show();
				});
			},
		};
	};
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

		//modal
		var modalParent = newModalParent();
		

		var jq = $("#idTree");
		var icon = "/public/js/jstree/themes/default/throbber.gif";
		var getCanParent = function(id){
			var arrs = [];
			var tree = jq.jstree(true);
			findCanParent(tree,arrs,id,TREE_ROOT_ID);
			return arrs;
		};
		var findCanParent = function(tree,arrs,fid,id){
			var node = tree.get_node(id);
			if(!node){
				return;
			}
			if(node.id == fid){
				return;
			}
			var open = false;
			if(node.id == TREE_ROOT_ID){
				open = true;
			};
			arrs.push({
				id:node.id,
				parent:node.parent,
				text:node.text,
				state:{
					opened:open,
				},
			});

			if(tree.is_leaf(node)){
				return;
			}

			var childs = node.children;
			for (var i = 0; i < childs.length; i++) {
				if(childs[i] != fid){
					findCanParent(tree,arrs,fid,childs[i]);
				}
			}
		};
		var ajaxRemove = function(tree,node){
			if(!isEnable()){
				return;
			}
			enable(false);
			tree.set_icon(node,icon);
			hideMsg();

			$.ajax({
				url: '/Tag/AjaxRemove',
				type: 'POST',
				dataType: 'json',
				data: {id: node.id},
			}).done(function(result) {
				if(0 == result.Code){
					tree.delete_node(node);
				}else{
					showMsg(result.Emsg,MESSAGE_DANGER);
				}
			}).fail(function() {
				showMsg(language["err net"],MESSAGE_DANGER);
			}).always(function() {
				tree.set_icon(node);
				enable(true);
			});
			
		};
		jq.hide().jstree({
			plugins : [
				"conditionalselect",
				"contextmenu",
				"sort",
			],
			conditionalselect:function(){
				this.deselect_all(true);
				return true;
			},
			contextmenu:{
				items:function(node){
					if(!isEnable()){
						return;
					}

					var tree = this;
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
									if(!isEnable()){
										return;
									}

									if(id == node.id){
										return;
									}
									var pid = tree.get_parent(node);
									if(pid == id){
										return;
									}
									pid = id;
									id = node.id;

									var parent = tree.get_node(pid);
									if(!parent){
										return;
									}

									enable(false);
									tree.set_icon(node,icon);
									hideMsg();
									$.ajax({
										url: '/Tag/AjaxMove',
										type: 'POST',
										dataType: 'json',
										data: {
											'id':id,
											'pid':pid,
										},
									})
									.done(function(result) {
										if(0 == result.Code){
											tree.cut(node);
											tree.paste(parent)
											tree.open_node(parent);
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
								var text = "<p>" + language["erase tag"] + " - " + tree.get_text(node) + 
									"</p><p>" + language["sure?"] + "</p>";
								modal.Show(language["warning"],text,function(modal){
									modal.Hide();
									ajaxRemove(tree,node);
								});
							},
						},
					};
				},
			},
			core:{
				check_callback : true,
				data:initObj.Data,
			},
		}).on("ready.jstree",function(){
			$(this).show();
		}).on("rename_node.jstree",function(e,obj){
			var tree = $(this).jstree(true);

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
		return {

		};
	};
	newTree();

	return {
	};
};