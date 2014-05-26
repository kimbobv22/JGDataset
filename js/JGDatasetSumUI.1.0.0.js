(function(window){
	
	if(JGDatasetUI === undefined){
		console.error("can't not initialize JGDatasetSumUI, JGDatasetUI not found");
		return;
	}
	
	window._JGKeyword = $.extend(window._JGKeyword,{
		sumui : {
			trigger : {
				/**
				 * JGDatasetSumUI가 새로고침시, 발생합니다
				 * 
				 * @event jgdatasetsumui
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @for jQuery.fn.JGDatasetSumUI
				 * @example
				 * 	$(target_).trigger("jgdatasetsumui",function(event_){
				 * 		//to do
				 * 	});
				 */
				refresh : "jgdatasetsumui"
			}
		}
	});
	/**
	 * HTML과 JGDataset의 통계매핑을 위한 플러그인입니다.<br>
	 * 함수호출 형식은 아래와 같습니다.
	 * 	
	 * 	//1. jQuery Plugin Style
	 * 	var result_ = $(target_).JGDatasetSumUI("함수명",...);
	 * 	
	 * 	//2. normal Style
	 * 	var datasetSumUI_ = $(target_).JGDatasetSumUI();
	 * 	var result_ = datasetSumUI_.함수명();
	 * 
	 * datasetSumUI 샘플은 <a href="http://kimbobv22.github.io/JGDataset/index.html" target="_blank">여기</a>에서 확인할 수 있습니다.
	 * 
	 * @class jQuery.fn.JGDatasetSumUI
	 * @constructor
	 * @example
	 * 	//1. 정의되어 있는 속성값을 이용하여 초기화
	 * 	<div jg-dataset="datasetName" id="target">
	 * 		...
	 * 	</div>
	 * 	<script type="text/javascript">
	 * 	$("#target").JGDatasetSumUI();
	 * 	</script>
	 * 	
	 * 	//2. 매개변수를 이용하여 초기화
	 * 	<div id="target">
	 * 		...
	 * 	</div>
	 * 	<script type="text/javascript">
	 * 	$("#target").JGDatasetSumUI("datasetName");
	 * 	</script>
	 */
	var JGDatasetSumUI = window.JGDatasetSumUI = (function(element_, datasetName_){
		this._element = element_;
		this._datasetName = NVL(datasetName_,element_.attr(_JGKeyword.ui.attrDataset));
		this._FXElements = new Array();
		
		var fxElements_ = this._element.find("*");
		fxElements_.push(this._element);
		var fxElementsLength_ = fxElements_.length;
		for(var fxIndex_=0;fxIndex_<fxElementsLength_;++fxIndex_){
			var fxElement_ = $(fxElements_[fxIndex_]);
			var attrs_ = fxElement_[0].attributes;
			var attrCount_ = attrs_.length;
			
			for(var attrIndex_ =0; attrIndex_<attrCount_;++attrIndex_){
				var attr_ = attrs_[attrIndex_];
				var attrName_ = attr_.name.toLowerCase();
				if(attr_.name.toLowerCase() !== _JGKeyword.ui.attrColumn
					&& BLK(attr_.value).replaceBlank("").indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
					this._FXElements.push(new JGFXElement(fxElement_,attrName_,0))
				}
			}
			
			var textValue_ = fxElement_.html();
			if(BLK(textValue_).replaceBlank("").indexOf(_JGKeyword.ui.keyFXPrefix) === 0){
				this._FXElements.push(new JGFXElement(fxElement_,null,1))
			}
		}
		
		// column added,removed
		var that_ = this;
		$(this.dataset()).on(
				_JGKeyword.trigger._rowInserted+" "
				+_JGKeyword.trigger._rowRemoved+" "
				+_JGKeyword.trigger._rowMoved+" "
				+_JGKeyword.trigger._columnAdded+" "
				+_JGKeyword.trigger._columnRemoved+" "
				+_JGKeyword.trigger._columnValueChanged+" "
				+_JGKeyword.trigger._datasetClear+" "
				+_JGKeyword.trigger._datasetReset+" "
				+_JGKeyword.trigger._datasetChanged+" "
				+_JGKeyword.trigger._datasetSorted+" "
				+_JGKeyword.trigger._datasetApply
				,function(event_){
			that_.refresh();
		});
		
		this._refresh();
	});
	
	/**
	 * 매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @method element
	 * @return {jQuery Object} jQuery 객체
	 * @example
	 * 	var element_ = $(target_).JGDatasetSumUI("element");
	 */
	JGDatasetSumUI.prototype.element = (function(){
		return this._element;
	});
	/**
	 * 매핑되어 있는 데이타셋명을 반환합니다.
	 * 
	 * @method datasetName
	 * @return {String} 데이타셋명 
	 * @example
	 * 	var datasetName_ = $(target_).JGDatasetSumUI("datasetName");
	 */
	JGDatasetSumUI.prototype.datasetName = (function(){
		return this._datasetName;
	});
	/**
	 * 매핑되어 있는 데이타셋을 반환합니다.
	 * 
	 * @method dataset
	 * @return {JGDataset} 데이타셋 
	 * @example
	 * 	var dataset_ = $(target_).JGDatasetSumUI("dataset");
	 */
	JGDatasetSumUI.prototype.dataset = (function(){
		return JGDS("dataset",this._datasetName);
	});
	
	/**
	 * FX수식매핑되어 있는 jQuery 객체를 반환합니다.
	 * 
	 * @method FXElements
	 * @return {Array} FX수식매핑되어 있는 jQuery 객체
	 */
	JGDatasetSumUI.prototype.FXElements = (function(){
		return this._FXElements;
	});
	
	/**
	 * JGDatasetSumUI를 새로고침합니다.
	 *  
	 * @method refresh
	 * @example
	 * 	$(target_).JGDatasetSumUI("refresh");
	 */
	JGDatasetSumUI.prototype.refresh = (function(){
		this._refresh();
		this._element.trigger(_JGKeyword.sumui.trigger.refresh);
	});
	JGDatasetSumUI.prototype._refresh = (function(){
		var fxElements_ = this.FXElements();
		var dataset_ = this.dataset();
		var fxElementsLength_ = fxElements_.length;
		for(var fxIndex_=0;fxIndex_<fxElementsLength_;++fxIndex_){
			fxElements_[fxIndex_].update(dataset_);
		}
	});
	
	$.fn._jgDatasetSumUI = (function(ui_){
		if(ui_ !== undefined) this.data("jgdatasetJGDatasetSumUI",ui_);
		return this.data("jgdatasetJGDatasetSumUI");
	});
	$.fn._jgDatasetSumUIInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdatasetJGDatasetSumUIInitialized",bool_);
		return NVL(this.data("jgdatasetJGDatasetSumUIInitialized"),false);
	});
	$.fn.JGDatasetSumUI = (function(){
		return this._jexecute(function(arguments_){
			if(!this._jgDatasetSumUIInitialized()){
				this._jgDatasetSumUI(new JGDatasetSumUI(this, arguments_[0]));
				this._jgDatasetSumUIInitialized(true);
			}
			
			return JGSelector(this._jgDatasetSumUI(), arguments_);
		},arguments);
	});
	
})(window);