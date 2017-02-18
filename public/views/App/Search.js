var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	var ICON_WAIT = "/public/img/throbber.gif"
	
	var _enable = true;
	var isEnable = function(){
		return _enable;
	};
	var isDisable = function(){
		return !_enable;
	};
	var enable = function(ok){
		if(ok){
			_enable = true;
		}else{
			_enable = false;
		}
	};

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
	//var modal = newMsg(msgid++);
	var modal = newMsg(msgid++);
	var modalError = newMsg(msgid++);
	

	//tree
	var newTree = function(){
		var onSearch = null;
		

		var jq = $("#idTagTree");
		var icon = "/public/js/jstree/themes/default/throbber.gif";
		var tree = null;
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
					var tree = this;
					//search
					var itemsObj = {
						search:{
							label:language["search tag"],
							icon:"/public/img/book_16px.ico",
							action:function(){
								if(onSearch){
									onSearch(tree,node);
								}
							},	
						},
					};
					//toggle
					if(!tree.is_leaf(node)){
						itemsObj.toggle = {
							label:language["toggle tag"],
							icon:"/public/img/attachment_16px.ico",
							separator_before: true,
							action:function(){
								tree.toggle_node(node);
							},	
						};
					}

					return itemsObj;
				},
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
			tree = $(this).jstree(true);
		}).on("select_node.jstree",function(e,obj){
			var tree = $(this).jstree(true);

			var node = obj.node;
			if(!tree.is_leaf(node) && tree.is_closed(node)){
				tree.open_node(node);
			}

			if(node.data.Docs != 0){
				onSearch(tree,node);
			}
		}).off("keydown");

		return {
			Bind:function(name,callback){
				if(name == "search"){
					onSearch = callback;
				}
			},
			Tree:function(){
				return tree;
			},
		};
	};
	var mytree = newTree();

	var jqView = $("#idDocsView");
	var newDocsView = function(){
		return {
			Update:function(arrs,mytree,node){
				if(!arrs){
					jqView.html(language["none data"]);
					return;
				}
				var items = [];
				var map = {};
				for (var i = 0; i < arrs.length; i++) {
					var data= arrs[i];
					var id = data.Id;
					map[id] = data;					
					items.push("<p id='k-view-" + id + "'>" + 
							"<span class='glyphicon glyphicon-wrench kBtnSpan' data-id='" + id + "'></span>" +
							"<span class='glyphicon glyphicon-remove kBtnSpan' data-id='" + id + "'></span>" +
							"<a target='_blank' href='/Document/Index?id=" + id + "'>" + data.Name  +"</a>" + 
						"</p>");
				}
				var jq = $(items.join(""));
				jqView.html(jq);

				var ajaxRemove = function(id){
					if(isDisable()){
						return;
					}
					enable(false);
					$.ajax({
						url: '/Document/AjaxRemove',
						type: 'POST',
						dataType: 'json',
						data: {id:id},
					}).done(function(result) {
						if(result.Code == 0){
							var idStr = "#k-view-" + id;
							$(idStr).remove();
							var tree = mytree.Tree();
							node.data.Docs = node.data.Docs -1;
							var name = node.data.Name + "&nbsp;&nbsp;&nbsp;&nbsp;" + "[" + node.data.Docs + "]";
							tree.set_text(node,name);
						}else{
							modalError.Show(language["err.title"],result.Emsg);
						}
					}).fail(function() {
						modalError.Show(language["err.title"],language["err net"]);	
					}).always(function() {
						enable(true);
					});
				};
				jq.find('.glyphicon-wrench').click(function(event) {
					var href = "/Document/Edit?id=" + $(this).data('id');
					window.open(href);
				});
				jq.find('.glyphicon-remove').click(function(event) {
					var id = $(this).data('id');
					var obj = map[id];
					var str = language["erase"] + " - " + obj.Name + "<br>" + language["sure?"];
					modal.Show(language["msg warning"],str,function(){
						this.Hide();
						ajaxRemove(id);
					});
				});
				
			},
		};
	};
	var docsView = newDocsView();

	var lastSearchId = null;
	mytree.Bind("search",function(tree,node){
		if(!isEnable() || lastSearchId == node.id){
			return;
		}
		enable(false);
		lastSearchId = node.id;
		tree.set_icon(node,ICON_WAIT);
		$.ajax({
			url: '/Tag/AjaxGetDocs',
			type: 'POST',
			dataType: 'json',
			data: {tag:node.id},
		})
		.done(function(result) {
			if(result.Code == 0){
				docsView.Update(result.Data,mytree,node);
			}else{
				modalError.Show(language["error title"],result.Emsg)
			}
		})
		.fail(function() {
			modalError.Show(language["error title"],language["err net"])
		})
		.always(function() {
			enable(true);
			tree.set_icon(node);
		});
		
	});
	var jqViewHide = $("#idDocsHide");
	$("#kBtnIcon").click(function(event) {
		jqView.toggle("fast");
		jqViewHide.toggle("fast");
	});
};