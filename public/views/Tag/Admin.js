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
	

	//父節點 修改框
	var newModalParent = function(){
		var ID_NONE = -1;
		var jqBtn = $("#idBtnModal");
		var jqWait = $("#idModalParentWait");
		var jqTree = $("#idModalParentTree");

		var jqSure = $("#idModalParentSure");
		var jqCancel = $("#idModalParentCancel");
		var onOk = null;
		jqSure.click(function(event) {
			if(onOk){
				var tree = jqTree.jstree(true);
				if(tree){
					var id = tree.get_selected();
					id = id[0];
					if(id && id != ""){
						onOk(id);
						jqCancel.click();
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

				newArrs.push({
					Id:id,
					Sort:index,
				});

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
			sort:function(l, r){
				var nodeL = this.get_node(l);
				var nodeR = this.get_node(r);
				return nodeL.data > nodeR.data?1:-1;
			},
			contextmenu:{
				items:function(node){
					if(!isEnable()){
						return;
					}

					var tree = this;
					var id = node.id;

					var sortItem = null; 
					if(node.children.length > 1){
						sortItem = {
							label:language["sort"],
							icon:"/public/img/sort_16px.ico",
							"separator_before": true,
							"separator_after": false,
							action: function (obj) { 
								if(!isEnable()){
									return;
								}
								var arrs = [];
								for(var i=0;i<node.children.length;++i){
									var tmp = tree.get_node(node.children[i]);
									arrs.push({
										Id:tmp.id,
										Name:tmp.text,
									});
								}
								modalSort.Show(arrs,function(arrs){
									if(!isEnable()){
										return;
									}

									var updateSort = function(arrs){
										for (var i = 0; i < arrs.length; i++) {
											var obj = arrs[i];
											var id = obj.Id;
											var tmp = tree.get_node(id);
											tmp.data = obj.Sort;
										}
										tree.close_node(node);
										tree.sort(node);
										tree.open_node(node);
									};
									
									enable(false);
									tree.set_icon(node,icon);
									hideMsg();
									var sort = JSON.stringify(arrs);
									$.ajax({
										url: '/Tag/AjaxSort',
										type: 'POST',
										dataType: 'json',
										data: {
											str:sort,
										},
									})
									.done(function(result) {
										if(0 == result.Code){
											updateSort(arrs);
											
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
						};
					}
					var createItem = {
						label:language["create"],
						icon:"/public/img/add_16px.ico",
						action: function (obj) { 
							if(!isEnable()){
								return;
							}
							var id = node.id;
							var sort = node.children.length;


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
									sort:sort,
								},
							})
							.done(function(result) {
								if(0 == result.Code){
									var newNode = tree.create_node(node,{
										id:result.Value,
										parent:id,
										text:name,
										data:sort,
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
						return {
							create:createItem,
							sort:sortItem,
						};
					}

					return {
						create:createItem,
						sort:sortItem,
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