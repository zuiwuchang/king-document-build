var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	
	//width
	(function(){
		var jqNames = $(".kLocaleName");
		var width = 0;
		var jqBody = $("body");
		jqNames.each(function(index, el) {
			var html = "<span style='display:none'>" +  $(el).html() + "</span>";
			var jq = $(html);
			jqBody.append(jq);
			var w = jq.width()
			jq.remove();
			if (w > width) {
				width = w;
			}
		});
		jqNames.width(width + 8);
	})();

	//i18n
	(function(){
		//local
		var cookie = king.cookie;
		var i18n = "king-document-build_i18n";
		$(".kLocale").click(function(event) {
			var v = $(this).attr('href');
			if(v == "#default"){
				cookie.Erase(i18n,"/");
			}else{
				v = v.substring(1);
				cookie.Set(i18n,v,"/",24*60*60*365);
			}
			location.reload();
		});
	})();

	//msg
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
	var modal = newMsg(msgid++);

	$("#idAOffline").click(function(event) {
		modal.Show(language["msg warning"],language["offline"],function(){
			this.Hide();
			window.open("/Offline/Index");
		});
	});

	$("#idARestore").click(function(event) {
		modal.Show(language["msg warning"],language["restore"],function(){
			this.Hide();
			window.open("/Offline/Restore");
		});
	});
};