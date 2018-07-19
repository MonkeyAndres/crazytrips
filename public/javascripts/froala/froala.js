$(function() {
    $('#editor').froalaEditor({
      // Set the image upload URL.
      imageUploadURL: '/trips/upload_image',
      imageAllowedTypes: ['jpeg', 'jpg', 'png'],
      
      toolbarButtons: ['bold', 'italic', 'underline', '|', 'paragraphFormat','align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertTable', '|', 'insertHR', 'selectAll', 'clearFormatting', '|', 'help', 'html', '|', 'undo', 'redo']
    })
  });