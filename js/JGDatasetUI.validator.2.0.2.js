(function(window){
	
	if(JGDatasetUI === undefined){
		console.error("can't not initialize JGValidator, JGDataset UI not found");
		return;
	}
	
	function _jsonDataWithoutCase(object_, key_){
		for(var tKey_ in object_){
			if(tKey_.toUpperCase() === key_.toUpperCase()){
				return object_[tKey_];
			}
		}
		return undefined;
	}
	function _jsonDataLength(object_){
		var length_ = 0;
		for(var tKey_ in object_){
			if(object_.hasOwnProperty(tKey_)) ++length_;
		}
		
		return length_;
	}
	
	function _jsonDataAtIndex(object_, index_){
		var curIndex_ = 0;
		for(var key_ in object_){
			if(object_.hasOwnProperty(key_)){
				if(curIndex_ === index_) return object_[key_];
				++curIndex_;
			}
		}
		
		return undefined;
	}
	
	_JGKeyword = $.extend(true,_JGKeyword,{
		validator : {
			errorColumn : "jg-error-column",
			validColumn : "jg-valid-column",
			trigger : {
				/**
				 * 특정 행열값의 유효여부가 변경 시 발생됩니다.
				 * 
				 * @event changecolumnvalidation
				 * @param {jQuery Event object} event_ jQuery 이벤트 객체
				 * @param {String} columnName_ 열명
				 * @param {Number} rowIndex_ 행색인
				 * @param {Boolean} isValid_ 유효여부
				 * @for jQuery.fn.JGValidator
				 * @example
				 * 	$(target_).trigger("changecolumnvalidation",function(event_, columnName_, rowIndex_, isValid_){
				 * 		//to do
				 * 	});
				 */
				changeColumnValidation : "changecolumnvalidation",
			}
		}
	});
	
	/**
	 * JGDataset이 매핑된 JGDatasetUI의 입력 유효성 검사를 위한 객체입니다.<br>
	 * JGValidator를 사용하려면 JGDatasetUI가 초기화 되어 있어야합니다.
	 * 
	 * 	//1. jQuery Plugin Style
	 * 	var result_ = $(target_).JGValidator("함수명",...);
	 * 	
	 * 	//2. normal Style
	 * 	var validator_ = $(target_).JGValidator();
	 * 	var result_ = validator_.함수명();
	 * 
	 * JGValidator 샘플은 <a href="http://kimbobv22.github.io/JGDataset/index.html" target="_blank">여기</a>에서 확인할 수 있습니다.
	 * 
	 * @class jQuery.fn.JGValidator
	 * @constructor 
	 */
	var JGValidator = window.JGValidator = (function(datasetUI_){
		this._datasetUI = datasetUI_;
		this._engine = $.extend(true,{},JGValidator.prototype._engine);
		this._failedMessages = $.extend(true,{},JGValidator.prototype._failedMessages);
		this._validators = {};
		this._cause = {};
		this._onValidate = false;
		
		var that_ = this;
		var dataset_ = this.dataset();
		
		//bind dataset event
		$(dataset_).on(_JGKeyword.trigger._columnValueChanged, function(event_, columnName_, rowIndex_){
			if(that_._options.realtimeCheck) that_._singleValidate(columnName_, rowIndex_, function(){});
		});
		$(dataset_).on(_JGKeyword.trigger._columnAdded+" "
						+_JGKeyword.trigger._columnRemoved+" "
						+_JGKeyword.trigger._rowInserted+" "
						+_JGKeyword.trigger._rowRemoved+" "
						+_JGKeyword.trigger._datasetClear+" "
						+_JGKeyword.trigger._datasetReset+" "
						+_JGKeyword.trigger._datasetChanged, function(event_, columnName_){
			that_.refresh();
		});
		
		this.refresh();
	});
	
	/**
	 * 매핑된 JGDatasetUI를 반환합니다.
	 * 
	 * @method datasetUI
	 * @return {JGDatasetUI} JGDatasetUI
	 * @example
	 * 	var result_ = $(target_).JGValidator("datasetUI");
	 */
	JGValidator.prototype.datasetUI = (function(){
		return this._datasetUI;
	});
	/**
	 * 매핑된 데이타셋을 반환합니다.
	 * 
	 * @method dataset
	 * @return {JGDataset} 데이타셋
	 * @example
	 * 	var result_ = $(target_).JGValidator("dataset");
	 */
	JGValidator.prototype.dataset = (function(){
		return this._datasetUI.dataset();
	});
	
	/**
	 *  유효여부를 반환합니다.
	 * 
	 * @method isValid
	 * @return {Boolean} 유효여부
	 * @example
	 * 	var result_ = $(target_).JGValidator("isValid");
	 */
	JGValidator.prototype.isValid = (function(){
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		var validators_ = this._validators;
		
		for(var columnName_ in this._validators){
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				if(!this.isColumnValid(columnName_, rowIndex_)){
					return false;
				}
			}
		}
	
		return true;
	});
	
	/**
	 * 특정행열의 유효여부를 반환합니다.
	 * 
	 * @method isColumnValid
	 * @param {String} columnName_ 열명
	 * @param {int} rowIndex_ 행색인
	 * @return {Boolean} 유효여부
	 * @example
	 * 	var result_ = $(target_).JGValidator("isColumnValid","COL1",0);
	 */
	JGValidator.prototype.isColumnValid = (function(columnName_, rowIndex_){
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		var validators_ = this._validators;
		
		var result_ = this._cause[columnName_.toUpperCase()]
		if(result_ === undefined) return false;
		
		var validator_ = this._validators[columnName_];
		if(rowCount_ !== result_.length) return false;
		
		var rowResult_ = result_[rowIndex_];
		if(isNull(rowResult_) || _jsonDataLength(rowResult_) > 0) return false;
	
		return true;
	});
	
	
	/**
	 * 유효성엔진 설정/반환합니다.<br>
	 * 매개변수가 존재할 경우 설정, 존재하지 않을 경우 반환합니다.
	 * 
	 * 	//유효성검사 엔진 포멧
	 * 	{"custom-validator1" : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
	 * 			//todo
	 * 		},"custom-validator2" : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
	 * 			//todo
	 * 		}
	 * 	};
	 * 
	 * @method engine
	 * @param {Object} 유효성엔진
	 * @return {Object} 유효성엔진
	 * @example
	 * 	var result_ = $(target_).JGValidator("engine",...);
	 */
	JGValidator.prototype.engine = (function(engine_){
		if(engine_ !== undefined){
			this._engine = $.extend(true,this._engine,engine_);
		}
		return this._engine;
	});
	/**
	 * 유효성검사 실패메세지를 설정/반환합니다.<br>
	 * 매개변수가 존재하지 않을 경우 반환, 존재할 경우 설정합니다.
	 * 
	 * 	//형식
	 * 	{열명1 : {
	 * 			유효성명1 : "실패메세지"
	 * 			,유효성명2 : "실패메세지"
	 * 		},열명2 : {
	 * 			유효성명1 : "실패메세지"
	 * 			,유효성명2 : "실패메세지"
	 *			,...
	 * 		},...
	 * 	}
	 * 
	 * @method validator_
	 * @param {Object} messages_ 유효성 검사 실패메세지
	 * @return {Object} 유효성 검사 실패메세지
	 * @example
	 * 	var result_ = $(target_).JGValidator("failedMessages",...);
	 */
	JGValidator.prototype.failedMessages = (function(messages_){
		if(messages_ !== undefined){
			this._failedMessages = $.extend(true,this._failedMessages,messages_);
			this._updateErrorLabels();
		}
		return this._failedMessages;
	});
	
	/**
	 * 기본 유효성 검사 실패메세지를 설정/반환합니다.<br>
	 * 매개변수가 존재하지 않을 경우 반환, 존재할 경우 설정합니다.
	 * 
	 * 	//형식
	 * 	{
	 * 		유효성명1 : "실패메세지"
	 * 		,...
	 * 	}
	 * 
	 * @method commonFailedMessages
	 * @param {Object} [messages_] 실패메세지
	 * @return {Object} 실패메세지
	 * @example
	 * 	var result_ = $(target_).JGValidator("commonFailedMessages");
	 */
	JGValidator.prototype.commonFailedMessages = (function(messages_){
		if(messages_ !== undefined){
			this._commonFailedMessages = $.extend(true,this._commonFailedMessages,messages_);
		}
		return this._commonFailedMessages;
	});
	
	/**
	 * 유효성 검사에 대한 실패원인을 반환합니다.
	 * 
	 * 	//형식
	 * 	{
	 * 	열명1 : {
	 * 		행색인 : {
	 * 			유효성명1 : {유효성정보}
	 * 			,...
	 * 			}
	 * 		,...
	 * 		}
	 * 	,...
	 * 	}
	 * 
	 * @method cause
	 * @return {Object} 실패원인
	 * @example
	 * 	var result_ = $(target_).JGValidator("cause");
	 */
	JGValidator.prototype.cause = (function(){
		var cause_ = {};
		
		for(var columnName_ in this._cause){
			cause_[columnName_] = {};
			
			for(var rowIndex_=this._cause[columnName_].length-1;rowIndex_>=0;--rowIndex_){
				if(_jsonDataLength(this._cause[columnName_][rowIndex_]) > 0){
					cause_[columnName_][rowIndex_] = this._cause[columnName_][rowIndex_];
				}
			}
			
			if(_jsonDataLength(cause_[columnName_]) === 0){
				delete cause_[columnName_];
			}
		}
		
		return cause_;
	});
	/**
	 * 유효성요소를 재적재합니다.
	 * 
	 * @method refresh
	 * @example
	 * 	$(target_).JGValidator("refresh");
	 */
	JGValidator.prototype.refresh = (function(){
		this._validators = {};
		this._cause = {};
		
		var datasetUI_ = this.datasetUI();
		var dataset_ = this.dataset();
		var originalRowContent_ = datasetUI_._originalRowContent;
		
		var colCount_ = dataset_.getColumnCount();
		for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
			var columnName_ = dataset_.getColumn(colIndex_).getName();
			
			var mappedElements_ = originalRowContent_.find("*["+_JGKeyword.ui.attrColumn+"]").filter(function(){
				return $(this).attr(_JGKeyword.ui.attrColumn).toUpperCase() === columnName_;
			});
			
			this._validators[columnName_] = {};
			
			//add required 
			var findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("required") !== undefined;
			});
			var count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].required = {
					name : "required" 
				};
			}
			
			//add maxLength
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("maxLength") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				this._validators[columnName_].maxLength = {
					name : "maxLength" 
					,length : parseInt(mappedElement_.attr("maxLength"))
				};
			}
			
			//add minLength
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("minLength") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].minLength = {
					name : "minLength" 
					,length : parseInt(mappedElement_.attr("minLength"))
				};
			}
			
			//add length
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("length") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].length = {
					name : "length" 
					,length : parseInt(mappedElement_.attr("length"))
				};
			}
			
			//add equals
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("equals") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].equals = {
					name : "equals" 
					,value : mappedElement_.attr("equals")
				};
			}
			
			//add not equals
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("notEquals") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].equals = {
					name : "notEquals" 
					,value : mappedElement_.attr("notEquals")
				};
			}
			
			//add range
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("range") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				var range_ = mappedElement_.attr("range").split(",");
				this._validators[columnName_].range = {
					name : "range" 
					,from : parseInt(range_[0])
					,to : parseInt(range_[1])
				};
			}
			
			//add rangeLength
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("rangeLength") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				var range_ = mappedElement_.attr("rangeLength").split(",");
				this._validators[columnName_].rangeLength = {
					name : "rangeLength" 
					,from : parseInt(range_[0])
					,to : parseInt(range_[1])
				};
			}
			
			//add regex
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("pattern") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].pattern = {
					name : "pattern" 
					,pattern : mappedElement_.attr("pattern")
				};
			}
			
			//add pattern - word
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternWord") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternWord = {
					name : "patternWord"
				};
			}
			
			//add pattern - alphabet
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternAlphabet") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternAlphabet = {
					name : "patternAlphabet"
				};
			}
			
			//add pattern - patternAlphanum
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternAlphanum") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternAlphanum = {
					name : "patternAlphanum"
				};
			}
			
			//add pattern - email
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternEmail") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternEmail = {
					name : "patternEmail"
				};
			}
			
			//add pattern - patternNumber
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternNumber") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternNumber = {
					name : "patternNumber"
				};
			}
			
			//add pattern - patternPhone
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("patternPhone") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				this._validators[columnName_].patternPhone = {
					name : "patternPhone"
				};
			}
			
			//add column equals
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("columnEquals") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].columnEquals = {
					name : "columnEquals"
					,value : mappedElement_.attr("columnEquals")
				};
			}
			
			//add column not equals
			findedElements_ = mappedElements_.filter(function(){
				return $(this).attr("columnNotEquals") !== undefined;
			});
			count_ = findedElements_.length;
			for(var index_=0;index_<count_;++index_){
				var mappedElement_ = $(findedElements_.get(index_));
				
				this._validators[columnName_].columnNotEquals = {
					name : "columnNotEquals"
					,value : mappedElement_.attr("columnNotEquals")
				};
			}
			
			//add custom
			var that_ = this;
			findedElements_ = mappedElements_.each(function(){
				var attrMap_ = $(this).get(0).attributes;
				var attrMapCount_ = attrMap_.length;
				for(var attrIndex_=0;attrIndex_<attrMapCount_;++attrIndex_){
					var attr_ = attrMap_[attrIndex_];
					var regexpStr_ = "(custom\\-validator\\-)+";
					if(new RegExp(regexpStr_, "gi").test(attr_.name)){
						var validatorName_ = attr_.name.replace("custom-validator-","");
						that_._validators[columnName_][validatorName_] = {
							name : validatorName_
							,value : attr_.value
						};
					}
				}
			});
			
			this.validate(function(){});
		}
	});
	
	JGValidator.prototype._recursiveSingleValidate = (function(columnName_, rowIndex_, valIndex_ ,callback_){
		var that_ = this;
		var datasetUI_ = this.datasetUI();
		var dataset_ = this.dataset();
		var columnValue_ = dataset_.getColumnValue(columnName_, rowIndex_);
		var validatorElements_ = _jsonDataWithoutCase(this._validators, columnName_);
		callback_ = NVL(callback_,function(){});
		
		var columnValidData_ = this._cause[columnName_] = NVL(this._cause[columnName_],[]);
		this._cause[columnName_][rowIndex_] = $.extend(true,this._cause[columnName_][rowIndex_],{});
		
		if(isNull(validatorElements_)){
			var cause_ = this.cause()[columnName_];
			callback_.apply(datasetUI_.element(), [cause_ === undefined ? null : cause_[rowIndex_]]);
			return;
		}
		
		valIndex_ = NVL(valIndex_,0);
		var valCount_ = _jsonDataLength(validatorElements_);
		
		if(valIndex_ === valCount_){
			var cause_ = this.cause()[columnName_];
			callback_.apply(datasetUI_.element(), [cause_ === undefined ? null : cause_[rowIndex_]]);
			return;
		}
		
		var validatorElement_ = _jsonDataAtIndex(validatorElements_, valIndex_);
		var validatorName_ = validatorElement_.name.toLowerCase();
		var validatorEngine_ = _jsonDataWithoutCase(this._engine, validatorName_);
		
		if(isNull(validatorEngine_)){
			this._recursiveSingleValidate(columnName_, rowIndex_, valIndex_+1 ,callback_);
			return;
		}
		
		validatorEngine_.apply(dataset_, [validatorElement_, columnName_, rowIndex_, columnValue_, function(isValid_){
			if(!isValid_){
				var cause_ = {name : validatorElement_.name};
				
				columnValidData_[rowIndex_][validatorElement_.name] = cause_;
				if(that_._options.stepValidation){
					valIndex_ = valCount_ -1;
				}
			}else{
				delete columnValidData_[rowIndex_][validatorElement_.name];
			}
			
			that_._recursiveSingleValidate(columnName_, rowIndex_, valIndex_+1 ,callback_);
		}]);
	});
	JGValidator.prototype._singleValidate = (function(columnName_, rowIndex_, callback_){
		var that_ = this;
		
		var orgColumnIsValid_ = this.isColumnValid(columnName_, rowIndex_);
		this._recursiveSingleValidate(columnName_.toUpperCase(), rowIndex_, 0, function(){
			that_._updateErrorLabels();
			that_._updateValidLabels();
			
			var curColumnIsValid_ = that_.isColumnValid(columnName_, rowIndex_);
			if(curColumnIsValid_ !== orgColumnIsValid_){
				that_.datasetUI().element().trigger(_JGKeyword.validator.trigger.changeColumnValidation,[columnName_, rowIndex_, curColumnIsValid_]);
			}
			
			callback_.apply(that_.datasetUI().element(),arguments);
		});
	});
	JGValidator.prototype._recursiveValidate = (function(columnIndex_, rowIndex_, callback_){
		var that_ = this;
		var datasetUI_ = this.datasetUI();
		var dataset_ = this.dataset();
		var colCount_ = dataset_.getColumnCount();
		var rowCount_ = dataset_.getRowCount();
		
		columnIndex_ = NVL(columnIndex_, 0);
		rowIndex_ = NVL(rowIndex_,0);
		callback_ = NVL(callback_,function(){});
	
		if(columnIndex_ === colCount_){
			callback_.apply(datasetUI_.element(), [this.isValid(), this.cause()]);
			return;
		}else if(columnIndex_ < colCount_ && rowIndex_ === rowCount_){
			this._recursiveValidate(columnIndex_+1, 0, callback_);
			return;
		}else{
			var columnName_ = dataset_.getColumn(columnIndex_).getName();
			this._singleValidate(columnName_, rowIndex_, function(result_){
				that_._recursiveValidate(columnIndex_, rowIndex_+1, callback_);
			});
			return;
		}
	});
	/**
	 * 유효성을 검사합니다.
	 * 
	 * @method validate
	 * @param {Function} [callback_] 콜백함수
	 * @example
	 * 	$(dataset_).JGValidator("validate",function(isValid_, cause_){
	 * 		//to do
	 * 	});
	 */
	JGValidator.prototype.validate = (function(callback_){
		this._recursiveValidate(0,0,callback_);
	});
	JGValidator.prototype._updateErrorLabels = (function(){
		var datasetUI_ = this.datasetUI();
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		
		// set blank all error label
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowContent_ = datasetUI_.rowContent(rowIndex_).rowContent();
			if(isNull(rowContent_)){
				continue;
			}
			
			var errorLabels_ = rowContent_.find("["+_JGKeyword.validator.errorColumn+"]");
			errorLabels_.hide();
			errorLabels_.html("");
		}
		
		// set error label with cause
		var cause_ = this.cause();
		for(var columnName_ in cause_){
			if(!cause_.hasOwnProperty(columnName_)) continue;
			
			var causeRow_ = cause_[columnName_];
			
			for(var rowIndex_ in causeRow_){
				if(!causeRow_.hasOwnProperty(rowIndex_)) continue;
				
				var causeElements_ = causeRow_[rowIndex_];
				var rowContent_ = datasetUI_.rowContent(rowIndex_).rowContent();
				if(isNull(rowContent_)){
					continue;
				}
				
				var errorLabels_ = rowContent_.find("["+_JGKeyword.validator.errorColumn+"]").filter(function(){
					return (columnName_.toUpperCase() === $(this).attr(_JGKeyword.validator.errorColumn).toUpperCase());
				});
				
				for(var causeName_ in causeElements_){
					var failedMessage_ = "";
					var messages_ = _jsonDataWithoutCase(this._failedMessages, columnName_);
					
					if(!isNull(messages_)){
						var message_ = _jsonDataWithoutCase(messages_, causeName_);
						if(!isNull(message_ )){
							failedMessage_ = message_;
						}
					}
					if(isNull(failedMessage_) || failedMessage_.length === 0){
						failedMessage_ = BLK(_jsonDataWithoutCase(this._commonFailedMessages, causeName_));
					}
					
					var makeMessagePattern_ = (function(key_){
						return new RegExp("\\{("+key_+")\\}", "gi");
					});
					
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnName"),columnName_);
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("rowIndex"),rowIndex_);
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnValue"),dataset_.getColumnValue(columnName_,rowIndex_));
					
					for(var entryName_ in this._validators[columnName_][causeName_]){
						failedMessage_ = failedMessage_.replace(makeMessagePattern_(entryName_),this._validators[columnName_][causeName_][entryName_]);
					}
					
					if(failedMessage_.length > 0){
						var errorLabelsLength_ = errorLabels_.length;
						for(var elIndex_=0;elIndex_<errorLabelsLength_;++elIndex_){
							var errorLabel_ = $(errorLabels_[elIndex_]);
							errorLabel_.show();
							
							failedMessage_ = $(this._options.errorMessageTag).html(failedMessage_);
							if(NVL(this._options.appendErrorMessage,false)) errorLabel_.append(failedMessage_);
							else errorLabel_.html(failedMessage_);
						}
					}
				}
			}
		}
	});
	
	JGValidator.prototype._updateValidLabels = (function(){
		var datasetUI_ = this.datasetUI();
		var dataset_ = this.dataset();
		var rowCount_ = dataset_.getRowCount();
		
		// set blank all valid label
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowContent_ = datasetUI_.rowContent(rowIndex_).rowContent();
			if(isNull(rowContent_)){
				continue;
			}
			
			var allLabels_ = rowContent_.find("["+_JGKeyword.validator.validColumn+"]");
			if(allLabels_.length > 0) allLabels_.show();
		}
		
		// hide valid label with cause
		var cause_ = this.cause();
		for(var columnName_ in cause_){
			if(!cause_.hasOwnProperty(columnName_)) continue;
			
			var causeRow_ = cause_[columnName_];
			for(var rowIndex_ in causeRow_){
				if(!causeRow_.hasOwnProperty(rowIndex_)) continue;
				
				var causeElements_ = causeRow_[rowIndex_];
				var rowContent_ = datasetUI_.rowContent(rowIndex_).rowContent();
				if(isNull(rowContent_)){
					continue;
				}
				
				var validLabels_ = rowContent_.find("["+_JGKeyword.validator.validColumn+"]").filter(function(){
					return (columnName_.toUpperCase() === $(this).attr(_JGKeyword.validator.validColumn).toUpperCase());
				});
				if(validLabels_.length > 0){
					validLabels_.hide();
				}
			}
		}
		
	});
	
	JGValidator.prototype._options = {
		errorMessageTag : "<span style='display:block;' />"
		,appendErrorMessage : true
		,stepValidation : true
		,realtimeCheck : true
	};
	
	/**
	 * 옵션을 설정/반환합니다.<br>
	 * 매개변수가 옵션명 하나만 존재할 경우 반환, 그렇지 않을 경우 설정합니다.
	 * 
	 * 	//옵션항목
	 * 	errorMessageTag = 실패메세지를 출력할 HTML 태그 문자열값 
	 * 	appendErrorMessage = 실패메세지 확장출력여부
	 * 	stepValidation = 단계별 유효성검사여부
	 * 	realtimeCheck = 실시간 유효성검사여부
	 * 
	 * @method options
	 * @param {Object} options_ 옵션명 또는 옵션객체
	 * @param {Object} [options_] 옵션값
	 * @return {Object} 옵션
	 * @example
	 * 	var result_ = $(target_).JGValidator("options",...);
	 * 	var result2_ = $(target_).JGValidator({options : ...});
	 */
	JGValidator.prototype.options = (function(){
		if($.type(arguments[0]) === "string"){
			if(arguments.length === 2){
				this._options[arguments[0]] = arguments[1];
				
				if(arguments[0] === "errorMessageTag"
					|| arguments[0] === "appendErrorMessage"){
					this._updateErrorLabels();
				}
			}
			
			return this._options[arguments[0]];
		}else if($.type(arguments[0]) === "object"){
			this._options = $.extend(true,this._options,arguments[0]);
			this.refresh();
		}
		return this._options;
	});
	
	/**
	 * 기본 실패매세지입니다.<br>
	 * 유효성의 별도로 실패메세지를 설정하지 않을 경우 기본 출력됩니다.<br>
	 * *참고 : {{#crossLink "jQuery.fn.JGValidator/commonFailedMessages:method"}}{{/crossLink}}
	 * 
	 * @property _commonFailedMessages
	 * @type Object
	 */
	JGValidator.prototype._commonFailedMessages = {
		required : "field is required"
		,maxLength : "max length : {length}"
		,minLength : "min length : {length}"
		,length : "length : {length}"
		,range : "range : {from} ~ {to}"
		,rangeLength : "length : {from} ~ {to}"
		,equals : "equals : {value}"
		,notEquals : "not equals : {value}"
		,pattern : "pattern : {pattern}"
		,patternWord : "pattern word"
		,patternAlphabet : "pattern alphabet"
		,patternAlphanum : "pattern alphanum"
		,patternEmail : "pattern email"
		,patternNumber : "pattern number"
		,patternPhone : "pattern phone"
		,columnEquals : "column be equals to {value}"
		,columnNotEquals : "column be not equals to {value}"
	};
	
	function _checkRegexp(pattern_, value_, option_){
		var regex_ = new RegExp(pattern_, option_);
		return regex_.test(BLK(value_));
	}
	
	/**
	 * 유효성 엔진객체입니다.
	 * 
	 * @property _engine
	 * @type Object
	 */
	JGValidator.prototype._engine = {
		_customValidate : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			this[validatorElement_.name](validatorElement_, columnName_, rowIndex_, columnValue_, callback_);
		},required : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(0 < BLK(columnValue_).length);
		},maxLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.length >= BLK(columnValue_).length);
		},minLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.length <= BLK(columnValue_).length);
		},length : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.length === BLK(columnValue_).length);
		},range : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var cColumnValue_ = parseInt(columnValue_);
			callback_(validatorElement_.from <= cColumnValue_ && validatorElement_.to >= cColumnValue_);
		},rangeLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var cLength_ = BLK(columnValue_).length;
			callback_(validatorElement_.from <= cLength_ && validatorElement_.to >= cLength_);
		},equals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.value === columnValue_);
		},notEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.value !== columnValue_);
		},pattern : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp(validatorElement_.pattern, columnValue_));
		},patternWord : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^[\\w]+$", columnValue_));
		},patternAlphabet : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^[a-zA-Z]+$", columnValue_));
		},patternAlphanum : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^[0-9a-zA-Z]+$", columnValue_));
		},patternEmail : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^[\\w\\-\\.]+\@[\\w\\-\\.]+\\.[\\w]{1,5}$", columnValue_));
		},patternNumber : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^[\\-]?[0-9]+$", columnValue_));
		},patternPhone : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(_checkRegexp("^(\\+?\\d{0,2}\\s?\\d{2,3}\\s?\\-?\\s?\\d{3,4}\\s?\\-?\\s?\\d{4})$", columnValue_));
		},columnEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(BLK(this.getColumnValue(tColumnName_, rowIndex_)) === BLK(columnValue_));
		},columnNotEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(BLK(this.getColumnValue(tColumnName_, rowIndex_)) !== BLK(columnValue_));
		}
	};
	
	$.fn._jgValidator = (function(validator_){
		if(validator_ !== undefined) this.data("jgdataset_jgValidator",validator_);
		return this.data("jgdataset_jgValidator");
	});
	$.fn._jgValidatorInitialized = (function(bool_){
		if(bool_ !== undefined) this.data("jgdataset_jgValidatorInitialized",bool_);
		return NVL(this.data("jgdataset_jgValidatorInitialized"),false);
	});
	$.fn.JGValidator = (function(){
		return this._jexecute(function(arguments_){
			if(!this._jgValidatorInitialized()){
				this._jgValidator(new JGValidator(this.JGDatasetUI(), arguments_[0]));
				this._jgValidatorInitialized(true);
			}
			return JGSelector(this._jgValidator(), arguments_);
		},arguments);
	}); 
	
})(window);