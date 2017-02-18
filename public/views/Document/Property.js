var NewProperty = function(initObj){
	"use strict";
	var language = initObj.Language;
	var oldVal = initObj.OldVal;

	var _enable = true;
	var jqValName = $("#idPropertValName");
	var jqShowTag = $("#idPropertShowTag");
	var jqValTag = $("#idPropertValTag");
	var jqBtnSave = $("#idPropertBtnSave");
	var enable = function(ok){
		if(ok){
			_enable = true;

			jqValName.removeAttr('disabled');
			jqShowTag.removeAttr('disabled');
			jqBtnSave.removeAttr('disabled');
		}else{
			_enable = false;

			jqValName.attr('disabled', 'disabled');
			jqShowTag.attr('disabled', 'disabled');
			jqBtnSave.attr('disabled', 'disabled');
		}
	};
	var isEnable = function(){
		return _enable;
	}

	var jqView = $("#idViewProperty");
	var newNameLister = function(){
		var jqVal = $("#idPropertValName");
		var jqStatus = $("#idPropertStatusName");
		var updateStatus = function(){
			var val = jqVal.val();
			if(val == oldVal.Name){
				jqStatus.addClass('glyphicon-ok');
				jqStatus.removeClass('glyphicon-warning-sign');
				return false;
			}

			jqStatus.removeClass('glyphicon-ok');
			jqStatus.addClass('glyphicon-warning-sign');
			return true;
		};
		return {
			UpdateStatus:function(){
				return updateStatus();
			},
			JqVal:jqVal,
		};
	};
	var nameLister = newNameLister();
	var newTagLister = function(){
		var jqVal = $("#idPropertValTag");
		var jqStatus = $("#idPropertStatusTag");
		var updateStatus = function(){
			var val = jqVal.val();
			if(val == oldVal.Tag){
				jqStatus.addClass('glyphicon-ok');
				jqStatus.removeClass('glyphicon-warning-sign');
				return false;
			}

			jqStatus.removeClass('glyphicon-ok');
			jqStatus.addClass('glyphicon-warning-sign');
			return true;
		};
		return {
			UpdateStatus:function(){
				return updateStatus();
			},
		};
	};
	var tagLister = newTagLister();
	var jqWriteStatus = $("#idPropertWriteStatus");
	var updateStatus = function(){
		var chName = nameLister.UpdateStatus();
		var chTag = tagLister.UpdateStatus();
		var change = false;
		if(chName || chTag){
			jqWriteStatus.text(language["status.write"]);
			change = true;
		}else{
			jqWriteStatus.text(language["status.none"]);
		}
		return change;
	};
	nameLister.JqVal.change(function(event) {
		updateStatus();
	});

	(function() {
		var jq = jqView.find(".kSpanName");
		var width = 0
		jq.each(function(index, el) {
			var tmp= $(el).width();
			if(tmp > width){
				width = tmp;
			}
		});
		jq.width(width);
	})();
	(function() {
		var jqShowTag = $("#idPropertShowTag");
		var jqValTag = $("#idPropertValTag");
		var jqSure = $("#idModalTagSure");
		var jqCancel = $("#idModalTagCancel");


		var jqBtn = $("#idBtnTag");
		var jqTree = $("#idModalTagTree");
		jqTree.jstree({
			plugins : [
				"conditionalselect",
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
			core:{
				check_callback : true,
				data:initObj.Data,
			},
		}).on('ready.jstree', function(event) {
			var tag = initObj.InitTag;
			if(!tag || tag == "0" || tag == ""){
				return;
			}
			var tree = jqTree.jstree(true);
			var node = tree.get_node(tag);
			if(!node){
				return;
			}
			jqValTag.val(tag);
			jqShowTag.text(tree.get_text(node));
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
		
		jqShowTag.click(function(event) {
			if(isEnable()){
				jqBtn.click();
			}
		});
		var resetTagVal = function(){
			jqShowTag.text('');
			jqValTag.val('0');
			jqCancel.click();
			updateStatus();
		};
		jqSure.click(function(event) {
			var tree = jqTree.jstree(true);
			var id = tree.get_selected();
			id = id[0];
			if(!id || id == "" || id == "0"){
				resetTagVal();
				return;
			}
			
			var node = tree.get_node(id);
			if(!node){
				resetTagVal();
				return;
			}
			jqValTag.val(id);
			jqShowTag.text(tree.get_text(node));
			jqCancel.click();
			updateStatus();
		});
	})();

	var TREE_ROOT_ID = '0';
	//msg
	var MESSAGE_SUCCESS		= 0;
	var MESSAGE_INFO		= 1;
	var MESSAGE_WARNING		= 2;
	var MESSAGE_DANGER		= 3;
	var jqViewMsg = $("#idPropertyMsg");
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

	//jq
	jqBtnSave.click(function(event) {
		if(!isEnable()){
			return;
		}
		if(!updateStatus()){
			return;
		}
		hideMsg();
		enable(false);
		var name = jqValName.val();
		var tag = jqValTag.val();

		$.ajax({
			url: '/Document/AjaxModify',
			type: 'POST',
			dataType: 'json',
			data: {id:oldVal.Id,name:name,tag:tag},
		})
		.done(function(result) {
			if(0 == result.Code){
				oldVal.Name = name;
				oldVal.Tag = tag;
				updateStatus();
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
		
	});
	

	var jqBodyView = $("#idPropertyBodyView");
	var jqBodyHide = $("#idPropertyBodyHide");
	$("#idPropertyHide").click(function(event) {
		jqBodyHide.toggle("fast");
		jqBodyView.toggle("fast");
	});
};