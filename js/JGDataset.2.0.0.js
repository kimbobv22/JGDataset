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
			,rowInserted : "rowinserted"
			,rowRemoved : "rowremoved"
			,rowMoved : "rowmoved"
			,columnAdded : "columnadded"
			,columnRemoved : "columnremoved"
			,columnValueChanged : "columnvaluechanged"
			,datasetSorted : "datasetsorted"
			,datasetChanged : "datasetchanged"
			,datasetClear : "datasetclear"
			,datasetReset : "datasetreset"
			,datasetApply : "datasetapply"
		},rowStatus : {
			normal : 0
			,insert : 1
			,update : 3
		}
	};
	
	
	/**
	 * JGSelector
	 * @constructor
	 * @param {object} title - The title of the book.
	 * @param {array} author - The author of the book.
	 */
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
	 * Common
	 */
	Object.isNull = (function(value_){
		return (value_ === undefined || value_ === null);
	});
	Object.NVL2 = (function(value_,replaceValue_,nullValue_){
		return (!this.isNull(value_) ? replaceValue_ : nullValue_); 
	});
	Object.NVL = (function(value_,nullValue_){
		return this.NVL2(value_,value_,nullValue_); 
	});
	String.isBlank = (function(value_){
		return (value_.length === 0);
	});

	Array.prototype.indexOf = (function(object_){
		var count_ = this.length;
		for(var index_=0;index_<count_;++index_){
			if(this[index_] === object_){
				return index_;
			}
		}
		return -1;
	});
	Array.prototype.insert = (function(object_,index_){
		this.splice(index_,0,object_);
	});
	Array.prototype.remove = (function(index_){
		this.splice(index_,1);
	});
	Array.prototype.removeAll = (function(index_){
		this.splice(0,this.length);
	});
	Array.prototype.removeObject = (function(object_){
		this.remove(this.indexOf(object_));
	});
	Array.prototype.move = function (oIndex_, nIndex_){
		var temp_ = this[oIndex_];
		this[oIndex_] = this[nIndex_];
		this[nIndex_] = temp_;
	};
	Array.prototype.clone = (function(){
		return this.slice(0);
	});
	
	var JGDatasetColumn = window.JGDatasetColumn = (function(columnName_){
		this.name = columnName_.toUpperCase();
		this._isKey = false;
	});

	JGDatasetColumn.prototype.getName = (function(){
		return this.name;
	});
	JGDatasetColumn.prototype.setName = (function(name_){
		this.name = name_;
	});
	JGDatasetColumn.prototype.isKey = (function(){
		return this._isKey; 
	});
	JGDatasetColumn.prototype.setKey = (function(bool_){
		this._isKey = bool_;
	});
	
	var JGDatasetRow = window.JGDatasetRow = (function(){
		this._columns = {};
		this._orgColumns = {};
		this._columnStatus = {};
		this._rowStatus = _JGKeyword.rowStatus.normal;
	});

	JGDatasetRow.prototype.getRowStatus = (function(){
		return this._rowStatus;
	});
	JGDatasetRow.prototype.setRowStatus = (function(rowStatus_){
		this._rowStatus = rowStatus_;
	});

	JGDatasetRow.prototype._updateRowStatus = (function(){
		if(this._rowStatus === _JGKeyword.rowStatus.insert) return;
		var didUpdate_ = false;
		for(var columnName_ in this._columnStatus){
			if(Object.NVL(this._columnStatus[columnName_], false)){
				didUpdate_ = true;
				break;
			}
		}
		this._rowStatus = (didUpdate_ ? _JGKeyword.rowStatus.update : _JGKeyword.rowStatus.normal);
	});

	JGDatasetRow.prototype.setColumn = (function(columnName_, value_, isModify_){
		columnName_ = columnName_.toUpperCase();
		this._columns[columnName_] = value_;
		
		//check modified
		if(Object.isNull(isModify_)){
			this._columnStatus[columnName_] = (this._orgColumns[columnName_] !== value_);
		}else{
			this._columnStatus[columnName_] = isModify_;
		}
		this._updateRowStatus();
	});
	JGDatasetRow.prototype.removeColumn = (function(columnName_){
		delete this._columns[columnName_.toUpperCase()];
	});
	JGDatasetRow.prototype.getColumnValue = (function(columnName_){
		return this._columns[columnName_.toUpperCase()];
	});

	JGDatasetRow.prototype.isColumnModified = (function(columnName_){
		var isModified_ = this._columnStatus[columnName_.toUpperCase()];
		return Object.NVL2(isModified_,false,isModified_);
	});
	JGDatasetRow.prototype.setColumnModification = (function(columnName_, bool_){
		this._columnStatus[columnName_.toUpperCase()] = bool_;
	});

	JGDatasetRow.prototype.apply = (function(fireEvent_){
		this._orgColumns = {};
		this._orgColumns = JSON.parse(JSON.stringify(this._columns));
		this._rowStatus = _JGKeyword.rowStatus.normal;
		this._columnStatus = {};
	});
	JGDatasetRow.prototype.reset = (function(){
		this._columns = {};
		this._columns = JSON.parse(JSON.stringify(this._orgColumns));
		this._rowStatus = _JGKeyword.rowStatus.normal;
		this._columnStatus = {};
	});

	/**
	 * JGDataset
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
		$(this).on(_JGKeyword.trigger._rowMoved, function(event_, newRowIndex_, oldRowIndex_, fireEvent_){
			if(fireEvent_){$(this).trigger(_JGKeyword.trigger.rowMoved,[newRowIndex_, oldRowIndex_]);}
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
		if(!Object.isNull(content_)){
			this.applyJSON(content_);
		}
	});
	
	JGDataset.prototype.getName = (function(){
		return JGDS("datasetName",this);
	});
	
	JGDataset.prototype._convertColumnKeyToName = (function(columnKey_){
		return ($.type(columnKey_) === "number" ? this.getColumn(columnKey_).name : columnKey_.toUpperCase());
	});
	JGDataset.prototype._convertColumnKeyToIndex = (function(columnKey_){
		return ($.type(columnKey_) === "number" ? columnKey_ : this.indexOfColumn(columnKey_));
	});

	JGDataset.prototype.getColumnCount = (function(){
		return this._columnInfo.length;
	});
	JGDataset.prototype.getRowCount = (function(){
		return this._rowData.length;
	});
	JGDataset.prototype.getDeletedRowCount = (function(){
		return this._deletedRowData.length;
	});

	//JGDataset - Column handle function
	JGDataset.prototype.insertColumn = (function(columnName_,columnIndex_, fireEvent_){
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
		
		if(Object.NVL(fireEvent_,true)){
			$(this).trigger(_JGKeyword.trigger._columnAdded,[column_.name]);
		}
		
		return column_;
	});

	JGDataset.prototype.addColumn = (function(columnName_, fireEvent_){
		return this.insertColumn(columnName_, this._columnInfo.length, fireEvent_);
	});
	JGDataset.prototype.addColumns = (function(){
		var count_ = arguments.length;
		for(var index_=0;index_<count_;++index_){
			this.addColumn(arguments[index_]);
		}
	});

	JGDataset.prototype.removeColumn = (function(columnKey_){
		columnKey_ = this._convertColumnKeyToIndex(columnKey_);
		
		var columnName_ = this.getColumn(columnKey_).name;
		this._columnInfo.splice(columnKey_,1);
		$(this).trigger(_JGKeyword.trigger._columnRemoved,[columnName_]);
	});

	JGDataset.prototype.getColumn = (function(columnKey_){
		columnKey_ = this._convertColumnKeyToIndex(columnKey_);
		return this._columnInfo[columnKey_];
	});

	JGDataset.prototype.indexOfColumn = (function(columnName_){
		var count_ = this._columnInfo.length;
		for(var columnIndex_=0;columnIndex_<count_;++columnIndex_){
			if(this._columnInfo[columnIndex_].name === columnName_.toUpperCase()){
				return columnIndex_;
			}
		}
		return -1;
	});

	//JGDataset - Row handle function

	JGDataset.prototype.createRow = (function(rowStatus_){
		var rowItem_ = new JGDatasetRow();
		rowItem_.setRowStatus(rowStatus_);
		
		var columnCount_ = this._columnInfo.length;
		for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			var columnItem_ = this._columnInfo[columnIndex_];
			rowItem_.setColumn(columnItem_.name, null);
		}
		return rowItem_;
	});

	JGDataset.prototype._insertRow = (function(rowIndex_){
		this._rowData.insert(this.createRow(_JGKeyword.rowStatus.insert), rowIndex_);
	});
	JGDataset.prototype.insertRow = (function(rowIndex_){
		this._insertRow(rowIndex_);
		$(this).trigger(_JGKeyword.trigger._rowInserted,[rowIndex_,true]);
	});
	JGDataset.prototype.addRow = (function(){
		var rowIndex_ = this._rowData.length;
		this.insertRow(rowIndex_);
		return rowIndex_;
	});
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
	JGDataset.prototype.removeRow = (function(rowIndex_){
		this._removeRow(rowIndex_);
		$(this).trigger(_JGKeyword.trigger._rowRemoved,[rowIndex_]);
	});
	JGDataset.prototype.getRow = (function(rowIndex_){
		return this._rowData[rowIndex_];
	});
	JGDataset.prototype.setRowStatus = (function(rowIndex_, rowStatus_){
		this.getRow(rowIndex_).setRowStatus(rowStatus_); 
	});
	JGDataset.prototype.getRowStatus = (function(rowIndex_){
		return this.getRow(rowIndex_).getRowStatus(); 
	});
	JGDataset.prototype.getDeletedRow = (function(rowIndex_){
		return this._deletedRowData[rowIndex_];
	});
	
	//JGDataset - sort function
	JGDataset.prototype.moveRow = (function(oldIndex_, newIndex_, doFireEvent_){
		this._rowData.move(oldIndex_, newIndex_);
		$(this).trigger(_JGKeyword.trigger._rowMoved,[newIndex_, oldIndex_, Object.NVL(doFireEvent_, true)]);
	});
	
	JGDataset.prototype.sortRow = (function(columnKey_, sortFunc_, doFireEvent_){
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
			$(this).trigger(_JGKeyword.trigger._datasetSorted,[startIndex_,endIndex_,Object.NVL(doFireEvent_, true)]);
		}
	});
	
	JGDataset.prototype.sortRowByAsc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return bColumnValue_ < columnValue_;
		});
	});
	JGDataset.prototype.sortRowByDesc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return columnValue_ < bColumnValue_;
		});
	});
	
	//JGDataset - Column value handle function
	
	JGDataset.prototype._setColumnValue = (function(columnKey_, rowIndex_, value_, mergeColumn_, fireEvent_){
		if($.type(columnKey_) === "number"){
			var columnItem_ = this.getColumn(columnKey_);
			columnKey_ = columnItem_.name;
		}else{
			var columnIndex_ = this.indexOfColumn(columnKey_);
			if(columnIndex_ < 0){
				if(!Object.NVL(mergeColumn_,false)) console.error("not exists column ["+columnKey_+"]");
				else this.addColumn(columnKey_, fireEvent_);
			}
		}
		
		var rowItem_ = this.getRow(rowIndex_);
		rowItem_.setColumn(columnKey_, value_);
	});
	JGDataset.prototype.setColumnValue = (function(columnKey_, rowIndex_, value_, mergeColumn_){
		columnKey_ = this._convertColumnKeyToName(columnKey_);
		
		var currentValue_ = this.getColumnValue(columnKey_, rowIndex_);
		this._setColumnValue(columnKey_, rowIndex_, value_, mergeColumn_);
		if(currentValue_ !== value_){
			$(this).trigger(_JGKeyword.trigger._columnValueChanged,[columnKey_,rowIndex_,true]);
		}
	});
	JGDataset.prototype.setColumnValues = (function(valueMap_, rowIndex_, mergeColumn_){
		for(var columnKey_ in valueMap_){
			this.setColumnValue(columnKey_, rowIndex_, valueMap_[columnKey_], mergeColumn_);
		}
	});
	JGDataset.prototype.getColumnValue = (function(columnKey_, rowIndex_){
		return this.getRow(rowIndex_).getColumnValue(this._convertColumnKeyToName(columnKey_));
	});
	JGDataset.prototype.isColumnModified = (function(columnKey_, rowIndex_){
		return this.getRow(rowIndex_).isColumnModified(this._convertColumnKeyToName(columnKey_));
	});

	JGDataset.prototype.getDeletedColumnValue = (function(columnKey_, rowIndex_){
		return this.getDeletedRow(rowIndex_).getColumnValue(this._convertColumnKeyToName(columnKey_));
	});
	JGDataset.prototype.clear = (function(deleteColumn_){
		if(Object.NVL(deleteColumn_, true)){
			this._columnInfo = new Array();
		}
		this._rowData = new Array();
		this._deletedRowData = new Array();
		
		$(this).trigger(_JGKeyword.trigger._datasetClear, [Object.NVL(arguments[1], true)]);
	});
	JGDataset.prototype.apply = (function(fireEvent_){
		var rowCount_ = this._rowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this.getRow(rowIndex_);
			rowItem_.apply();
		}
		this._deletedRowData = new Array();
		this._orgRowData = this._rowData.clone();
		this._orgColumnInfo = this._columnInfo.clone();
		$(this).trigger(_JGKeyword.trigger._datasetApply, [Object.NVL(fireEvent_, true)]);
	});
	JGDataset.prototype.reset = (function(fireEvent_){
		this._rowData = new Array();
		this._deletedRowData = new Array();
		this._rowData = this._orgRowData.clone();
		this._columnInfo = this._orgColumnInfo.clone();
		$(this).trigger(_JGKeyword.trigger._datasetReset, [Object.NVL(fireEvent_, true)]);
	});
	JGDataset.prototype.isModified = (function(){
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(this.getRowStatus(rowIndex_) !== _JGKeyword.rowStatus.normal){
				return true;
			}
		}
		
		return false;
	});
	
	/*
	 * JGDataset - function for column calculation 
	 */
	JGDataset.prototype.sumOfColumnValues = (function(columnKey_, filterFunc_){
		var sum_ = 0;
		var rowCount_ = this.getRowCount();
		var columnItem_ = this.getColumn(columnKey_);
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(Object.NVL2(filterFunc_,filterFunc_,function(){return true;})(columnItem_.name, rowIndex_)){
				var columnValue_ = this.getColumnValue(columnItem_.name, rowIndex_);
				sum_ += (Object.isNull(columnValue_) || isNaN(columnValue_) ? 0 : new Number(columnValue_));
			}
		}
		
		return sum_;
	});
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
			var tColumnValue_ = this.getColumnValue(columnItem_.name,rowIndex_);
			if(Object.isNull(tColumnValue_) || isNaN(tColumnValue_) || !Object.NVL2(filterFunc_,filterFunc_,function(){return true;})(columnItem_.name, rowIndex_)) continue;
			
			if(Object.isNull(columnValue_)
					|| new Function("return ("+columnValue_+calcChar_+tColumnValue_+");").apply(this)){
				columnValue_ = tColumnValue_;
			}
		}
		
		return columnValue_;
	});
	
	JGDataset.prototype.maxOfColumnValues = (function(columnKey_, filterFunc_){
		return this._calcOfColumnValues(columnKey_, "<", filterFunc_);
	});
	JGDataset.prototype.minOfColumnValues = (function(columnKey_, filterFunc_){
		return this._calcOfColumnValues(columnKey_, ">", filterFunc_);
	});

	//JGDataset - JSON handle function 
	JGDataset.prototype.toJSON = (function(onlyData_){
		if(Object.NVL(onlyData_,false)){
			var array_ = new Array();
			
			var rowCount_ = this._rowData.length;
			var columnCount_ = this._columnInfo.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = this._rowData[rowIndex_];
				var row_ = {};
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this._columnInfo[columnIndex_];
					row_[columnItem_.name] = rowItem_.getColumnValue(columnItem_.name);
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
				columnJSON_[_JGKeyword.key.name] = columnItem_.name;
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
					columnJSON_[_JGKeyword.key.value] = this.getColumnValue(columnItem_.name, rowIndex_);
					columnJSON_[_JGKeyword.key.modify] = rowItem_.isColumnModified(columnItem_.name);
					columns_[columnItem_.name] = columnJSON_;
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
				var row_ = {};
				var columns_ = {};
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this._columnInfo[columnIndex_];
					var columnValue_ = this.getDeletedColumnValue(columnItem_.name, rowIndex_);
					
					var columnJSON_ = {};
					columnJSON_[_JGKeyword.key.value] = columnValue_;
					columns_[columnItem_.name] = columnJSON_;
				}
				row_[_JGKeyword.key.row] = columns_;
				deletedRowData_[rowIndex_] = row_;
			}
			root_[_JGKeyword.key.deletedRowData] = deletedRowData_;
			return root_;
		}
	});
	JGDataset.prototype.toJSONString = (function(onlyData_){
		return JSON.stringify(this.toJSON(onlyData_));
	});
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
				columnItem_.setKey(column_[_JGKeyword.key.isKey]);
			}
			
			//apply row data
			var rowCount_ = rowData_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				this._insertRow(rowIndex_);
				var rowItem_ = this.getRow(rowIndex_);
				var row_ = rowData_[rowIndex_][_JGKeyword.key.row];
				
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this.getColumn(columnIndex_);
					var columnValue_ = row_[columnItem_.name];
			
					rowItem_.setColumn(columnItem_.name, columnValue_[_JGKeyword.key.value], columnValue_[_JGKeyword.key.modify]);
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
					var columnValue_ = row_[columnItem_.name];
					
					rowItem_.setColumn(columnItem_.name, columnValue_[_JGKeyword.key.value]);
				}
			}
		}
		
		$(this).trigger(_JGKeyword.trigger._datasetChanged, [Object.NVL(arguments[1], true)]);
	});
	
	JGDataset.prototype.appendDataset = (function(dataset_, mergeColumn_){
		var rowCount_ = dataset_.getRowCount();
		var colCount_ = dataset_.getColumnCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this.createRow(_JGKeyword.rowStatus.insert);
			var tRowItem_ = dataset_.getRow(rowIndex_);
			rowItem_.setRowStatus(tRowItem_.getRowStatus());
			
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
	JGDataset.prototype.appendJSON = (function(content_, mergeColumn_){
		content_ = ($.type(content_) === "string" ? JSON.parse(content_) : content_);
		this.appendDataset(new JGDataset(content_), mergeColumn_);
	});	
	
	JGDataset.prototype.exportModifiedData = (function(){
		var dataset_ = new JGDataset();
		
		dataset_._columnInfo = this._columnInfo.clone();
		dataset_._deletedRowData = this._deletedRowData.clone();
		
		var columnCount_ = this.getColumnCount();
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var columnName_ = this._columnInfo[columnIndex_].name;
				if(this.isColumnModified(columnName_, rowIndex_)){
					dataset_._rowData.push(this._rowData[rowIndex_]);
					break;
				}
			}
		}
		
		return dataset_;
	});
	
	window.JGDS = (function(){
		return JGSelector($._JGDS,arguments);
	});
	
	var JGDSEntry = window.JGDSEntry = (function(name_, dataset_){
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
		},dataset : function(selector_, data_){
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
		},indexOf : function(selector_){
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
		},datasetName : function(dataset_){
			var count_ = this._datasetMap.length;
			for(var index_=0;index_<count_;++index_){
				var data_ = this._datasetMap[index_];
				
				if(data_.dataset() === dataset_)
					return data_.name();
			}
			return undefined;
		},remove : function(selector_){
			var index_ = this._convertToIndex(selector_);
			if(index_ === -1) return undefined;
			this._datasetMap.remove(index_);
			return true;
		},make : function(){
			var result_ = new Array();
			var length_ = arguments.length;
			for(var index_=0;index_<length_;++index_){
				result_.push(this.dataset(arguments[index_]));
			}
			
			return result_;
		}
	};
	
})(window);