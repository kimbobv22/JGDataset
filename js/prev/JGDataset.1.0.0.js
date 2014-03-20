(function(window){

	if($ === undefined || $ == null){
		console.error("can't not initialize JGDataset, JQuery not found");
		return;
	}

	/**
	 * Common
	 */
	Object.isNull = (function(value_){
		return (value_ === undefined || value_ == null);
	});
	Object.NVL2 = (function(value_,replaceValue_,nullValue_){
		return (!this.isNull(value_) ? replaceValue_ : nullValue_); 
	});
	Object.NVL = (function(value_,nullValue_){
		return this.NVL2(value_,value_,nullValue_); 
	});
	
	String.isBlank = (function(){
		return (this.length === 0);
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
		if(nIndex_ >= this.length){
			var diff_ = nIndex_ - this.length;
			while((--diff_)+1){
				this.push(undefined);
			}
		}
		this.splice(nIndex_, 0, this.splice(oIndex_, 1)[0]);
	};
	
	Array.prototype.clone = (function(){
		return this.slice(0);
	});
	
	window.jgLoop = (function(length_, loopFunc_){
		for(var index_=0;index_<length_;++index_){
			loopFunc_(index_,length_);
		}
	});
	
	/**
	 * JQuery Extension
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
		this._rowStatus = window.JGDatasetRow.prototype.ROWSTATUS_NORMAL;
	});

	JGDatasetRow.prototype.getRowStatus = (function(){
		return this._rowStatus;
	});
	JGDatasetRow.prototype.setRowStatus = (function(rowStatus_){
		this._rowStatus = rowStatus_;
	});

	JGDatasetRow.prototype._updateRowStatus = (function(){
		if(this._rowStatus == JGDatasetRow.prototype.ROWSTATUS_INSERT) return;
		var didUpdate_ = false;
		for(var columnName_ in this._columnStatus){
			if(Object.NVL(this._columnStatus[columnName_], false)){
				didUpdate_ = true;
				break;
			}
		}
		this._rowStatus = (didUpdate_ ? JGDatasetRow.prototype.ROWSTATUS_UPDATE : JGDatasetRow.prototype.ROWSTATUS_NORMAL);
	});

	JGDatasetRow.prototype.setColumn = (function(columnName_, value_, isModify_){
		columnName_ = columnName_.toUpperCase();
		this._columns[columnName_] = value_;
		
		//check modified
		if(Object.isNull(isModify_)){
			this._columnStatus[columnName_] = (this._orgColumns[columnName_] != value_);
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

	JGDatasetRow.prototype.apply = (function(){
		this._orgColumns = {};
		this._orgColumns = JSON.parse(JSON.stringify(this._columns));
		this._rowStatus = JGDatasetRow.prototype.ROWSTATUS_NORMAL;
		this._columnStatus = {};
	});
	JGDatasetRow.prototype.reset = (function(){
		this._columns = {};
		this._columns = JSON.parse(JSON.stringify(this._orgColumns));
		this._rowStatus = JGDatasetRow.prototype.ROWSTATUS_NORMAL;
		this._columnStatus = {};
	});

	JGDatasetRow.prototype.ROWSTATUS_NORMAL = 0;
	JGDatasetRow.prototype.ROWSTATUS_INSERT = 1;
	JGDatasetRow.prototype.ROWSTATUS_UPDATE = 3;

	/**
	 * JGDataset
	 */
	var JGDataset = window.JGDataset = (function(content_){
		this._columnInfo = new Array();
		this._orgColumnInfo = new Array();
		this._rowData = new Array();
		this._orgRowData = new Array();
		this._deletedRowData = new Array();
		
		this._mappingTarget = null;
		this._mappingRowContents = null;
		this._mappingRowList = new Array();
		this._mappingElementsList = new Array();
		this._mappingFxElementsList = new Array();
		this._autoFillSelectList = new Array();
		
		//callback for mapping event
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenRowInserted,function(event_, rowIndex_, fireEvent_){
			if(fireEvent_) $(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenRowInserted,rowIndex_);
			this._addMappingElements(rowIndex_);
			this._updateAutoFillToSelect();
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenRowRemoved,function(event_, rowIndex_){
			$(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenRowRemoved,rowIndex_);
			this._removeMappingElements(rowIndex_);
			this._updateAutoFillToSelect();
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenColumnAdded, function(event_, columnName_){
			$(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenColumnAdded,columnName_);
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenColumnRemoved, function(event_, columnName_){
			$(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenColumnRemoved,columnName_);
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenColumValueChanged,function(event_, columnName_, rowIndex_,fireEvent_){
			if(fireEvent_) $(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenColumValueChanged,[columnName_,rowIndex_]);
			this._refreshColumnMappingElements(columnName_, rowIndex_);
			this._updateAutoFillToSelect();
		});
		
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenDatasetClear, function(event_, fireEvent_){
			if(fireEvent_){$(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenDatasetClear);}
			this.reloadMappingElements();
			this._updateAutoFillToSelect();
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenDatasetReset,function(event_){
			$(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenDatasetReset);
			this.reloadMappingElements();
			this._updateAutoFillToSelect();
		});
		$(this).on(window.JGDataset.prototype._customTriggerKey_whenDatasetChanged,function(event_, fireEvent_){
			if(fireEvent_) $(this).trigger(window.JGDataset.prototype._defaultTriggerKey_whenDatasetChanged);
			this.reloadMappingElements();
			this._updateAutoFillToSelect();
		});
		
		/*
		 * initialize JGDataset
		 */
		if(!Object.isNull(content_)){
			this.applyJSON(content_);
		}
	});
	
	JGDataset.prototype._convertColumnKeyToName = (function(columnKey_){
		return ($.type(columnKey_) === "number" ? this.getColumn(columnKey_).name : columnKey_);
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
			this.reloadMappingElements();
			$(this).trigger(JGDataset.prototype._customTriggerKey_whenColumnAdded,columnName_);
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
		this.reloadMappingElements();
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenColumnRemoved,columnName_);
	});

	JGDataset.prototype.getColumn = (function(columnKey_){
		columnKey_ = this._convertColumnKeyToIndex(columnKey_);
		return this._columnInfo[columnKey_];
	});

	JGDataset.prototype.indexOfColumn = (function(columnName_){
		var count_ = this._columnInfo.length;
		for(var columnIndex_=0;columnIndex_<count_;++columnIndex_){
			if(this._columnInfo[columnIndex_].name == columnName_.toUpperCase()){
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
		this._rowData.insert(this.createRow(JGDatasetRow.prototype.ROWSTATUS_INSERT), rowIndex_);
	});
	JGDataset.prototype.insertRow = (function(rowIndex_){
		this._insertRow(rowIndex_);
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenRowInserted,[rowIndex_,true]);
	});
	JGDataset.prototype.addRow = (function(){
		var rowIndex_ = this._rowData.length;
		this.insertRow(rowIndex_);
		return rowIndex_;
	});
	JGDataset.prototype._removeRow = (function(rowIndex_){
		var rowItem_ = this.getRow(rowIndex_);
		switch(rowItem_.getRowStatus()){
			case JGDatasetRow.prototype.ROWSTATUS_NORMAL:
			case JGDatasetRow.prototype.ROWSTATUS_UPDATE:
				this._deletedRowData.push(rowItem_);
				break;
			case JGDatasetRow.prototype.ROWSTATUS_INSERT:
			default:
				break;
		}
		
		this._rowData.remove(rowIndex_);
	});
	JGDataset.prototype.removeRow = (function(rowIndex_){
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenRowRemoved,rowIndex_);
		this._removeRow(rowIndex_);
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
	
	JGDataset.prototype.moveRow = (function(oldIndex_, newIndex_){
		this._rowData.move(oldIndex_, newIndex_);
		this._updateMappingElements(oldIndex_);
		this._updateMappingElements(newIndex_);
	});
	
	JGDataset.prototype.sortRow = (function(columnKey_, sortFunc_){
		var columnName_ = this._convertColumnKeyToName(columnKey_);
		var rowCount_ = this.getRowCount();
		
		this._rowData.sort(function(aRowItem_, bRowItem_){
			return sortFunc_.apply(this,[aRowItem_.getColumnValue(columnName_), bRowItem_.getColumnValue(columnName_)]);
		});
		
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			this._updateMappingElements(rowIndex_);
		}
	});
	
	JGDataset.prototype.sortRowByAsc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return bColumnValue_ - columnValue_;
		});
	});
	JGDataset.prototype.sortRowByDesc = (function(columnKey_){
		this.sortRow(columnKey_, function(bColumnValue_, columnValue_){
			return columnValue_ - bColumnValue_;
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
		if(currentValue_ != value_){
			$(this).trigger("change",[columnKey_,rowIndex_]);
			$(this).trigger(JGDataset.prototype._customTriggerKey_whenColumValueChanged,[columnKey_,rowIndex_,true]);
		}
	});
	JGDataset.prototype.setColumnValues = (function(rowIndex_, columnNameAndValues_, mergeColumn_){
		var count_ = columnNameAndValues_.length;
		for(var index_=0;index_<count_;index_+=2){
			this.setColumnValue(columnNameAndValues_[index_], rowIndex_, columnNameAndValues_[index_+1], mergeColumn_);
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
		
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenDatasetClear, Object.NVL(arguments[1], true));
	});
	JGDataset.prototype.apply = (function(){
		var rowCount_ = this._rowData.length;
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this.getRow(rowIndex_);
			rowItem_.apply();
		}
		this._deletedRowData = new Array();
		this._orgRowData = this._rowData.clone();
		this._orgColumnInfo = this._columnInfo.clone();
	});
	JGDataset.prototype.reset = (function(){
		this._rowData = new Array();
		this._deletedRowData = new Array();
		this._rowData = this._orgRowData.clone();
		this._columnInfo = this._orgColumnInfo.clone();
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenDatasetReset);
	});
	JGDataset.prototype.isModified = (function(){
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(this.getRowStatus(rowIndex_) != JGDatasetRow.prototype.ROWSTATUS_NORMAL){
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
				columnJSON_[JGDataset.prototype.STR_NAME] = columnItem_.name;
				columnJSON_[JGDataset.prototype.STR_ISKEY] = columnItem_.isKey();
				columnInfo_[columnIndex_] = columnJSON_;
			}
			root_[JGDataset.prototype.STR_COLUMNINFO] = columnInfo_;
			
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
					columnJSON_[JGDataset.prototype.STR_VALUE] = this.getColumnValue(columnItem_.name, rowIndex_);
					columnJSON_[JGDataset.prototype.STR_MODIFY] = rowItem_.isColumnModified(columnItem_.name);
					columns_[columnItem_.name] = columnJSON_;
				}
				
				row_[JGDataset.prototype.STR_ROW] = columns_;
				row_[JGDataset.prototype.STR_ROWSTATUS] = rowItem_.getRowStatus();
				rowData_[rowIndex_] = row_;
			}
			root_[JGDataset.prototype.STR_ROWDATA] = rowData_;
			
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
					columnJSON_[JGDataset.prototype.STR_VALUE] = columnValue_;
					columns_[columnItem_.name] = columnJSON_;
				}
				row_[JGDataset.prototype.STR_ROW] = columns_;
				deletedRowData_[rowIndex_] = row_;
			}
			root_[JGDataset.prototype.STR_ROWDATA_DELETED] = deletedRowData_;
			return root_;
		}
	});
	JGDataset.prototype.toJSONString = (function(onlyData_){
		return JSON.stringify(this.toJSON(onlyData_));
	});
	JGDataset.prototype.applyJSON = (function(content_){
		content_ = ($.type(content_) == "string" ? JSON.parse(content_) : content_);
		
		this.clear(true, false);
		
		//data only
		if(content_[JGDataset.prototype.STR_COLUMNINFO] === undefined){
			var rowCount_ = content_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				this._insertRow(rowIndex_);
				for(var columnName_ in content_[rowIndex_]){
					this._setColumnValue(columnName_, rowIndex_, content_[rowIndex_][columnName_], true, false);
				}
			}
			
			this.apply();
			
		}else{
			var columnInfo_ = content_[JGDataset.prototype.STR_COLUMNINFO];
			var rowData_ = content_[JGDataset.prototype.STR_ROWDATA];
			var deletedRowData_ = content_[JGDataset.prototype.STR_ROWDATA_DELETED];
			
			//apply column info
			var columnCount_ = columnInfo_.length;
			for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				var column_ = columnInfo_[columnIndex_];
				var columnItem_ = this.insertColumn(column_[JGDataset.prototype.STR_NAME],columnIndex_, false);
				columnItem_.setKey(column_[JGDataset.prototype.STR_ISKEY]);
			}
			
			//apply row data
			var rowCount_ = rowData_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				this._insertRow(rowIndex_);
				var rowItem_ = this.getRow(rowIndex_);
				var row_ = rowData_[rowIndex_][JGDataset.prototype.STR_ROW];
				
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this.getColumn(columnIndex_);
					var columnValue_ = row_[columnItem_.name];
			
					rowItem_.setColumn(columnItem_.name, columnValue_[JGDataset.prototype.STR_VALUE], columnValue_[JGDataset.prototype.STR_MODIFY]);
				}
				rowItem_.setRowStatus(rowData_[rowIndex_][JGDataset.prototype.STR_ROWSTATUS]);
			}
			
			//apply deleted row data
			rowCount_ = deletedRowData_.length;
			for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				var rowItem_ = new JGDatasetRow();
				this._deletedRowData[this._deletedRowData.length] = rowItem_;
				var row_ = deletedRowData_[rowIndex_][JGDataset.prototype.STR_ROW];
				
				for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					var columnItem_ = this.getColumn(columnIndex_);
					var columnValue_ = row_[columnItem_.name];
					
					rowItem_.setColumn(columnItem_.name, columnValue_[JGDataset.prototype.STR_VALUE]);
				}
			}
		}
		
		$(this).trigger(JGDataset.prototype._customTriggerKey_whenDatasetChanged, Object.NVL(arguments[1], true));
	});
	
	JGDataset.prototype.appendDataset = (function(dataset_, mergeColumn_){
		var rowCount_ = dataset_.getRowCount();
		var colCount_ = dataset_.getColumnCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var rowItem_ = this.createRow(JGDatasetRow.prototype.ROWSTATUS_INSERT);
			var tRowItem_ = dataset_.getRow(rowIndex_);
			rowItem_.setRowStatus(tRowItem_.getRowStatus());
			
			var tRowIndex_ = this.getRowCount();
			this._rowData.insert(rowItem_, tRowIndex_);
			
			for(var colIndex_=0;colIndex_<colCount_;++colIndex_){
				var columnName_ = dataset_.getColumn(colIndex_).getName();
				this._setColumnValue(columnName_, tRowIndex_, tRowItem_.getColumnValue(columnName_), mergeColumn_, false);
				rowItem_.setColumnModification(columnName_, tRowItem_.isColumnModified(columnName_));
			}
			
			$(this).trigger(JGDataset.prototype._customTriggerKey_whenRowInserted,[tRowIndex_,true]);
		}
	});
	JGDataset.prototype.appendJSON = (function(content_, mergeColumn_){
		content_ = ($.type(content_) == "string" ? JSON.parse(content_) : content_);
		this.appendDataset(new JGDataset(content_), mergeColumn_);
	});
	
	/*
	 * JGDataset - Mapping handle function
	 */
	
	JGDataset.prototype.addSelectForAutoFill = (function(select_, displayColumnName_, valueColumnName_){
		this._autoFillSelectList.push({
			select : $(select_)
			,displayColumnName : displayColumnName_
			,valueColumnName : valueColumnName_
		});
		this._updateAutoFillToSelect();
	});
	JGDataset.prototype.removeSelectForAutoFill = (function(select_){
		if(Object.isNull(select_)){
			this._autoFillSelectList = new Array();
			return;
		}
		
		var length_ = this._autoFillSelectList.length;
		for(var index_=0;index_<length_;++index_){
			var fillInfo_ = this._autoFillSelectList[index_];
			if($(fillInfo_.select).is(select_)){
				this._autoFillSelectList.remove(index_);
				return;
			}
		}
	});
	
	JGDataset.prototype._updateAutoFillToSelect = (function(){
		var length_ = this._autoFillSelectList.length;
		if(length_ === 0) return;
		
		for(var index_=0;index_<length_;++index_){
			var fillInfo_ = this._autoFillSelectList[index_];
			
			if(Object.isNull(fillInfo_.select) || Object.isNull(fillInfo_.select.parent())){
				this.removeSelectForAutoFill(index_);
				--index_;
			}
			
			this.fillOptionToSelect(fillInfo_.select
					,fillInfo_.displayColumnName
					,fillInfo_.valueColumnName);
			
			try{fillInfo_.select.selectmenu("refresh", true);}catch(ex_){}
		}
	});
	
	String.prototype.jgFuncConvertToColumnRegexp = (function(){
		return new RegExp("\\#\\#(" + this + ")\\#\\#", "gi");
	});
	String.prototype.jgFuncReplaceRegexpByDataset = (function(dataset_, rowIndex_){
		var targetStr_ = this;
		//replace row index			
		targetStr_ = targetStr_.replace("dataset\\.rowIndex".jgFuncConvertToColumnRegexp(), "("+rowIndex_+")");
		
		//replace row status
		targetStr_ = targetStr_.replace("dataset\\.rowStatus".jgFuncConvertToColumnRegexp(), "("+dataset_.getRowStatus(rowIndex_)+")");
		
		//replace column data
		var columnCount_ = dataset_.getColumnCount();
		for(var columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			var columnItem_ = dataset_.getColumn(columnIndex_);
			var columnName_ = columnItem_.getName();
			var columnValue_= dataset_.getColumnValue(columnName_,rowIndex_);
			targetStr_ = targetStr_.replace(columnName_.jgFuncConvertToColumnRegexp(), Object.NVL(columnValue_, ""));
		}
		
		return targetStr_;
	});
	JGDataset.prototype._customFunctionConverter = (function(bAttrName_, rowIndex_){
		var funcDelimiterIndex_ = bAttrName_.indexOf(JGDataset.prototype.STR_MAP_FXCHAR);
		
		if(funcDelimiterIndex_ >= 0){
			bAttrName_ = bAttrName_.substring(bAttrName_.indexOf(":")+1,bAttrName_.length);
			bAttrName_ = bAttrName_.jgFuncReplaceRegexpByDataset(this, rowIndex_);
			
			
			try{
				return new Function("return ("+bAttrName_+");").apply(this);
			}catch(ex_){
				try{
					var result_ = new Function(bAttrName_+";").apply(this);
					return Object.NVL(result_,"");
				}catch(ex2_){
					return "##fx error : "+ex2_.toString()+"##";
				}
			}
		}else{
			return undefined;
		}
	});
	
	JGDataset.prototype.mapping = (function(target_){
		this._mappingTarget = $(target_);
		this._mappingRowContents = this._mappingTarget.contents().clone(true);
		this.reloadMappingElements();
	});
	JGDataset.prototype.reloadMappingElements = (function(){
		if(Object.isNull(this._mappingTarget)) return;
		
		this._mappingTarget.empty();
		this._mappingElementsList.removeAll();
		this._mappingFxElementsList.removeAll();
		this._mappingRowList.removeAll();
		
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			this._addMappingElements(rowIndex_);
		}
	});
	JGDataset.prototype._addMappingElements = (function(rowIndex_){
		if(Object.isNull(this._mappingTarget)) return;
		
		
		var that_ = this;
		var rowContents_ = $("<div />").append(this._mappingRowContents.clone(true));
		
		//find elements be mapped with a column
		var columnMappingElements_ = new Array();
		
		var elementList_ = rowContents_.find("*["+JGDataset.prototype.STR_MAP_COLUMNNAME+"]");
		var elementListLength_ = elementList_.length;
		for(var eIndex_=0;eIndex_<elementListLength_;++eIndex_){
			columnMappingElements_.push($(elementList_[eIndex_]));
		}
		
		//find elements be mapped with fx
		var addFxDefFunc_ = (function(name_,type_,fx_){
			this.push({
				name : name_
				,type : type_
				,fx : fx_
			});
		});
		
		var fxMappingElements_ = new Array();
		elementList_ = rowContents_.find("*");
		$.each(elementList_,function(index_){
			var element_ = $(this);
			var fxDefs_ = new Array();
			var atrributes_ = element_[0].attributes;
			var attrCount_ = atrributes_.length;
			for(var index_ =0; index_<attrCount_;++index_){
				var attr_ = atrributes_[index_];
				if(attr_.name !== JGDataset.prototype.STR_MAP_COLUMNNAME
					&& Object.NVL(attr_.value,"").indexOf(JGDataset.prototype.STR_MAP_FXCHAR) == 0){
					addFxDefFunc_.apply(fxDefs_,[attr_.name,0,attr_.value]);
				}
			}
			var textValue_ = element_.text();
			if(element_.children().length == 0
					&& Object.NVL(textValue_,"").indexOf(JGDataset.prototype.STR_MAP_FXCHAR) >= 0){
				addFxDefFunc_.apply(fxDefs_,[null,1,textValue_]);
			}
			
			if(fxDefs_.length > 0){
				element_.jgMappedFxDefs = fxDefs_;
				fxMappingElements_.push(element_);
			}
		});
		
		this._mappingElementsList.insert(columnMappingElements_, rowIndex_);
		this._mappingFxElementsList.insert(fxMappingElements_, rowIndex_);
		
		// event mapping
		var columnMappingElementsLength_ = columnMappingElements_.length;
		for(var eIndex_=0;eIndex_<columnMappingElementsLength_;++eIndex_){
			var element_ = columnMappingElements_[eIndex_];
			element_.data("jgColumnMappingElemets",columnMappingElements_);
			var tagName_ = element_.prop("tagName").toLowerCase();
			
			var eventCommonOnChanged_ = (function(event_){
				var target_ = $(event_.target);
				var eColumnName_ = target_.attr(JGDataset.prototype.STR_MAP_COLUMNNAME);
				var eRowIndex_ = that_._mappingElementsList.indexOf(target_.data("jgColumnMappingElemets"));
				
				if(eColumnName_.indexOf(":") >= 0){return;} //fx handle
				that_.setColumnValue(eColumnName_, eRowIndex_, target_.val());
			});
			
			//input event
			if(tagName_ === "input"){
				var inputType_ = Object.NVL(element_.attr("type"), "text");
				if(inputType_ == "checkbox"){
					element_.on("click",function(event_){
						var target_ = $(event_.target);
						var eRowIndex_ = that_._mappingElementsList.indexOf(target_.data("jgColumnMappingElemets"));
						that_.setColumnValue(target_.attr(JGDataset.prototype.STR_MAP_COLUMNNAME), eRowIndex_, this.checked);
					});
				}else{
					element_.on("keyup change",eventCommonOnChanged_);
				}
			}else if(tagName_ === "textarea"){
				element_.on("keyup change",eventCommonOnChanged_);
			}
			//contenteditable div
			else if(tagName_ === "div" && element_.prop("contenteditable")){
				element_.on("change", function(event_){
					var target_ = $(event_.target);
					var eColumnName_ = target_.attr(JGDataset.prototype.STR_MAP_COLUMNNAME);
					var eRowIndex_ = that_._mappingElementsList.indexOf(target_.data("jgColumnMappingElemets"));
					
					if(eColumnName_.indexOf(":") >= 0){return;} //fx handle
					that_.setColumnValue(eColumnName_, eRowIndex_, target_.html());
				});
				element_.on("keyup", function(event_){
					var target_ = $(event_.target);
					target_.trigger("change");
				});
			}
			//select event
			else if(tagName_ === "select"){
				//on change event
				element_.on("change",function(event_){
					var target_ = $(event_.target);
					var eColumnName_ = target_.attr(JGDataset.prototype.STR_MAP_COLUMNNAME);
					var eRowIndex_ = that_._mappingElementsList.indexOf(target_.data("jgColumnMappingElemets"));
					var selectValue_ = target_.children("option:selected").first().attr("value");
					
					if(eColumnName_.indexOf(":") >= 0){return;} //fx handle
					that_.setColumnValue(eColumnName_, eRowIndex_, selectValue_);
				});
				
				var sBindDatasetName_ = element_.attr(JGDataset.prototype.STR_MAP_BINDDATASET);
				var sBindDisplayColumn_ = element_.attr(JGDataset.prototype.STR_MAP_DISPLAYCOLUMNNAME);
				var sBindValueColumn_ = element_.attr(JGDataset.prototype.STR_MAP_VALUECOLUMNNAME);
				
				if(!Object.isNull(sBindDatasetName_) && !Object.isNull(sBindDisplayColumn_) && !Object.isNull(sBindDisplayColumn_)){
					JGDS(sBindDatasetName_).addSelectForAutoFill(element_, sBindDisplayColumn_, sBindValueColumn_);
				}
			}
			//label,etc event
			else{/*do nothing*/}
		}
		
		//first fire event
		var eCount_ = columnMappingElements_.length;
		for(var eIndex_=0;eIndex_<eCount_;++eIndex_){
			var element_ = columnMappingElements_[eIndex_];
			this._refreshColumnMappingElements(element_.attr(JGDataset.prototype.STR_MAP_COLUMNNAME),rowIndex_,(eIndex_ == 0));
		}
		
		var convertedRowTemplate_ = $(rowContents_.contents());
		var funcRecusiveReplacer_ = (function(contents_){
			var cLength_ = contents_.length;
			for(var cIndex_=0;cIndex_<cLength_;++cIndex_){
				var content_ = contents_[cIndex_];
				var jContent_ = $(contents_[cIndex_]);
				if(content_.nodeType === 1){
					funcRecusiveReplacer_(jContent_.contents());
					var attrMap_ = content_.attributes;
					var attrLength_ = attrMap_.length;
					for(var aIndex_=0;aIndex_<attrLength_;++aIndex_){
						attrMap_[aIndex_].value = (attrMap_[aIndex_].value.jgFuncReplaceRegexpByDataset(that_, rowIndex_));
					}
				}else{
					var text_ = jContent_.text();
					if(text_.length > 0){
						content_.data = (text_.jgFuncReplaceRegexpByDataset(that_, rowIndex_));
					}
				}
			}
		});
		funcRecusiveReplacer_(convertedRowTemplate_);
		
		this._mappingRowList.insert(convertedRowTemplate_,rowIndex_);
		this._mappingTarget.insertAtIndex(convertedRowTemplate_,rowIndex_);
		if(!Object.isNull($.mobile)){
			convertedRowTemplate_.trigger("create");
		}
		
		this._mappingTarget.trigger("datasetrowmapped",[rowIndex_]);
	});
	JGDataset.prototype._removeMappingElements = (function(rowIndex_){
		if(Object.isNull(this._mappingTarget)) return;
		
		this._mappingElementsList.remove(rowIndex_);
		this._mappingFxElementsList.remove(rowIndex_);
		
		this._mappingRowList[rowIndex_].remove();
		this._mappingRowList.remove(rowIndex_);
	});
	JGDataset.prototype._updateMappingElements = (function(rowIndex_){
		if(Object.isNull(this._mappingTarget)) return;
		
		this._removeMappingElements(rowIndex_);
		this._addMappingElements(rowIndex_);
	});
	JGDataset.prototype._refreshColumnMappingElements = (function(columnName_, rowIndex_, doRefreshFx_){
		if(Object.isNull(this._mappingTarget)) return;
		
		doRefreshFx_ = Object.NVL(doRefreshFx_,true);
		
		var funcBindColumnValueToElement_ = (function(element_, columnValue_){
			var tagName_ = element_.prop("tagName").toLowerCase();
			
			//input type - checkbox
			if(tagName_ == "input" && element_.attr("type") == "checkbox"){
				if(element_.attr("checked") !== columnValue_) 
					element_.attr("checked", columnValue_);
			}
			//select
			else if(tagName_ == "select"){
				if(element_.val() !== columnValue_){
					element_.val(columnValue_);
					
					try{element_.trigger("refresh", true);}catch(ex_){}
				}
			}
			//label
			else if(tagName_ == "p" || tagName_ == "span" || tagName_ == "div" || tagName_ == "label"){
				columnValue_ = Object.NVL(columnValue_, "");
				if(element_.html() !== columnValue_)
					element_.html(columnValue_);
			}
			//others
			else{
				if(element_.val() !== columnValue_){
					element_.val(columnValue_);
				}
			}
		});
		
		var elements_ = this._getMappingElement(columnName_, rowIndex_);
		var columnValue_ = this.getColumnValue(columnName_, rowIndex_);
		
		var count_ = elements_.length;
		for(var eIndex_=0;eIndex_<count_;++eIndex_){
			var element_ = elements_[eIndex_];
			funcBindColumnValueToElement_(element_, columnValue_);
		}
		
		elements_ = this._mappingFxElementsList[rowIndex_];
		if(doRefreshFx_ && !Object.isNull(elements_)){
			count_ = elements_.length;
			for(var eIndex_=0;eIndex_<count_;++eIndex_){
				var element_ = elements_[eIndex_];
				var fxDefs_ = element_.jgMappedFxDefs;
				var fxCount_ = fxDefs_.length;
				for(var fxIndex_=0;fxIndex_<fxCount_;++fxIndex_){
					var fxDef_ = fxDefs_[fxIndex_];
					
					var convertFxValue_ = this._customFunctionConverter(fxDef_.fx, rowIndex_);
					if(convertFxValue_ === undefined) continue;
					
					if(fxDef_.type == 0){
						element_.attr(fxDef_.name,convertFxValue_);
					}else{
						element_.text(convertFxValue_);
					}
				}
			}
		}
	});
	
	JGDataset.prototype._getMappingElement = (function(columnName_, rowIndex_){
		var mappingElement_ = new Array();
		var mappingElements_ = this._mappingElementsList[rowIndex_];
		
		var count_ = mappingElements_.length;
		for(var index_=0;index_<count_;++index_){
			if(mappingElements_[index_].attr(JGDataset.prototype.STR_MAP_COLUMNNAME).toUpperCase() == columnName_.toUpperCase()){
				mappingElement_.push(mappingElements_[index_]);
			} 
		}
		
		return mappingElement_;
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

	/**
	 * JGDataset Management
	 */
	var JGDS = window.JGDS = (function(selector_, content_){
		if(Object.isNull(selector_)){
			return null;
		}
		
		var data_ = window.JGDS._datasetMap[($.type(selector_) === "string" ? window.JGDS.indexOfDataset(selector_) : selector_)];
		if(!Object.isNull(data_)){
			return data_.dataset;
		}
		
		if($.type(selector_) === "string"){
			dataset_ = new JGDataset(content_);
			window.JGDS._datasetMap.push({"name" : selector_, "dataset" : dataset_});
			return dataset_;
		}
	});
	
	JGDS._datasetMap = new Array();
	JGDS.countOfDataset = (function(){
		return JGDS._datasetMap.length;
	});
	JGDS.indexOfDataset = (function(key_){
		var count_ = JGDS._datasetMap.length;
		for(var index_=0;index_<count_;++index_){
			var data_ = JGDS._datasetMap[index_];
			
			if($.type(key_) === "string"){
				if(data_.name == key_){
					return index_;
				}
			}else{
				if(data_.dataset == key_){
					return index_;
				}
			}
		}
		
		return -1;
	});
	JGDS.nameOfDataset = (function(dataset_){
		var index_ = JGDS.indexOfDataset(dataset_);
		if(index_ >= 0){
			return JGDS._datasetMap[index_].name;
		}
		
		return null;
	});
	JGDS.make = (function(){
		if(Object.isNull(arguments)) return null;
		
		var result_ = new Array();
		var count_ = arguments.length;
		for(var index_=0;index_<count_;++index_){
			result_.push(JGDS(arguments[index_]));
		}
		
		return result_;
	});
	JGDS.remove = (function(selector_){
		JGDS._datasetMap.remove(($.type(selector_) === "string" ? JGDS.indexOfDataset(selector_) : selector_));
	});

	/*
	 * common key 
	 */
	JGDataset.prototype.STR_ROOT = "root";
	JGDataset.prototype.STR_ROW = "row";
	JGDataset.prototype.STR_COLUMN = "col";
	JGDataset.prototype.STR_COLUMNINFO = "columninfo";
	JGDataset.prototype.STR_ROWDATA = "rowdata";
	JGDataset.prototype.STR_ROWDATA_DELETED = "deletedRowdata";
	JGDataset.prototype.STR_NAME = "name";
	JGDataset.prototype.STR_ISKEY = "isKey";
	JGDataset.prototype.STR_VALUE = "value";
	JGDataset.prototype.STR_ROWSTATUS = "status";
	JGDataset.prototype.STR_MODIFY = "modify";
	/*
	 * form mapping 
	 */
	JGDataset.prototype.STR_MAP_COLUMNNAME = "jg-column";
	JGDataset.prototype.STR_MAP_BINDDATASET = "jg-bind-dataset";
	JGDataset.prototype.STR_MAP_DISPLAYCOLUMNNAME = "jg-display-column";
	JGDataset.prototype.STR_MAP_VALUECOLUMNNAME = "jg-value-column";
	JGDataset.prototype.STR_MAP_FXCHAR = "##fx:";

	//trigger key
	JGDataset.prototype._defaultTriggerKey_whenRowInserted = "rowinserted";
	JGDataset.prototype._defaultTriggerKey_whenRowRemoved = "rowremoved";
	JGDataset.prototype._defaultTriggerKey_whenColumnAdded = "columninserted";
	JGDataset.prototype._defaultTriggerKey_whenColumnRemoved = "columnremoved";
	JGDataset.prototype._defaultTriggerKey_whenColumValueChanged = "columnchanged";
	JGDataset.prototype._defaultTriggerKey_whenDatasetClear = "datasetclear";
	JGDataset.prototype._defaultTriggerKey_whenDatasetReset = "datasetreset";
	JGDataset.prototype._defaultTriggerKey_whenDatasetChanged = "datasetchanged";

	JGDataset.prototype._customTriggerKey_whenRowInserted = "_jgRowInserted";
	JGDataset.prototype._customTriggerKey_whenRowRemoved = "_jgRowRemoved";
	JGDataset.prototype._customTriggerKey_whenColumnAdded = "_jgColumnAdded";
	JGDataset.prototype._customTriggerKey_whenColumnRemoved = "_jgColumnRemoved";
	JGDataset.prototype._customTriggerKey_whenColumValueChanged = "_jgColumnValueChanged";
	JGDataset.prototype._customTriggerKey_whenDatasetClear = "_jgDatasetClear";
	JGDataset.prototype._customTriggerKey_whenDatasetReset = "_jgDatasetReset";
	JGDataset.prototype._customTriggerKey_whenDatasetChanged = "_jgDatasetChanged";

	JGDataset.prototype._customMappingJQKey_bindedDataset = "JGDataset.bindedDataset";
	JGDataset.prototype._customMappingJQKey_bindedElement = "JGDataset.bindedElement";
	JGDataset.prototype._customMappingJQKey_bindedRowIndex = "JGDataset.bindedRowIndex";

	JGDataset.prototype.fillOptionToSelect = (function(select_,displayColumn_,valueColumn_){
		var orgValue_ = null;
		
		var orgSelectedOption_ = select_.children("option[selected]");
		if(orgSelectedOption_.length !== 0){
			orgValue_ = orgSelectedOption_.val();
		}
		
		select_.children().remove();
		
		var funcCreateSelectOption_ = (function(title_,value_){
			return $("<option "+Object.NVL2(value_,"value='"+value_+"'","value=''")+">"+title_+"</option>");
		});
		
		var rowCount_ = this.getRowCount();
		for(var rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			var optionName_ = this.getColumnValue(displayColumn_,rowIndex_);
			var optionValue_ = this.getColumnValue(valueColumn_,rowIndex_);
			select_.append(funcCreateSelectOption_(optionName_,optionValue_));
		}
		
		var newSelectedOption_ = select_.children("option[value='"+orgValue_+"']");
		if(!Object.isNull(orgValue_) && newSelectedOption_.length > 0){
			newSelectedOption_.attr("selected",true);
		}
		
		return select_;
	});
	
	$.fn.JGMappingDataset = (function(datasetName_){
		datasetName_ = Object.NVL(datasetName_,this.attr("jg-dataset"));
		if(Object.isNull(datasetName_)){
			console.error("dataset not defined");
			return;
		}
		var dataset_ = JGDS(datasetName_);
		dataset_.mapping(this);
	});
	$.fn.JGIsMapped = (function(datasetName_){
		datasetName_ = Object.NVL(datasetName_,this.attr("jg-dataset"));
		if(Object.isNull(datasetName_)){
			return false;
		}
		var dataset_ = JGDS(datasetName_);
		return !Object.isNull(dataset_._mappingTarget);
	}); 
	
	/*$.widget("jg.JGDatasetView",{
		initSelector : "[jg-dataset]"
		,_dataset : null
		,_create : function(){
			var that_ = this;
			var element_ = this.element;
			this._dataset = JGDS(element_.attr("[jg-dataset]"));
			this._dataset.mapping(element_);
		},refresh : function(){
			this._dataset.reloadMappingElements();
		}
	});*/
	
	$(document).on(Object.NVL2($.mobile,"pagebeforecreate","ready"), function(){
		$(JGDS).trigger("beforeload");
		var bindElements_ = $(document).find("[jg-dataset]");
		
		bindElements_.each(function(index_){
			var bindElement_ = $(this);
			bindElement_.JGMappingDataset();
		});
		
		$(JGDS).trigger("afterload");
	});
	
})(window);