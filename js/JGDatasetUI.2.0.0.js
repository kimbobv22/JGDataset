(function(window,$,JGDS){

	if(JGDS === undefined){
		console.error("can't not initialize JGDataset UI, JGDataset not found");
		return;
	}
	
	var _J
	_JGKeyword = $.extend(true, window._JGKeyword, {
		ui : {
			attrDataset : "jg-dataset"
			,attrColumn : "jg-column"
			,attrBindDataset : "jg-bind-dataset"
			,attrDisplayColumn : "jg-display-column"
			,attrValueColumn : "jg-value-column"
			,keyFXPrefix : "##fx:"
			,trigger : {
				/**
				 * 특정 행과 매핑 시 발생합니다.
				 * 
				 * @event datasetuirowmapped
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @param {Number} rowIndex_ 행색인
				 * @for jQuery.fn.JGDatasetUI
				 * @example
				 * 	$(target_).trigger("datasetuirowmapped",function(event_, rowIndex_){
				 * 		//to do
				 * 	});
				 */
				rowMapped : "datasetuirowmapped"
				/**
				 * 특정 행의 매핑이 새로 고쳐졌을 때 발생합니다.
				 * 
				 * @event datasetuirefreshed
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @param {Number} rowIndex_ 행색인
				 * @for jQuery.fn.JGDatasetUI
				 * @example
				 * 	$(target_).trigger("datasetuirefreshed",function(event_, rowIndex_){
				 * 		//to do
				 * 	});
				 */
				,refreshed : "datasetuirefreshed"
				/**
				 * 매핑된 특정 행의 FX수식이 새로 고쳐졌을 때 발생합니다.
				 * 
				 * @event datasetuifxrefreshed
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @param {Number} rowIndex_ 행색인
				 * @for jQuery.fn.JGDatasetUI
				 * @example
				 * 	$(target_).trigger("datasetuifxrefreshed",function(event_, rowIndex_){
				 * 		//to do
				 * 	});
				 */
				,FXRefreshed : "datasetuifxrefreshed"
				/**
				 * 특정 행열의 매핑이 새로 고쳐졌을 때 호출됩니다.
				 * 
				 * @event datasetuicolumnrefreshed
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @param {String} columnName_ 열명
				 * @param {Number} rowIndex_ 행색인
				 * @for jQuery.fn.JGDatasetUI
				 * @example
				 * 	$(target_).trigger("datasetuicolumnrefreshed",function(event_, columnName_, rowIndex_){
				 * 		//to do
				 * 	});
				 */
				,columnRefreshed : "datasetuicolumnrefreshed"
				/**
				 * 매핑이 재적재되었을 때 발생합니다.
				 * 
				 * @event datasetuimappingreloaded
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @for jQuery.fn.JGDatasetUI
				 * @example
				 * 	$(target_).trigger("datasetuimappingreloaded",function(event_){
				 * 		//to do
				 * 	});
				 */
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
			targetStr_ = targetStr_.replace(columnName_._jgFuncConvertToColumnRegexp(), NVL(columnValue_, "null"));
		}
		
		return targetStr_;
	});
	
	/**
	 * jQuery 기능확장함수입니다.
	 * @class jQuery.fn.extension
	 */
	/**
	 * 특정색인에 jQuery Element를 삽입합니다.
	 * 
	 * @method insertAtIndex
	 * @param {jQuery Object} element_ 삽입대상객체
	 * @param {Number} index_ 색인
	 * @return {jQuery Object} 삽입대상
	 * @example
	 * 	$(target_).insertAtIndex("<div>test</div>",3);
	 */
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
	/**
	 * select 태그의 값을 반환합니다.
	 * 
	 * @method selectValue
	 * @return {String} 값
	 * @example
	 * 	var result_ = $("<select><option value='testValue'>test</option></select").selectValue();
	 */
	$.fn.selectValue = (function(){
		if(this.prop("tagName").toLowerCase() !== "select") return undefined;
		return this.children("option:selected").first().attr("value");
	});
	
	/**
	 * JGDatasetUI의 확장함수입니다.<br>
	 * 데이타셋에 매핑되어 있는 모든 View를 반환합니다.
	 * 
	 * @method datasetUIView
	 * @return {Array} 배열
	 * @for JGDataset
	 */
	JGDataset.prototype.datasetUIView = (function(){
		return $(document).find("["+_JGKeyword.ui.attrDataset+"='"+this.getName()+"']").filter(function(){
			return $(this)._jgDatasetUIInitialized();
		}); 
	});
	/**
	 * HTML과 JGDataset의 매핑을 위한 플러그인입니다.<br>
	 * 함수호출 형식은 아래와 같습니다.
	 * 	
	 * 	//1. jQuery Plugin Style
	 * 	var result_ = $(target_).JGDatasetUI("함수명",...);
	 * 	
	 * 	//2. normal Style
	 * 	var datasetUI_ = $(target_).JGDatasetUI();
	 * 	var result_ = datasetUI_.함수명();
	 * 
	 * JGDatasetUI 샘플은 <a href="http://kimbobv22.github.io/JGDataset/index.html" target="_blank">여기</a>에서 확인할 수 있습니다.
	 * 
	 * @class jQuery.fn.JGDatasetUI
	 * @constructor
	 * @example
	 * 	//1. 정의되어 있는 속성값을 이용하여 초기화
	 * 	<div jg-dataset="datasetName" id="target">
	 * 		...
	 * 	</div>
	 * 	<script type="text/javascript">
	 * 	$("#target").JGDatasetUI();
	 * 	</script>
	 * 	
	 * 	//2. 매개변수를 이용하여 초기화
	 * 	<div id="target">
	 * 		...
	 * 	</div>
	 * 	<script type="text/javascript">
	 * 	$("#target").JGDatasetUI("datasetName");
	 * 	</script>
	 */
	var JGDatasetUI = window.JGDatasetUI = (function(element_, datasetName_){
		var that_ = this;
		this._element = element_;
		this._datasetName = NVL(datasetName_,element_.attr(_JGKeyword.ui.attrDataset));
		
		if(isNull(this.dataset())){
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
		$(dataset_).on(_JGKeyword.trigger._rowMoved,function(event_, fromRowIndex_, toRowIndex_){
			if(fromRowIndex_ > toRowIndex_){
				that_._refresh(toRowIndex_,fromRowIndex_); 
			}else that_._refresh(fromRowIndex_,toRowIndex_);
			
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
	
	/**
	 * 매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @return {jQuery Object} jQuery 객체
	 * @example
	 * 	var element_ = $(target_).JGDatasetUI("element");
	 */
	JGDatasetUI.prototype.element = (function(){
		return this._element;
	});
	/**
	 * 매핑되어 있는 데이타셋을 반환합니다.
	 * 
	 * @return {JGDataset} 데이타셋
	 * @example
	 * 	var element_ = $(target_).JGDatasetUI("dataset");
	 */
	JGDatasetUI.prototype.dataset = (function(){
		return JGDS("dataset",this._datasetName);
	});
	
	/**
	 * 특정 행색인에 매핑되어 있는 행컨텐츠를 반환합니다.
	 * 
	 * @param {Number} rowIndex_ 행색인
	 * @return {JGRowContent} 행컨텐츠
	 * @example
	 * 	var element_ = $(target_).JGDatasetUI("rowContent",rowIndex_);
	 */
	JGDatasetUI.prototype.rowContent = (function(rowIndex_){
		return this._rowContents[rowIndex_];
	});
	
	JGDatasetUI.prototype._insertRowContent = (function(rowIndex_){
		var rowContent_ = new JGRowContent(this,this._originalRowContent);
		this._rowContents.insert(rowContent_, rowIndex_);
		this.element().insertAtIndex(rowContent_.rowContent(), rowIndex_);
		this._refresh(rowIndex_, undefined, false);
		this.element().trigger(_JGKeyword.ui.trigger.rowMapped,[rowIndex_]);
		return rowContent_;
	});
	JGDatasetUI.prototype._removeRowContent = (function(rowIndex_){
		var rowContent_ = this.rowContent(rowIndex_);
		rowContent_.rowContent().remove();
		this._rowContents.remove(rowIndex_);
		this._refreshFX(rowIndex_);
	});
	/**
	 * 매핑되어 있는 행컨텐츠의 행색인을 반환합니다.
	 * 
	 * @param {JGRowContent} rowIndex_ 행컨텐츠
	 * @return {Number} 행색인
	 * @example
	 * 	var element_ = $(target_).JGDatasetUI("indexOf",rowContent_);
	 */
	JGDatasetUI.prototype.indexOf = (function(rowContent_){
		return this._rowContents.indexOf(rowContent_);
	});
	
	JGDatasetUI.prototype.__rowRangeRefresh = (function(fromRowIndex_, toRowIndex_, refreshFunc_){
		var rowCount_ = this.dataset().getRowCount();
		if(isNull(fromRowIndex_)){
			fromRowIndex_ = NVL(fromRowIndex_,0);
			toRowIndex_ = NVL(toRowIndex_,rowCount_-1);
		}else{
			toRowIndex_ = NVL(toRowIndex_,fromRowIndex_);
		}
		
		for(var rowIndex_=fromRowIndex_;rowIndex_<=toRowIndex_;++rowIndex_){
			refreshFunc_(this, rowIndex_);
		}
	});
	JGDatasetUI.prototype._refreshFX = (function(fromRowIndex_, toRowIndex_, fireEvent_){
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refreshFX();
			if(NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.FXRefreshed,[rowIndex_]);
		});
	});
	JGDatasetUI.prototype._refreshColumn = (function(columnName_, fromRowIndex_, toRowIndex_, refreshFx_, fireEvent_){
		refreshFx_ = NVL(refreshFx_,true);
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refreshColumn(columnName_, refreshFx_);
			if(NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.columnRefreshed,[columnName_, rowIndex_]);
		});
	});
	JGDatasetUI.prototype._refresh = (function(fromRowIndex_, toRowIndex_, fireEvent_){
		this.__rowRangeRefresh(fromRowIndex_, toRowIndex_,function(that_, rowIndex_){
			that_.rowContent(rowIndex_)._refresh();
			if(NVL(fireEvent_,true)) $(that_.element()).trigger(_JGKeyword.ui.trigger.refreshed,[rowIndex_]);
		});
	});
	
	/**
	 * 매핑 재적재를 수행합니다.
	 * 
	 * @example
	 * 	var element_ = $(target_).JGDatasetUI("reload");
	 */
	JGDatasetUI.prototype.reload = (function(){
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
		if(ui_ !== undefined) this.data("jgdatasetJGDatasetUI",ui_);
		return this.data("jgdatasetJGDatasetUI");
	});
	$.fn._jgDatasetUIInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdataset_jgDatasetInitialized",bool_);
		return NVL(this.data("jgdataset_jgDatasetInitialized"),false);
	});
	$.fn.JGDatasetUI = (function(){
		if(!this._jgDatasetUIInitialized()){
			this._jgDatasetUI(new JGDatasetUI(this, arguments[0]));
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
	/**
	 * JGDatasetUI 매핑 시 각 행에 대한 매핑정보를 적재하고 있습니다.<br>
	 * 사용자가 임의로 생성할 수 없으며 매핑 시 자동으로 생성됩니다.<br>
	 * *참고 : {{#crossLink "jQuery.fn.JGDatasetUI"}}{{/crossLink}}
	 * 
	 * @class JGRowContent
	 * @constructor
	 * @param {jQuery Object} datasetUI_ JGDatasetUI가 매핑된 jQuery Object
	 * @param {jQuery Object} rowContent_ 원본 행컨텐츠
	 */
	var JGRowContent = (function(datasetUI_, rowContent_){
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
				var inputType_ = NVL(mappedElement_.attr("type"), "text");
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
				if(!isNull(mappedElement_.attr(_JGKeyword.ui.attrBindDataset))){
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
					&& BLK(attr_.value).indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
					this._FXElements.push(new JGFXElement(this,fxElement_,attrName_,0))
				}
			}
			
			var textValue_ = fxElement_.html();
			if(BLK(textValue_).indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
				this._FXElements.push(new JGFXElement(this,fxElement_,null,1))
			}
		}
	});
	
	/**
	 * 매핑되어 있는 JGDatasetUI를 반환합니다.
	 * 
	 * @method datasetUI
	 * @return {JGDatasetUI} 매핑된 JGDatasetUI
	 */
	JGRowContent.prototype.datasetUI = (function(){
		return this._datasetUI;
	});
	/**
	 * 현재 행컨텐츠의 색인을 반환합니다.
	 * 
	 * @method rowIndex
	 * @return {Number} 색인
	 */
	JGRowContent.prototype.rowIndex = (function(){
		return this.datasetUI().indexOf(this);
	});
	/**
	 * 원본 행컨텐츠를 반환합니다.
	 * 
	 * @method rowContent
	 * @return {jQuery Object} jQuery 객체
	 */
	JGRowContent.prototype.rowContent = (function(){
		return this._rowContent;
	});
	/**
	 * 열매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @method mappedElements
	 * @return {Array} 열매핑되어 있는 jQuery 객체
	 */
	JGRowContent.prototype.mappedElements = (function(){
		return this._mappedElements;
	});
	/**
	 * FX수식매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @method FXElements
	 * @return {Array} FX수식매핑되어 있는 jQuery 객체
	 */
	JGRowContent.prototype.FXElements = (function(){
		return this._FXElements;
	});
	
	JGRowContent.prototype._refreshFX = (function(){
		var fxElements_ = this.FXElements();
		var fxElementsLength_ = fxElements_.length;
		for(var fxIndex_=0;fxIndex_<fxElementsLength_;++fxIndex_){
			fxElements_[fxIndex_].update();
		}
	});
	JGRowContent.prototype._refreshColumn = (function(columnName_, refreshFX_){
		columnName_ = columnName_.toUpperCase();
		refreshFX_ = NVL(refreshFX_,true);
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
					columnValue_ = BLK(columnValue_);
					if(mappedElement_.html() !== columnValue_)
						mappedElement_.html(columnValue_);
				}
			}
		}
		if(refreshFX_) this._refreshFX();
	});
	JGRowContent.prototype._refresh = (function(){
		var dataset_ = this.datasetUI().dataset();
		var colCount_ = dataset_.getColumnCount();
		for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
			this._refreshColumn(dataset_.getColumn(colIndex_).getName(), false);
		}
		
		this._refreshFX();
	});
	
	/**
	 * JGDatasetUI에서 FX수식을 위한 객체입니다.<br>
	 * 사용자가 임의로 생성할 수 없으며, JGDatasetUI 매핑 시 생성될 수 있습니다.<br>
	 * *참고 : {{#crossLink "jQuery.fn.JGDatasetUI"}}{{/crossLink}}
	 * 
	 * @class JGFXElement
	 * @constructor
	 * @param {JGRowContent} rowContent_ 행컨텐츠
	 * @param {jQuery Object} element_ JGDatasetUI가 매핑되어 있는 jQuery 객체
	 * @param {String} [attrName_] FX수식을 매핑할 속성명(Text 매핑 시 생략가능)
	 * @param {Number} type_ FX수식 매핑 유형(0 - 속성, 1 - Text)
	 */
	var JGFXElement = (function(rowContent_, element_, attrName_, type_){
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
	
	/**
	 * 매핑되어 있는 행컨텐츠를 반환합니다.
	 * 
	 * @method rowContent
	 * @return {JGRowContent} 행컨텐츠
	 */
	JGFXElement.prototype.rowContent = (function(){
		return this._rowContent;
	});
	/**
	 * 매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @method element
	 * @return {jQuery Object} jQuery 객체
	 */
	JGFXElement.prototype.element = (function(){
		return this._element;
	});
	/**
	 * 매핑되어 있는 속성명을 반환합니다.
	 * 
	 * @method attrName
	 * @return {String} 속성명
	 */
	JGFXElement.prototype.attrName = (function(){
		return this._attrName;
	});
	/**
	 * 매핑유형을 반환합니다.
	 * 
	 * @method type
	 * @return {Number} 매핑유형
	 */
	JGFXElement.prototype.type = (function(){
		return this._type;
	});
	/**
	 * FX매핑을 새로고침을 수행합니다.
	 * 
	 * @method update
	 */
	JGFXElement.prototype.update = (function(){
		var rowContent_ = this.rowContent();
		var dataset_ = rowContent_.datasetUI().dataset();
		var rowIndex_ = rowContent_.rowIndex();
		
		var resultStr_ = null;
		try{
			resultStr_ = BLK(new Function("return "+this._fx._jgFuncReplaceRegexpByDataset(dataset_,rowIndex_)+";").apply(dataset_));
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
	
	/**
	 * select 태그와 매핑을 위한 객체입니다.<br>
	 * 함수호출 형식은 아래와 같습니다.
	 * 	
	 * 	//1. jQuery Plugin Style
	 * 	var result_ = $(target_).JGSelect("함수명",...);
	 * 	
	 * 	//2. normal Style
	 * 	var select_ = $(target_).JGSelect();
	 * 	var result_ = select_.함수명();
	 * 	
	 * @class jQuery.fn.JGSelect
	 * @param {jQuery Object} element_ 매핑할 jQuery 객체
	 * @constructor
	 * @example
	 * 	//1. 미리 정의된 속성값을 이용하여 초기화
	 * 	<select jg-bind-dataset="datasetName"
	 * 			jg-display-column="nm"
	 * 			jg-value-column="id"></select>
	 * 	<script type="text/javascript">
	 * 	$(target_).JGSelect();
	 * 	</script>
	 * 	
	 * 	//2. 매개변수를 이용하여 초기화
	 * 	<select></select>
	 * 	<script type="text/javascript">
	 * 	$(target_).JGSelect({datasetName : "datasetName"
	 * 						,displayColumn : "nm"
	 * 						,valueColumn : "id"});
	 * 	</script>
	 */
	var JGSelect = (function(element_, options_){
		var that_ = this;
		options_ = $.extend({
				datasetName : element_.attr(_JGKeyword.ui.attrBindDataset)
				,displayColumn : element_.attr(_JGKeyword.ui.attrDisplayColumn)
				,valueColumn : element_.attr(_JGKeyword.ui.attrValueColumn)
			},options_);
		this._element = element_;
		this._datasetName = options_.datasetName;
		this._displayColumn = options_.displayColumn;
		this._valueColumn = options_.valueColumn;
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
	
	/**
	 * JGSelect에 매핑되어 있는 jQuery Object를 반환합니다.
	 * 
	 * @method element
	 * @return {jQuery Object} jQuery 객체
	 * @example
	 * 	var result_ = $(target_).JGSelect("element");
	 */
	JGSelect.prototype.element = (function(){
		return this._element;
	});
	/**
	 * JGSelect에 매핑되어 있는 JGDataset을 반환합니다.
	 * 
	 * @method dataset
	 * @return {JGDataset} 데이타셋
	 * @example
	 * 	var result_ = $(target_).JGSelect("dataset");
	 */
	JGSelect.prototype.dataset = (function(){
		return JGDS("dataset",this._datasetName);
	});
	/**
	 * JGSelect에 매핑되어 있는 전시열명을 반환합니다.
	 * 
	 * @method displayColumn
	 * @return {String} 전시열명
	 * @example
	 * 	var result_ = $(target_).JGSelect("displayColumn");
	 */
	JGSelect.prototype.displayColumn = (function(){
		return this._displayColumn;
	});
	
	/**
	 * JGSelect에 매핑되어 있는 값열명을 반환합니다.
	 * 
	 * @method valueColumn
	 * @return {String} 값열명
	 * @example
	 * 	var result_ = $(target_).JGSelect("valueColumn");
	 */
	JGSelect.prototype.valueColumn = (function(){
		return this._valueColumn;
	});
	/**
	 * JGSelect에 매핑을 재적재합니다.
	 * 
	 * @method reload
	 * @example
	 * 	var result_ = $(target_).JGSelect("reload");
	 */
	JGSelect.prototype.reload = (function(){
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
		if(select_ !== undefined) this.data("jgdatasetJGSelect",select_);
		return this.data("jgdatasetJGSelect");
	});
	$.fn._jgSelectInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdatasetJGSelectInitialized",bool_);
		return NVL(this.data("jgdatasetJGSelectInitialized"),false);
	});
	$.fn.JGSelect = (function(){
		if(!this._jgSelectInitialized()){
			this._jgSelect(new JGSelect(this, arguments[0]));
			this._jgSelectInitialized(true);
		}
		
		return JGSelector(this._jgSelect(), arguments);
	});
	
})(window,jQuery,JGDS);