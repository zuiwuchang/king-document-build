var NewProperty = function(initObj){
	var language = initObj.Language;

	var jqView = $("#idViewProperty");
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
			var tag = initObj.OldVal.Tag;
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

	var TREE_ROOT_ID = '0';
	//msg
	var MESSAGE_SUCCESS		= 0;
	var MESSAGE_INFO		= 1;
	var MESSAGE_WARNING	= 2;
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
	var jqBtnSave = $("#ididPropertBtnSave");
	jqBtnSave.click(function(event) {
		showMsg("123")
	});
	return {
	};
};