package com.jg.vo;

import java.util.ArrayList;
import java.util.HashMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * JGDataset
 * @author Hyeong yeon. Kim. kimbobv22@gmail.com
 * @version 1.1.0
 */
public class JGDataset {
	static protected final String STR_ROOT = "root";
	static protected final String STR_ROW = "row";
	static protected final String STR_COLUMN = "col";
	static protected final String STR_COLUMNINFO = "columninfo";
	static protected final String STR_ROWDATA = "rowdata";
	static protected final String STR_ROWDATA_DELETED = "deletedRowdata";
	static protected final String STR_NAME = "name";
	static protected final String STR_ISKEY = "isKey";
	static protected final String STR_VALUE = "value";
	static protected final String STR_ROWSTATUS = "status";
	static protected final String STR_MODIFY = "modify";
	
	protected ArrayList<JGDatasetColumn> _columnInfo = new ArrayList<JGDatasetColumn>();
	protected ArrayList<JGDatasetColumn> _orgColumnInfo = new ArrayList<JGDatasetColumn>();
	protected ArrayList<JGDatasetRow> _rowData = new ArrayList<JGDatasetRow>();
	protected ArrayList<JGDatasetRow> _orgRowData = new ArrayList<JGDatasetRow>();
	
	protected ArrayList<JGDatasetRow> _deletedRowData = new ArrayList<JGDatasetRow>();
	
	/**
	 * 삭제된 행데이타를 반환합니다.
	 * @return 삭제된 행데이타(복제본)
	 */
	public ArrayList<JGDatasetRow> getDeletedRowData(){
		ArrayList<JGDatasetRow> copy_ = new ArrayList<JGDatasetRow>();
		copy_.addAll(_deletedRowData);
		return copy_;
	}
	/**
	 * 열갯수를 반환합니다.
	 * @return 열갯수
	 */
	public int getColumnCount(){
		return _columnInfo.size();
	}
	/**
	 * 행갯수를 반환합니다.
	 * @return 행갯수
	 */
	public int getRowCount(){
		return _rowData.size();
	}
	/**
	 * 삭제된 행 갯수를 반환합니다.
	 * @return 삭제된 행갯수
	 */
	public int getDeletedRowCount(){
		return _deletedRowData.size();
	}
	/**
	 * JGDataset 생성합니다.
	 */
	static public JGDataset dataset(){
		return new JGDataset();
	}
	/**
	 * JGDataset 생성합니다.
	 * @param jSONString_ JSON문자열
	 */
	static public JGDataset dataset(String jSONString_){
		return new JGDataset(jSONString_);
	}
	/**
	 * JGDataset 생성합니다.
	 * @param jsonObject_ JSON객체
	 */
	static public JGDataset dataset(Object jsonObject_){
		return new JGDataset(jsonObject_);
	}
	
	/**
	 * JGDataset 생성자
	 */
	public JGDataset(){}
	/**
	 * JGDataset 생성합니다.
	 * @param jSONString_ JSON문자열
	 */
	public JGDataset(String jSONString_){
		applyJSON(jSONString_);
	}
	/**
	 * JGDataset 생성합니다.
	 * @param jsonObject_ JSON객체
	 */
	public JGDataset(Object jsonObject_){
		applyJSON(jsonObject_);
	}
	
	/**
	 * 특정 열색인에 열을 삽입합니다.
	 * @param columnName_ 열명
	 * @param columnIndex_ 열색인
	 * @return 열
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
	 * 마지막 열색인에 열을 추가합니다.
	 * @param columnName_ 열명
	 * @return 열
	 */
	public JGDatasetColumn addColumn(String columnName_){
		return insertColumn(columnName_, _columnInfo.size());
	}
	/**
	 * 마지막 열색인에 복수의 열을 추가합니다.
	 * @param columnNames_ 열명
	 */
	public void addColumns(String... columnNames_){
		for(String columnName_ : columnNames_)
			addColumn(columnName_);
	}
	
	/**
	 * 특정 열색인에 열을 삭제합니다.
	 * @param columnIndex_ 열색인
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
	 * 특정 열을 삭제합니다.
	 * @param column_ 열
	 */
	public void removeColumn(JGDatasetColumn column_){
		removeColumn(indexOfColumn(column_));
	}
	/**
	 * 특정 열명의 열을 삭제합니다.
	 * @param columnName_ 열명
	 */
	public void removeColumn(String columnName_){
		removeColumn(indexOfColumn(columnName_));
	}
	
	/**
	 * 특정 열색인의 열을 반환합니다.
	 * @param columnIndex_ 열색인
	 * @return 열
	 */
	public JGDatasetColumn getColumn(int columnIndex_){
		return _columnInfo.get(columnIndex_);
	}
	/**
	 * 특정 열명의 열을 반환합니다.
	 * @param columnName_ 열명
	 * @return 열
	 */
	public JGDatasetColumn getColumn(String columnName_){
		return getColumn(indexOfColumn(columnName_));
	}
	
	/**
	 * 특정 열색인을 반환합니다.
	 * @param column_ 열
	 * @return 열색인
	 */
	public int indexOfColumn(JGDatasetColumn column_){
		return _columnInfo.indexOf(column_);
	}
	/**
	 * 특정 열색인을 반환합니다.
	 * @param columnName_ 열
	 * @return 열색인
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
	
	/**
	 * 특정 열을 키열로 설정합니다.
	 * @param columnIndex_ 열색인
	 * @param isKey_ 키여부
	 */
	public void setKeyColumn(int columnIndex_, boolean isKey_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		columnItem_.setKey(isKey_);
	}
	/**
	 * 특정 열을 키열로 설정합니다.
	 * @param columnName_ 열명
	 * @param isKey_ 키여부
	 */
	public void setKeyColumn(String columnName_, boolean isKey_){
		setKeyColumn(indexOfColumn(columnName_), isKey_);
	}
	/**
	 * 키열 내역을 반환합니다.
	 * @return 키열 내역(복사본)
	 */
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
	
	/**
	 * 행을 생성합니다.
	 * @param rowStatus_ 행상태
	 * @return 행
	 */
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
	/**
	 * 특정 행색인에 행을 삽입합니다.
	 * @param rowIndex_ 행색인
	 * @return 행
	 */
	public JGDatasetRow insertRow(int rowIndex_){
		JGDatasetRow rowItem_ = createRow(JGDatasetRow.ROWSTATUS_INSERT);
		_rowData.add(rowIndex_, rowItem_);
		return rowItem_;
	}
	/**
	 * 마지막 행색인에 행을 추가합니다.
	 * @return 행색인
	 */
	public int addRow(){
		int rowIndex_ = _rowData.size();
		insertRow(rowIndex_);
		return rowIndex_;
	}
	/**
	 * 특정 행색인에 행을 삭제합니다.
	 * @param rowIndex_ 행색인
	 */
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
	/**
	 * 특정 행색인에 행을 반환합니다.
	 * @param rowIndex_ 행색인
	 * @return 행
	 */
	public JGDatasetRow getRow(int rowIndex_){
		return _rowData.get(rowIndex_);
	}
	
	/**
	 * 행상태를 변경합니다.
	 * @param rowIndex_ 행색인
	 * @param rowStatus_ 행상태
	 */
	public void setRowStatus(int rowIndex_, int rowStatus_){
		getRow(rowIndex_).setRowStatus(rowStatus_);
	}
	
	/**
	 * 열값을 설정합니다.<br>
	 * 열병합여부가 참일 경우, 해당 열이 존재하지 않을 경우 열을 생성합니다.
	 * @param columnName_ 열명
	 * @param rowIndex_ 행색인
	 * @param value_ 열값
	 * @param mergeColumn_ 열병합여부
	 */
	public void setColumnValue(String columnName_, int rowIndex_, Object value_, boolean mergeColumn_){
		int columnIndex_ = indexOfColumn(columnName_);
		if(columnIndex_ < 0){
			if(!mergeColumn_) throw new NullPointerException("not exists column");
			addColumn(columnName_);
		}
		JGDatasetRow rowItem_ = getRow(rowIndex_);
		rowItem_.setColumn(columnName_, value_);
	}
	/**
	 * 열값을 설정합니다.<br>
	 * @param columnName_ 열명
	 * @param rowIndex_ 행색인
	 * @param value_ 열값
	 */
	public void setColumnValue(String columnName_, int rowIndex_, Object value_){
		setColumnValue(columnName_, rowIndex_, value_, false);
	}
	/**
	 * 열값을 설정합니다.<br>
	 * 열병합여부가 참일 경우, 해당 열이 존재하지 않을 경우 열을 생성합니다.
	 * @param columnIndex_ 열색인
	 * @param rowIndex_ 행색인
	 * @param value_ 열값
	 * @param mergeColumn_ 열병합여부
	 */
	public void setColumnValue(int columnIndex_, int rowIndex_, Object value_, boolean mergeColumn_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		setColumnValue(columnItem_._name, rowIndex_, value_, mergeColumn_);
	}
	/**
	 * 열값을 설정합니다.<br>
	 * @param columnIndex_ 열색인
	 * @param rowIndex_ 행색인
	 * @param value_ 열값
	 */
	public void setColumnValue(int columnIndex_, int rowIndex_, Object value_){
		JGDatasetColumn columnItem_ = getColumn(columnIndex_);
		setColumnValue(columnItem_._name, rowIndex_, value_);
	}
	/**
	 * 복수의 열값을 설정합니다.<br>
	 * 열병합여부가 참일 경우, 해당 열이 존재하지 않을 경우 열을 생성합니다.<br>
	 * *형식 : ["열명1",열값1,"열명2",열값2,...]
	 * @param columnNamesAndValues_ 복수의 열값
	 * @param rowIndex_ 행색인
	 * @param mergeColumns_ 열병합여부
	 */
	public void setColumnValues(Object[] columnNamesAndValues_, int rowIndex_, boolean mergeColumns_){
		int count_ = columnNamesAndValues_.length;
		for(int columnIndex_=0;columnIndex_<count_;columnIndex_+=2){
			setColumnValue((String)columnNamesAndValues_[columnIndex_], rowIndex_, columnNamesAndValues_[columnIndex_+1], mergeColumns_);
		}
	}
	/**
	 * 복수의 열값을 설정합니다.<br>
	 * *형식 : ["열명1",열값1,"열명2",열값2,...]
	 * @param columnNamesAndValues_ 복수의 열값
	 * @param rowIndex_ 행색인
	 */
	public void setColumnValues(Object[] columnNamesAndValues_, int rowIndex_){
		setColumnValues(columnNamesAndValues_, rowIndex_, false);
	}
	
	/**
	 * 열값을 반환합니다.
	 * 
	 * @param columnName_ 열명
	 * @param rowIndex_ 행색인
	 * @return 열값
	 */
	public Object getColumnValue(String columnName_, int rowIndex_){
		return getRow(rowIndex_).getColumnValue(columnName_);
	}
	/**
	 * 열값을 반환합니다.
	 * 
	 * @param columnIndex_ 열색인
	 * @param rowIndex_ 행색인
	 * @return 열값
	 */
	public Object getColumnValue(int columnIndex_, int rowIndex_){
		return getColumnValue(getColumn(columnIndex_)._name, rowIndex_);
	}
	
	/**
	 * 열 수정여부를 반환합니다.
	 * @param columnName_ 열명
	 * @param rowIndex_ 행색인
	 * @return 열 수정여부
	 */
	public boolean isColumnModified(String columnName_, int rowIndex_){
		return getRow(rowIndex_).isColumnModified(columnName_);
	}
	/**
	 * 열 수정여부를 반환합니다.
	 * @param columnIndex_ 열색인
	 * @param rowIndex_ 행색인
	 * @return 열 수정여부
	 */
	public boolean isColumnModified(int columnIndex_, int rowIndex_){
		return isColumnModified(getColumn(columnIndex_)._name, rowIndex_);
	}
	/**
	 * 삭제된 행을 반환합니다.
	 * @param rowIndex_ 행색인
	 * @return 삭제된 행
	 */
	public JGDatasetRow getDeletedRow(int rowIndex_){
		return _deletedRowData.get(rowIndex_);
	}
	/**
	 * 삭제된 행의 행색인을 반환합니다.
	 * @param rowItem_ 삭제된 행
	 * @return 행색인
	 */
	public int indexOfDeletedRow(JGDatasetRow rowItem_){
		return _deletedRowData.indexOf(rowItem_);
	}
	/**
	 * 삭제된 행의 열값을 반환합니다.
	 * 
	 * @param columnName_ 열명
	 * @param rowIndex_ 행색인
	 * @return 열값
	 */
	public Object getDeletedColumnValue(String columnName_, int rowIndex_){
		return getDeletedRow(rowIndex_).getColumnValue(columnName_);
	}
	/**
	 * 데이타셋을 현재시점으로 적용합니다.
	 * 
	 * @see #reset()
	 */
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
	/**
	 * 데이타셋을 이전 적용시점으로 복원합니다.
	 * @see #apply()
	 */
	public void reset(){
		_deletedRowData.clear();
		_rowData.clear();
		_rowData.addAll(_orgRowData);
		_columnInfo.clear();
		_columnInfo.addAll(_orgColumnInfo);
	}
	/**
	 * 데이타셋을 전체삭제합니다.
	 * @param deleteColumn_ 열정보 삭제여부
	 */
	public void clear(boolean deleteColumn_){
		if(deleteColumn_) _columnInfo.clear();
		_rowData.clear();
		_deletedRowData.clear();
	}
	/**
	 * 데이타셋을 전체삭제합니다.
	 */
	public void clear(){
		clear(true);
	}
	
	/**
	 * 데이타셋의 변경여부를 반환합니다.
	 * @return 변경여부
	 */
	public boolean isModified(){
		int rowCount_ = getRowCount();
		for(int rowIndex_=0;rowIndex_<rowCount_;++rowIndex_){
			if(getRow(rowIndex_).getRowStatus() != JGDatasetRow.ROWSTATUS_NORMAL){
				return true;
			}
		}
		
		return false;
	}
	
	/**
	 * 데이타셋을 JSON객체로 반환합니다.
	 * @param onlyData_ 스카마생략여부
	 * @return JSON객체
	 */
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
	/**
	 * 데이타셋을 JSON객체로 반환합니다.
	 * @return JSON객체
	 */
	public JSONObject toJSON(){
		return (JSONObject)toJSON(false);
	}
	/**
	 * 데이타셋을 JSON형태의 문자열로 반환합니다.
	 * @param onlyData_ 스키마생략여부
	 * @return JSON형태의 문자열
	 */
	public String toJSONString(boolean onlyData_){
		Object result_ = toJSON(onlyData_);
		
		if(onlyData_){
			return ((JSONArray)result_).toJSONString();
		}else{
			return ((JSONObject)result_).toJSONString();
		}
	}
	/**
	 * 데이타셋을 JSON형태의 문자열로 반환합니다.
	 * @return JSON형태의 문자열
	 */
	public String toJSONString(){
		return toJSON().toJSONString();
	}
	/**
	 * 데이타셋을 JSON객체로 적용합니다.
	 * @param jsonObject_ JSON객체
	 */
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
	/**
	 * 데이타셋을 JSON형태의 문자열로 적용합니다.
	 * @param jSONString_ JSON형태의 문자열
	 */
	public void applyJSON(String jSONString_){
		try{
			applyJSON(new JSONParser().parse(jSONString_));
		}catch(ParseException ex_){
			throw new RuntimeException("can't parse JGDataset JSON Data", ex_);
		}
	}
}
