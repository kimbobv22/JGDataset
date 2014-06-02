(function(window){
	
	var JGJSONUtils = {
		value : function(object_, key_){
			if($.type(key_) === "number"){
				var result_;
				var curIndex_ = 0;
				$.each(object_,function(tKey_){
					if(curIndex_ === key_){
						result_ = object_[tKey_];
						return false;
					}
					++curIndex_;
				});
				
				return result_;
			}else{
				var uKey_ = key_.toUpperCase();
				var result_; 
				$.each(object_,function(tKey_, value_){
					if(tKey_.toUpperCase() === uKey_){
						result_ = object_[tKey_];
						return false;
					}
				});
				return result_;
			}
		},key : function(object_, index_){
			var result_;
			var curIndex_ = 0;
			$.each(object_,function(tKey_){
				if(curIndex_ === index_){
					result_ = tKey_;
					return false;
				}
				++curIndex_;
			});
			
			return result_;
		},length : function(object_){
			var length_ = 0;
			$.each(object_,function(key_){
				++length_;
			});
			
			return length_;
		}
	};
	
	_JGKeyword = $.extend(true,_JGKeyword,{
		validator : {
			failedColumn : "jg-failed-column",
			validColumn : "jg-valid-column",
			failedLabelLastDisplay : "jgValidatorUI_failedLabel_lastDisplay",
			validLabelLastDisplay : "jgValidatorUI_validLabel_lastDisplay",
			trigger : {
				/**
				 * 행의 유효성여부가 변경되면 호출됩니다. 
				 * 
				 * @event changecolumnvalidation
				 * @param {jQuery Event Object} event_ jQuery 이벤트 객체
				 * @param {Boolean} isValid_ 행유효성여부
				 * @param {Number} rowIndex_ 행색인
				 * @for jQuery.fn.JGValidator
				 * @example
				 * 	$(target_).trigger("changecolumnvalidation",function(event_, isValid_, rowIndex_){
				 * 		//to do
				 * 	});
				 */
				rowValidationChange : "rowvalidationchange"
			}
		}
	});
	
	/**
	 * JGValidator를 구성하는 단위객체입니다
	 * 
	 * @class jQuery.fn.JGValidatorRow
	 * @constructor 
	 * @private
	 */
	var JGValidatorRow = window.JGValidatorRow = (function(validator_, rowContent_){
		this._validator = validator_;
		this._errorLabels = new Array();
		this._validLabels = new Array();
		this._lastCause = null;
		
		this.rowContent(rowContent_);
	});
	
	/**
	 * 해당 JGValidator를 반환합니다.
	 * 
	 * @method validator
	 * @return {jQuery.fn.JGValidator} JGValidator
	 */
	JGValidatorRow.prototype.validator = (function(){
		return this._validator;
	});
	
	/**
	 * 매핑된 데이타셋을 반환합니다.
	 * 
	 * @method dataset
	 * @return {JGDataset} 데이타셋
	 */
	JGValidatorRow.prototype.dataset = (function(){
		return this._validator.datasetUI().dataset();
	});
	
	/**
	 * 매핑된 행컨텐츠를 반환/설정합니다.
	 * 
	 * @method rowContent
	 * @param {JGRowContent} [rowContent_] 행컨텐츠
	 * @return {JGRowContent} 행컨텐츠
	 */
	JGValidatorRow.prototype.rowContent = (function(rowContent_){
		if(rowContent_ !== undefined){
			this._rowContent = rowContent_;
			this.reload();
		}
		
		return this._rowContent;
	});
	
	/**
	 * 실패라벨, 유효라벨을 재적재합니다.
	 * 
	 * @method reload
	 */
	JGValidatorRow.prototype.reload = (function(){
		this._errorLabels.removeAll();
		this._validLabels.removeAll();

		var oRowContent_ = this._rowContent.rowContent();

		var that_ = this;
		oRowContent_.find("*["+_JGKeyword.validator.failedColumn+"]").each(function(){
			that_._errorLabels.push($(this));
		});
		oRowContent_.find("*["+_JGKeyword.validator.validColumn+"]").each(function(){
			that_._validLabels.push($(this));
		});
		
		this.validate(function(){});
	});
	
	/**
	 * 마지막에 검사된 유효근거를 반환합니다.
	 * 
	 * @method lastCause
	 * @return {Object} 마지막에 검사된 유효근거
	 */
	JGValidatorRow.prototype.lastCause = (function(){
		return this._lastCause;
	});
	
	/**
	 *  유효여부를 반환합니다.
	 * 
	 * @method isValid
	 * @return {Boolean} 유효여부
	 */
	JGValidatorRow.prototype.isValid = (function(){
		var result_ = true;
		var lastCauseExists_ = (!isNull(this._lastCause) ? true : false);

		if(lastCauseExists_) $.each(this._lastCause, function(columnName_){
			if(this.length > 0){
				result_ = false;
				return result_;
			}
		});
		
		return (result_ && lastCauseExists_);
	});
	JGValidatorRow.prototype.__rValidate = (function(validator_, dataset_, cause_, colIndex_, valIndex_, callback_){
		var columnCount_ = JGJSONUtils.length(validator_._validators);
		if(colIndex_ >= columnCount_){
			callback_(cause_);
			return;
		}	

		var columnName_ = JGJSONUtils.key(validator_._validators, colIndex_);
		var validatorElements_ = validator_._validators[columnName_];
		var validatorElementsLength_ = JGJSONUtils.length(validatorElements_);

		if(valIndex_ >= validatorElementsLength_){
			this.__rValidate(validator_, dataset_, cause_, colIndex_+1, 0, callback_);
			return;
		}

		columnName_ = columnName_.toUpperCase();
		var rowIndex_ = this.rowContent().rowIndex();
		var columnValue_ = dataset_.getColumnValue(columnName_, rowIndex_);
		var validatorElement_ = JGJSONUtils.value(validatorElements_, valIndex_);
		var engine_ = JGJSONUtils.value(validator_._engine, validatorElement_.name);
		
		if(!engine_){
			console.error("can't find validation engine : "+validatorElement_.name);
			this.__rValidate(validator_, dataset_, cause_, colIndex_, valIndex_+1, callback_);
			return;
		}
		var that_ = this;
		engine_.apply(dataset_,[validatorElement_, columnName_, rowIndex_, columnValue_, function(isValid_){
			if(cause_[columnName_] === undefined)
				cause_[columnName_] = new Array();
			
			if(!isValid_) cause_[columnName_].push(validatorElement_.name);
			if(!isValid_ && BLK(validator_._options.stepValidation,true)){
				++colIndex_;
				valIndex_ = 0;
			}else{
				++valIndex_;
			}

			that_.__rValidate(validator_, dataset_, cause_, colIndex_, valIndex_, callback_);
		}]);
	});
	
	/**
	 *  행 유효검사를 수행합니다.
	 * 
	 * @method validate
	 * @param {Function} callback_ 콜백함수
	 */
	JGValidatorRow.prototype.validate = (function(callback_){
		var validator_ = this._validator;
		var datasetUI_ = validator_.datasetUI();
		var dataset_ = datasetUI_.dataset();
		var rowIndex_ = this._rowContent.rowIndex();
		var validators_ = validator_._validators;
		var engines_ = validator_._engine;
		var that_ = this;

		this.__rValidate(validator_, dataset_, {}, 0, 0, function(cause_){
			var rCause_ = $.extend(true,{},cause_);
			$.each(cause_, function(columnName_){
				if(rCause_[columnName_].length === 0)
					delete rCause_[columnName_];
			});

			that_._lastCause = rCause_;
			that_.refresh();
			var isValid_ = that_.isValid();
			if(isValid_ !== that_.__lastValid){
				datasetUI_.element().trigger(_JGKeyword.validator.trigger.rowValidationChange, [isValid_, rowIndex_]);
			}
			that_.__lastValid = isValid_;
			if(!isNull(callback_)) callback_.apply(dataset_, [isValid_, that_._lastCause]);
		});
	});
	
	/**
	 * 실패라벨, 유효라벨을 새로고칩니다.
	 * 
	 * @method refresh
	 */
	JGValidatorRow.prototype.refresh = (function(){
		var that_ = this;
		var dataset_ = this.dataset();
		var validator_ = that_.validator();
		var rowIndex_ = this.rowContent().rowIndex();
		var lastCause_ = this.lastCause();
		$.each(this._errorLabels, function(){
			var that_ = this;
			var columnNames_ = this.attr(_JGKeyword.validator.failedColumn);

			if(columnNames_.indexOf(",") >= 0){
				columnNames_ = columnNames_.split(",");
			}else{
				var temp_ = columnNames_;
				 columnNames_ = new Array();
				 columnNames_.push(temp_);
			}

			var colCount_ = columnNames_.length;
			for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
				var columnName_ = columnNames_[colIndex_].toUpperCase();
				var cause_ = lastCause_[columnName_.toUpperCase()];

				if(cause_ === undefined){
					var animateFunc_ = validator_._options.animateFailedLabelHide;
					if(!isNull(animateFunc_) && BLK(this.data(_JGKeyword.validator.failedLabelLastDisplay),true)){
						this.data(_JGKeyword.validator.failedLabelLastDisplay,false);
						animateFunc_.apply(this,[cause_, dataset_, columnName_, rowIndex_]);
					}
				}else{
					var causeCount_ = JGJSONUtils.length(cause_);
					this.empty();
					for(var causeIndex_=0;causeIndex_<causeCount_;++causeIndex_){
						var causeName_ = JGJSONUtils.value(cause_, causeIndex_);
						var failedMessage_ = validator_.failedMessage(columnName_, causeName_);
						if(isNull(failedMessage_)){
							failedMessage_ = NVL(validator_.commonFailedMessage(causeName_),"");
						}

						var makeMessagePattern_ = (function(key_){
							return new RegExp("\\{("+key_+")\\}", "gi");
						});
						
						failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnName"),columnName_);
						failedMessage_ = failedMessage_.replace(makeMessagePattern_("rowIndex"),rowIndex_);
						failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnValue"),dataset_.getColumnValue(columnName_,rowIndex_));

						var validatorElement_ = validator_._validator(columnName_, causeName_);
						$.each(validatorElement_, function(entryName_, entryValue_){
							failedMessage_ = failedMessage_.replace(makeMessagePattern_(entryName_), entryValue_);
						});

						var failedMessageTag_ = $(validator_._options.failedMessageTag);
						failedMessageTag_.html(failedMessage_);
						this.append(failedMessageTag_);

						if(NVL(validator_.options.stepValidation,false)) break;
					}

					var animateFunc_ = validator_._options.animateFailedLabelShow;
					if(!isNull(animateFunc_) && !BLK(this.data(_JGKeyword.validator.failedLabelLastDisplay),false)){
						this.data(_JGKeyword.validator.failedLabelLastDisplay,true);
						animateFunc_.apply(this,[cause_, dataset_, columnName_, rowIndex_]);
					}
				}
			}
		});

		$.each(this._validLabels, function(){
			var that_ = this;
			var columnNames_ = this.attr(_JGKeyword.validator.validColumn);

			if(columnNames_.indexOf(",") >= 0){
				columnNames_ = columnNames_.split(",");
			}else{
				var temp_ = columnNames_;
				 columnNames_ = new Array();
				 columnNames_.push(temp_);
			}

			var colCount_ = columnNames_.length;
			for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
				var columnName_ = columnNames_[colIndex_].toUpperCase();
				var cause_ = lastCause_[columnName_];

				if(cause_ === undefined){
					var animateFunc_ = validator_._options.animateValidLabelShow;
					if(!isNull(animateFunc_) && !BLK(this.data(_JGKeyword.validator.validLabelLastDisplay),false)){
						this.data(_JGKeyword.validator.validLabelLastDisplay,true);
						animateFunc_.apply(this,[cause_, dataset_, columnName_, rowIndex_]);
					}
					
				}else{
					var animateFunc_ = validator_._options.animateValidLabelHide;
					if(!isNull(animateFunc_) && BLK(this.data(_JGKeyword.validator.validLabelLastDisplay),true)){
						this.data(_JGKeyword.validator.validLabelLastDisplay,false);
						animateFunc_.apply(this,[cause_, dataset_, columnName_, rowIndex_]);
					}
				}
			}
		});
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
	var JGValidator = window.JGValidator = (function(datasetUI_, arg1_){
		var failedMessages_,commonFailedMessages_,options_,engine_;
		arg1_ = NVL(arg1_,{});
		if(!isNull(arg1_.options)){
			failedMessages_ = arg1_.failedMessages;
			commonFailedMessages_ = arg1_.commonFailedMessages;
			options_ = arg1_.options;
			engine_ = arg1_.engine;
		}else{
			options_ = arg1_;
		}

		this._datasetUI = datasetUI_;
		this._engine = $.extend(true,JGValidator.prototype._engine,engine_);
		this._commonFailedMessages = $.extend(true,JGValidator.prototype._commonFailedMessages,commonFailedMessages_);
		this._failedMessages = $.extend(true,JGValidator.prototype._failedMessages,failedMessages_);
		this._options = $.extend(true,JGValidator.prototype._options,options_);
		this._validators = {};
		this._rows = new Array();

		var dataset_ = this.dataset();
		var that_ = this;
		// row inserted
		$(dataset_).on(_JGKeyword.trigger._rowInserted,function(event_, rowIndex_){
			that_._insertValidatorRow(rowIndex_);
		});
		
		// row removed
		$(dataset_).on(_JGKeyword.trigger._rowRemoved,function(event_, rowIndex_){
			that_._removeValidatorRow(rowIndex_);
		});
		
		// row moved
		$(dataset_).on(_JGKeyword.trigger._rowMoved,function(event_, fromRowIndex_, toRowIndex_){
			if(fromRowIndex_ > toRowIndex_){
				that_.refresh(toRowIndex_,fromRowIndex_); 
			}else that_.refresh(fromRowIndex_,toRowIndex_);
			
		});
		
		// column added,removed
		$(dataset_).on(_JGKeyword.trigger._columnAdded+" "
				+_JGKeyword.trigger._columnRemoved,function(event_, columnName_){
			that_.refresh();
		});
		
		// column value changed
		$(dataset_).on(_JGKeyword.trigger._columnValueChanged,function(event_, columnName_, rowIndex_){
			if(that_._options.realtimeCheck) that_._rows[rowIndex_].validate();
		});
		
		// dataset clear,reset,changed,sorted
		$(dataset_).on(_JGKeyword.trigger._datasetClear+" "
				+_JGKeyword.trigger._datasetReset+" "
				+_JGKeyword.trigger._datasetChanged+" "
				+_JGKeyword.trigger._datasetSorted,function(event_, rowIndex_, oldRowIndex_){
			that_.reload();
		});
		
		this.reload();
	});
	/**
	 * 매핑된 JGDatasetUI를 반환합니다.
	 * 
	 * @method datasetUI
	 * @return {jQuery.fn.JGDatasetUI} JGDatasetUI
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
			this.refresh();
		}
		return this._failedMessages;
	});
	JGValidator.prototype.failedMessage = (function(columnName_, validatorName_){
		var validators_ = JGJSONUtils.value(this._failedMessages, columnName_);
		if(isNull(validators_)) return undefined;
		return JGJSONUtils.value(validators_ ,validatorName_);
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
			this.refresh();
		}
		return this._commonFailedMessages;
	});
	JGValidator.prototype.commonFailedMessage = (function(validatorName_){
		return JGJSONUtils.value(this._commonFailedMessages, validatorName_);
	});
	JGValidator.prototype._validator = (function(columnName_, causeName_){
		var cause_ = JGJSONUtils.value(this._validators, columnName_);
		if(isNull(cause_)) return undefined;
		return JGJSONUtils.value(cause_, causeName_);
	});

	/**
	 * 마지막 유효성 검사에 대한 유효근거를 반환합니다.
	 * 
	 * [
	 * 	행색인 : {
	 * 		isValid : 행유효여부 
	 * 		열명1 : {
	 * 			유효성명1 : {유효성정보},
	 * 			유효성명2 : {유효성정보},
	 * 			...
	 * 		},
	 * 		...
	 * 	},
	 * 	...
	 * ]
	 * 
	 * @method lastCause
	 * @return {Object} 유효근거
	 * @example
	 * 	var result_ = $(target_).JGValidator("cause");
	 */
	JGValidator.prototype.lastCause = (function(){
		var lastCause_ = new Array();
		var vRowCount_ = this._rows.length;
		for(var vRowIndex_=0;vRowIndex_<vRowCount_;++vRowIndex_){
			var vRow_ = this._rows[vRowIndex_];
			lastCause_[vRowIndex_] = $.extend({
				isValid : vRow_.isValid()
			},vRow_.lastCause());
		}

		return lastCause_;
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
		var result_ = true;
		var lastCause_ = this.lastCause();
		
		$.each(lastCause_, function(){
			if(!this.isValid){
				result_ = false;
				return result_;
			}
		});
		
		return result_;
	});
	
	/**
	 * JGValidator를 재적재합니다.
	 * 
	 * @method reload
	 * @param {Boolean} [reloadRow_] 행요소 재적재여부
	 * @example
	 * 	$(target_).JGValidator("reload");
	 */
	JGValidator.prototype.reload = (function(reloadRow_){
		this._validators = {};
		
		var datasetUI_ = this._datasetUI;
		var dataset_ = datasetUI_.dataset();
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
				
				this._validators[columnName_].notEquals = {
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
					var regexpStr_ = "(jg\\-validator\\-)+";
					if(new RegExp(regexpStr_, "gi").test(attr_.name)){
						var validatorName_ = attr_.name.replace("jg-validator-","");
						that_._validators[columnName_][validatorName_] = {
							name : validatorName_
							,value : attr_.value
						};
					}
				}
			});
		}
		 
		if(NVL(reloadRow_,true)){
			this.reloadRow();
		}
		
		this.validate(function(){});
	});
	
	/**
	 * 행요소을 재적재합니다.
	 * 
	 * @method reloadRow
	 * @param {Number} fromRowIndex_ 시작행색인
	 * @param {Number} toRowIndex_ 종료행색인
	 * @example
	 * 	$(target_).JGValidator("reloadRow",fromRowIndex_,toRowIndex_);
	 * 
	 */
	JGValidator.prototype.reloadRow = (function(fromRowIndex_, toRowIndex_){
		var that_ = this;
		that_._rows.removeAll();
		this.dataset().each(fromRowIndex_, toRowIndex_, function(rowIndex_){
			that_._insertValidatorRow(rowIndex_);
		});
	});
	
	/**
	 * 실패라벨, 유효라벨을 새로고칩니다
	 * 
	 * @method refresh
	 * @param {Number} fromRowIndex_ 시작행색인
	 * @param {Number} toRowIndex_ 종료행색인
	 * @example
	 * 	$(target_).JGValidator("refresh",fromRowIndex_,toRowIndex_);
	 * 
	 */
	JGValidator.prototype.refresh = (function(fromIndex_, toIndex_){
		var that_ = this;
		this.dataset().each(fromIndex_, toIndex_, function(rowIndex_){
			that_._rows[rowIndex_].refresh();
		});
	});

	JGValidator.prototype.__rValidate = (function(rowIndex_, cause_, callback_){
		var rowCount_ = this.dataset().getRowCount();

		if(rowIndex_ >= rowCount_){
			callback_(cause_);
			return;
		}
		var that_ = this;
		this._rows[rowIndex_].validate(function(isValid_, rowCause_){
			cause_[rowIndex_] = $.extend({},rowCause_);
			cause_[rowIndex_].isValid = isValid_;
			that_.__rValidate(rowIndex_+1, cause_, callback_);
		});
	});
	
	/**
	 * 요효성검사를 수행합니다
	 * 
	 * @method refresh
	 * @param {Number} fromRowIndex_ 시작행색인
	 * @param {Number} toRowIndex_ 종료행색인
	 * @example
	 * 	$(target_).JGValidator("validate",fromRowIndex_,toRowIndex_);
	 */
	JGValidator.prototype.validate = (function(callback_){
		var that_ = this;
		this.__rValidate(0, new Array(), function(cause_){
			that_._lastCause = cause_;
			callback_(that_.isValid(), cause_);
		});
	});
	
	JGValidator.prototype._insertValidatorRow = (function(rowIndex_){
		this._rows.insert(new JGValidatorRow(this, this._datasetUI.rowContent(rowIndex_)),rowIndex_);
		this.refresh(rowIndex_);
	});
	JGValidator.prototype._removeValidatorRow = (function(rowIndex_){
		this._rows.remove(rowIndex_);
		this.refresh(rowIndex_);
	});
	
	JGValidator.prototype._options = {
			failedMessageTag : "<span style='display:block;' />",
			stepValidation : true,
			realtimeCheck : true,
			animateFailedLabelShow : function(){
				this.stop();
				this.fadeIn();
			},animateFailedLabelHide : function(){
				this.stop();
				this.fadeOut();
			},animateValidLabelShow : function(){
				this.stop();
				this.fadeIn();
			},animateValidLabelHide : function(){
				this.stop();
				this.fadeOut();
			}	
	};
	
	/**
	 * 옵션을 설정/반환합니다.<br>
	 * 매개변수가 옵션명 하나만 존재할 경우 반환, 그렇지 않을 경우 설정합니다.
	 * 
	 * 	//옵션항목
	 * 	failedMessageTag = 실패메세지를 출력할 HTML 태그 문자열값 
	 * 	stepValidation = 단계별 유효성검사여부
	 * 	realtimeCheck = 실시간 유효성검사여부
	 * 	animateFailedLabelHide = 실패라벨숨김 에니메이션
	 * 	animateFailedLabelShow = 실패라벨표시 에니메이션
	 * 	animateValidLabelHide = 유효라벨숨김 에니메이션
	 * 	animateValidLabelShow = 유효라벨표시 에니메이션
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
				
				if(arguments[0] === "failedMessageTag"){
					this.refresh();
				}
			}
			
			return this._options[arguments[0]];
		}else if($.type(arguments[0]) === "object"){
			this._options = $.extend(true,this._options,arguments[0]);
			this.refresh();
		}
		return this._options;
	});

	JGValidator.prototype._engine = {
		required : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
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
			callback_(new RegExp(validatorElement_.pattern).test(BLK(columnValue_)));
		},patternWord : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^[\\w]+$").test(BLK(columnValue_)));
		},patternAlphabet : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^[a-zA-Z]+$").test(BLK(columnValue_)));
		},patternAlphanum : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^[0-9a-zA-Z]+$").test(BLK(columnValue_)));
		},patternEmail : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^[\\w\\-\\.]+\@[\\w\\-\\.]+\\.[\\w]{1,5}$").test(BLK(columnValue_)));
		},patternNumber : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^[\\-]?[0-9]+$").test(BLK(columnValue_)));
		},patternPhone : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(new RegExp("^(\\+?\\d{0,2}\\s?\\d{2,3}\\s?\\-?\\s?\\d{3,4}\\s?\\-?\\s?\\d{4})$").test(BLK(columnValue_)));
		},columnEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(BLK(this.getColumnValue(tColumnName_, rowIndex_)) === BLK(columnValue_));
		},columnNotEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(BLK(this.getColumnValue(tColumnName_, rowIndex_)) !== BLK(columnValue_));
		}
	};
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
				return this;
			}else return JGSelector(this._jgValidator(), arguments_);
		},arguments);
	});
	
})(window);