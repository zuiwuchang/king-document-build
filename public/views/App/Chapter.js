var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	
	(function(){
		var jqBtnToggle = $("#idBtnToggle");
		var jqHide = $("#idBodyHide");
		var jqView = $("#idBodyView");
		jqBtnToggle.click(function(event) {
			jqHide.toggle("fast");
			jqView.toggle("jqView");
		});
	})();

	var newPanelView = function(id,name){
		//private
		var DATA_NONE	= 0;	//數據未初始化
		var DATA_OK		= 1;	//可以修改數據
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


		//jq
		var jqView = $("#idPanelsView");
		var html = "<div class='panel panel-default'>" + 
				"<a name='panel-" + id + "'></a>" + 
				"<div class='panel-heading'>" + 
					"<span class='glyphicon glyphicon-asterisk kBtnSpan kBtnTop'></span>" +
					"<span class='kBtnSpan kBtnMenuHide'>" + name + "</span>" + 
				"</div>" + 
				"<div class='panel-body'>" + 
					"<div class='kPanelHide' style='display: none;'>" + language["data is hide"] + "</div>" + 
					"<div class='kPanelBody'>" + 
						"<div class='kPanelBodyView'>" + language["wait init data"] + "</div>" + 
					"</div>" +
				"</div>" + 
			"</div>";
		var jq = $(html);
		jqView.append(jq);
		
		var jqName = jq.find('.kPanelName:first');

		var jqHide = jq.find('.kPanelHide:first');
		var jqBody = jq.find('.kPanelBody:first');
		var jqBodyView = jqBody.find('.kPanelBodyView:first');

		
		var newSection = function(id,name,oldVal){
			var jqView = jqBodyView;
			var html = "<div>" +
					"<h4>" +
						"<span class='kBtnSpan'>" + name + "</span>" +
					"</h4>" + 
					"<div class='kSectionHide'>" + language["data is hide"] + "</div>" +
					"<div class='kSectionBody'>" + 
						"<div class='kSectionView'>" + oldVal + "</div>" +
					"</div>" +
				"</div>";

			var jq = $(html);

			var jqHide = jq.find('.kSectionHide:first');
			var jqShow = jq.find('.kSectionBody:first');

			jqView.append(jq);
			
			//event
			jq.find('.kBtnSpan:first').click(function(event) {
				jqHide.toggle("fast");
				jqShow.toggle("fast");
			});

			prettyPrint();
		};
		//init
		var initData = function(id){
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
					setDataOk();
				}else{
					jqBodyView.html(result.Emsg);
				}
			})
			.fail(function() {
				jqBodyView.html(language["err net"]);
			});
		};
		initData(id);

		//event
		jq.find('.kBtnTop:first').click(function(event) {
			location.href="#top";
		});
		jq.find('.kBtnMenuHide:first').click(function(event) {
			jqHide.toggle("fast");
			jqBody.toggle("fast");
		});
		
	};

	//init panel
	var panels = initObj.Panels;
	for (var i = 0; i < panels.length; i++) {
		var panel = panels[i];
		newPanelView(panel.Id,panel.Name);
	}
};