var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	var ICON_WAIT = "/public/img/throbber.gif"
	
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
		var onSearch = null;
		

		var jq = $("#idTagTree");
		var icon = "/public/js/jstree/themes/default/throbber.gif";
		
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
		});
		return {
			Bind:function(name,callback){
				if(name == "search"){
					onSearch = callback;
				}
			},
		};
	};
	var mytree = newTree();

	var jqView = $("#idDocsView");
	var newDocsView = function(){
		return {
			Update:function(arrs){
				if(!arrs){
					jqView.html(language["none data"]);
					return;
				}
				var items = [];
				for (var i = 0; i < arrs.length; i++) {
					var data= arrs[i];
					items.push("<p><span class='glyphicon glyphicon-wrench kBtnEdit' data-id='" +
						data.Id + "'></span><a target='_blank' href='/Document/Index?id=" +
						data.Id + "'>" + data.Name  +"</a></p>");
				}
				var jq = $(items.join(""));
				jq.find('.kBtnEdit').click(function(event) {
					var href = "/Document/Edit?id=" + $(this).data('id');
					window.open(href);
				});
				jqView.html(jq);
			},
		};
	};
	var docsView = newDocsView();

	mytree.Bind("search",function(tree,node){
		if(!isEnable()){
			return;
		}
		enable(false);
		tree.set_icon(node,ICON_WAIT);
		$.ajax({
			url: '/Tag/AjaxGetDocs',
			type: 'POST',
			dataType: 'json',
			data: {tag:node.id},
		})
		.done(function(result) {
			if(result.Code == 0){
				docsView.Update(result.Data);
			}else{
				modal.Show(language["error title"],result.Emsg)
			}
		})
		.fail(function() {
			modal.Show(language["error title"],language["err net"])
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