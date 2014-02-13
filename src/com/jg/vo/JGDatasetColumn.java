package com.jg.vo;

public class JGDatasetColumn{
	protected String _name;
	protected void setName(String name_){
		_name = name_.toUpperCase();
	}
	public String getName(){
		return _name;
	}
	
	protected boolean _isKey;
	protected void setKey(boolean key_){
		_isKey = key_;
	}
	public boolean isKey(){
		return _isKey;
	}
	
	protected JGDatasetColumn(String name_){
		setName(name_);
		_isKey = false;
	}
}
