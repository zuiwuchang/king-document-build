var NewContext = function(initObj){
	"use strict";
	var language = initObj.Language;
	(function() {
		var jq = $(".kSpanName");
		var width = 0
		jq.each(function(index, el) {
			var tmp= $(el).width();
			if(tmp > width){
				width = tmp;
			}
		});
		jq.width(width);
		$("#idBtnSubmit").attr('style', 'margin-left:' + (width + 35) + "px;");
		$("#idValName").select().focus();
	})();

	(function() {
		var jqShowTag = $("#idShowTag");
		var jqValTag = $("#idValTag");
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
		});
		jqShowTag.click(function(event) {
			jqBtn.click();
		});
		var resetTagVal = function(){
			jqShowTag.text('');
			jqValTag.val('0');
			jqCancel.click();
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
		});
	})();
	return {
		BindEvent:function(){
			
		},
	};
};