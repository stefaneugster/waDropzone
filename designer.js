(function(waDropzone) {

//      /*Display name of the widget*/
	waDropzone.setDescription('Dropzone');

//      /*Define your widget's properties*/
	waDropzone.addAttributes([{
	         name        : 'data-parallelUploads',              
	         description : 'Parallel Uploads',
	         type		 : 'string' 	           
	},{
	         name        : 'data-maxFilesize',              
	         description : 'Max File size(MB)',
	         type        : 'string'         
	},{
	        name        : 'data-uploadMultiple',
	        description : 'Upload Multiple',
	        type		: 'checkbox'  
	},
	{
	        name        : 'data-uploadMultiple',
	        description : 'Upload Multiple',
	        type		: 'checkbox'  
	},{
	        name        : 'data-createImageThumbnails',
	        description : 'CreateImageThumbnails',
	        type		: 'checkbox'  
	},
	{
			name		: 'data-maxFiles',
			description	: 'Max Files',
			type		: 'string' 
	},{
			name		: 'data-addRemoveLinks',
			description	: 'addRemoveLinks',
			type		: 'checkbox' 
	},{
			name		: 'data-maxFiles',
			description	: 'Max Files',
			type		: 'string' 
	},{
			name		: 'data-autoProcess',
			description	: 'Auto Process',
			type		: 'checkbox' 
	},
	{
			name		: 'data-ifFileExist',
			description	: 'In Case of conflict',
			type		: 'dropdown',
			options		: ['Overwrite', 'Alert User', 'Rename'],
	},
	{
			name		: 'data-uploadFolder',
			description	: 'Upload Folder',
			type		: 'string',
			defaultValue: '/tmp'
	}]);

//      /*Default width and height of your widget when added to the Page*/
	waDropzone.setWidth('500');
	waDropzone.setHeight('300');

//      /*Define the events for your widget*/
	waDropzone.addEvent({
		'name':'addedfile',
		'description':'On File Added',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'removedfile',
		'description':'On File Removed',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'error',
		'description':'On Error',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'processing',
		'description':'On Processing',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'uploadprogress',
		'description':'On Upload Progress',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'sending',
		'description':'On Sending',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'success',
		'description':'On Success',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'complete',
		'description':'On Complete',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'canceled',
		'description':'On Canceled',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'maxfilesreached',
		'description':'On Max Files Reached',
		'category': 'File Events'
	});
	
	waDropzone.addEvent({
		'name':'maxfilesexceeded',
		'description':'On Max Files Exceeded',
		'category': 'File Events'
	});
	


//      /*Set the Design and Styles panels*/
//	waDropzone.setPanelStyle({
//		'fClass': true,
//		'text': true,
//		'background': true,
//		'border': true,
//		'sizePosition': true,
//		'label': true,
//		'disabled': ['border-radius']
//	});

//    /* Display the widget with the value of the data-binding property inside of it */
    waDropzone.on('Display', function(event) {
    	
     	   $('#' + event['id']).css('background', 'lightGray');
    	
    });

});

// For more information, refer to http://doc.wakanda.org/Wakanda0.DevBranch/help/Title/en/page3870.html
