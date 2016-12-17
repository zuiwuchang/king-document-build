var NewContext = function(initObj){
	var language = initObj.Language;

	//可用 錨點id
	var navId = 0;

	//
	var jqView = $("#idView");
	var jqMenuNav = $("#idMenuNav");
	var jqTopNav = $("#idTopNav");

	//創建 頁面 導航
	var newTopNav = function(){
		var onUpdate = null;
		var jq = jqTopNav.sortable()
				.disableSelection()
				.sortable({
					update: function(event,ui){
						var ids = [];
						jqTopNav.find('a').each(function(index, el) {
							var id = $(el).attr('href');
							id = id.substring(4);
							ids.push(id);
						});
						if(onUpdate){
							onUpdate(ids);
						}
					},
				});
		var map = {};
		return {
			//在末尾增加一個 導航
			Push:function(id,name){
				var html = "<li class='list-group-item'><h5><a href='#nav" + 
					id +"'>" +
					name + "</a></h5></li>";
				var jqNode = $(html);
				map[id] = jqNode;
				jqTopNav.append(jqNode);
			},
			//更新名稱
			UpdateName:function(id,name){
				var jq = map[id];
				jq.find("a:first").text(name);
			},
			//
			Bind:function(name,func){
				if(name == "update"){
					onUpdate = func;
				}
			},
		};
	};
	var topNav = newTopNav();

	//爲面板 創建一個 新部分
	var newSection = function(jqBefore){
		var jqView = $("<ul class='list-group'></ul>");

		var newNode = function(id){
			var name = language["new section"] + " " + id ;
			var html = "<li class='list-group-item'><h4>" + 
					name +"</h4></li>";
			var jq = $(html);

			//
			jqView.append(jq);			
			return {
				Id:id,
				Title:name,
				Jq:jq,
			};
		};
		
		jqView.sortable()
			.disableSelection();
		jqBefore.before(jqView);

		var map = {};
		var id = 0;
		return {
			NewNode:function(){
				var node = newNode(id);
				map[id] = node;

				++id;
			},
		};
	};

	/*	面板	*/
	//面板節點
	var panels = {};

	//創建 一個 面板
	var newPanel = function(name){
		var id = navId++;
		name += " " + id;
		var html = "<a class='k-target' name='nav" + id +"'></a><p><div class='panel panel-default'><div class='panel-heading'><div class='kPanelTitleView'><span class='glyphicon glyphicon-minus kPanelTitleMinus'></span><span class='glyphicon glyphicon-wrench kPanelTitleWrench'></span><span class='kPanelTitelViewVal'>"
			+ name +
			"</span></div>" +
			"<div class='kPanelTitleEdit'><div class='input-group'><span class='input-group-btn'><button class='btn btn-default kPanelTitleBtn'>" +
			language["save"] + 
			"</button></span><input type='text' class='form-control kPanelTitleVal'></div></div>" +
			"</div><div class='panel-body'><div class='kPanelBodyHide'>" + 
			language["panel hide"] + "</div><div class='kPanelBodyView'><span class='glyphicon glyphicon-plus kPanelBodyNew'></span></div></div></div></p>";
		//jq
		var jq = $(html);

		//element
		var jqTitleView = jq.find(".kPanelTitleView");
		var jqTitleViewVal = jq.find(".kPanelTitelViewVal");
		var jqTitleMinus = jq.find(".kPanelTitleMinus");
		var jqTitleWrench = jq.find(".kPanelTitleWrench");
		var jqTitleEdit = jq.find(".kPanelTitleEdit");
		var jqTitleBtn = jq.find(".kPanelTitleBtn");
		var jqTitleVal = jq.find(".kPanelTitleVal");


		var jqBodyHide = jq.find(".kPanelBodyHide");
		var jqBodyView = jq.find(".kPanelBodyView");

		var jqBodyNew = jq.find(".kPanelBodyNew");

		//爲面板 創建 導航條
		var jqNav = $("<li><a href='#nav" + id + "'>" + name + "</a></li>");
		var jqNavVal = jqNav.find('a:first');
		jqMenuNav.append(jqNav);

		//爲面板 創建 頁面 導航
		topNav.Push(id,name);

		//new object
		var newObj = {
			Id:id,
			Title:name,
			Jq:jq,
			Section:newSection(jqBodyNew),

			UpdateTitleView:function(){
				var title = this.Title;
				var id = this.Id;
				jqTitleViewVal.text(title);
				jqNavVal.text(title);
				topNav.UpdateName(id,title);
			},
			MoveLast:function(){
				jqView.append(this.Jq);
				jqMenuNav.append(jqNav);
			},
		};

		//event
		jqTitleWrench.click(function(event) {
			jqTitleVal.val(newObj.Title);

			jqTitleView.hide();
			jqTitleEdit.show();

			jqTitleVal.select().focus();
		});
		var doSave = function(){
			var val = jqTitleVal.val();
			val = $.trim(val);
			newObj.Title = val;

			jqTitleEdit.hide();
			jqTitleView.show();

			newObj.UpdateTitleView();
		};
		jqTitleBtn.click(doSave);
		/*jqTitleVal.keyup(function(event) {
			if(event.keyCode == 13){
				doSave();
			}
		});*/

		jqTitleMinus.click(function(event) {
			jqBodyView.hide("fast");
			jqBodyHide.show("fast");
		});
		jqBodyHide.click(function(event) {
			jqBodyHide.hide("fast");
			jqBodyView.show("fast");
		});
		jqBodyNew.click(function(event) {
			newObj.Section.NewNode();
		});

		//將面板 增加到 html
		jqView.append(newObj.Jq);

		//將 面板 增加到 節點集合
		panels[id] = newObj;
		return newObj;
	};
	return {
		NewPanel:function(name){
			newPanel(name);
		},
		BindEvent:function(){
			topNav.Bind("update",function(ids){
				for (var i = 0; i < ids.length; i++) {
					var id = ids[i];
					var panel = panels[id];
					panel.MoveLast();
				}
			});

			$("#idBtnNew").click(function(event) {
				//var obj = newPanel(language["new panel"]);
				//$("html,body").animate({scrollTop: obj.Jq.offset().top}, 500);
				return true;
			});
		},
	};
};