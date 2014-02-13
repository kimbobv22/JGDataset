(function($){
	
	/**
	 * JGDataset extension for validator
	 */
	JGDataset.prototype.getMappedRowTemplate = (function(rowIndex_){
		return this._mappingRowList[rowIndex_];
	});
	
	window.JGDataset.prototype.validator = (function(){
		return $(this).JGDSValidator.apply($(this), arguments);
	});
	
	function _getJSONDataWithoutCase(key_, json_){
		for(var tKey_ in json_){
			if(tKey_.toUpperCase() == key_.toUpperCase()){
				return json_[tKey_];
			}
		}
		return undefined;
	}
	
	$.widget("jg.JGDSValidator",{
		_validators : null
		,validators : function(validators_){
			if(Object.isNull(validators_)){
				return this._validators;
			}
			
			this._validators = $.extend(this._validators,validators_);
		},validatorEngine : function(engine_){
			if(Object.isNull(engine_)){
				return this.validateEngine;
			}
			
			this.validateEngine = $.extend(this.validateEngine,engine_);
		},commonFailedMessages : function(failedMessages_){
			if(Object.isNull(failedMessages_)){
				return this.commonFailedMessages;
			}
			
			this.commonFailedMessages = $.extend(this.commonFailedMessages,failedMessages_);
		},_failedMessages : null
		,failedMessages : function(failedMessages_){
			if(Object.isNull(failedMessages_)){
				return this._failedMessages;
			}
			
			this._failedMessages = failedMessages_;
		},bindedDataset : function(){
			return this.element.get(0);
		} ,_create : function(){
			var that_ = this;
			var dataset_ = this.element.get(0);
			this._validationResult = {};
			this._validators = {};
			this._failedMessages = {};
			
			//bind dataset event
			this.element.on(JGDataset._customTriggerKey_whenColumValueChanged, function(event_, columnName_, rowIndex_){
				that_.singleValidate(columnName_, rowIndex_, function(){});
			});
			this.element.on(JGDataset._customTriggerKey_whenColumnAdded, function(event_, columnName_){
				that_.refresh();
			});
			this.element.on(JGDataset._customTriggerKey_whenColumnRemoved, function(event_, columnName_){
				that_.refresh();
			});
			
			//bind validator function
			dataset_.fullValidate = function(callback_){
				that_.fullValidate(callback_);
			};
			
			this.refresh();
			
		},refresh : function(){
			//auto add validator by mapped view
			this._isValid = false;
			var dataset_ = this.element.get(0);
			var mappedRowElement_ = $("<div/>").html(dataset_._mappingRowContents.clone());
			
			var colCount_ = dataset_.getColumnCount();
			for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
				var columnName_ = dataset_.getColumn(colIndex_).name;
				
				var mappedColumnElements_ = mappedRowElement_.find("["+JGDataset.prototype.STR_MAP_COLUMNNAME+"]").filter(function(){
					return $(this).attr(JGDataset.prototype.STR_MAP_COLUMNNAME).toUpperCase() == columnName_;
				});
				
				mappedColumnElements_ = $("<div />").html(mappedColumnElements_);
				
				this._validators[columnName_] = new Array();
				
				//add required 
				var findedElements_ = mappedColumnElements_.find("[required]");
				var count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "required" 
					});
				}
				
				//add maxLength
				findedElements_ = mappedColumnElements_.find("[maxLength]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "maxLength" 
						,"length" : parseInt(mappedColumnElement_.attr("maxLength"))
					});
				}
				
				//add minLength
				findedElements_ = mappedColumnElements_.find("[minLength]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "minLength" 
						,"length" : parseInt(mappedColumnElement_.attr("minLength"))
					});
				}
				
				//add length
				findedElements_ = mappedColumnElements_.find("[length]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "length" 
						,"length" : parseInt(mappedColumnElement_.attr("length"))
					});
				}
				
				//add equals
				findedElements_ = mappedColumnElements_.find("[equals]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "equals" 
						,"value" : mappedColumnElement_.attr("equals")
					});
				}
				
				//add range
				findedElements_ = mappedColumnElements_.find("[range]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					var range_ = mappedColumnElement_.attr("range").split(",");
					this._validators[columnName_].push({
						"name" : "range" 
						,"from" : parseInt(range_[0])
						,"to" : parseInt(range_[1])
					});
				}
				
				//add rangeLength
				findedElements_ = mappedColumnElements_.find("[rangeLength]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					var range_ = mappedColumnElement_.attr("rangeLength").split(",");
					this._validators[columnName_].push({
						"name" : "rangeLength" 
						,"from" : parseInt(range_[0])
						,"to" : parseInt(range_[1])
					});
				}
				
				//add regex
				findedElements_ = mappedColumnElements_.find("[pattern]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "pattern" 
						,"pattern" : mappedColumnElement_.attr("pattern")
					});
				}
				
				//add pattern - word
				findedElements_ = mappedColumnElements_.find("[patternWord]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternWord"
					});
				}
				
				//add pattern - alphabet
				findedElements_ = mappedColumnElements_.find("[patternAlphabet]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternWord"
					});
				}
				
				//add pattern - patternAlphanum
				findedElements_ = mappedColumnElements_.find("[patternAlphanum]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternAlphanum"
					});
				}
				
				//add pattern - email
				findedElements_ = mappedColumnElements_.find("[patternEmail]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternEmail"
					});
				}
				
				//add pattern - patternNumber
				findedElements_ = mappedColumnElements_.find("[patternNumber]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternNumber"
					});
				}
				
				//add pattern - patternPhone
				findedElements_ = mappedColumnElements_.find("[patternPhone]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					this._validators[columnName_].push({
						"name" : "patternPhone"
					});
				}
				
				//add column equals
				findedElements_ = mappedColumnElements_.find("[columnEquals]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "columnEquals"
						,"value" : mappedColumnElement_.attr("columnEquals")
					});
				}
				
				//add column not equals
				findedElements_ = mappedColumnElements_.find("[columnNotEquals]");
				count_ = findedElements_.length;
				for(var index_=0;index_<count_;++index_){
					var mappedColumnElement_ = $(findedElements_.get(index_));
					
					this._validators[columnName_].push({
						"name" : "columnNotEquals"
						,"value" : mappedColumnElement_.attr("columnNotEquals")
					});
				}
				
				//add custom
				var that_ = this;
				findedElements_ = mappedColumnElements_.find("*").each(function(){
					var attrMap_ = $(this).get(0).attributes;
					var attrMapCount_ = attrMap_.length;
					for(var attrIndex_=0;attrIndex_<attrMapCount_;++attrIndex_){
						var attr_ = attrMap_[attrIndex_];
						if(new RegExp("(custom-validator-)+", "gi").test(attr_.name)){
							that_._validators[columnName_].push({
								name : attr_.name
								,value : attr_.value
							});
						}
					}
				});
				
				//update all error labels
				var rowCount_ = dataset_.getRowCount();
				for(var rowIndex_= 0; rowIndex_<rowCount_;++rowIndex_){
					this._updateErrorLabel(columnName_, rowIndex_, "");
				}
			}
		},_recursiveSingleValidate : function(columnName_, rowIndex_, valIndex_ ,callback_){
			var that_ = this;
			var dataset_ = this.element.get(0);
			var columnValue_ = dataset_.getColumnValue(columnName_, rowIndex_);
			var validatorElements_ = this._validators[columnName_];
			callback_ = Object.NVL(callback_,function(){});
			
			var targetColumnVaildData_ = this._validationResult[columnName_];
			if(Object.isNull(targetColumnVaildData_)){
				this._validationResult[columnName_] = targetColumnVaildData_ = {
						"rowIndex" : rowIndex_
						,"failedData" : {}
				};
			}
			
			if(Object.isNull(validatorElements_)){
				callback_.apply(dataset_, targetColumnVaildData_);
				return;
			}
			
			valIndex_ = Object.NVL(valIndex_,0);
			var valCount_ = validatorElements_.length;
			
			if(valIndex_ == valCount_){
				callback_.apply(dataset_, targetColumnVaildData_);
				return;
			}
			
			var validatorElement_ = validatorElements_[valIndex_];
			var validatorName_ = validatorElement_.name.toLowerCase();

			var validatorEngine_ = _getJSONDataWithoutCase(validatorName_, this.validateEngine); 
			
			if(Object.isNull(validatorEngine_)){
				this._recursiveSingleValidate(columnName_, rowIndex_, valIndex_+1 ,callback_);
				return;
			}
			
			validatorEngine_.apply(dataset_, [validatorElement_, columnName_, rowIndex_, columnValue_, function(isValid_){
				if(!isValid_){
					var result_ = {name : validatorElement_.name};
					var messages_ = _getJSONDataWithoutCase(columnName_, that_._failedMessages);
					var failedMessage_ = null;
					
					if(!Object.isNull(messages_)){
						var message_ = _getJSONDataWithoutCase(validatorElement_.name, messages_);
						if(!Object.isNull(message_ )){
							failedMessage_ = message_;
						}
					}
					
					if(Object.isNull(failedMessage_)){
						failedMessage_ = Object.NVL(_getJSONDataWithoutCase(validatorElement_.name, that_.commonFailedMessages),"");
					}
					
					var makeMessagePattern_ = (function(key_){
						return new RegExp("\\{("+key_+")\\}", "gi");
					});
					
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnName"),columnName_);
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("rowIndex"),rowIndex_);
					failedMessage_ = failedMessage_.replace(makeMessagePattern_("columnValue"),columnValue_);
					for(var validatorElementName_ in validatorElement_){
						failedMessage_ = failedMessage_.replace(makeMessagePattern_(validatorElementName_),validatorElement_[validatorElementName_]);
					}
					
					that_._updateErrorLabel(columnName_, rowIndex_, failedMessage_, true);
					
					targetColumnVaildData_.failedData[validatorElement_.name] = result_;
					if(that_.options.stepValidation){
						valIndex_ = valCount_ -1;
					}
				}else{
					delete targetColumnVaildData_.failedData[validatorElement_.name];
				}
				that_._updateValidatation();
				that_._recursiveSingleValidate(columnName_, rowIndex_, valIndex_+1 ,callback_);
			}]);
		},singleValidate : function(columnName_, rowIndex_, callback_){
			this._updateErrorLabel(columnName_, rowIndex_, "", false);
			this._recursiveSingleValidate(columnName_.toUpperCase(), rowIndex_, 0, callback_);
		},_validationResult : null
		,validationResult : function(){
			return this._validationResult;
		},_isValid : false
		,_updateValidatation : function(){
			for(var columnName_ in this._validationResult){
				var failedData_ = this._validationResult[columnName_].failedData;
				for(var validatorName_ in failedData_){
					this._isValid = false;
					return;
				}
			}
			
			this._isValid = true;
		},isValid : function(){
			return this._isValid;
		},_recursiveFullValidate : function(columnIndex_, rowIndex_, callback_){
			var that_ = this;
			var dataset_ = this.element.get(0);
			var colCount_ = dataset_.getColumnCount();
			var rowCount_ = dataset_.getRowCount();
			
			columnIndex_ = Object.NVL(columnIndex_, 0);
			rowIndex_ = Object.NVL(rowIndex_,0);
			callback_ = Object.NVL(callback_,function(){});
			
			if(columnIndex_ == colCount_){
				callback_.apply(dataset_, this._validationResult);
				return;
			}else if(columnIndex_ < colCount_ && rowIndex_ == rowCount_){
				this._recursiveFullValidate(columnIndex_+1, 0, callback_);
				return;
			}else{
				this.singleValidate(dataset_.getColumn(columnIndex_).name, rowIndex_, function(result_){
					that_._recursiveFullValidate(columnIndex_, rowIndex_+1, callback_);
				});
				return;
			}
		},fullValidate : function(callback_){
			this._recursiveFullValidate(0,0,callback_);
		}
	});
	
	function _lengthOfChar(char_){
		var result_ = 0;
		var count_ = char_.length;
		for(var index_=0;index_<count_;++index_){
			result_ += char_.charCodeAt(index_) > 128 ? 2 : 1;
		}
		
		return result_;
	}
	
	function _checkRegexp(pattern_, value_){
		var regex_ = new RegExp(pattern_, "gi");
		return regex_.test(value_);
	}
	
	$.jg.JGDSValidator.prototype.options = {
		"errorMessageTag" : "<span style='display:block;' />"
		,"stepValidation" : true
	};
	$.jg.JGDSValidator.prototype.commonFailedMessages = {
		required : "field is required"
		,maxLength : "max length : {length}"
		,minLength : "min length : {length}"
		,length : "length : {length}"
		,range : "range : {from} ~ {to}"
		,rangeLength : "length : {from} ~ {to}"
		,equals : "equals : {value}"
		,pattern : "pattern : {pattern}"
		,patternWord : "pattern word"
		,patternAlphabet : "pattern alphabet"
		,patternAlphanum : "pattern alphanum"
		,patternEmail : "pattern email"
		,patternNumber : "pattern number"
		,patternPhone : "pattern phone"
	};
	
	$.jg.JGDSValidator.prototype.validateEngine = {
		_customVaildate : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			this[validatorElement_.name](validatorElement_, columnName_, rowIndex_, columnValue_, callback_);
		},required : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_((0 < _lengthOfChar(Object.NVL(columnValue_,""))));
		},maxLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_((validatorElement_.length >= _lengthOfChar(Object.NVL(columnValue_,""))));
		},minLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_((validatorElement_.length <= _lengthOfChar(Object.NVL(columnValue_,""))));
		},length : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_((validatorElement_.length == _lengthOfChar(Object.NVL(columnValue_,""))));
		},range : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var cColumnValue_ = parseInt(columnValue_);
			callback_(validatorElement_.from <= cColumnValue_ && validatorElement_.to >= cColumnValue_);
		},rangeLength : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var cLength_ = _lengthOfChar(Object.NVL(columnValue_,""));
			callback_(validatorElement_.from <= cLength_ && validatorElement_.to >= cLength_);
		},equals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			callback_(validatorElement_.value == columnValue_);
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
			callback_(_checkRegexp("^[0-9]{2,4}\-[0-9]{3,4}\-[0-9]{3,4}$", columnValue_));
		},columnEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(this.getColumnValue(tColumnName_, rowIndex_) === columnValue_);
		},columnNotEquals : function(validatorElement_, columnName_, rowIndex_, columnValue_, callback_){
			var tColumnName_ = validatorElement_.value;
			callback_(this.getColumnValue(tColumnName_, rowIndex_) !== columnValue_);
		}
	};
	
	$.jg.JGDSValidator.prototype._updateErrorLabel = (function(columnName_, rowIndex_, message_, appendMessage_){
		var dataset_ = this.element.get(0);
		var mappingRowTemplate_ = dataset_.getMappedRowTemplate(rowIndex_);
		if(Object.isNull(mappingRowTemplate_)){
			return;
		}
		
		var errorLabels_ = mappingRowTemplate_.find("["+$.jg.JGDSValidator.STR_ERRORCOLUMNNAME+"]").filter(function(){
			var tColumName_ = columnName_.toUpperCase();
			var elementColumnName_ = $(this).attr($.jg.JGDSValidator.STR_ERRORCOLUMNNAME).toUpperCase();
			return (tColumName_ == elementColumnName_);
		});
		var elCount_ = errorLabels_.length;
		for(var elIndex_=0;elIndex_<elCount_;++elIndex_){
			var errorLabel_ = $(errorLabels_.get(0));
			errorLabel_.show();
			message_ = $(this.options.errorMessageTag).html(message_);
			
			
			if(Object.NVL(appendMessage_,false)) errorLabel_.append(message_);
			else{
				if(message_.html().length == 0){
					errorLabel_.html("");
					errorLabel_.hide();
				}else{
					errorLabel_.html(message_);
				}
			}
		}
	});
	
	$.jg.JGDSValidator.STR_ERRORCOLUMNNAME = "jg-error-column";
	
	/**
	 * validator auto bind
	 */
	$(JGDS).on("afterload",function(){
		var target_ = $("[jg-dataset-validator][jg-dataset]");
		
		$.each(target_, function(index_){
			$(JGDS($(this).attr("jg-dataset"))).JGDSValidator();
		});
	});
})(jQuery);