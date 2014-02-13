package com.jg.vo;

import java.util.ArrayList;
import java.util.HashMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class JGDataset {
	static public final String STR_ROOT = "root";
	static public final String STR_ROW = "row";
	static public final String STR_COLUMN = "col";
	static public final String STR_COLUMNINFO = "columninfo";
	static public final String STR_ROWDATA = "rowdata";
	static public final String STR_ROWDATA_DELETED = "deletedRowdata";
	static public final String STR_NAME = "name";
	static public final String STR_ISKEY = "isKey";
	static public final String STR_VALUE = "value";
	static public final String STR_ROWSTATUS = "status";
	static public final String STR_MODIFY = "modify";
	
	protected ArrayList<JGDatasetColumn> _columnInfo = new ArrayList<JGDatasetColumn>();
	protected ArrayList<JGDatasetColumn> _orgColumnInfo = new ArrayList<JGDatasetColumn>();
	protected ArrayList<JGDatasetRow> _rowData = new ArrayList<JGDatasetRow>();
	protected ArrayList<JGDatasetRow> _orgRowData = new ArrayList<JGDatasetRow>();
	
	protected ArrayList<JGDatasetRow> _deletedRowData = new ArrayList<JGDatasetRow>();
	
	/**
	 * return copied deleted row data by {@link ArrayList}<br>
	 * @return ({@link ArrayList}) deleted row data(copied)
	 */
	public ArrayList<JGDatasetRow> getDeletedRowData(){
		ArrayList<JGDatasetRow> copy_ = new ArrayList<JGDatasetRow>();
		copy_.addAll(_deletedRowData);
		return copy_;
	}
	/**
	 * return count of column<br>
	 * @return (int) count of column
	 */
	public int getColumnCount(){
		return _columnInfo.size();
	}
	/**
	 * return count of row<br>
	 * @return (int) count of row
	 */
	public int getRowCount(){
		return _rowData.size();
	}
	/**
	 * return count of deleted row<br>
	 * @return (int) count of deleted row
	 */
	public int getDeletedRowCount(){
		return _deletedRowData.size();
	}
	
	static public JGDataset dataset(){
		return new JGDataset();
	}
	static public JGDataset dataset(String jSONString_){
		return new JGDataset(jSONString_);
	}
	static public JGDataset dataset(Object jsonObject_){
		return new JGDataset(jsonObject_);
	}
	
	public JGDataset(){}
	public JGDataset(String jSONString_){
		applyJSON(jSONString_);
	}
	public JGDataset(Object jsonObject_){
		applyJSON(jsonObject_);
	}
	
	/**
	 * insert column at index<br>
	 * @param ({{@link String}}) column data
	 * @return ({@link JGDatasetColumn}) column data
	 */
	public JGDatasetColumn insertColumn(String columnName_, int columnIndex_){
		JGDatasetColumn columnItem_ = new JGDatasetColumn(columnName_);
		_columnInfo.add(columnIndex_, columnItem_);
		
		int rowCount_ = _rowData.size();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			JGDatasetRow rowItem_ = _rowData.get(rowIndex_);
			rowItem_.setColumn(columnName_, null);
		}
		
		rowCount_ = _deletedRowData.size();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			JGDatasetRow rowItem_ = _deletedRowData.get(rowIndex_);
			rowItem_.setColumn(columnName_, null);
		}
		
		return columnItem_;
	}
	/**
	 * add column at last index<br>
	 * @see #insertColumn(String, int)
	 * @param ({@link JGDatasetColumn}) column data
	 */
	public JGDatasetColumn addColumn(String columnName_){
		return insertColumn(columnName_, _columnInfo.size());
	}
	/**
	 * add columns to last index<br> 
	 * @param ({@link String}) columns
	 */
	public void addColumns(String... columnNames_){
		for(String columnName_ : columnNames_)
			addColumn(columnName_);
	}
	
	/**
	 * remove column by index<br>
	 * @see #removeColumn(JGDatasetColumn)
	 * @see #removeColumn(String)
	 * @param (int) index of column
	 */
	public void removeColumn(int columnIndex_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		int rowCount_ = _rowData.size();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			_rowData.get(rowIndex_).removeColumn(columnItem_._name);
		}
		
		rowCount_ = _deletedRowData.size();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			_deletedRowData.get(rowIndex_).removeColumn(columnItem_._name);
		}
		
		_columnInfo.remove(columnIndex_);
	}
	/**
	 * remove column<br>
	 * @see #removeColumn(int)
	 * @see #removeColumn(String)
	 * @param (JGDatasetColumn) column
	 */
	public void removeColumn(JGDatasetColumn column_){
		removeColumn(indexOfColumn(column_));
	}
	/**
	 * remove column by name of column
	 * @see #removeColumn(int)
	 * @see #removeColumn(JGDatasetColumn)
	 * @param (String) name of column
	 */
	public void removeColumn(String columnName_){
		removeColumn(indexOfColumn(columnName_));
	}
	
	/**
	 * get column at index of column
	 * @see #getColumn(String)
	 * @param (int) index of column
	 * @return ({@link JGDatasetColumn}) column
	 */
	public JGDatasetColumn getColumn(int columnIndex_){
		return _columnInfo.get(columnIndex_);
	}
	/**
	 * get column by name of column
	 * @see #getColumn(int)
	 * @param ({@link String}) name of column
	 * @return ({@link JGDatasetColumn}) column
	 */
	public JGDatasetColumn getColumn(String columnName_){
		return getColumn(indexOfColumn(columnName_));
	}
	
	/**
	 * find index of column
	 * @see #indexOfColumn(String)
	 * @param ({@link JGDatasetColumn}) column
	 * @return (int) index of column
	 */
	public int indexOfColumn(JGDatasetColumn column_){
		return _columnInfo.indexOf(column_);
	}
	/**
	 * find index of column by name of column
	 * @param ({@link String}) name of column
	 * @return (int) index of column
	 */
	public int indexOfColumn(String columnName_){
		int columnCount_ = _columnInfo.size();
		for(int index_=0;index_<columnCount_;++index_){
			if(_columnInfo.get(index_)._name.equalsIgnoreCase(columnName_)){
				return index_;
			}
		}
		
		return -1;
	}
	
	public void setKeyColumn(int columnIndex_, boolean isKey_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		columnItem_.setKey(isKey_);
	}
	public void setKeyColumn(String columnName_, boolean isKey_){
		setKeyColumn(indexOfColumn(columnName_), isKey_);
	}
	public ArrayList<JGDatasetColumn> getKeyColumnList(){
		ArrayList<JGDatasetColumn> columnList_ = new ArrayList<JGDatasetColumn>();
		int columnCount_ = _columnInfo.size();
		for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			JGDatasetColumn columnItem_ = getColumn(columnIndex_);
			if(columnItem_._isKey){
				columnList_.add(columnItem_);
			}
		}
		
		return columnList_;
	}
	
	protected JGDatasetRow createRow(int rowStatus_){
		JGDatasetRow rowItem_ = new JGDatasetRow();
		rowItem_.setRowStatus(rowStatus_);
		int columnCount_ = _columnInfo.size();
		for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			JGDatasetColumn columnItem_ = _columnInfo.get(columnIndex_);
			rowItem_.setColumn(columnItem_._name, null);
		}
		return rowItem_;
	}
	public void insertRow(int rowIndex_){
		_rowData.add(rowIndex_, createRow(JGDatasetRow.ROWSTATUS_INSERT));
	}
	public int addRow(){
		int rowIndex_ = _rowData.size();
		insertRow(rowIndex_);
		return rowIndex_;
	}
	public void removeRow(int rowIndex_){
		JGDatasetRow rowItem_ = getRow(rowIndex_);
		
		switch(rowItem_.getRowStatus()){
			case JGDatasetRow.ROWSTATUS_NORMAL:
			case JGDatasetRow.ROWSTATUS_UPDATE:{
				_deletedRowData.add(rowItem_);
				break;
			}
			case JGDatasetRow.ROWSTATUS_INSERT:
			default:{
				break;
			}
		}
		
		_rowData.remove(rowIndex_);
	}
	public JGDatasetRow getRow(int rowIndex_){
		return _rowData.get(rowIndex_);
	}
	
	public void setColumnValue(String columnName_, int rowIndex_, Object value_, boolean mergeColumn_){
		int columnIndex_ = indexOfColumn(columnName_);
		if(columnIndex_ < 0){
			if(!mergeColumn_) throw new NullPointerException("not exists column");
			addColumn(columnName_);
		}
		JGDatasetRow rowItem_ = getRow(rowIndex_);
		rowItem_.setColumn(columnName_, value_);
	}
	public void setColumnValue(String columnName_, int rowIndex_, Object value_){
		setColumnValue(columnName_, rowIndex_, value_, false);
	}
	public void setColumnValue(int columnIndex_, int rowIndex_, Object value_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		setColumnValue(columnItem_._name, rowIndex_, value_, false);
	}
	/**
	 * set column values<br>["key1",value1,"key2",value2,...]
	 * @see #setColumnValue(int, int, Object)
	 * @see #setColumnValue(String, int, Object)
	 * @param (int) index of row
	 * @param ({@link Object[]}) column names and values
	 */
	public void setColumnValues(int rowIndex_, Object[] columnNamesAndValues_, boolean mergeColumns_){
		int count_ = columnNamesAndValues_.length;
		for(int columnIndex_=0;columnIndex_<count_;columnIndex_+=2){
			setColumnValue((String)columnNamesAndValues_[columnIndex_], rowIndex_, columnNamesAndValues_[columnIndex_+1], mergeColumns_);
		}
	}
	public void setColumnValues(int rowIndex_, Object[] columnNamesAndValues_){
		setColumnValues(rowIndex_, columnNamesAndValues_, false);
	}
	
	
	public Object getColumnValue(String columnName_, int rowIndex_){
		return getRow(rowIndex_).getColumnValue(columnName_);
	}
	public Object getColumnValue(int columnIndex_, int rowIndex_){
		return getColumnValue(getColumn(columnIndex_)._name, rowIndex_);
	}
	
	public boolean isColumnModified(String columnName_, int rowIndex_){
		return getRow(rowIndex_).isColumnModified(columnName_);
	}
	public boolean isColumnModified(int columnIndex_, int rowIndex_){
		return isColumnModified(getColumn(columnIndex_)._name, rowIndex_);
	}
	
	public JGDatasetRow getDeletedRow(int rowIndex_){
		return _deletedRowData.get(rowIndex_);
	}
	public int indexOfDeletedRow(JGDatasetRow rowItem_){
		return _deletedRowData.indexOf(rowItem_);
	}
	public Object getDeletedColumnValue(String columnName_, int rowIndex_){
		return getDeletedRow(rowIndex_).getColumnValue(columnName_);
	}
	
	public void apply(){
		int rowCount_ = _rowData.size();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			JGDatasetRow rowItem_ = getRow(rowIndex_);
			rowItem_.apply();
		}
		_deletedRowData.clear();
		_orgRowData.clear();
		_orgRowData.addAll(_rowData);
		_orgColumnInfo.clear();
		_orgColumnInfo.addAll(_columnInfo);
	}
	public void reset(){
		_deletedRowData.clear();
		_rowData.clear();
		_rowData.addAll(_orgRowData);
		_columnInfo.clear();
		_columnInfo.addAll(_orgColumnInfo);
	}
	public void clear(boolean deleteColumn_){
		if(deleteColumn_) _columnInfo.clear();
		_rowData.clear();
		_deletedRowData.clear();
	}
	public void clear(){
		clear(true);
	}
	public void setRowStatus(int rowIndex_, int rowStatus_){
		getRow(rowIndex_).setRowStatus(rowStatus_);
	}
	
	public boolean isModified(){
		int rowCount_ = getRowCount();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(getRow(rowIndex_).getRowStatus() != JGDatasetRow.ROWSTATUS_NORMAL){
				return true;
			}
		}
		
		return false;
	}
	
	@SuppressWarnings("unchecked")
	public Object toJSON(boolean onlyData_){
		if(onlyData_){
			JSONArray rootObject_ = new JSONArray();
			
			int rowCount_ = _rowData.size();
			int colCount_ = _columnInfo.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				HashMap<String, Object> rowItem_ = new HashMap<String, Object>();
				for(int colIndex_=0;colIndex_<colCount_;++colIndex_){
					String columnName_ = _columnInfo.get(colIndex_)._name;
					rowItem_.put(columnName_, _rowData.get(rowIndex_).getColumnValue(columnName_));
				}
				
				rootObject_.add(rowItem_);
			}
			
			return rootObject_;
		}else{
			HashMap<String, Object> rootObject_ = new HashMap<String, Object>();
			
			//make column info
			ArrayList<HashMap<String, Object>> columnInfo_ = new ArrayList<HashMap<String, Object>>(); 
			int columnCount_ = _columnInfo.size();
			for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				JGDatasetColumn columnItem_ = _columnInfo.get(columnIndex_);
				
				HashMap<String, Object> column_ = new HashMap<String, Object>();
				column_.put(STR_NAME, columnItem_._name);
				column_.put(STR_ISKEY, columnItem_._isKey);
				columnInfo_.add(column_);
			}
			rootObject_.put(STR_COLUMNINFO, columnInfo_);
			
			//make row data
			ArrayList<HashMap<String, Object>> rowData_ = new ArrayList<HashMap<String, Object>>();
			int rowCount_ = _rowData.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				JGDatasetRow rowItem_ = _rowData.get(rowIndex_);
				HashMap<String, Object> row_ = new HashMap<String, Object>();
				HashMap<String, Object> columns_ = new HashMap<String, Object>();
				for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					JGDatasetColumn columnItem_ = _columnInfo.get(columnIndex_);
					
					HashMap<String, Object> column_ = new HashMap<String, Object>();

					column_.put(STR_VALUE, getColumnValue(columnItem_._name, rowIndex_));
					column_.put(STR_MODIFY, rowItem_.isColumnModified(columnItem_._name));
					columns_.put(columnItem_._name, column_);
				}
				
				row_.put(STR_ROW, columns_);
				row_.put(STR_ROWSTATUS,rowItem_.getRowStatus());
				rowData_.add(row_);
			}
			rootObject_.put(STR_ROWDATA, rowData_);
			
			//make deleted row data
			ArrayList<HashMap<String, Object>> deletedRowData_ = new ArrayList<HashMap<String, Object>>();
			rowCount_ = _deletedRowData.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				HashMap<String, Object> row_ = new HashMap<String, Object>();
				HashMap<String, Object> columns_ = new HashMap<String, Object>();
				
				for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					JGDatasetColumn columnItem_ = _columnInfo.get(columnIndex_);
					Object columnValue_ = getDeletedColumnValue(columnItem_._name, rowIndex_);
					
					HashMap<String, Object> column_ = new HashMap<String, Object>();
					column_.put(STR_VALUE, columnValue_);
					columns_.put(columnItem_._name, column_);
				}
				row_.put(STR_ROW, columns_);
				deletedRowData_.add(row_);
			}
			rootObject_.put(STR_ROWDATA_DELETED, deletedRowData_);
			return new JSONObject(rootObject_);
		}
	}
	public JSONObject toJSON(){
		return (JSONObject)toJSON(false);
	}
	public String toJSONString(boolean onlyData_){
		Object result_ = toJSON(onlyData_);
		
		if(onlyData_){
			return ((JSONArray)result_).toJSONString();
		}else{
			return ((JSONObject)result_).toJSONString();
		}
	}
	public String toJSONString(){
		return toJSON().toJSONString();
	}
	
	public void applyJSON(Object jsonObject_){
		clear();
		
		if(jsonObject_.getClass() == JSONArray.class){
			JSONArray rootDataArray_ = (JSONArray)jsonObject_;
			
			//add column
			JSONObject firstObject_ = (JSONObject)rootDataArray_.get(0);
			Object[] columnList_ = (Object[])firstObject_.keySet().toArray();
			int columnCount_ = columnList_.length;
			for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				addColumn((String)columnList_[columnIndex_]);
			}
			
			//add row & set value
			int rowCount_ = rootDataArray_.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				addRow();
				JSONObject rowObject_ = (JSONObject)rootDataArray_.get(rowIndex_);
				
				for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					Object value_ = rowObject_.get(getColumn(columnIndex_)._name);
					setColumnValue(columnIndex_, rowIndex_, value_);
				}
			}
			
			apply();
		
		}else{
			JSONObject rootObject_ = (JSONObject)jsonObject_;
			
			//apply column info
			JSONArray columnInfo_ = (JSONArray)rootObject_.get(STR_COLUMNINFO);
			int columnCount_ = columnInfo_.size();
			for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
				JSONObject column_ = (JSONObject)columnInfo_.get(columnIndex_);
				JGDatasetColumn columnItem_ = addColumn((String)column_.get(STR_NAME));
				columnItem_.setKey(((Boolean)column_.get(STR_ISKEY)).booleanValue());
			}
			
			//apply row data
			JSONArray rowData_ = (JSONArray)rootObject_.get(STR_ROWDATA);
			int rowCount_ = rowData_.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				JGDatasetRow rowItem_ = getRow(addRow());
				
				JSONObject row_ = (JSONObject)rowData_.get(rowIndex_);
				JSONObject rowValues_ = (JSONObject)row_.get(STR_ROW);
				
				for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					JGDatasetColumn columnItem_ = getColumn(columnIndex_);
					JSONObject columnValue_ = (JSONObject)rowValues_.get(columnItem_._name);
					
					boolean isModify_ = false;
					try{
						isModify_ = ((Boolean)columnValue_.get(STR_MODIFY)).booleanValue();
					}catch(Exception ex_){}
					
					rowItem_.setColumn(columnItem_._name, columnValue_.get(STR_VALUE), isModify_);
				}
				rowItem_.setRowStatus(((Long)row_.get(STR_ROWSTATUS)).intValue());
			}
			
			//apply deleted row data
			JSONArray deletedRowData_ = (JSONArray)rootObject_.get(STR_ROWDATA_DELETED);
			rowCount_ = deletedRowData_.size();
			for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
				JGDatasetRow rowItem_ = new JGDatasetRow();
				_deletedRowData.add(rowItem_);
				JSONObject row_ = (JSONObject)((JSONObject)deletedRowData_.get(rowIndex_)).get(STR_ROW);
				
				for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
					JGDatasetColumn columnItem_ = getColumn(columnIndex_);
					JSONObject columnValue_ = (JSONObject)row_.get(columnItem_._name);
					
					rowItem_.setColumn(columnItem_._name, columnValue_.get(STR_VALUE));
				}
			}
		}
	}
	public void applyJSON(String jSONString_){
		try{
			applyJSON(new JSONParser().parse(jSONString_));
		}catch(ParseException ex_){
			throw new RuntimeException("can't parse JGDataset JSON Data", ex_);
		}
	}
}
