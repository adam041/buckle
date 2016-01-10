//jQueryUI accordion widget 
  $(function() {
    $( "#accordion" ).accordion();
  });

$( document ).ready(function() {
// .load() to get XML from SharePoint and save to DOM

//save XML to element on page to prevent the need for multiple server calls
var   strURL = $( "#xmlURL" ).val();
      $( "#xmlHolder" ).load( strURL, function() {
      	
//stick this inside the function to ensure the loading is done first!
var objSPxml = objectifyXML();

//load options for drop-down select element 
var strKeyField = $( "#keyField" ).val()
    strKey = objSPxml.getOWSname( strKeyField ),    
    arrKeys = [];

    for(i = 0; i < objSPxml.rows.length; ++ i) {
        arrKeys.push(objSPxml.rows[i].getAttribute( strKey ));
    }
    
var strSelect = "<option>Select a Memo</option>";  
    $.each(arrKeys, function (index){
        strSelect += "\n" + "<option>" + arrKeys[index] + "</option>";
    });

$( "#selectMemo" ).html(strSelect);

      } );  

  
//afterUpdate for select control  
$( "#selectMemo" ).change(function() {
    showContent();
});


});


function objectifyXML() {
//design note: object.prototype.newMethod breaks jQuery, 
// workaround is to create custom object - objSPxml and adding methods to it

    var objSPxml = {};

    objSPxml.text = $( "textarea#xmlHolder" ).val();
    objSPxml.html = new DOMParser().parseFromString(objSPxml.text, 'text/html');
    //can't parse as XML since SharePoint XML may fail QA standards (i.e having html <tags> for multi-line text fields)

    //get schema
    objSPxml.schema = "";

    if (objSPxml.html.getElementsByTagName("s:AttributeType").length > 0) {
        //  supporting Firefox & MSIE
        objSPxml.schema = objSPxml.html.getElementsByTagName("s:AttributeType");
    } else {
        //  supporting Webkit/Chrome/Safari
        objSPxml.schema = objSPxml.html.getElementsByTagName("AttributeType");
    }
    
    //get data rows
    if (objSPxml.html.getElementsByTagName("z:row").length > 0) {
        // supporting Firefox & MSIE
        objSPxml.rows = objSPxml.html.getElementsByTagName("z:row");
    } else {
        //supporting Webkit/Chrome/Safari
        objSPxml.rows = objSPxml.html.getElementsByTagName("row");
    }

    objSPxml.getOWSname = function(strName) {
    //takes plain text name and finds ows name within XML's schema

        var strOWSname = "";

        for (i = 0; i < objSPxml.schema.length; ++i) {
            if (objSPxml.schema[i].getAttribute("rs:name") === strName) {
                strOWSname = objSPxml.schema[i].getAttribute("name");   //could we just return and exit here?
                break;  
            }
        }
        return strOWSname;   
    };
    
    objSPxml.resolveOWSname = function (strOWSname) {
    ///takes ows name (i.e. database ref) and finds plain text name within XML's schema

        var strName = "";

		for (i = 0; i < objSPxml.schema.length; ++i) {
			if (objSPxml.schema[i].getAttribute("name") === strOWSname) {
				strName = objSPxml.schema[i].getAttribute("rs:name"); //could we just return and exit here?
				break; 
			}
		}

		return strName;   
    };
    
    objSPxml.xLookup = function(strField, strRecordID) {
    //returns the field value for the corresponding xml record row, using keyField as the record ID

    var strKeyField = $( "#keyField" ).val(),
        strOWSname = this.getOWSname(strField),
        strOWSrecordField = this.getOWSname( strKeyField ),   
        strOutput = "";

        //loop through zRows to find matching record, then get field with matching attribute name
        for (i = 0; i < objSPxml.rows.length; ++i) {
            if (objSPxml.rows[i].getAttribute(strOWSrecordField) === strRecordID) {
                strOutput = objSPxml.rows[i].getAttribute(strOWSname);  
                break;
            }
        }       

    if ((strOutput === null) || (strOutput === undefined)) {
        strOutput = "";
    }

    return strOutput;  
	};

    //all done!
    return objSPxml;
}


function showContent() {
//loads data from the xml to be displayed 
//to be called by after update of select control

var strRecordID = $( "#selectMemo option:selected" ).text(), 
    strFieldID = "",
    strFoundValue = "",
    objSPxml = objectifyXML();

    $( "*" ).each(function( i ) {
        //test if element ID has corresponding field in rXML recordset
        strFieldID = this.id;
        strFoundValue = objSPxml.xLookup(strFieldID, strRecordID);
          
        if ( strFoundValue.length > 0 ) {
            this.innerHTML = strFoundValue;
		}
    }); 
}

function saveNote() {
//save contents of #Notes to Sharepoint
//https://msdn.microsoft.com/en-us/library/office/hh185011(v=office.14).aspx
//dynamically read form inputs?

var strNoteHTML = $("#Notes").html();
var RecordID = "TBD";

window.alert("Support for saving notes coming soon." + "\n" + strNoteHTML );

}
