var NewContext = function(initObj){
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
	var msgid = 1;
	var modal = newMsg(msgid++);

	var NewPasswd = function(){
		var jqStyle = $("#idLabelPwd");
		var jqView = $("#idLabelPwdView");
		var jqVal = $("#idValPwd");
		var _show = true;

		jqStyle.click(function(event) {
			if(_show){
				_show = false;
				jqView.attr('class', 'glyphicon glyphicon-eye-close');
				jqVal.attr('type', 'password');
			}else{
				_show = true;
				jqView.attr('class', 'glyphicon glyphicon-eye-open');
				jqVal.attr('type', 'text');
			}

			jqVal.focus().select();
			return false;
		});
		jqVal.focus().select();
		var _getVal = function(){
			var val = jqVal.val().trim();
			if(!val){
				return null;
			}
			return CryptoJS.SHA512(val).toString();
		}
		return {
			GetVal:function(){
				return _getVal();
			},
			SetVal:function(val){
				jqVal.val(val);
			},
		};
	};
	var uiPwd = NewPasswd();

	$("form").submit(function(event) {
		var val = uiPwd.GetVal();
		if(!val){
			return false;
		}
		uiPwd.SetVal(val);
	});
	$("#idAOffline").click(function(event) {
		modal.Show(language["msg warning"],language["offline"],function(){
			this.Hide();
			window.open("/Offline/Index");
		});
	});

	if(initObj.Error){
		alert(language["e"])
	}
	
};