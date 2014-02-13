package com.jg.vo;

import java.util.HashMap;

public class JGDatasetRow{
	
	static public final int ROWSTATUS_NORMAL = 0;
	static public final int ROWSTATUS_INSERT = 1;
	static public final int ROWSTATUS_UPDATE = 3;
	
	public HashMap<String, Object> columns = new HashMap<String, Object>();
	protected HashMap<String, Object> _orgColumns = new HashMap<String, Object>();
	protected HashMap<String, Boolean> _columnStatus = new HashMap<String, Boolean>();
	
	protected int _rowStatus = ROWSTATUS_NORMAL;
	protected void setRowStatus(int rowStatus_){
		_rowStatus = rowStatus_;
	}
	public int getRowStatus(){
		return _rowStatus;
	}
	
	public JGDatasetRow(){}
	
	private void _updateRowStatus(){
		if(_rowStatus == ROWSTATUS_INSERT) return;
		boolean didUpdate_ = false;
		Object[] columnNames_ = (Object[])_columnStatus.keySet().toArray();
		int columnCount_ = columnNames_.length;
		for(int columnIndex_=0;columnIndex_<columnCount_;++columnIndex_){
			boolean isModify_ = _columnStatus.get(columnNames_[columnIndex_]).booleanValue();
			if(isModify_){
				didUpdate_ = true;
				break;
			}
		}
		_rowStatus = (didUpdate_ ? ROWSTATUS_UPDATE : ROWSTATUS_NORMAL);
	}
	
	protected void setColumn(String columnName_, Object value_, boolean isModify_){
		String cColumnName_ = columnName_.toUpperCase();
		columns.put(cColumnName_, value_);
		_columnStatus.put(cColumnName_, Boolean.valueOf(isModify_));
		_updateRowStatus();
	}
	public void setColumn(String columnName_, Object value_){
		Object orgValue_ = _orgColumns.get(columnName_.toUpperCase());
		boolean isModify_ = isColumnModified(columnName_);
		boolean isNullOrgValue_ = orgValue_ == null;
		boolean isNullValue_ = value_ == null;
		
		if(isModify_){
			if((isNullOrgValue_ && isNullValue_) || ((!(isNullOrgValue_ || isNullValue_)) && (String.valueOf(orgValue_).equals(String.valueOf(value_))))){
				isModify_ = false;
			}
		}else{
			if((!(isNullOrgValue_ && isNullValue_)) || String.valueOf(orgValue_).equals(String.valueOf(value_))){
				isModify_ = true;
			}
		}
		setColumn(columnName_, value_, isModify_);
	}	
	protected void removeColumn(String columnName_){
		columns.remove(columnName_.toUpperCase());
	}
	public Object getColumnValue(String columnName_){
		return columns.get(columnName_.toUpperCase());
	}
	
	public boolean isColumnModified(String columnName_){
		Boolean result_ = _columnStatus.get(columnName_.toUpperCase());
		if(result_ == null){
			return false;
		}
		return result_.booleanValue();
	}
	protected void setColumnModification(String columnName_, Boolean bool_){
		_columnStatus.put(columnName_.toUpperCase(), new Boolean(bool_));
	}
	
	public void apply(){
		_orgColumns.clear();
		_orgColumns.putAll(columns);
		_rowStatus = ROWSTATUS_NORMAL;
		_columnStatus.clear();
	}
}
