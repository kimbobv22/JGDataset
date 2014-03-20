(function(window,$,JGDS){

	if(JGDS === undefined){
		console.error("can't not initialize JGDataset UI, JGDataset not found");
		return;
	}
	
	_JGKeyword = $.extend(true, window._JGKeyword, {
		ui : {
			attrDataset : "jg-dataset"
			,attrColumn : "jg-column"
			,attrBindDataset : "jg-bind-dataset"
			,attrDisplayColumn : "jg-display-column"
			,attrValueColumn : "jg-value-column"
			,keyFXPrefix : "##fx:"
			,trigger : {
				rowMapped : "datasetuirowmapped"
				,refreshed : "datasetuirefreshed"
				,FXRefreshed : "datasetuifxrefreshed"
				,columnRefreshed : "datasetuicolumnrefreshed"
				,mappingReloaded : "datasetuimappingreloaded"
			}
		},select : {
			trigger : {
				selectReloaded : "selectreloaded"
			}
		}
	})
	
	String.prototype._jgFuncConvertToColumnRegexp = (function(){
		return new RegExp("\\#\\#(" + this + ")\\#\\#", "gi");
	});
	String.prototype._jgFuncReplaceRegexpByDataset = (function(dataset_, rowIndex_){
		var targetStr_ = this;

		//replace with row index
		targetStr_ = targetStr_.replace("dataset\\.rowIndex"._jgFuncConvertToColumnRegexp(), rowIndex_);
		
		//replace with row status
		targetStr_ = targetStr_.replace("dataset\\.rowStatus"._jgFuncConvertToColumnRegexp(), dataset_.getRowStatus(rowIndex_));
		
		//replace with row count
		targetStr_ = targetStr_.replace("dataset\\.rowCount"._jgFuncConvertToColumnRegexp(), dataset_.getRowCount());
		
		//replace with column count
		targetStr_ = targetStr_.replace("dataset\\.columnCount"._jgFuncConvertToColumnRegexp(), dataset_.getRowCount());
		
		//replace with row stacked sum
		var sumRegexp_ = "dataset\\.sum\\([\\s\\w\\#\\@\\-\\+\\*\\/\\%]*\\)"._jgFuncConvertToColumnRegexp();
		if(sumRegexp_.test(targetStr_)){
			
			var columnCount_ = dataset_.getColumnCount();
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var columnItem_ = dataset_.getColumn(columnIndex_);
				var columnName_ = columnItem_.getName();
				var columnRegexp_ = columnName_._jgFuncConvertToColumnRegexp();
				
				if(columnRegexp_.test(targetStr_)){
					var columnValueSum_ = 0;
					for(var tRowIndex_ = 0; tRowIndex_<=rowIndex_;++tRowIndex_){
						var columnValue_ = parseInt(dataset_.getColumnValue(columnName_,tRowIndex_));
						columnValueSum_ += columnValue_;
					}
					targetStr_ = targetStr_.replace(columnRegexp_, columnValueSum_);
				}
			}
			
			targetStr_ = targetStr_.replace("dataset\\.sum"._jgFuncConvertToColumnRegexp(), dataset_.getRowCount());
			targetStr_ = targetStr_.substr(targetStr_.indexOf("(")+1);
			targetStr_ = targetStr_.substr(0,targetStr_.indexOf(")##"));
		}
		
		//replace column data
		var columnCount_ = dataset_.getColumnCount();
		for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			var columnItem_ = dataset_.getColumn(columnIndex_);
			var columnName_ = columnItem_.getName();
			var columnValue_= dataset_.getColumnValue(columnName_,rowIndex_);
			targetStr_ = targetStr_.replace(columnName_._jgFuncConvertToColumnRegexp(), Object.NVL(columnValue_, "null"));
		}
		
		return targetStr_;
	});
	
	$.fn.insertAtIndex = (function(element_,index_){
		var lastIndex_ = this.children().size();
		if(index_ < 0){
			index_ = Math.max(0, lastIndex_ + 1 + index_);
		}
		this.append(element_);
		if(index_<lastIndex_){
			this.children().eq(index_).before(this.children().last());
		}
		return this;
	});
	
	$.fn.selectValue = (function(){
		if(this.prop("tagName").toLowerCase() !== "select") return undefined;
		return this.children("option:selected").first().attr("value");
	});
	
	JGDataset.prototype.datasetUIView = (function(){
		return $(document).find("["+_JGKeyword.ui.attrDataset+"='"+this.getName()+"']").filter(function(){
			return $(this)._jgDatasetUIInitialized();
		}); 
	});
	
	var _JGDatasetUI = window.JGDatasetUI = (function(element_){
		var that_ = this;
		this._element = element_;
		this._datasetName = element_.attr(_JGKeyword.ui.attrDataset);
		
		if(Object.isNull(this.dataset())){
			console.error("can't find JGDataset");
			return;
		}
		
		this._originalRowContent = this._element.children().first().clone(true);
		this._element.empty();
		this._rowContents = new Array();
		var dataset_ = this.dataset();
		
		// row inserted
		$(dataset_).on(_JGKeyword.trigger._rowInserted,function(event_, rowIndex_){
			that_._insertRowContent(rowIndex_);
		});
		
		// row removed
		$(dataset_).on(_JGKeyword.trigger._rowRemoved,function(event_, rowIndex_){
			that_._removeRowContent(rowIndex_);
		});
		
		// row moved
		$(dataset_).on(_JGKeyword.trigger._rowMoved,function(event_, rowIndex_, oldRowIndex_){
			if(oldRowIndex_ > rowIndex_){
				that_._refresh(rowIndex_,oldRowIndex_); 
			}else that_._refresh(oldRowIndex_, rowIndex_);
			
		});
		
		// column added,removed
		$(dataset_).on(_JGKeyword.trigger._columnAdded+" "
				+_JGKeyword.trigger._columnRemoved,function(event_, columnName_){
			that_._refreshColumn(columnName_, undefined, undefined, false);
			that_._refreshFX();
		});
		
		// column value changed
		$(dataset_).on(_JGKeyword.trigger._columnValueChanged,function(event_, columnName_, rowIndex_){
			that_._refreshColumn(columnName_, rowIndex_, undefined, false);
			that_._refreshFX();
		});
		
		// dataset clear,reset,changed,sorted
		$(dataset_).on(_JGKeyword.trigger._datasetClear+" "
				+_JGKeyword.trigger._datasetReset+" "
				+_JGKeyword.trigger._datasetChanged+" "
				+_JGKeyword.trigger._datasetSorted,function(event_, rowIndex_, oldRowIndex_){
			that_.reload();
		});
		
		// dataset changed
		$(dataset_).on(_JGKeyword.trigger._datasetApply,function(event_){
			that_._refreshFX();
		});
		
		this.reload();
	});
	
	_JGDatasetUI.prototype.element = (function(){
		return this._element;
	});
	_JGDatasetUI.prototype.dataset = (function(){
		return JGDS("dataset",this._datasetName);
	});
	_JGDatasetUI.prototype.rowContent = (function(rowIndex_){
		return this._rowContents[rowIndex_];
	});
	
	_JGDatasetUI.prototype._insertRowContent = (function(rowIndex_){
		var rowContent_ = new JGRowContent(this,this._originalRowContent);
		this._rowContents.insert(rowContent_, rowIndex_);
		this.element().insertAtIndex(rowContent_.rowContent(), rowIndex_);
		this._refresh(rowIndex_, undefined, false);
		this.element().trigger(_JGKeyword.ui.trigger.rowMapped,[rowIndex_]);
		return rowContent_;
	});
	_JGDatasetUI.prototype._removeRowContent = (function(rowIndex_){
		var rowContent_ = this.rowContent(rowIndex_);
		rowContent_.rowContent().remove();
		this._rowContents.remove(rowIndex_);
		this._refreshFX(rowIndex_);
	});
	_JGDatasetUI.prototype.indexOf = (function(rowContent_){
		return this._rowContents.indexOf(rowContent_);
	});
	
	_JGDatasetUI.prototype.__rowRangeRefresh = (function(fromRowIndex_, toRowIndex_, refreshFunc_){
		var rowCount_ = this.dataset().getRowCount();
		if(Object.isNull(fromRowIndex_)){
			fromRowIndex_ = Object.NVL(fromRowIndex_,0);
			toRowIndex_ = Object.NVL(toRowIndex_,rowCount_-1);
		}else{
			toRowIndex_ = Object.NVL(toRowIndex_,fromRowIndex_);
		}
		
		for(var rowIndex_=fromRowIndex_;rowIndex_<=toRowIndex_;++rowIndex_){
			refreshFunc_(this, rowIndex_);
		}
	});
	_JGDatasetUI.prototype._refreshFX = (function(fromRowIndex_, toRowIndex_, fireEvent_){
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refreshFX();
			if(Object.NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.FXRefreshed,[rowIndex_]);
		});
	});
	_JGDatasetUI.prototype._refreshColumn = (function(columnName_, fromRowIndex_, toRowIndex_, refreshFx_, fireEvent_){
		refreshFx_ = Object.NVL(refreshFx_,true);
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refreshColumn(columnName_, refreshFx_);
			if(Object.NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.columnRefreshed,[columnName_, rowIndex_]);
		});
	});
	_JGDatasetUI.prototype._refresh = (function(fromRowIndex_, toRowIndex_, fireEvent_){
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refresh();
			if(Object.NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.refreshed,[rowIndex_]);
		});
	});
	
	_JGDatasetUI.prototype.reload = (function(){
		this.element().empty();
		this._rowContents = new Array();
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		
		var tempIndex_ = 0;
		while(tempIndex_ < rowCount_){
			this._insertRowContent(this._rowContents.length);
			++tempIndex_;
		}
		$(this.element()).trigger(_JGKeyword.ui.trigger.mappingReloaded);
	});
	
	$.fn._jgDatasetUI = (function(ui_){
		if(ui_ !== undefined) this.data("jgdataset_jgDatasetUI",ui_);
		return this.data("jgdataset_jgDatasetUI");
	});
	$.fn._jgDatasetUIInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdataset_jgDatasetInitialized",bool_);
		return Object.NVL(this.data("jgdataset_jgDatasetInitialized"),false);
	});
	$.fn.JGDatasetUI = (function(){
		if(!this._jgDatasetUIInitialized()){
			this._jgDatasetUI(new JGDatasetUI(this));
			this._jgDatasetUIInitialized(true);
		}
		
		return JGSelector(this._jgDatasetUI(), arguments);
	});
	
	$.fn._jgDataRowContent = (function(rowContent_){
		if(rowContent_ === undefined) return this.data("jgdataset_rowContent");
		this.data("jgdataset_rowContent",rowContent_);
		return this.data("jgdataset_rowContent");
	});
	$.fn._jgDataJGDataset = (function(){
		return this._jgDataRowContent().datasetUI().dataset();
	});
	
	var _JGRowContent = window.JGRowContent = (function(datasetUI_, rowContent_){
		this._datasetUI = datasetUI_;
		this._rowContent = rowContent_.clone(true,true);
		this._mappedElements = new Array();
		this._FXElements = new Array();
		
		var mappedElements_ = this._rowContent.find("*["+_JGKeyword.ui.attrColumn+"]");
		var mappedElementsLength_ = mappedElements_.length;
		for(var mapIndex_=0;mapIndex_<mappedElementsLength_;++mapIndex_){
			var mappedElement_ = $(mappedElements_[mapIndex_]);
			var tagName_ = mappedElement_.prop("tagName").toLowerCase();
			mappedElement_._jgDataRowContent(this);
			this._mappedElements.push(mappedElement_);
			
			var commonEventOnChange_ = (function(event_){
				var target_ = $(event_.target);
				var rowContent_ = target_._jgDataRowContent();
				var dataset_ = rowContent_.datasetUI().dataset();
				var columnName_ = target_.attr(_JGKeyword.ui.attrColumn);
				var rowIndex_ = rowContent_.rowIndex();
				
				dataset_.setColumnValue(columnName_, rowIndex_, target_.val(), true);
			});
			
			//input event
			if(tagName_ === "input"){
				var inputType_ = Object.NVL(mappedElement_.attr("type"), "text");
				if(inputType_ === "checkbox"){
					mappedElement_.on("click change",function(event_){
						var target_ = $(event_.target);
						var rowContent_ = target_._jgDataRowContent();
						var dataset_ = rowContent_.datasetUI().dataset();
						var columnName_ = target_.attr(_JGKeyword.ui.attrColumn);
						var rowIndex_ = rowContent_.rowIndex();
						
						dataset_.setColumnValue(columnName_, rowIndex_, target_.prop("checked"), true);
					});
				}else{
					mappedElement_.on("keyup change",commonEventOnChange_);
				}
			}
			//contenteditable div
			else if(tagName_ === "div" && mappedElement_.prop("contenteditable")){
				mappedElement_.on("change", function(event_){
					var target_ = $(event_.target);
					var rowContent_ = target_._jgDataRowContent();
					var dataset_ = rowContent_.datasetUI().dataset();
					var columnName_ = target_.attr(_JGKeyword.ui.attrColumn);
					var rowIndex_ = rowContent_.rowIndex();
					
					dataset_.setColumnValue(columnName_, rowIndex_, target_.html(), true);
				});
				mappedElement_.on("keyup", function(event_){
					var target_ = $(event_.target);
					target_.trigger("change");
				});
			}
			//select event
			else if(tagName_ === "select"){
				if(!Object.isNull(mappedElement_.attr(_JGKeyword.ui.attrBindDataset))){
					mappedElement_.JGSelect();
				}
				
				mappedElement_.on("change",function(event_){
					var target_ = $(event_.target);
					var rowContent_ = target_._jgDataRowContent();
					var dataset_ = rowContent_.datasetUI().dataset();
					var columnName_ = target_.attr(_JGKeyword.ui.attrColumn);
					var rowIndex_ = rowContent_.rowIndex();
					
					dataset_.setColumnValue(columnName_, rowIndex_, target_.selectValue(), true);
				});
				
				$(mappedElement_).on(_JGKeyword.select.trigger.selectReloaded,function(event_){
					var target_ = $(event_.target);
					var rowContent_ = target_._jgDataRowContent();
					var dataset_ = rowContent_.datasetUI().dataset();
					var columnName_ = target_.attr(_JGKeyword.ui.attrColumn);
					var rowIndex_ = rowContent_.rowIndex();
					
					target_.val(dataset_.getColumnValue(columnName_, rowIndex_));
				});
			}
			//label,etc event
			else{
				/*do nothing*/
			}
		}
		
		var fxElements_ = this._rowContent.find("*");
		fxElements_.push(this._rowContent);
		var fxElementsLength_ = fxElements_.length;
		for(var fxIndex_=0;fxIndex_<fxElementsLength_;++fxIndex_){
			var fxElement_ = $(fxElements_[fxIndex_]);
			var attrs_ = fxElement_[0].attributes;
			var attrCount_ = attrs_.length;
			
			for(var attrIndex_ =0; attrIndex_<attrCount_;++attrIndex_){
				var attr_ = attrs_[attrIndex_];
				var attrName_ = attr_.name.toLowerCase();
				if(attr_.name.toLowerCase() !== "jg-column"
					&& Object.NVL(attr_.value,"").indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
					this._FXElements.push(new JGFXElement(this,fxElement_,attrName_,0))
				}
			}
			
			var textValue_ = fxElement_.html();
			if(Object.NVL(textValue_,"").indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
				this._FXElements.push(new JGFXElement(this,fxElement_,null,1))
			}
		}
	});
	
	_JGRowContent.prototype.datasetUI = (function(){
		return this._datasetUI;
	});
	_JGRowContent.prototype.rowIndex = (function(){
		return this.datasetUI().indexOf(this);
	});
	_JGRowContent.prototype.rowContent = (function(){
		return this._rowContent;
	});
	_JGRowContent.prototype.mappedElements = (function(){
		return this._mappedElements;
	});
	_JGRowContent.prototype.FXElements = (function(){
		return this._FXElements;
	});
	
	_JGRowContent.prototype._refreshFX = (function(){
		var fxElements_ = this.FXElements();
		var fxElementsLength_ = fxElements_.length;
		for(var fxIndex_=0;fxIndex_<fxElementsLength_;++fxIndex_){
			fxElements_[fxIndex_].update();
		}
	});
	_JGRowContent.prototype._refreshColumn = (function(columnName_, refreshFX_){
		columnName_ = columnName_.toUpperCase();
		refreshFX_ = Object.NVL(refreshFX_,true);
		var columnValue_ = this.datasetUI().dataset().getColumnValue(columnName_, this.rowIndex());
		var mappedElements_ = this.mappedElements();
		var eCount_ = mappedElements_.length;
		for(eIndex_=0;eIndex_<eCount_;++eIndex_){
			var mappedElement_ = $(mappedElements_[eIndex_]);
			if(mappedElement_.attr("jg-column").toUpperCase() === columnName_){
				var tagName_ = mappedElement_.prop("tagName").toLowerCase();
				
				//input type - checkbox
				if(tagName_ === "input" && mappedElement_.attr("type") === "checkbox"){
					columnValue_ = (columnValue_ === true || columnValue_ === "true");
					if(mappedElement_.prop("checked") !== columnValue_) 
						mappedElement_.prop("checked", columnValue_);
				}
				//input type - exclude checkbox
				else if(tagName_ === "input"){
					if(mappedElement_.val() !== columnValue_){
						mappedElement_.val(columnValue_);
					}
				}
				//select
				else if(tagName_ === "select"){
					if(mappedElement_.val() !== columnValue_){
						mappedElement_.val(columnValue_);
					}
				}
				//label or others
				else{
					columnValue_ = Object.NVL(columnValue_, "");
					if(mappedElement_.html() !== columnValue_)
						mappedElement_.html(columnValue_);
				}
			}
		}
		if(refreshFX_) this._refreshFX();
	});
	_JGRowContent.prototype._refresh = (function(){
		var dataset_ = this.datasetUI().dataset();
		var colCount_ = dataset_.getColumnCount();
		for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
			this._refreshColumn(dataset_.getColumn(colIndex_).getName(), false);
		}
		
		this._refreshFX();
	});
	
	var _JGFXElement = window.JGFXElement = (function(rowContent_, element_, attrName_, type_){
		this._rowContent = rowContent_;
		this._element = element_;
		this._attrName = attrName_;
		this._type = type_;
		
		switch(type_){
		case 0: //attribute
			this._fx = element_.attr(attrName_).substr(_JGKeyword.ui.keyFXPrefix.length);
			break;
		case 1: //node text
			this._fx = element_.html().substr(_JGKeyword.ui.keyFXPrefix.length);
			break;
		default:
			console.error("invaild FX Element Type");
			break;
		}
	});
	
	_JGFXElement.prototype.rowContent = (function(){
		return this._rowContent;
	});
	_JGFXElement.prototype.element = (function(){
		return this._element;
	});
	_JGFXElement.prototype.attrName = (function(){
		return this._attrName;
	});
	_JGFXElement.prototype.type = (function(){
		return this._type;
	});
	_JGFXElement.prototype.update = (function(){
		var rowContent_ = this.rowContent();
		var dataset_ = rowContent_.datasetUI().dataset();
		var rowIndex_ = rowContent_.rowIndex();
		
		var resultStr_ = null;
		try{
			resultStr_ = Object.NVL(new Function("return "+this._fx._jgFuncReplaceRegexpByDataset(dataset_,rowIndex_)+";").apply(dataset_),"");
		}catch(ex_){
			resultStr_ = "##fx Exception: "+ex_.toString()+", statement: "+this._fx+"##";
		}
		
		switch(this.type()){
		case 0: //attribute
			this.element().attr(this.attrName(),resultStr_);
			break;
		case 1: //node text
			this.element().html(resultStr_);
			break;
		default:
			console.error("invaild FX Element Type");
			break;
		}
	});
	
	var _JGSelect = window.JGSelect = (function(element_){
		var that_ = this;
		this._element = element_;
		this._datasetName = element_.attr(_JGKeyword.ui.attrBindDataset);
		this._displayColumn = element_.attr(_JGKeyword.ui.attrDisplayColumn);
		this._valueColumn = element_.attr(_JGKeyword.ui.attrValueColumn);
		var dataset_ = this.dataset();
		
		// dataset data event
		$(dataset_).on(_JGKeyword.trigger._rowInserted+" "
				+_JGKeyword.trigger._rowRemoved+" "
				+_JGKeyword.trigger._rowMoved+" "
				+_JGKeyword.trigger._columnAdded+" "
				+_JGKeyword.trigger._columnRemoved+" "
				+_JGKeyword.trigger._columnValueChanged+" "
				+_JGKeyword.trigger._datasetClear+" "
				+_JGKeyword.trigger._datasetReset+" "
				+_JGKeyword.trigger._datasetChanged+" "
				+_JGKeyword.trigger._datasetSorted, function(event_, rowIndex_){
			that_.reload();
		});
		
		this.reload();
	});
	
	_JGSelect.prototype.element = (function(){
		return this._element;
	});
	_JGSelect.prototype.dataset = (function(){
		return JGDS("dataset",this._datasetName);
	});
	_JGSelect.prototype.displayColumn = (function(){
		return this._displayColumn;
	});
	_JGSelect.prototype.valueColumn = (function(){
		return this._valueColumn;
	});
	_JGSelect.prototype.reload = (function(){
		var element_ = this.element();
		element_.empty();
		function createOptionElement_(display_,value_){
			return $("<option value='"+value_+"'>"+display_+"</option>");
		};
		
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			element_.append(createOptionElement_(
				dataset_.getColumnValue(this.displayColumn(),rowIndex_)
				,dataset_.getColumnValue(this.valueColumn(),rowIndex_)
			));
		}
		element_.trigger(_JGKeyword.select.trigger.selectReloaded);
	});
	
	$.fn._jgSelect = (function(select_){
		if(select_ !== undefined) this.data("jgdataset_jgSelect",select_);
		return this.data("jgdataset_jgSelect");
	});
	$.fn._jgSelectInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdataset_jgSelectInitialized",bool_);
		return Object.NVL(this.data("jgdataset_jgSelectInitialized"),false);
	});
	$.fn.JGSelect = (function(){
		if(!this._jgSelectInitialized()){
			this._jgSelect(new JGSelect(this));
			this._jgSelectInitialized(true);
		}
		
		return JGSelector(this._jgSelect(), arguments);
	});
	
})(window,jQuery,JGDS);