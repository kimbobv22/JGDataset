(function(c){if($===undefined||$==null){console.error("can't not initialize JGDataset, JQuery not found");return;}Object.isNull=(function(h){return(h===undefined||h==null);});Object.NVL2=(function(h,j,i){return(!this.isNull(h)?j:i);});Object.NVL=(function(h,i){return this.NVL2(h,h,i);});String.prototype.isBlank=(function(){return(this.length==0);});Array.prototype.indexOf=(function(i){var h=this.length;for(var j=0;j<h;++j){if(this[j]===i){return j;}}return -1;});Array.prototype.insert=(function(h,i){this.splice(i,0,h);});Array.prototype.remove=(function(h){this.splice(h,1);});Array.prototype.removeObject=(function(h){this.remove(this.indexOf(h));});Array.prototype.move=function(h,j){if(j>=this.length){var i=j-this.length;while((--i)+1){this.push(undefined);}}this.splice(j,0,this.splice(h,1)[0]);};Array.prototype.clone=(function(){return this.slice(0);});$.fn.insertAtIndex=(function(i,j){var h=this.children().size();if(j<0){j=Math.max(0,h+1+j);}this.append(i);if(j<h){this.children().eq(j).before(this.children().last());}return this;});var g=c.JGDatasetMappingElements=(function(){this.list=new Array();});g.prototype.insert=(function(h,i){this.list.insert(h,i);this._updateRowIndex();});g.prototype.remove=(function(h){this.list.remove(h);this._updateRowIndex();});g.prototype.length=(function(){return this.list.length;});g.prototype._updateRowIndex=(function(){var h=this.list.length;for(var j=0;j<h;++j){var i=this.list[j];$(i).data("rowIndex",j);}});var d=c.JGDatasetFXDefs=(function(){this.defs=new Array();});d.prototype.addDef=(function(j,i,h){this.defs.push({name:j,type:i,fx:h});});d.prototype.length=(function(){return this.defs.length;});var a=c.JGDatasetColumn=(function(h){this.name=h.toUpperCase();this._isKey=false;});a.prototype.getName=(function(){return this.name;});a.prototype.setName=(function(h){this.name=h;});a.prototype.isKey=(function(){return this._isKey;});a.prototype.setKey=(function(h){this._isKey=h;});var f=c.JGDatasetRow=(function(){this._columns={};this._orgColumns={};this._columnStatus={};this._rowStatus=f.prototype.ROWSTATUS_NORMAL;});f.prototype.getRowStatus=(function(){return this._rowStatus;});f.prototype.setRowStatus=(function(h){this._rowStatus=h;});f.prototype._updateRowStatus=(function(){if(this._rowStatus==f.prototype.ROWSTATUS_INSERT){return;}var i=false;for(var h in this._columnStatus){if(Object.NVL(this._columnStatus[h],false)){i=true;break;}}this._rowStatus=(i?f.prototype.ROWSTATUS_UPDATE:f.prototype.ROWSTATUS_NORMAL);});f.prototype.setColumn=(function(j,h,i){j=j.toUpperCase();this._columns[j]=h;if(Object.isNull(i)){this._columnStatus[j]=(this._orgColumns[j]!=h);}else{this._columnStatus[j]=i;}this._updateRowStatus();});f.prototype.removeColumn=(function(h){delete this._columns[h.toUpperCase()];});f.prototype.getColumnValue=(function(h){return this._columns[h.toUpperCase()];});f.prototype.isColumnModified=(function(i){var h=this._columnStatus[i.toUpperCase()];return Object.NVL2(h,false,h);});f.prototype.setColumnModification=(function(i,h){this._columnStatus[i.toUpperCase()]=h;});f.prototype.apply=(function(){this._orgColumns={};this._orgColumns=JSON.parse(JSON.stringify(this._columns));this._rowStatus=f.prototype.ROWSTATUS_NORMAL;this._columnStatus={};});f.prototype.reset=(function(){this._columns={};this._columns=JSON.parse(JSON.stringify(this._orgColumns));this._rowStatus=f.prototype.ROWSTATUS_NORMAL;this._columnStatus={};});f.prototype.ROWSTATUS_NORMAL=0;f.prototype.ROWSTATUS_INSERT=1;f.prototype.ROWSTATUS_UPDATE=3;var b=c.JGDataset=(function(h){this._columnInfo=new Array();this._orgColumnInfo=new Array();this._rowData=new Array();this._orgRowData=new Array();this._deletedRowData=new Array();this._mappingTarget=null;this._mappingRowElement=null;this._mappingElementsList=new g();this._mappingFxElementsList=new g();this._mappingTemplateList=new Array();$(this).on(b.prototype._customTriggerKey_whenRowInserted,function(j,k,i){if(i){$(this).trigger(b.prototype._defaultTriggerKey_whenRowInserted,k);}this._addMappingElements(k);});$(this).on(b.prototype._customTriggerKey_whenRowRemoved,function(i,j){$(this).trigger(b.prototype._defaultTriggerKey_whenRowRemoved,j);this._removeMappingElements(j);});$(this).on(b.prototype._customTriggerKey_whenColumnAdded,function(i,j){$(this).trigger(b.prototype._defaultTriggerKey_whenColumnAdded,j);});$(this).on(b.prototype._customTriggerKey_whenColumnRemoved,function(i,j){$(this).trigger(b.prototype._defaultTriggerKey_whenColumnRemoved,j);});$(this).on(b.prototype._customTriggerKey_whenColumValueChanged,function(j,l,k,i){if(i){$(this).trigger(b.prototype._defaultTriggerKey_whenColumValueChanged,[l,k]);}this._refreshMappingElements(l,k);});$(this).on(b.prototype._customTriggerKey_whenRowChanged,function(i,j){var l=this.getColumnCount();for(var k=0;k<l;++k){this._refreshMappingElements(this.getColumn(k).name,j);}});$(this).on(b.prototype._customTriggerKey_whenDatasetClear,function(j,i){if(i){$(this).trigger(b.prototype._defaultTriggerKey_whenDatasetClear);}this.reloadMappingElements();});$(this).on(b.prototype._customTriggerKey_whenDatasetReset,function(i){$(this).trigger(b.prototype._defaultTriggerKey_whenDatasetReset);this.reloadMappingElements();});$(this).on(b.prototype._customTriggerKey_whenDatasetChanged,function(j,i){if(i){$(this).trigger(b.prototype._defaultTriggerKey_whenDatasetChanged);}this.reloadMappingElements();});if(!Object.isNull(h)){this.applyJSON(h);}});b.prototype._convertColumnKeyToName=(function(h){return($.type(h)==="number"?this.getColumn(h).name:h);});b.prototype._convertColumnKeyToIndex=(function(h){return($.type(h)==="number"?h:this.indexOfColumn(h));});b.prototype.getColumnCount=(function(){return this._columnInfo.length;});b.prototype.getRowCount=(function(){return this._rowData.length;});b.prototype.getDeletedRowCount=(function(){return this._deletedRowData.length;});b.prototype.insertColumn=(function(m,j){var h=new a(m);this._columnInfo[j]=h;var l=this._rowData.length;for(var i=0;i<l;++i){var k=this._rowData[i];k.setColumn(m,null);}l=this._deletedRowData.length;for(var i=0;i<l;++i){var k=this._deletedRowData[i];k.setColumn(m,null);}this.reloadMappingElements();$(this).trigger(b.prototype._customTriggerKey_whenColumnAdded,m);return h;});b.prototype.addColumn=(function(h){return this.insertColumn(h,this._columnInfo.length);});b.prototype.addColumns=(function(){var h=arguments.length;for(var i=0;i<h;++i){this.addColumn(arguments[i]);}});b.prototype.removeColumn=(function(h){h=this._convertColumnKeyToIndex(h);var i=this.getColumn(h).name;this._columnInfo.splice(h,1);this.reloadMappingElements();$(this).trigger(b.prototype._customTriggerKey_whenColumnRemoved,i);});b.prototype.getColumn=(function(h){h=this._convertColumnKeyToIndex(h);return this._columnInfo[h];});b.prototype.indexOfColumn=(function(j){var h=this._columnInfo.length;for(var i=0;i<h;++i){if(this._columnInfo[i].name==j.toUpperCase()){return i;}}return -1;});b.prototype.createRow=(function(i){var k=new f();k.setRowStatus(i);var l=this._columnInfo.length;for(var j=0;j<l;++j){var h=this._columnInfo[j];k.setColumn(h.name,null);}return k;});b.prototype._insertRow=(function(h){this._rowData.insert(this.createRow(f.prototype.ROWSTATUS_INSERT),h);});b.prototype.insertRow=(function(h){this._insertRow(h);$(this).trigger(b.prototype._customTriggerKey_whenRowInserted,[h,true]);});b.prototype.addRow=(function(){var h=this._rowData.length;this.insertRow(h);return h;});b.prototype._removeRow=(function(h){var i=this.getRow(h);switch(i.getRowStatus()){case f.prototype.ROWSTATUS_NORMAL:case f.prototype.ROWSTATUS_UPDATE:this._deletedRowData.push(i);break;case f.prototype.ROWSTATUS_INSERT:default:break;}this._rowData.remove(h);});b.prototype.removeRow=(function(h){$(this).trigger(b.prototype._customTriggerKey_whenRowRemoved,h);this._removeRow(h);});b.prototype.getRow=(function(h){return this._rowData[h];});b.prototype.setRowStatus=(function(h,i){this.getRow(h).setRowStatus(i);});b.prototype.getRowStatus=(function(h){return this.getRow(h).getRowStatus();});b.prototype.getDeletedRow=(function(h){return this._deletedRowData[h];});b.prototype.moveRow=(function(h,i){this._rowData.move(h,i);$(this).trigger(b.prototype._customTriggerKey_whenRowChanged,h);$(this).trigger(b.prototype._customTriggerKey_whenRowChanged,i);});b.prototype.sortRow=(function(i,j){var l=this._convertColumnKeyToName(i);var k=this.getRowCount();this._rowData.sort(function(n,m){return j.apply(this,[n.getColumnValue(l),m.getColumnValue(l)]);});for(var h=0;h<k;++h){$(this).trigger(b.prototype._customTriggerKey_whenRowChanged,h);}});b.prototype.sortRowByAsc=(function(h){this.sortRow(h,function(j,i){return j-i;});});b.prototype.sortRowByDesc=(function(h){this.sortRow(h,function(j,i){return i-j;});});b.prototype._setColumnValue=(function(l,k,i,h){if($.type(l)==="number"){var j=this.getColumn(l);l=j.name;}else{var m=this.indexOfColumn(l);if(m<0){if(!Object.NVL(h,false)){console.error("not exists column ["+l+"]");}else{this.addColumn(l);}}}var n=this.getRow(k);n.setColumn(l,i);});b.prototype.setColumnValue=(function(l,k,j,i){l=this._convertColumnKeyToName(l);var h=this.getColumnValue(l,k);this._setColumnValue(l,k,j,i);if(h!=j){$(this).trigger("change",[l,k]);$(this).trigger(b.prototype._customTriggerKey_whenColumValueChanged,[l,k,true]);}});b.prototype.setColumnValues=(function(k,i,h){var j=i.length;for(var l=0;l<j;l+=2){this.setColumnValue(i[l],k,i[l+1],h);}});b.prototype.getColumnValue=(function(i,h){return this.getRow(h).getColumnValue(this._convertColumnKeyToName(i));});b.prototype.isColumnModified=(function(i,h){return this.getRow(h).isColumnModified(this._convertColumnKeyToName(i));});b.prototype.getDeletedColumnValue=(function(i,h){return this.getDeletedRow(h).getColumnValue(this._convertColumnKeyToName(i));});b.prototype.clear=(function(h){if(Object.NVL(h,true)){this._columnInfo=new Array();}this._rowData=new Array();this._deletedRowData=new Array();$(this).trigger(b.prototype._customTriggerKey_whenDatasetClear,Object.NVL(arguments[1],true));});b.prototype.apply=(function(){var j=this._rowData.length;for(var h=0;h<j;++h){var i=this.getRow(h);i.apply();}this._deletedRowData=new Array();this._orgRowData=this._rowData.clone();this._orgColumnInfo=this._columnInfo.clone();});b.prototype.reset=(function(){this._rowData=new Array();this._deletedRowData=new Array();this._rowData=this._orgRowData.clone();this._columnInfo=this._orgColumnInfo.clone();$(this).trigger(b.prototype._customTriggerKey_whenDatasetReset);});b.prototype.isModified=(function(){var i=this.getRowCount();for(var h=0;h<i;++h){if(this.getRowStatus(h)!=f.prototype.ROWSTATUS_NORMAL){return true;}}return false;});b.prototype.sumOfColumnValues=(function(l,k){var i=0;var n=this.getRowCount();var h=this.getColumn(l);for(var j=0;j<n;++j){if(Object.NVL2(k,k,function(){return true;})(h.name,j)){var m=this.getColumnValue(h.name,j);i+=(Object.isNull(m)||isNaN(m)?0:new Number(m));}}return i;});b.prototype.avgOfColumnValues=(function(j,i){var h=this.sumOfColumnValues(j,i);var l=this.getRowCount();var k=(h/l);return isNaN(k)?0:k;});b.prototype._calcOfColumnValues=(function(k,l,j){var n=undefined;var m=this.getRowCount();var h=this.getColumn(k);for(var i=0;i<m;++i){var o=this.getColumnValue(h.name,i);if(Object.isNull(o)||isNaN(o)||!Object.NVL2(j,j,function(){return true;})(h.name,i)){continue;}if(Object.isNull(n)||new Function("return ("+n+l+o+");").apply(this)){n=o;}}return n;});b.prototype.maxOfColumnValues=(function(i,h){return this._calcOfColumnValues(i,"<",h);});b.prototype.minOfColumnValues=(function(i,h){return this._calcOfColumnValues(i,">",h);});b.prototype.toJSON=(function(i){if(Object.NVL(i,false)){var w=new Array();var t=this._rowData.length;var k=this._columnInfo.length;for(var u=0;u<t;++u){var r=this._rowData[u];var v={};for(var l=0;l<k;++l){var o=this._columnInfo[l];v[o.name]=r.getColumnValue(o.name);}w.push(v);}return w;}else{var s={};var p=new Array();var k=this._columnInfo.length;for(var l=0;l<k;++l){var o=this._columnInfo[l];var h={};h[b.prototype.STR_NAME]=o.name;h[b.prototype.STR_ISKEY]=o.isKey();p[l]=h;}s[b.prototype.STR_COLUMNINFO]=p;var n=new Array();var t=this._rowData.length;for(var u=0;u<t;++u){var r=this._rowData[u];var v={};var q={};for(var l=0;l<k;++l){var o=this._columnInfo[l];var h={};h[b.prototype.STR_VALUE]=this.getColumnValue(o.name,u);h[b.prototype.STR_MODIFY]=r.isColumnModified(o.name);q[o.name]=h;}v[b.prototype.STR_ROW]=q;v[b.prototype.STR_ROWSTATUS]=r.getRowStatus();n[u]=v;}s[b.prototype.STR_ROWDATA]=n;var j=new Array();t=this._deletedRowData.length;for(var u=0;u<t;++u){var v={};var q={};for(var l=0;l<k;++l){var o=this._columnInfo[l];var m=this.getDeletedColumnValue(o.name,u);var h={};h[b.prototype.STR_VALUE]=m;q[o.name]=h;}v[b.prototype.STR_ROW]=q;j[u]=v;}s[b.prototype.STR_ROWDATA_DELETED]=j;return s;}});b.prototype.toJSONString=(function(h){return JSON.stringify(this.toJSON(h));});b.prototype.applyJSON=(function(h){h=($.type(h)=="string"?JSON.parse(h):h);this.clear(true,false);if(h[b.prototype.STR_COLUMNINFO]===undefined){var s=h.length;for(var t=0;t<s;++t){this.addRow();for(var p in h[t]){this._setColumnValue(p,t,h[t][p],true);}}this.apply();}else{var q=h[b.prototype.STR_COLUMNINFO];var n=h[b.prototype.STR_ROWDATA];var j=h[b.prototype.STR_ROWDATA_DELETED];var l=q.length;for(var k=0;k<l;++k){var i=q[k];var o=this.addColumn(i[b.prototype.STR_NAME]);o.setKey(i[b.prototype.STR_ISKEY]);}var s=n.length;for(var t=0;t<s;++t){var r=this.getRow(this.addRow());var u=n[t][b.prototype.STR_ROW];for(var k=0;k<l;++k){var o=this.getColumn(k);var m=u[o.name];r.setColumn(o.name,m[b.prototype.STR_VALUE],m[b.prototype.STR_MODIFY]);}r.setRowStatus(n[t][b.prototype.STR_ROWSTATUS]);}s=j.length;for(var t=0;t<s;++t){var r=new f();this._deletedRowData[this._deletedRowData.length]=r;var u=j[t][b.prototype.STR_ROW];for(var k=0;k<l;++k){var o=this.getColumn(k);var m=u[o.name];r.setColumn(o.name,m[b.prototype.STR_VALUE]);}}}$(this).trigger(b.prototype._customTriggerKey_whenDatasetChanged,Object.NVL(arguments[1],true));});String.prototype.jgFuncConvertToColumnRegexp=(function(){return new RegExp("\\#\\#("+this+")\\#\\#","gi");});String.prototype.jgFuncReplaceRegexpByDataset=(function(j,i){var l=this;l=l.replace("dataset\\.rowIndex".jgFuncConvertToColumnRegexp(),"("+i+")");l=l.replace("dataset\\.rowStatus".jgFuncConvertToColumnRegexp(),"("+j.getRowStatus(i)+")");var o=j.getColumnCount();for(var k=0;k<o;++k){var h=j.getColumn(k);var n=h.getName();var m=j.getColumnValue(n,i);l=l.replace(n.jgFuncConvertToColumnRegexp(),Object.NVL(m,""));}return l;});b.prototype._customFunctionConverter=(function(k,h){var j=k.indexOf(b.prototype.STR_MAP_FXCHAR);if(j>=0){k=k.substring(k.indexOf(":")+1,k.length);k=k.jgFuncReplaceRegexpByDataset(this,h);try{return new Function("return ("+k+");").apply(this);}catch(i){return"##fx error##";}}else{return undefined;}});b.prototype.mapping=(function(i,h){this._mappingTarget=i;this._mappingRowElement=h;this.reloadMappingElements();});b.prototype.reloadMappingElements=(function(){if(Object.isNull(this._mappingTarget)){return;}this._mappingTarget.empty();var i=this.getRowCount();for(var h=0;h<i;++h){this._addMappingElements(h);}});b.prototype._addMappingElements=(function(o){if(Object.isNull(this._mappingTarget)){return;}var r=$("<div />").append(this._mappingRowElement.clone()).html();var m=$("<div />").html(r);var i=this._collectMappingElements(m);var p=this._collectMappingFxElements(m);this._mappingElementsList.insert(i,o);this._mappingFxElementsList.insert(p,o);this._doMappingElements(i);var j=i.length;for(var k=0;k<j;++k){var q=i[k];this._refreshMappingElements(q.attr(b.prototype.STR_MAP_COLUMNNAME),o);}var h=this;var n=m.contents();var l=(function(s){var t=s.length;for(var w=0;w<t;++w){var u=s[w];if(u.nodeType===1){l($(u).contents());}else{u=$(u);var v=u.text();if(v.length>0){u.context.data=(v.jgFuncReplaceRegexpByDataset(h,o));}}}});l(n);this._mappingTarget.insertAtIndex(n,o);this._mappingTemplateList.insert(n,o);this._mappingTarget.trigger("create");});b.prototype._removeMappingElements=(function(i){if(Object.isNull(this._mappingTarget)){return;}this._mappingElementsList.remove(i);this._mappingFxElementsList.remove(i);var h=this._mappingTemplateList[i];h.remove();this._mappingTemplateList.remove(i);});b.prototype._refreshMappingElements=(function(p,r){if(Object.isNull(this._mappingTarget)){return;}var j=(function(v,w){var x=v.prop("tagName").toLowerCase();if(x=="input"&&v.attr("type")=="checkbox"){if(v.attr("checked")!==w){v.attr("checked",w);}}else{if(x=="p"||x=="span"||x=="div"||x=="label"){w=Object.NVL(w,"");if(v.html()!==w){v.html(w);}}else{if(x=="select"){if(v.val()!==w){v.val(w);try{v.selectmenu("refresh");}catch(u){}}}else{v.val(w);}}}});var h=this._getMappingElement(p,r);var k=this.getColumnValue(p,r);var q=h.length;for(var l=0;l<q;++l){var t=h[l];j(t,k);}h=this._mappingFxElementsList.list[r];if(!Object.isNull(h)){q=h.length;for(var l=0;l<q;++l){var t=$(h[l]);var s=t.data("JGDataset.mappedFxDefs");var o=s.length();for(var n=0;n<o;++n){var i=s.defs[n];var m=this._customFunctionConverter(i.fx,r);if(m===undefined){continue;}if(i.type==0){t.attr(i.name,m);}else{t.text(m);}}}}});b.prototype._getMappingElement=(function(l,j){var m=new Array();var h=this._mappingElementsList.list[j];var i=h.length;for(var k=0;k<i;++k){if(h[k].attr(b.prototype.STR_MAP_COLUMNNAME).toUpperCase()==l.toUpperCase()){m.push(h[k]);}}return m;});b.prototype._collectMappingElements=(function(l){var i=new Array();var h=(function(o){var p=o.attr(b.prototype.STR_MAP_COLUMNNAME);if(Object.isNull(p)){return;}o.data(b.prototype._customMappingJQKey_bindedElement,i);i.push(o);});var m=l.find("input");var n=m.length;for(var k=0;k<n;++k){var j=$(m.get(k));h(j);}m=l.find("textarea");n=m.length;for(var k=0;k<n;++k){var j=$(m.get(k));h(j);}m=l.find("div[contenteditable!='false']");n=m.length;for(var k=0;k<n;++k){var j=$(m.get(k));h(j);}m=l.find("select");n=m.length;for(var k=0;k<n;++k){var j=$(m.get(k));h(j);}m=l.find("p,span,div:not([contenteditable]),label");n=m.length;for(var k=0;k<n;++k){var j=$(m.get(k));h(j);}return i;});b.prototype._collectMappingFxElements=(function(j){var i=new Array();var h=j.find("*");$.each(h,function(o){var n=$(this);var l=new d();var q=n[0].attributes;var m=q.length;for(var o=0;o<m;++o){var k=q[o];if(k.name!==b.prototype.STR_MAP_COLUMNNAME&&Object.NVL(k.value,"").indexOf(b.prototype.STR_MAP_FXCHAR)==0){l.addDef(k.name,0,k.value);}}var p=n.text();if(n.children().length==0&&Object.NVL(p,"").indexOf(b.prototype.STR_MAP_FXCHAR)>=0){l.addDef(null,1,p);}if(l.length()>0){n.data("JGDataset.mappedFxDefs",l);i.push(n);}});return i;});b.prototype._doMappingElements=(function(j){var p=e.nameOfDataset(this);var i=j.length;for(var l=0;l<i;++l){var o=j[l];o.data(b.prototype._customMappingJQKey_bindedDataset,p);var m=o.prop("tagName").toLowerCase();var k=(function(q){var u=$(q.target);var s=e(u.data(b.prototype._customMappingJQKey_bindedDataset));var t=u.attr(b.prototype.STR_MAP_COLUMNNAME);var r=$(u.data(b.prototype._customMappingJQKey_bindedElement)).data("rowIndex");if(t.indexOf(":")>=0){return;}s.setColumnValue(t,r,u.val());});if(m=="input"){var n=Object.NVL(o.attr("type"),"text");if(n=="checkbox"){o.on("click",function(q){var t=$(q.target);var s=e(t.data(b.prototype._customMappingJQKey_bindedDataset));var r=$(t.data(b.prototype._customMappingJQKey_bindedElement)).data("rowIndex");s.setColumnValue(t.attr(b.prototype.STR_MAP_COLUMNNAME),r,this.checked);});}else{o.on("keyup",k);}}else{if(m=="textarea"){o.on("keyup",k);}else{if(m=="div"&&o.prop("contenteditable")){o.on("change",function(q){var u=$(q.target);var s=e(u.data(b.prototype._customMappingJQKey_bindedDataset));var t=u.attr(b.prototype.STR_MAP_COLUMNNAME);var r=$(u.data(b.prototype._customMappingJQKey_bindedElement)).data("rowIndex");if(t.indexOf(":")>=0){return;}s.setColumnValue(t,r,u.html());});o.on("keyup",function(q){var r=$(q.target);r.trigger("change");});o.on("paste",function(q){var r=$(q.target);setTimeout(function(){r.html(r.text());},10);});}else{if(m=="select"){o.on("change",k);var h=(function(y){var s=$(this);var v=e(s.data(b.prototype._customMappingJQKey_bindedDataset));var w=$(s.data(b.prototype._customMappingJQKey_bindedElement)).data("rowIndex");var x=v.getColumnValue(s.attr(b.prototype.STR_MAP_COLUMNNAME),w);var r=s.attr(b.prototype.STR_MAP_BINDDATASET);var u=s.attr(b.prototype.STR_MAP_DISPLAYCOLUMNNAME);var q=s.attr(b.prototype.STR_MAP_VALUECOLUMNNAME);var t=s.attr(b.prototype.STR_MAP_BLANKTITLE);if(Object.isNull(r)||Object.isNull(u)||Object.isNull(q)){return;}b.fillOptionToSelect(s,r,u,q,t);if(!Object.isNull(x)){s.val(x);}});o.on("focusin",h);o.trigger("focusin");}else{}}}}}});b.prototype.exportModifiedData=(function(){var i=new b();i._columnInfo=this._columnInfo.clone();i._deletedRowData=this._deletedRowData.clone();var m=this.getColumnCount();var l=this.getRowCount();for(var h=0;h<l;++h){for(var j=0;j<m;++j){var k=this._columnInfo[j].name;if(this.isColumnModified(k,h)){i._rowData.push(this._rowData[h]);break;}}}return i;});var e=c.JGDS=(function(h,i){if(Object.isNull(h)){return null;}var j=e._datasetMap[($.type(h)==="string"?e.indexOfDataset(h):h)];if(!Object.isNull(j)){return j.dataset;}if($.type(h)==="string"){dataset_=new b(i);e._datasetMap.push({name:h,dataset:dataset_});return dataset_;}});e._datasetMap=new Array();e.countOfDataset=(function(){return e._datasetMap.length;});e.indexOfDataset=(function(i){var h=e._datasetMap.length;for(var j=0;j<h;++j){var k=e._datasetMap[j];if($.type(i)==="string"){if(k.name==i){return j;}}else{if(k.dataset==i){return j;}}}return -1;});e.nameOfDataset=(function(h){var i=e.indexOfDataset(h);if(i>=0){return e._datasetMap[i].name;}return null;});e.make=(function(){if(Object.isNull(arguments)){return null;}var i=new Array();var h=arguments.length;for(var j=0;j<h;++j){i.push(e(arguments[j]));}return i;});e.remove=(function(h){e._datasetMap.remove(($.type(h)==="string"?e.indexOfDataset(h):h));});b.prototype.STR_ROOT="root";b.prototype.STR_ROW="row";b.prototype.STR_COLUMN="col";b.prototype.STR_COLUMNINFO="columninfo";b.prototype.STR_ROWDATA="rowdata";b.prototype.STR_ROWDATA_DELETED="deletedRowdata";b.prototype.STR_NAME="name";b.prototype.STR_ISKEY="isKey";b.prototype.STR_VALUE="value";b.prototype.STR_ROWSTATUS="status";b.prototype.STR_MODIFY="modify";b.prototype.STR_MAP_COLUMNNAME="jg-column";b.prototype.STR_MAP_BINDDATASET="jg-bind-dataset";b.prototype.STR_MAP_DISPLAYCOLUMNNAME="jg-display-column";b.prototype.STR_MAP_VALUECOLUMNNAME="jg-value-column";b.prototype.STR_MAP_BLANKTITLE="jg-blank-title";b.prototype.STR_MAP_FXCHAR="##fx:";b.prototype._defaultTriggerKey_whenRowInserted="rowinserted";b.prototype._defaultTriggerKey_whenRowRemoved="rowremoved";b.prototype._defaultTriggerKey_whenColumnAdded="columninserted";b.prototype._defaultTriggerKey_whenColumnRemoved="columnremoved";b.prototype._defaultTriggerKey_whenColumValueChanged="columnchanged";b.prototype._defaultTriggerKey_whenDatasetClear="datasetclear";b.prototype._defaultTriggerKey_whenDatasetReset="datasetreset";b.prototype._defaultTriggerKey_whenDatasetChanged="datasetchanged";b.prototype._customTriggerKey_whenRowInserted="_jgRowInserted";b.prototype._customTriggerKey_whenRowRemoved="_jgRowRemoved";b.prototype._customTriggerKey_whenColumnAdded="_jgColumnAdded";b.prototype._customTriggerKey_whenColumnRemoved="_jgColumnRemoved";b.prototype._customTriggerKey_whenColumValueChanged="_jgColumnValueChanged";b.prototype._customTriggerKey_whenRowChanged="_jgRowChanged";b.prototype._customTriggerKey_whenDatasetClear="_jgDatasetClear";b.prototype._customTriggerKey_whenDatasetReset="_jgDatasetReset";b.prototype._customTriggerKey_whenDatasetChanged="_jgDatasetChanged";b.prototype._customMappingJQKey_bindedDataset="JGDataset.bindedDataset";b.prototype._customMappingJQKey_bindedElement="JGDataset.bindedElement";b.prototype._customMappingJQKey_bindedRowIndex="JGDataset.bindedRowIndex";b.fillOptionToSelect=(function(l,s,k,o,n){var i=Object.NVL(l.val(),null);l.children().remove();var r=(function(u,t){return $("<option "+Object.NVL2(t,"value='"+t+"'","")+">"+u+"</option>");});if(!Object.isNull(n)){l.append(r(n,null));}var h=e(s);var q=h.getRowCount();for(var p=0;p<q;++p){var j=h.getColumnValue(k,p);var m=h.getColumnValue(o,p);l.append(r(j,m));}if(!Object.isNull(i)){l.val(i);}return l;});$.fn.JGMappingDataset=(function(h){h=Object.NVL(h,this.attr("jg-dataset"));if(Object.isNull(h)){console.error("dataset not defined");return;}var i=e(h);i.mapping(this,this.contents().clone());});$.fn.JGIsMapped=(function(h){h=Object.NVL(h,this.attr("jg-dataset"));if(Object.isNull(h)){return false;}var i=e(h);return !Object.isNull(i._mappingTarget);});$(document).on((Object.isNull($.mobile)?"ready":"pagebeforecreate"),function(){$(e).trigger("beforeload");var h=$(document).find("[jg-dataset]");h.each(function(j){var i=$(this);i.JGMappingDataset();});$(e).trigger("afterload");});})(window);