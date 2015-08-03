WAF.define('waDropzone', ['waf-core/widget'], function(widget) {
    
    var waDropzone = widget.create('waDropzone');

    waDropzone.addProperty('parallelUploads', {
        type : 'string', 
        bindable : false,
        defaultValue : '10'
    });
	waDropzone.addProperty('maxFilesize', {
	    type : 'string',
	    bindable : false,
   	    defaultValue : '10'
    });
	waDropzone.addProperty('maxFiles', {
	    type : 'string',
	    bindable : false,
	    defaultValue : '5'
	});
	waDropzone.addProperty('defaultMessage', {
	    type : 'string',
	    bindable : false, 
	    defaultValue : 'Drop files here to upload'
	});
	waDropzone.addProperty('uploadFolder', {
	    type : 'string',
	    bindable : false, 
	    defaultValue : '/tmp'
	});
	waDropzone.addProperty('uploadMultiple', {
	    type : 'boolean', 
	    bindable : false,
        defaultValue : true
	});
	waDropzone.addProperty('createImageThumbnails', {
	    type : 'boolean', 
	    bindable : false
	});
	waDropzone.addProperty('addRemoveLinks', {
	    type : 'boolean', 
	    bindable : false
	});
	waDropzone.addProperty('autoProcess', {
	    type : 'boolean', 
	    bindable : false,
        defaultValue : true
	});
	waDropzone.addProperty('ifFileExist', {
	    type : 'enum',  
		values: {
            replace: 'Replace',
            alert: 'Alert User',
            rename: 'Rename'
        }
    });
	waDropzone.prototype.countElement = function(element)
	{
		var c = 0;
		
		this.files.forEach(function(e) {
			if (element.name == e.name) {
				c++;
			}
		});
		
		return c;
	};
    waDropzone.prototype.init = function() {
        try {
            var that = this;

            // disable autodiscover
            Dropzone.autoDiscover = false;
    
            that.addClass('dropzone');
            that.dz = new Dropzone(that.node, {
                url: '/waUpload/upload',
                paramName: 'filesToUpload',
                parallelUploads: this.parallelUploads() == null ? 1 : this.parallelUploads(),
                maxFilesize: this.maxFilesize() == null ? 1 : this.maxFilesize(),
                uploadMultiple: this.uploadMultiple() == true ? true : false,
                addRemoveLinks: this.addRemoveLinks() == true ? true : false,
                createImageThumbnails: this.createImageThumbnails() == true ? true : false,
                maxFiles: this.maxFiles() == null ? 5 : this.maxFiles(),
                dictDefaultMessage: this.defaultMessage() == null ? 'Drop files here to upload' : this.defaultMessage(),
                autoProcessQueue: this.autoProcess()
            });
            var conflict = this.ifFileExist();
            var r = false;
            var folder = this.uploadFolder() == null ? '/tmp' : this.uploadFolder();
            // called just before each file is sent. Gets the xhr object and the formData objects as second and third parameters,
            // so you can modify them (for example to add a CSRF token) or add additional data
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
			// when a file is added to the list
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
                                'folder': folder,
                                'files': [{
                                    name: file.name,
                                    type: file.type,
                                    size: file.size
                                }]
                            })
                        }
                    }).done(function(data) {
                        var json = JSON.parse(data);
                        if (json.conflicts.length != 0) {
                            var box = $('<div class="waf-dialog-container" id="dz-modal">' + json.conflictMessage + '</div>');
                            
                            box.dialog({
                                autoOpen: false,
                                title: 'Please select an option',
                                buttons: [{
                                    'text': 'Cancel',
                                    click: function(ev) {
                                        $(this).dialog('close');
                                    }
                                },{
                                    'text': 'Rename',
                                    click: function(ev) {
                                        r = false;
                                        that.processFile(file);
                                        $(this).dialog('close');
                                    }
                                },{
                                    'text': 'Replace',
                                    click: function(ev) {
                                        r = true;
                                        that.processFile(file);
                                        $(this).dialog('close');
                                    }
                                }]
                            });

                            box.dialog('open');
                        } else {
                            that.processFile(file);
                        }
                    });
                }
                that.fire('addedfile', {
                    file: file
                });
            });
			// called whenever a file is removed from the list. you can listen to this and delete the file from your server if you want to.
            that.dz.on('removedfile', function(file) {
                that.fire('removedfile', {
                    file: file
                });
            });
			// an error occured. receives the errorMessage as second parameter and if the error was due to the XMLHttpRequest the xhr object as third.
            that.dz.on('error', function(file, errorMessage, xhr) {
                that.fire('error', {
                    file: file,
                    errorMessage: errorMessage,
                    xhr: xhr
                });
            });
			// when a file gets processed (since there is a queue not all files are processed immediately). this event was called processingfile previously.
            that.dz.on('processing', function(file) {
                that.fire('processing', {
                    file: file
                });
            });
			// gets called periodically whenever the file upload progress changes.
            that.dz.on('uploadprogress', function(file, progress, byteSent) {
                that.fire('uploadprogress', {
                    file: file,
                    progress: progress,
                    byteSent: byteSent
                });
            });
			// the file has been uploaded successfully. gets the server response as second argument. (this event was called finished previously)
            that.dz.on('success', function(file, response) {
                that.fire('success', {
                    file: file,
                    serverResponse: response
                });
            });
			// called when the upload was either successful or erroneous.
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
			// called when a file upload gets canceled.
            that.dz.on('canceled', function(file) {
                that.fire('canceled', {
                    file: file
                });
            });
			// called when the number of files accepted reaches the maxFiles limit.
            that.dz.on('maxfilesreached', function(file) {
                that.fire('maxfilesreached', {
                    file: file
                });
            });
			// called for each file that has been rejected because the number of files exceeds the maxFiles limit.
            that.dz.on('maxfilesexceeded', function(file) {
                that.fire('maxfilesexceeded', {
                    file: file
                });
            });
 			// drag events
            that.dz.on('drop', function(event) {
                that.fire('drop');
            });
            // all files in the dropzone
            this.files = that.dz.files;
            // all accepted files
            this.getAcceptedFiles 	= function() {
	        	return that.dz.getAcceptedFiles();
	        };
	        // all rejected files
            this.getRejectedFiles	= function() {
	        	return that.dz.getRejectedFiles();
	        };
	        // all queued files
            this.getQueuedFiles		= function() {
	        	return that.dz.getQueuedFiles();
	        };
	        // all uploading files
            this.getUploadingFiles	= function() {
	        	return that.dz.getUploadingFiles();
	        };
	        // remove all event listeners on the element, and clear all file arrays
            this.disable			= function() {
	        	return that.dz.disable();
	        };
	        // reenable dropzone after disabeling it
	        this.enable				= function() {
	        	return that.dz.enable();
	        };
	        // remove an added file from the dropzone
	        this.removeFile			= function(file) {
	        	return that.dz.removeFile(file);
	        };
	        // remove all files
	        this.removeAllFiles		= function(cancelIfNecessary) {
	        	return that.dz.removeAllFiles(cancelIfNecessary);
	        };
	        // upload all files currently queued
	        this.processQueue		= function() {
	        	return that.dz.processQueue();
	        };
	        // call after replace/update dialog
	        this.processFile		= function(file) {
	        	return that.dz.processFile(file);
	        };
        } catch (e) {
            console.log(e.message);
        }
    };

    return waDropzone;
});