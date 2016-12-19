var NewChapter = function(initObj){
	var language = initObj.Language;
	var oldVal = initObj.OldVal;

	var _enable = true;
	var enable = function(ok){
		if(ok){
			_enable = true;
		}else{
			_enable = false;

		}
	};
	var isEnable = function(){
		return _enable;
	};
	var isDisable = function(){
		return !_enable;
	};

	//msg
	var MESSAGE_SUCCESS		= 0;
	var MESSAGE_INFO		= 1;
	var MESSAGE_WARNING		= 2;
	var MESSAGE_DANGER		= 3;
	var jqViewMsg = $("#idChapterMsg");
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

	var jqBodyView = $("#idChapterBodyView");
	var jqBodyHide = $("#idChapterBodyHide");
	$("#idChapterHide").click(function(event) {
		jqBodyHide.toggle("fast");
		jqBodyView.toggle("fast");
	});

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
		var ICON_WAIT = "/public/img/throbber.gif";
		var jqTree = $("#idChapterTree");
		var ROOT_ID = "0";
		
		var actionNew = function(tree,node){
			if(isDisable()){
				return;
			}
			enable(false);
			var name = language["new name"];
			$.ajax({
				url: '/Chapter/AjaxNew',
				type: 'POST',
				dataType: 'json',
				data: {doc: initObj.Id,name:name},
			})
			.done(function(result) {
				if(0 == result.Code){
					var newNode = tree.create_node(node,{
						id:result.Value,
						parent:ROOT_ID,
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
				enable(true);
			});
			
		};
		var actionSort = function(tree,node){
			if(isDisable()){
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
				if(isDisable()){
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
				tree.set_icon(node,ICON_WAIT);
				hideMsg();
				var sort = JSON.stringify(arrs);
				$.ajax({
					url: '/Chapter/AjaxSort',
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
		};
		var actionEdit = function(tree,node){
			var url = "/Edit?id=" + node.id;
			window.open(url);
		};
		jqTree.jstree({
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
					var tree = this;
					if(ROOT_ID == node.id){
						return {
							create:{
								label:language["menu new"],
								icon:"/public/img/add_16px.ico",
								action:function(){
									actionNew(tree,node);
								},
							},
							sort:{
								label:language["menu sort"],
								icon:"/public/img/sort_16px.ico",
								separator_before: true,
								action:function(){
									actionSort(tree,node);
								},
							},
						};
					}
					return {
						view:{
							label:language["menu view"],
							icon:"/public/img/cloud_16px.ico",
							action:function(){
							},
						},
						edit:{
							label:language["menu edit"],
							icon:"/public/img/wrench_16px.ico",
							action:function(){
								actionEdit(tree,node);
							},
						},
						rename:{
							label:language["menu rename"],
							icon:"/public/img/why_16px.ico",
							separator_before: true,
							action:function(){
								if(isDisable()){
									return;
								}
								tree.edit(node);
							},
						},
						remove:{
							label:language["menu remove"],
							icon:"/public/img/close_16px.ico",
							separator_before: true,
							action:function(){
								if(isDisable()){
									return;
								}
							},
						},
					};
				},
			},
			sort:function(l, r){
				var nodeL = this.get_node(l);
				var nodeR = this.get_node(r);
				return nodeL.data > nodeR.data?1:-1;
			},
			core:{
				check_callback : true,
				data:initObj.Data,
			},
		}).on("rename_node.jstree",function(e,obj){
			var tree = $(this).jstree(true);

			var node = obj.node;
			var text = obj.text;
			var old = obj.old;
			if(text == old){
				return;
			}

			if(isDisable()){
				tree.set_text(node,old);
				return;
			}

			//
			enable(false);
			tree.set_icon(node,ICON_WAIT);
			hideMsg();
			var id = node.id;
			$.ajax({
				url: '/Chapter/AjaxRename',
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

	};
	newTree();
};