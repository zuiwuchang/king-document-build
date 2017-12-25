var NewContext = function(initObj){
	"use strict";
	
	(function(){
		var jqBtnToggle = $("#idBtnToggle");
		var jqHide = $("#idBodyHide");
		var jqView = $("#idBodyView");
		jqBtnToggle.click(function(event) {
			jqHide.toggle("fast");
			jqView.toggle("jqView");
		});
	})();

	var initPanelView = function(panel){
		//jq
		var jq = $("#idPanel-" + panel.Id);
		
		var jqName = jq.find('.kPanelName:first');

		var jqHide = jq.find('.kPanelHide:first');
		var jqBody = jq.find('.kPanelBody:first');
		var jqBodyView = jqBody.find('.kPanelBodyView:first');

		//event
		jq.find('.kBtnTop:first').click(function(event) {
			location.href="#top";
		});
		jq.find('.kBtnMenuHide:first').click(function(event) {
			jqHide.toggle("fast");
			jqBody.toggle("fast");
		});
		
		//section
		var initSection = function(section){
			var jq = $("#idSection-" + section);
			var jqHide = jq.find('.kSectionHide:first');
			var jqShow = jq.find('.kSectionBody:first');

			//event
			jq.find('.kBtnSpan:first').click(function(event) {
				jqHide.toggle("fast");
				jqShow.toggle("fast");
			});
		};
		var section = panel.Section;
		for (var i = 0; i < section.length; i++) {
			initSection(section[i]);
		}
	};

	//init panel
	var panels = initObj.Panels;
	for (var i = 0; i < panels.length; i++) {
		initPanelView(panels[i]);
	}

	prettyPrint();
};