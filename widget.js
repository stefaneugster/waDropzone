WAF.define('waDropzone', ['waf-core/widget'], function(widget) {

    var waDropzone = widget.create('waDropzone');

    waDropzone.addProperty('parallelUploads',{ type : "string", bindable : false});
	waDropzone.addProperty('maxFilesize',{ type : "string", bindable : false});
	waDropzone.addProperty('maxFiles',{ type : "string", bindable : false});
	waDropzone.addProperty('uploadFolder',{ defaultValue : '/tmp', type : "string", bindable : false});
	
	waDropzone.addProperty('uploadMultiple',{ type : "boolean", bindable : false});
	waDropzone.addProperty('createImageThumbnails',{ type : "boolean", bindable : false});
	waDropzone.addProperty('addRemoveLinks',{ type : "boolean", bindable : false});
	waDropzone.addProperty('autoProcess',{ type : "boolean", bindable : false});	

	waDropzone.addProperty('ifFileExist',{ type : "enum",  
		values: {
            replace: 'Replace',
            alert: 'Alert User',
            rename: 'Rename'
        }
    });

	waDropzone.prototype.countElement = function(element)
	{
		var c = 0;
		this.files.forEach(function(e)
		{
			if(element.name == e.name)
			{
				c++;
			}
		});
		
		return c;
	};

    waDropzone.prototype.init = function() {
        try {
            var that = this;

            that.addClass('dropzone');
            that.dz = new Dropzone(that.node, {
                url: '/waUpload/upload',
                paramName: 'filesToUpload',
                parallelUploads: this.parallelUploads() == null ? 1 : this.parallelUploads(),
                maxFilesize: this.maxFilesize() == null ? 1 : this.maxFilesize(),
                uploadMultiple: this.uploadMultiple() == true ? true : false,
                addRemoveLinks: this.addRemoveLinks() == true ? true : false,
                createImageThumbnails: this.createImageThumbnails() == true ? true : false,
                maxFiles: this.maxFiles() == null ? 2 : this.maxFiles(),
                autoProcessQueue: this.autoProcess()
            });
            var conflict = this.ifFileExist();
            var r = false;
            var folder = this.uploadFolder() == null ? '/tmp' : this.uploadFolder();
			
            that.dz.on('sending', function(file, xhr, formData) {

                formData.append('config', JSON.stringify({
                    folder: folder,
                    replace: r
                }));
                that.fire('sending', {
                    file: file,
                    xhr: xhr,
                    form: formData
                });
            });

            that.dz.on('addedfile', function(file) {
                if (conflict === 'replace') {
                    r = true;
                }
                else if (conflict === 'alert') {
                    //verify the file
                    $.ajax({
                        type: 'POST',
                        url: '/waUpload/verify',
                        data: {
                            filesInfo: JSON.stringify({
                                "folder": folder,
                                "files": [{
                                    name: file.name,
                                    type: file.type,
                                    size: file.size
                                }]
                            })
                        }
                    }).done(function(data) {
                        var json = JSON.parse(data);
                        if (json.conflicts.length != 0) {

                            var box = $("<div class='waf-dialog-container' id='dz-modal'>" + json.conflictMessage + "</div>");
                            box.dialog({
                                autoOpen: false,
                                title: "Please select an option",
                                buttons: [{
                                    "text": "Cancel",
                                    click: function(ev) {
                                        $(this).dialog('close');
                                    }
                                },{
                                    "text": "Rename",
                                    click: function(ev) {
                                        r = false;
                                        that.processFiles([file]);
                                        
                                        $(this).dialog('close');
                                    }
                                },{
                                    "text": "Replace",
                                    click: function(ev) {
                                        r = true;
                                        
                                        var list = that.getAcceptedFiles();
                                       	 if(that.countElement(file) > 1)
                                        {
                                        	that.removeFile(file)
                                        }
                                        that.processFiles([file]);
                                        
                                        $(this).dialog('close');
                                    }
                                }]
                            });

                            box.dialog("open");
                        }
                        else{
                        	that.processFiles([file])
                        }
                    });
                }

                that.fire('addedfile', {
                    file: file
                });
            });

            that.dz.on('removedfile', function(file) {
                that.fire('removedfile', {
                    file: file
                });
            });

            that.dz.on('error', function(file, errorMessage, xhr) {
                that.fire('error', {
                    file: file,
                    errorMessage: errorMessage,
                    xhr: xhr
                });
            });

            that.dz.on('processing', function(file) {
                that.fire('processing', {
                    file: file
                });
            });

            that.dz.on('uploadprogress', function(file, progress, byteSent) {
                that.fire('uploadprogress', {
                    file: file,
                    progress: progress,
                    byteSent: byteSent
                });
            });

            that.dz.on('success', function(file, response) {
                that.fire('success', {
                    file: file,
                    serverResponse: response
                });
            });

            that.dz.on('complete', function(file) {
                that.fire('complete', {
                    file: file
                });
			    if (that.getUploadingFiles().length === 0 && that.getQueuedFiles().length === 0) {
			        that.fire('allfilescomplete', {
                    	files: that.dz.files
                	});
			    }
            });

            that.dz.on('canceled', function(file) {
                that.fire('canceled', {
                    file: file
                });
            });

            that.dz.on('maxfilesreached', function(file) {
                that.fire('maxfilesreached', {
                    file: file
                });
            });

            that.dz.on('maxfilesexceeded', function(file) {
                that.fire('maxfilesexceeded', {
                    file: file
                });
            });
 
 			// drag events
            that.dz.on('drop', function(event) {
                that.fire('drop');
            });
            
            that.dz.on('dragenter', function(event) {
                that.fire('dragenter');
            });
            
            that.dz.on('dragover', function(event) {
                that.fire('dragover');
            });
    
            that.dz.on('dragleave', function(event) {
                that.fire('dragleave');
            });
            
            this.files = that.dz.files;
            
            this.getAcceptedFiles 	= function()
	        {
	        	return that.dz.getAcceptedFiles();
	        };
            this.getRejectedFiles	= function()
	        {
	        	return that.dz.getRejectedFiles();
	        };
            this.getQueuedFiles		= function()
	        {
	        	return that.dz.getQueuedFiles();
	        };
            this.getUploadingFiles	= function()
	        {
	        	return that.dz.getUploadingFiles();
	        };
            this.disable			= function()
	        {
	        	return that.dz.disable();
	        };;
	        this.enable				= function()
	        {
	        	return that.dz.enable();
	        };
	        this.addFile			= function(file)
	        {
	        	return that.dz.addFile(file);
	        };
	        this.enqueueFiles		= function(files)
	        {
	        	return that.dz.enqueueFiles(files);
	        };;
	        this.enqueueFile		= function(file)
	        {
	        	return dz.enqueueFile(file);
	        };
	        this.addDirectory		= function(entry, path)
	        {
	        	return that.dz.addDirectory(entry, path);
	        };
	        this.removeFile			= function(file)
	        {
	        	return that.dz.removeFile(file);
	        };
	        this.removeAllFiles		= function(cancelIfNecessary)
	        {
	        	return that.dz.removeAllFiles(cancelIfNecessary);
	        };
	        this.processQueue		= function()
	        {
	        	return that.dz.processQueue();
	        };
	        this.processFiles		= function(files)
	        {
	        	return that.dz.processFiles(files);
	        };
	        this.cancelUpload		= function(file)
	        {
	        	return that.dz.cancelUpload(file);
	        };
	        this.uploadFiles		= function(files){
	        	return that.dz.uploadFiles(files);
	        };
        }
        catch (e) {
            console.log(e.message);
        }
    };

    return waDropzone;
});

// For more information, refer to http://doc.wakanda.org/Wakanda0.DevBranch/help/Title/en/page3871.html