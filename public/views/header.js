var NewHeader = function(initObj){
	"use strict";
	var language = initObj.Language;
	
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
	var msgid = 10000;
	var modal = newMsg(msgid++);

	$("#idAOffline").click(function(event) {

		modal.Show(language["msg warning"],language["offline"],function(){
			this.Hide();
			window.open("/Offline/Index");
		});
		return false;
	});

	$("#idARestore").click(function(event) {
		modal.Show(language["msg warning"],language["restore"],function(){
			this.Hide();
			window.open("/Offline/Restore");
		});
		return false;
	});
};