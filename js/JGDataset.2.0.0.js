(function(window){

	if($ === undefined || $ === null){
		console.error("can't not initialize JGDataset, JQuery not found");
		return;
	}
	
	window._JGKeyword = {
		key : {
			row : "row"
			,column : "col"
			,columnInfo : "columninfo"
			,rowData : "rowdata"
			,deletedRowData : "deletedRowdata"
			,name : "name"
			,isKey : "isKey"
			,value : "value"
			,rowStatus : "status"
			,modify : "modify"
		},trigger : {
			_rowInserted : "_jgRowInserted"
			,_rowRemoved : "_jgRowRemoved"
			,_rowMoved : "_jgRowMoved"
			,_columnAdded : "_jgColumnAdded"
			,_columnRemoved : "_jgColumnRemoved"
			,_columnValueChanged : "_jgColumnValueChanged"
			,_datasetSorted : "_jgDatasetSorted"
			,_datasetChanged : "_jgDatasetChanged"
			,_datasetClear : "_jgDatasetClear"
			,_datasetReset : "_jgDatasetReset"
			,_datasetApply : "_jgDatasetApply"
				/**
				* 행이 삽입되었을 때 호출됩니다.
				*
				* @event rowinserted
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {Number} rowIndex_ 행색인
				* @for JGDataset
				* @example
				* 	$(dataset).on("rowinserted",function(event_, rowIndex_){
				* 		console.log("row inserted! : "+rowIndex_);
				* 	});
				*/
			,rowInserted : "rowinserted"
				/**
				* 행이 삭제되었을 때 호출됩니다.
				*
				* @event rowremoved
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {Number} rowIndex_ 행색인
				* @for JGDataset
				* @example
				* 	$(dataset).on("rowremoved",function(event_, rowIndex_){
				* 		console.log("row removed! : "+rowIndex_);
				* 	});
				*/
			,rowRemoved : "rowremoved"
				/**
				* 행간 이동이 발생 되었을 때 호출됩니다.
				*
				* @event rowmoved
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {Number} fromRowIndex_ 기존 행색인
				* @param {Number} toRowIndex_ 대상 행색인
				* @for JGDataset
				* @example
				* 	$(dataset).on("rowmoved",function(event_, fromRowIndex_, toRowIndex_){
				* 		console.log("row moved : "+rowIndex_+" > "+fromRowIndex_);
				* 	});
				*/
			,rowMoved : "rowmoved"
				/**
				* 열이 추가되었을 때 호출됩니다.
				*
				* @event columnadded
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {String} columnName_ 열명
				* @for JGDataset
				* @example
				* 	$(dataset).on("columnadded",function(event_, columnName_){
				* 		console.log("column added : "+columnName_);
				* 	});
				*/
			,columnAdded : "columnadded"
				/**
				* 열이 삭제되었을 때 호출됩니다.
				*
				* @event columnremoved
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {String} columnName_ 열명
				* @for JGDataset
				* @example
				* 	$(dataset).on("columnremoved",function(event_, columnName_){
				* 		console.log("column removed: "+columnName_);
				* 	});
				*/
			,columnRemoved : "columnremoved"
				/**
				* 열값이 변경되었을 때 호출됩니다.
				*
				* @event columnvaluechanged
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {String} columnName_ 열명
				* @param {Number} rowIndex_ 행색인
				* @param {Object} columnValue_ 열값
				* @for JGDataset
				* @example
				* 	$(dataset).on("columnvaluechanged",function(event_, columnName_, rowIndex_, columnValue_){
				* 		console.log("column value changed: "+columnName_+","+rowIndex_+","+columnValue_);
				* 	});
				*/
			,columnValueChanged : "columnvaluechanged"
				/**
				* 행이 정령되었을 때 호출됩니다.
				*
				* @event datasetsorted
				* @param {Object} event_ jQuery 이벤트 객체
				* @param {Number} fromRowIndex_ 기존 행색인
				* @param {Number} toRowIndex_ 대상 행색인
				* @for JGDataset
				* @example
				* 	$(dataset).on("datasetsorted",function(event_, fromRowIndex_, toRowIndex_){
				* 		console.log("dataset sorted : "+fromRowIndex_+" > "+toRowIndex_);
				* 	});
				*/
			,datasetSorted : "datasetsorted"
				/**
				* 데이타셋이 다른 데이터로 변경되었을 때 호출됩니다.
				*
				* @event datasetchanged
				* @param {Object} event_ jQuery 이벤트 객체
				* @for JGDataset
				* @example
				* 	$(dataset).on("datasetchanged",function(event_){
				* 		console.log("dataset changed");
				* 	});
				*/
			,datasetChanged : "datasetchanged"
				/**
				* 데이타셋이 전체삭제되었을 때 호출됩니다.
				*
				* @event datasetclear
				* @param {Object} event_ jQuery 이벤트 객체
				* @for JGDataset
				* @example
				* 	$(dataset).on("datasetclear",function(event_){
				* 		console.log("dataset clear");
				* 	});
				*/
			,datasetClear : "datasetclear"
				/**
				* 데이타셋이 초기화되었을 때 호출됩니다
				*
				* @event datasetreset
				* @param {Object} event_ jQuery 이벤트 객체
				* @for JGDataset
				* @example
				* 	$(dataset).on("datasetreset",function(event_){
				* 		console.log("dataset reset");
				* 	});
				*/
			,datasetReset : "datasetreset"
				/**
				* 데이타셋이 현재상태로 적용되었을 때 호출됩니다.
				*
				* @event datasetapply
				* @param {Object} event_ jQuery 이벤트 객체
				* @for JGDataset
				* @example
				* 	$(dataset).on("datasetapply",function(event_){
				* 		console.log("dataset apply");
				* 	});
				*/
			,datasetApply : "datasetapply"
		}
		,rowStatus : {
			normal : 0
			,insert : 1
			,update : 3
		}
	};
	
	var _JGSelector = window.JGSelector = (function(target_, args_){
		if(args_.length === 0) return target_;
		
		var arguments_ = Array.prototype.slice.call(args_);
		var entry_ = target_[arguments_[0]];
		if(entry_ === undefined){
			console.error(arguments_[0]+" is undefined");
			return undefined;
		}else if($.type(entry_) !== "function"){
			console.error(arguments_[0]+" is not function");
			return undefined;
		}else return entry_.apply(target_,arguments_.slice(1));
	});
	
	/**
	* 데이타 제어를 보다 편리하게 하기 위한 확장함수입니다.
	*
	* @class global.extension
	*/

	/**
	 * 객체의 Null여부를 체크합니다.
	 * 
	 * @method isNull
	 * @param {Object} value_ 값
	 * @return {Boolean} Null여부
	 * @example
	 * 	var result_ = isNull(value_);
	 */
	window.isNull = (function(value_){
		return (value_ === undefined || value_ === null);
	});
	
	/**
	 * 객체의 Null여부를 체크하여 Null일 경우 대체값을 반환합니다.
	 * 
	 * @method NVL
	 * @param {Object} value_ 값
	 * @param {Object} nullValue_ Null 대체값
	 * @return {Object} 원본값 또는 Null 대체값
	 * @example
	 * 	var result_ = NVL(value_, nullValue_);
	 */
	window.NVL = (function(value_,nullValue_){
		return NVL2(value_,value_,nullValue_); 
	});
	
	/**
	 * 객체의 Null여부를 체크하여 Null일 경우 Null 대체값을 반환하고 Null이 아닐 경우 Not-Null 대체값을 반환합니다.
	 * 
	 * @method NVL2
	 * @param {Object} value_ 값
	 * @param {Object} replaceValue_ Not-null 대체값
	 * @param {Object} nullValue_ Null 대체값
	 * @return {Object} Not-null 대체값 또는 Null 대체값
	 * @example
	 * 	var result_ = NVL2(value_,replaceValue_,nullValue_);
	 */
	window.NVL2 = (function(value_,replaceValue_,nullValue_){
		return (!isNull(value_) ? replaceValue_ : nullValue_); 
	});
	
	/**
	 * 문자열의 빈값여부를 체크합니다.
	 * 
	 * @method isBlank
	 * @param {String} value_ 문자열값
	 * @return {Boolean} 빈값여부
	 * @example
	 * 	var result_ = isBlank(value_);
	 */
	window.isBlank = (function(value_){
		return (isNull(value_) || value_.length === 0);
	});
	
	/**
	 * 문자열이 빈값일 경우 대체값으로 반환합니다.
	 * 
	 * @method BLK
	 * @param {String} value_ 문자열값
	 * @param {String} blkValue_ 대체문자열값
	 * @return {String} 원본값 또는 대체값
	 * @example
	 * 	var result_ = isBlank(value_, blkValue_);
	 */
	window.BLK = (function(value_, blkValue_){
		return isBlank(value_) ? (blkValue_ === undefined ? "" : blkValue_) : value_;
	});
	
	/**
	 * 배열에서 객체의 색인을 찾아서 반환합니다.
	 * 
	 * @method Array.prototype.indexOf
	 * @param {Object} object_ 객체
	 * @return {number} 색인
	 * @example
	 * 	var array_ = new Array();
	 * 	array_.push(something...);
	 * 	var result_ = array_.indexOf(object_);
	 */
	Array.prototype.indexOf = (function(object_){
		var count_ = this.length;
		for(var index_=0;index_<count_;++index_){
			if(this[index_] === object_){
				return index_;
			}
		}
		return -1;
	});
	
	/**
	 * 객체를 해당 색인에 삽입합니다.
	 * 
	 * @method Array.prototype.insert
	 * @param {Object} object_ 객체
	 * @param {number} index_ 색인
	 */
	Array.prototype.insert = (function(object_,index_){
		this.splice(index_,0,object_);
	});
	/**
	 * 배열에서 해당 색인의 객체를 삭제합니다.
	 * 
	 * @method Array.prototype.remove
	 * @param {number} index_ 색인
	 */
	Array.prototype.remove = (function(index_){
		this.splice(index_,1);
	});
	/**
	 * 배열의 모든 객체를 삭제합니다.
	 * 
	 * @method Array.prototype.removeAll
	 */
	Array.prototype.removeAll = (function(){
		this.splice(0,this.length);
	});
	/**
	 * 배열에서 해당객체를 삭제합니다.
	 * 
	 * @method Array.prototype.removeObject
	 * @param {Object} object_ 객체
	 */
	Array.prototype.removeObject = (function(object_){
		this.remove(this.indexOf(object_));
	});
	
	/**
	 * 배열에서 색인간이동 합니다.
	 * 
	 * @method Array.prototype.move
	 * @param {Number} oIndex_ 기존 색인
	 * @param {Number} nIndex_ 대상 색인
	 */
	Array.prototype.move = function (oIndex_, nIndex_){
		var temp_ = this[oIndex_];
		this[oIndex_] = this[nIndex_];
		this[nIndex_] = temp_;
	};
	
	/**
	 * JGDataset에 열정의 시 생성되는 객체입니다.<br>
	 * 사용자가 임의로 생성할 수 없으며 JGDataset을 통해서만 생성할 수 있습니다.<br>
	 * *참고 : {{#crossLink "JGDataset"}}{{/crossLink}}
	 * 
	 * @class JGDatasetColumn
	 * @constructor
	 * @param {String} columnName_ 열명
	 */
	/**
	 * 열명
	 * @property _name
	 * @type String
	 */
	/**
	 * 키여부
	 * @property _isKey
	 * @type boolean
	 */
	var JGDatasetColumn = (function(columnName_){
		this._name = columnName_.toUpperCase();
		this._isKey = false;
	});
	
	/**
	 * 열명을 반환합니다
	 * 
	 * @method getName
	 * @return {String} 
	 */
	JGDatasetColumn.prototype.getName = (function(){
		return this._name;
	});
	
	/**
	 * 키여부를 반환/설정합니다<br>
	 * *매개변수가 존재한다면 설정, 존재하지 않는다면 반환
	 * 
	 * @method isKey
	 * @param {Boolean} [isKey_] 키여부
	 * @return {Boolean} 키여부
	 */
	JGDatasetColumn.prototype.isKey = (function(isKey_){
		if(isKey_ !== undefined) this._isKey = isKey_;
		return this._isKey; 
	});
	
	/**
	 * 열을 복제합니다
	 * 
	 * @method clone
	 * @return {JGDatasetColumn} 열
	 */
	JGDatasetColumn.prototype.clone = (function(){
		var copy_ = new JGDatasetColumn(this._name);
		copy_._isKey = this._isKey;
		return copy_;
	});
	
	/**
	 * JGDataset에 행정의 시 생성되는 객체입니다.<br>
	 * 사용자가 임의로 생성할 수 없으며 JGDataset을 통해서만 생성할 수 있습니다.<br>
	 * *참고 : {{#crossLink "JGDataset"}}{{/crossLink}}
	 * 
	 * 	//행상태
	 * 		0  // normal
	 * 		1  // insert
	 * 		3  // delete
	 * 
	 * @class JGDatasetRow
	 * @constructor
	 */
	/**
	 * 열값
	 * @property _columns
	 * @type JSON
	 * @private
	 */
	/**
	 * 원본 열값
	 * @property _orgColumns
	 * @type JSON
	 * @private
	 */
	/**
	 * 열상태
	 * @property _columnStatus
	 * @type JSON
	 * @private
	 */
	/**
	 * 행상태<br>
	 * 
	 * @property _rowStatus
	 * @type Number
	 * @private
	 */
	var JGDatasetRow = (function(){
		this._columns = {};
		this._orgColumns = {};
		this._columnStatus = {};
		this._rowStatus = _JGKeyword.rowStatus.normal;
	});
	
	/**
	 * 행상태를 반환합니다
	 * 
	 * @method getRowStatus
	 * @return {Number} 행상태
	 */
	JGDatasetRow.prototype.getRowStatus = (function(){
		return this._rowStatus;
	});
	/**
	 * 행상태를 설정합니다
	 * 
	 * @method getRowStatus
	 * @param {Number} rowStatus_ 행상태
	 */
	JGDatasetRow.prototype.setRowStatus = (function(rowStatus_){
		this._rowStatus = rowStatus_;
	});
	
	JGDatasetRow.prototype._updateRowStatus = (function(){
		if(this._rowStatus === _JGKeyword.rowStatus.insert) return;
		var didUpdate_ = false;
		for(var columnName_ in this._columnStatus){
			if(NVL(this._columnStatus[columnName_], false)){
				didUpdate_ = true;
				break;
			}
		}
		this._rowStatus = (didUpdate_ ? _JGKeyword.rowStatus.update : _JGKeyword.rowStatus.normal);
	});
	/**
	 * 열값을 설정합니다.
	 * 
	 * @method setColumn
	 * @param {String} columnName_ 열명
	 * @param {Object} value_ 열값
	 * @param {Boolean} isModify_ 수정여부
	 */
	JGDatasetRow.prototype.setColumn = (function(columnName_, value_, isModify_){
		columnName_ = columnName_.toUpperCase();
		this._columns[columnName_] = value_;
		
		//check modified
		if(isNull(isModify_)){
			this._columnStatus[columnName_] = (this._orgColumns[columnName_] !== value_);
		}else{
			this._columnStatus[columnName_] = isModify_;
		}
		this._updateRowStatus();
	});
	/**
	 * 열을 삭제합니다.
	 * 
	 * @method removeColumn
	 * @param {String} columnName_ 열명
	 */
	JGDatasetRow.prototype.removeColumn = (function(columnName_){
		delete this._columns[columnName_.toUpperCase()];
	});
	/**
	 * 열값을 반환합니다.
	 * 
	 * @method getColumnValue
	 * @param {String} columnName_ 열명
	 * @return {Object} 열값
	 */
	JGDatasetRow.prototype.getColumnValue = (function(columnName_){
		return this._columns[columnName_.toUpperCase()];
	});
	
	/**
	 * 열 수정여부를 반환합니다.
	 * 
	 * @method isColumnModified
	 * @param {String} columnName_ 열명
	 * @return {Boolean} 열수정여부
	 */
	JGDatasetRow.prototype.isColumnModified = (function(columnName_){
		var isModified_ = this._columnStatus[columnName_.toUpperCase()];
		return NVL2(isModified_,false,isModified_);
	});
	
	/**
	 * 열 수정여부를 설정합니다.
	 * 
	 * @method setColumnModification
	 * @param {String} columnName_ 열명
	 * @param {Boolean} bool_ 열수정여부
	 */
	JGDatasetRow.prototype.setColumnModification = (function(columnName_, bool_){
		this._columnStatus[columnName_.toUpperCase()] = bool_;
	});
	
	/**
	 * 현재 행상태를 적용합니다.<br>
	 * 행상태가 normal로 변경됩니다.
	 * 
	 * @method apply
	 */
	JGDatasetRow.prototype.apply = (function(){
		this._orgColumns = JSON.parse(JSON.stringify(this._columns));
		this._rowStatus = _JGKeyword.rowStatus.normal;
		this._columnStatus = {};
	});
	
	/**
	 * 행을 복사합니다.
	 * 
	 * @method clone
	 * @return JGDatasetRow
	 */
	JGDatasetRow.prototype.clone = (function(){
		var copy_ = new JGDatasetRow();
		copy_._columns = $.extend(true,{},this._columns);
		copy_._orgColumns = $.extend(true,{},this._orgColumns);
		copy_._columnStatus = $.extend(true,{},this._columnStatus);
		copy_._rowStatus = this._rowStatus;
		return copy_;
	});

	/**
	 * JGDataset은 행열단위 작업을 보다 편리하게 할 수 있도록 합니다.<br>
	 * 아래는 JGDataset의 JSON 포맷입니다.
	 * 
	 * 	1. 스키마 포함 JSON 포맷
	 * 		{"columninfo":
	 * 			[{"name":"열1","isKey":false}
	 * 			,{"name":"열2","isKey":false}]
	 * 		,"rowdata":
	 * 			[{"row":{"열1":{"value":"열값"}
	 * 				,"열2":{"value":"열값"}}
	 * 			,"status":0}
	 * 			,{"row":{"열1":{"value":"열값"}
	 * 				,"열2":{"value":"열값"}}
	 * 			,"status":0}
	 * 			,...]
	 * 		,"deletedRowdata":
	 * 			[{"row":{"열1":{"value":"열값"}
	 * 				,"열2":{"value":"열값"}}}
	 * 			,...]
	 * 		}
	 * 	
	 * 	2. 스키마 미포함 JSON 포맷
	 * 		[{열1 : 열값, 열2 : 열값, ... }
	 * 		,{열1 : 열값, 열2 : 열값, ... }
	 * 		,...]
	 * 
	 * JGDataset 샘플은 <a href="http://kimbobv22.github.io/JGDataset/index.html" target="_blank">여기</a>에서 확인할 수 있습니다.
	 * 
	 * @class JGDataset
	 * @constructor
	 * @param {Object} [content_] 데이타
	 * @example
	 * 	var dataset_ = new JGDataset([{열1: "열값", 열2 : "열값"}]);
	 */
	/**
	 * 열정보
	 * @property _columnInfo
	 * @type Array
	 */
	/**
	 * 원본열정보<br>
	 * 데이타셋을 적용한 시점의 열정보가 이곳에 저장됩니다. 
	 * @property _orgColumnInfo
	 * @type Array
	 */
	/**
	 * 행정보<br>
	 * @property _rowData
	 * @type Array
	 */
	/**
	 * 원본행정보<br>
	 * 데이타셋을 적용한 시점의 행정보가 이곳에 저장됩니다.
	 * @property _orgRowData
	 * @type Array
	 */
	/**
	 * 삭제행정보<br>
	 * 삭제한 행정보가 이곳에 저장됩니다.
	 * @property _deletedRowData
	 * @type Array
	 */
	var JGDataset = window.JGDataset = (function(content_){
		this._columnInfo = new Array();
		this._orgColumnInfo = new Array();
		this._rowData = new Array();
		this._orgRowData = new Array();
		this._deletedRowData = new Array();
		
		$(this).on(_JGKeyword.trigger._rowInserted,function(event_, rowIndex_, fireEvent_){
			if(fireEvent_) $(this).trigger(_JGKeyword.trigger.rowInserted,[rowIndex_]);
		});
		$(this).on(_JGKeyword.trigger._rowRemoved,function(event_, rowIndex_){
			$(this).trigger(_JGKeyword.trigger.rowRemoved,[rowIndex_]);
		});
		$(this).on(_JGKeyword.trigger._columnAdded, function(event_, columnName_){
			$(this).trigger(_JGKeyword.trigger.columnAdded,[columnName_]);
		});
		$(this).on(_JGKeyword.trigger._rowMoved, function(event_, fromRowIndex_, toRowIndex_, fireEvent_){
			if(fireEvent_){$(this).trigger(_JGKeyword.trigger.rowMoved,[fromRowIndex_, toRowIndex_]);}
		});
		$(this).on(_JGKeyword.trigger._columnRemoved, function(event_, columnName_){
			$(this).trigger(_JGKeyword.trigger.columnRemoved,[columnName_]);
		});
		$(this).on(_JGKeyword.trigger._columnValueChanged,function(event_, columnName_, rowIndex_,fireEvent_){
			if(fireEvent_) $(this).trigger(_JGKeyword.trigger.columnValueChanged,[columnName_,rowIndex_]);
		});
		
		$(this).on(_JGKeyword.trigger._datasetSorted, function(event_, startRowIndex_, endRowIndex_, fireEvent_){
			if(fireEvent_){$(this).trigger(_JGKeyword.trigger.datasetSorted,[startRowIndex_, endRowIndex_]);}
		});
		$(this).on(_JGKeyword.trigger._datasetClear, function(event_, fireEvent_){
			if(fireEvent_){$(this).trigger(_JGKeyword.trigger.datasetClear);}
		});
		$(this).on(_JGKeyword.trigger._datasetReset,function(event_, fireEvent_){
			if(fireEvent_) $(this).trigger(_JGKeyword.trigger.datasetReset);
		});
		$(this).on(_JGKeyword.trigger._datasetApply,function(event_, fireEvent_){
			if(fireEvent_) $(this).trigger(_JGKeyword.trigger.datasetApply);
		});
		$(this).on(_JGKeyword.trigger._datasetChanged,function(event_, fireEvent_){
			if(fireEvent_) $(this).trigger(_JGKeyword.trigger.datasetChanged);
		});
		
		/*
		 * initialize JGDataset
		 */
		if(!isNull(content_)){
			this.applyJSON(content_);
		}
	});
	
	/**
	 * 데이타셋의 JGDS에 저장된 이름을 반환합니다.
	 * 
	 * @method getName
	 * @return {String} 데이타셋이름
	 */
	JGDataset.prototype.getName = (function(){
		return JGDS("datasetName",this);
	});
	
	JGDataset.prototype._convertColumnKeyToName = (function(columnKey_){
		return ($.type(columnKey_) === "number" ? this.getColumn(columnKey_).getName() : columnKey_.toUpperCase());
	});
	JGDataset.prototype._convertColumnKeyToIndex = (function(columnKey_){
		return ($.type(columnKey_) === "number" ? columnKey_ : this.indexOfColumn(columnKey_));
	});
	
	/**
	 * 열갯수를 반환합니다.
	 * 
	 * @method getColumnCount
	 * @return {Number} 열갯수
	 */
	JGDataset.prototype.getColumnCount = (function(){
		return this._columnInfo.length;
	});
	/**
	 * 행갯수를 반환합니다.
	 * 
	 * @method getRowCount
	 * @return {Number} 행갯수
	 */
	JGDataset.prototype.getRowCount = (function(){
		return this._rowData.length;
	});
	/**
	 * 삭제행갯수를 반환합니다.
	 * 
	 * @method getDeletedRowCount
	 * @return {Number} 삭제행갯수
	 */
	JGDataset.prototype.getDeletedRowCount = (function(){
		return this._deletedRowData.length;
	});

	/**
	 * 열을 특정색인에 삽입합니다.<br>
	 * 
	 * @method insertColumn
	 * @param {String} columnName_ 열명
	 * @param {Number} columnIndex_ 삽입열색인
	 * @param {Boolean} [fireEvent_] 이벤트발생여부(기본 : true)
	 * @return {JGDatasetColumn} 열
	 */
	JGDataset.prototype.insertColumn = (function(columnName_,columnIndex_,fireEvent_){
		var column_ = new JGDatasetColumn(columnName_);
		this._columnInfo[columnIndex_] = column_; 

		var rowCount_ = this._rowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this._rowData[rowIndex_];
			rowItem_.setColumn(columnName_, null);
		}
		
		rowCount_ = this._deletedRowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this._deletedRowData[rowIndex_];
			rowItem_.setColumn(columnName_, null);
		}
		
		if(NVL(fireEvent_,true)){
			$(this).trigger(_JGKeyword.trigger._columnAdded,[column_.getName()]);
		}
		
		return column_;
	});
	/**
	 * 열을 마지막 색인에 추가합니다.
	 * 
	 * @method addColumn
	 * @param {String} columnName_ 열명
	 * @param {Boolean} [fireEvent_] 이벤트발생여부(기본 : true)
	 * @return {JGDatasetColumn} 열
	 */
	JGDataset.prototype.addColumn = (function(columnName_, fireEvent_){
		return this.insertColumn(columnName_, this._columnInfo.length, fireEvent_);
	});
	/**
	 * 열 마지막 색인에 복수의 열을 추가합니다.
	 * 
	 * @method addColumns
	 * @param {String} columnName_* 복수의 열
	 * @example
	 * 	dataset_.addColumns("열1","열2","열3",...);
	 */
	JGDataset.prototype.addColumns = (function(){
		var count_ = arguments.length;
		for(var index_=0;index_<count_;++index_){
			this.addColumn(arguments[index_]);
		}
	});
	/**
	 * 열을 삭제합니다.
	 * 
	 * @method removeColumn
	 * @param {Object} columnKey_ 열색인 또는 열명
	 */
	JGDataset.prototype.removeColumn = (function(columnKey_){
		columnKey_ = this._convertColumnKeyToIndex(columnKey_);
		
		var columnName_ = this.getColumn(columnKey_).getName();
		this._columnInfo.splice(columnKey_,1);
		$(this).trigger(_JGKeyword.trigger._columnRemoved,[columnName_]);
	});
	
	/**
	 * 열을 반환합니다.
	 * 
	 * @method getColumn
	 * @param {Object} columnKey_ 열색인 또는 열명
	 */
	JGDataset.prototype.getColumn = (function(columnKey_){
		columnKey_ = this._convertColumnKeyToIndex(columnKey_);
		return this._columnInfo[columnKey_];
	});
	
	/**
	 * 열의 색인을 반환합니다
	 * 
	 * @method indexOfColumn
	 * @param {String} columnName_ 열명
	 */
	JGDataset.prototype.indexOfColumn = (function(columnName_){
		var count_ = this._columnInfo.length;
		for(var columnIndex_=0;columnIndex_<count_;++columnIndex_){
			if(this._columnInfo[columnIndex_].getName() === columnName_.toUpperCase()){
				return columnIndex_;
			}
		}
		return -1;
	});
	
	JGDataset.prototype._createRow = (function(rowStatus_){
		var rowItem_ = new JGDatasetRow();
		rowItem_.setRowStatus(rowStatus_);
		
		var columnCount_ = this._columnInfo.length;
		for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			var columnItem_ = this._columnInfo[columnIndex_];
			rowItem_.setColumn(columnItem_.getName(), null);
		}
		return rowItem_;
	});
	JGDataset.prototype._insertRow = (function(rowIndex_){
		var rowItem_ = this._createRow(_JGKeyword.rowStatus.insert);
		this._rowData.insert(rowItem_, rowIndex_);
		return rowItem_;
	});
	
	/**
	 * 행을 특정 색인에 삽입합니다.
	 * 
	 * @method insertRow
	 * @param {Number} rowIndex_ 행색인
	 * @return {JGDatasetRow} 행
	 */
	JGDataset.prototype.insertRow = (function(rowIndex_){
		return this._insertRow(rowIndex_);
		$(this).trigger(_JGKeyword.trigger._rowInserted,[rowIndex_,true]);
	});
	/**
	 * 행을 마지막 색인에 추가합니다.
	 * 
	 * @method addRow
	 * @return {Number} 행색인
	 */
	JGDataset.prototype.addRow = (function(){
		var rowIndex_ = this._rowData.length;
		this.insertRow(rowIndex_);
		return rowIndex_;
	});
	/**
	 * 마지막 색인에 복수의 열을 추가합니다.
	 * 
	 * @method addRows
	 * @param {Number} count_ 행갯수
	 * @example
	 * 	dataset_.addRows(5);
	 */
	JGDataset.prototype.addRows = (function(count_){
		for(var rowIndex_=0;rowIndex_<count_;++rowIndex_){
			this.addRow();
		}
	});
	JGDataset.prototype._removeRow = (function(rowIndex_){
		var rowItem_ = this.getRow(rowIndex_);
		switch(rowItem_.getRowStatus()){
			case _JGKeyword.rowStatus.normal:
			case _JGKeyword.rowStatus.update:
				this._deletedRowData.push(rowItem_);
				break;
			case _JGKeyword.rowStatus.insert:
			default:
				break;
		}
		
		this._rowData.remove(rowIndex_);
	});
	/**
	 * 특정색인의 행을 삭제합니다.
	 * 
	 * @method removeRow
	 * @param {Number} rowIndex_ 행색인
	 */
	JGDataset.prototype.removeRow = (function(rowIndex_){
		this._removeRow(rowIndex_);
		$(this).trigger(_JGKeyword.trigger._rowRemoved,[rowIndex_]);
	});
	/**
	 * 행을 반환합니다.
	 * 
	 * @method getRow
	 * @param {Number} rowIndex_ 행색인
	 * @return {JGDatasetRow} 행
	 */
	JGDataset.prototype.getRow = (function(rowIndex_){
		return this._rowData[rowIndex_];
	});
	/**
	 * 행상태를 설정합니다.
	 * 
	 * @method setRowStatus
	 * @param {Number} rowIndex_ 행색인
	 * @param {Number} rowStatus_ 행상태
	 */
	JGDataset.prototype.setRowStatus = (function(rowIndex_, rowStatus_){
		this.getRow(rowIndex_).setRowStatus(rowStatus_); 
	});
	/**
	 * 행상태를 반환합니다.
	 * 
	 * @method getRowStatus
	 * @param {Number} rowIndex_ 행색인
	 * @return {Number} 행상태
	 */
	JGDataset.prototype.getRowStatus = (function(rowIndex_){
		return this.getRow(rowIndex_).getRowStatus(); 
	});
	/**
	 * 삭제행을 반환합니다.
	 * 
	 * @method getDeletedRow
	 * @param {Number} rowIndex_ 삭제행색인
	 * @return {JGDatasetRow} 행
	 */
	JGDataset.prototype.getDeletedRow = (function(rowIndex_){
		return this._deletedRowData[rowIndex_];
	});
	
	/**
	 * 행간 이동을 수행합니다.
	 * 
	 * @method moveRow
	 * @param {Number} fromIndex_ 기존 행색인
	 * @param {Number} toIndex_ 대상 행색인
	 */
	JGDataset.prototype.moveRow = (function(fromIndex_, toIndex_, fireEvent_){
		this._rowData.move(fromIndex_, toIndex_);
		$(this).trigger(_JGKeyword.trigger._rowMoved,[fromIndex_, toIndex_, NVL(fireEvent_, true)]);
	});
	
	/**
	 * 특정 열값과 정렬함수를 통해 행을 정렬합니다.
	 * 
	 * @method sortRow
	 * @param {Number} columnKey_ 기준 열
	 * @param {Function} sortFunc_ 정렬함수
	 * @param {Boolean} [fireEvent_] 이벤트발생여부(기본 : true)
	 * @example
	 * 	dataset_.sortRow("열1",function(bColumnValue_, columnValue_){
	 * 		return bColumnValue_ > columnValue_;
	 * 	});
	 */
	JGDataset.prototype.sortRow = (function(columnKey_, sortFunc_, fireEvent_){
		var rowCount_ = this.getRowCount();
		var temp_ = null;
		
		var didSort_ = false;
		var startIndex_ = rowCount_-1;
		var endIndex_ = 0;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			for(var tRowIndex_=0;tRowIndex_<rowCount_;++tRowIndex_){
				var columnValue_ = this.getColumnValue(columnKey_, rowIndex_);
				var tColumnValue_ = this.getColumnValue(columnKey_, tRowIndex_);
					
				if(sortFunc_.apply(this,[columnValue_, tColumnValue_])){
					didSort_ = true;
					if(rowIndex_ < startIndex_) startIndex_= rowIndex_;
					if(tRowIndex_ > endIndex_) endIndex_ = tRowIndex_;
					
					temp_ = this._rowData[rowIndex_];
					this._rowData[rowIndex_] = this._rowData[tRowIndex_];
					this._rowData[tRowIndex_] = temp_;
				}
			}
		}
		
		if(didSort_){
			$(this).trigger(_JGKeyword.trigger._datasetSorted,[startIndex_,endIndex_,NVL(fireEvent_, true)]);
		}
	});
	
	/**
	 * 특정 열을 통해 행을 오름차순으로 정렬합니다.
	 * 
	 * @method sortRowByAsc
	 * @param {Number} columnKey_ 기준 열
	 */
	JGDataset.prototype.sortRowByAsc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return bColumnValue_ < columnValue_;
		});
	});
	/**
	 * 특정 열을 통해 행을 내림차순으로 정렬합니다.
	 * 
	 * @method sortRowByDesc
	 * @param {Number} columnKey_ 기준 열
	 */
	JGDataset.prototype.sortRowByDesc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return columnValue_ < bColumnValue_;
		});
	});
	
	JGDataset.prototype._setColumnValue = (function(columnKey_, rowIndex_, value_, mergeColumn_, fireEvent_){
		if($.type(columnKey_) === "number"){
			var columnItem_ = this.getColumn(columnKey_);
			columnKey_ = columnItem_.getName();
		}else{
			var columnIndex_ = this.indexOfColumn(columnKey_);
			if(columnIndex_ < 0){
				if(!NVL(mergeColumn_,false)) console.error("not exists column ["+columnKey_+"]");
				else this.addColumn(columnKey_, fireEvent_);
			}
		}
		
		var rowItem_ = this.getRow(rowIndex_);
		rowItem_.setColumn(columnKey_, value_);
	});
	/**
	 * 열값을 설정합니다.
	 * 
	 * @method setColumnValue
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Number} rowIndex_ 행색인
	 * @param {Object} value_ 열값
	 * @param {Boolean} [mergeColumn_] 열이 존재하지 않을 경우 생성할지에 대한 여부(기본 : false)
	 */
	JGDataset.prototype.setColumnValue = (function(columnKey_, rowIndex_, value_, mergeColumn_){
		columnKey_ = this._convertColumnKeyToName(columnKey_);
		
		var currentValue_ = this.getColumnValue(columnKey_, rowIndex_);
		this._setColumnValue(columnKey_, rowIndex_, value_, mergeColumn_);
		if(currentValue_ !== value_){
			$(this).trigger(_JGKeyword.trigger._columnValueChanged,[columnKey_,rowIndex_,true]);
		}
	});
	/**
	 * 복수의 열값을 설정합니다.
	 * 
	 * @method setColumnValues
	 * @param {Object} valueMap_ 복수의 열값
	 * @param {Number} rowIndex_ 행색인
	 * @param {Boolean} [mergeColumn_] 열이 존재하지 않을 경우 생성할지에 대한 여부(기본 : false)
	 * @example
	 * 	dataset_.setColumnValues({
	 * 		열1 : "열값"
	 * 		열2 : "열값"
	 * 	},0);
	 */
	JGDataset.prototype.setColumnValues = (function(valueMap_, rowIndex_, mergeColumn_){
		for(var columnKey_ in valueMap_){
			this.setColumnValue(columnKey_, rowIndex_, valueMap_[columnKey_], mergeColumn_);
		}
	});
	/**
	 * 열값을 반환합니다.
	 * 
	 * @method getColumnValue
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Number} rowIndex_ 행색인
	 * @return {Object} 열값
	 */
	JGDataset.prototype.getColumnValue = (function(columnKey_, rowIndex_){
		return this.getRow(rowIndex_).getColumnValue(this._convertColumnKeyToName(columnKey_));
	});
	/**
	 * 열의 수정여부를 반환합니다.
	 * 
	 * @method isColumnModified
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Number} rowIndex_ 행색인
	 * @return {Boolean} 열의 수정여부
	 */
	JGDataset.prototype.isColumnModified = (function(columnKey_, rowIndex_){
		return this.getRow(rowIndex_).isColumnModified(this._convertColumnKeyToName(columnKey_));
	});
	/**
	 * 삭제된 행의 열값을 반환합니다.
	 * 
	 * @method getDeletedColumnValue
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Number} rowIndex_ 행색인
	 * @return {Object} 열값
	 */
	JGDataset.prototype.getDeletedColumnValue = (function(columnKey_, rowIndex_){
		return this.getDeletedRow(rowIndex_).getColumnValue(this._convertColumnKeyToName(columnKey_));
	});
	
	/**
	 * 데이타셋을 전체삭제합니다.
	 * 
	 * @method clear
	 * @param {Boolean} [deleteColumn_] 열 삭제여부 - true일 경우, 모드 열정보가 삭제됩니다.(기본 : true)
	 */
	JGDataset.prototype.clear = (function(deleteColumn_){
		if(NVL(deleteColumn_, true)){
			this._columnInfo = new Array();
		}
		this._rowData = new Array();
		this._deletedRowData = new Array();
		
		$(this).trigger(_JGKeyword.trigger._datasetClear, [NVL(arguments[1], true)]);
	});
	/**
	 * 데이타셋의 현재상태를 적용합니다.<br>
	 * 현재상태를 적용 시, 모든 행상태는 normal로, 모든 열수정여부는 false로 설정되며 적용 시점까지 열,행 데이터가 저장됩니다.
	 * 
	 * @method apply
	 * @param {Boolean} [fireEvent_] 이벤트발생여부(기본 : true)
	 */
	JGDataset.prototype.apply = (function(fireEvent_){
		this._orgRowData = new Array();
		this._orgColumnInfo = new Array();
		
		var rowCount_ = this._rowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this.getRow(rowIndex_);
			rowItem_.apply();
			this._orgRowData.push(rowItem_.clone());
		}
		
		var colCount_ = this._columnInfo.length;
		for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
			this._orgColumnInfo.push(this.getColumn(colIndex_).clone());
		}
		
		this._deletedRowData = new Array();
		
		$(this).trigger(_JGKeyword.trigger._datasetApply, [NVL(fireEvent_, true)]);
	});
	/**
	 * 데이타셋의 이전 적용시점으로 되돌립니다.
	 * 
	 * @method reset
	 * @param {Boolean} [fireEvent_] 이벤트발생여부(기본 : true)
	 */
	JGDataset.prototype.reset = (function(fireEvent_){
		this._columnInfo = new Array();
		this._rowData = new Array();
		
		var rowCount_ = this._orgRowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			this._rowData.push(this._orgRowData[rowIndex_].clone());
		}
		
		var colCount_ = this._orgColumnInfo.length;
		for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
			this._columnInfo.push(this._orgColumnInfo[colIndex_].clone());
		}
		
		this._deletedRowData = new Array();
		$(this).trigger(_JGKeyword.trigger._datasetReset, [NVL(fireEvent_, true)]);
	});
	
	/**
	 * 데이타셋의 수정여부를 반환합니다.
	 * 
	 * @method isModified
	 * @return {Boolean} 수정여부
	 */
	JGDataset.prototype.isModified = (function(){
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(this.getRowStatus(rowIndex_) !== _JGKeyword.rowStatus.normal){
				return true;
			}
		}
		
		return false;
	});
	
	/**
	 * 열값의 합계값을 반환합니다.
	 * 
	 * @method sumOfColumnValues
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Function} [filterFunc_] 여과함수(기본 : function(){return true;})
	 * @return {Number} 합계값
	 */
	JGDataset.prototype.sumOfColumnValues = (function(columnKey_, filterFunc_){
		var sum_ = 0;
		var rowCount_ = this.getRowCount();
		var columnItem_ = this.getColumn(columnKey_);
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(NVL2(filterFunc_,filterFunc_,function(){return true;})(columnItem_.getName(), rowIndex_)){
				var columnValue_ = this.getColumnValue(columnItem_.getName(), rowIndex_);
				sum_ += (isNull(columnValue_) || isNaN(columnValue_) ? 0 : new Number(columnValue_));
			}
		}
		
		return sum_;
	});
	/**
	 * 열값의 평균값을 반환합니다.
	 * 
	 * @method avgOfColumnValues
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Function} [filterFunc_] 여과함수(기본 : function(){return true;})
	 * @return {Number} 평균값
	 */
	JGDataset.prototype.avgOfColumnValues = (function(columnKey_, filterFunc_){
		var sum_ = this.sumOfColumnValues(columnKey_, filterFunc_);
		var rowCount_ = this.getRowCount();
		var avg_ = (sum_/rowCount_);
		
		return isNaN(avg_) ? 0 : avg_;
	});
	JGDataset.prototype._calcOfColumnValues = (function(columnKey_, calcChar_,filterFunc_){
		var columnValue_ = undefined;
		var rowCount_ = this.getRowCount();
		var columnItem_ = this.getColumn(columnKey_);
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var tColumnValue_ = this.getColumnValue(columnItem_.getName(),rowIndex_);
			if(isNull(tColumnValue_) || isNaN(tColumnValue_) || !NVL2(filterFunc_,filterFunc_,function(){return true;})(columnItem_.getName(), rowIndex_)) continue;
			
			if(isNull(columnValue_)
					|| new Function("return ("+columnValue_+calcChar_+tColumnValue_+");").apply(this)){
				columnValue_ = tColumnValue_;
			}
		}
		
		return columnValue_;
	});
	
	/**
	 * 열값의 최대값을 반환합니다.
	 * 
	 * @method maxOfColumnValues
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Function} [filterFunc_] 여과함수(기본 : function(){return true;})
	 * @return {Number} 최대값
	 */
	JGDataset.prototype.maxOfColumnValues = (function(columnKey_, filterFunc_){
		return this._calcOfColumnValues(columnKey_, "<", filterFunc_);
	});
	/**
	 * 열값의 최소값을 반환합니다.
	 * 
	 * @method minOfColumnValues
	 * @param {Object} columnKey_ 열색인 또는 열명
	 * @param {Function} filterFunc_ 여과함수(기본 : null)
	 * @return {Number} 최대값
	 */
	JGDataset.prototype.minOfColumnValues = (function(columnKey_, filterFunc_){
		return this._calcOfColumnValues(columnKey_, ">", filterFunc_);
	});

	/**
	 * 데이타셋을 JSON객체로 반환합니다.
	 * 
	 * @method toJSON
	 * @param {Boolean} [onlyData_] true일 경우 스키마를 생략한 행과 열값의 정보만 추출합니다.(기본 : false)
	 * @return {Object} JSON객체
	 */
	JGDataset.prototype.toJSON = (function(onlyData_){
		if(NVL(onlyData_,false)){
			var array_ = new Array();
			
			var rowCount_ = this._rowData.length;
			var columnCount_ = this._columnInfo.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = this._rowData[rowIndex_];
				var row_ = {};
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this._columnInfo[columnIndex_];
					row_[columnItem_.getName()] = rowItem_.getColumnValue(columnItem_.getName());
				}
				array_.push(row_);
			}
			
			return array_;
			
		}else{
			var root_ = {};
			
			//make column info
			var columnInfo_ = new Array(); 
			var columnCount_ = this._columnInfo.length;
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var columnItem_ = this._columnInfo[columnIndex_];
				
				var columnJSON_ = {};
				columnJSON_[_JGKeyword.key.name] = columnItem_.getName();
				columnJSON_[_JGKeyword.key.isKey] = columnItem_.isKey();
				columnInfo_[columnIndex_] = columnJSON_;
			}
			root_[_JGKeyword.key.columnInfo] = columnInfo_;
			
			//make row data
			var rowData_ = new Array();
			var rowCount_ = this._rowData.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = this._rowData[rowIndex_];
				var row_ = {};
				var columns_ = {};
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this._columnInfo[columnIndex_];
					
					var columnJSON_ = {};
					columnJSON_[_JGKeyword.key.value] = this.getColumnValue(columnItem_.getName(), rowIndex_);
					columnJSON_[_JGKeyword.key.modify] = rowItem_.isColumnModified(columnItem_.getName());
					columns_[columnItem_.getName()] = columnJSON_;
				}
				
				row_[_JGKeyword.key.row] = columns_;
				row_[_JGKeyword.key.rowStatus] = rowItem_.getRowStatus();
				rowData_[rowIndex_] = row_;
			}
			root_[_JGKeyword.key.rowData] = rowData_;
			
			//make deleted row data
			var deletedRowData_ = new Array();
			rowCount_ = this._deletedRowData.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = this._rowData[rowIndex_];
				var row_ = {};
				var columns_ = {};
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this._columnInfo[columnIndex_];
					var columnValue_ = this.getDeletedColumnValue(columnItem_.getName(), rowIndex_);
					
					var columnJSON_ = {};
					columnJSON_[_JGKeyword.key.value] = columnValue_;
					columns_[columnItem_.getName()] = columnJSON_;
				}
				row_[_JGKeyword.key.row] = columns_;
				deletedRowData_[rowIndex_] = row_;
			}
			root_[_JGKeyword.key.deletedRowData] = deletedRowData_;
			return root_;
		}
	});
	/**
	 * 데이타셋을 JSON형태의 문자열로 반환합니다.
	 * 
	 * @method toJSONString
	 * @param {Boolean} [onlyData_] true일 경우 스키마를 생략한 행과 열값의 정보만 추출합니다.(기본 : false)
	 * @return {String} JSON형태의 문자열
	 */
	JGDataset.prototype.toJSONString = (function(onlyData_){
		return JSON.stringify(this.toJSON(onlyData_));
	});
	/**
	 * JSON객체 또는 JSON형태의 문자열을 데이타셋에 적용합니다.
	 * 
	 * @method applyJSON
	 * @param {Boolean} [onlyData_] true일 경우 열정보를 생략한 행과 열값의 정보만 추출합니다.(기본 : false)
	 * @return {String} JSON형태의 문자열
	 */
	JGDataset.prototype.applyJSON = (function(content_){
		content_ = ($.type(content_) === "string" ? JSON.parse(content_) : content_);
		
		this.clear(true, false);
		
		//data only
		if(content_[_JGKeyword.key.columnInfo] === undefined){
			var rowCount_ = content_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				this._insertRow(rowIndex_);
				for(var columnName_ in content_[rowIndex_]){
					this._setColumnValue(columnName_, rowIndex_, content_[rowIndex_][columnName_], true, false);
				}
			}
			
			this.apply(false);
			
		}else{
			var columnInfo_ = content_[_JGKeyword.key.columnInfo];
			var rowData_ = content_[_JGKeyword.key.rowData];
			var deletedRowData_ = content_[_JGKeyword.key.deletedRowData];
			
			//apply column info
			var columnCount_ = columnInfo_.length;
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var column_ = columnInfo_[columnIndex_];
				var columnItem_ = this.insertColumn(column_[_JGKeyword.key.name],columnIndex_, false);
				columnItem_.isKey(column_[_JGKeyword.key.isKey]);
			}
			
			this.apply(false);
			
			//apply row data
			var rowCount_ = rowData_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				this._insertRow(rowIndex_);
				var rowItem_ = this.getRow(rowIndex_);
				var row_ = rowData_[rowIndex_][_JGKeyword.key.row];
				
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this.getColumn(columnIndex_);
					var columnValue_ = row_[columnItem_.getName()];
					
					rowItem_.setColumn(columnItem_.getName(), columnValue_[_JGKeyword.key.value], columnValue_[_JGKeyword.key.modify]);
				}
				rowItem_.setRowStatus(rowData_[rowIndex_][_JGKeyword.key.rowStatus]);
			}
			
			//apply deleted row data
			rowCount_ = deletedRowData_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = new JGDatasetRow();
				this._deletedRowData[this._deletedRowData.length] = rowItem_;
				var row_ = deletedRowData_[rowIndex_][_JGKeyword.key.row];
				
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this.getColumn(columnIndex_);
					var columnValue_ = row_[columnItem_.getName()];
					
					rowItem_.setColumn(columnItem_.getName(), columnValue_[_JGKeyword.key.value], columnValue_[_JGKeyword.key.modify]);
				}
				rowItem_.setRowStatus(deletedRowData_[rowIndex_][_JGKeyword.key.rowStatus]);
			}
		}
		
		$(this).trigger(_JGKeyword.trigger._datasetChanged, [NVL(arguments[1], true)]);
	});
	
	/**
	 * 타 데이타셋을 현재 데이타셋에 확장합니다.
	 * 
	 * @method appendDataset
	 * @param {Object} dataset_ 데이타셋
	 * @param {Boolean} [mergeColumn_] 열 병합여부(기본 : false)
	 */
	JGDataset.prototype.appendDataset = (function(dataset_, mergeColumn_){
		var rowCount_ = dataset_.getRowCount();
		var colCount_ = dataset_.getColumnCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this._createRow(_JGKeyword.rowStatus.insert);
			var tRowItem_ = dataset_.getRow(rowIndex_);
			rowItem_.setRowStatus(tRowItem_.rowStatus());
			
			var tRowIndex_ = this.getRowCount();
			this._rowData.insert(rowItem_, tRowIndex_);
			
			for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
				var columnName_ = dataset_.getColumn(colIndex_).getName();
				this._setColumnValue(columnName_, tRowIndex_, tRowItem_.getColumnValue(columnName_), mergeColumn_, false)
				rowItem_.setColumnModification(columnName_, tRowItem_.isColumnModified(columnName_));
			}
			
			$(this).trigger(_JGKeyword.trigger._rowInserted,[tRowIndex_,true]);
		}
	});
	/**
	 * JSON객체 또는 JSON형태의 문자열을 현재 데이타셋에 확장합니다.<br>
	 * JGDataset JSON 포맷과 일치해야 합니다.
	 * 
	 * @method appendDataset
	 * @param {Object} content_JSON객체 또는 JSON형태의 문자열
	 * @param {Boolean} [mergeColumn_] 열 병합여부(기본 : false)
	 */
	JGDataset.prototype.appendJSON = (function(content_, mergeColumn_){
		content_ = ($.type(content_) === "string" ? JSON.parse(content_) : content_);
		this.appendDataset(new JGDataset(content_), mergeColumn_);
	});	
	
	/**
	 * 삽입,수정,삭제된 정보를 추출하여 데이타셋으로 반환합니다.
	 * 
	 * @method exportModifiedData
	 * @return {JGDataset} 데이타셋
	 */
	JGDataset.prototype.exportModifiedData = (function(){
		var dataset_ = new JGDataset();
		
		dataset_._columnInfo = $.extend(true, [], this._columnInfo);
		dataset_._deletedRowData = $.extend(true, [], this._deletedRowData);
		
		var columnCount_ = this.getColumnCount();
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var columnName_ = this._columnInfo[columnIndex_].getName();
				if(this.isColumnModified(columnName_, rowIndex_)){
					dataset_._rowData.push(this._rowData[rowIndex_]);
					break;
				}
			}
		}
		
		return dataset_;
	});
	
	/**
	 * JGDataset을 생성,관리하는 인스턴스 정적객체입니다.<br>
	 * JGDS의 모든 함수는 아래와 같은 형태로 호출할 수 있습니다.
	 * 
	 * 	var result_ = JGDS("함수명",...);
	 * 
	 * @class JGDS
	 * @constructor
	 * @param {String} methodName_ 호출함수명
	 * @param {Object} [arguments]* 매개변수
	 * @return {Object} 반환값
	 * @static
	 */
	window.JGDS = (function(){
		return JGSelector($._JGDS,arguments);
	});
	
	var JGDSEntry = (function(name_, dataset_){
		this._name = name_;
		this._dataset = dataset_;
	});
	JGDSEntry.prototype.name = (function(){
		return this._name;
	});
	JGDSEntry.prototype.dataset = (function(dataset_){
		if(dataset_ !== undefined){
			this._dataset = dataset_;
		}
		
		return this._dataset;
	});
	
	$._JGDS = {
		_datasetMap : []
		,_convertToIndex : function(selector_){
			return ($.type(selector_) === "number" ? selector_ : this.indexOf(selector_));
		}
		/**
		 * 데이타셋을 생성,반환합니다.<br>
		 * Selector가 문자열일 때, 해당 이름의 데이타셋이 없을 경우 생성, 있을 경우에 반환합니다.
		 * Selector가 숫자일 때, 색인의 데이타셋을 반환합니다.
		 * 
		 * @method dataset
		 * @type Function
		 * @param {Object} selector_ 데이타셋명 또는 색인
		 * @param {Object} [content_] 데이타셋 스키마 포맷의 JSON객체나 문자열을 해당 데이타셋에 적용합니다.
		 * @return {JGDataset} 데이타셋
		 * @example
		 * 	var dataset_ = JGDS("dataset",selector_,[content_]);
		 */
		,dataset : function(selector_, data_){
			var datasetInfo_ = this._datasetMap[this._convertToIndex(selector_)];
			
			if(datasetInfo_ === undefined && $.type(selector_) === "string"){
				datasetInfo_ = new JGDSEntry(selector_, new JGDataset(data_));
				this._datasetMap.push(datasetInfo_);
				return datasetInfo_.dataset();
			}
			
			var dataset_ = datasetInfo_.dataset();
			
			if(data_ === undefined){
				return dataset_;
			}else{
				dataset_.applyJSON(data_);
				return dataset_;
			}
		}
		/**
		 * 데이타셋의 색인을 반환합니다.<br>
		 * 데이타셋이 JGDS에 존재하지 않을 겨우 -1 을 반환합니다.
		 * 
		 * @method indexOf
		 * @param {Object} selector_ 데이타셋명 또는 색인
		 * @return {Number} 색인
		 * @example
		 * 	var result_ = JGDS("indexOf",selector_);
		 */
		,indexOf : function(selector_){
			var count_ = this._datasetMap.length;
			for(var index_=0;index_<count_;++index_){
				var data_ = this._datasetMap[index_];
				
				if($.type(selector_) === "string"
					&& data_.name() === selector_){
					return index_;
				}else if(data_.dataset() === selector_){
					return index_;
				}
			}
			return -1;
		}
		/**
		 * 데이타셋명을 반환합니다.<br>
		 * 데이타셋이 JGDS에 존재하지 않을 겨우 {undefined} 을 반환합니다.
		 * 
		 * @method datasetName
		 * @param {JGDataset} dataset_ 데이타셋
		 * @return {String} 데이타셋명
		 * @example
		 * 	var result_ = JGDS("datasetName",dataset_);
		 */
		,datasetName : function(dataset_){
			var count_ = this._datasetMap.length;
			for(var index_=0;index_<count_;++index_){
				var data_ = this._datasetMap[index_];
				
				if(data_.dataset() === dataset_)
					return data_.name();
			}
			return undefined;
		}
		/**
		 * 데이타셋을 삭제합니다.<br>
		 * 
		 * @method remove
		 * @param {Object} selector_ 데이타셋명 또는 색인
		 * @example
		 * 	var result_ = JGDS("remove",dataset_);
		 */
		,remove : function(selector_){
			var index_ = this._convertToIndex(selector_);
			if(index_ === -1) return undefined;
			this._datasetMap.remove(index_);
		}
		/**
		 * 복수의 데이타셋을 생성합니다.<br>
		 * 
		 * @method make
		 * @param {String} datasetNames_* 데이타셋명
		 * @return {Array} 데이타셋 배열
		 * @example
		 * 	var result_ = JGDS("make",[datasetNames_]);
		 */
		,make : function(){
			var result_ = new Array();
			var length_ = arguments.length;
			for(var index_=0;index_<length_;++index_){
				result_.push(this.dataset(arguments[index_]));
			}
			
			return result_;
		}
	};
	
})(window);