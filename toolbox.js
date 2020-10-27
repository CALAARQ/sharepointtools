function getDaysBetween(dateDue){
	var today = new Date();
	var d = new Date(dateDue);
	
    // To calculate the no. of days between two dates 	
	// must calculate the time difference of two dates,
	// Then use math to get back to days.
    var timeDiff = d.getTime() - today.getTime(); 
    var dayDiff = timeDiff / (1000 * 3600 * 24);
	dayDiff = Math.round(dayDiff);
	return dayDiff
}

function getIDfromURL(){
	//Get Current URL to scrape the ID 
    var href = window.location.href;

	//Find ID between the first = and first &. ex. "?ID=99&"
	var n1 = href.search("=");
	if (n1 > 0 ) {

		var id = href.substr(n1+1);
		return id;
	}else{
		return 0
	}	
}

// Get List Item Type metadata
function getItemTypeForListName(name) {
	//Create the SP.Catlog in the proper format. i.e. {InternalName}+ListItem
	var itemType = "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
	return itemType
};

function nz(val,def){
	if (val==null){
		if(def!==undefined) return def;
		return '';
		}
	else{
		return val
		}
	};
//Generic Proc to Create an item, using REST 2010 API
//https://icenter.saic.com/sites/peess/main/SandBox/_vti_bin/ListData.svc/SurveyBinderCheckList
function listItemCreate_REST2010(listName, itemProperties){
    var call = jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            '/_vti_bin/ListData.svc/'+listName,
        type: "POST",
        data: JSON.stringify(itemProperties),
        dataType: "json",
        async: false,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });
    call.done(function (data, textStatus, jqXHR) {
        //var message = jQuery('#message');
        //message.text("Item X added to Folder 2");
    });
    call.fail(function (jqXHR, textStatus){
    	debugger;
    });
};


//Generic Routine to Create or Update SharePoint List Items
function listItemCreateUpdate(listNameDisplay, listNameInternal, method, itemId, itemProperties, success, failure) {

    //method: Add: null, Update: 'MERGE'
    //folderpath: Path: _spPageContextInfo.webServerRelativeUrl + "/Lists/{listNameInternal}/{foldername}"
    
	var retVal = false;
	
	//itemType = 'SP.Data.LstSurveyBinderCheckListItem'
    var itemType = getItemTypeForListName(listNameInternal);
    
    itemProperties["__metadata"] = { "type": itemType };
	var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle(\'" + listNameDisplay + "\')/items";
	if (method !== null){
		url += '(' + itemId.toString() + ')'
		};
	
	if (gcdebug) {console.log(url); debugger;};
	
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemProperties),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method" : method,
            "If-Match": "*" //Need to test create again, since adding this, but assuming it will get ignored.
        	},
        async: false,
        success: function (data) {
            //success(data.d);
            retVal = true;
        },
        error: function (data) {
            debugger;
            failure(data);
        }
    });
    return retVal;
};

function parseLink(val){
	//for any occurances of http found, add an <a href="{found text}"> around it.
	var retval = '';
	var parse = val;
	var h=0; //start of http
	var s=0; //first space after
	var n=0; //how far in
	var len=0; //len of link
	var link='' //current link
	var rest='' //remainder of string to be parsed

	h=parse.search("http");
	do {
		if (h>=0 && parse.length>0){
			//write everything up to h to RetVal
			retval += parse.substring(0,h);
			
			//pare parse
			parse = parse.substring(h);
			
			//Insert <a href=" in front of the link
		    retval += '<a target="_blank" href="'
		     
			//Find first space after the http
			s=parse.search(" ");
			
			//extract current link
			if (s>=0) {
				//write link to retval
				link=parse.substring(0,s);
				retval += link; 
				
				//trim
				parse = parse.substring(s+1);
				
				};
			if (s==-1) {
				link=parse; 
				retval+= link; 
				parse='';
				};
	
			//close tag, add a space
			retval += '">'+link+'</a> '
			console.log('retval="'+retval);
			console.log('parse="'+parse);
			
			//Are we done?
			h=parse.length;
			if (h>0) h=parse.search("http");
				
			};
		if (h==-1){
			retval+=parse;
			parse='';
			};
		}
	while (parse.length>0);
	retval=retval.replace('\n',"<br>")
	return retval;
	};
