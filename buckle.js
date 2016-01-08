//jQueryUI accordion widget 
  $(function() {
    $( "#accordion" ).accordion();
  });
   
$( document ).ready(function() {
// .load() to get XML from SharePoint and save to DOM

//save XML to element on page to prevent the need for multiple server calls
var strURL = $("#xmlConfigs").find("xmlURL").text();
    //$( "#xmlData" ).load( strURL );
    $( "xml" )[0].load( strURL );

var objSPxml = objectifyXML();

//load options for drop-down select element 
var strField = objSPxml.getOWSname("Title"),     //or Title-DTG?
    arrTitles = [];

    for(i = 0; i < objSPxml.rows.length; ++ i) {
        arrTitles.push(objSPxml.rows[i].getAttribute(strField));
    }
    
var strSelect = "<option>Select a Memo</option>";  
    $.each(arrTitles, function (index){
        strSelect += "\n" + "<option>" + arrTitles[index] + "</option>";
    });

$( "#selectMemo" ).html(strSelect);
  
  
//afterUpdate for select control  
$( "#selectMemo" ).change(function() {
    showContent();
});


});


function objectifyXML() {
//design note: object.prototype.newMethod breaks jQuery, 
// workaround is to create custom object - objSPxml and adding methods to it

    var objSPxml = {};

	//Note: xml from SharePoint may not recognized be by jQuery as valid xml,
	//      since multi-line SharePoint list fields contain HTML tags within xml rowsets  
	//      (i.e. attribute) once escaped characters get parsed

	//get XML from first found container in DOM
	//objSPxml.text = document.getElementsByTagName("xml")[0];
	objSPxml.text = $( "xml" )[0];

    //get schema
    objSPxml.schema = "";

    if (objSPxml.text.getElementsByTagName("s:AttributeType").length > 0) {
        //  supporting Firefox & MSIE
        objSPxml.schema = objSPxml.text.getElementsByTagName("s:AttributeType");
    } else {
        //  supporting Webkit/Chrome/Safari
        objSPxml.schema = objSPxml.text.getElementsByTagName("AttributeType");
    }
    
    //get data rows
    if (objSPxml.text.getElementsByTagName("z:row").length > 0) {
        // supporting Firefox & MSIE
        objSPxml.rows = objSPxml.text.getElementsByTagName("z:row");
    } else {
        //supporting Webkit/Chrome/Safari
        objSPxml.rows = objSPxml.text.getElementsByTagName("row");
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
    //returns the field value for the corresponding xml record row, using Title as the record ID

    var strOWSname = this.getOWSname(strField),
        strOWSrecordField = this.getOWSname("Title"),   
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

var strNoteHTML = $("#Notes").html();
var RecordID = "TBD";

window.alert("Support for saving notes coming soon." + "\n" + strNoteHTML );

//https://msdn.microsoft.com/en-us/library/office/hh185011(v=office.14).aspx
}
